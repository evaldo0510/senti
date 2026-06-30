# SENTICORE SDK — BLUEPRINT DE ARQUITETURA E INTEGRAÇÃO
## Camadas Desacopladas de Coordenação do Cuidado Emocional

Este documento especifica os contratos de integração, a divisão em camadas e o modelo de consumo do **SentiCore SDK** para parceiros institucionais do SentiPae (clínicas, empresas, prefeituras e universidades).

---

## 1. VISÃO GERAL DO SENTICORE SDK

O **SentiCore SDK** é o núcleo de orquestração de cuidado emocional que permite que sistemas parceiros consumam as capacidades inteligentes do SentiPae de forma modular. 

A arquitetura foi projetada sob o princípio de **desacoplamento total da infraestrutura**, permitindo que os serviços externos (como Firebase Firestore ou Google Gemini) possam ser substituídos ou complementados sem impactar as regras de negócio clínicas ou a apresentação ao usuário.

---

## 2. ARQUITETURA EM 4 CAMADAS

```text
+-------------------------------------------------------------+
| Layer 1: Interface (React components, AppDashboard, Pages)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 2: Application (Use Cases, Local State, userService)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 3: SentiCore (Agents Orquestrator, Decision Engine)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Layer 4: Infrastructure (Firestore, Gemini, Live, Push SDK) |
+-------------------------------------------------------------+
```

### Camada 1 — Interface (Apresentação)
Focada em componentes UI reusáveis, alta densidade de dados e responsividade.
- **Páginas**: `src/pages/` (Ex: `DashboardPaciente`, `Diario`, `Respiracao`, `Security`).
- **Componentes**: `src/components/` (Ex: `IdentityCenter` contendo o Centro de Privacidade, `IARAChat`, `D3MoodHistory`).
- **Princípio**: Nenhum componente visual deve fazer chamadas diretas a APIs de IA ou inicializar conexões de banco de dados diretamente; todos consomem hooks ou serviços da Camada 2.

### Camada 2 — Aplicação (Regras de Negócio & Casos de Uso)
Gerencia o fluxo de trabalho do usuário, validações de negócios e políticas locais.
- **Arquivos**: `src/services/` (Ex: `userService.ts`, `sessionService.ts`, `gamificationService.ts`).
- **Gerenciador de Sessão**: Valida o papel de acesso (RBAC), manipula tokens e gerencia o ciclo de vida do login.
- **Princípio**: Abstrai as operações de dados. Se o usuário mudar do Firestore para um banco SQL relacional local, apenas os adaptadores na Camada 4 são alterados. Os serviços em `src/services/` permanecem idênticos.

### Camada 3 — SentiCore (Orquestração de Inteligência)
O cérebro cognitivo do SentiPae. Responsável por coordenar os agentes e gerar diretrizes.
- **Arquivos**: `src/core/` (Ex: `src/core/orchestrator/router.ts`, `src/core/orchestrator/decisionEngine.ts`).
- **Agentes**: Agente de Crise (`CrisisAgent`), Agente de Onboarding (`OnboardingAgent`), etc.
- **Roteamento Ético**: Direciona mensagens baseando-se em gatilhos e pontuações de vulnerabilidade (como detecção de ideação suicida para acionamento do `SOSButton` humano).

### Camada 4 — Infraestrutura (Servidores & Serviços Externos)
Serviços e adaptadores de baixo nível para comunicação externa.
- **Firestore**: Armazenamento com regras de isolamento de tenants (`firestore.rules`).
- **Gemini & Live API**: Modelos generativos para diálogos inteligentes por áudio ou texto de baixíssima latência.
- **OneSignal & Google Analytics**: Motores de push notifications inteligentes e métricas corporativas agregadas.

---

## 3. MODELO DE CONSUMO MULTI-TENANT

O SentiCore SDK permite instanciar ambientes corporativos isolados chamados **Tenants**. Cada parceiro possui seu próprio identificador (`tenantId`).

### Casos de Uso de Integração

#### 1. Clínicas & Hospitais (Senti Clinic)
- **Módulos Consumidos**: Agenda, Teleatendimento e Prontuário Inteligente Unificado (PIU).
- **Como funciona**: A clínica incorpora o PIU em seus sistemas internos. Os psicólogos consultam o diário de humor dos pacientes (desde que expressamente autorizados através do **ConsentManager** na Camada de Interface).

#### 2. Prefeituras & Órgãos Públicos (Senti Public)
- **Módulos Consumidos**: Programas de Cuidado Coletivo, Triagem Avançada e Matchmaking Georreferenciado.
- **Como funciona**: O cidadão realiza o check-in emocional na interface simplificada. Se houver risco moderado a grave, a Camada SentiCore encaminha o caso automaticamente para o assistente social mais próximo cadastrado no tenant da prefeitura.

#### 3. Empresas (Senti Business)
- **Módulos Consumidos**: Biblioteca de Conteúdos, PCH Player de Respiração e Relatório de Bem-Estar Corporativo.
- **Como funciona**: Colaboradores interagem anonimamente com a IARA. A empresa recebe um painel consolidado com o Índice de Continuidade do Cuidado (ICC) médio da organização, sem violar a privacidade individual assegurada pela LGPD.

---

## 4. CONTRATO DO CONSENT_MANAGER (LGPD)

Toda informação sensível de saúde transacionada no SentiCore SDK é resguardada por assinaturas digitais de consentimento.

### Schema do Consentimento Clínico (`consents` collection)
```json
{
  "id": "consent_1298418491",
  "userId": "paciente_uid_abc",
  "userName": "Evaldo Silva",
  "therapistId": "terapeuta_uid_xyz",
  "therapistName": "Dra. Helena Souza",
  "type": "clinical_sharing",
  "status": "active", // "active" | "revoked"
  "grantedAt": "2026-06-30T10:00:00Z",
  "revokedAt": null,
  "documentHash": "SHA256-8349fa89481bfe19417d4a20b8f090ce",
  "ipAddress": "189.120.34.12",
  "userAgent": "Mozilla/5.0..."
}
```

### Regra de Segurança Firestore (Garantia de Ownership)
```javascript
match /consents/{consentId} {
  allow get, list: if isSignedIn() && (
    resource.data.userId == request.auth.uid || 
    resource.data.therapistId == request.auth.uid || 
    isSystemAdmin(database)
  );
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isSystemAdmin(database));
}
```

---

## 5. RECOMENDAÇÕES PARA EVOLUÇÃO

1. **Abstração de Interfaces**: Sempre crie interfaces TypeScript abstratas (Ex: `IAuthService`, `IDatabaseService`) e implemente-as em adaptadores separados, evitando amarrar chamadas nativas de frameworks diretamente no fluxo de controle das telas.
2. **Logs Auditáveis de Transação**: Para cada acesso de leitura feito por profissionais de saúde a dados de terceiros, a Camada 4 deve, de maneira compulsória, gerar um registro correspondente na coleção `auditLogs` contendo o carimbo de data/hora, ID do profissional e IP.
