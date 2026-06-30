# SentiPae: Modelo de Negócio e Monetização (Business Model & Monetization)
## Documento 009 — Fontes de Receita, Planos e Sustentabilidade Econômica

> *"O usuário paga para ter uma jornada de cuidado melhor. Os profissionais pagam para crescer de forma estruturada. As instituições pagam para cuidar de suas comunidades com excelência."*

Este documento detalha o modelo econômico e as estratégias de monetização da plataforma SentiPae, estruturando suas fontes de receita recorrente, planos por perfil de usuário, políticas comerciais e de escala corporativa.

---

### 1. As 7 Fontes de Receita (Revenue Streams)

A sustentabilidade e a diversificação financeira do SentiPae baseiam-se em múltiplos canais de geração de valor:

```
                  ┌────────────────────────┐
                  │   FONTES DE RECEITA    │
                  └───────────┬────────────┘
                              │
     ┌────────────────┬───────┼──────────────┬────────────────┐
     ▼                ▼       ▼              ▼                ▼
┌───────────┐   ┌───────────┐ ┌──────────┐ ┌───────────┐┌───────────┐
│Assinaturas│   │Ambiente   │ │Corporate │ │Licenças   ││Marketplace│
│    B2C    │   │Profissio. │ │   B2B    │ │Prefeituras││  & Taxas  │
└───────────┘   └───────────┘ └──────────┘ └───────────┘└───────────┘
```

#### 1. Assinatura Pessoa Física (B2C)
Planos recorrentes com foco no usuário final, baseados em um modelo freemium de alto engajamento:
* **Plano Gratuito (Acolhimento Básico)**:
  - Cadastro de perfil e acesso à Dashboard básica.
  - Conversa limitada por texto com a IARA.
  - Registro simples de sentimentos no Diário Emocional.
  - Navegação inicial pelo *Meu Jardim* (gamificação básica).
  - Consulta e leitura de conteúdos selecionados da Biblioteca Pública.
  - *Sustentabilidade*: Sem período de testes por tempo limitado. O plano gratuito é permanente para gerar valor e reduzir custos de atrito, com limite operacional de chamadas à API da IARA para conter gastos com IA.
* **Plano Premium (Jornada Completa)**:
  - Interações ampliadas de texto com a IARA.
  - Acesso à conversação por voz por inteligência artificial em tempo real (Google Live API).
  - Participação em Programas Guiados estruturados de bem-estar.
  - Biblioteca Premium de áudios de relaxamento e poesias PCH completas.
  - Relatórios de progresso cognitivo e evolução do Jardim detalhados.
  - Prioridade nos canais de suporte técnico e benefícios exclusivos no agendamento de consultas.

#### 2. Profissionais (B2B2C — SaaS para Especialistas)
Monetização da suíte de ferramentas para psicólogos, terapeutas, nutricionistas, educadores físicos e assistentes sociais:
* **Plano Essencial**:
  - Perfil profissional listado na Rede de Especialistas.
  - Agenda eletrônica de atendimentos sincronizada com Google Calendar.
  - Sala segura de teleatendimento integrada via Google Meet.
  - Gestão cadastral de pacientes vinculados de forma expressa.
* **Plano Profissional (Inteligente)**:
  - Todo o escopo do Essencial.
  - IA de Apoio Clínica (resumos gerados por IA das variações de humor semanais e pautas de consulta, com consentimento prévio do paciente).
  - Relatórios analíticos de engajamento do paciente.
  - Fluxos simplificados de cobrança, faturamento e financeiro.
  - Destaque algorítmico qualificado na Rede de Especialistas.
* **Plano Clínica (Enterprise SaaS)**:
  - Gestão centralizada de equipes e profissionais multidisciplinares.
  - Distribuição e repasse financeiro integrado.
  - Agendas e calendários compartilhados.
  - Indicadores operacionais de produtividade e conversão da unidade.

#### 3. Empresas (B2B Corporate Wellness)
Contratação empresarial focada na saúde física, mental e produtividade das equipes de colaboradores:
* **Plano Corporativo**:
  - Plataforma de autocuidado liberada aos colaboradores sem custos diretos para os mesmos.
  - Painel administrativo corporativo exclusivo de gestão de pessoas e engajamento.
  - Ativação de sementes emocionais e campanhas institucionais customizadas.
  - Indicadores estatísticos consolidados e anonimizados, respeitando a LGPD.
  - *Modelo Comercial*: Cobrança baseada no número de colaboradores ativos ou por faixas fixas de usuários sob contratação semestral/anual.

