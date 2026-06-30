import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  addDoc,
  orderBy
} from 'firebase/firestore';
import { Organization, UserProfile, OrganizationInvite, InstitutionProgram, InstitutionalContract } from '../types';

export const organizationService = {
  getOrganization: async (id: string): Promise<Organization | null> => {
    const path = `organizations/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'organizations', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Organization;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  createOrganization: async (org: Omit<Organization, 'createdAt' | 'active'>): Promise<Organization> => {
    const path = `organizations/${org.id}`;
    const newOrg: Organization = {
      ...org,
      active: true,
      createdAt: new Date().toISOString(),
      indicadores: {
        totalConsultas: 0,
        humorMedio: 7.5,
        nivelEstresse: 3.2,
        totalMensagensIara: 0
      }
    };
    try {
      await setDoc(doc(db, 'organizations', org.id), newOrg);
      return newOrg;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateOrganization: async (id: string, data: Partial<Organization>): Promise<void> => {
    const path = `organizations/${id}`;
    try {
      await updateDoc(doc(db, 'organizations', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  listOrganizations: async (): Promise<Organization[]> => {
    const path = 'organizations';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
    } catch (error) {
      // Fallback if index on createdAt is missing or on error
      try {
        const snapshot = await getDocs(collection(db, path));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
        return [];
      }
    }
  },

  linkUserToOrganization: async (userId: string, tenantId: string | null): Promise<void> => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        tenantId: tenantId || null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  getOrganizationUsers: async (tenantId: string): Promise<UserProfile[]> => {
    const path = 'users';
    try {
      const q = query(
        collection(db, path),
        where('tenantId', '==', tenantId),
        where('tipo', '==', 'usuario')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getOrganizationTherapists: async (tenantId: string): Promise<UserProfile[]> => {
    const path = 'users';
    try {
      const q = query(
        collection(db, path),
        where('tenantId', '==', tenantId),
        where('tipo', '==', 'terapeuta')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  /**
   * Recalculates indicators for a tenant completely anonymized
   * preserving user privacy but providing valuable insights to prefeituras/empresas
   */
  updateAggregatedIndicators: async (tenantId: string): Promise<Organization['indicadores']> => {
    try {
      const users = await organizationService.getOrganizationUsers(tenantId);
      const userIds = users.map(u => u.uid);

      if (userIds.length === 0) {
        const fallback = { totalConsultas: 0, humorMedio: 7.0, nivelEstresse: 3.0, totalMensagensIara: 0 };
        await organizationService.updateOrganization(tenantId, { indicadores: fallback });
        return fallback;
      }

      // Query appointments for users in this tenant
      let totalConsultas = 0;
      try {
        const apptsQuery = query(collection(db, 'appointments'), where('tenantId', '==', tenantId));
        const apptsSnapshot = await getDocs(apptsQuery);
        totalConsultas = apptsSnapshot.size;
      } catch (err) {
        console.warn("Erro ao buscar agendamentos para indicadores:", err);
      }

      // Fetch emotion logs for average mood and stress
      let sumMood = 0;
      let countMood = 0;
      let sumStress = 0;
      let countStress = 0;

      // Query emotion logs filtered by tenantId for strict multitenancy security and performance
      try {
        const qLogs = query(collection(db, 'emotion_logs'), where('tenantId', '==', tenantId));
        const logsSnapshot = await getDocs(qLogs);
        let tenantLogs = logsSnapshot.docs.map(doc => doc.data());

        // Fallback for older legacy logs that lack the tenantId field
        if (tenantLogs.length === 0) {
          try {
            const allLogsSnap = await getDocs(collection(db, 'emotion_logs'));
            tenantLogs = allLogsSnap.docs
              .map(doc => doc.data())
              .filter(log => userIds.includes(log.userId));
          } catch (fallbackErr) {
            console.warn("Legacy fallback failed (expected under strict security rules):", fallbackErr);
          }
        }

        tenantLogs.forEach(log => {
          if (log.value !== undefined) {
            sumMood += log.value;
            countMood++;
          }
          if (log.intensity !== undefined) {
            // intensity is used as stress level in distress logs
            sumStress += log.intensity;
            countStress++;
          }
        });
      } catch (err) {
        console.warn("Erro ao processar logs de emoções para indicadores:", err);
      }

      const humorMedio = countMood > 0 ? parseFloat((sumMood / countMood).toFixed(1)) : 7.0;
      const nivelEstresse = countStress > 0 ? parseFloat((sumStress / countStress).toFixed(1)) : 3.0;

      // Recalculate Iara interactions if available
      let totalMensagensIara = 0;
      users.forEach(u => {
        totalMensagensIara += u.iaraChatCount || 0;
      });

      const indicadores = {
        totalConsultas,
        humorMedio,
        nivelEstresse,
        totalMensagensIara
      };

      await organizationService.updateOrganization(tenantId, { indicadores });
      return indicadores;
    } catch (error) {
      console.error("Erro ao atualizar indicadores agregados:", error);
      throw error;
    }
  },

  // --- INSTITUTION PROGRAMS OPS ---
  getPrograms: async (tenantId: string): Promise<InstitutionProgram[]> => {
    const path = 'institutionPrograms';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionProgram));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  createProgram: async (program: Omit<InstitutionProgram, 'id' | 'createdAt'>): Promise<InstitutionProgram> => {
    const path = 'institutionPrograms';
    try {
      const newDocRef = doc(collection(db, path));
      const newProgram: InstitutionProgram = {
        ...program,
        id: newDocRef.id,
        active: true,
        activeUsersCount: 0,
        participationRate: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(newDocRef, newProgram);
      return newProgram;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateProgram: async (programId: string, data: Partial<InstitutionProgram>): Promise<void> => {
    const path = `institutionPrograms/${programId}`;
    try {
      await updateDoc(doc(db, 'institutionPrograms', programId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  deleteProgram: async (programId: string): Promise<void> => {
    const path = `institutionPrograms/${programId}`;
    try {
      await updateDoc(doc(db, 'institutionPrograms', programId), { active: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // --- ORGANIZATION INVITES OPS ---
  getInvites: async (tenantId: string): Promise<OrganizationInvite[]> => {
    const path = 'organizationInvites';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrganizationInvite));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  createInvite: async (invite: Omit<OrganizationInvite, 'id' | 'createdAt' | 'status'>): Promise<OrganizationInvite> => {
    const path = 'organizationInvites';
    try {
      const newDocRef = doc(collection(db, path));
      const newInvite: OrganizationInvite = {
        ...invite,
        id: newDocRef.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(newDocRef, newInvite);
      return newInvite;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateInviteStatus: async (inviteId: string, status: 'pending' | 'accepted' | 'expired'): Promise<void> => {
    const path = `organizationInvites/${inviteId}`;
    try {
      await updateDoc(doc(db, 'organizationInvites', inviteId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // --- CONTRACTS OPS ---
  getContracts: async (tenantId: string): Promise<InstitutionalContract[]> => {
    const path = 'contracts';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionalContract));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  createContract: async (contract: Omit<InstitutionalContract, 'id' | 'createdAt'>): Promise<InstitutionalContract> => {
    const path = 'contracts';
    try {
      const newDocRef = doc(collection(db, path));
      const newContract: InstitutionalContract = {
        ...contract,
        id: newDocRef.id,
        createdAt: new Date().toISOString()
      };
      await setDoc(newDocRef, newContract);
      return newContract;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateContract: async (contractId: string, data: Partial<InstitutionalContract>): Promise<void> => {
    const path = `contracts/${contractId}`;
    try {
      await updateDoc(doc(db, 'contracts', contractId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }
};
