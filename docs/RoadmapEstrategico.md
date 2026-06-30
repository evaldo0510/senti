# SentiPae: Roadmap Estratégico de Desenvolvimento (Strategic Roadmap)
## Documento 010 — Fases, Sprints, Ciclos de Entrega e Critérios de Pronto (Definition of Done)

> *"Primeiro fazemos funcionar. Depois fazemos bonito. Depois fazemos gigante."*

Este documento detalha o planejamento estratégico de desenvolvimento e engenharia de software para o ecossistema SentiPae. Ele estabelece os marcos de produto (MVP até a escala global), a divisão em Sprints ágeis, os critérios de qualidade e as métricas de sucesso técnico.

---

### 1. Filosofia de Entrega Incremental

A engenharia do SentiPae segue um modelo de expansão disciplinado para evitar sobrecarga sistêmica, garantir a excelência operacional em cada funcionalidade e manter a sustentabilidade financeira desde os primeiros usuários:

```
     ┌────────────────────────┐
     │ 1. FAZER FUNCIONAR     │ ◄── MVP Sólido (B2C & SaaS Essencial)
     └───────────┬────────────┘
                 │
                 ▼
     ┌────────────────────────┐
     │ 2. FAZER BONITO        │ ◄── Polimento Visual & UX Emocional (Acolhimento)
     └───────────┬────────────┘
                 │
                 ▼
     ┌────────────────────────┐
     │ 3. FAZER GIGANTE       │ ◄── Multi-Tenancy (B2B, B2G) & Escala Global
     └────────────────────────┘
```

---

### 2. Linha do Tempo e Fases do Produto

```
Fase 1: MVP Sólido ──► Fase 2: SaaS Profissionais ──► Fase 3: Rede de Especialistas ──► Fase 4: Corporações (B2B/B2G) ──► Fase 5: IA Avançada
```

#### FASE 1 — MVP (Produto Mínimo Viável)
* **Objetivo**: Disponibilizar o SentiPae no mercado focado no autocuidado do usuário final e controle essencial.
* **Módulos Centrais**:
  - Cadastro de Usuário e Perfis Adaptativos.
  - Autenticação e Provedores Sociais (Google Sign-In).
  - Dashboard Integrada (4 perguntas fundamentais).
  - IARA Conversacional de Acolhimento por Texto.
  - Google Live de Baixíssima Latência por Voz.
  - Diário Emocional e Gamificação do Jardim de Bem-Estar.
  - Biblioteca Básica de Conteúdos, Programas Guiados Iniciais e Playlist PCH.
  - Painel de Gestão de Assinatura (Premium Integrado ao Stripe/Payment Gateway).
  - Integração com Firebase (Firestore, Auth, Storage) e Analytics Técnico.

#### FASE 2 — Portal dos Profissionais (SaaS para Terapeutas)
* **Objetivo**: Atrair e unificar a governança clínica dos primeiros especialistas multidisciplinares.
* **Módulos Centrais**:
  - Painel de controle do terapeuta (Agenda eletrônica compartilhada).
  - Ficha clínica, Prontuário Eletrônico imutável e Evolução de Paciente.
  - Teleconsulta síncrona segura e criptografada (WebRTC/Google Meet).
  - Relatórios e Insights de Humor consolidados do Círculo de Cuidado.
  - IA de Apoio Clínica (Sintetizador e Pauta de consulta automática).

#### FASE 3 — Rede de Especialistas (Marketplace)
* **Objetivo**: Conectar as duas pontas do ecossistema de forma monetizável e inteligente.
* **Módulos Centrais**:
  - Matchmaking refinado via SentiCore.
  - Filtro avançado por objetivos emocionais, queixas, valores e especialidades.
  - Plataforma de transações financeiras, depósitos e split de comissão automática.
  - Catálogo integrado de Infoprodutos homologados (livros, cursos e eventos).

#### FASE 4 — Instituições & Multi-Tenancy (B2B / B2G)
* **Objetivo**: Licenciamento corporativo e governamental em escala agregada.
* **Módulos Centrais**:
  - Ambientes independentes e White Label para Empresas, Prefeituras, Hospitais e Universidades.
  - Painel administrativo do Gestor de RH/Saúde Pública.
  - Relatórios epidemiológicos macro, anonimizados por padrão (LGPD por Design).
  - Campanhas de saúde e sementes emocionais corporativas.

#### FASE 5 — Inteligência Artificial Avançada (Multi-Agent Swarm)
* **Objetivo**: Maximizar a inteligência da IARA e interações autônomas.
* **Módulos Centrais**:
  - Cooperação de múltiplos sub-agentes inteligentes sob regência da IARA.
  - Orquestração de Memória Sistêmica de Longo Prazo.
  - Integração profunda de dados corporativos e históricos emocionais para prevenção.

#### FASE 6 — Integrações Externas & APIs
* **Objetivo**: Conectar o SentiPae às ferramentas cotidianas do usuário.
* **Módulos Centrais**:
  - Integração nativa com agendas (Google Calendar, Outlook).
  - Notificações de consulta via WhatsApp e canais de Mensagens.
  - API Pública de dados de cuidado sob permissão.

