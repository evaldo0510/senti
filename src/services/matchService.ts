export function encontrarTerapeutas(mensagem: string) {
  const lista = JSON.parse(localStorage.getItem("terapeutas_cadastrados") || "[]");
  
  // Add some hardcoded ones for fallback
  const fallback = [
    { nome: "Dra. Ana Silva", especialidade: "Ansiedade" },
    { nome: "Dr. Carlos Mendes", especialidade: "Depressão" },
    { nome: "Dra. Juliana Costa", especialidade: "TCC" },
    { nome: "Dr. Ricardo Oliveira", especialidade: "Psicanalista" }
  ];

  const todos = [...lista, ...fallback];
  const msgLower = mensagem.toLowerCase();

  let matches = [];

  if (msgLower.includes("ansiedade") || msgLower.includes("nervoso") || msgLower.includes("medo") || msgLower.includes("pânico")) {
    matches = todos.filter(t => 
      t.especialidade.toLowerCase().includes("ansiedade") || 
      t.especialidade.toLowerCase().includes("tcc")
    );
  } else if (msgLower.includes("triste") || msgLower.includes("depressão") || msgLower.includes("desânimo") || msgLower.includes("luto")) {
    matches = todos.filter(t => 
      t.especialidade.toLowerCase().includes("depressão") || 
      t.especialidade.toLowerCase().includes("psicanalista")
    );
  }

  // Se não encontrar matches específicos, retorna os primeiros da lista como sugestão geral
  if (matches.length === 0) {
    return todos.slice(0, 2);
  }

  return matches;
}
