# SENTIPAE PLATFORM — EXECUTIVE DOCUMENTATION
## Master Plan 2035: Diretrizes, Jornadas, Design System & Banco de Dados

Este documento reúne as especificações estratégicas, técnicas e de produto que servem como fundação para a expansão e integridade do ecossistema SentiPae.

---

## 📄 DOCUMENTO 1: DIRETRIZES E REGRAS DE NEGÓCIO DA IA (IARA)

A **IARA (Inteligência de Acolhimento e Recomendador de Apoio)** é a recepcionista inteligente do ecossistema SentiPae. Ela atua estritamente na facilitação e coordenação da jornada, mantendo o cuidado e a responsabilidade clínica com os seres humanos habilitados.

### 1. O Princípio de Não-Diagnóstico (Zero Medicalização)
* **Regra de Ouro**: A IARA nunca emitirá hipóteses diagnósticas (ex: *"Você tem depressão"*, *"Isso parece ansiedade crônica"*) nem sugerirá intervenções farmacológicas.
* **Abordagem Linguística**: A IA utiliza linguagem descritiva e fenomenológica, focando na experiência imediata do usuário.
  * *Incorreto*: "Acho que seu nível de cortisol está alto, tome remédio X."
  * *Correto*: "Percebo que suas noites têm sido agitadas e que há um aperto físico no seu peito. Vamos desacelerar?"
* **Isenção de Responsabilidade**: Toda conversa com teor emocional relevante deve ser acompanhada de uma nota flutuante discreta ou lembrete de que o suporte da IA não substitui a psicoterapia ou consulta psiquiátrica.

### 2. Triagem e Categorização Dinâmica de Urgências
A IARA processa o texto e a voz do usuário para categorizar o nível de atenção necessário em tempo real:

| Nível de Urgência | Gatilhos Linguísticos | Ação do Sistema (Workflow) |
| :--- | :--- | :--- |
| **Nível 1 (Verde) - Estável** | Cansaço leve, tédio, curiosidade, rotina, metas diárias. | Encaminha para o **Diário Emocional**, sugere práticas no **Espaço Inspirar** (Poesia PCH) ou exercícios de atenção plena. |
| **Nível 2 (Amarelo) - Atenção** | Angústia moderada, estresse do trabalho, insônia recente, termos como *"sobrecarregado"*, *"triste"*, *"sem rumo"*. | Recomenda sintonização de respiração guiada, sugere o preenchimento do **IBS** e apresenta a **Rede de Especialistas** (matchmaking terapêutico). |
| **Nível 3 (Vermelho) - Crise** | Ideação de autoflagelo, desamparo profundo, pânico agudo, termos como *"não aguento mais"*, *"fim de tudo"*, *"socorro"*. | **Bloqueio imediato da IA**: IARA exibe o card de acolhimento emergencial, ativa o botão **SOS**, exibe telefones públicos de suporte (CVV - 188) e notifica o terapeuta vinculado ou moderador da instituição. |

### 3. Mecanismo de Matchmaking Multidisciplinar
Diferente de marketplaces tradicionais baseados apenas em preço ou especialidade cirúrgica, o matchmaking do SentiPae é holístico:
* **Cruzamento de Preferências**: Combina a queixa do usuário (ex: luto, carreira, relacionamento) com a linha clínica do terapeuta (ex: psicanálise lacaniana, TCC, gestalt-terapia).
* **Indicação Inteligente**: Quando apropriado e o usuário autorizar, o SentiCore sugere caminhos complementares:
  * Psicólogo ou Psicanalista (para dor existencial e estruturação subjetiva).
  * Nutricionista (se houver relatos frequentes de compulsão ou letargia).
  * Educador Físico (se o fator "Energia" no IBS mantiver-se baixo por mais de 7 dias).
  * Assistente Social (se houver vulnerabilidade de direitos relatada no CAPS municipal).

---

## 🔄 DOCUMENTO 2: MAPEAMENTO DE FLUXO — JORNADA "COMO VOCÊ ESTÁ HOJE?"

Esta jornada substitui o fluxo transacional clássico por uma acolhida acolhedora que coloca a sensibilidade no centro da experiência.

