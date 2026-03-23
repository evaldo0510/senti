export function gerarExercicio(tipo: string | null): string[] {
  if (tipo === "ansiedade") {
    return [
      "Vamos desacelerar juntos...",
      "Inspire lentamente pelo nariz...",
      "Segure por 3 segundos...",
      "Agora solte devagar pela boca...",
      "Seu corpo pode ir relaxando aos poucos..."
    ];
  }

  if (tipo === "crise") {
    return [
      "Olhe ao seu redor...",
      "Nomeie 3 coisas que você vê...",
      "Agora 2 coisas que você sente no corpo...",
      "E 1 som que você consegue ouvir...",
      "Você está aqui... agora..."
    ];
  }

  if (tipo === "pensamento") {
    return [
      "Perceba esse pensamento...",
      "Você não precisa lutar com ele...",
      "Deixe ele passar como uma nuvem...",
      "Você é maior do que isso..."
    ];
  }

  return [];
}
