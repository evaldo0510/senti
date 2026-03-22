import { UserProfile, UserType } from "../types";
import { auth, loginMock } from "./firebase";
import { userService } from "./userService";

// Mock user for development bypass
const MOCK_USER: UserProfile = {
  uid: "mock-user-id",
  nome: "Usuário de Teste",
  email: "teste@prontosocorro.com",
  tipo: "usuario",
  createdAt: new Date().toISOString()
};

let _isMockMode = true; // Always mock mode now
let mockUserInstance: UserProfile | null = JSON.parse(localStorage.getItem('iara_user_profile') || 'null');

export const isMockMode = () => _isMockMode;

export const registrar = async (email: string, senha: string, nome: string, tipo: UserType = 'usuario') => {
  const profile = userService.mockLogin(email, tipo);
  profile.nome = nome;
  localStorage.setItem('iara_user_profile', JSON.stringify(profile));
  mockUserInstance = profile;
  loginMock({ uid: profile.uid, email: profile.email });
  return profile;
};

export const login = async (email: string, senha: string) => {
  let mockType: UserType = 'usuario';
  if (email.includes('empresa')) mockType = 'empresa';
  else if (email.includes('terapeuta')) mockType = 'terapeuta';
  else if (email.includes('prefeitura')) mockType = 'prefeitura';
  
  const profile = userService.mockLogin(email, mockType);
  mockUserInstance = profile;
  loginMock({ uid: profile.uid, email: profile.email });
  return { user: { uid: profile.uid } };
};

export const logout = async () => {
  localStorage.removeItem('iara_mock_user');
  localStorage.removeItem('iara_user_profile');
  mockUserInstance = null;
  await auth.signOut();
};

export const enterDemoMode = (tipo: UserType = 'usuario') => {
  const profile = userService.mockLogin(`demo-${tipo}@iara.com`, tipo);
  mockUserInstance = profile;
  loginMock({ uid: profile.uid, email: profile.email });
  return mockUserInstance;
};

export const getAuthenticatedUser = () => {
  return mockUserInstance;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (mockUserInstance && mockUserInstance.uid === uid) return mockUserInstance;
  const profile = userService.getUser();
  if (profile && profile.uid === uid) return profile;
  return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const profile = userService.getUser();
  if (profile && profile.uid === uid) {
    const updated = { ...profile, ...data };
    localStorage.setItem('iara_user_profile', JSON.stringify(updated));
    mockUserInstance = updated;
  }
};

export { auth };
