export interface JourneyDay {
  day: number;
  title: string;
  pill: string;
  audioUrl: string;
  audioScript: string;
  exercise: string;
  action: string;
  week: number;
  phase: string;
}

export const journey21: JourneyDay[] = [
  {
    day: 1,
    week: 1,
    phase: "CONSCIÊNCIA",
    title: "Observar sem Resolver",
    pill: "Nem tudo que você sente precisa ser resolvido hoje.",
    audioUrl: "/audios/dia1.mp3",
    audioScript: "Hoje você não precisa resolver tudo… Só precisa perceber… O que está aí dentro… sem tentar mudar…",
    exercise: "Escreva em poucas palavras o que está sentindo agora, sem julgar.",
    action: "Escolha uma situação hoje para apenas observar sua reação, sem intervir."
  },
  {
    day: 2,
    week: 1,
    phase: "CONSCIÊNCIA",
    title: "O Observador Interno",
    pill: "Você não é a emoção… você é quem percebe.",
    audioUrl: "/audios/dia2.mp3",
    audioScript: "Existe uma parte em você… que observa… E essa parte… não está em crise…",
    exercise: "Feche os olhos por 1 minuto e tente localizar 'quem' está observando seus pensamentos.",
    action: "Sempre que sentir algo forte, diga: 'Eu estou percebendo essa emoção'."
  },
  {
    day: 3,
    week: 1,
    phase: "CONSCIÊNCIA",
    title: "O Ritmo do Corpo",
    pill: "O corpo sente antes da mente entender.",
    audioUrl: "/audios/dia3.mp3",
    audioScript: "Agora… vamos juntos… inspira lentamente… segura um instante… e solta devagar…",
    exercise: "Faça 3 ciclos de respiração consciente (4-2-6).",
    action: "Perceba em que parte do corpo a ansiedade ou o estresse 'mora' hoje."
  },
  // ... more days will be added or looped for demo
  {
    day: 8,
    week: 2,
    phase: "REPROGRAMAÇÃO",
    title: "O Poder do Significado",
    pill: "O significado que você dá… muda o que você sente.",
    audioUrl: "/audios/dia8.mp3",
    audioScript: "Talvez não seja o que aconteceu… Mas o que isso representa…",
    exercise: "Pegue um evento chato de hoje e tente dar um significado novo a ele.",
    action: "Questione seu primeiro pensamento automático diante de um problema."
  },
  {
    day: 21,
    week: 3,
    phase: "CONSOLIDAÇÃO",
    title: "A Liberdade de Escolha",
    pill: "Agora você não reage… você escolhe.",
    audioUrl: "/audios/dia21.mp3",
    audioScript: "Você chegou até aqui… e talvez você não tenha percebido ainda… mas algo já mudou…",
    exercise: "Escreva uma carta para o seu 'eu' de 21 dias atrás.",
    action: "Comemore seu progresso. Você agora tem uma nova ferramenta interna."
  }
];

// Helper to get day data, with fallback for demo
export const getDayData = (day: number): JourneyDay => {
  const found = journey21.find(d => d.day === day);
  if (found) return found;
  // Fallback for demo if day is not fully defined
  return {
    ...journey21[0],
    day,
    title: `Dia ${day} - Evoluindo`,
    week: Math.ceil(day / 7),
    phase: day <= 7 ? "CONSCIÊNCIA" : day <= 14 ? "REPROGRAMAÇÃO" : "CONSOLIDAÇÃO"
  };
};
