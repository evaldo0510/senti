import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { userService } from '../services/userService';
import { UserProfile } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LoadingScreen } from './LoadingScreen';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Clear previous subscription if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        try {
          // Preload profile immediately
          const userProfile = await userService.getUser(currentUser.uid);
          setProfile(userProfile);
          if (userProfile) {
            localStorage.setItem("tipo", userProfile.tipo);
          }

          // Register real-time database listener
          unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              const updatedProfile = docSnap.data() as UserProfile;
              setProfile(updatedProfile);
              localStorage.setItem("tipo", updatedProfile.tipo);
            }
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
        
        // Seed mock data if needed
        userService.seedMockData().catch(console.error);
      } else {
        setProfile(null);
        localStorage.removeItem("tipo");
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  if (loading) {
    return <LoadingScreen message="Autenticando sua sessão..." />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
