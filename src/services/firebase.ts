import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = firebaseAppletConfig;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Initialize Firebase SDK safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use initializeFirestore with experimentalForceLongPolling to resolve "offline" errors in the preview environment
const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

export const db = firestore;
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firebase Cloud Messaging conditionally (only in client context with SW support)
export const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator
  ? getMessaging(app)
  : null;

// Seta listener de foreground messages se messaging estiver ativo
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'SENTI';
      const notificationOptions = {
        body: payload.notification?.body || 'Você tem uma nova atualização.',
        icon: '/icon.svg',
        badge: '/icon.svg',
        data: payload.data || {},
      };
      new Notification(notificationTitle, notificationOptions);
    }
  });
}

/**
 * Registra o Service Worker e gera/atualiza o Token do FCM no Backend
 */
export async function registerFCMToken(userId: string): Promise<string | null> {
  if (!messaging) {
    console.warn('FCM Messaging não é suportado neste ambiente.');
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Obter chave pública VAPID do backend para registro seguro
    const response = await fetch('/api/push/public-key');
    const { publicKey } = await response.json();
    
    if (!publicKey) {
      console.warn('VAPID public key não disponível.');
      return null;
    }

    const fcmToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: publicKey
    });

    if (fcmToken) {
      console.log('FCM Token obtido com sucesso:', fcmToken);
      
      // Envia o token obtido para o backend registrar no Firestore
      await fetch('/api/push/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, fcmToken }),
      });
      return fcmToken;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter ou salvar FCM Token:', error);
    return null;
  }
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log("Login popup closed by user.");
      return null;
    }
    console.error("Error logging in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem("simulatedUser");
    localStorage.removeItem("simulatedProfile");
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Throwing to help the AIS Agent diagnose rule issues
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();
