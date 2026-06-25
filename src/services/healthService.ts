export interface HealthDataPoint {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  steps: number;
  caloriesBurned: number;
}

export const healthService = {
  isLinked: (provider: "googlefit" | "healthkit"): boolean => {
    return localStorage.getItem(`health_linked_${provider}`) === "true";
  },

  linkProvider: (provider: "googlefit" | "healthkit"): void => {
    localStorage.setItem(`health_linked_${provider}`, "true");
    // Generate mock history if not present
    if (!localStorage.getItem(`health_data_${provider}`)) {
      const mockData = healthService.generateMockData();
      localStorage.setItem(`health_data_${provider}`, JSON.stringify(mockData));
    }
  },

  unlinkProvider: (provider: "googlefit" | "healthkit"): void => {
    localStorage.removeItem(`health_linked_${provider}`);
  },

  getSyncedData: (provider: "googlefit" | "healthkit"): HealthDataPoint[] => {
    const raw = localStorage.getItem(`health_data_${provider}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  updateDayData: (provider: "googlefit" | "healthkit", date: string, sleepHours: number, steps: number): void => {
    const data = healthService.getSyncedData(provider);
    const existingIndex = data.findIndex(d => d.date === date);
    const updatedPoint: HealthDataPoint = {
      date,
      sleepHours,
      steps,
      caloriesBurned: Math.round(steps * 0.04)
    };

    if (existingIndex !== -1) {
      data[existingIndex] = updatedPoint;
    } else {
      data.push(updatedPoint);
    }
    localStorage.setItem(`health_data_${provider}`, JSON.stringify(data));
  },

  generateMockData: (): HealthDataPoint[] => {
    const data: HealthDataPoint[] = [];
    const now = new Date();
    
    // Generate past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      
      // Random but realistic parameters
      // Weekends have more sleep, some days have low steps, etc.
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const sleepHours = isWeekend 
        ? Math.round((7.5 + Math.random() * 2) * 10) / 10 
        : Math.round((5.5 + Math.random() * 2.5) * 10) / 10;
        
      const steps = isWeekend
        ? Math.round(4000 + Math.random() * 8000)
        : Math.round(3000 + Math.random() * 6000);

      data.push({
        date: dateStr,
        sleepHours,
        steps,
        caloriesBurned: Math.round(steps * 0.04)
      });
    }
    return data;
  },

  analyzeCorrelation: (diaryEntries: any[], healthData: HealthDataPoint[]) => {
    if (diaryEntries.length === 0 || healthData.length === 0) {
      return {
        sleepCorrelation: "Insira mais registros no diário e sincronize seu app de saúde para calcular correlações.",
        activityCorrelation: "Sua movimentação física e bem-estar serão cruzados em breve.",
        bestSleepDayMood: null,
        bestStepsDayMood: null
      };
    }

    // Map health data by date for quick lookup
    const healthMap = new Map<string, HealthDataPoint>();
    healthData.forEach(p => healthMap.set(p.date, p));

    let totalSleepOnHighMood = 0;
    let highMoodCount = 0;
    let totalSleepOnLowMood = 0;
    let lowMoodCount = 0;

    let totalStepsOnHighMood = 0;
    let totalStepsOnLowMood = 0;

    diaryEntries.forEach(entry => {
      if (!entry.timestamp) return;
      const dateStr = new Date(entry.timestamp).toISOString().split("T")[0];
      const health = healthMap.get(dateStr);
      if (!health) return;

      const moodScore = entry.moodValue || entry.value || 5;

      if (moodScore >= 7) {
        totalSleepOnHighMood += health.sleepHours;
        totalStepsOnHighMood += health.steps;
        highMoodCount++;
      } else if (moodScore <= 4) {
        totalSleepOnLowMood += health.sleepHours;
        totalStepsOnLowMood += health.steps;
        lowMoodCount++;
      }
    });

    const avgSleepHigh = highMoodCount > 0 ? totalSleepOnHighMood / highMoodCount : 0;
    const avgSleepLow = lowMoodCount > 0 ? totalSleepOnLowMood / lowMoodCount : 0;

    const avgStepsHigh = highMoodCount > 0 ? totalStepsOnHighMood / highMoodCount : 0;
    const avgStepsLow = lowMoodCount > 0 ? totalStepsOnLowMood / lowMoodCount : 0;

    let sleepCorrelation = "Os dados mostram um padrão de sono equilibrado.";
    if (avgSleepHigh > 0 && avgSleepLow > 0) {
      const diff = avgSleepHigh - avgSleepLow;
      if (diff > 0.8) {
        sleepCorrelation = `Em dias alegres, você dormiu em média ${diff.toFixed(1)}h a mais do que nos dias de humor reduzido. Isso indica forte dependência do repouso para seu equilíbrio emocional.`;
      } else if (diff < -0.8) {
        sleepCorrelation = "Curiosamente, seus registros de humor positivo coincidem com períodos de sono ligeiramente menores. Monitore se há episódios de hiperatividade.";
      } else {
        sleepCorrelation = `Seu sono médio se mantém estável em torno de ${avgSleepHigh.toFixed(1)}h tanto em dias positivos quanto em dias neutros ou desafiadores.`;
      }
    }

    let activityCorrelation = "Seus passos diários mostram regularidade.";
    if (avgStepsHigh > 0 && avgStepsLow > 0) {
      const diff = avgStepsHigh - avgStepsLow;
      if (diff > 1500) {
        activityCorrelation = `Você se exercitou bastante nos dias de humor elevado (média de ${Math.round(avgStepsHigh)} passos), em comparação a dias difíceis (${Math.round(avgStepsLow)} passos). Atividades físicas parecem turbinar seu humor!`;
      } else if (diff < -1500) {
        activityCorrelation = `Você registrou mais passos em dias de menor pontuação emocional. Caminhadas longas podem estar servindo de refúgio ou válvula de escape para estresse.`;
      } else {
        activityCorrelation = `Seu nível de caminhada e passos diários se mantém constante (aprox. ${Math.round(avgStepsHigh)} passos) independente de oscilações emocionais severas.`;
      }
    }

    return {
      sleepCorrelation,
      activityCorrelation,
      avgSleepHigh: avgSleepHigh ? Math.round(avgSleepHigh * 10) / 10 : null,
      avgSleepLow: avgSleepLow ? Math.round(avgSleepLow * 10) / 10 : null,
      avgStepsHigh: avgStepsHigh ? Math.round(avgStepsHigh) : null,
      avgStepsLow: avgStepsLow ? Math.round(avgStepsLow) : null
    };
  }
};
