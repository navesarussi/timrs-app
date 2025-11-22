/**
 * תפקידי עזר לטיפול בתאריכים ופורמט זמן
 */

/**
 * פורמט תאריך לפי מרחק זמן
 */
export const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins === 1) return 'לפני דקה';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours === 1) return 'לפני שעה';
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 14) return 'לפני שבוע';
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;

  return formatAbsoluteDate(timestamp);
};

/**
 * פורמט תאריך מדויק
 */
export const formatAbsoluteDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * פורמט תאריך עם שעה
 */
export const formatDateWithTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * חישוב הפרש ימים בין שני תאריכים
 */
export const daysBetween = (timestamp1: number, timestamp2: number): number => {
  const diffMs = Math.abs(timestamp2 - timestamp1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * בדיקה האם תאריך הוא היום
 */
export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * בדיקה האם תאריך הוא אתמול
 */
export const isYesterday = (timestamp: number): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * קבלת התחלת היום (00:00:00)
 */
export const getStartOfDay = (timestamp: number = Date.now()): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * קבלת סוף היום (23:59:59)
 */
export const getEndOfDay = (timestamp: number = Date.now()): number => {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

