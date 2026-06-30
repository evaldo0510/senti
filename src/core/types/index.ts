// src/core/types/index.ts

export type RiskLevel = "baixo" | "medio" | "alto";

export type StepProgress = "acolhimento" | "estabilizacao" | "desenvolvimento_pessoal" | "acompanhamento";

export type ExerciseType = "respiracao_478" | "aterramento_54321" | "diario_gratidao" | "nenhum";

export interface UserContext {
  userId: string;
  userProfile: {
    nome: string;
    email?: string;
    tipo: string;
    tenantId: string;
    isPremium?: boolean;
    streak?: number;
    xp?: number;
  };
  longTermMemory: {
    fatos: string[];
    preferencias: string[];
    emocaoAtual?: string;
  };
  recentMoods: Array<{
    emotion: string;
    value: number;
    intensity?: number;
    createdAt: string;
  }>;
  recentDiary: Array<{
    title: string;
    mood?: number;
    createdAt: string;
  }>;
  currentMessage: string;
}

export interface AgentDecision {
  agentId: string;
  confidence: number; // 0.0 to 1.0
  recommendations: Record<string, any>;
  logSummary?: string;
}

export interface SentiCoreAnalysis {
  risk: {
    level: RiskLevel;
    escalar_humano: boolean;
    razao: string;
  };
  memory: {
    novas_informacoes: string[];
    preferencias_identificadas: string[];
  };
  journey: {
    progresso_etapa: StepProgress;
    analise_humor: string;
    sugestao_meta_diaria: string;
  };
  referral: {
    indicar_profissional: boolean;
    tipo_profissional: string[];
    razao: string;
  };
  marketplace: {
    recomendar_conteudo: boolean;
    ids_conteudo: string[];
    razao: string;
  };
  recommendation: {
    proximo_passo: string;
    sugerir_exercicio: boolean;
    tipo_exercicio: ExerciseType;
  };
}

export interface SentiCoreAgent {
  agentId: string;
  process(context: UserContext): Promise<AgentDecision>;
}
