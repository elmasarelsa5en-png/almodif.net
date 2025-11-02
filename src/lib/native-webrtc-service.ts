import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp, deleteDoc, getDocs, orderBy, limit, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CallSignal {
  id: string;
  from: string;
  to: string;
  fromName: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  timestamp: Date;
}

/**
 * Native WebRTC Service - No external dependencies
 * Uses Firebase Firestore for signaling (SDP exchange and ICE candidates)
 */
class NativeWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private callSignalUnsubscribe: (() => void) | null = null;
  private iceUnsubscribe: (() => void) | null = null;

  // Google's free STUN servers
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  /**
   * Initialize peer connection
   */
  private initializePeerConnection(callId: string, isOfferer: boolean) {
    console.log('🔗 Initializing RTCPeerConnection for call:', callId);
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
    });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('📤 Sending ICE candidate');
        try {
          await addDoc(collection(db, 'call_signals', callId, 'ice_candidates'), {
            candidate: event.candidate.toJSON(),
            from: isOfferer ? 'offerer' : 'answerer',
            timestamp: serverTimestamp()
          });
        } catch (error) {
          console.error('❌ Error sending ICE candidate:', error);
        }
      }
    };

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('✅ ontrack event fired!');
      console.log('📊 Track kind:', event.track.kind);
      console.log('📊 Track enabled:', event.track.enabled);
      console.log('📊 Track muted:', event.track.muted);
      console.log('📊 Track readyState:', event.track.readyState);
      console.log('📊 Streams count:', event.streams?.length);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        console.log('📥 Remote stream received');
        console.log('📊 Remote stream tracks:', remoteStream.getTracks().length);
        console.log('📊 Audio tracks:', remoteStream.getAudioTracks().length);
        console.log('📊 Video tracks:', remoteStream.getVideoTracks().length);
        
        if (this.remoteStreamCallback) {
          console.log('📞 Calling remote stream callback');
          this.remoteStreamCallback(remoteStream);
        } else {
          console.warn('⚠️ No remote stream callback registered!');
        }
      } else {
        console.warn('⚠️ No streams in track event');
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', this.peerConnection?.connectionState);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
      if (this.peerConnection?.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed - trying to restart');
        this.peerConnection?.restartIce();
      }
    };

    // Handle negotiation needed
    // IMPORTANT: Don't auto-negotiate for answerer! Only offerer creates offer
    this.peerConnection.onnegotiationneeded = async () => {
      console.log('🔄 Negotiation needed - isOfferer:', isOfferer);
      // Only offerer should create offer automatically
      // Answerer waits for offer from offerer
      if (isOfferer) {
        console.log('✅ Offerer can negotiate (but we handle this manually)');
      } else {
        console.log('⚠️ Answerer should NOT negotiate - waiting for offer');
      }
    };

    // Handle signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log('📡 Signaling state:', this.peerConnection?.signalingState);
    };
  }

  /**
   * Start a call (caller/offerer)
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

      console.log('🎤 Got local stream');
      console.log('📊 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState})`));

      // Create call signal in Firestore
      const signalRef = await addDoc(collection(db, 'call_signals'), {
        from: fromUserId,
        to: toUserId,
        fromName: fromName,
        type: callType,
        status: 'ringing',
        timestamp: serverTimestamp()
      });

      const callId = signalRef.id;
      console.log('✅ Call signal created:', callId);

      // Initialize peer connection
      this.initializePeerConnection(callId, true);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('➕ Adding track to peer connection:', track.kind, track.label);
        this.peerConnection!.addTrack(track, stream);
      });

      console.log('📊 Local stream tracks added:', stream.getTracks().length);
      console.log('📊 Peer connection senders:', this.peerConnection!.getSenders().length);

      // Listen for ICE candidates from answerer
      this.listenForIceCandidates(callId, 'answerer');

      return callId;

    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }

  /**
   * Listen for call status changes (for caller)
   */
  listenForCallStatus(
    signalId: string,
    onAccepted: () => void,
    onRejected: () => void,
    onEnded: () => void
  ) {
    const signalDoc = doc(db, 'call_signals', signalId);

    this.callSignalUnsubscribe = onSnapshot(signalDoc, async (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      console.log('📡 Call status changed:', data.status);

      if (data.status === 'accepted') {
        // Create offer and send to answerer
        await this.createOffer(signalId);
        onAccepted();
      } else if (data.status === 'rejected') {
        onRejected();
      } else if (data.status === 'ended') {
        onEnded();
      }
    });
  }

  /**
   * Create SDP offer
   */
  private async createOffer(callId: string) {
    try {
      console.log('📝 Creating SDP offer');
      
      // Offer options to ensure audio/video are enabled
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };
      
      const offer = await this.peerConnection!.createOffer(offerOptions);
      
      console.log('📋 Offer SDP:', offer.sdp?.substring(0, 200) + '...');
      
      await this.peerConnection!.setLocalDescription(offer);

      // Save offer to Firestore
      await updateDoc(doc(db, 'call_signals', callId), {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        }
      });

      console.log('✅ SDP offer created and sent');

      // Listen for answer
      this.listenForAnswer(callId);

    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Listen for SDP answer from answerer
   */
  private listenForAnswer(callId: string) {
    const signalDoc = doc(db, 'call_signals', callId);

    const unsubscribe = onSnapshot(signalDoc, async (snapshot) => {
      const data = snapshot.data();
      // Check if peerConnection exists before accessing it
      if (data?.answer && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
        console.log('📥 Received SDP answer');
        
        try {
          const answer = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answer);
          
          console.log('✅ Remote description set');
          unsubscribe();
        } catch (error) {
          console.error('❌ Error setting remote description:', error);
        }
      }
    });
  }

  /**
   * Answer a call (answerer)
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

      console.log('🎤 Got local stream (answerer)');
      console.log('📊 Stream tracks (answerer):', stream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState})`));

      // Initialize peer connection
      this.initializePeerConnection(signalId, false);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('➕ Adding track to peer connection (answerer):', track.kind, track.label);
        this.peerConnection!.addTrack(track, stream);
      });

      console.log('📊 Local stream tracks added (answerer):', stream.getTracks().length);
      console.log('📊 Peer connection senders (answerer):', this.peerConnection!.getSenders().length);

      // Wait a bit to ensure tracks are fully attached
      await new Promise(resolve => setTimeout(resolve, 100));

      // Listen for ICE candidates from offerer
      this.listenForIceCandidates(signalId, 'offerer');

      // Wait for offer and create answer (BEFORE updating status)
      this.listenForOfferAndCreateAnswer(signalId);

      // Longer delay to ensure listener is ready
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('✅ Answerer ready - listener registered - tracks attached');

      // Update signal status (this triggers caller to send offer)
      await updateDoc(doc(db, 'call_signals', signalId), {
        status: 'accepted'
      });

      console.log('✅ Status updated to accepted - waiting for offer');

      return stream;

    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw error;
    }
  }

  /**
   * Listen for SDP offer and create answer
   */
  private listenForOfferAndCreateAnswer(callId: string) {
    const signalDoc = doc(db, 'call_signals', callId);

    const unsubscribe = onSnapshot(signalDoc, async (snapshot) => {
      const data = snapshot.data();
      
      // Check if peerConnection exists before accessing it
      if (data?.offer && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
        console.log('📥 Received SDP offer');
        
        try {
          // Set remote description (offer)
          const offer = new RTCSessionDescription(data.offer);
          await this.peerConnection.setRemoteDescription(offer);

          // Create answer
          console.log('📝 Creating SDP answer');
          
          // Answer options to ensure audio/video are enabled
          const answerOptions: RTCAnswerOptions = {};
          
          const answer = await this.peerConnection.createAnswer(answerOptions);
          
          console.log('📋 Answer SDP:', answer.sdp?.substring(0, 200) + '...');
          
          await this.peerConnection.setLocalDescription(answer);

          // Send answer to Firestore
          await updateDoc(doc(db, 'call_signals', callId), {
            answer: {
              type: answer.type,
              sdp: answer.sdp
            }
          });

          console.log('✅ SDP answer created and sent');
          unsubscribe();

        } catch (error) {
          console.error('❌ Error creating answer:', error);
        }
      }
    });
  }

  /**
   * Listen for ICE candidates
   */
  private listenForIceCandidates(callId: string, from: 'offerer' | 'answerer') {
    const candidatesRef = collection(db, 'call_signals', callId, 'ice_candidates');
    const q = query(candidatesRef, where('from', '==', from));

    this.iceUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          console.log('📥 Received ICE candidate from', from);
          
          // Check if peerConnection exists before using it
          if (!this.peerConnection) {
            console.warn('⚠️ Peer connection is null, skipping ICE candidate');
            return;
          }
          
          try {
            const candidate = new RTCIceCandidate(data.candidate);
            await this.peerConnection.addIceCandidate(candidate);
            console.log('✅ ICE candidate added');
          } catch (error) {
            console.error('❌ Error adding ICE candidate:', error);
          }
        }
      });
    });
  }

  /**
   * Set callback for remote stream
   */
  onRemoteStream(callback: (stream: MediaStream) => void) {
    console.log('📝 Registered remote stream callback');
    this.remoteStreamCallback = callback;
  }

  /**
   * Clear remote stream callback
   */
  clearRemoteStreamCallback() {
    console.log('🗑️ Cleared remote stream callback');
    this.remoteStreamCallback = null;
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
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Unsubscribe from listeners
      if (this.callSignalUnsubscribe) {
        this.callSignalUnsubscribe();
        this.callSignalUnsubscribe = null;
      }

      if (this.iceUnsubscribe) {
        this.iceUnsubscribe();
        this.iceUnsubscribe = null;
      }

      // Update signal status
      if (signalId) {
        await updateDoc(doc(db, 'call_signals', signalId), {
          status: 'ended'
        });
      }

      console.log('📞 Call ended');
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    console.log('🔊 Toggle mute called');
    console.log('📊 Local stream exists:', !!this.localStream);
    
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      console.log('📊 Audio tracks count:', audioTracks.length);
      
      const audioTrack = audioTracks[0];
      if (audioTrack) {
        const wasEnabled = audioTrack.enabled;
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio track state changed:');
        console.log('   - Before:', wasEnabled ? 'enabled ✅' : 'disabled 🔇');
        console.log('   - After:', audioTrack.enabled ? 'enabled ✅' : 'disabled 🔇');
        console.log('   - Track ID:', audioTrack.id);
        console.log('   - Track label:', audioTrack.label);
        return !audioTrack.enabled; // return true if muted
      } else {
        console.error('❌ No audio track found in local stream!');
        console.log('📊 All tracks in stream:', this.localStream.getTracks().map(t => `${t.kind}: ${t.label}`));
      }
    } else {
      console.error('❌ No local stream available!');
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
   * Get error message in Arabic
   */
  getErrorMessage(error: any): string {
    if (!error) return 'حدث خطأ غير معروف';

    const errorString = error.toString().toLowerCase();

    if (errorString.includes('permission') || errorString.includes('denied')) {
      return '🎤 تم رفض الوصول للكاميرا/الميكروفون\n\nالحل:\n• اضغط على أيقونة القفل في المتصفح\n• امنح الموقع إذن الوصول\n• أعد تحميل الصفحة';
    }

    if (error.message) {
      return `⚠️ حدث خطأ:\n${error.message}`;
    }

    return '❌ حدث خطأ غير متوقع\n\nالرجاء إعادة المحاولة';
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
   * Listen for call signals (for incoming calls)
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
          };
          onSignal(signal);
        }
      });
    });
  }
}

export const nativeWebRTCService = new NativeWebRTCService();
