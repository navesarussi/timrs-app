/**
 * קבועים גלובליים לאפליקציה
 * מרכז את כל המספרים הקסומים (magic numbers) במקום אחד
 */

export const STORAGE_LIMITS = {
  MAX_TIMERS: 100,
  MAX_RESET_LOGS: 200,
  MAX_DELETED_TIMERS: 50,
  MAX_RECORD_BREAKS: 100,
  MAX_BUG_REPORTS: 50,
} as const;

export const TIME_CONSTANTS = {
  SECOND_MS: 1000,
  MINUTE_MS: 60 * 1000,
  HOUR_MS: 60 * 60 * 1000,
  DAY_MS: 24 * 60 * 60 * 1000,
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  MONTH_APPROX_MS: 30 * 24 * 60 * 60 * 1000, // Approximate
} as const;

export const SYNC_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 30000,
  SYNC_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

export const DEBOUNCE_TIMES = {
  GLOBAL_STATS_UPDATE_MS: 5000,
  SEARCH_INPUT_MS: 300,
  RESIZE_MS: 250,
} as const;

export const UI_CONSTANTS = {
  TIMER_GRID_COLUMNS: 2,
  REFRESH_INTERVAL_MS: 1000,
  TOAST_DURATION_MS: 3000,
} as const;

export const VALIDATION_LIMITS = {
  TIMER_NAME_MIN: 1,
  TIMER_NAME_MAX: 50,
  RESET_REASON_MIN: 1,
  RESET_REASON_MAX: 500,
  RESET_AMOUNT_MIN: 1,
  RESET_AMOUNT_MAX: 1000000,
  MOOD_MIN: 1,
  MOOD_MAX: 5,
} as const;

