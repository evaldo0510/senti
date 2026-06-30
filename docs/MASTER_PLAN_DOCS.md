# SENTIPAE PLATFORM — EXECUTIVE DOCUMENTATION INDEX
## Plano Mestre de Arquitetura, Produto e Engenharia de Software

Este documento centraliza as especificações estratégicas, funcionais, técnicas e de dados que servem como fundação absoluta para o desenvolvimento e integridade do ecossistema SentiPae.

---

### 📂 Diretório de Documentos de Arquitetura

#### 📄 Documento 001 — Visão do Produto
* **Arquivo**: `docs/VisaoProduto.md`
* **Escopo**: Missão, visão e valores do ecossistema SentiPae. Estabelece a filosofia de acolhimento emocional humano intermediado por inteligência artificial ética.

#### 📄 Documento 002 — Arquitetura Funcional do SentiCore
* **Arquivo**: `docs/ArquiteturaSentiCore.md`
* **Escopo**: Motor de inteligência, fluxo de triagem emocional da IARA, cálculo de índices de bem-estar (IBS) e fluxos de segurança física (SOS).

#### 📄 Documento 003 — Arquitetura da Empresa (Enterprise Strategy)
* **Escopo**: Estruturação corporativa e modelo de governança multi-tenant para atendimento de empresas, prefeituras, hospitais e clínicas sob total segurança jurídica e conformidade regulatória.

#### 📄 Documento 004 — Arquitetura Geral da Plataforma (Enterprise Architecture)
* **Arquivo**: `docs/ArquiteturaGeral.md`
* **Escopo**: Estrutura técnica em 5 camadas (Experiência, Inteligência, Serviços, Dados e Integrações) com total isolamento e desacoplamento (Princípio do Desacoplamento Total).

#### 📄 Documento 005 — Arquitetura de Dados (Data Architecture)
* **Arquivo**: `docs/ArquiteturaDados.md`
* **Escopo**: Mapeamento lógico das coleções do Firestore (`users`, `profiles`, `journeys`, `conversations`, `recommendations`, `care_circle`, etc.), LGPD por design e o conceito do **Cofre Digital**.

#### 📄 Documento 006 — Modelo de Domínio (Domain Model)
* **Arquivo**: `docs/ModeloDominio.md`
* **Escopo**: Entidades centrais do sistema, suas responsabilidades e as 6 Regras de Ouro de Domínio com foco total na pessoa humana sob cuidado.

#### 📄 Documento 007 — Arquitetura da Experiência do Usuário (UX Architecture)
* **Arquivo**: `docs/ArquiteturaUX.md`
* **Escopo**: Princípios de usabilidade, a regra de ouro dos 3 Toques, tom de voz acolhedor, acessibilidade universal e interfaces dinâmicas que se adaptam aos hábitos do usuário.

#### 📄 Documento 008 — Arquitetura da Inteligência Artificial (AI Architecture)
* **Arquivo**: `docs/ArquiteturaIA.md`
* **Escopo**: Motores cognitivos (Google Live & Gemini), orquestração via SentiCore, memórias autorizadas de longo prazo, ferramentas de apoio ao profissional e protocolos éticos de supervisão humana em situações de vulnerabilidade.

#### 📄 Documento 009 — Modelo de Negócio e Monetização (Business Model & Monetization)
* **Arquivo**: `docs/ModeloNegocio.md`
* **Escopo**: Fontes de receita diversificadas (B2C, B2B, B2G, Marketplace, SaaS, White Label), planos freemium inteligentes, transições éticas de conversão de usuários, estratégias de expansão comercial e projeções MRR.

#### 📄 Documento 010 — Roadmap Estratégico de Desenvolvimento (Strategic Roadmap)
* **Arquivo**: `docs/RoadmapEstrategico.md`
* **Escopo**: Ciclos de desenvolvimento ágeis divididos em fases estruturadas (MVP ao B2B/B2G global), especificação de 10 Sprints incrementais de engenharia, definição de pronto (DoD) e indicadores chave de qualidade (KPIs).

---

### 🛡️ Regras de Ouro de Desenvolvimento do Sistema

1. **A Pessoa sempre no Centro**: Toda decisão técnica e de interface do usuário deve visar o conforto, a leveza e a facilidade do autocuidado do paciente.
2. **IA como Facilitadora**: A IARA acolhe e coordena; diagnósticos e evoluções clínicas são atribuições exclusivas de terapeutas humanos habilitados.
3. **Desacoplamento de Módulos**: Módulos visuais e de dados nunca se comunicam de forma direta; toda transação passa pela mediação segura do SentiCore ou serviços centrais.
4. **Privacidade e LGPD**: Dados sensíveis são protegidos por rígidas regras de segurança no banco de dados e são governados pelo próprio usuário por meio do seu Cofre Digital.
