import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  type DocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Chat, Message, ChatSettings, User, ChatFolder } from '../types';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    // Handle Firestore timestamp object
    return new Date(timestamp.seconds * 1000);
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  // Fallback to current date if timestamp is invalid
  return new Date();
};

// Convert Chat document from Firestore
const convertChatDoc = (doc: DocumentSnapshot): Chat | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  
  // Convert messages with proper timestamp handling
  const messages = (data.messages || []).map((msg: any) => ({
    ...msg,
    timestamp: timestampToDate(msg.timestamp)
  }));
  
  return {
    id: doc.id,
    title: data.title,
    messages,
    settings: data.settings,
    user: data.user,
    shared: data.shared || false,
    shareId: data.shareId,
    isSplit: data.isSplit || false,
    splitFromChatId: data.splitFromChatId,
    folderId: data.folderId,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt)
  };
};

// Convert ChatFolder document from Firestore
const convertFolderDoc = (doc: DocumentSnapshot): ChatFolder | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  
  return {
    id: doc.id,
    name: data.name,
    color: data.color,
    user: data.user,
    isExpanded: data.isExpanded !== false, // Default to true
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt)
  };
};

// Create a new chat
export const createChat = async (
  userId: string,
  title: string,
  settings: ChatSettings,
  folderId?: string
): Promise<Chat> => {
  try {
    const chatData: any = {
      title,
      messages: [],
      settings,
      user: userId,
      shared: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Only include folderId if it's provided
    if (folderId) {
      chatData.folderId = folderId;
    }

    const docRef = await addDoc(collection(db, 'chats'), chatData);
    const newChat: Chat = {
      id: docRef.id,
      ...chatData,
      createdAt: chatData.createdAt.toDate(),
      updatedAt: chatData.updatedAt.toDate()
    };

    return newChat;
  } catch (error) {
    throw error;
  }
};

// Get user's chats
export const getUserChats = async (
  userId: string,
  limitCount: number = 50
): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('user', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const chats: Chat[] = [];

    querySnapshot.forEach((doc) => {
      const chat = convertChatDoc(doc);
      if (chat) {
        chats.push(chat);
      }
    });

    return chats;
  } catch (error) {
    throw error;
  }
};

// Get a specific chat
export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);
    return convertChatDoc(docSnap);
  } catch (error) {
    throw error;
  }
};

// Update chat
export const updateChat = async (
  chatId: string,
  updates: Partial<Omit<Chat, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(chatRef, updateData);
  } catch (error) {
    throw error;
  }
};

// Delete chat
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    throw error;
  }
};

// Add message to chat
export const addMessageToChat = async (
  chatId: string,
  message: Omit<Message, 'id'>
): Promise<Message> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chat = await getChat(chatId);
    
    if (!chat) {
      throw new Error('Chat not found');
    }

    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Convert message timestamp to Firestore timestamp for storage and clean undefined fields
    const messageForStorage = Object.fromEntries(
      Object.entries({
      ...newMessage,
      timestamp: Timestamp.fromDate(newMessage.timestamp)
      }).filter(([_, value]) => value !== undefined)
    );
    
    const updatedMessages = [...chat.messages, messageForStorage];
    
    await updateDoc(chatRef, {
      messages: updatedMessages,
      updatedAt: Timestamp.now()
    });

    return newMessage;
  } catch (error) {
    throw error;
  }
};

// Update message in chat
export const updateMessageInChat = async (
  chatId: string,
  messageId: string,
  updates: Partial<Message>
): Promise<void> => {
  try {
    
    const chat = await getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }
    

    const updatedMessages = chat.messages.map((msg, index) => {
      if (index === messageIndex) {
        const updatedMessage = { ...msg, ...updates };
        
        // Convert timestamp to Firestore timestamp for storage and clean undefined fields
        return Object.fromEntries(
          Object.entries({
          ...updatedMessage,
          timestamp: updatedMessage.timestamp instanceof Date 
            ? Timestamp.fromDate(updatedMessage.timestamp)
            : updatedMessage.timestamp
          }).filter(([_, value]) => value !== undefined)
        );
      }
      
      // Ensure existing messages also have proper timestamps for storage and clean undefined fields
      return Object.fromEntries(
        Object.entries({
        ...msg,
        timestamp: msg.timestamp instanceof Date 
          ? Timestamp.fromDate(msg.timestamp)
          : msg.timestamp
        }).filter(([_, value]) => value !== undefined)
      );
    });

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      messages: updatedMessages,
      updatedAt: Timestamp.now()
    });
    
  } catch (error) {
    throw error;
  }
};

