import Peer, { MediaConnection } from 'peerjs';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp, deleteDoc, getDocs, orderBy, limit, getDoc } from 'firebase/firestore';
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

export interface CallHistory {
  id: string;
  from: string;
  to: string;
  fromName: string;
  type: 'audio' | 'video';
  status: 'accepted' | 'rejected' | 'ended' | 'missed';
  startedAt: Date;
  endedAt: Date;
  duration: number; // in seconds
}

class WebRTCService {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private callSignalUnsubscribe: (() => void) | null = null;
  private incomingCallCallback: ((signal: CallSignal) => void) | null = null;
  private remoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // Start with 2 seconds

  /**
   * Initialize PeerJS connection with retry logic
   */
  async initializePeerWithRetry(userId: string, attempt: number = 1): Promise<string> {
    try {
      console.log(`🔄 Attempting to initialize peer (attempt ${attempt}/${this.maxRetries})`);
      return await this.initializePeer(userId);
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initializePeerWithRetry(userId, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Get user-friendly error message in Arabic
   */
  getErrorMessage(error: any): string {
    if (!error) return 'حدث خطأ غير معروف';

    const errorString = error.toString().toLowerCase();
    const errorType = error.type?.toLowerCase() || '';
    const errorMessage = error.message?.toLowerCase() || '';

    // Network errors
    if (errorString.includes('network') || errorString.includes('fetch') || 
        errorMessage.includes('failed to fetch')) {
      return '❌ خطأ في الاتصال بالإنترنت\n\nالرجاء التحقق من:\n• اتصال الإنترنت\n• جدار الحماية (Firewall)\n• إعدادات الشبكة';
    }

    // Timeout errors
    if (errorString.includes('timeout') || errorMessage.includes('المهلة')) {
      return '⏱️ انتهت المهلة الزمنية\n\nالأسباب المحتملة:\n• اتصال الإنترنت بطيء\n• خادم المكالمات مشغول\n• جرب مرة أخرى بعد قليل';
    }

    // Permission errors
    if (errorString.includes('permission') || errorString.includes('denied') ||
        errorMessage.includes('permission')) {
      return '🎤 تم رفض الوصول للكاميرا/الميكروفون\n\nالحل:\n• اضغط على أيقونة القفل في المتصفح\n• امنح الموقع إذن الوصول\n• أعد تحميل الصفحة';
    }

    // Browser errors
    if (errorString.includes('webrtc') || errorMessage.includes('not supported')) {
      return '🌐 المتصفح لا يدعم المكالمات\n\nالحل:\n• استخدم متصفح حديث (Chrome, Edge, Firefox)\n• حدّث المتصفح لآخر إصدار';
    }

    // PeerJS specific errors
    if (errorType === 'peer-unavailable') {
      return '📵 الطرف الآخر غير متصل\n\nالرجاء:\n• التأكد من أن الطرف الآخر متصل بالإنترنت\n• المحاولة مرة أخرى بعد قليل';
    }

    if (errorType === 'server-error' || errorType === 'socket-error') {
      return '🔧 خطأ في خادم المكالمات\n\nالحل:\n• جرب مرة أخرى بعد دقيقة\n• إذا استمرت المشكلة اتصل بالدعم الفني';
    }

    // SSL/HTTPS errors
    if (errorString.includes('ssl') || errorString.includes('https')) {
      return '🔒 خطأ في الاتصال الآمن\n\nالحل:\n• تأكد من استخدام HTTPS\n• تحقق من شهادة SSL للموقع';
    }

    // Generic error with message
    if (error.message) {
      return `⚠️ حدث خطأ:\n${error.message}\n\nجرب إعادة تحميل الصفحة`;
    }

    return '❌ حدث خطأ غير متوقع\n\nالرجاء:\n• إعادة تحميل الصفحة\n• المحاولة مرة أخرى\n• الاتصال بالدعم الفني إذا استمرت المشكلة';
  }

  /**
   * تنظيف معرّف المستخدم ليكون متوافق مع PeerJS
   * يحول الأحرف العربية والخاصة إلى معرّف آمن
   */
  private sanitizeUserId(userId: string): string {
    // إزالة أي أحرف غير alphanumeric
    // تحويل الأحرف العربية إلى Base64 آمن
    try {
      // تحويل إلى Base64 ثم إزالة الرموز الخاصة
      const base64 = btoa(encodeURIComponent(userId));
      // إزالة =, +, / واستبدالها بأحرف آمنة
      return base64.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    } catch (e) {
      // في حالة فشل Base64، استخدم hash بسيط
      let hash = 0;
      for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return 'user' + Math.abs(hash).toString(36);
    }
  }

  /**
   * Initialize PeerJS connection
   */
  initializePeer(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // If peer already exists and is open, reuse it
      if (this.peer && !this.peer.disconnected && !this.peer.destroyed) {
        console.log('♻️ Reusing existing peer connection:', this.peer.id);
        resolve(this.peer.id);
        return;
      }

      // Add timeout (30 seconds - increased for slower connections)
      const timeout = setTimeout(() => {
        reject(new Error('فشل الاتصال بالخادم: انتهت المهلة الزمنية'));
      }, 30000);

      try {
        // تنظيف معرّف المستخدم من الأحرف العربية والخاصة
        const sanitizedUserId = this.sanitizeUserId(userId);
        
        // Generate unique peer ID to avoid conflicts
        const uniqueId = `${sanitizedUserId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('🔌 Initializing PeerJS with ID:', uniqueId);
        console.log('👤 Original userId:', userId, '→ Sanitized:', sanitizedUserId);

        // Use default PeerJS cloud server (free and most compatible)
        // Note: If WebSocket fails, it might be network/firewall issue
        this.peer = new Peer(uniqueId, {
          // Don't specify host/port to use default cloud server
          config: {
            iceServers: [
              // Google STUN servers (free)
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              // Mozilla STUN server (free)
              { urls: 'stun:stun.services.mozilla.com' },
              // Open STUN servers (free)
              { urls: 'stun:stunprotocol.org:3478' },
            ],
            iceTransportPolicy: 'all',
            iceCandidatePoolSize: 10
          },
          debug: 2
        });

        // Check if peer is already open (sometimes 'open' event doesn't fire)
        if (this.peer.id) {
          clearTimeout(timeout);
          console.log('✅ PeerJS already open with ID:', this.peer.id);
          resolve(this.peer.id);
          return;
        }

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          console.log('✅ PeerJS connected with ID:', id);
          resolve(id);
        });

        this.peer.on('error', (error) => {
          clearTimeout(timeout);
          console.error('❌ PeerJS error:', error);
          console.error('Error type:', error.type);
          console.error('Error message:', error.message);
          reject(error);
        });

        // Additional event listeners for debugging and reconnection
        this.peer.on('disconnected', () => {
          console.warn('⚠️ PeerJS disconnected - attempting reconnection...');
          // Try to reconnect
          try {
            this.peer?.reconnect();
          } catch (e) {
            console.error('Failed to reconnect:', e);
          }
        });

        this.peer.on('close', () => {
          console.warn('⚠️ PeerJS connection closed');
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
   * Listen for status changes on a specific call signal (for caller)
   */
  listenForCallStatus(
    signalId: string, 
    onAccepted: (receiverPeerId?: string) => void,
    onRejected: () => void,
    onEnded: () => void
  ) {
    const signalDoc = doc(db, 'call_signals', signalId);
    
    this.callSignalUnsubscribe = onSnapshot(signalDoc, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      console.log('📡 Call status changed:', data.status);

      if (data.status === 'accepted') {
        // Pass the receiver's peer ID to the callback
        onAccepted(data.receiverPeerId);
      } else if (data.status === 'rejected') {
        onRejected();
      } else if (data.status === 'ended') {
        onEnded();
      }
    });
  }

  /**
   * Answer a call
   * Note: This only gets the media stream. The caller must update the signal status.
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

      // Don't update signal here - let the caller do it with receiverPeerId
      // await updateDoc(doc(db, 'call_signals', signalId), {
      //   status: 'accepted'
      // });

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
    return new Promise(async (resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      // Check if peer is disconnected and try to reconnect
      if (this.peer.disconnected) {
        console.warn('⚠️ Peer is disconnected, attempting to reconnect...');
        try {
          this.peer.reconnect();
          // Wait a bit for reconnection
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.error('❌ Failed to reconnect peer:', e);
          reject(new Error('Peer is disconnected and could not reconnect'));
          return;
        }
      }

      // Check if peer is destroyed
      if (this.peer.destroyed) {
        console.error('❌ Peer is destroyed, cannot make call');
        reject(new Error('Peer is destroyed'));
        return;
      }

      try {
        console.log('🔗 Connecting to peer:', peerId);
        console.log('📊 Current peer state - disconnected:', this.peer.disconnected, 'destroyed:', this.peer.destroyed);
        
        const call = this.peer.call(peerId, stream);
        
        if (!call) {
          reject(new Error('Failed to create call'));
          return;
        }
        
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
    console.log('📞 Handling incoming call from:', call.peer);
    this.currentCall = call;

    // Answer with local stream
    if (this.localStream) {
      console.log('✅ Answering call with local stream');
      call.answer(this.localStream);
      
      call.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream from incoming call');
        // Pass remote stream to UI via callback
        if (this.remoteStreamCallback) {
          console.log('📤 Passing remote stream to UI');
          this.remoteStreamCallback(remoteStream);
        } else {
          console.warn('⚠️ No remote stream callback registered');
        }
      });

      call.on('close', () => {
        console.log('📞 Incoming call ended');
      });

      call.on('error', (error) => {
        console.error('❌ Incoming call error:', error);
      });
    } else {
      console.error('❌ No local stream available to answer call');
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

      // Update signal status and save to call history
      if (signalId) {
        const signalDoc = doc(db, 'call_signals', signalId);
        const signalSnap = await getDoc(signalDoc);
        
        if (signalSnap.exists()) {
          const signalData = signalSnap.data();
          
          // Update signal status
          await updateDoc(signalDoc, {
            status: 'ended',
            endedAt: serverTimestamp()
          });

          // Save to call history
          await addDoc(collection(db, 'call_history'), {
            from: signalData.from,
            to: signalData.to,
            fromName: signalData.fromName,
            type: signalData.type,
            status: signalData.status || 'ended',
            startedAt: signalData.timestamp,
            endedAt: serverTimestamp(),
            duration: null // Will be calculated on read
          });

          console.log('📞 Call ended and saved to history');
        }
      }

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
   * Set callback for remote stream (for receiver)
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
   * Get current call
   */
  getCurrentCall(): MediaConnection | null {
    return this.currentCall;
  }

  /**
   * Get call history for a user
   */
  async getCallHistory(userId: string, maxResults: number = 50): Promise<CallHistory[]> {
    try {
      const q = query(
        collection(db, 'call_history'),
        where('from', '==', userId),
        orderBy('startedAt', 'desc'),
        limit(maxResults)
      );

      const q2 = query(
        collection(db, 'call_history'),
        where('to', '==', userId),
        orderBy('startedAt', 'desc'),
        limit(maxResults)
      );

      const [outgoingSnap, incomingSnap] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);

      const calls: CallHistory[] = [];

      outgoingSnap.forEach(doc => {
        const data = doc.data();
        const startedAt = data.startedAt?.toDate() || new Date();
        const endedAt = data.endedAt?.toDate() || new Date();
        const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        calls.push({
          id: doc.id,
          from: data.from,
          to: data.to,
          fromName: data.fromName,
          type: data.type,
          status: data.status,
          startedAt,
          endedAt,
          duration
        });
      });

      incomingSnap.forEach(doc => {
        const data = doc.data();
        const startedAt = data.startedAt?.toDate() || new Date();
        const endedAt = data.endedAt?.toDate() || new Date();
        const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        calls.push({
          id: doc.id,
          from: data.from,
          to: data.to,
          fromName: data.fromName,
          type: data.type,
          status: data.status,
          startedAt,
          endedAt,
          duration
        });
      });

      // Sort by date (most recent first)
      calls.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

      return calls.slice(0, maxResults);
    } catch (error) {
      console.error('❌ Failed to get call history:', error);
      return [];
    }
  }

  /**
   * Get call history between two users
   */
  async getCallHistoryBetween(userId1: string, userId2: string): Promise<CallHistory[]> {
    try {
      const q1 = query(
        collection(db, 'call_history'),
        where('from', '==', userId1),
        where('to', '==', userId2),
        orderBy('startedAt', 'desc')
      );

      const q2 = query(
        collection(db, 'call_history'),
        where('from', '==', userId2),
        where('to', '==', userId1),
        orderBy('startedAt', 'desc')
      );

      const [snap1, snap2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const calls: CallHistory[] = [];

      [...snap1.docs, ...snap2.docs].forEach(doc => {
        const data = doc.data();
        const startedAt = data.startedAt?.toDate() || new Date();
        const endedAt = data.endedAt?.toDate() || new Date();
        const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        calls.push({
          id: doc.id,
          from: data.from,
          to: data.to,
          fromName: data.fromName,
          type: data.type,
          status: data.status,
          startedAt,
          endedAt,
          duration
        });
      });

      // Sort by date (most recent first)
      calls.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

      return calls;
    } catch (error) {
      console.error('❌ Failed to get call history between users:', error);
      return [];
    }
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

  /**
   * Set callback for incoming calls
   */
  onIncomingCall(callback: (signal: CallSignal) => void) {
    this.incomingCallCallback = callback;
  }

  /**
   * Start listening for incoming calls
   */
  startListeningForIncomingCalls(userId: string) {
    console.log('👂 Listening for incoming calls for:', userId);
    
    // Stop previous listener
    this.stopListeningForCallSignals();

    // Listen for call signals where I'm the receiver
    const q = query(
      collection(db, 'call_signals'),
      where('to', '==', userId),
      where('status', '==', 'ringing')
    );

    this.callSignalUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const signal = {
            id: change.doc.id,
            ...change.doc.data(),
            timestamp: change.doc.data().timestamp?.toDate() || new Date()
          } as CallSignal;

          console.log('📞 Incoming call signal received:', signal);

          // Trigger callback
          if (this.incomingCallCallback) {
            this.incomingCallCallback(signal);
          }
        }
      });
    });
  }
}

export const webrtcService = new WebRTCService();
