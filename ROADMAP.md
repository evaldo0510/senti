# ROADMAP.md
## Roadmap Estratégico de Evolução — SentiPae Platform

Este documento acompanha as fases de consolidação, expansão e capilaridade do Ecossistema SentiPae, dividindo as entregas em **Micro-Sprints** modulares, testáveis e independentes.

---

### Status dos Sprints de Engenharia

| Sprint | Escopo Funcional | Status | Metodologia / Foco |
| :--- | :--- | :--- | :--- |
| **Sprint 21** | Auditoria Técnica, Segurança LGPD, Consistência Firebase & OneSignal | **[Concluído]** | Estabilidade, Rastreabilidade e Permissões |
| **Sprint 22.1**| Infraestrutura da IARA (`IaraService`, `ConversationManager`) | **[Planejado]**| Desacoplamento da Camada de Inteligência |
| **Sprint 22.2**| Google Live API (Integração de Voz Multimodal e Microfone) | **[Planejado]**| Processamento de Sinais e Baixa Latência |
| **Sprint 22.3**| Memória de Longo Prazo e Resumos com IA | **[Planejado]**| Persistência Semântica no Firestore |
| **Sprint 22.4**| Motor SentiCore de Triagem e Encaminhamento Humano | **[Planejado]**| Matchmaking Multidisciplinar Seguro |
| **Sprint 22.5**| Integração Final do Fluxo de Onboarding & Conversa por Voz | **[Planejado]**| Testes de Ponta a Ponta |
| **Sprint 23** | Jornada Inteligente & Meu Jardim Emocional | **[Planejado]**| Gamificação Saudável e Hábitos |
| **Sprint 24** | Rede de Especialistas e Prontuários Compartilhados | **[Planejado]**| Integração Médica de Cuidado Humano |
| **Sprint 25** | Marketplace de Teleatendimento Funcional | **[Planejado]**| Agendamentos, Confirmação & Pagamentos |
| **Sprint 26** | Painel Administrativo Geral (SaaS Control) | **[Planejado]**| Gerenciamento de Assinaturas & Telemetria |
| **Sprint 27** | Portais Institucionais (Prefeituras, Clínicas e Empresas) | **[Planejado]**| Multi-Tenancy Isolado e Customizado |
| **Sprint 28** | Observabilidade, Monitoramento de Falhas e Telemetria | **[Planejado]**| Auditoria de Segurança Avançada (AuditLog) |
| **Sprint 29** | Otimização de Performance e Compactação de Bundle | **[Planejado]**| Lazy Loading de Gráficos e Componentes |
| **Sprint 30** | Release Candidate (RC 1.0) & Preparação Comercial | **[Planejado]**| Validação Científica & Onboarding Perfeito |

---

### Detalhamento da Arquitetura de 4 Camadas Decopladas

Para garantir a escalabilidade corporativa e modularidade de parcerias (SentiCore SDK), adotamos a seguinte divisão arquitetural:

1. **Camada 1 — Interface (Apresentação)**:
   - React 18 + Vite, Tailwind CSS para alta densidade visual.
   - Componentes visuais desacoplados e reusáveis em `/src/components/`.
   - Páginas de fluxo em `/src/pages/`.
   
2. **Camada 2 — Aplicação (Regras de Negócio)**:
   - Casos de uso terapêuticos e gerenciadores locais.
   - Gerenciamento de sessões de pacientes, cálculos de engajamento (Índice de Continuidade do Cuidado - ICC) e persistência de dados sensíveis locais.
   
3. **Camada 3 — SentiCore (Orquestração de Agentes)**:
   - Motor central de agentes em `/src/core/`.
   - Decision Engine, políticas de roteamento ético de conversas (`routingRules.ts`) e o SentiCore Command Center.
   
4. **Camada 4 — Infraestrutura (Serviços Externos)**:
   - Abstrações de conexões externas em `/src/services/` e `/src/contexts/`.
   - Firebase/Firestore para Multi-tenant seguro (`firestore.rules`).
   - SDK do Google Gemini, Google Live para chamadas de voz de baixa latência, OneSignal para alarmes de crise e Google Analytics para telemetria agregada.

---

### Visão Estratégica de Longo Prazo (5 Anos)

#### Ano 1: Consolidação da Plataforma e Senti Business B2B
- Lançamento dos ambientes corporativos de bem-estar com relatórios demográficos anônimos.
- Compilação mobile nativa para Android/iOS via Capacitor.

#### Ano 2: Saúde Pública Integrada (Senti Public)
- Homologação do sistema para Unidades Básicas de Saúde (UBS) e fluxos regulatórios municipais.
- Matchmaking de assistência social georreferenciada em territórios de alta vulnerabilidade.

#### Ano 3: Clínicas, Universidades e Pesquisa Científica
- Módulo acadêmico com supervisão de prontuários eletrônicos interligados.
- Integração profunda com prontuários médicos interoperáveis padrão HL7 / FHIR.

#### Ano 4: Expansão Internacional e Multilinguismo
- Adaptação a regras HIPAA (EUA) e GDPR (Europa).
- Localização poética e cultural do tom de voz de acolhimento emocional.

#### Ano 5: Ecossistema Autônomo e Integração com Wearables
- Leitura contínua de biomarcadores via smartwatches para prevenção de surtos de ansiedade e ataques de pânico com acionamento de apoio humano imediato.
