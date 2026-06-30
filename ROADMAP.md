# ROADMAP.md
## Roadmap Estratégico de Evolução — SentiPae Platform (5 Anos)

Este documento acompanha as fases de consolidação, expansão e capilaridade do Ecossistema SentiPae. Ele serve de base de alinhamento para o conselho consultivo e para as priorizações semanais de engenharia.

---

### 1. FASE ATUAL: SPRINT CORE CONSOLIDAÇÃO (Q2 2026)
*   **Módulos e Sprints Concluídos**:
    *   [x] **Sprint 11 (SentiCore OS v1)**: Centralizador de inteligência e auditoria de logs (SentiCore Hub) e registro de agentes.
    *   [x] **Sprint 12 (O DNA do SentiPae)**: Definição estratégica da "Continuidade do Cuidado", "Mapa Vivo da Jornada" e "Linha de Cuidado Compartilhada".
    *   [x] **Prontuário Inteligente Unificado (PIU)**: Camadas de acesso RBAC e visualização clínica de evoluções.
    *   [x] **Índice de Continuidade do Cuidado (ICC)**: Calculador dinâmico de engajamento do paciente.
    *   [x] **Linha do Tempo da Jornada Terapêutica**: Interface visual interativa para acompanhamento de fases no Senti App.
    *   [x] **PCH Player (Sabedoria & Respiração)**: Integrado ao painel do paciente para alívio imediato e regulação emocional.

*   **Foco Imediato (Próximas Sprints)**:
    *   [ ] **Sprint 13 (O Banco de Dados Corporativo)**: Modelagem profunda de todas as coleções, relacionamentos, regras de segurança e índices do Firestore.
    *   [ ] **Sprint 14 (Google Live e Conversação em Tempo Real)**: Integração definitiva dos inputs de áudio com a Google Live API no módulo de voz em tempo real da IARA.
    *   [ ] Expansão do Marketplace de Especialistas com filtros de agendamento multi-agenda integrados às prefeituras.

---

### 2. VISÃO DE EVOLUÇÃO E ROADMAP TÁTICO

#### Ano 1: Consolidação da Plataforma e Integrações Corporativas
*   Consolidação da arquitetura Multi-Tenant isolando ambientes corporativos e governamentais.
*   Implantação de dashboards de bem-estar B2B (Senti Business) com indicadores agregados anônimos.
*   Lançamento do aplicativo mobile oficial empacotado para Android/iOS via Capacitor/React Native.

#### Ano 2: Saúde Pública e Assistência Social (Senti Public)
*   Homologação da plataforma para suporte a Unidades Básicas de Saúde (UBS) e programas de saúde pública municipais.
*   Matchmaking georreferenciado de assistentes sociais e psicólogos com base em territórios de vulnerabilidade.
*   Implementação de regras de triagem integradas aos fluxos regulatórios do SUS.

#### Ano 3: Expansão Científica e Ensino (Universidades e Hospitais)
*   Integrações robustas com prontuários eletrônicos padrão (HL7 / FHIR) de grandes hospitais.
*   Módulo acadêmico para residências em psicologia e psiquiatria, permitindo que professores supervisionem alunos através do Prontuário Inteligente Unificado (PIU).
*   Constituição formal do Conselho Consultivo e Científico permanente para revisão de algoritmos PCH.

#### Ano 4: Escala Global e Multilinguismo Inteligente
*   Localização completa do tom de voz e metáforas de cura para os mercados de língua inglesa e espanhola.
*   Adaptação de regras de conformidade internacionais (HIPAA nos EUA, GDPR na Europa).
*   Motor de IA multimodal adaptando metáforas poéticas a partir de padrões faciais ou entonação vocal.

#### Ano 5: Ecossistema Autônomo de Saúde Preventiva Integral
*   Conexão profunda com sensores vestíveis (smartwatches) para prever surtos de pânico ou colapsos de sono de forma preventiva e sugerir técnicas ativas de respiração ou acionar socorro humano em tempo recorde.
*   Abertura de APIs abertas para desenvolvimento de micro-aplicativos terapêuticos independentes dentro da App Store SentiPae.

---

### 3. CONTROLE DE DÉBITOS TÉCNICOS E MONITORAMENTO
*   **Segurança**: Substituir todas as queries legadas de teste por transações seguras no SDK do Firestore.
*   **Performance**: Otimizar tempos de carregamento de gráficos interativos através de lazy loading e code-splitting no roteador central do React.
*   **Acessibilidade**: Certificar compatibilidade total do leitor de tela (ARIA labels) nos widgets interactivos do diário emocional.
