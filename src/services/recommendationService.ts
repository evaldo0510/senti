import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { userService } from './userService';
import { UserProfile } from '../types';

export interface UserRecommendationContext {
  userId?: string;
  sintomaOuObjetivo: string; // e.g. "ansiedade", "depressão"
  modalidadeDesejada?: "online" | "presencial" | "hibrido";
  cidade?: string;
  precoMaximo?: number;
  abordagemPreferida?: string;
  publicoAtendido?: string; // e.g. "Adultos", "Adolescentes"
}

export interface RecommendedTherapist {
  therapist: UserProfile;
  score: number; // Percentage or matching score
  matchReasons: string[];
}

export const recommendationService = {
  /**
   * Generates a scored list of therapists matching the given user context.
   * "A IA recomenda, o usuário decide."
   */
  generateRecommendations: async (context: UserRecommendationContext): Promise<RecommendedTherapist[]> => {
    try {
      // Get all active therapists
      const therapists = await userService.getTherapists();
      
      const scored: RecommendedTherapist[] = therapists.map(therapist => {
        let score = 50; // Starting score
        const matchReasons: string[] = [];

        // 1. Specialty / Goal Match (Highest Priority)
        const especialidadeSugerida = context.sintomaOuObjetivo.toLowerCase();
        const hasSpecialtyMatch = therapist.especialidades?.some(esp => 
          esp.toLowerCase().includes(especialidadeSugerida) || 
          especialidadeSugerida.includes(esp.toLowerCase())
        );

        if (hasSpecialtyMatch) {
          score += 25;
          matchReasons.push("Especialista no tema de sua queixa principal");
        }

        // 2. Approach Match (Medium Priority)
        if (context.abordagemPreferida && therapist.abordagem) {
          if (therapist.abordagem.toLowerCase() === context.abordagemPreferida.toLowerCase()) {
            score += 15;
            matchReasons.push(`Atua com a abordagem desejada (${therapist.abordagem})`);
          }
        }

        // 3. Modality Match
        if (context.modalidadeDesejada) {
          if (context.modalidadeDesejada === "online" && therapist.online) {
            score += 10;
            matchReasons.push("Atendimento online ativo");
          } else if (context.modalidadeDesejada === "presencial" && context.cidade && therapist.cidade) {
            if (therapist.cidade.toLowerCase() === context.cidade.toLowerCase()) {
              score += 15;
              matchReasons.push(`Atendimento presencial disponível na sua cidade (${therapist.cidade})`);
            }
          }
        }

        // 4. Price Match
        if (context.precoMaximo && therapist.preco) {
          if (therapist.preco <= context.precoMaximo) {
            score += 10;
            matchReasons.push(`Valor dentro do seu orçamento (R$ ${therapist.preco}/sessão)`);
          } else {
            score -= 15; // Penalty if above budget
          }
        }

        // 5. Rating (Quality boost)
        if (therapist.rating && therapist.rating >= 4.8) {
          score += 5;
          matchReasons.push("Altamente avaliado por outros pacientes");
        }

        // Clip score between 0 and 100
        const finalScore = Math.min(100, Math.max(0, score));

        return {
          therapist,
          score: finalScore,
          matchReasons: matchReasons.length > 0 ? matchReasons : ["Perfil geral compatível"]
        };
      });

      // Sort by score descending
      return scored.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  },

  /**
   * Logs a generated recommendation session for analytics and feedback.
   */
  logRecommendationSession: async (userId: string, context: UserRecommendationContext, recommendedUids: string[]) => {
    try {
      const recCollection = collection(db, "recommendations");
      await addDoc(recCollection, {
        userId,
        context,
        recommendedUids,
        timestamp: Timestamp.now(),
        source: "SentiCore_Engine"
      });
    } catch (e) {
      console.warn("Could not log recommendation session to firestore:", e);
    }
  },

  /**
   * Registers a direct referral from IARA or the SentiCore engine to a therapist.
   * Confirms patient's consent.
   */
  createReferral: async (userId: string, therapistId: string, consentGranted: boolean, source: string = "IARA_Chat") => {
    try {
      const referralsCol = collection(db, "referrals");
      const referralDoc = {
        userId,
        therapistId,
        consentGranted,
        source,
        status: "pending_contact",
        timestamp: Timestamp.now()
      };
      
      const docRef = await addDoc(referralsCol, referralDoc);
      return { id: docRef.id, ...referralDoc };
    } catch (e) {
      console.error("Error creating referral in firestore:", e);
      return null;
    }
  },

  /**
   * Fetches the referrals linked to a specific therapist.
   */
  getReferralsForTherapist: async (therapistId: string) => {
    try {
      const q = query(
        collection(db, "referrals"),
        where("therapistId", "==", therapistId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Error fetching referrals for therapist:", e);
      return [];
    }
  }
};
