# PLANO DE DESENVOLVIMENTO — 50 SPRINTS DO SENTIPAE

Este documento especifica a estratégia de execução do SentiPae em 50 Sprints modulares e independentes. Ao final de cada ciclo, um entregável concreto e testável é integrado ao ecossistema.

---

## FASE 1: INFRAESTRUTURA BASE E ARQUITETURA CORE (Sprints 1 - 10)

### Sprint 1: Arquitetura Inicial, TypeScript e Vite Setup
- **Objetivo**: Estruturação limpa do workspace, TypeScript estrito, vite configuration.
- **Entregáveis**: Configurações de compilador, aliases de importação, index.html responsivo com viewport amigável.

### Sprint 2: Design System e Design Tokens (Consolidação)
- **Objetivo**: Unificação da paleta de cores, tipografia, espaçamentos e sombras na fonte única de verdade `src/styles/design-tokens.ts`.
- **Entregáveis**: Design tokens exportáveis e index.css consumindo as propriedades de forma reativa.

### Sprint 3: Configuração e Bootstrap do Firebase/Firestore
- **Objetivo**: Instalação do SDK do Firebase, arquivos de configuração do applet, regras de segurança iniciais (`firestore.rules`).
- **Entregáveis**: Inicializador lazy do Firebase, conexão de teste ativa, e blueprint do banco.

### Sprint 4: Provedor de Autenticação e Gestão de Estados de Sessão
- **Objetivo**: Implementação do `AuthProvider.tsx` para persistir e propagar sessões de usuários.
- **Entregáveis**: Context hooks de autenticação, fluxos de login com senha e Google Sign-In integrados.

### Sprint 5: Controle de Acesso Baseado em Perfis (RBAC - Role Based Access Control)
- **Objetivo**: Sistema de restrição de páginas com base no perfil do usuário (`TenantRoute.tsx`).
- **Entregáveis**: Redirecionamento inteligente para Paciente, Terapeuta, Empresa ou SuperAdmin.

### Sprint 6: Módulo de Cadastro de Pacientes com Onboarding Guiado
- **Objetivo**: Fluxo de boas-vindas interativo para colher dados iniciais de bem-estar.
- **Entregáveis**: Componente de onboarding (`Onboarding.tsx`) salvando metas emocionais diretamente no Firestore.

### Sprint 7: Perfis de Terapeutas e Fluxo de Credenciamento
- **Objetivo**: Criação da área de inscrição e verificação de CRP para novos psicólogos e conselheiros.
- **Entregáveis**: Formulário seguro de credenciamento e verificação de documentos.

### Sprint 8: Componente de Layout Central (Mobile-First / High-Density Desktop)
- **Objetivo**: Wrapper estruturado com barras de navegação reativas, suporte a áreas seguras (safe-area padding).
- **Entregáveis**: Sidebar para telas grandes, barra de navegação inferior flutuante para dispositivos móveis.

### Sprint 9: Error Boundary e Sistema Global de Tratamento de Exceções
- **Objetivo**: Interceptar falhas inesperadas de renderização ou rede e apresentar caminhos alternativos sem quebrar a navegação.
- **Entregáveis**: Componente de Error Boundary com report opcional integrado.

### Sprint 10: Componente de Carregamento e Esqueletos de Interface (Skeletons)
- **Objetivo**: Reduzir a percepção de latência com loaders estilizados baseados em animações do `motion`.
- **Entregáveis**: Esqueletos cinzas animados para blocos de estatísticas e listagens de especialistas.

---

## FASE 2: DIÁRIO EMOCIONAL E MÓDULO DE SENTIMENTOS (Sprints 11 - 18)

### Sprint 11: Interface do Diário Emocional e Editor Rich Text Minimalista
- **Objetivo**: Desenvolvimento do editor de escrita diária focado na clareza cognitiva.
- **Entregáveis**: Campo de texto expansível de alta performance no diário.

