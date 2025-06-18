import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '../types';

// Create user profile in Firestore
export const createUserProfile = async (user: FirebaseUser, additionalData?: any): Promise<User> => {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = Timestamp.now();

    try {
      const userData: User = {
        id: user.uid,
        email: email || '',
        name: displayName || additionalData?.name || 'User',
        ...(photoURL ? { avatar: photoURL } : {}),
        verified: user.emailVerified,
        plan: 'free',
        openRouterApiKey: additionalData?.openRouterApiKey,
        openaiApiKey: additionalData?.openaiApiKey,
        createdAt: createdAt.toDate(),
        updatedAt: createdAt.toDate(),
        ...additionalData
      };

      // Prepare data for Firestore (exclude undefined values)
      const firestoreData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        ...(userData.avatar ? { avatar: userData.avatar } : {}),
        verified: userData.verified,
        plan: userData.plan,
        ...(userData.openRouterApiKey ? { openRouterApiKey: userData.openRouterApiKey } : {}),
        ...(userData.openaiApiKey ? { openaiApiKey: userData.openaiApiKey } : {}),
        createdAt,
        updatedAt: createdAt
      };

      await setDoc(userRef, firestoreData);

      return userData;
    } catch (error) {
      throw error;
    }
  }

  // User already exists, return existing data
  const userData = snapshot.data();
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    avatar: userData.avatar,
    verified: userData.verified,
    plan: userData.plan,
    openRouterApiKey: userData.openRouterApiKey,
    openaiApiKey: userData.openaiApiKey,
    selectedTheme: userData.selectedTheme,
    customTheme: userData.customTheme,
    createdAt: userData.createdAt.toDate(),
    updatedAt: userData.updatedAt.toDate()
  };
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Create user profile in Firestore
    const userProfile = await createUserProfile(user, { name });
    return userProfile;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const signInEmailPassword = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;
    
    // Get or create user profile
    const userProfile = await createUserProfile(user);
    return userProfile;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.data();
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        verified: userData.verified,
        plan: userData.plan,
        openRouterApiKey: userData.openRouterApiKey,
        openaiApiKey: userData.openaiApiKey,
        selectedTheme: userData.selectedTheme,
        customTheme: userData.customTheme,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate()
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Prepare updates for Firestore (exclude undefined values and handle special fields)
    const firestoreUpdates: any = {
      updatedAt: Timestamp.now()
    };
    
    if (updates.name !== undefined) firestoreUpdates.name = updates.name;
    if (updates.avatar !== undefined) firestoreUpdates.avatar = updates.avatar;
    if (updates.openRouterApiKey !== undefined) firestoreUpdates.openRouterApiKey = updates.openRouterApiKey;
    if (updates.openaiApiKey !== undefined) firestoreUpdates.openaiApiKey = updates.openaiApiKey;
    if (updates.selectedTheme !== undefined) firestoreUpdates.selectedTheme = updates.selectedTheme;
    if (updates.customTheme !== undefined) firestoreUpdates.customTheme = updates.customTheme;
    
    await updateDoc(userRef, firestoreUpdates);
  } catch (error) {
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await createUserProfile(firebaseUser);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};

// Get error message from Firebase Auth error
export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}; 
