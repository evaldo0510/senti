import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

export const XP_ACTIONS = {
  OPEN_APP: 5,
  DO_RESET: 10,
  READ_PILL: 3,
  COMPLETE_DAY: 20,
  LOG_MOOD: 5,
};

export const LEVELS = [
  { name: 'Iniciante', minXp: 0 },
  { name: 'Consciente', minXp: 100 },
  { name: 'Em ReSet', minXp: 300 },
  { name: 'Transformando', minXp: 700 },
  { name: 'Dominando', minXp: 1500 },
];

export const getLevelByXp = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (xp: number) => {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return null; // Max level reached
};

export const addXp = async (uid: string, amount: number) => {
  if (!uid) return;

  if (uid === 'guest_demo_user') {
    const simProfileStr = localStorage.getItem("simulatedProfile");
    if (simProfileStr) {
      try {
        const simProfile = JSON.parse(simProfileStr);
        const newXp = (simProfile.xp || 0) + amount;
        simProfile.xp = newXp;
        simProfile.level = getLevelByXp(newXp).name;
        localStorage.setItem("simulatedProfile", JSON.stringify(simProfile));
        // Disparar evento para atualizar a UI que consome este perfil em tempo real se necessário
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error("Failed to add XP to simulated user:", e);
      }
    }
    return;
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data() as UserProfile;
  const newXp = (userData.xp || 0) + amount;
  const newLevel = getLevelByXp(newXp).name;
  
  await updateDoc(userRef, {
    xp: increment(amount),
    level: newLevel,
  });
};

export const updateStreak = async (uid: string) => {
  if (!uid) return;

  if (uid === 'guest_demo_user') {
    const simProfileStr = localStorage.getItem("simulatedProfile");
    if (simProfileStr) {
      try {
        const simProfile = JSON.parse(simProfileStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActive = simProfile.lastActive ? new Date(simProfile.lastActive) : null;
        if (lastActive) {
          lastActive.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            simProfile.streak = (simProfile.streak || 0) + 1;
          } else if (diffDays > 1) {
            simProfile.streak = 1;
          }
        } else {
          simProfile.streak = 1;
        }
        simProfile.lastActive = today.toISOString();
        localStorage.setItem("simulatedProfile", JSON.stringify(simProfile));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error("Failed to update streak for simulated user:", e);
      }
    }
    return;
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data() as UserProfile;
  const lastActive = userData.lastActive ? new Date(userData.lastActive) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      await updateDoc(userRef, {
        streak: increment(1),
        lastActive: today.toISOString(),
      });
    } else if (diffDays > 1) {
      // Streak broken
      await updateDoc(userRef, {
        streak: 1,
        lastActive: today.toISOString(),
      });
    }
  } else {
    // First time
    await updateDoc(userRef, {
      streak: 1,
      lastActive: today.toISOString(),
    });
  }
};

// --- ACHIEVEMENTS / BADGES SYSTEM ---

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'breathing' | 'emotion';
  criteria: string;
}

export const GAMIFICATION_BADGES: Badge[] = [
  {
    id: "breathing_1",
    title: "Sopro de Vida",
    description: "Concluiu o 1º exercício de respiração.",
    icon: "Wind",
    category: "breathing",
    criteria: "Concluir 1 exercício de respiração"
  },
  {
    id: "breathing_7",
    title: "Respirador Consistente",
    description: "Concluiu exercícios de respiração por 7 dias seguidos.",
    icon: "Activity",
    category: "breathing",
    criteria: "Completar exercícios de respiração por 7 dias seguidos"
  },
  {
    id: "emotion_1",
    title: "Mente Aberta",
    description: "Registrou seu 1º sentimento no diário.",
    icon: "HeartPulse",
    category: "emotion",
    criteria: "Registrar 1 humor no diário"
  },
  {
    id: "emotion_7",
    title: "Mente Clara",
    description: "Registrou sentimentos no diário por 7 dias seguidos.",
    icon: "Crown",
    category: "emotion",
    criteria: "Completar registros no diário por 7 dias seguidos"
  }
];

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  // Extrair a parte YYYY-MM-DD para evitar múltiplos registros no mesmo dia e ordenar de forma crescente
  const uniqueDates = Array.from(new Set(dates.map(d => d.split('T')[0]))).sort();
  
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;
  
  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    currentDate.setHours(0, 0, 0, 0);
    
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
        currentStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  
  return Math.max(maxStreak, currentStreak);
}

