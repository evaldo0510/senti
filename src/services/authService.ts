import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile, UserType } from "../types";

export const registrar = async (email: string, senha: string, nome: string, tipo: UserType = 'usuario') => {
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
};

export const login = (email: string, senha: string) => {
  return signInWithEmailAndPassword(auth, email, senha);
};

export const logout = () => {
  return signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (error) {
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
