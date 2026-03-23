export function encontrarTerapeuta(mensagem: string) {
  const lista = JSON.parse(localStorage.getItem("terapeutas_cadastrados") || "[]");
  
  // Add some hardcoded ones for fallback
  const fallback = [
    { nome: "Dra. Ana Silva", especialidade: "Ansiedade" },
    { nome: "Dr. Carlos Mendes", especialidade: "Depressão" }
  ];

  const todos = [...lista, ...fallback];
  const msgLower = mensagem.toLowerCase();

  if (msgLower.includes("ansiedade") || msgLower.includes("nervoso") || msgLower.includes("medo")) {
    return todos.find(t => t.especialidade.toLowerCase().includes("ansiedade") || t.especialidade.toLowerCase().includes("tcc")) || todos[0];
  }

  if (msgLower.includes("triste") || msgLower.includes("depressão") || msgLower.includes("desânimo")) {
    return todos.find(t => t.especialidade.toLowerCase().includes("depressão") || t.especialidade.toLowerCase().includes("psicanalista")) || todos[0];
  }

  return todos[0];
}
