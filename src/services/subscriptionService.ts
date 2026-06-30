import { db, auth } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { 
  UserProfile, 
  FinancialSubscription, 
  SubscriptionStatus, 
  PaymentRecord, 
  TransactionRecord, 
  InvoiceRecord,
  BillingEventRecord,
  CommissionRecord
} from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

export const subscriptionService = {
  /**
   * Cria uma nova assinatura no banco e atualiza o perfil do usuário
   */
  createSubscription: async (
    userId: string,
    planId: string,
    amount: number,
    period: 'monthly' | 'annual' | 'colaborador' | 'estudante' | 'contrato',
    provider: 'stripe' | 'mercadopago' | 'simulated'
  ): Promise<FinancialSubscription> => {
    const subId = generateId('SUB');
    const paymentId = generateId('PAY');
    const now = new Date();
    const currentPeriodEnd = new Date();
    if (period === 'annual') {
      currentPeriodEnd.setFullYear(now.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(now.getMonth() + 1);
    }

    const subscription: FinancialSubscription = {
      id: subId,
      userId,
      planId,
      status: 'active',
      amount,
      period,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      gatewayId: `GATE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentProvider: provider,
      createdAt: now.toISOString()
    };

    // 1. Gravar Assinatura
    const subPath = `subscriptions/${subId}`;
    try {
      await setDoc(doc(db, "subscriptions", subId), subscription);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, subPath);
    }

    // 2. Gravar Registro de Pagamento
    const payment: PaymentRecord = {
      id: paymentId,
      userId,
      amount,
      status: 'success',
      provider,
      subId,
      type: 'subscription',
      createdAt: now.toISOString()
    };
    const payPath = `payments/${paymentId}`;
    try {
      await setDoc(doc(db, "payments", paymentId), payment);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, payPath);
    }

    // 3. Gravar Transação
    const transactionId = generateId('TX');
    const transaction: TransactionRecord = {
      id: transactionId,
      userId,
      type: 'credit',
      amount,
      description: `Assinatura de plano ${planId}`,
      referenceId: paymentId,
      referenceType: 'subscription',
      status: 'completed',
      createdAt: now.toISOString()
    };
    const txPath = `transactions/${transactionId}`;
    try {
      await setDoc(doc(db, "transactions", transactionId), transaction);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, txPath);
    }

    // 4. Gravar Fatura (Invoice)
    const invoiceId = generateId('INV');
    const invoice: InvoiceRecord = {
      id: invoiceId,
      userId,
      subscriptionId: subId,
      paymentId,
      amount,
      status: 'paid',
      invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      dueDate: now.toISOString(),
      paidAt: now.toISOString(),
      pdfUrl: `/invoices/${invoiceId}.pdf`,
      createdAt: now.toISOString()
    };
    const invPath = `invoices/${invoiceId}`;
    try {
      await setDoc(doc(db, "invoices", invoiceId), invoice);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, invPath);
    }

    // 5. Registrar evento de faturamento
    const eventId = generateId('EVT');
    const billingEvent: BillingEventRecord = {
      id: eventId,
      userId,
      eventType: 'subscription.created',
      payload: { subId, planId, amount, provider },
      createdAt: now.toISOString()
    };
    const evtPath = `billingEvents/${eventId}`;
    try {
      await setDoc(doc(db, "billingEvents", eventId), billingEvent);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, evtPath);
    }

    // 6. Atualizar as permissões no Perfil de Usuário
    await subscriptionService.updatePermissions(userId, planId as any, 'active');

    return subscription;
  },

  /**
   * Verifica o status da assinatura do usuário
   */
  checkSubscriptionStatus: async (userId: string): Promise<{
    status: SubscriptionStatus;
    plan: string;
    trialRemainingDays: number;
    hasPremiumAccess: boolean;
  }> => {
    try {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        return { status: 'expired', plan: 'trial', trialRemainingDays: 0, hasPremiumAccess: false };
      }
      const profile = snap.data() as UserProfile;
      const status = profile.subscriptionStatus || 'trial';
      const plan = profile.subscriptionPlan || 'trial';

      let trialRemainingDays = 0;
      if (status === 'trial' && profile.trialEndDate) {
        const end = new Date(profile.trialEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        trialRemainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      const hasPremiumAccess = 
        profile.tipo === "admin" || 
        profile.tipo === "super_admin" || 
        status === 'active' || 
        (status === 'trial' && (trialRemainingDays > 0 || !profile.trialEndDate));

      return {
        status,
        plan,
        trialRemainingDays,
        hasPremiumAccess
      };
    } catch (e) {
      console.error("Erro ao verificar assinatura:", e);
      return { status: 'expired', plan: 'trial', trialRemainingDays: 0, hasPremiumAccess: false };
    }
  },

  /**
   * Renova uma assinatura existente estendendo o período de vencimento
   */
  renewSubscription: async (userId: string): Promise<any> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("Usuário não encontrado");
      const profile = userSnap.data() as UserProfile;

      if (!profile.subscriptionId) throw new Error("Usuário não possui uma assinatura vinculada");

      const now = new Date();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      // Atualiza o documento de perfil
      const userUpdate = {
        subscriptionStatus: "active" as const,
        lastPayment: now.toISOString(),
        nextBilling: nextBillingDate.toISOString()
      };
      await updateDoc(userRef, userUpdate);

      // Grava o pagamento e a transação correspondente
      const paymentId = generateId('PAY');
      const amount = profile.subscriptionPlan === 'enterprise' ? 99.90 : 39.90;
      const payment: PaymentRecord = {
        id: paymentId,
        userId,
        amount,
        status: 'success',
        provider: profile.paymentProvider || 'simulated',
        subId: profile.subscriptionId,
        type: 'subscription',
        createdAt: now.toISOString()
      };
      await setDoc(doc(db, "payments", paymentId), payment);

      // Gravar transação
      const transactionId = generateId('TX');
      await setDoc(doc(db, "transactions", transactionId), {
        id: transactionId,
        userId,
        type: 'credit',
        amount,
        description: `Renovação de plano ${profile.subscriptionPlan}`,
        referenceId: paymentId,
        referenceType: 'subscription',
        status: 'completed',
        createdAt: now.toISOString()
      } as TransactionRecord);

      // Evento de renovação
      const eventId = generateId('EVT');
      await setDoc(doc(db, "billingEvents", eventId), {
        id: eventId,
        userId,
        eventType: 'subscription.renewed',
        payload: { subId: profile.subscriptionId, planId: profile.subscriptionPlan, amount },
        createdAt: now.toISOString()
      } as BillingEventRecord);

      return userUpdate;
    } catch (e) {
      console.error("Erro ao renovar assinatura:", e);
      throw e;
    }
  },

  /**
   * Cancela uma assinatura, mudando seu status no perfil e eventos
   */
  cancelSubscription: async (userId: string): Promise<any> => {
    const userRef = doc(db, "users", userId);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("Usuário não encontrado");
      const profile = userSnap.data() as UserProfile;

      const subscriptionData = {
        subscriptionStatus: "cancelled" as const,
        nextBilling: ""
      };
      await updateDoc(userRef, subscriptionData);

      // Registrar o cancelamento em billingEvents
      const eventId = generateId('EVT');
      await setDoc(doc(db, "billingEvents", eventId), {
        id: eventId,
        userId,
        eventType: 'subscription.cancelled',
        payload: { subId: profile.subscriptionId || "unknown", planId: profile.subscriptionPlan },
        createdAt: new Date().toISOString()
      } as BillingEventRecord);

      return subscriptionData;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  },

  /**
   * Expira a assinatura do usuário de forma imediata
   */
  expireSubscription: async (userId: string): Promise<any> => {
    const userRef = doc(db, "users", userId);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("Usuário não encontrado");
      const profile = userSnap.data() as UserProfile;

      const subscriptionData = {
        subscriptionStatus: "expired" as const,
        nextBilling: ""
      };
      await updateDoc(userRef, subscriptionData);

      const eventId = generateId('EVT');
      await setDoc(doc(db, "billingEvents", eventId), {
        id: eventId,
        userId,
        eventType: 'subscription.expired',
        payload: { subId: profile.subscriptionId || "unknown", planId: profile.subscriptionPlan },
        createdAt: new Date().toISOString()
      } as BillingEventRecord);

      return subscriptionData;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  },

  /**
   * Atualiza as permissões no Firestore para o usuário
   */
  updatePermissions: async (
    userId: string,
    planId: 'trial' | 'premium' | 'professional' | 'enterprise',
    status: SubscriptionStatus
  ): Promise<void> => {
    const userRef = doc(db, "users", userId);
    const now = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    try {
      await updateDoc(userRef, {
        subscriptionStatus: status,
        subscriptionPlan: planId,
        lastPayment: now.toISOString(),
        nextBilling: status === 'active' ? nextBillingDate.toISOString() : ""
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  },

  /**
   * Retorna os dias restantes de teste
   */
  getRemainingTrialDays: (profile: UserProfile | null): number => {
    if (!profile) return 0;
    if (profile.subscriptionStatus !== "trial") return 0;
    if (!profile.trialEndDate) return 7; // Padrão: 7 dias caso indefinido
    const end = new Date(profile.trialEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
};

/**
 * FEATURE GATE
 * Controle centralizado de acessibilidade a recursos
 */
export const FeatureGate = {
  /**
   * Verifica permissões genéricas baseado em uma chave de recurso
   */
  canAccess: (profile: UserProfile | null, feature: 'google_live' | 'premium_programs' | 'reports' | 'unlimited_iara' | 'clinical_notes' | 'calendar_sync'): boolean => {
    if (!profile) return false;
    
    // Admin tem passe livre absoluto
    if (profile.tipo === 'admin' || profile.tipo === 'super_admin') return true;

    const plan = profile.subscriptionPlan || 'trial';
    const status = profile.subscriptionStatus || 'trial';

    // Se está expirado ou cancelado (e passou do prazo), não tem acesso premium
    const isPremiumActive = 
      status === 'active' || 
      (status === 'trial' && (!profile.trialEndDate || new Date(profile.trialEndDate) > new Date()));

    switch (feature) {
      case 'google_live':
        // Apenas Premium, Professional Pro, Clínicas ou parceiros institucionais
        return isPremiumActive && plan !== 'trial';
      
      case 'premium_programs':
        // Premium, Família, Pro, etc.
        return isPremiumActive && plan !== 'trial';

      case 'reports':
        // Apenas premium/pro/corporate
        return isPremiumActive && plan !== 'trial';

      case 'unlimited_iara':
        // Texto ilimitado e voz avançada
        return isPremiumActive && plan !== 'trial';

      case 'clinical_notes':
        // Disponível apenas para profissionais no plano Pro ou Clínicas
        return (profile.tipo === 'terapeuta' && plan === 'professional') || profile.tipo === 'clinica';

      case 'calendar_sync':
        // Sincronização Google Calendar avançada para terapeutas Pro ou Clínicas
        return (profile.tipo === 'terapeuta' && plan === 'professional') || profile.tipo === 'clinica';

      default:
        return false;
    }
  }
};
