// Firebase Chat Service
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Timestamp | Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  readBy: string[]; // Array of user IDs who read this message
  edited?: boolean;
  editedAt?: Timestamp;
}

export interface Chat {
  id: string;
  participants: string[]; // Array of employee IDs
  participantNames: { [key: string]: string }; // Map of ID to name
  participantAvatars?: { [key: string]: string }; // Map of ID to avatar
  lastMessage: string;
  lastMessageTime: Timestamp | Date;
  lastMessageSenderId: string;
  unreadCount: { [key: string]: number }; // Map of user ID to unread count
  typing: { [key: string]: boolean }; // Map of user ID to typing status
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface OnlineStatus {
  userId: string;
  online: boolean;
  lastSeen: Timestamp | Date;
}

// ============================================
// Chat Operations
// ============================================

/**
 * Get or create a chat between two users
 */
export async function getOrCreateChat(
  currentUserId: string,
  currentUserName: string,
  otherUserId: string,
  otherUserName: string,
  currentUserAvatar?: string,
  otherUserAvatar?: string
): Promise<string> {
  try {
    console.log('🔍 البحث عن محادثة موجودة...', {
      currentUserId,
      currentUserName,
      otherUserId,
      otherUserName
    });

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingChatId: string | null = null;

    querySnapshot.forEach((doc) => {
      const chat = doc.data() as Chat;
      if (chat.participants.includes(otherUserId)) {
        existingChatId = doc.id;
        console.log('✅ تم العثور على محادثة موجودة:', existingChatId);
      }
    });

    if (existingChatId) {
      return existingChatId;
    }

    console.log('📝 إنشاء محادثة جديدة...');

    // Create new chat
    const newChatRef = doc(collection(db, 'chats'));
    const newChat: Chat = {
      id: newChatRef.id,
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName,
      },
      participantAvatars: {
        ...(currentUserAvatar && { [currentUserId]: currentUserAvatar }),
        ...(otherUserAvatar && { [otherUserId]: otherUserAvatar }),
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp() as Timestamp,
      lastMessageSenderId: currentUserId,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
      typing: {
        [currentUserId]: false,
        [otherUserId]: false,
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(newChatRef, newChat);
    console.log('✅ تم إنشاء المحادثة بنجاح:', newChatRef.id);
    return newChatRef.id;
  } catch (error) {
    console.error('❌ خطأ في getOrCreateChat:', error);
    throw error;
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: 'text' | 'file' | 'image' = 'text',
  fileUrl?: string,
  fileName?: string,
  senderAvatar?: string
): Promise<string> {
  try {
    // Create message
    const messageRef = doc(collection(db, 'messages'));
    const message: ChatMessage = {
      id: messageRef.id,
      chatId,
      senderId,
      senderName,
      senderAvatar,
      content,
      timestamp: serverTimestamp() as Timestamp,
      type,
      fileUrl,
      fileName,
      readBy: [senderId], // Sender has read it
    };

    await setDoc(messageRef, message);

    // Update chat
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      const chat = chatSnap.data() as Chat;
      const batch = writeBatch(db);
      
      // Update last message
      batch.update(chatRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: senderId,
        updatedAt: serverTimestamp(),
      });

      // Increment unread count for other participants
      chat.participants.forEach((participantId) => {
        if (participantId !== senderId) {
          batch.update(chatRef, {
            [`unreadCount.${participantId}`]: increment(1),
          });
        }
      });

      await batch.commit();
    }

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  try {
    // Get all unread messages in this chat
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      where('senderId', '!=', userId)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      const message = doc.data() as ChatMessage;
      if (!message.readBy.includes(userId)) {
        batch.update(doc.ref, {
          readBy: arrayUnion(userId),
        });
      }
    });

    // Reset unread count
    const chatRef = doc(db, 'chats', chatId);
    batch.update(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Set typing status
 */
export async function setTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`typing.${userId}`]: isTyping,
    });
  } catch (error) {
    console.error('Error setting typing status:', error);
    throw error;
  }
}

/**
 * Update online status
 */
export async function updateOnlineStatus(
  userId: string,
  online: boolean
): Promise<void> {
  try {
    const statusRef = doc(db, 'online_status', userId);
    await setDoc(statusRef, {
      userId,
      online,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    throw error;
  }
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<void> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      content: newContent,
      edited: true,
      editedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string, chatId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    
    // Update chat's last message if needed
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastMessage = querySnapshot.docs[0].data() as ChatMessage;
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.timestamp,
        lastMessageSenderId: lastMessage.senderId,
      });
    } else {
      // No messages left
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// ============================================
// Real-time Subscriptions
// ============================================

/**
 * Subscribe to user's chats
 */
export function subscribeToChats(
  userId: string,
  callback: (chats: Chat[]) => void
): () => void {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat);
    });
    callback(chats);
  });
}

/**
 * Subscribe to messages in a chat
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
}

/**
 * Subscribe to online status
 */
export function subscribeToOnlineStatus(
  userId: string,
  callback: (status: OnlineStatus) => void
): () => void {
  const statusRef = doc(db, 'online_status', userId);

  return onSnapshot(statusRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as OnlineStatus);
    } else {
      callback({
        userId,
        online: false,
        lastSeen: new Date(),
      });
    }
  });
}

/**
 * Subscribe to typing status
 */
export function subscribeToTyping(
  chatId: string,
  callback: (typing: { [key: string]: boolean }) => void
): () => void {
  const chatRef = doc(db, 'chats', chatId);

  return onSnapshot(chatRef, (doc) => {
    if (doc.exists()) {
      const chat = doc.data() as Chat;
      callback(chat.typing || {});
    }
  });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get chat by ID
 */
export async function getChatById(chatId: string): Promise<Chat | null> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      return { id: chatSnap.id, ...chatSnap.data() } as Chat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    return null;
  }
}

/**
 * Get all messages for a chat
 */
export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

/**
 * Search messages
 */
export async function searchMessages(
  chatId: string,
  searchTerm: string
): Promise<ChatMessage[]> {
  try {
    const messages = await getMessages(chatId);
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching messages:', error);
    return [];
  }
}
