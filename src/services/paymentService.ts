import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const paymentService = {
  createCheckoutSession: async (appointmentId: string, therapistId: string, therapistName: string, price: number, time: string, date: string, discountPercentage: number = 0) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId,
          therapistName,
          price,
          time,
          date,
          appointmentId,
          discountPercentage
        }),
      });

      const data = await response.json();
      if (data.url) {
        return { url: data.url };
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (error) {
      console.error("Erro ao criar sessão de pagamento:", error);
      throw error;
    }
  },

  createJourneyCheckoutSession: async (userId: string, userEmail: string) => {
    try {
      const response = await fetch('/api/create-journey-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail
        }),
      });

      const data = await response.json();
      if (data.url) {
        return { url: data.url };
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento para jornada");
      }
    } catch (error) {
      console.error("Erro ao criar sessão de pagamento para jornada:", error);
      throw error;
    }
  }
};
