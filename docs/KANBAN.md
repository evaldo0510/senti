# KANBAN DE ENGENHARIA — SENTIPAE PLATFORM
## Painel de Controle de Desenvolvimento em Tempo Real

---

## ⚫ BLOQUEADO (Problemas que impedem avanço)
> *Nenhum bloqueador ativo no momento. Todos os bloqueadores de infraestrutura (Regras do Firestore, Múltipla Inicialização OneSignal e Duplicação de Rastreamento de Analytics) foram mitigados com sucesso.*

---

## 🔴 BACKLOG (Funcionalidades Planejadas)
- [ ] **Sprint 22.2 — Google Live API**: Integração bidirecional por voz em tempo real de baixíssima latência.
- [ ] **Sprint 22.3 — Memória Terapêutica**: Persistência semântica e geração de resumos emocionais automáticos.
- [ ] **Sprint 22.4 — Motor de Encaminhamento**: Algoritmo inteligente SentiCore para sugestão de terapeutas.
- [ ] **Sprint 22.5 — Integração e Testes P2P**: Homologação completa dos fluxos de Onboarding + IARA por voz.
- [ ] **Sprint 23 — Meu Jardim**: Elementos de gamificação saudável do humor.
- [ ] **Sprint 24 — Rede de Especialistas**: Expansão do Prontuário Inteligente Unificado (PIU).
- [ ] **Sprint 25 — Teleatendimento**: Sistema de agendamentos online e chamadas criptografadas.

---

## 🟡 EM DESENVOLVIMENTO (Sendo Implementado)
- [ ] **Sprint 22.1 — Infraestrutura de IA da IARA**: Desacoplamento dos barramentos de diálogo, criação do `IaraService` e gerenciamento estrito de janelas de conversação.

---

## 🟠 EM TESTES (Validação Técnica e Funcional)
- [ ] *Nenhum item em testes no momento. Todo o escopo de segurança foi promovido a concluído.*

---

## 🟢 CONCLUÍDO (Pronto para Produção)
- [x] **Eficácia de Regras de Segurança (Firestore Rules)**: Validação e correção exaustiva das permissões baseadas em Authentication + Authorization + Ownership + Tenant Admin (B2B).
- [x] **Auditoria Técnica Geral (Sprint 21)**: Varredura completa de componentes e dependências do projeto.
- [x] **Estabilização do Firebase/Firestore**: Implantação de regras focadas em Authentication + Authorization + Ownership.
- [x] **Correção da Persistência de Login**: Usuários existentes entram no aplicativo diretamente; novos usuários são encaminhados ao onboarding.
- [x] **Resolução do Conflito do OneSignal**: Implementação de flags globais defensivas para evitar múltiplas inicializações.
- [x] **Singleton do Google Analytics**: Garantia de inicialização única do script gtag.
- [x] **Central de Privacidade ("Minha Privacidade")**: Criação da interface de governança LGPD, transparência e controle de consentimento clínico no `IdentityCenter`.
- [x] **Criação do SentiCore SDK**: Blueprint estratégico especificando a arquitetura em 4 camadas desacopladas.