### Sprint 12: Registro Rápido de Humor e Selecionador de Emoções/Gatilhos
- **Objetivo**: Painel interativo para entrada de notas de 0 a 10 com cliques simplificados.
- **Entregáveis**: Picker de emojis intuitivo sincronizado com o banco.

### Sprint 13: Integração com Motor de Sentimentos SentiCore (Lógica Local)
- **Objetivo**: Análise imediata de palavras-chave inseridas pelo usuário para estimar valência e intensidade sentimental.
- **Entregáveis**: Algoritmo de análise léxica em JavaScript/TypeScript.

### Sprint 14: Integração com o Gemini API (Análise Profunda Baseada em IA)
- **Objetivo**: Envio anônimo do texto escrito no diário ao LLM (através do backend seguro) para obter um resumo de tom.
- **Entregáveis**: Rota de API protegida e integrador com o SDK oficial da Google GenAI.

### Sprint 15: Componente de Tendências Recharts de 7 Dias (Humor e Bem-Estar)
- **Objetivo**: Gráfico de área elegante e interativo para exibir evolução do bem-estar diário.
- **Entregáveis**: Componente `MoodTrend7Days.tsx` integrado à dashboard principal.

### Sprint 16: Gráfico D3 Histórico de Emoções (Visualização Avançada)
- **Objetivo**: Fornecer uma visão em árvore ou de calor dos gatilhos mais frequentes nos últimos 30 dias.
- **Entregáveis**: Componente D3 dinâmico integrado à página de análises do paciente.

### Sprint 17: Motor de Exportação de Histórico de Escrita (PDF/JSON)
- **Objetivo**: Permitir que o paciente baixe seus relatórios para apresentar em consultas médicas presenciais.
- **Entregáveis**: Gerador de relatórios limpos com opção de download.

### Sprint 18: Lógica de Lembretes Diários de Escrita Reativa
- **Objetivo**: Oferecer toasts persistentes baseados no tempo para motivar o usuário a manter seu diário ativo.
- **Entregáveis**: Notificações programáveis in-app com opções de horário.

---

## FASE 3: IARA — RECPCIONISTA INTELIGENTE E ACOLHIMENTO (Sprints 19 - 28)

### Sprint 19: Layout Conversacional e Componentes de Balão de Chat (Chat Bubble)
- **Objetivo**: Layout otimizado para trocas rápidas de mensagens, com efeito de digitação e animação.
- **Entregáveis**: Chat UI no formato moderno de aplicativos de mensagem.

### Sprint 20: Integração do SDK Gemini para Fluxos Conversacionais da IARA
- **Objetivo**: Integrar a IA para responder de forma acolhedora, com escuta ativa, sem simular diagnósticos médicos.
- **Entregáveis**: Backend seguro de streaming de respostas da IARA.

### Sprint 21: Gestão de Memória Conversacional em Curto e Longo Prazo
- **Objetivo**: Salvar o contexto de conversas anteriores no Firestore de forma a construir relacionamento contínuo.
- **Entregáveis**: Histórico contextual de chat carregável.

### Sprint 22: Módulo IARA de Apoio em Crise e Protocolo SOS Integrado
- **Objetivo**: Reconhecer palavras de risco na conversa e ativar o banner SOS com links rápidos para ligar para o CVV.
- **Entregáveis**: Acionador automático de recursos de crise na interface do chat.

### Sprint 23: Coordenador de Jornada Guiada (Lógica e Propagação)
- **Objetivo**: Motor de regras para sugerir tarefas na tela principal ("Conversar com IARA", "Respirar", etc.).
- **Entregáveis**: Componente `JornadaGuiada.tsx` alimentado dinamicamente e integrado na dashboard.

### Sprint 24: Gamificação e Motor de Conquistas (Achievements/XP)
- **Objetivo**: Premiar o paciente por manter hábitos de escrita e sessões agendadas.
- **Entregáveis**: Widgets de conquistas, barras de progresso de nível e efeitos visuais ao obter conquistas.

