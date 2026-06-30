# SentiPae: Arquitetura da Inteligência Artificial (AI Architecture)
## Documento 008 — Motores Cognitivos, Orquestração e Ética do Cuidado

> *"A Inteligência Artificial existe para ampliar o cuidado humano, nunca para substituí-lo. No SentiPae, a IA é o meio; a sensibilidade e o julgamento clínico humano são os fins."*

Este documento detalha o desenho da infraestrutura de Inteligência Artificial do SentiPae, estruturando a interação entre a IARA, o Google Live, os modelos Gemini, o orquestrador central SentiCore e as salvaguardas éticas e operacionais de supervisão humana.

---

### 1. A Pirâmide da Inteligência (Cognitive Hierarchy)

Para garantir integridade, segurança de dados e uma experiência humanizada, a inteligência do sistema é organizada de forma hierárquica e modular:

```
                  ┌────────────────────────┐
                  │       SENTICORE        │
                  │(Orquestrador Cognitivo)│
                  └───────────▲────────────┘
                              │
                  ┌───────────┴────────────┐
                  │    IARA (Interface)    │
                  └───────────▲────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌───────────┐        ┌───────────┐        ┌───────────┐
   │Google Live│        │Gemini SDK │        │Outras IAs │
   │  (Voz)    │        │  (Texto)  │        │(Extensões)│
   └───────────┘        └───────────┘        └───────────┘
                              ▲
                              │
                  ┌───────────┴────────────┐
                  │    Dados Autorizados   │
                  └────────────────────────┘
```

#### Nível 1 — Dados Autorizados
A base da pirâmide. Representa os dados armazenados que o usuário concedeu permissão explícita para que a IA consuma (ex: histórico emocional resumido, preferências de diálogo, metas ativas no Plano de Cuidado).

#### Nível 2 — Google Live, Gemini & Modelos Cognitivos
Camada de processamento bruto de linguagem, áudio, tradução e síntese emocional. Traduz a intenção do usuário (seja em texto ou voz síncrona de baixíssima latência) em dados estruturados.

#### Nível 3 — IARA (A Persona de Acolhimento)
A única interface de IA com a qual o usuário interage diretamente. A IARA coordena a conversa de forma empática, leve e foca inteiramente no acolhimento, validação de sentimentos e direcionamento de rotina.

#### Nível 4 — SentiCore (O Orquestrador Geral)
O cérebro estratégico do ecossistema. O SentiCore não interage diretamente na conversa de chat, mas dita as regras para a IARA baseando-se nas configurações do Plano de Cuidado do usuário, integridade clínica e segurança de dados.

---

### 2. Funções e Responsabilidades de Cada Camada

#### A. Camada IARA (Interface Humana Inteligente)
A IARA atua como a recepcionista calorosa e companheira diária de jornada:
* **Escuta e Empatia**: Oferece acolhimento imediato a qualquer hora do dia ou da noite.
* **Tirador de Dúvidas**: Esclarece o funcionamento da plataforma, dos programas e da biblioteca de conteúdos.
* **Estimulador de Hábitos**: Lembra o usuário de suas práticas diárias, celebra pequenas vitórias e o incentiva a regar seu Jardim.
* **Facilitadora de Conexões**: Identifica quando o usuário pode se beneficiar de apoio clínico humano e oferece pontes com a Rede de Especialistas de forma sutil e natural.
* *Restrição Crítica*: Nunca simula diagnósticos médicos, nunca receita medicamentos ou tratamentos e nunca substitui sessões terapêuticas.

#### B. Camada Google Live (Voz Síncrona e Naturalidade)
Responsável por humanizar a comunicação através da voz em tempo real:
* **Voz de Baixíssima Latência**: Permite diálogos falados quase sem pausas de processamento.
* **Interrupção Espontânea**: O usuário pode interromper a fala da IARA a qualquer momento, e ela silenciará imediatamente para ouvir, replicando a dinâmica de um diálogo humano natural.
* **Reconhecimento & Transcrição Inteligente**: Compreende tonalidades, entonações e pausas na fala.
* **Síntese de Voz Emocional**: Adapta o tom de fala para ser suave, paciente e acolhedor.

#### C. Camada Gemini (Compreensão e Síntese Linguística)
O motor semântico de processamento:
* **Compreensão de Linguagem Natural**: Interpreta gírias, expressões idiomáticas e nuances emocionais em português.
* **Sumarização Cognitiva**: Resume conversas de chat complexas para que os terapeutas (quando autorizados no Círculo de Cuidado) tenham uma pauta precisa das variações de humor do paciente ao longo da semana.
* **Suporte à Recomendação**: Auxilia na seleção e contextualização de poesias (PCH), meditações ou exercícios mais adequados para o humor atual do usuário.

#### D. Camada SentiCore (O Cérebro de Negócios)
O orquestrador por trás dos bastidores que garante a segurança sistêmica:
* **Decisão de Próxima Ação**: Avalia os inputs processados pela IARA e define a melhor intervenção (ex: sugerir uma prática respiratória, exibir uma poesia ou elevar o alerta de segurança).
* **Gestão de Segurança (SOS/Crises)**: Ativa protocolos de segurança física em casos de ideações graves ou sofrimento emocional agudo.
* **Controle de Consentimento**: Limita o acesso de todas as IAs apenas ao escopo de memória expressamente autorizado no Cofre Digital.

