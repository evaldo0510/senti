import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";

let app;
let analytics;
try {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.error("Failed to initialize Firebase:", e);
  // Inicializa com config vazia para evitar erros de referência, mas o app funcionará em modo mock
  app = initializeApp({
    apiKey: "mock",
    authDomain: "mock",
    projectId: "mock",
    appId: "mock"
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export let isFirebaseOffline = false;

async function testConnection() {
  try {
    // Tenta ler um documento inexistente apenas para testar a conexão
    await getDocFromServer(doc(db, 'test', 'connection'));
    isFirebaseOffline = false;
    console.log("Conexão com Firestore estabelecida com sucesso.");
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('api-key-not-valid'))) {
      isFirebaseOffline = true;
      console.error("Erro de configuração do Firebase: O cliente está offline ou a chave de API é inválida. Verifique as chaves no firebase-applet-config.json.");
    } else if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      // O banco de dados está online, mas as regras de segurança bloquearam a leitura.
      // Isso é esperado se as regras estiverem restritas.
      isFirebaseOffline = false;
      console.log("Conexão com Firestore estabelecida (acesso negado pelas regras de segurança, o que é normal).");
    }
    // Outros erros são esperados se o documento não existir
  }
}

testConnection();
