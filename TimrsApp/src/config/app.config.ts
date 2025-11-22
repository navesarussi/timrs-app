/**
 * קובץ הגדרות האפליקציה
 * מרכז את כל ההגדרות והקונפיגורציות במקום אחד
 */

export const AppConfig = {
  // הגדרות אפליקציה
  app: {
    name: 'TimrsApp',
    version: '2.3.0',
    environment: __DEV__ ? 'development' : 'production',
  },

  // הגדרות API
  api: {
    enabled: false, // כרגע מושבת - רק local storage
    baseUrl: '', // יוגדר בעתיד: 'https://api.timrs.app'
    timeout: 30000, // 30 שניות
    retryAttempts: 3,
  },

  // הגדרות אחסון
  storage: {
    timersKey: '@timrs_timers',
    globalStatsKey: '@timrs_global_stats',
    deletedTimersKey: '@timrs_deleted_timers',
    userPreferencesKey: '@timrs_user_prefs',
    maxDeletedHistory: 50, // מקסימום טיימרים מחוקים בהיסטוריה
  },

  // הגדרות סנכרון
  sync: {
    enabled: false, // כרגע מושבת
    intervalMinutes: 5, // סנכרון כל 5 דקות
    onlyOnWifi: false, // סנכרון רק ב-WiFi
  },

  // הגדרות תצוגה
  ui: {
    timerGridColumns: 2, // כמה עמודות בגריד
    refreshIntervalMs: 1000, // עדכון כל שנייה
    animationsEnabled: true,
  },

  // הגדרות התראות (לעתיד)
  notifications: {
    enabled: false,
    reminderIntervals: [1, 7, 30], // ימים להתראות
  },

  // הגדרות גיבוי (לעתיד)
  backup: {
    enabled: false,
    autoBackupInterval: 'daily', // 'daily', 'weekly', 'monthly'
    maxBackups: 5,
  },

  // הגדרות פיצ'רים
  features: {
    historyEnabled: true,
    statisticsEnabled: true,
    exportEnabled: false, // ייצוא/ייבוא נתונים (לעתיד)
    themingEnabled: false, // ערכות נושא (לעתיד)
    multiLanguageEnabled: false, // תמיכה בשפות נוספות (לעתיד)
  },
};

/**
 * פונקציה לעדכון הגדרות בזמן ריצה
 */
export const updateConfig = (path: string, value: any) => {
  const keys = path.split('.');
  let obj: any = AppConfig;
  
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  
  obj[keys[keys.length - 1]] = value;
};

/**
 * פונקציה לקבלת ערך הגדרה
 */
export const getConfig = (path: string): any => {
  const keys = path.split('.');
  let obj: any = AppConfig;
  
  for (const key of keys) {
    obj = obj[key];
    if (obj === undefined) return null;
  }
  
  return obj;
};

