import {GlobalStats, Timer} from '../types';

export class GlobalStatsService {
  /**
   * יוצר אובייקט סטטיסטיקות גלובלי חדש
   */
  static createInitialStats(): GlobalStats {
    const now = Date.now();
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalResets: 0,
      lastResetDate: now,
      lastCheckDate: now,
    };
  }

  /**
   * מעדכן את הסטריק הגלובלי לפי ימים
   */
  static updateGlobalStreak(stats: GlobalStats): GlobalStats {
    const now = Date.now();
    const lastCheck = stats.lastCheckDate;
    
    // מחשב כמה ימים עברו מאז הבדיקה האחרונה
    const daysPassed = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));
    
    // אם עבר יום או יותר, מעלים את הסטריק
    if (daysPassed >= 1) {
      const newStreak = stats.currentStreak + daysPassed;
      const newBestStreak = Math.max(stats.bestStreak, newStreak);
      
      return {
        ...stats,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastCheckDate: now,
      };
    }
    
    return {
      ...stats,
      lastCheckDate: now,
    };
  }

  /**
   * מעדכן את הסטטיסטיקות לאחר איפוס חלקי
   */
  static handleReset(stats: GlobalStats): GlobalStats {
    const now = Date.now();
    
    // עדכון השיא אם הצליח להגיע ליותר
    const newBestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    
    return {
      ...stats,
      currentStreak: 0, // מתאפס הסטריק הנוכחי
      bestStreak: newBestStreak,
      totalResets: stats.totalResets + 1, // הוספת 1 לסך כל האיפוסים
      lastResetDate: now,
      lastCheckDate: now,
    };
  }

  /**
   * מחשב את סך כל האיפוסים מכל הטיימרים
   */
  static calculateTotalResets(timers: Timer[]): number {
    return timers.reduce((sum, timer) => sum + timer.resetCount, 0);
  }

  /**
   * מחשב את הסטריק הגלובלי הנוכחי (ימים מאז איפוס אחרון)
   */
  static calculateCurrentGlobalStreak(stats: GlobalStats): number {
    const now = Date.now();
    const lastReset = stats.lastResetDate;
    
    // מחשב כמה ימים עברו מאז האיפוס האחרון
    return Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
  }

  /**
   * מעדכן את הסטטיסטיקות הגלובליות על בסיס הטיימרים הקיימים
   */
  static syncStatsWithTimers(stats: GlobalStats, timers: Timer[]): GlobalStats {
    // מוודא שסך כל האיפוסים נכון
    const actualTotalResets = this.calculateTotalResets(timers);
    
    // מוודא שהסטריק הנוכחי נכון
    const actualCurrentStreak = this.calculateCurrentGlobalStreak(stats);
    
    return {
      ...stats,
      totalResets: actualTotalResets,
      currentStreak: actualCurrentStreak,
    };
  }
}