#### 4. Prefeituras (B2G — Saúde Mental Pública)
Licenciamento estratégico de larga escala adaptado para a gestão municipal de saúde social e comunitária:
* **Portal do Cidadão**: Atendimento focado na triagem e acolhimento emocional preventivo de saúde pública.
* **Portal do Gestor Municipal**: Indicadores macro de vulnerabilidade, taxas de ansiedade por região e demanda de atendimento.
* **Capacitação e Suporte**: Integração com equipes de assistência social locais para agendamentos eficientes e otimização de filas de espera de CAPS/UBS.

#### 5. Universidades (Educação & Apoio ao Estudante)
Licenciamento voltado ao combate à evasão acadêmica e suporte emocional do corpo discente:
* Portal exclusivo de assistência aos estudantes e profissionais de psicologia universitária.
* Triagem de estresse em períodos de avaliações acadêmicas e canais de desabafo anônimo com IARA.

#### 6. Taxas de Intermediação na Rede de Especialistas (Marketplace)
O SentiPae atua como facilitador e cobrador seguro para consultas e aquisições externas:
* **Comissão sobre Consultas**: Uma pequena taxa de intermediação operacional (Service Fee) cobrada sobre os agendamentos particulares realizados dentro do marketplace.
* **Venda de Infoprodutos**: Comissão pela venda de cursos rápidos, programas complementares digitais, palestras ou e-books homologados de especialistas.

#### 7. APIs e Integrações (Enterprise SDK)
Futura abertura do SentiCore via SDK/API para integração direta em grandes ecossistemas de operadoras de planos de saúde, prontuários de hospitais tradicionais e portais de terceiros.

---

### 2. Estratégia de Entrada no Mercado (Go-To-Market Phase)

A expansão do ecossistema SentiPae foi dividida em quatro marcos escalonáveis:

| Fase | Alvo Primário | Complexidade Operacional | Objetivo Estratégico |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Pessoa Física (B2C) e Profissionais (SaaS) | Baixa-Média | Validação da experiência da IARA, refinamento do SentiCore e tração inicial de usuários. |
| **Fase 2** | Clínicas e Pequenas Empresas | Média | Teste de multi-tenancy corporativo, modelos de pagamento agrupado e faturamento único. |
| **Fase 3** | Grandes Corporações e Universidades | Média-Alta | Programas personalizados integrados com departamentos de Recursos Humanos e canais internos de bem-estar. |
| **Fase 4** | Prefeituras, Estados e Parcerias B2G | Alta | Escalar o impacto de saúde preventiva sob total conformidade de licitações públicas municipais. |

---

### 3. Modelo Freemium Inteligente e Conversão Ética

Para equilibrar os custos das chamadas de IA e infraestrutura tecnológica com o crescimento de nossa base de usuários, adotamos diretrizes de conversão sem pressão psicológica:
* **Acolhimento Permanente**: O plano gratuito é rico e funcional o suficiente para gerar impacto real de bem-estar.
* **Gatilhos de Conversão Naturais**: O usuário é incentivado a migrar de plano de forma gradual e transparente quando decide espontaneamente experimentar recursos premium adicionais, como:
  - Utilizar a conversação de voz síncrona com IARA (Google Live).
  - Iniciar um Programa de hábitos exclusivos de longa duração.
  - Exportar relatórios diagnósticos de jornada para o seu médico externo de confiança.

---

### 4. Metas de Distribuição de Receita (Predictable MRR)

Para manter a resiliência financeira, o SentiPae busca uma diversificação que o proteja de variações de um único setor de mercado, almejando a seguinte divisão futura:

* 📊 **40% Assinaturas Pessoa Física (B2C)**
* 💼 **25% Assinaturas de Profissionais e Clínicas (SaaS)**
* 🏢 **15% Planos Corporativos Empresariais (B2B)**
* 🤝 **10% Comissão e Intermediação do Marketplace**
* 🏛️ **5% Licenciamentos Públicos e Municipais (B2G)**
* 🔌 **5% APIs, Integrações e Parcerias de Saúde**

---

### 5. Oportunidade Estratégica: Licenciamento White Label

Para maximizar nossa capilaridade corporativa em grandes marcas, instituições tradicionais e operadoras de saúde, o SentiPae prevê um modelo de licenciamento **White Label**:
- A organização contratante obtém a plataforma configurada inteiramente com sua marca, cores, logotipo e domínio próprio (ex: `bemestar.minhaempresa.com.br`).
- O núcleo tecnológico, a inteligência da IARA e as regras do SentiCore permanecem compartilhados sob nosso controle e sustentados em nossa infraestrutura na nuvem.
- Reduz custos de customização técnica mantendo escalabilidade contínua do produto para grandes canais.
