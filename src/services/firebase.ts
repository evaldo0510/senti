// Mock Firebase implementation using localStorage
import { UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Mock Auth
const listeners: ((user: any) => void)[] = [];

export const auth = {
  get currentUser() {
    return JSON.parse(localStorage.getItem('iara_mock_user') || 'null');
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    listeners.push(callback);
    const user = JSON.parse(localStorage.getItem('iara_mock_user') || 'null');
    callback(user);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },
  signOut: async () => {
    localStorage.removeItem('iara_mock_user');
    listeners.forEach(cb => cb(null));
  }
};

export const loginMock = (user: any) => {
  localStorage.setItem('iara_mock_user', JSON.stringify(user));
  listeners.forEach(cb => cb(user));
};

export const logout = async () => {
  await auth.signOut();
  window.location.reload();
};

// Mock Firestore (not really used directly anymore, but keeping for compatibility)
export const db = {};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Mock Firestore Error [${operationType}] at ${path}:`, error);
}

export const isFirebaseOffline = false;
