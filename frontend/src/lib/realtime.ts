import { doc, onSnapshot, collection, query, where, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Chat } from '../types'

// Convert Firestore document to Chat object
const convertChatDoc = (doc: any): Chat | null => {
  if (!doc.exists()) return null
  
  const data = doc.data()
  
  // Convert messages with proper timestamp handling
  const messages = (data.messages || []).map((msg: any) => ({
    ...msg,
    timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
  }))
  
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
    collaborators: data.collaborators || [],
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
  }
}

// Subscribe to shared chat updates
export const subscribeToSharedChat = (
  shareId: string,
  onUpdate: (chat: Chat) => void
): (() => void) => {
  // First find the chat by shareId
  const chatsQuery = query(
    collection(db, 'chats'),
    where('shareId', '==', shareId)
  )
  
  return onSnapshot(chatsQuery, (snapshot) => {
    if (!snapshot.empty) {
      const chatDoc = snapshot.docs[0]
      const chat = convertChatDoc(chatDoc)
      if (chat) {
        onUpdate(chat)
      }
    }
  })
}

// Subscribe to collaborator typing indicators
export const subscribeToCollaboratorTyping = (
  shareId: string,
  onTypingUpdate: (typingUsers: string[]) => void
): (() => void) => {
  const typingRef = doc(db, 'typing', shareId)
  
  return onSnapshot(typingRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      const typingUsers = Object.keys(data || {}).filter(userId => {
        const lastTyping = data[userId]?.toDate ? data[userId].toDate() : new Date(data[userId])
        // Consider user typing if they typed within the last 3 seconds
        return Date.now() - lastTyping.getTime() < 3000
      })
      onTypingUpdate(typingUsers)
    } else {
      onTypingUpdate([])
    }
  })
}

// Update typing indicator
export const updateTypingIndicator = async (
  shareId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const typingRef = doc(db, 'typing', shareId)
    
    if (isTyping) {
      await updateDoc(typingRef, {
        [userId]: Timestamp.now()
      })
    } else {
      // Remove user from typing indicators
      await updateDoc(typingRef, {
        [userId]: null
      })
    }
  } catch (error) {
    console.error('Error updating typing indicator:', error)
  }
}

// Subscribe to chat messages for real-time updates
export const subscribeToMessages = (
  chatId: string,
  onMessagesUpdate: (messages: any[]) => void
): (() => void) => {
  const chatRef = doc(db, 'chats', chatId)
  
  return onSnapshot(chatRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      const messages = (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      }))
      onMessagesUpdate(messages)
    }
  })
} 