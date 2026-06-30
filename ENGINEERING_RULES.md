# ENGINEERING_RULES.md
## Regras de Ouro de Engenharia de Software — SentiPae Platform

Este documento define as diretrizes estritas de qualidade, segurança e arquitetura técnica para toda a equipe de engenharia e para o Google AI Studio Coding Agent. Desvios destas regras serão considerados falhas de compilação conceitual e rejeitados no Code Review.

---

### 1. TYPE SAFETY (ESTRITA DIGITAÇÃO)
*   **Proibição Absoluta do `any`**: O uso de `any` é estritamente proibido. Todas as variáveis, parâmetros de funções, retornos e payloads de API devem possuir interfaces ou tipos TypeScript declarados explicitamente em `src/types.ts`.
*   **Não Destruturação de Tipos**: Use importações nomeadas explícitas. Evite misturar tipos e módulos na mesma declaração de import.
*   **Enums Seguros**: Use `enum` padrão para representar estados discretos (Ex: `UserType`, `AppointmentStatus`). Nunca use `const enum`.

---

### 2. PADRÃO ARCHITECTURAL (DESACOPLAMENTO)
*   **Sem Acesso Direto a Bancos de Dados**: Nenhuma página ou componente visual do React está autorizada a interagir diretamente com o SDK do Firestore ou autenticação do Firebase. Toda e qualquer leitura, gravação ou mutação deve ser encapsulada em serviços modulares localizados na pasta `src/services/` (ex: `userService`, `organizationService`, `paymentService`).
*   **Encapsulamento de State em Custom Hooks**: Lógicas complexas de busca de dados, cálculos e controle de transições devem ser movidas para custom hooks de modo a manter os componentes visuais limpos e focados puramente em renderização e interatividade.
*   **Centralização de Autenticação**: Todos os componentes devem consumir dados de usuário e tokens por meio do `AuthProvider` e do hook `useAuth()`.

---

### 3. COMPONETIZAÇÃO E REUTIBILIZABILIDADE (DRY)
*   **Design System Consistente (SDS)**: Nunca recrie botões, inputs, cards ou modais com estilos inline ou variações de Tailwind ad-hoc. Consuma componentes base ou declare as utilidades em arquivos de utilitários específicos.
*   **Composição sobre Herança**: Desenvolva componentes focados e pequenos. Se um arquivo ultrapassar 400 linhas de código, extraia componentes filhos para sub-pastas dedicadas em `src/components/`.
*   **Evitar Re-renders Infinitos**: Guarde callbacks estáveis em `useCallback` e estabilize objetos e arrays fora de dependency arrays do `useEffect` para mitigar lentidões e vazamentos de memória na interface.

---

### 4. RESILIÊNCIA E TRATAMENTO DE ERROS
*   **Try-Catch em Chamadas Assíncronas**: Todas as chamadas de serviços e APIs devem conter blocos `try-catch-finally` adequados, apresentando feedbacks visuais amigáveis ao usuário final em vez de travar a interface.
*   **Error Boundaries**: Utilize componentes wrapper de fronteira de erro (`ErrorBoundary.tsx`) para isolar falhas de renderização de gráficos, mapas ou chats de IA sem comprometer o funcionamento das demais seções da plataforma.
*   **Tratamento de Chaves de API Ausentes**: Inicialize SDKs complexos de forma tardia (lazy initialization) para evitar crashes imediatos na inicialização do servidor caso alguma variável de ambiente (`GEMINI_API_KEY`, etc.) não esteja configurada.

---

### 5. SISTEMA DE AUDITORIA E LOGS (LGPD)
*   **Log de Auditoria Obrigatório**: Todas as leituras e alterações de dados de Prontuário Inteligente Unificado (PIU) devem acionar a gravação de um log de auditoria no Firestore contendo:
    *   `userId`: Quem acessou/alterou.
    *   `patientId`: De qual paciente era o registro.
    *   `action`: Qual ação foi efetuada (`READ_EVOLUTION`, `WRITE_NOTE`, `ACCESSED_IA_CONTEXT`).
    *   `timestamp`: Data e hora exatas UTC.
*   **Anonimização Automática**: Indicadores organizacionais ou municipais devem passar obrigatoriamente por algoritmos de agregação que previnam a re-identificação indireta de usuários ativos.
