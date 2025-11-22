export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export interface Timer {
  id: string;
  name: string;
  startDate: number; // timestamp
  timeUnit: TimeUnit;
  customResetAmount: number; // כמה יחידות להוריד באיפוס מותאם אישית
  currentValue: number; // הערך הנוכחי של הטיימר
  lastCalculated: number; // מתי חושב לאחרונה
  
  // קאונטרים לטיימר
  currentStreak: number; // Streak נוכחי - יחידות זמן מאז האיפוס האחרון
  bestStreak: number; // השיא האישי - הכי הרבה יחידות זמן שהצליח להגיע אליהן
  resetCount: number; // כמה פעמים בוצע איפוס חלקי
  lastResetDate: number; // תאריך האיפוס החלקי האחרון
}

export interface TimerFormData {
  name: string;
  timeUnit: TimeUnit;
  customResetAmount: number;
}

export interface GlobalStats {
  currentStreak: number; // ימים רצופים בלי איפוס
  bestStreak: number; // השיא הכללי של ימים רצופים
  totalResets: number; // סך כל האיפוסים של כל הטיימרים
  lastResetDate: number; // תאריך האיפוס האחרון (של כל טיימר)
  lastCheckDate: number; // תאריך הבדיקה האחרונה (לחישוב ימים)
}

export interface DeletedTimer extends Timer {
  deletedAt: number; // תאריך המחיקה
  finalValue: number; // הערך האחרון לפני המחיקה
}

export interface ResetLog {
  id: string;
  timerId: string;
  timestamp: number;
  amountReduced: number;
  reason: string;
  mood: number; // 1-5
  valueBeforeReset: number;
  valueAfterReset: number;
}

export interface RecordBreak {
  id: string;
  timerId: string;
  timestamp: number;
  oldRecord: number;
  newRecord: number;
  improvement: number; // כמה השיפור (newRecord - oldRecord)
  isGlobalRecord: boolean; // האם זה שיא גלובלי או של טיימר בלבד
  context?: string; // הקשר - למה הצליח לשבור שיא
  reason?: string; // סיבה אופציונלית
}

// Validation constraints
export const ValidationRules = {
  timer: {
    nameMinLength: 1,
    nameMaxLength: 50,
    customResetAmountMin: 1,
    customResetAmountMax: 1000000,
  },
  resetLog: {
    reasonMinLength: 1,
    reasonMaxLength: 500,
    moodMin: 1,
    moodMax: 5,
  },
  general: {
    maxTimers: 100,
    maxResetLogs: 200,
    maxDeletedTimers: 50,
    maxRecordBreaks: 100,
  },
} as const;

// Sync-related types for Firebase integration
export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SyncMetadata {
  lastSyncedAt: number;
  syncStatus: SyncStatus;
  pendingChanges: number;
  errorMessage?: string;
}

export interface SyncableTimer extends Timer {
  syncMetadata?: SyncMetadata;
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'timers' | 'globalStats' | 'deletedTimers' | 'resetLogs' | 'recordBreaks';
  data: any;
  timestamp: number;
  retryCount: number;
}