// Delete message from chat
export const deleteMessageFromChat = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    const chat = await getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const updatedMessages = chat.messages.filter(msg => msg.id !== messageId);
    
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      messages: updatedMessages,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

// Share chat (create public share)
export const shareChat = async (chatId: string): Promise<string> => {
  try {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      shared: true,
      shareId,
      updatedAt: Timestamp.now()
    });

    return shareId;
  } catch (error) {
    throw error;
  }
};

// Get shared chat
export const getSharedChat = async (shareId: string): Promise<Chat | null> => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('shareId', '==', shareId),
      where('shared', '==', true)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return convertChatDoc(doc);
  } catch (error) {
    return null;
  }
};

// Unshare chat
export const unshareChat = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      shared: false,
      shareId: null,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

// User management functions
export const createUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = Timestamp.now();
    
    // Clean the user data to remove undefined fields
    const cleanUserData = Object.fromEntries(
      Object.entries({
        id: userId,
        email: userData.email || '',
        name: userData.name || '',
        ...(userData.avatar !== undefined && { avatar: userData.avatar }),
        verified: userData.verified || false,
        plan: userData.plan || 'free',
        ...(userData.openRouterApiKey !== undefined && { openRouterApiKey: userData.openRouterApiKey }),
        createdAt: now,
        updatedAt: now,
        ...userData
      }).filter(([_, value]) => value !== undefined)
    );
    
    await setDoc(userRef, cleanUserData);
  } catch (error) {
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      id: userSnap.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      verified: data.verified || false,
      plan: data.plan || 'free',
      openRouterApiKey: data.openRouterApiKey,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt)
    };
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Clean the updates to remove undefined fields
    const cleanUpdates = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: Timestamp.now()
      }).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(userRef, cleanUpdates);
  } catch (error) {
    throw error;
  }
}; 

// Folder management functions
export const createFolder = async (
  userId: string,
  name: string,
  color?: string
): Promise<ChatFolder> => {
  try {
    const folderData = {
      name,
      color: color || '#6b7280',
      user: userId,
      isExpanded: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'folders'), folderData);
    const newFolder: ChatFolder = {
      id: docRef.id,
      ...folderData,
      createdAt: folderData.createdAt.toDate(),
      updatedAt: folderData.updatedAt.toDate()
    };

    return newFolder;
  } catch (error) {
    throw error;
  }
};

export const getUserFolders = async (userId: string): Promise<ChatFolder[]> => {
  try {
    const q = query(
      collection(db, 'folders'),
      where('user', '==', userId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const folders: ChatFolder[] = [];

    querySnapshot.forEach((doc) => {
      const folder = convertFolderDoc(doc);
      if (folder) {
        folders.push(folder);
      }
    });

    return folders;
  } catch (error) {
    throw error;
  }
};

export const updateFolder = async (
  folderId: string,
  updates: Partial<Omit<ChatFolder, 'id' | 'user' | 'createdAt'>>
): Promise<void> => {
  try {
    const folderRef = doc(db, 'folders', folderId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(folderRef, updateData);
  } catch (error) {
    throw error;
  }
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    // First, remove folder reference from all chats in this folder
    const chatsQuery = query(
      collection(db, 'chats'),
      where('folderId', '==', folderId)
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    const batch = writeBatch(db);
    
    chatsSnapshot.forEach((chatDoc) => {
      batch.update(chatDoc.ref, { folderId: null });
    });
    
    // Delete the folder
    const folderRef = doc(db, 'folders', folderId);
    batch.delete(folderRef);
    
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

export const moveChatToFolder = async (
  chatId: string,
  folderId: string | null
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      folderId: folderId || undefined,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};


export const addCollaboratorToChat = async (
  chatId: string,
  userEmail: string
): Promise<void> => {
  try {
    // First, find the user by emailAdd commentMore actions
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', userEmail)
    );
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found with that email');
    }
    
    const userId = userSnapshot.docs[0].id;
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }
    
    const chatData = chatDoc.data();
    const currentCollaborators = chatData.collaborators || [];
    
    if (!currentCollaborators.includes(userId)) {
      await updateDoc(chatRef, {
        collaborators: [...currentCollaborators, userId],
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    throw error;
  }
};

export const removeCollaboratorFromChat = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }
    
    const chatData = chatDoc.data();
    const currentCollaborators = chatData.collaborators || [];
    
    await updateDoc(chatRef, {
      collaborators: currentCollaborators.filter((id: string) => id !== userId),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};
