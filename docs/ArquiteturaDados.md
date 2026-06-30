# SentiPae: Arquitetura de Dados (Data Architecture)
## Documento 005 — Estrutura, Modelagem e Privacidade

> *"O banco de dados do SentiPae existe para contar a história da jornada do usuário, não apenas para persistir registros isolados."*

Este documento detalha o desenho lógico do banco de dados (Cloud Firestore e extensões relacionais), as principais coleções do sistema, os mecanismos de conformidade com a LGPD, o modelo do **Cofre Digital** e a estratégia de multi-tenancy para isolamento institucional.

---

### 1. Filosofia de Modelagem: O Usuário como Centro

No SentiPae, as informações não são tratadas de forma estática. Elas orbitam a jornada do usuário em tempo real. A estrutura conecta as necessidades de acolhimento emocional, desenvolvimento de hábitos e acompanhamento clínico multidisciplinar:

```
                  ┌──────────────┐
                  │   Usuário    │
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Minha Jornada│ │    IARA      │ │ Profissionais│
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Meu Jardim  │ │ Diário Emoc. │ │  Evoluções   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

### 2. Principais Coleções (Core Collections Schema)

Abaixo está o mapeamento conceitual das coleções fundamentais, seus objetivos e principais dados:

#### A. `users`
Guarda as credenciais básicas de acesso e controle da conta ativa:
- `uid` (ID do documento, fornecido pelo Firebase Auth).
- `nome`, `email`, `fotoUrl`.
- `tipo` (`'usuario' | 'terapeuta' | 'admin' | 'super_admin' | 'empresa' | 'prefeitura' | 'clinica' | 'hospital'`).
- `tenantId` (Id da instituição vinculadora, se houver).
- `createdAt` (data de criação), `status` (`'ativo' | 'suspenso'`).
- `xp`, `level`, `streak` (dados agregados de engajamento diário).

#### B. `profiles`
Informações ampliadas de bem-estar, hábitos e contexto de cuidado, desacopladas da credencial de login para maior isolamento e otimização:
- `userId` (referência a `users.uid`).
- `objetivos` (lista de prioridades de saúde e acolhimento).
- `interesses` (temas preferidos, ex: meditação, controle de ansiedade).
- `habitos` (rotina, qualidade do sono, atividades físicas de referência).
- `preferencias` (modo escuro, voz preferida na IA, notificações).

#### C. `journeys`
Controle dinâmico e cronológico da jornada individual:
- `userId` (referência a `users.uid`).
- `objetivosAtivos` (metas em andamento).
- `conquistas` (badge IDs recebidos).
- `etapasConcluidas` (módulos ou trilhas finalizadas).
- `proximosPassos` (recomendações do SentiCore aguardando ação).
- `historicoPassos` (registro temporal de metas alcançadas).

#### D. `conversations` e `messages`
Histórico de conversações com a recepcionista inteligente IARA:
- `conversationId` (ID único do chat).
- `userId` (ID do usuário participante).
- `createdAt`, `updatedAt` (carimbos de data).
- `resumoAutomatico` (síntese gerada periodicamente pela IA, rotulada explicitamente).
- `sub-coleção: messages`:
  - `sender` (`'user' | 'iara'`).
  - `text` (conteúdo textual).
  - `timestamp` (data e hora exatas).
  - `audioUrl` (caminho no Storage se a mensagem foi por voz via Google Live).

#### E. `recommendations`
Registros das sugestões enviadas pelo motor orquestrador SentiCore:
- `recommendationId` (ID único).
- `userId` (ID do destinatário).
- `tipo` (`'exercicio' | 'conteudo_biblioteca' | 'programa' | 'consulta_profissional'`).
- `itemId` (ID do recurso sugerido).
- `status` (`'sugerido' | 'visualizado' | 'concluido' | 'rejeitado'`).
- `timestamp` (data e hora do cálculo).

#### F. `care_circle` (Círculo de Cuidado)
Controle explícito de compartilhamento e vínculos entre o usuário e seus profissionais:
- `circleId` (ID único).
- `userId` (ID do usuário/paciente).
- `profissionalId` (ID do terapeuta).
- `tipoProfissional` (`'psicologo' | 'nutricionista' | 'assistente_social' | etc.`).
- `dataInicio` (vínculo inicial).
- `status` (`'ativo' | 'revogado'`).
- `permissoesConcedidas` (lista de chaves, ex: `['diario', 'registro_alimentar', 'habitos']`).

#### G. `professionals`
Cadastro especializado dos especialistas credenciados:
- `uid` (ID do usuário em `users`).
- `registroProfissional` (CRP, CRN, etc.).
- `especialidades` (competências e áreas de atuação).
- `formacao` (títulos e cursos relevantes).
- `localizacao` (endereço físico ou indicação de teleatendimento puro).
- `modalidadesAtendimento` (`['online', 'presencial']`).
- `valoresSessao` (precificação).
- `avaliacaoMedia` (nota dos usuários agregada de forma anônima).

#### H. `institutions`
Parâmetros das organizações contratantes que estruturam a multi-tenancy lógica:
- `tenantId` (ID único da instituição).
- `nome`, `cnpj`, `tipo` (`'empresa' | 'prefeitura' | 'clinica' | 'hospital' | 'universidade'`).
- `configuracoes` (logotipo, cores institucionais, sementes de poesia ativas).
- `statusAssinatura` (`'ativo' | 'suspenso'`).

#### I. `subscriptions`, `marketplace` e `audit_logs`
- **`subscriptions`**: Planos ativos, termos de faturamento e benefícios associados.
- **`marketplace`**: Produtos disponíveis (agendas de consulta, programas estendidos, materiais complementares).
- **`audit_logs`**: Tabela imutável registrando ações críticas, como visualização de diário, alteração de privilégios de acesso ou login fora do padrão geográfico habitual.

---

### 3. Coleções Otimizadas para Inteligência Artificial (AI Ready Data)

Para que o SentiCore e a IARA ofereçam suporte sem processar volumes massivos e redundantes de chats a cada interação, implementamos as seguintes tabelas de suporte cognitivo:

* **`ai_memory`**: 
  - Estrutura de fatos resumidos e de longo prazo autorizados pelo usuário.
  - Ex: *"Usuário prefere meditação matinal"*, *"Prefere comunicação direta sem metáforas"*, *"Evitar gatilhos associados a barulho excessivo"*.
* **`ai_recommendations`**:
  - Armazena o feedback histórico sobre a utilidade das intervenções anteriores (ex: se o usuário gostou do poema ou achou o exercício de respiração útil).
* **`ai_sessions`**:
  - Controle das sessões em tempo real do Google Live (tokens temporários, canais de áudio ativos e latência de resposta).

---

### 4. Privacidade e Segurança: Cofre Digital e LGPD

O SentiPae adota o princípio da **privacidade por design (Privacy by Design)**:

#### O Cofre Digital (Digital Vault)
É uma área exclusiva no painel do usuário que serve como central de governança de dados. Através dele, o usuário consegue:
1. **Ver quem tem acesso**: Lista ativa de profissionais no seu `care_circle` e quais permissões foram atribuídas.
2. **Revogar acesso instantaneamente**: Ao clicar em revogar, a regra do Firestore invalida imediatamente a consulta do profissional correspondente àquela sub-coleção do paciente.
3. **Gerenciar Consentimentos**: Histórico de concordância com termos de uso e política de privacidade.

#### Direito à Portabilidade e Exclusão (Direito de ser Esquecido)
A estrutura de dados permite que a exclusão de dados ocorra de forma coordenada, respeitando obrigações legais de prontuários médicos (onde o histórico clínico do profissional deve ser guardado por tempo legal determinado por conselhos profissionais federais):
- Dados do Diário e Perfis Pessoais são apagados de forma definitiva.
- Prontuários gerados por profissionais são congelados e arquivados eletronicamente em conformidade com o prazo legal, com acesso totalmente bloqueado ao público.

---

### 5. Arquitetura Multi-Tenant Lógica

O ecossistema divide as instituições através de chaves de isolamento. Toda leitura de dados organizacionais valida de forma imutável a posse do `tenantId`:

```javascript
// Exemplo conceitual de regra de segurança (Firestore Security Rules)
match /emotion_logs/{logId} {
  allow read: if isSignedIn() && (
    resource.data.userId == request.auth.uid || 
    (resource.data.tenantId == getUserTenantId() && getUserType() == 'admin_institucional_anonimo')
  );
}
```

Isso impede que dados de saúde de colaboradores de uma prefeitura ou corporação vazem ou se misturem com os dados de outra instituição parceira.
