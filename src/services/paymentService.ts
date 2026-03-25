import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const paymentService = {
  createPreference: async (appointmentId: string, amount: number, description: string) => {
    const path = 'payment_preferences';
    try {
      // In a real app, this would call a backend that interacts with Mercado Pago API
      // For this demo, we'll simulate the creation and return a mock init_point
      const preferenceData = {
        appointmentId,
        amount,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      };
      
      const docRef = await addDoc(collection(db, path), preferenceData);
      
      // Mock Mercado Pago Checkout URL
      return {
        id: docRef.id,
        init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${docRef.id}`
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  processPayment: async (appointmentId: string, paymentMethod: string) => {
    const path = 'payments';
    try {
      const paymentData = {
        appointmentId,
        paymentMethod,
        status: 'approved',
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid
      };
      
      await addDoc(collection(db, path), paymentData);
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
