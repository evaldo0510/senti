# PROJETO MESTRE — SENTIPAE PLATFORM
## Arquitetura Estratégica, Produto e Roadmap

Este documento serve como diretriz estratégica de desenvolvimento para os assistentes de IA (Google AI Studio Coding Agent). Toda e qualquer modificação ou expansão do código da plataforma deve respeitar rigorosamente as diretrizes e pilares aqui descritos.

---

### VISÃO
O SentiPae é uma **Plataforma Inteligente de Coordenação do Cuidado Humano**. Sua missão é acolher, organizar a jornada do usuário e conectar cada pessoa ao profissional mais adequado no momento certo. A Inteligência Artificial atua como facilitadora; o cuidado permanece humano.

> **"O SentiPae não substitui profissionais. Ele organiza, integra e fortalece a jornada de cuidado entre pessoas, inteligência artificial e especialistas."**

---

### PILARES DO SISTEMA
1. **Acolhimento**: Toda pessoa deve sentir-se recebida e ouvida de imediato.
2. **Simplicidade**: Interface limpa, intuitiva e acessível para qualquer perfil de usuário.
3. **Segurança**: Proteção de dados rigorosa baseada na LGPD, autenticação sólida e controle fino de permissões de acesso (RBAC).
4. **Inteligência**: A IA organiza e apoia; os profissionais multidisciplinares cuidam.
5. **Continuidade**: Acompanhamento dinâmico ao longo de toda a jornada terapêutica.

---

### ECOSSISTEMA E MÓDULOS

#### 1. Módulo Core (SentiCore)
- Motor de inteligência da plataforma.
- Entende o contexto, organiza a jornada do usuário, sugere conteúdos e recomenda profissionais compatíveis.
- **Importante**: Nunca realiza diagnósticos ou substitui profissionais.

#### 2. Módulo IARA
- Recepcionista Inteligente de acolhimento emocional.
- Responsável por conversar, realizar a triagem inicial, apoiar em momentos de crise, registrar preferências e fornecer acompanhamento diário.
- Integração futura com o Google Live API para voz em tempo real.

#### 3. Marketplace Multidisciplinar
- Conecta usuários a uma rede de psicólogos, psicanalistas, nutricionistas, educadores físicos, assistentes sociais, fonoaudiólogos e terapeutas.
- Utiliza o SentiCore para sugestões de matchmaking personalizadas.

#### 4. Diário Emocional
- Registro de sentimentos, hábitos, reflexões diárias e metas.

#### 5. Biblioteca de Conteúdos
- Meditações, leituras, programas guiados e pílulas de Poesia Cognitiva Hipnótica (PCH).

#### 6. Agenda e Teleatendimento
- Gestão de sessões, lembretes, confirmações e salas de atendimento online.

#### 7. Administração e Multi-Tenancy
- Painéis dedicados para gestão:
  - **Admin**: Gestão centralizada, assinaturas, relatórios financeiros e monitoramento.
  - **Empresas**: Painéis corporativos de bem-estar para colaboradores.
  - **Prefeituras**: Ambientes independentes de saúde mental pública.
  - **Clínicas / Hospitais**: Gestão interna de equipes multidisciplinares.

---

### PRINCÍPIOS DE DESENVOLVIMENTO (SStrict Rules)
- **Não-Diagnóstico**: A IA nunca simula diagnósticos médicos ou recomendações medicamentosas.
- **Desacoplamento**: Módulos e serviços devem ser desacoplados e reutilizáveis (`src/services/`).
- **Segurança e LGPD**: Toda e qualquer rota de dados ou regra de segurança (Firestore Rules) deve garantir que dados de pacientes sejam protegidos e visíveis apenas ao próprio paciente e ao profissional expressamente vinculado.
- **Responsividade e Acessibilidade**: Interface focada no Mobile First com layout desktop de alta densidade visual.