```
       [ENTRADA DO USUÁRIO]
                │
                ▼
   Pergunta: "Como você está hoje?"
                │
         (Abertura Livre)
                │
                ▼
        [ANÁLISE COGNITIVA]
        (SentiCore / IARA)
                │
        ┌───────┴─────────────────────────────────┐
        ▼                                         ▼
[Indicação de Emergência]               [Análise de Sentimento]
(Gatilho Crise/Vermelho)                (Verde ou Amarelo)
        │                                         │
        ▼                                         ▼
   ┌───────────┐                         [Atualização do IBS]
   │  BOTÃO    │                     (Preenchimento dinâmico)
   │   SOS     │                                  │
   │  ATIVO    │               ┌──────────────────┼──────────────────┐
   └───────────┘               ▼                  ▼                  ▼
                         (Foco Poético)     (Foco Terapêutico)  (Foco Integrativo)
                               │                  │                  │
                               ▼                  ▼                  ▼
                       [Espaço Inspirar]   [Rede Especialistas]  [Diário/Hábitos]
                       - Poesias PCH       - Psicoterapia        - Registro
                       - Escrita Guiada    - Teleconsulta        - Exercícios
```

### Passo a Passo Detalhado do Fluxo

#### 1. O Ponto de Partida (Acolhida)
* O usuário abre o aplicativo e, ao invés de ver um grid confuso de ferramentas, visualiza um cabeçalho imersivo perguntando: **"Como você está hoje?"**, com uma caixa de entrada limpa ou botão de microfone (Live Voice).

#### 2. Processamento Empático (IARA)
* O usuário digita ou fala livremente.
* A IARA realiza a extração do sentimento clínico primário (tristeza, raiva, desamparo, alegria, calma) e as correlações físicas mencionadas (falta de sono, palpitação, fadiga).

#### 3. Sintonização do IBS (Índice de Bem-Estar)
* Com base no relato, a IARA atualiza ou sugere que o usuário ajuste os sliders do seu **IBS** (Sono, Energia, Humor, Hábitos, Conexão).
* O gráfico em barras ASCII ou diagramas fluidos atualiza de imediato para materializar a jornada visual do usuário.

#### 4. Direcionamento Inteligente (Ações de Cuidado)
* **Cenário A - Sobrecarga ou Necessidade de Pausa**: A IA convida o usuário a migrar para o **Espaço Inspirar**. Ela sugere uma Poesia Cognitiva Hipnótica (PCH) específica do terapeuta Evaldo Santana (ex: *"O Ritmo da Maré"* para ansiedade) acompanhada pelo guia respiratório visual de 4 segundos.
* **Cenário B - Necessidade de Escuta Profissional**: A IA sugere: *"Sua escrita traz temas que seriam acolhidos com muito carinho por um profissional. Que tal conhecermos psicólogos ou psicanalistas compatíveis com a sua história hoje?"*. O usuário é guiado para a **Rede de Especialistas**.
* **Cenário C - Necessidade de Reflexão**: O usuário é direcionado ao exercício de **Escrita Terapêutica**, onde responde a perguntas reflexivas e recebe apoio empático estruturado.

---

## 🎨 DOCUMENTO 3: DESIGN SYSTEM BÁSICO (SENTIPAE CONSISTENCY)

Garantir que as 9 plataformas falem a mesma linguagem visual, transmitindo acolhimento, leveza, autoridade científica e respeito à dor do usuário.

### 1. Paleta de Cores (The Warm Twilight Theme)
Projetada para conforto visual extremo, reduzindo a fadiga ocular de pessoas sob alto estresse emocional ou insônia.

```
██████ Slate-950   -[#020617] (Fundo Imersivo Principal)
██████ Slate-900   -[#0f172a] (Cards, Sidebars, Contêineres)
██████ Emerald-500 --[#10b981] (Energia, Cura, Toques de Ação / Botão Principal)
██████ Indigo-500  -[#6366f1] (Conexão, Ciência, IA IARA / Destaques Especiais)
██████ Amber-500   -[#f59e0b] (Nutrição, Sol, Calor Humano)
██████ Slate-400   -[#94a3b8] (Textos Secundários, Legendas)
██████ White       -[#ffffff] (Textos de Alta Leitura, Títulos)
```

### 2. Diretrizes de Tipografia (Visual Rythm)
* **Títulos de Display / Poéticos**: **Playfair Display** ou **Fira Serif** (itálico suave). Transmite tom humanista, editorial e poético, quebrando a rigidez das plataformas puramente corporativas.
* **Interface Geral (UI)**: **Inter** (sans-serif). Altamente legível, espaçamento equilibrado, excelente contraste em telas de qualquer tamanho.
* **Dados e Gráficos**: **JetBrains Mono**. Traz a segurança de uma plataforma baseada em dados reais e integridade científica para o Índice IBS e prontuários.

### 3. Padrões de Componentes Reutilizáveis

