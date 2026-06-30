# DEFINITION OF DONE (DoD) — SENTIPAE PLATFORM
## Critérios Qualitativos de Homologação para Produção

Nenhuma funcionalidade, tela ou serviço do SentiPae será considerado concluído ou elegível para implantação em produção sem antes cumprir integralmente todos os requisitos deste documento.

---

## 1. REQUISITOS FUNCIONAIS
- [ ] **Fidelidade ao Planejamento**: A funcionalidade faz exatamente o que foi especificado pelo CTO (User Intent), sem adicionar escopos extras ("gold-plating") ou pendências de fluxo.
- [ ] **Fluxo Ponta a Ponta**: O caminho percorrido pelo usuário deve ser fluido, sem loops infinitos ou becos sem saída.
- [ ] **Fallbacks e Estados Vazios**: Telas que dependem de dados remotos devem possuir tratamento visual apropriado para carregamento (`loading`), ausência de registros (`empty states`) e falha de rede (`error boundaries`).

## 2. COMPATIBILIDADE DE INTERFACE (UI/UX)
- [ ] **Design Mobile-First**: O layout é primariamente otimizado para celulares (viewport vertical) com toque confortável (alvos de toque de no mínimo 44px).
- [ ] **Densidade Desktop**: Em telas maiores, o layout se reorganiza elegantemente para aproveitar o espaço horizontal de maneira fluida, mantendo um limite de leitura confortável (`max-w-7xl mx-auto`).
- [ ] **Consistência de Marca**: Uso exclusivo das variáveis globais de tipografia (Inter e Space Grotesk) e paleta cromática Senti (Emerald, Slate, White/Charcoal).
- [ ] **Acessibilidade**: Contraste adequado de textos sobre fundos e suporte para leitores de tela básicos.

## 3. SEGURANÇA E PRIVACIDADE (LGPD)
- [ ] **Políticas RBAC**: A operação respeita rigorosamente o papel do usuário logado (Paciente, Terapeuta, Admin, Empresa, Prefeitura).
- [ ] **Garantia de Ownership**: Nenhum dado sensível é carregado sem a verificação de propriedade (`userId == auth.uid`) ou consentimento explícito.
- [ ] **Isolamento de Tenant**: Dados de corporações ou prefeituras (`tenantId`) permanecem estritamente isolados através de regras de segurança ativas no Firestore.
- [ ] **Rastreabilidade de Acesso**: Leituras e escritas clínicas em dados de terceiros disparam chamadas ao serviço de auditoria (`auditLogs`).

## 4. ENGENHARIA DE CÓDIGO & ARQUITETURA
- [ ] **Desacoplamento em 4 Camadas**: A regra de negócio está encapsulada nos serviços (Camada 2/3), enquanto chamadas brutas de API externas pertencem aos adaptadores de infraestrutura (Camada 4).
- [ ] **Tipagem Estrita**: Ausência de tipagem genérica (`any`) sem justificativa plausível. Todas as interfaces necessárias estão centralizadas ou importadas de `src/types.ts`.
- [ ] **Gerenciamento de Ciclo de Vida**: Ausência de vazamento de memória em efeitos colaterais (`useEffect` limpando listeners de Firebase, barramentos de eventos globais e temporizadores).

## 5. TESTES & ESTABILIDADE
- [ ] **Compilação Limpa**: O build de produção (`npm run build`) executa sem avisos ou erros críticos de TypeScript.
- [ ] **Linter Aprovado**: Ausência de erros fatais ao rodar `npm run lint`.
- [ ] **Resiliência PWA / Offline**: O fluxo central do aplicativo funciona ou avisa graciosamente o usuário na falta de internet.

## 6. DOCUMENTAÇÃO & RASTREABILIDADE
- [ ] **Atualização do Changelog**: As alterações são registradas em formato *Keep a Changelog* no arquivo `/CHANGELOG.md`.
- [ ] **Atualização do Roadmap**: O progresso é registrado no arquivo `/ROADMAP.md` com os status atualizados.
- [ ] **Contratos do SDK**: Se houver mudanças em APIs estruturais de orquestração, o arquivo `/docs/SENTICORE_SDK.md` é atualizado.
