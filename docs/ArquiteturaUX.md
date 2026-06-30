# SentiPae: Arquitetura da Experiência do Usuário (UX Architecture)
## Documento 007 — Jornadas, Interfaces e Princípios de Usabilidade

> *"O usuário nunca deve precisar aprender a usar o SentiPae. O SentiPae é quem deve aprender a acompanhar o usuário."*

Este documento estabelece as diretrizes de experiência de usuário (UX) do ecossistema SentiPae, estruturando a filosofia de interação, os fluxos de navegação intuitivos, as regras de usabilidade acessível e o design emocional contínuo.

---

### 1. Filosofia de Design Centrada no Ser Humano

O SentiPae foi desenhado para acolher e facilitar a coordenação do cuidado. Nossos fluxos são pensados para reduzir o estresse cognitivo de pessoas em momentos de vulnerabilidade ou com pouca intimidade tecnológica.

```
       [ENTRADA SIMPLIFICADA] ──► Acolhimento conversacional por IARA
                 │
                 ▼
     [DASHBOARD INTEGRADO] ──► Respostas imediatas a 4 perguntas essenciais
                 │
                 ▼
    [INTERAÇÃO FLUIDA & LEVE] ──► Apenas 5 caminhos principais (Navegação Fixo)
```

---

### 2. O Princípio dos 3 Toques (Micro-Interações Velozes)

Para que o SentiPae seja incrivelmente intuitivo, estabelecemos que **nenhuma função essencial pode estar a mais de 3 cliques ou toques de distância** da tela inicial:

1. **Conversar com a IARA**:
   - *Toque 1*: Botão de Ação Flutuante ou destaque central da IARA ➔ **Aberto**.
2. **Agendar uma Consulta**:
   - *Toque 1*: Aba "Agenda" ou Bloco de Agendamentos.
   - *Toque 2*: Escolha do profissional e horário.
   - *Toque 3*: Botão de confirmação ➔ **Agendado**.
3. **Ver Próxima Consulta**:
   - *Toque 1*: Bloco visível na tela inicial ("Próximos Compromissos") ➔ **Detalhes da consulta exibidos**.
4. **Registrar o Diário Emocional**:
   - *Toque 1*: Botão de registro rápido na tela principal ➔ **Aberto**.

---

### 3. O Fluxo de Boas-Vindas (First-Time Experience)

Ao invés de descarregar uma enxurrada de cards, tabelas e opções na primeira inicialização, o novo usuário passa por uma trilha de recepção natural guiada pela IARA:

* **Passo 1: Reconhecimento e Toque Humano**:
  - *"Bem-vindo ao SentiPae. Eu sou a IARA e estou aqui para caminhar ao seu lado. Como você gostaria de ser chamado?"*
* **Passo 2: Diagnóstico Inicial Sutil (Acolhimento)**:
  - *"Olá, [Nome]. Como você está se sentindo hoje?"* (Interação através de emojis táteis e botões limpos).
* **Passo 3: Mapeamento de Interesses**:
  - *"Gostaria de conhecer você um pouco mais. O que mais te motivou a começar hoje?"* (Opções simples: Qualidade do sono, Ansiedade, Produtividade, Autoconhecimento).

Toda essa onboarding é convertida internamente pelo SentiCore na primeira configuração do **Plano de Cuidado** do usuário, sem burocracias ou formulários frios.

---

### 4. A Estrutura da Tela Inicial (Dashboard Adaptativo)

A tela principal do SentiPae responde de imediato a quatro perguntas silenciosas na mente de quem busca cuidado:

1. **Como estou hoje?**: Exibe um resumo visual do estado de humor consolidado e evolução do Jardim.
2. **O que devo fazer agora?**: Um card de destaque com o "Próximo Passo" gerado pelo SentiCore (ex: *"Praticar respiração guiada de 3 min"* ou *"Visualizar mensagem da Psicóloga Ana"*).
3. **Tenho alguma consulta programada?**: Atalho visível e claro indicando o dia, a hora e o botão de acesso rápido à sala virtual.
4. **Posso conversar com alguém?**: O botão proeminente de ativação de chat ou voz com a IARA.

