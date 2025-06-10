// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import pb from '../lib/pocketbase';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  plan?: string;
  // ...other fields
}

interface AuthContextType {
  user: UserRecord | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      return pb.authStore.record as unknown as UserRecord;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remove = pb.authStore.onChange(() => {
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser(pb.authStore.record as unknown as UserRecord);
      } else {
        setUser(null);
      }
    });
    return () => remove();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await pb.collection('users').authWithOAuth2({
        provider: 'google',
        createData: { plan: 'free' }, // default plan for new users
      });
      // The onChange listener picks up the new record
    } catch (err) {
      console.error('Login error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