### Sprint 25: Sugestor Inteligente de Especialistas via Chat
- **Objetivo**: Analisar o problema relatado no chat da IARA e propor o especialista mais adequado da Rede de Cuidado.
- **Entregáveis**: Recomendações em formato de cards dentro da interface conversacional.

### Sprint 26: Exercícios Práticos Guiados Integrados (Módulo de Respiração)
- **Objetivo**: Tela de relaxamento baseada no ritmo pulmonar visual para diminuir níveis urgentes de ansiedade.
- **Entregáveis**: Componente de treino respiratório interativo com temporizador visual de expansão/contração.

### Sprint 27: Diálogos Guiados de Triagem Baseada em Escalas de Humor
- **Objetivo**: Triagens periódicas sutis para avaliar sintomas latentes de depressão e ansiedade.
- **Entregáveis**: Fluxo estruturado de perguntas dinâmicas e discretas da IARA.

### Sprint 28: Integração de Resposta por Voz (Google Live API - Futuro Prep)
- **Objetivo**: Configurações de latência e interface para receber suporte de voz em tempo real.
- **Entregáveis**: Esqueleto de chamadas WebSocket e controles de áudio ativáveis na UI.

---

## FASE 4: REDE DE CUIDADO E MARKTPLACE MULTIDISCIPLINAR (Sprints 29 - 36)

### Sprint 29: Filtros Avançados e Matchmaking de Profissionais
- **Objetivo**: Busca por preço, especialidade (TCC, psicanálise, etc.), abordagem, e horários de preferência.
- **Entregáveis**: Interface limpa de buscas de especialistas com filtros reativos.

### Sprint 30: Detalhes do Perfil do Terapeuta e Avaliações de Usuários
- **Objetivo**: Exibir biografia do profissional, abordagens de atuação, depoimentos verificados de pacientes e redes sociais.
- **Entregáveis**: Tela de perfil enriquecido para especialistas.

### Sprint 31: Agenda Dinâmica e Horários de Atendimento do Terapeuta
- **Objetivo**: Calendário visual de dias e horários livres configurados pelo profissional.
- **Entregáveis**: Componente interativo de reserva de horários em formato de grid.

### Sprint 32: Sistema de Fluxo de Agendamento Seguro (Booking Flow)
- **Objetivo**: Etapa para seleção, confirmação de horários e inserção de queixas antes da sessão.
- **Entregáveis**: Modal de agendamento em passos estruturados.

### Sprint 33: Gestão de Salas de Teleatendimento Online
- **Objetivo**: Integração com APIs de videoconferência para criar salas virtuais diretamente no painel SentiPae.
- **Entregáveis**: Integração de botões de chamada ativa baseados no horário da sessão.

### Sprint 34: Painel do Terapeuta e Lista de Pacientes Vinculados
- **Objetivo**: Visualização dedicada de atendimentos do profissional, histórico de agendamentos e prontuários de evolução.
- **Entregáveis**: Dashboard exclusiva do perfil psicólogo/terapeuta.

### Sprint 35: Prontuário Clínico Seguro de Evolução Terapêutica
- **Objetivo**: Permitir que terapeutas registrem o progresso de cada sessão de forma confidencial.
- **Entregáveis**: Sistema de anotações médicas encriptadas.

### Sprint 36: Motor de Matchmaking Proativo e Match Manual
- **Objetivo**: Algoritmo que conecta as necessidades declaradas no onboarding com as especialidades das contas médicas ativas.
- **Entregáveis**: Lista inteligente de correspondências ("Terapeutas recomendados por SentiCore").

---

## FASE 5: FINANCEIRO, PAGAMENTOS E ASSINATURAS (Sprints 37 - 42)

### Sprint 37: Integração com Gateways de Pagamento (Stripe/Pix)
- **Objetivo**: Configurar o recebimento seguro de transações por sessões ou planos.
- **Entregáveis**: Proxy de API segura de faturamento sem expor tokens confidenciais.

