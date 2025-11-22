import {Timer, GlobalStats, DeletedTimer} from '../types';

/**
 * שירות API להכנה לחיבור למסד נתונים מרוחק
 * כרגע עובד רק עם AsyncStorage מקומי, אבל מוכן להרחבה
 */

// הגדרות API - יוגדרו בעתיד
const API_CONFIG = {
  BASE_URL: '', // כתובת השרת - יוגדר בעתיד
  ENABLED: false, // האם להשתמש ב-API או רק local
  AUTH_TOKEN: '', // טוקן אימות - יוגדר בעתיד
};

export class ApiService {
  /**
   * בדיקה אם API פעיל
   */
  static isApiEnabled(): boolean {
    return API_CONFIG.ENABLED && API_CONFIG.BASE_URL.length > 0;
  }

  /**
   * סנכרון טיימרים עם השרת
   * @param localTimers - הטיימרים המקומיים
   * @returns הטיימרים המעודכנים מהשרת
   */
  static async syncTimers(localTimers: Timer[]): Promise<Timer[]> {
    if (!this.isApiEnabled()) {
      return localTimers; // אם API לא פעיל, מחזיר את המקומיים
    }

    try {
      // TODO: ליישם בעתיד
      // const response = await fetch(`${API_CONFIG.BASE_URL}/timers/sync`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${API_CONFIG.AUTH_TOKEN}`,
      //   },
      //   body: JSON.stringify({ timers: localTimers }),
      // });
      // const data = await response.json();
      // return data.timers;

      return localTimers;
    } catch (error) {
      console.error('Error syncing timers with API:', error);
      return localTimers; // במקרה של שגיאה, מחזיר את המקומיים
    }
  }

  /**
   * סנכרון סטטיסטיקות גלובליות עם השרת
   */
  static async syncGlobalStats(localStats: GlobalStats): Promise<GlobalStats> {
    if (!this.isApiEnabled()) {
      return localStats;
    }

    try {
      // TODO: ליישם בעתיד
      return localStats;
    } catch (error) {
      console.error('Error syncing global stats with API:', error);
      return localStats;
    }
  }

  /**
   * סנכרון היסטוריה עם השרת
   */
  static async syncDeletedTimers(
    localDeleted: DeletedTimer[],
  ): Promise<DeletedTimer[]> {
    if (!this.isApiEnabled()) {
      return localDeleted;
    }

    try {
      // TODO: ליישם בעתיד
      return localDeleted;
    } catch (error) {
      console.error('Error syncing deleted timers with API:', error);
      return localDeleted;
    }
  }

  /**
   * העלאת טיימר חדש לשרת
   */
  static async uploadTimer(timer: Timer): Promise<Timer> {
    if (!this.isApiEnabled()) {
      return timer;
    }

    try {
      // TODO: ליישם בעתיד
      // const response = await fetch(`${API_CONFIG.BASE_URL}/timers`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${API_CONFIG.AUTH_TOKEN}`,
      //   },
      //   body: JSON.stringify(timer),
      // });
      // return await response.json();

      return timer;
    } catch (error) {
      console.error('Error uploading timer to API:', error);
      return timer;
    }
  }

  /**
   * עדכון טיימר בשרת
   */
  static async updateTimerOnServer(timer: Timer): Promise<Timer> {
    if (!this.isApiEnabled()) {
      return timer;
    }

    try {
      // TODO: ליישם בעתיד
      return timer;
    } catch (error) {
      console.error('Error updating timer on API:', error);
      return timer;
    }
  }

  /**
   * מחיקת טיימר מהשרת
   */
  static async deleteTimerOnServer(timerId: string): Promise<boolean> {
    if (!this.isApiEnabled()) {
      return true;
    }

    try {
      // TODO: ליישם בעתיד
      return true;
    } catch (error) {
      console.error('Error deleting timer on API:', error);
      return false;
    }
  }

  /**
   * הפעלת סנכרון אוטומטי (לקרוא בהתחלת האפליקציה)
   */
  static enableAutoSync(): void {
    if (!this.isApiEnabled()) {
      return;
    }

    // TODO: ליישם בעתיד - סנכרון אוטומטי כל X דקות
    // setInterval(() => {
    //   this.performFullSync();
    // }, 5 * 60 * 1000); // כל 5 דקות
  }

  /**
   * סנכרון מלא של כל הנתונים
   */
  static async performFullSync(): Promise<void> {
    if (!this.isApiEnabled()) {
      return;
    }

    try {
      console.log('Performing full sync with server...');
      // TODO: ליישם בעתיד
    } catch (error) {
      console.error('Error performing full sync:', error);
    }
  }
}

/**
 * הערות ליישום עתידי:
 * 
 * 1. אימות משתמשים:
 *    - הוספת מסך התחברות/הרשמה
 *    - שמירת טוקן אימות ב-AsyncStorage
 *    - חידוש טוקן אוטומטי
 * 
 * 2. סנכרון:
 *    - Conflict resolution - מה לעשות כשיש שינויים גם מקומיים וגם בשרת
 *    - Offline mode - לעבוד מקומית כשאין אינטרנט
 *    - Queue - תור של פעולות שלא הצליחו להישלח
 * 
 * 3. אבטחה:
 *    - הצפנת נתונים רגישים
 *    - HTTPS בלבד
 *    - Rate limiting
 * 
 * 4. ביצועים:
 *    - Cache של נתונים מהשרת
 *    - Pagination לטיימרים רבים
 *    - Compression של נתונים
 * 
 * 5. Backend:
 *    - Node.js + Express או NestJS
 *    - PostgreSQL או MongoDB
 *    - Firebase/Supabase כאלטרנטיבה מהירה
 */