#### Layout das Seções Visuais:
* **Bloco 1 — Identidade & Saudação**: *"👋 Olá, Evaldo. Bom dia. Hoje é segunda-feira."* (Estabelece âncoras temporais e acolhimento imediato).
* **Bloco 2 — Minha Jornada & Jardim**: Representação metafórica e colorida do progresso semanal.
* **Bloco 3 — Central IARA**: Área para início rápido da conversação de texto ou voz pelo Google Live.
* **Bloco 4 — Próximos Compromissos**: Acesso direto à consulta médica ou agendamento pendente.
* **Bloco 5 — Continue de onde parou**: Sugestão baseada em conteúdos recentes ou atividades inacabadas.

---

### 5. Menu de Navegação Principal

A barra de navegação inferior (mobile) e lateral (desktop) contém apenas 5 atalhos imutáveis para evitar confusão visual:

* 🏠 **Início**: O painel central integrador.
* 🤖 **IARA**: Espaço imersivo e limpo de diálogo por áudio e texto.
* 📅 **Agenda**: Calendário, consultas marcadas e teleatendimentos ativos.
* 🌱 **Jornada**: O espaço do *Meu Jardim*, conquistas e trilhas em andamento.
* 👤 **Perfil**: Ajustes de privacidade, configurações de conta, assinatura e o controle do *Cofre Digital*.

---

### 6. Design Emocional e Metáforas Visuais

#### O Meu Jardim (Progresso sem Julgamento)
Substituímos gráficos frios e estatísticas de "sucesso/falha" por uma metáfora visual de crescimento orgânico:
- **🌱 Semente**: Início do hábito ou jornada emocional.
- **🌿 Broto/Folha**: Pequena consistência alcançada nos registros.
- **🌳 Árvore Firme**: Integração bem-sucedida de novas rotinas ou finalização de programas.
- **🌸 Florescer**: Momentos de superação de metas e conquistas significativas.

*Regra de Ouro*: O jardim **nunca morre** por inatividade do usuário. Se houver ausência de registros, as plantas apenas reduzem o brilho ou pedem "rega de acolhimento", evitando punições visuais que gerem sentimentos de culpa ou desistência.

#### Tom de Voz e Micro-textos Acolhedores (UX Writing)
Eliminamos mensagens frias de erros do sistema ou ausência de dados:
* *Ao invés de*: `"Nenhum registro encontrado."`  
  *Adotamos*: `"Ainda não há atividades registradas aqui. Quando você se sentir confortável, podemos iniciar sua jornada juntos."`
* *Ao invés de*: `"Erro 500: Falha na conexão com o servidor."`  
  *Adotamos*: `"Não conseguimos concluir esta ação agora. Vamos tentar novamente em alguns instantes."`

---

### 7. Acessibilidade Universal (Accessibility by Design)

O SentiPae foi projetado sob os padrões do WCAG (Web Content Accessibility Guidelines) para assegurar que idosos, neurodivergentes ou pessoas em crises agudas possam navegar com segurança:
* **Alto Contraste Estabilizado**: Paletas de cores confortáveis, evitando fundos vibrantes que possam induzir a hiperestimulação sensorial.
* **Ajuste Dinâmico de Fontes**: Escala tipográfica flexível e legível.
* **Navegação Simplificada por Teclado e Voz**: Total compatibilidade com leitores de tela nativos do Android/iOS.
* **Ativação por Voz (Hands-free)**: Facilidade em conversar e registrar emoções simplesmente falando, utilizando o motor de voz do Google Live.

---

### 8. Navegação Inteligente e Adaptativa

O SentiCore monitora de forma discreta as preferências do usuário para ajustar sutilmente o fluxo prioritário das informações, sem quebrar o layout principal:
- Se o usuário utiliza primariamente o **Diário Emocional**, a tela inicial eleva e expande o Bloco de anotações diárias.
- Se a prioridade são as **Consultas Multidisciplinares**, o bloco da Agenda ganha maior relevância espacial.
- Essa transição ocorre suavemente, criando uma interface dinâmica que aprende os hábitos do usuário e se molda suavemente para facilitar seu cotidiano.
