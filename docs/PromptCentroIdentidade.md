# PROMPT DE ENGENHARIA PARA IMPLEMENTAÇÃO DO CENTRO DE IDENTIDADE E LGPD (SENTIPAE)

Você é um engenheiro de software sênior especialista em React, Firebase (Firestore, Auth) e segurança de dados (LGPD por Design). Sua tarefa é implementar o **Módulo de Identidade, Sessões Ativas e Conformidade LGPD** da plataforma SentiPae.

Este prompt contém todas as diretrizes de negócios, arquitetura técnica, esquemas de banco de dados, regras de segurança do Firestore, fluxos de interface e critérios de aceitação para que você possa programar esta funcionalidade com perfeição.

---

## 🏗️ 1. REQUISITOS DO MÓDULO E MODELO DE DADOS

O sistema deve centralizar todo o gerenciamento de contas, privacidade e segurança do usuário logado na aba "Centro de Identidade".

### 1.1 Perfil de Usuário (Coleção: `/users/{userId}`)
Atualize e gerencie os seguintes campos no documento principal:
- `nome`: string (obrigatório, limpo de espaços em branco)
- `telefone`: string (opcional, formato de contato)
- `cidade`: string (opcional)
- `biografia`: string (opcional)
- `fotoUrl`: string (URL válida ou preset selecionado)
- `consents`: objeto contendo:
  - `communication`: boolean (alertas e consultas)
  - `marketing`: boolean (dicas e promoções)
  - `research`: boolean (estudos científicos anonimizados)
  - `telemetry`: boolean (melhoria técnica)
- `updatedAt`: timestamp (do servidor)

