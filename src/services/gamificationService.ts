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
