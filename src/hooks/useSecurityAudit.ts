import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useCallback } from 'react';

export type AuditAction = 'login' | 'logout' | 'alteracao_senha' | 'exportacao_dados' | 'visualizacao_dados' | 'falha_seguranca';

export function useSecurityAudit() {
  const logSecurityEvent = useCallback(async (
    action: AuditAction | string,
    description: string,
    fieldsChanged: string[] = [],
    status: 'sucesso' | 'erro' = 'sucesso'
  ) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Cannot write security audit: No authenticated user.');
        return;
      }

      const logData = {
        userId: user.uid,
        userEmail: user.email || 'unknown',
        action,
        description,
        fieldsChanged,
        status,
        timestamp: new Date().toISOString(),
        clientTimestamp: new Date().toISOString(),
      };

      // Write directly to Firestore audit_logs collection (Immutable Client Write)
      await addDoc(collection(db, 'audit_logs'), logData);
      console.log(`[Security Audit] Directly logged to Firestore: ${action} (${status})`);
    } catch (error) {
      console.error('Error logging security audit directly to Firestore:', error);
    }
  }, []);

  return { logSecurityEvent };
}