---

### 3. Mecanismos de Fluxo de Conversação Inteligente

O ciclo de atendimento da IA segue um caminho robusto de validação de dados antes de produzir respostas:

```
[Usuário Fala/Digita] 
       │
       ▼
[Google Live / Gemini] ──► Traduz fala/texto para intenção semântica
       │
       ▼
[SentiCore Orquestrador] ──► Consulta histórico, preferências e Plano de Cuidado
       │
       ▼
[Processamento de Regras] ──► Avalia gatilhos de crise, SOS ou sugestões ativas
       │
       ▼
[Construção da Resposta] ──► IARA formata retorno empático e seguro
       │
       ▼
[Envio ao Usuário]
```

---

### 4. Memória Inteligente e Contexto de Longo Prazo

Diferente de IAs genéricas que esquecem toda a conversa ao fechar o app ou que guardam transcrições infinitas invadindo a privacidade, o SentiPae adota o conceito de **Memória Sintética de Longo Prazo**:
- **O que a IA armazena**: Apenas fatos comportamentais e preferências úteis autorizados (ex: *"Usuário sente-se mais calmo ouvindo poesias de manhã"*, *"Prefere práticas rápidas de até 5 minutos"*, *"Registrou metas para qualidade do sono"*).
- **Como é gerenciado**: O usuário pode visualizar exatamente o que a IARA "sabe" sobre ele no Cofre Digital, podendo editar ou apagar esses fatos a qualquer momento.
- **Isolamento**: As conversas detalhadas são periodicamente sumarizadas e os logs brutos expiram ou são criptografados, minimizando o risco de vazamento de informações íntimas.

---

### 5. IA para Profissionais, Empresas e Instituições

#### Apoio aos Especialistas (Cuidado Ampliado)
Os profissionais do Círculo de Cuidado contam com ferramentas analíticas opcionais para otimizar suas consultas:
* **Pauta Terapêutica**: Resumos estruturados do diário emocional e variações do IBS ao longo do mês, economizando tempo clínico de anamnese.
* **Recomendações Clínicas**: Sugestões de conteúdos da Biblioteca para que o terapeuta "receite" como prática de autocuidado entre as sessões.
* **Alertas de Acompanhamento**: Lembretes inteligentes baseados em metas combinadas na última sessão com o paciente.

#### Insights Institucionais (Total Anonimato)
Empresas e prefeituras recebem relatórios de saúde populacional sem violação de individualidade:
* Indicadores agregados de adesão aos programas de bem-estar.
* Taxas de estresse ou cansaço estatísticos do grupo para guiar campanhas internas de saúde mental (Ativação de Sementes Emocionais).

---

### 6. Transparência Algorítmica e Supervisão Humana

A integridade ética do SentiPae é garantida por regras claras de sinalização e protocolos de controle:

1. **Sinalização Explicita**: Todo conteúdo gerado, sugerido ou escrito de forma autônoma pela IA é acompanhado de um selo claro (ex: *"Produzido pela inteligência IARA"*), diferenciando-o de pílulas clínicas criadas por especialistas humanos ou campanhas institucionais.
2. **Protocolo de Crise e SOS**: Em caso de identificação de termos que denotem ideação de autolesão ou riscos agudos à integridade física:
   - A IARA suspende imediatamente tentativas de intervenção conversacional longa.
   - Apresenta de forma proeminente o **Botão SOS** e atalhos de conexão rápida com serviços de utilidade pública (como o CVV no Brasil) e profissionais de saúde humana disponíveis.
   - Incentiva de forma doce e firme o contato imediato com um ser humano de confiança.
3. **Escalada Sutil para Cuidado Humano**: A IARA monitora a recorrência de desabafos e, quando conveniente, sugere de forma amigável a consulta com um terapeuta:
   > *"Estou adorando te apoiar aqui, mas sinto que conversar com um especialista humano fará uma diferença incrível para você agora. Quer ver os profissionais disponíveis na nossa Rede?"*

---

### 7. Visão de Futuro: Agentes Especializados (Multi-Agent Swarm)

À medida que a plataforma amadurecer, o SentiCore passará a gerenciar um ecossistema de agentes internos especializados que trabalham de forma colaborativa sob a governança da IARA:

* **Agente Biblioteca**: Especialista em catalogar e recuperar os recursos de meditação e poesias PCH mais adequados a cada perfil.
* **Agente Hábito & Bem-Estar**: Focado em monitorar e guiar as práticas do Plano de Cuidado e evolução do Jardim.
* **Agente Organizador**: Gerencia e propõe melhorias nos agendamentos, horários de sessões e pautas clínicas.
* **Agente Localizador**: Otimiza o matchmaking no Marketplace buscando terapeutas que dominem os objetivos do usuário.

*A Experiência Permanece Única*: Independentemente de quantos agentes colaborem internamente no ecossistema, o usuário interage unicamente com a **IARA**, preservando a simplicidade e a conexão emocional limpa no acolhimento.
