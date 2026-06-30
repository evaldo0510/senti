# DOCUMENTO 012 — PROMPT DE ENGENHARIA DO CENTRO DE IDENTIDADE & LGPD
## Especificação Técnica de Implementação e Critérios de Aceite para o Google AI Studio

---

## 1. PROPÓSITO DO MÓDULO (IDENTITY CENTER)
O **Centro de Identidade & LGPD** (`IdentityCenter`) é o núcleo centralizado de controle de privacidade, dados cadastrais, segurança criptográfica e conformidade regulatória (LGPD - Lei nº 13.709/2018) da Plataforma SentiPae. 

Este componente foi construído sob uma arquitetura de alta responsabilidade, garantindo que o usuário tenha total clareza, transparência e controle sobre:
1. Seus dados cadastrais primários (Nome, Telefone, Cidade e Biografia Emocional).
2. Sua foto de perfil e escolha de presets de avatares com design inclusivo.
3. Segurança ativa de credenciais (troca de senha) e controle absoluto de dispositivos/sessões em tempo real com revogação remota.
4. Histórico imutável de concessão e revogação de consentimentos LGPD.
5. Portabilidade total de dados em lote (JSON unificado contendo histórico clínico, agendas e chats).
6. Exclusão definitiva de conta com destruição em cascata no Firestore e desativação no Firebase Auth, condicionada a pesquisa de feedback anônimo de saída, reautenticação forçada e frase de confirmação jurídica.

---

## 2. MODELO DE DADOS & COLEÇÕES FIRESTORE

### 2.1 Subcoleção de Sessões Ativas do Usuário
* **Caminho**: `/users/{userId}/sessions/{sessionId}`
* **Estrutura**:
```typescript
interface UserSession {
  id: string;          // ID único gerado na inicialização da aba/dispositivo
  userAgent: string;   // String do navegador/SO
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;     // Nome do navegador (Chrome, Safari, Firefox, etc.)
  os: string;          // Sistema operacional (Windows, macOS, Android, iOS, Linux)
  ip: string;          // Endereço IP detectado via API externa ipify
  location: string;    // Cidade e País baseados em geolocalização do IP
  lastActive: string;  // ISO Date de última atividade
  updatedAt: Timestamp; // Data de atualização no Firestore
}
```

### 2.2 Subcoleção de Logs de Consentimento (Transparência LGPD)
* **Caminho**: `/users/{userId}/consent_logs/{logId}`
* **Estrutura**:
```typescript
interface ConsentLog {
  consentType: 'marketing' | 'communication' | 'research' | 'telemetry';
  granted: boolean;      // True para concedido, False para revogado
  timestamp: string;     // ISO Date da alteração
  userAgent: string;     // Metadados do navegador do cliente
  ip: string;            // Endereço IP do consentimento
}
```

### 2.3 Coleção Global de Pesquisa de Saída (Anonimizada)
* **Caminho**: `/exit_surveys/{surveyId}`
* **Estrutura**:
```typescript
interface ExitSurvey {
  reason: 'goals_met' | 'hard_to_use' | 'face_to_face' | 'too_expensive' | 'other';
  customText: string;    // Campo de texto livre para feedback do usuário
  timestamp: string;     // ISO Date do pedido de exclusão
}
```

---

## 3. REGRAS DE SEGURANÇA DO FIRESTORE (FIRESTORE.RULES)
A segurança de dados de sessões e logs de consentimento deve seguir o princípio do menor privilégio. Somente o dono do cadastro (`isOwner`) ou administradores de sistema autorizados (`isSystemAdmin`) podem ler ou gravar dados nessas subcoleções.

```firestore
// --- Regras para o Subdiretório de Sessões de Usuário ---
match /users/{userId}/sessions/{sessionId} {
  allow read, write: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
}

// --- Regras para logs de consentimento ---
match /users/{userId}/consent_logs/{logId} {
  allow read, write: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
}

// --- Regras para pesquisa de saída (Esquecimento LGPD) ---
match /exit_surveys/{surveyId} {
  allow create: if true; // Permite gravação anônima no momento da exclusão de conta
  allow read, update, delete: if isSystemAdmin();
}
```

---

## 4. FLUXO UX & REQUISITOS DO COMPONENTE (IDENTITYCENTER)