#### FASE 7 — Escala e Internacionalização
* **Objetivo**: Distribuição transfronteiriça e novos canais.
* **Módulos Centrais**:
  - Localização linguística e monetária (América Latina e global).
  - Aplicativos móveis nativos (Android/iOS) integrados a sensores corporativos (Fitbit, Google Fit).

---

### 3. Organização de Desenvolvimento em Sprints

Para garantir entregas previsíveis e iterativas, adotamos ciclos ágeis de desenvolvimento estruturados com objetivos claros:

* **Sprint 1: Fundação do Sistema**  
  *Escopo*: Estruturação de dados do Firebase Firestore, Autenticação de Usuário e Tela Principal de Onboarding.
* **Sprint 2: Fronteira Cognitiva (IARA)**  
  *Escopo*: Integração do Gemini SDK para texto, interface de chat em formato de aplicativo de mensagens e suporte ao áudio/voz de baixíssima latência (Google Live).
* **Sprint 3: Práticas de Autocuidado**  
  *Escopo*: Implementação do Diário Emocional, do motor do *Meu Jardim* e das trilhas de Programas Guiados semanais.
* **Sprint 4: Curadoria & Biblioteca**  
  *Escopo*: Biblioteca de recursos, favoritos e distribuição automatizada de pílulas Poéticas Cognitivas Hipnóticas (PCH).
* **Sprint 5: Sincronia de Cuidado (Agenda)**  
  *Escopo*: Fluxo de agendamento ágil de consultas, reservas de salas virtuais e calendário unificado.
* **Sprint 6: Sustentabilidade & Premium**  
  *Escopo*: Checkout seguro, liberação de planos de assinatura, limites operacionais de chamadas de IA e controle do Cofre Digital.
* **Sprint 7: Ecossistema Multidisciplinar**  
  *Escopo*: Desenvolvimento da Área do Profissional (SaaS Essencial), agendamentos e fichas clínicas básicas.
* **Sprint 8: Central Marketplace**  
  *Escopo*: Busca e curadoria de profissionais na Rede de Especialistas e transações seguras de repasses.
* **Sprint 9: Bem-Estar Corporativo (B2B)**  
  *Escopo*: Tenant Corporativo, cadastros agregados de elegibilidade de colaboradores e painel de estatísticas agregado.
* **Sprint 10: Saúde Mental Pública (B2G)**  
  *Escopo*: Portal exclusivo do Gestor de Prefeituras, relatórios demográficos locais e canal assistencial do cidadão.

---

### 4. Definição de Pronto (Definition of Done — DoD)

Nenhum módulo visual ou backend é movido para o status de concluído sem atender rigorosamente às seguintes exigências de controle de qualidade:

1. **Funcionalidade**: Todas as histórias de usuários e fluxos funcionam conforme o planejado de ponta a ponta.
2. **Responsividade**: Testado e perfeito em múltiplos dispositivos (Layout mobile-first e desktop de alta densidade).
3. **Performance**: Renderização limpa, sem re-renders infinitos e carregamento rápido de mídias/áudios.
4. **Segurança**: Conformidade com regras de proteção LGPD de acesso direto e regras do Firestore ativas.
5. **Acessibilidade**: Contraste de cores validado e suporte básico para leitura de tela ativo.
6. **Integridade de Compilação**: O applet deve passar sem alertas ou erros no validador do linter e sistema de build (`npm run build`).

---

### 5. Indicadores Chave de Engenharia & Negócio (KPIs)

Para monitorar e otimizar as entregas de software, acompanhamos ativamente os seguintes indicadores agregados:

* ⏱️ **Velocidade de Entrega**: Tempo médio de finalização de sprints de desenvolvimento.
* 🐛 **Densidade de Defeitos**: Taxa de bugs críticos identificados por módulo.
* 🚀 **Conversão de Usuários**: Taxa de migração voluntária do Plano Gratuito para o Plano Premium.
* 🤖 **Sustentabilidade Cognitiva**: Custo operacional de chamadas de API da IA versus receita média de assinaturas por usuário (LTV/CAC).
* 📈 **Engajamento diário (DAU/MAU)**: Consistência de acesso do usuário no Diário e rega de seu Jardim.

---

### 6. Transição Estratégica: Planejamento em Código

A partir deste marco estratégico, o desenvolvimento do SentiPae adota uma abordagem de engenharia síncrona:
- **Estratégia e Especificação**: Cada especificação de negócio ou arquitetura gerada resulta na produção imediata de **Pacotes de Implementação Técnicos** prontos para consumo por nossos assistentes inteligentes e engenheiros no Google AI Studio.
- **Redução de Desperdício**: O alinhamento prévio e estrito dos modelos de domínio, dados e experiência do usuário elimina o retrabalho, garantindo que cada linha de código escrita reforce de imediato a fundação corporativa do SentiPae.