#### A. O Card SentiPae (Border Radius Generoso)
* **Estilo**: Fundo `bg-slate-900`, bordas extremamente arredondadas `rounded-[2rem]` ou `rounded-[2.5rem]`, bordas finas com opacidade `border border-white/5` ou `border border-slate-200/10` no dark mode. Evitar sombras duras; utilizar efeito holográfico sutil através de gradientes em background.

#### B. Botões de Ação Emocional
* **Ação Primária**: `bg-emerald-500 text-slate-950 rounded-2xl py-3.5 px-6 font-black uppercase tracking-widest text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10`.
* **Ação de IA / Consciência**: `bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3.5 px-6 font-black uppercase tracking-widest text-xs`.
* **Botão SOS**: `bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-500/30 font-black animate-pulse shadow-lg shadow-rose-600/25`.

---

## 🗄️ DOCUMENTO 4: ARQUITETURA DE BANCO DE DADOS (FIRESTORE SCHEMA)

Estrutura multi-tenant altamente escalável projetada para hospedar de forma isolada e segura as interações de Pessoas, Empresas, Prefeituras, Clínicas e Profissionais.

### Coleções Principais do Sistema

```
/users {userId} (Document)
  ├── nome: "Evaldo Santana"
  ├── email: "mentefelizterapias@gmail.com"
  ├── tipo: "super_admin" | "admin" | "terapeuta" | "paciente" | "moderador"
  ├── tenantId: "org_prefeitura_fortaleza" (Vinculação Multi-Tenant)
  ├── dataCadastro: Timestamp
  ├── status: "ativo" | "pendente"
  ├── currentIbs: { average: 7, factors: { sono: 8, energia: 6 ... } }
  └── [Subcollection] ibsHistory {historyId}
        ├── timestamp: Timestamp
        ├── factors: { sono: 8, energia: 6, humor: 8 ... }
        └── average: 7

/organizations {orgId} (Document)
  ├── nome: "Prefeitura Municipal de Fortaleza"
  ├── tipo: "prefeitura" | "empresa" | "clinica" | "hospital"
  ├── totalColaboradores: 4500
  ├── dataCriacao: Timestamp
  ├── configuracoes: { permitirVoz: true, painelAnonimo: true }
  └── sementesAtivas: ["pch_ritmo_mare", "pch_esperanca"]

/appointments {appointmentId} (Document)
  ├── pacienteId: "user_paciente_xyz"
  ├── terapeutaId: "user_terapeuta_abc"
  ├── tenantId: "org_prefeitura_fortaleza"
  ├── dataHora: Timestamp
  ├── status: "agendado" | "realizado" | "cancelado"
  ├── linkVideoconferencia: "https://meet.google.com/abc-defg-hij"
  └── registroClinico: "Paciente relata progresso utilizando rituais de respiração PCH..."

/messages {messageId} (Document)
  ├── appointmentId: "appointment_123"
  ├── senderId: "user_paciente_xyz"
  ├── content: "Olá, estou aguardando na sala de teleatendimento."
  ├── timestamp: Timestamp
  └── lida: false

/diary_entries {entryId} (Document)
  ├── userId: "user_paciente_xyz"
  ├── data: Timestamp
  ├── sentimentoPredominante: "ansioso"
  ├── textoOriginal: "Tive um dia corrido na prefeitura, mas consegui respirar..."
  ├── analiseSentimento: { score: 0.2, magnitude: 0.8 }
  └── compartilhadoComTerapeuta: true

/memoria_iara {userId} (Document)
  ├── historicoConversas: Array of { role: "user" | "model", text: "...", timestamp: Timestamp }
  ├── preferênciasUsuario: { temasEvitados: ["luto"], temasFavoritos: ["poesias"] }
  └── ultimaInteracao: Timestamp
```

### 🔒 Regras de Segurança Críticas (Firestore Rules Enforcement)
1. **Privacidade Absoluta de Prontuários**:
   * O documento de consulta em `/appointments/{appointmentId}` só pode ser lido e editado se `request.auth.uid == resource.data.pacienteId` ou `request.auth.uid == resource.data.terapeutaId`.
2. **Isolamento de Tenants (Empresas/Governo)**:
   * Administradores de organizações (`admin_institucional`, `prefeitura`, `empresa`) não podem ler documentos individuais em `/users` de outros tenants ou de usuários sem o mesmo `tenantId`.
   * Toda consulta analítica nos painéis de instituições deve ser realizada sob agregação, nunca revelando chaves de identificação pessoal (LGPD Compliance).
3. **Imutabilidade de Registros de Auditoria**:
   * A coleção `/audit_logs` só permite criação (`create`), sendo estritamente proibida qualquer alteração (`update`) ou deleção (`delete`) para resguardar a integridade jurídica dos atendimentos.
