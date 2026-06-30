# SentiPae: Modelo de Domínio (Domain Model)
## Documento 006 — Entidades, Relações e Regras de Ouro

> *"No SentiPae, tudo gira em torno da jornada da pessoa. Nem da IA, nem do terapeuta, nem da instituição contratante. O centro absoluto é sempre o ser humano sob cuidado."*

Este documento formaliza o Modelo de Domínio do ecossistema SentiPae, estruturando suas entidades centrais, responsabilidades, relacionamentos e as regras de ouro que regem a dinâmica comportamental do sistema.

---

### 1. O Grande Diagrama de Relações

Abaixo está representado como o cérebro orquestrador (SentiCore) e as interfaces interagem de forma não acoplada ao redor do **Usuário** e seu **Plano de Cuidado**:

```
                  ┌────────────────────────┐
                  │       SENTICORE        │
                  └───────────┬────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌───────────┐        ┌───────────┐        ┌───────────┐
   │   IARA    │        │  Jornada  │        │Especialist│
   └─────┬─────┘        └─────┬─────┘        └─────┬─────┘
         └────────────────────┼────────────────────┘
                              │
                              ▼
                        ┌───────────┐
                        │  Usuário  │
                        └─────┬─────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Plano de Cuidado  │
                    └─────────┬─────────┘
                              │
       ┌──────────────┬───────┴──────┬──────────────┐
       ▼              ▼              ▼              ▼
 ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
 │  Diário   │  │Agendamento│  │Biblioteca │  │ Programas │
 └───────────┘  └─────┬─────┘  └───────────┘  └───────────┘
                      │
                      ▼
                ┌───────────┐
                │Meu Jardim │
                └───────────┘
```

---

### 2. Catálogo de Entidades Centrais

#### 1. Usuário (Paciente/Beneficiário)
O usuário possui uma identidade viva, ativa e evolutiva no sistema. Não é apenas uma linha de cadastro (record), mas a entidade de onde partem todos os consentimentos e intenções.
* **Responsabilidades**:
  - Manter sua conta ativa e segura.
  - Expressar objetivos e sentimentos espontaneamente ou através de escalas (como o IBS).
  - Interagir com a assistente acolhedora IARA.
  - Registrar sentimentos no Diário Emocional e acompanhar o crescimento do seu Jardim.
  - Construir seu próprio Círculo de Cuidado e contratar profissionais.

#### 2. IARA (Recepcionista Inteligente de Acolhimento)
Entidade de fronteira cognitiva de acolhimento. Ela não pertence de forma isolada a um usuário, mas sim ao ecossistema global.
* **Responsabilidades**:
  - Escutar ativamente e validar sentimentos de forma empática e imediata.
  - Identificar contextos, níveis de estresse e possíveis crises.
  - Apoiar o usuário em momentos difíceis com pílulas de Poesia Cognitiva Hipnótica (PCH) e técnicas de respiração.
  - Facilitar a organização e o direcionamento na jornada, sugerindo o contato com profissionais do ecossistema de forma humanizada.
  - *Restrição*: Rigorosamente proibida de realizar diagnósticos ou prescrições clínicas.

#### 3. SentiCore (O Cérebro do Ecossistema)
Entidade invisível responsável pelo processamento lógico de regras de negócio complexas, cruzamento de dados e coordenação de fluxo.
* **Responsabilidades**:
  - Orquestrar a comunicação assíncrona entre módulos e serviços.
  - Calcular indicadores de engajamento, bem-estar e progresso.
  - Gerar e reavaliar recomendações de "Próximo Passo" personalizadas.
  - Monitorar gatilhos silenciosos de vulnerabilidade para acionar o protocolo SOS.

#### 4. Minha Jornada (Trilha Dinâmica)
Entidade que gerencia o fluxo de auto-descoberta e evolução pessoal.
* **Responsabilidades**:
  - Mapear os objetivos definidos e as conquistas (badges) obtidas.
  - Monitorar a conclusão de tarefas práticas sugeridas.
  - Consolidar o histórico sequencial de mudanças comportamentais do usuário.

#### 5. Profissional (Terapeuta/Especialista Multidisciplinar)
Representa psicólogos, psicanalistas, nutricionistas, educadores físicos, assistentes sociais e terapeutas cadastrados na rede.
* **Responsabilidades**:
  - Disponibilizar sua agenda de horários e valores.
  - Conduzir teleatendimentos síncronos de forma segura e humanizada.
  - Redigir e manter Prontuários e Evoluções Clínicas imutáveis.
  - Customizar recomendações de conteúdo da Biblioteca diretamente para os pacientes vinculados.

#### 6. Círculo de Cuidado (Care Circle)
Entidade exclusiva que modela a governança de compartilhamento de dados médicos e multidisciplinares do usuário.
* **Responsabilidades**:
  - Registrar as parcerias terapêuticas ativas vinculadas ao usuário.
  - Armazenar o escopo de permissões concedido explicitamente pelo usuário a cada profissional especialista.
  - Permitir a revogação instantânea de acesso a diários, hábitos ou logs corporativos.

