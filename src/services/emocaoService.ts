export function analisarEmocao(texto: string): "leve" | "moderado" | "alto" | "critico" {
  const t = texto.toLowerCase();

  if (
    t.includes("me matar") ||
    t.includes("acabar com tudo") ||
    t.includes("suicídio") ||
    t.includes("tirar minha vida")
  ) {
    return "critico";
  }

  if (
    t.includes("não aguento") ||
    t.includes("quero sumir") ||
    t.includes("desesperado")
  ) {
    return "alto";
  }

  if (
    t.includes("triste") ||
    t.includes("ansioso") ||
    t.includes("cansado") ||
    t.includes("angústia") ||
    t.includes("medo") ||
    t.includes("pânico")
  ) {
    return "moderado";
  }

  return "leve";
}