export const logBreathingActivity = async (uid: string, techniqueId: string, cycles: number) => {
  if (!uid) return;
  const timestamp = new Date().toISOString();
  
  if (uid === 'guest_demo_user' || uid.startsWith('simulated_')) {
    try {
      const stored = localStorage.getItem("simulated_breathing_logs") || "[]";
      const logs = JSON.parse(stored);
      logs.push({ userId: uid, techniqueId, cycles, timestamp });
      localStorage.setItem("simulated_breathing_logs", JSON.stringify(logs));
      
      // Conceder XP por respirar
      await addXp(uid, 15);
      
      // Verificar conquistas
      await checkAndAwardBadges(uid);
    } catch (e) {
      console.error("Failed to log simulated breathing activity:", e);
    }
    return;
  }
  
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    await addDoc(collection(db, 'breathing_logs'), {
      userId: uid,
      techniqueId,
      cycles,
      timestamp
    });
    
    // Conceder XP por respirar
    await addXp(uid, 15);
    
    // Verificar conquistas
    await checkAndAwardBadges(uid);
  } catch (err) {
    console.error("Error saving breathing activity to Firestore:", err);
  }
};

export const checkAndAwardBadges = async (uid: string) => {
  if (!uid) return [];
  
  let emotionDates: string[] = [];
  let breathingDates: string[] = [];
  
  if (uid === 'guest_demo_user' || uid.startsWith('simulated_')) {
    try {
      const storedMoods = localStorage.getItem("simulated_emotion_logs") || "[]";
      const parsedMoods = JSON.parse(storedMoods);
      emotionDates = parsedMoods.map((e: any) => e.timestamp);
      
      if (uid === 'guest_demo_user' && emotionDates.length === 0) {
        emotionDates = [
          new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        ];
      }
    } catch (e) {
      console.error(e);
    }
    
    try {
      const storedBreathing = localStorage.getItem("simulated_breathing_logs") || "[]";
      const parsedBreathing = JSON.parse(storedBreathing);
      breathingDates = parsedBreathing.map((e: any) => e.timestamp);
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      // Carregar registros de sentimentos
      const qEmotion = query(collection(db, 'emotion_logs'), where("userId", "==", uid));
      const snapEmotion = await getDocs(qEmotion);
      emotionDates = snapEmotion.docs.map(doc => doc.data().timestamp as string);
      
      // Carregar registros de respiração
      const qBreathing = query(collection(db, 'breathing_logs'), where("userId", "==", uid));
      const snapBreathing = await getDocs(qBreathing);
      breathingDates = snapBreathing.docs.map(doc => doc.data().timestamp as string);
    } catch (err) {
      console.error("Error loading dates for badges:", err);
      return [];
    }
  }
  
  const emotionStreak = calculateStreak(emotionDates);
  const breathingStreak = calculateStreak(breathingDates);
  
  const unlockedIds: string[] = [];
  if (emotionDates.length >= 1) unlockedIds.push("emotion_1");
  if (emotionStreak >= 7) unlockedIds.push("emotion_7");
  
  if (breathingDates.length >= 1) unlockedIds.push("breathing_1");
  if (breathingStreak >= 7) unlockedIds.push("breathing_7");
  
  if (unlockedIds.length === 0) return [];
  
  if (uid === 'guest_demo_user' || uid.startsWith('simulated_')) {
    const simProfileStr = localStorage.getItem("simulatedProfile");
    if (simProfileStr) {
      try {
        const simProfile = JSON.parse(simProfileStr);
        const oldAchievements: string[] = simProfile.achievements || [];
        const newlyUnlocked = unlockedIds.filter(id => !oldAchievements.includes(id));
        
        if (newlyUnlocked.length > 0) {
          const updatedAchievements = [...new Set([...oldAchievements, ...newlyUnlocked])];
          simProfile.achievements = updatedAchievements;
          simProfile.xp = (simProfile.xp || 0) + (newlyUnlocked.length * 50);
          simProfile.level = getLevelByXp(simProfile.xp).name;
          
          localStorage.setItem("simulatedProfile", JSON.stringify(simProfile));
          window.dispatchEvent(new Event('storage'));
          console.log(`[Badges] Desbloqueou novas conquistas locais:`, newlyUnlocked);
        }
      } catch (e) {
        console.error(e);
      }
    }
  } else {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const oldAchievements: string[] = userData.achievements || [];
        const newlyUnlocked = unlockedIds.filter(id => !oldAchievements.includes(id));
        
        if (newlyUnlocked.length > 0) {
          const updatedAchievements = [...new Set([...oldAchievements, ...newlyUnlocked])];
          const xpBonus = newlyUnlocked.length * 50;
          const newXp = (userData.xp || 0) + xpBonus;
          const newLevel = getLevelByXp(newXp).name;
          
          await updateDoc(userRef, {
            achievements: updatedAchievements,
            xp: newXp,
            level: newLevel
          });
          console.log(`[Badges] Desbloqueou novas conquistas no Firestore:`, newlyUnlocked);
        }
      }
    } catch (err) {
      console.error("Error saving achievements to Firestore:", err);
    }
  }
  
  return unlockedIds;
};
