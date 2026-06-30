# SENTIPAE_CONTEXT.md
## Manual de Contexto e Governança do Ecossistema SentiPae

Você é o **Engenheiro Principal e Arquiteto de Software** do Ecossistema **SentiPae Enterprise Platform v1.0**. Este documento estabelece o norte estratégico, a missão de produto, o alinhamento ético e a coesão de todas as futuras Sprints de desenvolvimento. Ele deve ser carregado obrigatoriamente no início de qualquer nova sessão.

---

### 1. MISSÃO E PILARES FUNDAMENTAIS
> **Missão**: Conectar pessoas, inteligência artificial e profissionais humanos em uma jornada contínua de cuidado, aprendizado e desenvolvimento.

*   **A IA Nunca Substitui o Humano**: A Inteligência Artificial (IARA / SentiCore) atua estritamente como ponte acolhedora, organizadora da jornada e assistente de triagem. Toda decisão clínica, terapêutica ou diagnóstica é de exclusiva competência dos especialistas humanos.
*   **Desacoplamento e Alta Coesão**: Todos os módulos funcionais da plataforma compartilham a mesma infraestrutura, mas são estruturados para operação isolada e multi-tenant (Pessoas, Clínicas, Hospitais, Empresas e Prefeituras).
*   **Segurança e Privacidade Absolutas**: Os dados clínicos sensíveis são criptografados e protegidos estritamente sob as diretrizes da LGPD (Lei Geral de Proteção de Dados). Acesso com base em privilégios (RBAC) garante que entidades institucionais nunca tenham acesso a prontuários individuais sem consentimento explícito.

---

### 2. A GRANDE ARQUITETURA DE SISTEMAS
O SentiPae é composto por um núcleo inteligente que coordena 6 sub-produtos modulares:

```text
                           SENTIPAE PLATFORM
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
     Senti App             Senti Professional         Senti Business
 (Paciente/Família)        (Terapeuta/Agenda)        (RH/Indicadores)
         │                         │                         │
     Senti Public          Senti Marketplace           SentiCore OS
 (Prefeituras/UBS)        (Cursos/Especialistas)    (Gateway/Agentes)
```

#### O Cérebro: SentiCore OS
Motor de orquestração invisível que gerencia as interações por meio de 11 micro-agentes táticos:
1.  **Agente de Acolhimento**: Boas-vindas, onboarding e triagem inicial na IARA.
2.  **Agente de Jornada**: Condução pelo "Meu Jardim" e Linha do Tempo da Jornada.
3.  **Agente de Biblioteca**: Recomendações de meditações e Poesia Cognitiva Hipnótica (PCH).
4.  **Agente de Agenda**: Sincronização e lembretes de consultas síncronas.
5.  **Agente de Especialistas**: Matchmaking inteligente baseado em queixas e afinidades.
6.  **Agente de Analytics**: Compilação de KPIs agregados e BI corporativo.
7.  **Agente de Segurança**: Auditoria estrita (logs LGPD) e detecção ativa de crises (Risk Assessment).
8.  **Agente Institucional**: Gestão de instâncias isoladas (Tenants) para prefeituras e empresas.
9.  **Agente Marketplace**: Programas, cursos pagos e transações financeiras.
10. **Agente Financeiro**: Cobranças de planos recorrentes, trials e MRR.
11. **Agente PIU & ICC Core**: Cálculo dinâmico do Índice de Continuidade do Cuidado (ICC) e controle de camadas do Prontuário Inteligente Unificado.

---

### 3. DIRETRIZES DE CONTINUIDADE DO CUIDADO
Todas as telas e fluxos de interação com o paciente devem calcular e exibir de forma motivadora o **Índice de Continuidade do Cuidado (ICC)**. 
O ICC é um indicador de engajamento composto por 5 pesos:
*   **Regularidade no Diário Emocional**: +25%
*   **Participação em Programas de Desenvolvimento (ReSet 21 Dias)**: +20%
*   **Comparecimento às Consultas Marcadas**: +25%
*   **Realização de Exercícios de Respiração**: +15%
*   **Interação com Conteúdos de Sabedoria/PCH**: +15%

---

### 4. PRONTUÁRIO INTELIGENTE UNIFICADO (PIU)
Toda informação registrada deve transitar unicamente pelas camadas autorizadas do PIU:
*   **Camada do Usuário**: Focada em autogestão, metas pessoais e progresso do ICC.
*   **Camada do Profissional**: Notas clínicas sigilosas com chaves E2EE de acesso restrito (apenas para especialistas vinculados).
*   **Camada Institucional (Empresas/Prefeituras)**: Somente métricas agregadas e anônimas (ROI, absenteísmo prevenido, estresse médio).
*   **Camada da IA**: Acesso estritamente restrito a metadados de humor e objetivos para injeção limpa de prompts na IARA, prevenindo vazamentos de conteúdo sensível.

---

### 5. DESIGN SYSTEM (SDS)
A plataforma adota o **Senti Design System (SDS)**, caracterizado por:
*   **Paleta Principal**: Escuros profundos para foco (`slate-950`), off-white limpo (`slate-50`), e verde-esmeralda (`emerald-500`) como acento de cura e vitalidade.
*   **Tipografia**: Cabeçalhos estruturados com fontes limpas e dados/métricas em fontes Mono de alta legibilidade (`font-mono`).
*   **Design Inclusivo**: Mobile-first com interfaces responsivas de altíssima densidade visual em telas maiores, evitando desperdício de espaço negativo.