### 4.1 Interface de Navegação
O componente renderiza uma navegação em Abas (Tabs) fluidas com suporte a transições suaves utilizando o Framer Motion (`motion/react`):
* **Dados Pessoais**: Formulário de atualização cadastral síncrono.
* **Foto & Avatar**: Seleção rápida de 6 presets de avatares com design clínico ou campo para link de imagem direto.
* **Segurança**: 
  - Formulário para alteração de senha (escondido para usuários integrados via Google Login).
  - Lista de dispositivos ativos mapeando SO, Navegador, IP, Geolocalização e indicador visual do dispositivo atual.
  - Botão "Encerrar Sessão" para desconectar remotamente qualquer dispositivo.
* **Consentimentos LGPD**:
  - Toggles interativos para ativar/desativar permissões de uso de dados.
  - Tabela de histórico de transparência exibindo todas as datas de concessão e revogação sob auditoria.
  - Botão de Portabilidade em Lote que consolida dados das coleções `users`, `emotion_logs`, `diary_entries`, `feedbacks`, `private_notes`, `appointments` e `messages` em um único arquivo JSON para download instantâneo.
* **Excluir Conta**: Zona crítica com botão para iniciar o fluxo em cascata.

### 4.2 Fluxo de Exclusão de Conta (Cascata Definitiva de 3 Passos)
Para evitar acidentes ou ações impulsivas de pacientes em crise, o processo de exclusão definitiva exige 3 níveis de validação:
1. **Passo 1: Motivo de Saída**: O usuário deve responder a uma pesquisa rápida selecionando um motivo de cancelamento (exibindo um campo de texto adicional caso selecione 'Outro').
2. **Passo 2: Reautenticação Forçada**:
   - Usuário de e-mail/senha deve fornecer sua senha atual.
   - Usuário do Google deve reautenticar via pop-up nativo do Google Auth Provider.
3. **Passo 3: Frase de Esquecimento Definitivo**: O usuário deve digitar manualmente a frase jurídica `EXCLUIR CONTA DEFINITIVAMENTE` (com letras maiúsculas) para liberar o botão final de destruição no Firestore e desativação no Firebase Auth.

---

## 5. CRITÉRIOS DE ACEITE E TESTES DE INTEGRAÇÃO (QA)

| ID | Funcionalidade | Cenário de Teste | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **CA-01** | Portabilidade LGPD | Clicar em "Exportar Meus Dados (JSON)" no painel de consentimentos. | Um arquivo `.json` estruturado contendo todo o histórico clínico, logs de emoções, agendamentos e mensagens do usuário é baixado sem falhas. |
| **CA-02** | Sessões Ativas | Logar em um novo navegador ou guia anônima. | Uma nova linha de sessão aparece em tempo real com o navegador, SO e localização corretos daquela máquina. |
| **CA-03** | Revogação Remota | Clicar em "Encerrar Sessão" na linha de um dispositivo secundário. | O documento do Firestore daquela sessão é apagado e o usuário logado naquele navegador secundário é deslogado na mesma hora. |
| **CA-04** | Auditoria LGPD | Mudar o toggle de consentimento de marketing. | Uma nova linha é registrada instantaneamente na tabela de histórico indicando o timestamp e status atualizado (Concedido/Revogado). |
| **CA-05** | Destruição em Cascata | Concluir o fluxo de exclusão de conta em 3 passos. | Os registros do usuário no Firestore são eliminados de todas as coleções do banco e a credencial do Firebase Auth é excluída de forma definitiva. |

---

## 6. DIRETRIZES DE ESTILO E ACESSIBILIDADE
* **Visual**: Interface imersiva no tema Cosmic Slate do SentiPae (tons profundos de cinza e azul espacial, bordas arredondadas generosas de 2.5rem, tipografia clássica serifada nas abas e títulos com Inter/Mono nos dados).
* **Contraste**: Relação de contraste mínima de 4.5:1 para todo o texto, em total conformidade com a WCAG AA.
* **Estados**: Botões devem exibir estados ativos de clique (`active:scale-95`), spinners de carregamento (`Loader2`) durante requisições de rede, e bordas acentuadas verdes ou vermelhas para feedback contextual.
