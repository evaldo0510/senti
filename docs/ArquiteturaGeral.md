# SentiPae: Arquitetura Geral da Plataforma (Enterprise Architecture)
## Documento 004 — Estrutura e Diretrizes Arquiteturais

> *"Garantindo que qualquer novo módulo possa ser desenvolvido sem comprometer os existentes, sob o princípio do menor privilégio e do desacoplamento total."*

Este documento consolida a arquitetura corporativa e técnica de alto nível do ecossistema **SentiPae**, estabelecendo as fronteiras entre as camadas de experiência, inteligência, serviços de plataforma, dados e integrações.

---

### 1. Visão de Camadas da Plataforma (5-Layer Architecture)

Para manter o sistema sustentável, escalável e seguro, dividimos a plataforma em 5 camadas lógicas independentes:

```
┌─────────────────────────────────────────────────────────────────┐
│              CAMADA 1: EXPERIÊNCIA (Experience Layer)           │
│  [Portal Usuário]   [Portal Profissional]   [Portal Inst./Admin]│
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│               CAMADA 2: INTELIGÊNCIA (AI & SentiCore)           │
│      [SentiCore Orquestrador]   [IARA Chat Engine]   [Google Live]│
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│               CAMADA 3: SERVIÇOS (Platform Services)            │
│  [Auth]  [Notificações]  [Pagamentos]  [Teleatendimento]  [Audit]│
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│               CAMADA 4: DADOS (Secure Data Store)               │
│             [Firestore Multi-Tenant]   [Relational SQL]         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│             CAMADA 5: INTEGRAÇÕES (Integration Boundary)        │
│    [G-Meet/Calendar]   [Gemini API]   [WhatsApp]   [Gateways]   │
└─────────────────────────────────────────────────────────────────┘
```

#### Camada 1 — Experiência (Experience Layer)
Responsável por apresentar interfaces de alta fidelidade, responsivas e confortáveis aos diferentes atores da plataforma:
* **Portal do Usuário (Paciente/Colaborador/Cidadão)**:
  - Dashboard unificada de autocuidado.
  - Minha Jornada (Passos sugeridos dinamicamente).
  - Meu Jardim (Metáfora de crescimento e hábitos).
  - Diário Emocional (Anotações e gráficos).
  - Agenda & Teleatendimento.
  - Biblioteca (Meditações, poesias PCH e leituras).
  - Configurações do perfil.
* **Portal do Profissional (Psicólogos, Psicanalistas, etc.)**:
  - Agenda & Calendário de atendimentos.
  - Prontuário Eletrônico & Evoluções Clínicas.
  - Sala de Teleatendimento integrada.
  - Gestão de Pacientes Vinculados.
  - Painel Financeiro e Repasses.
  - Envio e recomendação de Conteúdos Personalizados.
* **Portal da Instituição (Empresas, Prefeituras, Clínicas, Hospitais, Universidades)**:
  - Painéis analíticos anonimizados (LGPD compliant).
  - Gestão de colaboradores ou cidadãos beneficiários.
  - Ativação de Sementes Emocionais (Poesias e campanhas institucionais).
* **Portal Administrativo (SentiPae Global Admin)**:
  - Gestão global de usuários, profissionais e instituições.
  - Controle de Marketplace e moderação técnica.
  - Conciliação financeira, assinaturas e faturamento.
  - Relatórios executivos e auditoria global do ecossistema.

#### Camada 2 — Inteligência
A inteligência do sistema atua como facilitadora e integradora, nunca substituindo o julgamento clínico humano:
* **IARA**: Recepcionista inteligente responsável por acolher, manter diálogo natural e empático, compreender o contexto imediato do usuário e realizar a triagem inicial de risco de forma contínua.
* **Google Live API**: Habilita a interação por voz em tempo real de baixíssima latência, incluindo transcrição inteligente, síntese emocional de voz e interrupção espontânea da fala.
* **SentiCore**: O motor central de orquestração que processa os dados estruturados do usuário (como o IBS) e seu histórico emocional para determinar de forma dinâmica o "Próximo Passo", os gatilhos visuais e os gatilhos de segurança (SOS).

#### Camada 3 — Serviços
Serviços de infraestrutura reutilizáveis e padronizados. **Nenhuma tela da Camada de Experiência acessa diretamente a Camada de Dados**; toda interação passa por rotas ou classes de serviço expostas:
* **Autenticação**: Controle de login, cadastro, troca de senhas e sincronização de perfis (Auth + Firestore).
* **Notificações**: Envio multicanal (Push, E-mail, WhatsApp) controlado de forma assíncrona.
* **Pagamentos**: Gestão de faturamento de planos corporativos, assinaturas de pacientes e repasse a profissionais.
* **Upload de Arquivos**: Armazenamento seguro de documentos profissionais e relatórios clínicos.
* **Calendário & Teleatendimento**: Integração e geração de salas virtuais seguras e agendamentos.
* **Analytics & Auditoria**: Registro imutável de logs para segurança jurídica e rastreabilidade (LGPD).
* **Exportação de Dados**: Capacidade de portabilidade para pacientes e exportação de prontuários.

