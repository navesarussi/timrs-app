/**
 * Firebase Configuration
 * הגדרות חיבור ל-Firebase
 * 
 * הוראות התקנה:
 * 1. צור פרויקט ב-Firebase Console (https://console.firebase.google.com)
 * 2. הוסף אפליקציית Android לפרויקט
 * 3. הורד את google-services.json ושים ב-android/app/
 * 4. עדכן את הקובץ android/build.gradle וandroid/app/build.gradle
 */

export const FirebaseConfig = {
  // Firebase credentials - MUST be configured
  enabled: true, // Firebase מופעל - מוכן לשימוש!
  
  // Firestore settings
  firestore: {
    persistenceEnabled: true, // Cache מקומי
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  },
  
  // Authentication settings
  auth: {
    anonymousEnabled: true, // אימות אנונימי
    persistence: true, // שמירת מצב התחברות
  },
  
  // Sync settings
  sync: {
    realtime: true, // סנכרון בזמן אמת
    batchWrites: true, // כתיבה בקבוצות לביצועים
    maxRetries: 3, // מקסימום נסיונות חוזרים
    retryDelay: 1000, // השהיה בין נסיונות (ms)
  },
};

/**
 * Collection names בFirestore
 */
export const FirestoreCollections = {
  USERS: 'users',
  TIMERS: 'timers',
  GLOBAL_STATS: 'globalStats',
  DELETED_TIMERS: 'deletedTimers',
  RESET_LOGS: 'resetLogs',
  RECORD_BREAKS: 'recordBreaks',
  BUG_REPORTS: 'bugReports',
  SYNC_QUEUE: 'syncQueue', // תור סנכרון מקומי
} as const;

/**
 * Local storage keys
 */
export const StorageKeys = {
  USER_ID: '@timrs_user_id',
  FIREBASE_INITIALIZED: '@timrs_firebase_initialized',
  LAST_SYNC: '@timrs_last_sync',
  SYNC_ENABLED: '@timrs_sync_enabled',
  PENDING_SYNCS: '@timrs_pending_syncs',
  BUG_REPORTS: '@timrs_bug_reports',
} as const;

