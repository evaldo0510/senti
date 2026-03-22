export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'iara';
  timestamp: Date;
  audioUrl?: string;
  suggestions?: { label: string; action: string }[];
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

export interface Appointment {
  id: string;
  patientId: string;
  patientNome: string;
  therapistId: string;
  therapistNome: string;
  date: string; // ISO string
  slot: string; // '09:00'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string; // ISO string
  appointmentId?: string;
}

export type AppRoute = 'home' | 'chat' | 'terapeutas' | 'diario' | 'perfil' | 'guided-flow' | 'sensorial' | 'login' | 'dashboard' | 'terapeuta-panel' | 'empresa-panel' | 'prefeitura-panel';

export type UserType = 'usuario' | 'terapeuta' | 'empresa' | 'prefeitura';

export interface Availability {
  day: string; // 'segunda', 'terça', etc.
  slots: string[]; // ['09:00', '10:00', etc.]
}

export interface Avaliacao {
  userId: string;
  userName?: string;
  nota: number;
  comentario?: string;
  data: string;
}

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  tipo: UserType;
  createdAt: string;
  // Campos para terapeutas
  especialidades?: string[];
  preco?: number;
  disponibilidade?: Availability[];
  biografia?: string;
  fotoUrl?: string;
  rating?: number;
  avaliacoes?: Avaliacao[];
  // Campos para pacientes
  favoritos?: string[]; // Array of therapist UIDs
}
