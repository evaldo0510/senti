import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';
import { UserProfile } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LoadingScreen } from './LoadingScreen';
import { doc, onSnapshot } from 'firebase/firestore';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  hasPremiumAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  hasPremiumAccess: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeSession: (() => void) | null = null;

    const simUserStr = localStorage.getItem("simulatedUser");
    const simProfileStr = localStorage.getItem("simulatedProfile");
    if (simUserStr && simProfileStr) {
      try {
        const simUser = JSON.parse(simUserStr);
        const simProfile = JSON.parse(simProfileStr);
        setUser(simUser);
        setProfile(simProfile);
        setLoading(false);
        setIsAuthReady(true);
        return () => {};
      } catch (e) {
        console.error("Failed to parse simulated session:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Synchronously set loading to true and isAuthReady to false BEFORE any async yield.
      // This immediately locks the rendering tree and prevents premature queries during auth changes.
      setLoading(true);
      setIsAuthReady(false);

      // Clear previous subscription if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (unsubscribeSession) {
        unsubscribeSession();
        unsubscribeSession = null;
      }

      if (currentUser) {
        let userProfile: UserProfile | null = null;
        try {
          // Preload profile immediately
          userProfile = await userService.getUser(currentUser.uid);
          if (!userProfile) {
            // First-time sign-in profile creation
            userProfile = await userService.syncProfile(currentUser);
          }

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

          // Register session and listen to revocation
          try {
            await sessionService.registerSession(currentUser.uid);
            unsubscribeSession = sessionService.listenToCurrentSession(currentUser.uid, () => {
              auth.signOut();
            });
          } catch (sessionErr) {
            console.error("Failed to establish session monitoring:", sessionErr);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }

        // Apply state atomically to prevent premature render of authenticated children without profiles
        setUser(currentUser);
        setProfile(userProfile);
        setLoading(false);
        setIsAuthReady(true);
        
        // Seed mock data if needed
        userService.seedMockData().catch(console.error);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("tipo");
        setLoading(false);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      if (unsubscribeSession) {
        unsubscribeSession();
      }
    };
  }, []);

  const hasPremiumAccess = (): boolean => {
    if (!profile) return false;
    if (
      profile.tipo === 'admin' || 
      profile.tipo === 'super_admin' || 
      profile.tipo === 'terapeuta' || 
      profile.tipo === 'clinica' || 
      profile.tipo === 'empresa' || 
      profile.tipo === 'prefeitura' || 
      profile.tipo === 'moderador'
    ) {
      return true;
    }
    if (profile.subscriptionStatus === 'active') return true;
    if (profile.subscriptionStatus === 'trial') {
      if (!profile.trialEndDate) return true;
      const end = new Date(profile.trialEndDate);
      return new Date() <= end;
    }
    return false;
  };

  if (loading || !isAuthReady) {
    return <LoadingScreen message="Autenticando sua sessão..." />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, hasPremiumAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const location = useLocation();

  if (loading || !isAuthReady) {
    return <LoadingScreen message="Verificando permissões..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se onboardingCompleted for falso ou não existir, redirecionar o usuário para a rota /onboarding
  const isStandardUser = !profile || profile.tipo === 'usuario';
  if (isStandardUser && !profile?.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const PremiumProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isAuthReady, hasPremiumAccess } = useAuth();
  const location = useLocation();

  if (loading || !isAuthReady) {
    return <LoadingScreen message="Verificando assinatura..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se onboardingCompleted for falso ou não existir, redirecionar o usuário para a rota /onboarding
  const isStandardUser = !profile || profile.tipo === 'usuario';
  if (isStandardUser && !profile?.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!hasPremiumAccess()) {
    return <Navigate to="/assinatura" replace />;
  }

  return <>{children}</>;
};
