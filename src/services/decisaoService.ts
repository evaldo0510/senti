export function decidirCaminho(antes: string, depois: string): "continuar" | "terapeuta" | "psicologo" | "psiquiatra" | "emergencia" {
  if (depois === "critico" || antes === "critico") return "psiquiatra";

  if (depois === "alto") return "psicologo";

  if (antes === "moderado" && depois !== "leve") {
    return "terapeuta";
  }

  if (depois === "leve") {
    return "continuar";
  }

  return "terapeuta";
}
