# DATABASE.md
## Modelo de Dados e Arquitetura de Banco de Dados — SentiPae Platform

Este documento detalha o esquema físico e conceitual do Firestore, controle de coleções, relacionamentos, indexação e as regras de segurança táticas para garantir a integridade dos dados e conformidade estrita com a LGPD.

---

### 1. MODELO DE COLEÇÕES (FIRESTORE)

#### Coleção: `users`
Armazena perfis individuais de todos os usuários cadastrados (pacientes, terapeutas, administradores).
*   **Campos**:
    *   `id`: string (UID do Firebase Auth) [Primary Key]
    *   `nome`: string
    *   `email`: string
    *   `tipo`: string ("paciente" | "terapeuta" | "empresa_admin" | "prefeitura_admin" | "admin")
    *   `status`: string ("ativo" | "pendente" | "suspenso")
    *   `tenantId`: string (ID da prefeitura, empresa ou clínica contratante, nulo para usuários independentes)
    *   `iccValue`: number (0 a 100 - Índice de Continuidade do Cuidado calculado)
    *   `createdAt`: timestamp
    *   `updatedAt`: timestamp

#### Coleção: `appointments`
Gerencia agendamentos e teleconsultas de forma integrada.
*   **Campos**:
    *   `id`: string [Primary Key]
    *   `pacienteId`: string (Ref `users.id`)
    *   `pacienteNome`: string
    *   `terapeutaId`: string (Ref `users.id`)
    *   `terapeutaNome`: string
    *   `data`: timestamp
    *   `status`: string ("scheduled" | "completed" | "cancelled" | "no_show")
    *   `reviewed`: boolean
    *   `rating`: number (1 a 5)
    *   `createdAt`: timestamp

#### Coleção: `mood_entries`
Histórico de humor do paciente para acompanhamento do bem-estar emocional.
*   **Campos**:
    *   `id`: string [Primary Key]
    *   `userId`: string (Ref `users.id`)
    *   `score`: number (1 a 10)
    *   `feeling`: string (nome do sentimento principal)
    *   `activities`: array of strings
    *   `note`: string (anotação opcional do usuário)
    *   `createdAt`: timestamp

#### Coleção: `private_notes` (E2EE Criptografado)
Anotações clínicas sigilosas feitas pelos terapeutas durante os atendimentos.
*   **Campos**:
    *   `id`: string [Primary Key]
    *   `patientId`: string (Ref `users.id`)
    *   `therapistId`: string (Ref `users.id`)
    *   `encryptedContent`: string (Texto criptografado em AES-256 no cliente/servidor)
    *   `encryptionKeySalt`: string (Salt para derivação da chave ou chave protegida)
    *   `createdAt`: timestamp

#### Coleção: `audit_logs` (Segurança & LGPD)
Histórico permanente e imutável de acessos e modificações de informações sensíveis.
*   **Campos**:
    *   `id`: string [Primary Key]
    *   `userId`: string (Aquele que disparou a ação)
    *   `patientId`: string (Aquele que teve o dado acessado)
    *   `action`: string ("READ_PIU" | "WRITE_CLINICAL_NOTE" | "EXPORT_DATA" | "SOS_TRIGGERED")
    *   `details`: string (Detalhamento técnico)
    *   `timestamp`: timestamp

#### Coleção: `organizations` (Multi-Tenancy)
Configurações para entidades B2B (Empresas parceiras, clínicas e secretarias de saúde municipais).
*   **Campos**:
    *   `id`: string [Primary Key]
    *   `nome`: string
    *   `tipo`: string ("prefeitura" | "empresa" | "clinica")
    *   `domain`: string (ex: "saude.municipio.gov.br")
    *   `activeUsersCount`: number
    *   `createdAt`: timestamp

---

### 2. REGRAS DE SEGURANÇA DO FIRESTORE (firestore.rules)
O acesso deve seguir o princípio do menor privilégio:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Auxiliares de Validação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Regras da Coleção de Usuários
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (isOwner(userId) || resource.data.tenantId == request.auth.token.tenantId);
    }
    
    // Regras de Evolução e Notas Clínicas Privadas (E2EE)
    match /private_notes/{noteId} {
      allow write: if isAuthenticated() && request.auth.uid == request.resource.data.therapistId;
      allow read: if isAuthenticated() && (request.auth.uid == resource.data.therapistId || request.auth.uid == resource.data.patientId);
    }
    
    // Histórico de Humor (Apenas o próprio usuário ou seu terapeuta vinculado lê)
    match /mood_entries/{entryId} {
      allow read, write: if isAuthenticated() && (isOwner(resource.data.userId) || request.auth.uid == resource.data.therapistId);
    }
    
    // Log de Auditoria (Apenas gravação é liberada para usuários logados, leituras restritas aos admins)
    match /audit_logs/{logId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated() && request.auth.token.admin == true;
    }
  }
}
```

---

### 3. RELACIONAMENTOS E ÍNDICES COMPLEXOS
*   **Índice Composto 1**: `appointments` -> `pacienteId` (Asc) + `data` (Desc) - Otimização de renderização do histórico de consultas do paciente.
*   **Índice Composto 2**: `mood_entries` -> `userId` (Asc) + `createdAt` (Desc) - Alimentação instantânea do gráfico de tendências emocionais de 7 e 30 dias.
*   **Integridade Referencial**: Embora o Firestore seja NoSQL, os IDs de referência devem ser validados via código de serviço antes de qualquer inserção para garantir que registros órfãos nunca sejam gerados.