#### 7. Programa (Jornada de Aprendizado Estruturada)
Trilhas guiadas temáticas focadas no desenvolvimento de habilidades e saúde mental.
* **Responsabilidades**:
  - Organizar etapas cronológicas, exercícios diários e meditações direcionadas.
  - Fornecer acompanhamento de fixação de hábitos saudáveis.
  - Emitir certificados ou conquistas ao término da trilha.

#### 8. Conteúdo (Biblioteca de Recursos)
Átomos de informação disponíveis para consumo síncrono ou recomendação.
* **Responsabilidades**:
  - Classificar mídias (artigos, áudios de relaxamento, vídeos explicativos, poesias PCH) em categorias emocionais e de bem-estar.
  - Servir de insumo para o motor de matchmaking do SentiCore.

#### 9. Instituição (Tenant)
Empresas, prefeituras, hospitais, ONGs ou universidades que contratam a plataforma para suas respectivas comunidades.
* **Responsabilidades**:
  - Configurar políticas e identidades corporativas próprias.
  - Gerenciar a elegibilidade dos seus beneficiários associados.
  - Acessar indicadores estatísticos macro de saúde ocupacional, resguardando totalmente a confidencialidade individual (LGPD).

#### 10. Marketplace / Rede de Especialistas
Mapeador comercial inteligente do ecossistema.
* **Responsabilidades**:
  - Apresentar o catálogo unificado de serviços e profissionais disponíveis.
  - Facilitar a escolha de especialidades sob medida a partir dos insights éticos sugeridos pelo SentiCore.

#### 11. Agendamento (Sessão / Consulta)
O contrato transacional síncrono que une um usuário a um profissional em determinada janela de tempo.
* **Responsabilidades**:
  - Reservar o horário na agenda de ambas as partes.
  - Gerar a sala virtual criptografada de teleatendimento.
  - Disparar lembretes automáticos e gerenciar confirmações ou remarcações de compromisso.

#### 12. Meu Jardim (Gamificação Emocional)
Metáfora visual que representa a consistência do usuário em sua rotina de cuidado.
* **Responsabilidades**:
  - Evoluir o estado visual do jardim (de Semente 🌿 a Florescer 🌸) baseado em hábitos concluídos e registros diários.
  - Estimular a continuidade sem julgamentos de valor ou punição (foco no acolhimento).

---

### 3. Nova Entidade Estratégica: O Plano de Cuidado (Care Plan)

Para unificar a percepção do usuário e evitar que as funcionalidades apareçam de forma fragmentada, introduzimos a entidade **Plano de Cuidado**. 

O Plano de Cuidado reúne, em uma interface única e integrada, as seguintes camadas:
1. **Foco do Momento**: Os objetivos terapêuticos ativos pactuados entre o usuário, a IARA e seus especialistas.
2. **Equipe de Apoio**: Atalhos de conexão rápida com os integrantes ativos do seu *Círculo de Cuidado*.
3. **Minhas Práticas**: Programas guiados e rotinas de hábitos programados para a semana.
4. **Próximos Passos**: Recomendações em tempo real do SentiCore (ex: "Consumir a poesia 'Calmaria' hoje às 20h" ou "Agendar sessão de retorno com Psicóloga Ana").

Com isso, o usuário não precisa navegar por vários menus soltos; ele acompanha toda a sua jornada de forma linear e harmônica no seu Plano de Cuidado unificado.

---

### 4. As Regras de Ouro do Domínio SentiPae

1. **A pessoa sempre está no centro**: Toda decisão técnica, de layout ou de banco de dados deve beneficiar e respeitar o ritmo de autocuidado do usuário final.
2. **A IA organiza e acolhe, mas nunca substitui profissionais**: A IARA atua como ponte e suporte emocional imediato; diagnósticos e evoluções clínicas são prerrogativas exclusivas de profissionais de saúde humanos habilitados.
3. **Propriedade dos dados**: As informações e registros de sentimentos pertencem integralmente ao usuário. Ele detém a posse de sua narrativa emocional.
4. **Consentimento Explícito para Compartilhamento**: Nenhuma informação clínica ou anotação pessoal é visível a terceiros sem a ativação explícita do respectivo profissional no *Círculo de Cuidado* ou de forma agregada anonimizada no painel de estatísticas institucionais.
5. **Desacoplamento de evolução**: Os módulos do sistema (Diário, Agenda, Marketplace, Biblioteca) devem evoluir de forma independente, comunicando-se exclusivamente por meio de eventos ou do barramento de serviços do SentiCore.
6. **Cuidado Contínuo**: A saúde mental não ocorre apenas no momento de uma consulta clínica isolada de 50 minutos. Ela é sustentada pelo acompanhamento diário, suporte da IARA e práticas consistentes de reflexão.
