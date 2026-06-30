# CHANGELOG — SENTIPAE PLATFORM

Este documento registra todas as alterações, melhorias, correções de bugs e evoluções arquiteturais da Plataforma SentiPae de forma cronológica e estruturada.

---

## [Unreleased]

### Planejado para os Próximos Micro-Sprints (Sprint 22 — IARA + Google Live)
- **Sprint 22.1 — Infraestrutura da IARA**: Criação do `IaraService`, `ConversationManager` e `ContextManager`.
- **Sprint 22.2 — Google Live**: Integração com a Google Live API, controle de microfone, streaming de voz bidirecional e tratamento de erros de conexão.
- **Sprint 22.3 — Memória de Longo Prazo**: Geração de resumos automáticos de diálogos emocionais com IA e persistência no perfil do usuário.
- **Sprint 22.4 — Encaminhamento Inteligente**: Algoritmo SentiCore de triagem para encaminhamento a especialistas humanos.
- **Sprint 22.5 — Integração e Testes**: Testes de ponta a ponta e otimização de latência.

---

## [1.21.0] - 2026-06-30

### Adicionado
- **Centro de Transparência e Privacidade ("Minha Privacidade")**: 
  - Nova aba "Minha Privacidade" dentro da central de identidade do usuário (`IdentityCenter`).
  - Inventário completo de dados sensíveis retidos no sistema, detalhando o status de proteção e criptografia de cada conjunto de dados (Cadastro, Diário, Interações IARA, Dispositivos).
  - Vínculo institucional explícito de acordo com as regras de multi-tenant do usuário ativo (com indicação do Tenant ID e responsabilidades DPO).
  - Exibição de histórico imutável e descentralizado de acessos e auditoria para total transparência em conformidade com a LGPD.
- **Gerenciamento de Consentimento Inteligente**:
  - Nova interface para concessão de compartilhamento de evolução clínica com profissionais cadastrados na plataforma.
  - Registro seguro com hash criptográfico (SHA256) gerado dinamicamente para assinar termos de consentimento e auditar acessos legítimos.
  - Funcionalidade de revogação instantânea de permissão de acesso para garantir que o paciente detenha a propriedade total de seus dados.
- **Auditoria Jurídica Imutável**:
  - Tabela de histórico de auditoria (`auditLogs` e `consent_logs`) com rastreabilidade completa das ações de segurança, login, e consentimentos, exibindo carimbos de data/hora, hashes e locais de registro.

### Corrigido
- **Acesso ao Firestore ("Missing or insufficient permissions")**:
  - Revisão completa e implantação das regras em `firestore.rules` garantindo que usuários autenticados possuam acesso somente aos próprios dados, terapeutas visualizem exclusivamente registros previamente autorizados via consentimento clínico, e administradores operem de forma auditável.
- **Tratamento de Inicialização Duplicada no OneSignal**:
  - Correção de exceções `"SDK already initialized"` em `PWAContext.tsx` através da implementação de controle por flags globais de estado (`__onesignal_initialized__` e `__onesignal_initializing__`) e verificações defensivas em blocos `try-catch`.
- **Garantias de Singletons no Google Analytics**:
  - Proteção robusta contra duplicação de scripts do Google Tag Manager e comandos gtag duplicados em `analyticsService.ts`.

### Alterado
- **Estrutura Técnica do Modelo de Usuário**:
  - Alinhamento da persistência e autenticação de forma a manter integridade em `users/{uid}`, incluindo metadados obrigatórios do perfil (nome, email, tipoUsuario, plano, createdAt, updatedAt).

---

## [1.20.0] - 2026-06-29

### Adicionado
- **PWA e Suporte Offline**:
  - Configuração de Service Workers para resiliência do aplicativo sob conexões instáveis.
- **Módulo de Respiração Guiada PCH**:
  - Lançamento do assistente de respiração baseado em frequências de ressonância e poesia cognitiva hipnótica.
