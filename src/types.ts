export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'iara';
  timestamp: Date;
}

export interface MoodEntry {
  id: string;
  value: number; // 0-10
  note?: string;
  timestamp: Date;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  price: number;
  online: boolean;
  imageUrl: string;
  rating: number;
}

export type AppRoute = 'home' | 'chat' | 'terapeutas' | 'diario' | 'perfil' | 'guided-flow';
