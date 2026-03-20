import { MoodEntry, Therapist } from '../types';

const STORAGE_KEY_MOOD = 'iara_mood_history';

export const userService = {
  saveMood: (value: number, note?: string) => {
    const history = userService.getMoodHistory();
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      value,
      note,
      timestamp: new Date(),
    };
    localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify([...history, newEntry]));
    return newEntry;
  },

  getMoodHistory: (): MoodEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY_MOOD);
    if (!data) return [];
    return JSON.parse(data).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  },

  getTherapists: (): Therapist[] => [
    {
      id: '1',
      name: 'Dra. Ana Silva',
      specialty: 'Ansiedade e Trauma',
      price: 120,
      online: true,
      imageUrl: 'https://picsum.photos/seed/ana/200',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendes',
      specialty: 'Depressão e Luto',
      price: 100,
      online: true,
      imageUrl: 'https://picsum.photos/seed/carlos/200',
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Dra. Beatriz Rocha',
      specialty: 'Relacionamentos',
      price: 150,
      online: false,
      imageUrl: 'https://picsum.photos/seed/beatriz/200',
      rating: 5.0,
    },
    {
      id: '4',
      name: 'Dr. Ricardo Lima',
      specialty: 'Foco e Performance',
      price: 90,
      online: true,
      imageUrl: 'https://picsum.photos/seed/ricardo/200',
      rating: 4.7,
    },
  ]
};
