import { UserProfile } from '../types';

export const MOCK_THERAPISTS: UserProfile[] = [
  {
    uid: 'therapist-1',
    nome: 'Dra. Ana Silva',
    email: 'ana.silva@exemplo.com',
    tipo: 'terapeuta',
    createdAt: new Date().toISOString(),
    especialidades: ['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental'],
    preco: 120,
    biografia: 'Especialista em transtornos de ansiedade com mais de 10 anos de experiência.',
    fotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    rating: 4.9,
    avaliacoes: [
      { userId: 'u1', userName: 'João', nota: 5, comentario: 'Excelente profissional!', data: new Date().toISOString() }
    ]
  },
  {
    uid: 'therapist-2',
    nome: 'Dr. Marcos Oliveira',
    email: 'marcos.oliveira@exemplo.com',
    tipo: 'terapeuta',
    createdAt: new Date().toISOString(),
    especialidades: ['Relacionamentos', 'Estresse', 'Luto'],
    preco: 150,
    biografia: 'Focado em ajudar pessoas a superarem momentos difíceis e transições de vida.',
    fotoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
    rating: 4.7,
    avaliacoes: []
  },
  {
    uid: 'therapist-3',
    nome: 'Dra. Beatriz Costa',
    email: 'beatriz.costa@exemplo.com',
    tipo: 'terapeuta',
    createdAt: new Date().toISOString(),
    especialidades: ['Trauma', 'Autoconhecimento', 'Mindfulness'],
    preco: 130,
    biografia: 'Praticante de mindfulness e especialista em terapias integrativas.',
    fotoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
    rating: 4.8,
    avaliacoes: []
  }
];
