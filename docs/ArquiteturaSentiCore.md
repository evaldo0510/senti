# SentiCore: Motor de Coordenação e Inteligência do Cuidado
## Documento de Arquitetura Técnica e Fluxos de Dados

O **SentiCore** é o cérebro orquestrador da plataforma **SentiPae**. Sua responsabilidade principal é centralizar a inteligência emocional coletada através dos diários e check-ins de humor, gerando de forma dinâmica o **Próximo Passo** da jornada do usuário e garantindo o encaminhamento ético e seguro.

---

### 1. Filosofia de Design e Limiares Clínicos

A arquitetura do SentiCore baseia-se no princípio fundamental de que **a tecnologia acolhe e as pessoas cuidam**. Sendo assim:
- **Apoio Autônomo (Prevenção)**: A IA e os recursos interativos (IARA, Exercícios de Respiração, Diários) atuam na prevenção, na regulação de crises leves a moderadas e na criação de rotinas saudáveis.
- **Matchmaking (Rigor Clínico)**: Casos de sofrimento persistente ou picos de humor deprimido (< 4.5 de média) são ativamente encaminhados para a rede de psicólogos e terapeutas humanos.

```
       [ Usuário Acessa o SentiPae ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    Humor ≥ 4.5             Humor < 4.5 (Ou Crise)
 ┌───────┴───────┐               │
 ▼               ▼               ▼
[Rotina / Diário] [Exercício]  [Matchmaking com Humano]
```

---

### 2. Ecossistema de Integrações

O SentiCore atua como a espinha dorsal ligando todos os serviços do ecossistema:

#### A. IARA (Recepcionista Virtual de Acolhimento)
* **Função**: Escuta ativa e acolhimento imediato 24/7.
* **Orquestração SentiCore**:
  - Quando o usuário inicia um diálogo em crise, o SentiCore injeta o contexto do humor recente na sessão do chat para que a IARA ofereça respostas hiper-contextualizadas.
  - Se a conversa indicar melhora, o SentiCore sugere exercícios de estabilização. Se indicar sofrimento agudo, aciona recursos de SOS.

#### B. Google Live API (Integração de Voz)
* **Função**: Canal de acolhimento interativo por voz em tempo real.
* **Orquestração SentiCore**:
  - Gerencia os dados de áudio em formato PCM (16-bit, 24kHz) enviados de forma assíncrona.
  - Garante uma voz humana e pausada, com cancelamento automático de ruídos e interrupção fluida quando o usuário começa a falar.

#### C. Marketplace Multidisciplinar (Rede de Especialistas)
* **Função**: Conexão com profissionais reais (psicólogos, psicanalistas, fonoaudiólogos, fono, assistentes sociais).
* **Orquestração SentiCore**:
  - Quando a média de humor de 7 dias cai de 4.5 ou palavras-chave de depressão severa são identificadas no diário, o SentiCore altera a categoria do Próximo Passo para `"consulta"`.
  - Sugere profissionais compatíveis com base no perfil de sintomas e preferências do usuário.

#### D. Meu Jardim (Metáfora de Crescimento)
* **Função**: Interface visual lúdica de progresso pessoal.
* **Orquestração SentiCore**:
  - Transforma dados brutos em elementos orgânicos dinâmicos:
    - **Streak de Acesso** $\rightarrow$ Crescimento da *Árvore da Consistência* (🫘 $\rightarrow$ 🌱 $\rightarrow$ 🌿 $\rightarrow$ 🌳 $\rightarrow$ 🌳✨).
    - **Contagem de Escritas** $\rightarrow$ Desabrochar da *Flor da Expressão* (🫙 $\rightarrow$ 🌷 $\rightarrow$ 🌹 $\rightarrow$ 🌺 $\rightarrow$ 🌸✨).
    - **Média de Humor** $\rightarrow$ Vitalidade e brilho do *Broto de Acolhimento* (🍂 em humor baixo, 🌿✨ em humor equilibrado).

---

### 3. Regras de Encaminhamento e Emergência (Triagem Seguro-Primeiro)

| Indicador Analisado | Limiar / Keyword | Ação Orquestrada | Canal Recomendado |
| :--- | :--- | :--- | :--- |
| **Humor Crítico** | Média < 4.5 | Encaminhamento para Especialista | `/terapeutas` (Consulta) |
| **Instabilidade Moderada** | Humor entre 4.5 e 6.5 | Exercício de Regulação Corporal | `/guided-flow` (Respiração) |
| **Estresse / Ansiedade** | Keywords: *ansioso, pânico, apertado, tremer* | Prática imediata de Respiração Quadrada | Guided Breath Animation |
| **Fase Estável / Saudável** | Média ≥ 7.5 e Streak ≥ 3 | Leitura de Poesia Cognitiva Hipnótica (PCH) | Biblioteca / Diário |
| **Risco Extremo (SOS)** | Frases de ideação ou perigo iminente | Alerta vermelho visual instantâneo | Botão SOS / Telefones de Emergência (CVV 188) |

---

### 4. Fluxo de Dados SentiCore (Data Pipeline)

1. **Ingestão**: O usuário preenche o check-in de humor e escreve livremente no diário. Os dados são salvos com segurança no Firestore (protegidos pelas regras estritas de RBAC).
2. **Análise**: O motor `orchestrateNextStep` processa o vetor de humor histórico de 7 dias e as reflexões escritas através de um parser de sentimentos (verificando agitação, pânico ou melancolia).
3. **Decisão**: A função retorna um objeto `TarefaJornada` contendo o ID, a categoria recomendada (`diario`, `exercicio`, `consulta`, `growth`), descrição acolhedora, destino e recompensa de XP.
4. **Atualização**: A dashboard exibe a jornada guada com as novas diretrizes e o `MeuJardim` regenera o estado visual dos SVGs.