### 1.2 Subcoleção de Sessões Ativas (Caminho: `/users/{userId}/sessions/{sessionId}`)
Sempre que o usuário fizer login ou acessar o sistema, registre uma nova sessão utilizando metadados locais:
- `id`: string (ID da sessão salvo no localStorage do navegador para correspondência)
- `userAgent`: string (identificador bruto do cliente)
- `deviceType`: 'mobile' | 'tablet' | 'desktop' (derivado do userAgent e largura da tela)
- `browser`: string (ex: "Chrome", "Safari", "Firefox")
- `os`: string (ex: "Windows", "macOS", "iOS", "Android")
- `ip`: string (IP público obtido via serviço externo como https://api.ipify.org)
- `location`: string (Cidade e País baseados no IP via geolocalização ipapi)
- `lastActive`: string (ISO date de atualização)
- `updatedAt`: timestamp (do servidor)

### 1.3 Subcoleção de Logs de Consentimento (Caminho: `/users/{userId}/consent_logs/{logId}`)
Toda alteração de consentimento deve gerar um registro imutável para auditoria legal:
- `consentType`: 'communication' | 'marketing' | 'research' | 'telemetry'
- `granted`: boolean (true para concedido, false para revogado)
- `timestamp`: string (ISO date)
- `userAgent`: string (meta do cliente)
- `ip`: string (IP do usuário no momento da gravação)

### 1.4 Coleção de Pesquisa de Saída (Caminho: `/exit_surveys/{surveyId}`)
Dados de feedback coletados de forma anonimizada na exclusão de conta:
- `reason`: 'goals_met' | 'hard_to_use' | 'face_to_face' | 'too_expensive' | 'other'
- `customText`: string (opcional)
- `timestamp`: string (ISO date)

---

## 🔒 2. REGRAS DE SEGURANÇA DO FIRESTORE (FIRESTORE.RULES)

Insira e valide as regras de acesso para garantir que um usuário nunca possa visualizar ou gravar sessões, dados pessoais ou logs de consentimento de outro indivíduo, a menos que possua permissões administrativas (`admin` / `super_admin`).

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Auxiliares de Autenticação
    function isSignedIn() {
      return request.auth != null;
    }

    function isSystemAdmin() {
      return isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) && (
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('tipo', null) == 'admin' ||
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('tipo', null) == 'super_admin'
             );
    }

    // Regras de Usuário e Subcoleções
    match /users/{userId} {
      allow get: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
      allow update: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
      
      // Controle de Sessões Ativas
      match /sessions/{sessionId} {
        allow read, write: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
      }

      // Controle de Logs de Consentimentos
      match /consent_logs/{logId} {
        allow read, write: if isSignedIn() && (request.auth.uid == userId || isSystemAdmin());
      }
    }

    // Coleção de Feedbacks de Saída
    match /exit_surveys/{surveyId} {
      allow create: if true; // Gravação anônima permitida no expurgo da conta
      allow read, update, delete: if isSystemAdmin();
    }
  }
}
```

---

## 🎨 3. INTERFACE DO USUÁRIO & NAVEGAÇÃO FLUIDA (UI/UX)

Desenvolva o componente principal `IdentityCenter` integrado à página de gerenciamento de dados de forma altamente polida e responsiva, utilizando Tailwind CSS e Framer Motion para transições de abas:

### 3.1 Abas de Gerenciamento:
1. **Dados Pessoais**: Campos elegantes para preenchimento de nome, telefone, cidade de residência e biografia, com botões ativos e spinner de carregamento durante salvamento.
2. **Foto & Avatar**: Grid interativa com 6 presets de avatares estilo ilustrações clínicas e um input de URL direta para foto de perfil.
3. **Segurança**:
   - Gestão de Senha: Campos para troca de senha atual, nova senha e confirmação (com validações de segurança e ocultação para contas Google).
   - Gerenciador de Sessões: Lista de aparelhos conectados. Cada linha exibe um ícone de dispositivo (Smartphone, Tablet ou Laptop), navegador, SO, IP, geolocalização e um botão vermelho "Encerrar Sessão" que deleta o respectivo documento de sessão no Firestore (desconectando remotamente o aparelho).
4. **Consentimentos LGPD**:
   - Toggles dinâmicos de autorização.
   - Botão de Exportação LGPD: Função utilitária que realiza buscas assíncronas nas coleções `users`, `emotion_logs`, `diary_entries`, `feedbacks`, `private_notes`, `appointments` e `messages` filtradas pelo UID do usuário, empacota tudo em um JSON estruturado com metadados de portabilidade e dispara o download automático.
   - Histórico de Auditoria: Tabela de transparência que exibe as datas e logs de consentimento em tempo real direto do Firestore.
5. **Excluir Conta**:
   - Painel com avisos jurídicos claros sobre a irreversibilidade do ato.
   - Botão para iniciar o fluxo em 3 passos:
     * *Passo 1*: Modal com perguntas de motivo da saída.
     * *Passo 2*: Modal de Reautenticação ativa (senha para e-mail/senha, ou pop-up do Google para provedores sociais).
     * *Passo 3*: Campo para digitação da frase de segurança `EXCLUIR CONTA DEFINITIVAMENTE` com validação de caixa alta para liberar o botão final que aciona o backend de exclusão em cascata.

---

## ✅ 4. CRITÉRIOS DE ACEITAÇÃO E DESEMPENHO

1. **Persistência de Sessão**: Cada login em um novo navegador/dispositivo deve registrar dinamicamente um novo documento na subcoleção `/sessions` sem travar a interface.
2. **Revogação Instantânea**: Excluir uma sessão remota deve ser refletido imediatamente no navegador afetado. Uma escuta em tempo real (`onSnapshot`) na sessão atual deve deslogar e expirar a autenticação do usuário caso seu ID seja excluído do Firestore.
3. **Download LGPD Completo**: O download de portabilidade de dados deve unificar dados de múltiplos prontuários e interações sem sobrecarga de memória, de forma assíncrona.
4. **Segurança de Regras**: Todas as tentativas de leitura ou escrita em subcoleções de outros usuários devem ser bloqueadas pelo emulador/banco do Firestore retornando "Missing or insufficient permissions".
5. **Acessibilidade de Cores (WCAG AA)**: Todas as abas, botões ativos, avisos de zona crítica de segurança e tabelas de logs devem possuir uma relação de contraste de cor mínima de 4.5:1 contra os fundos pretos ou ardósia profundos.