#### Camada 4 — Dados
Estrutura de dados organizada para segurança, isolamento multi-tenant e velocidade de consulta. As principais coleções previstas são:
* `users` e `professionals`: Cadastro e perfis de usuários do ecossistema.
* `institutions`: Configurações de empresas, prefeituras, clínicas e universidades.
* `appointments` e `conversations`: Dados de agendamento e chats criptografados.
* `journals` e `library`: Registros de diários emocionais e conteúdos da biblioteca.
* `marketplace` e `subscriptions`: Gestão comercial da plataforma.
* `payments`, `notifications` e `settings`: Parâmetros do sistema e faturamento.
* `auditLogs`: Registro imutável de eventos operacionais críticos.

#### Camada 5 — Integrações
Camada de abstração responsável por traduzir e isolar chamadas para APIs de parceiros e sistemas terceiros. Se uma ferramenta externa mudar de API, apenas o adaptador nesta camada precisará ser alterado:
* **Google Workspace**: Google Calendar (agendamento síncrono) e Google Meet (salas de teleatendimento).
* **Gemini API & Google Live**: Modelos de IA generativa de texto, áudio e voz em tempo real.
* **WhatsApp**: Disparos de alertas transacionais de agendamento e lembretes de bem-estar.
* **Gateways de Pagamento / SMTP / Push Services**: Serviços auxiliares de transação comercial, e-mail e push notificações.

---

### 2. Princípios de Segurança (Menor Privilégio & RBAC)

A plataforma opera sob um rígido modelo de controle de acesso baseado em papéis (Role-Based Access Control - RBAC) alinhado aos seguintes perfis de acesso:

| Perfil de Acesso | Escopo de Acesso Permitido | Restrições Críticas |
| :--- | :--- | :--- |
| **Usuário (Paciente)** | Dados de perfil próprio, diários, agendamentos pessoais e conteúdos. | Sem acesso a dados corporativos ou prontuários de outros pacientes. |
| **Profissional** | Perfis de seus pacientes vinculados de forma expressa, evoluções próprias e agenda pessoal. | Sem acesso a prontuários ou evoluções de outros terapeutas. |
| **Admin Institucional (Empresa/Prefeitura)** | Painéis agregados e estatísticas de bem-estar corporativo anonimizadas. | **Rigorosamente proibido** o acesso a dados individuais (LGPD). |
| **Clinica / Hospital** | Gestão de equipe de terapeutas vinculados e dados consolidados da sua unidade. | Limitação de acesso por tenant institucional. |
| **Administrador / Super Admin** | Monitoramento de transações, faturamento global, auditoria jurídica e moderação de contas. | Acesso a prontuários clínicos limitado a logs de auditoria jurídica sem leitura livre. |

---

### 3. Decisão Arquitetural Crítica: O Princípio do Desacoplamento Total

Para garantir que o SentiPae permaneça modular à medida que novos desenvolvedores e assistentes de IA se juntam à construção do projeto, fica estabelecida a seguinte regra:

> **"Nenhum módulo ou componente visual da Camada de Experiência poderá depender ou comunicar-se diretamente com outro módulo."**

#### Como Funciona na Prática:
* **Errado**: O componente do `DiarioEmocional` importar e chamar funções ou modificar tabelas do `Marketplace` ou `Agenda` diretamente.
* **Correto**: O `DiarioEmocional` atualiza o estado de humor do usuário através do `userService`. O `SentiCore` detecta a variação do humor e gera uma recomendação na jornada do usuário (Próximo Passo) contendo uma tarefa da categoria `"consulta"`. O usuário ao clicar na tarefa é redirecionado de forma limpa para a rota do `Marketplace`.
* **Vantagens Práticas**:
  1. **Substituição de Módulos**: Podemos reescrever completamente a tela do Marketplace sem quebrar o Diário, ou substituir a API do Google Meet por outra solução sem alterar as telas de agendamento de consultas.
  2. **Isolamento de Erros**: Se o módulo de faturamento financeiro falhar, os diários e o suporte de voz da IARA continuam funcionando perfeitamente (tolerância a falhas).
  3. **Facilidade de Teste**: Serviços podem ser testados de forma 100% isolada e mocks podem ser injetados com total previsibilidade.

---

### 4. Princípios de Desenvolvimento de Software do SentiPae

1. **Reutilização de Componentes**: UI baseada em átomos e moléculas consistentes seguindo o Design System.
2. **Acessibilidade e Alto Contraste**: Garantia de contraste e navegação adaptada para pessoas com deficiências visuais ou estresse sensorial agudo.
3. **Desempenho**: Renderização veloz, debouncing em redimensionamento de telas e otimização de consultas assíncronas no Firestore.
4. **Segurança-Primeiro (Security by Design)**: Validação profunda de tokens, sanitização de entradas e regras de segurança do Firestore (`firestore.rules`) escritas de forma a testar todas as permissões antes de ler/gravar dados.
5. **Observabilidade (Auditoria Imutável)**: Rastreamento detalhado de eventos sensíveis no banco de dados para segurança jurídica do paciente, do profissional e da instituição parceira.
