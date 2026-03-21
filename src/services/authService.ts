import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  signInAnonymously
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile, UserType } from "../types";

// Mock user for development bypass
const MOCK_USER: UserProfile = {
  uid: "mock-user-id",
  nome: "Usuário de Teste",
  email: "teste@prontosocorro.com",
  tipo: "usuario",
  createdAt: new Date().toISOString()
};

let _isMockMode = false;
let mockUserInstance: UserProfile | null = null;

export const isMockMode = () => _isMockMode;

export const registrar = async (email: string, senha: string, nome: string, tipo: UserType = 'usuario') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    
    const profile: UserProfile = {
      uid: user.uid,
      nome,
      email,
      tipo,
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, "users", user.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
    return profile;
  } catch (error: any) {
    if (error.message?.includes('offline') || error.message?.includes('api-key-not-valid') || error.code?.includes('auth/network-request-failed') || error.code?.includes('auth/invalid-api-key')) {
      console.warn("Firebase offline/invalid. Usando modo de demonstração.");
      _isMockMode = true;
      mockUserInstance = MOCK_USER;
      return MOCK_USER;
    }
    throw error;
  }
};

export const login = async (email: string, senha: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, senha);
    _isMockMode = false;
    mockUserInstance = null;
    return result;
  } catch (error: any) {
    if (error.message?.includes('offline') || error.message?.includes('api-key-not-valid') || error.code?.includes('auth/network-request-failed') || error.code?.includes('auth/invalid-api-key')) {
      console.warn("Firebase offline/invalid. Ativando modo de demonstração.");
      _isMockMode = true;
      
      let mockType: UserType = 'usuario';
      if (email.includes('empresa')) mockType = 'empresa';
      else if (email.includes('terapeuta')) mockType = 'terapeuta';
      else if (email.includes('prefeitura')) mockType = 'prefeitura';
      
      mockUserInstance = { ...MOCK_USER, tipo: mockType, email };
      
      try {
        // Tenta entrar anonimamente para disparar o onAuthStateChanged se possível
        return await signInAnonymously(auth);
      } catch (e) {
        // Se falhar até o anônimo, retornamos o mock manualmente
        return { user: { uid: MOCK_USER.uid } } as any;
      }
    }
    throw error;
  }
};

export const logout = () => {
  _isMockMode = false;
  mockUserInstance = null;
  return signOut(auth);
};

export const enterDemoMode = (tipo: UserType = 'usuario') => {
  _isMockMode = true;
  mockUserInstance = { ...MOCK_USER, tipo };
  return mockUserInstance;
};

export const getAuthenticatedUser = () => {
  if (_isMockMode) return mockUserInstance;
  return auth.currentUser;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (_isMockMode || uid === MOCK_USER.uid) return MOCK_USER;

  const docRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      return MOCK_USER;
    }
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
  return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, "users", uid);
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export { auth };
