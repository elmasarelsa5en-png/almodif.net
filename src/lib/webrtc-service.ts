import Peer, { MediaConnection } from 'peerjs';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CallSignal {
  id: string;
  from: string;
  to: string;
  fromName: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  timestamp: Date;
  peerId?: string;
}

class WebRTCService {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private callSignalUnsubscribe: (() => void) | null = null;

  /**
   * Initialize PeerJS connection
   */
  initializePeer(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Add timeout (15 seconds)
      const timeout = setTimeout(() => {
        if (this.peer) {
          this.peer.destroy();
        }
        reject(new Error('فشل الاتصال بالخادم: انتهت المهلة الزمنية'));
      }, 15000);

      try {
        // Generate unique peer ID to avoid conflicts
        const uniqueId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('🔌 Initializing PeerJS with ID:', uniqueId);

        // Create peer with user ID using PeerJS cloud service (free tier)
        this.peer = new Peer(uniqueId, {
          host: '0.peerjs.com',
          secure: true,
          port: 443,
          path: '/',
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
            ]
          },
          debug: 2 // Enable debug logs
        });

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          console.log('✅ PeerJS connected with ID:', id);
          resolve(id);
        });

        this.peer.on('error', (error) => {
          console.error('❌ PeerJS error:', error);
          
          // Try alternative: create peer without custom server (use default PeerJS cloud)
          if (error.type === 'network' || error.type === 'server-error') {
            console.log('🔄 Trying fallback to default PeerJS cloud...');
            
            // Cleanup old peer
            if (this.peer) {
              this.peer.destroy();
            }
            
            // Create new peer with default cloud server
            this.peer = new Peer(userId, {
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:stun1.l.google.com:19302' },
                  { urls: 'stun:stun2.l.google.com:19302' },
                ]
              },
              debug: 2
            });
            
            this.peer.on('open', (id) => {
              console.log('✅ PeerJS connected with fallback ID:', id);
              resolve(id);
            });
            
            this.peer.on('error', (fallbackError) => {
              console.error('❌ Fallback also failed:', fallbackError);
              reject(fallbackError);
            });
          } else {
            reject(error);
          }
        });

        // Listen for incoming calls
        this.peer.on('call', (call) => {
          console.log('📞 Incoming call from:', call.peer);
          this.handleIncomingCall(call);
        });

      } catch (error) {
        console.error('❌ Failed to initialize peer:', error);
        reject(error);
      }
    });
  }

  /**
   * Start a call
   */
  async startCall(
    toUserId: string,
    fromUserId: string,
    fromName: string,
    callType: 'audio' | 'video'
  ): Promise<string> {
    try {
      console.log('📤 Starting call to:', toUserId, 'Type:', callType);

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });

      this.localStream = stream;

      // Create call signal in Firestore
      const signalRef = await addDoc(collection(db, 'call_signals'), {
        from: fromUserId,
        to: toUserId,
        fromName: fromName,
        type: callType,
        status: 'ringing',
        peerId: this.peer?.id,
        timestamp: serverTimestamp()
      });

      console.log('✅ Call signal created:', signalRef.id);
      return signalRef.id;

    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }

  /**
   * Answer a call
   */
  async answerCall(signalId: string, callType: 'audio' | 'video'): Promise<MediaStream> {
    try {
      console.log('📞 Answering call:', signalId);

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });

      this.localStream = stream;

      // Update call signal status
      await updateDoc(doc(db, 'call_signals', signalId), {
        status: 'accepted'
      });

      return stream;

    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw error;
    }
  }

  /**
   * Make the actual peer connection after signal is accepted
   */
  async connectToPeer(peerId: string, stream: MediaStream): Promise<MediaConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      try {
        console.log('🔗 Connecting to peer:', peerId);
        
        const call = this.peer.call(peerId, stream);
        this.currentCall = call;

        call.on('stream', (remoteStream) => {
          console.log('✅ Received remote stream');
          resolve(call);
        });

        call.on('close', () => {
          console.log('📞 Call ended');
          this.endCall();
        });

        call.on('error', (error) => {
          console.error('❌ Call error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Failed to connect to peer:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming call
   */
  private handleIncomingCall(call: MediaConnection) {
    this.currentCall = call;

    // Answer with local stream
    if (this.localStream) {
      call.answer(this.localStream);
      
      call.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream from incoming call');
        // Emit event or callback to update UI
      });
    }
  }

  /**
   * Listen for call signals
   */
  listenForCallSignals(userId: string, onSignal: (signal: CallSignal) => void) {
    const q = query(
      collection(db, 'call_signals'),
      where('to', '==', userId),
      where('status', '==', 'ringing')
    );

    this.callSignalUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const signal: CallSignal = {
            id: change.doc.id,
            from: data.from,
            to: data.to,
            fromName: data.fromName,
            type: data.type,
            status: data.status,
            timestamp: data.timestamp?.toDate() || new Date(),
            peerId: data.peerId
          };
          onSignal(signal);
        }
      });
    });
  }

  /**
   * Stop listening for call signals
   */
  stopListeningForCallSignals() {
    if (this.callSignalUnsubscribe) {
      this.callSignalUnsubscribe();
      this.callSignalUnsubscribe = null;
    }
  }

  /**
   * Reject a call
   */
  async rejectCall(signalId: string) {
    try {
      await updateDoc(doc(db, 'call_signals', signalId), {
        status: 'rejected'
      });
      console.log('❌ Call rejected:', signalId);
    } catch (error) {
      console.error('❌ Failed to reject call:', error);
    }
  }

  /**
   * End current call
   */
  async endCall(signalId?: string) {
    try {
      // Stop media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.currentCall) {
        this.currentCall.close();
        this.currentCall = null;
      }

      // Update signal status
      if (signalId) {
        await updateDoc(doc(db, 'call_signals', signalId), {
          status: 'ended'
        });
      }

      console.log('📞 Call ended successfully');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // return true if muted
      }
    }
    return false;
  }

  /**
   * Toggle video
   */
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // return true if video off
      }
    }
    return false;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get current call
   */
  getCurrentCall(): MediaConnection | null {
    return this.currentCall;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.endCall();
    this.stopListeningForCallSignals();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const webrtcService = new WebRTCService();