### Sprint 38: Gestão de Repasses Financeiros para Profissionais
- **Objetivo**: Painel para terapeutas gerenciarem saldos a receber, saques e comissões da plataforma.
- **Entregáveis**: Fluxo de extrato financeiro médico na dashboard de terapeuta.

### Sprint 39: Planos de Assinatura para Empresas (B2B SaaS)
- **Objetivo**: Checkout corporativo de cotas mensais de consultas para colaboradores.
- **Entregáveis**: Modais e tabelas de precificação integradas ao checkout.

### Sprint 40: Emissão Automática de Recibos para Reembolso de Saúde
- **Objetivo**: Geração de faturas e recibos formatados com dados CRP para reembolso em planos de saúde.
- **Entregáveis**: PDF automatizado contendo dados do agendamento e pagamento.

### Sprint 41: Lógica de Cupons de Desconto e Campanhas Especiais
- **Objetivo**: Sistema para parcerias e campanhas de saúde mental (ex: Setembro Amarelo).
- **Entregáveis**: Campo de validação e aplicação de descontos na tela de pagamento.

### Sprint 42: Políticas de Cancelamento, Reagendamento e Reembolso Automático
- **Objetivo**: Regras para cancelamentos com menos de 24 horas e devolução de créditos para a carteira.
- **Entregáveis**: Fluxo automático de créditos de reembolso in-app.

---

## FASE 6: MULTI-TENANCY, PAINÉIS DE GESTÃO E ADMIN (Sprints 43 - 50)

### Sprint 43: Painel de Administração Corporativo (Portal Empresas)
- **Objetivo**: Área de visualização do RH para avaliar relatórios de bem-estar anônimos da empresa.
- **Entregáveis**: Gráficos consolidados de estresse, uso da plataforma e engajamento interno.

### Sprint 44: Painel do Setor Público (Portal Prefeituras/Municípios)
- **Objetivo**: Relatórios epidemiológicos populacionais de saúde mental para o gestor municipal de saúde.
- **Entregáveis**: Visualização de mapas de calor de demandas de atendimento por bairros ou UBSs.

### Sprint 45: Super Painel Administrativo SentiPae (SuperAdmin)
- **Objetivo**: Gestão central do ecossistema para aprovação de cadastros de psicólogos, resolução de disputas, etc.
- **Entregáveis**: Central de controle financeiro global e listagem de usuários.

### Sprint 46: Biblioteca de Conteúdos Guiados e Repositório PCH
- **Objetivo**: Agregação de meditações guiadas de áudio e poemas cognitivos categorizados para momentos de foco e ansiedade.
- **Entregáveis**: Player minimalista e navegação categorizada na biblioteca.

### Sprint 47: Configuração de Notificações Push e SMS Reativos
- **Objetivo**: Lembrar o usuário de sessões marcadas, evitar faltas e incentivar escrita.
- **Entregáveis**: Gateway de mensagens configurável de backend.

### Sprint 48: Auditoria de Segurança, Testes de Penetração e Conformidade LGPD
- **Objetivo**: Testagem estrita das regras de segurança do Firestore e encriptação de prontuários médicos.
- **Entregáveis**: Relatório interno de conformidade de acessos RBAC e correção de vulnerabilidades.

### Sprint 49: Otimização de Performance, Cache de Dados e SEO da Landing Page
- **Objetivo**: Reduzir tempos de carregamento (LCP/FCP) e garantir indexação web adequada.
- **Entregáveis**: Otimizações nos tempos de bundle do Vite e compressão dinâmica de assets.

### Sprint 50: Implantação de Produção, Homologação e Ciclo Completo CI/CD
- **Objetivo**: Automatização do deploy da plataforma no Cloud Run, auditoria final de variáveis de ambiente.
- **Entregáveis**: Pipeline de entrega contínua verde e produto totalmente lançado em SentiPae 2.0.
