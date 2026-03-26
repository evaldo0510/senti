import { UserProfile, UserType } from "../types";
import { auth, loginWithGoogle, logout as firebaseLogout } from "./firebase";
import { userService } from "./userService";
import { onAuthStateChanged } from "firebase/auth";

let currentUserProfile: UserProfile | null = null;

// Listen for auth changes to keep profile in sync
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      currentUserProfile = await userService.getUser(user.uid);
    } catch (error) {
      console.error("Failed to fetch user profile on auth state change", error);
    }
  } else {
    currentUserProfile = null;
  }
});

export const isMockMode = () => false;

export const registrar = async (email: string, senha: string, nome: string, tipo: UserType = 'usuario') => {
  // For now, we only support Google Login as per guidelines.
  // This function would normally use createUserWithEmailAndPassword.
  throw new Error("Registration with email not implemented. Use Google Login.");
};

export const login = async (email: string, senha: string) => {
  // For now, we only support Google Login as per guidelines.
  throw new Error("Login with email not implemented. Use Google Login.");
};

export const logout = async () => {
  await firebaseLogout();
  currentUserProfile = null;
};

export const enterDemoMode = async (tipo: UserType = 'usuario') => {
  // Demo mode is not supported with real Firebase unless we use anonymous auth.
  // For now, redirect to login.
  throw new Error("Demo mode not supported. Please login.");
};

export const getAuthenticatedUser = () => {
  return currentUserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (currentUserProfile && currentUserProfile.uid === uid) return currentUserProfile;
  return await userService.getUser(uid);
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await userService.updateProfile(uid, data);
  if (currentUserProfile && currentUserProfile.uid === uid) {
    currentUserProfile = { ...currentUserProfile, ...data };
  }
};

export { auth };

