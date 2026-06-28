# ESPECIFICAÇÃO FUNCIONAL — PLATAFORMA SENTIPAE (v2.0)
## Sistema Operacional de Coordenação do Cuidado Humano

---

### 1. INTRODUÇÃO E FILOSOFIA

O **SentiPae** é o primeiro Sistema Operacional focado na Coordenação do Cuidado Humano. Nós acreditamos que a tecnologia e a Inteligência Artificial devem ser pontes para criar canais seguros, acolhedores e integrados, sem nunca substituir o calor e a competência de um profissional habilitado.

Toda funcionalidade desenvolvida no SentiPae deve responder rigorosamente a três perguntas:
1. **É simples para qualquer usuário?**
2. **Gera valor real?**
3. **É escalável?**

#### Filosofia de Acompanhamento (Os 5 Pilares da IA)
1. **Acolhe (❤️)**: Recebe de imediato, em momentos felizes ou de angústia/crise, estabelecendo conexão empática.
2. **Organiza (🧭)**: Sistematiza os pensamentos do usuário, sugere passos seguintes, centraliza tarefas diárias.
3. **Educa (📚)**: Propõe conteúdos cientificamente validados, meditações e Poesia Cognitiva Hipnótica (PCH).
4. **Conecta (🤝)**: Realiza matchmaking inteligente e sem fricção com terapeutas da Rede de Cuidado.
5. **Acompanha (🌱)**: Monitora a evolução ao longo do tempo por meio do Diário Emocional e registros de bem-estar.

---

### 2. O GLOSSÁRIO E LINGUAGEM EXCLUSIVA (BRAND IDENTITY)

Para fortalecer a marca e distanciar a plataforma de jargões técnicos ou comerciais frios, o SentiPae adota uma linguagem exclusiva e humana:

* **IARA**: Assistente Inteligente de acolhimento e escuta empática.
* **SentiCore**: Núcleo de inteligência, análise de sentimentos e coordenação de jornada.
* **Meu Jardim**: Representação visual e amigável da evolução contínua do usuário, substituindo dashboards frios de estatísticas de performance.
* **Rede de Especialistas**: O diretório multidisciplinar inteligente de profissionais do cuidado humano.
* **Minha Jornada**: O plano personalizado e dinâmico de acompanhamento terapêutico.
* **Espaço Seguro**: A área protegida e criptografada de diário, reflexões e registros pessoais do paciente.
* **Círculo de Cuidado**: A equipe multidisciplinar integrada de profissionais que apoiam ativamente o usuário.

---

### 2. ARQUITETURA DE DADOS E ENTIDADES PRINCIPAIS (FIRESTORE)

A base de dados do SentiPae apoia-se em Firestore com as seguintes entidades principais estruturadas:

#### Coleção `/users` (Usuários / Pacientes e Profissionais)
```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: "paciente" | "terapeuta" | "empresa_admin" | "prefeitura_admin" | "super_admin";
  name: string;
  photoURL?: string;
  tenantId?: string; // Apoio a multi-tenancy (empresas ou saúde pública)
  specialty?: string[]; // Se profissional
  crp?: string; // Se psicólogo (Registro profissional)
  createdAt: any;
  xpPoints?: number;
  streakDays?: number;
}
```

#### Coleção `/users/{uid}/moods` (Diário de Humor Diário)
```typescript
interface MoodEntry {
  id: string;
  value: number; // 0-10 escala de humor
  intensity: number; // 0-10 intensidade
  note: string;
  triggers: string[]; // ex: ["trabalho", "familia", "sono"]
  createdAt: any;
}
```

#### Coleção `/users/{uid}/diaries` (Registros de Escrita Livre)
```typescript
interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  moodValue?: number; // Valor de humor atribuído na escrita
  sentimentReport?: {
    score: number;
    label: string;
    emoji: string;
  };
  createdAt: any;
}
```

#### Coleção `/appointments` (Agendamentos e Teleatendimento)
```typescript
interface Appointment {
  id: string;
  pacienteId: string;
  pacienteName: string;
  terapeutaId: string;
  terapeutaName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meetingLink?: string; // Sala de teleatendimento integrada
  notes?: string;
}
```

---

### 3. ECOSSISTEMA E MÓDULOS DE PRODUTO (AS CINCO GRANDES INTELIGÊNCIAS)

O ecossistema SentiPae está estruturado em torno de cinco pilares de inteligência dedicados, complementados por inovações visuais de evolução pessoal e o cuidado multidisciplinar compartilhado:

#### 3.1. IARA (Acolhimento & Vínculo)
- **Função**: Recebe o usuário com conversas instantâneas focadas em escuta ativa e empatia.
- **Triagem Silenciosa**: Analisa sutilmente o estado de ânimo para classificar demandas de apoio ou recomendar o agendamento proativo com um profissional compatível da Rede de Especialistas.
- **Protocolo SOS**: Reconhece termos de crise severa, ativando imediatamente o botão de emergência in-app com discagem rápida e contatos de suporte de saúde (CVV).

#### 3.2. SentiCore (O Cérebro de Coordenação)
- **Função**: O núcleo central de inteligência da plataforma. Processa de maneira estritamente anônima o histórico de interações (diários, feedbacks de humor) para sugerir novos passos de bem-estar.
- **Matchmaking Multidisciplinar**: Direciona o usuário para o especialista correto (psicólogo, nutricionista, terapeuta) com base na abordagem clínica ideal.

#### 3.3. Rede de Especialistas (Diretório Multidisciplinar Inteligente)
- **Função**: Reúne uma rede colaborativa multidisciplinar de psicólogos, psicanalistas, nutricionistas, educadores físicos, assistentes sociais e terapeutas.
- **Operação**: Cada profissional opera de forma segura, gerenciando consultas presenciais ou via sala de teleatendimento integrada.

#### 3.4. Instituições (Multi-Tenancy Customizada)
- **Função**: Ambientes isolados para parceiros institucionais.
  - **Empresas**: Painel corporativo de bem-estar para o RH acompanhar o engajamento e métricas agregadas dos colaboradores de forma 100% anônima.
  - **Prefeituras**: Triagem populacional automatizada para organizar e otimizar fluxos do SUS (UBS, CAPS, CRAS).
  - **Universidades / ONGs**: Ambientes exclusivos para atendimento e acolhimento rápido à comunidade acadêmica ou assistida.

#### 3.5. SentiAnalytics (Indicadores e Tomada de Decisão)
- **Função**: O painel administrativo central que gera relatórios demográficos e epidemiológicos em tempo real, preservando a privacidade (Conformidade total com a LGPD).

---

### 4. INOVAÇÕES EXCLUSIVAS DE PRODUTO

#### 4.1. 🌱 Meu Jardim (Evolução Visual Livre de Julgamentos)
Em vez de painéis de produtividade frios ou gráficos que gerem sentimentos de cobrança, o usuário acompanha seu progresso visualizando seu **Jardim Pessoal**.
- Cada registro no Diário Emocional ou check-in diário com IARA gera crescimento de plantas, florescimento de brotos ou aumento de sua árvore simbólica de evolução.
- Transmite a ideia de crescimento interno lento, contínuo e sem cobranças.

#### 4.2. Cuidado Compartilhado (Plano Multidisciplinar Integrado)
Sempre que autorizado de forma explícita pelo paciente, os profissionais vinculados ao seu tratamento podem criar canais de notas integradas.
- Permite que o terapeuta e o nutricionista acompanhem o progresso de hábitos corporais e emocionais de forma casada.
- O paciente detém controle total sobre quais especialidades do seu **Círculo de Cuidado** têm acesso a quais partes do seu prontuário evolutivo.

---

### 5. MULTI-TENANCY E SEGURANÇA (LGPD)

O SentiPae está arquitetado para segmentar ambientes por meio do `tenantId`.

- **Corporativo**: Empresas que licenciam o SentiPae para seus colaboradores acompanharem bem-estar. O RH tem acesso a relatórios consolidados em tempo real sobre nível de estresse agregados, mantendo as conversas e históricos de cada indivíduo completamente anônimos e privados.
- **Saúde Pública (Prefeituras)**: Triagem populacional para organizar filas do SUS (Redirecionando fluxos para UBS, CAPS ou psicólogos de plantão de forma otimizada).
- **Clínicas Privadas**: Gestão interna de prontuários com regras rígidas de segurança.

---

### 6. ESPECIFICAÇÕES DE UX & DESIGN TOKENS
A interface adota a escala de arredondamentos amigáveis (`radius.xxl` de `2.5rem`), tipografia legível combinando sans-serif e mono para métricas, e paletas de cores calmas e de alto contraste (Twilight Escuro de base cinza chumbo para noites de insônia, e Branco Puro/Slate para o dia).

---

Este documento serve como a Bíblia Funcional da plataforma SentiPae, guiando todas as especificações técnicas subsequentes.
