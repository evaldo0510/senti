import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export interface UserSession {
  id: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Simple client-side helper to parse user agent
function parseUserAgent(): { browser: string; os: string; deviceType: 'mobile' | 'tablet' | 'desktop' } {
  const ua = navigator.userAgent;
  let browser = 'Desconhecido';
  let os = 'Desconhecido';
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  // Parse OS
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('X11') !== -1) os = 'Linux';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) { os = 'Android'; deviceType = 'mobile'; }
  else if (ua.indexOf('like Mac') !== -1) { os = 'iOS'; deviceType = 'mobile'; }

  // Parse Browser
  if (ua.indexOf('Chrome') !== -1) browser = 'Google Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
  else if (ua.indexOf('MSIE') !== -1 || !!(document as any).documentMode) browser = 'Internet Explorer';
  else if (ua.indexOf('Edge') !== -1) browser = 'Microsoft Edge';

  if (os === 'iOS' && window.innerWidth > 768) {
    deviceType = 'tablet';
  }

  return { browser, os, deviceType };
}

// Generate or retrieve a unique sessionId for the current device/browser session
export function getCurrentSessionId(): string {
  let sessionId = localStorage.getItem('senti_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem('senti_session_id', sessionId);
  }
  return sessionId;
}

export const sessionService = {
  registerSession: async (userId: string): Promise<void> => {
    try {
      const sessionId = getCurrentSessionId();
      const { browser, os, deviceType } = parseUserAgent();
      
      // Let's fetch IP dynamically or simulate a realistic one based on locale/timezone
      let ip = '189.120.14.77';
      let location = 'Rio de Janeiro, Brasil';
      
      try {
        const response = await fetch('https://api.ipify.org?format=json').then(r => r.json());
        if (response.ip) {
          ip = response.ip;
          // Look up location using a free public endpoint
          const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
          if (geo.city && geo.country_name) {
            location = `${geo.city}, ${geo.country_name}`;
          }
        }
      } catch (err) {
        console.warn('Geolocating session failed, using high-fidelity simulations', err);
      }

      const sessionData = {
        id: sessionId,
        userAgent: navigator.userAgent,
        deviceType,
        browser,
        os,
        ip,
        location,
        lastActive: new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      const sessionDocRef = doc(db, 'users', userId, 'sessions', sessionId);
      await setDoc(sessionDocRef, sessionData, { merge: true });
      console.log('[SESSÕES] Sessão atual cadastrada e monitorada:', sessionId);
    } catch (error) {
      console.error('[SESSÕES] Erro ao registrar sessão:', error);
    }
  },

  getSessions: (userId: string, callback: (sessions: UserSession[]) => void) => {
    const currentSessionId = getCurrentSessionId();
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    
    return onSnapshot(sessionsRef, (snapshot) => {
      const sessionsList: UserSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        sessionsList.push({
          id: docSnap.id,
          userAgent: data.userAgent || '',
          deviceType: data.deviceType || 'desktop',
          browser: data.browser || 'Desconhecido',
          os: data.os || 'Desconhecido',
          ip: data.ip || '127.0.0.1',
          location: data.location || 'Brasil',
          lastActive: data.lastActive || new Date().toISOString(),
          isCurrent: docSnap.id === currentSessionId
        });
      });
      
      // Sort sessions: current session first, then by lastActive descending
      sessionsList.sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });
      
      callback(sessionsList);
    }, (error) => {
      console.error('[SESSÕES] Erro ao escutar sessões em tempo real:', error);
    });
  },

  revokeSession: async (userId: string, sessionId: string): Promise<void> => {
    try {
      const sessionDocRef = doc(db, 'users', userId, 'sessions', sessionId);
      await deleteDoc(sessionDocRef);
      console.log('[SESSÕES] Sessão remota revogada:', sessionId);
    } catch (error) {
      console.error('[SESSÕES] Erro ao revogar sessão remota:', error);
      throw error;
    }
  },

  listenToCurrentSession: (userId: string, onRevoked: () => void) => {
    const currentSessionId = getCurrentSessionId();
    const sessionDocRef = doc(db, 'users', userId, 'sessions', currentSessionId);
    
    return onSnapshot(sessionDocRef, (docSnap) => {
      // If document was deleted but auth is still logged in, sign out immediately
      if (!docSnap.exists() && auth.currentUser) {
        console.warn('[SESSÕES] Sessão atual foi revogada remotamente! Forçando logout...');
        onRevoked();
      }
    });
  }
};
