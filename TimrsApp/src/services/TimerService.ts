import {Timer, TimeUnit, RecordBreak} from '../types';
import {differenceInMonths, differenceInCalendarMonths} from 'date-fns';

export class TimerService {
  /**
   * מחשב כמה זמן עבר מאז תאריך ההתחלה
   */
  static calculateElapsedTime(timer: Timer): number {
    const now = Date.now();
    const elapsed = now - timer.startDate;
    
    // ממיר מילישניות ליחידת הזמן המבוקשת
    switch (timer.timeUnit) {
      case 'seconds':
        return Math.floor(elapsed / 1000);
      case 'minutes':
        return Math.floor(elapsed / (1000 * 60));
      case 'hours':
        return Math.floor(elapsed / (1000 * 60 * 60));
      case 'days':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        // חישוב בקירוב של 30 יום לחודש
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 30));
      default:
        return 0;
    }
  }

  /**
   * מעדכן את הערך הנוכחי של הטיימר והסטריק הנוכחי
   * מחזיר גם אם נשבר שיא
   */
  static updateTimerValue(timer: Timer): {updatedTimer: Timer; recordBroken: boolean} {
    const newValue = this.calculateElapsedTime(timer);
    const currentStreak = this.calculateCurrentStreak(timer);
    
    // בדיקה אם נשבר שיא
    const recordBroken = currentStreak > timer.bestStreak;
    
    const updatedTimer = {
      ...timer,
      currentValue: newValue,
      currentStreak: currentStreak,
      bestStreak: Math.max(timer.bestStreak, currentStreak), // עדכון שיא אם צריך
      lastCalculated: Date.now(),
    };
    
    return {updatedTimer, recordBroken};
  }

  /**
   * מחשב את הסטריק הנוכחי - כמה יחידות זמן עברו מאז האיפוס האחרון
   */
  static calculateCurrentStreak(timer: Timer): number {
    const referenceDate = timer.lastResetDate || timer.startDate;
    const elapsed = Date.now() - referenceDate;
    
    // ממיר מילישניות ליחידת הזמן המבוקשת
    switch (timer.timeUnit) {
      case 'seconds':
        return Math.floor(elapsed / 1000);
      case 'minutes':
        return Math.floor(elapsed / (1000 * 60));
      case 'hours':
        return Math.floor(elapsed / (1000 * 60 * 60));
      case 'days':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 30));
      default:
        return 0;
    }
  }

  /**
   * מבצע איפוס מלא - מאפס את הטיימר לחלוטין (לא משפיע על הקאונטרים)
   */
  static fullReset(timer: Timer): Timer {
    return {
      ...timer,
      startDate: Date.now(),
      currentValue: 0,
      lastCalculated: Date.now(),
      currentStreak: 0,
    };
  }

  /**
   * מבצע איפוס מותאם אישית - מוריד את הכמות המוגדרת ומעדכן קאונטרים
   * הטיימר לא יכול להיות מינוס - אם האיפוס גדול מהערך הנוכחי, הטיימר יתאפס ל-0
   * @returns tuple: [updatedTimer, recordBreak (or null if no record broken)]
   */
  static customReset(timer: Timer): {timer: Timer; recordBreak: RecordBreak | null} {
    const currentValue = this.calculateElapsedTime(timer);
    const currentStreak = this.calculateCurrentStreak(timer);
    
    // בדיקה אם נשבר שיא - משתמשים ב-currentStreak במקום currentValue
    let recordBreak: RecordBreak | null = null;
    const newBestStreak = Math.max(timer.bestStreak, currentStreak);
    
    if (currentStreak > timer.bestStreak) {
      // נשבר שיא!
      recordBreak = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timerId: timer.id,
        timestamp: Date.now(),
        oldRecord: timer.bestStreak,
        newRecord: currentStreak,
        isGlobalRecord: false,
      };
    }
    
    // אם האיפוס גדול מהערך הנוכחי, מבצעים איפוס מלא
    if (timer.customResetAmount >= currentValue) {
      const updatedTimer = {
        ...timer,
        startDate: Date.now(),
        currentValue: 0,
        lastCalculated: Date.now(),
        currentStreak: 0,
        bestStreak: newBestStreak,
        resetCount: timer.resetCount + 1,
        lastResetDate: Date.now(),
      };
      return {timer: updatedTimer, recordBreak};
    }
    
    // אחרת, מורידים את הכמות המוגדרת
    const newValue = currentValue - timer.customResetAmount;
    
    // מחשב מתי צריך להיות תאריך ההתחלה החדש
    const unitsToSubtract = timer.customResetAmount;
    let millisecondsToSubtract = 0;
    
    switch (timer.timeUnit) {
      case 'seconds':
        millisecondsToSubtract = unitsToSubtract * 1000;
        break;
      case 'minutes':
        millisecondsToSubtract = unitsToSubtract * 1000 * 60;
        break;
      case 'hours':
        millisecondsToSubtract = unitsToSubtract * 1000 * 60 * 60;
        break;
      case 'days':
        millisecondsToSubtract = unitsToSubtract * 1000 * 60 * 60 * 24;
        break;
      case 'weeks':
        millisecondsToSubtract = unitsToSubtract * 1000 * 60 * 60 * 24 * 7;
        break;
      case 'months':
        millisecondsToSubtract = unitsToSubtract * 1000 * 60 * 60 * 24 * 30;
        break;
    }
    
    const updatedTimer = {
      ...timer,
      startDate: timer.startDate + millisecondsToSubtract,
      currentValue: newValue,
      lastCalculated: Date.now(),
      currentStreak: 0, // מתאפס הסטריק הנוכחי
      bestStreak: newBestStreak, // עדכון השיא
      resetCount: timer.resetCount + 1, // הוספת 1 לספירת האיפוסים
      lastResetDate: Date.now(), // עדכון תאריך האיפוס האחרון
    };
    
    return {timer: updatedTimer, recordBreak};
  }

  /**
   * מחזיר את שם יחידת הזמן בעברית
   */
  static getTimeUnitLabel(unit: TimeUnit, value: number): string {
    switch (unit) {
      case 'seconds':
        return value === 1 ? 'שנייה' : 'שניות';
      case 'minutes':
        return value === 1 ? 'דקה' : 'דקות';
      case 'hours':
        return value === 1 ? 'שעה' : 'שעות';
      case 'days':
        return value === 1 ? 'יום' : 'ימים';
      case 'weeks':
        return value === 1 ? 'שבוע' : 'שבועות';
      case 'months':
        return value === 1 ? 'חודש' : 'חודשים';
      default:
        return '';
    }
  }

  /**
   * מחזיר תצוגת זמן חכמה - מוסיף יחידות גדולות יותר כשצריך
   * לדוגמה: 150 שניות -> "2 דקות 30 שניות"
   */
  static getSmartTimeDisplay(value: number, unit: TimeUnit): string {
    // אם היחידה היא ימים או יותר, לא צריך פירוק
    if (unit === 'days' || unit === 'weeks' || unit === 'months') {
      return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    let totalSeconds = 0;

    // ממיר הכל לשניות
    switch (unit) {
      case 'seconds':
        totalSeconds = value;
        break;
      case 'minutes':
        totalSeconds = value * 60;
        break;
      case 'hours':
        totalSeconds = value * 3600;
        break;
      default:
        return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    // אם הערך 0, להציג לפי יחידת הזמן המקורית
    if (totalSeconds === 0) {
      return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    const parts: string[] = [];

    // ימים
    if (totalSeconds >= 86400) {
      const days = Math.floor(totalSeconds / 86400);
      parts.push(`${days} ${this.getTimeUnitLabel('days', days)}`);
      totalSeconds %= 86400;
    }

    // שעות
    if (totalSeconds >= 3600) {
      const hours = Math.floor(totalSeconds / 3600);
      parts.push(`${hours} ${this.getTimeUnitLabel('hours', hours)}`);
      totalSeconds %= 3600;
    }

    // דקות
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      parts.push(`${minutes} ${this.getTimeUnitLabel('minutes', minutes)}`);
      totalSeconds %= 60;
    }

    // שניות
    if (totalSeconds > 0) {
      parts.push(`${totalSeconds} ${this.getTimeUnitLabel('seconds', totalSeconds)}`);
    }

    return parts.join(' ');
  }

  /**
   * מחזיר את שם יחידת הזמן בעברית (טופס)
   */
  static getTimeUnitDisplayName(unit: TimeUnit): string {
    switch (unit) {
      case 'seconds':
        return 'שניות';
      case 'minutes':
        return 'דקות';
      case 'hours':
        return 'שעות';
      case 'days':
        return 'ימים';
      case 'weeks':
        return 'שבועות';
      case 'months':
        return 'חודשים';
      default:
        return '';
    }
  }

  /**
   * מחזיר את כמות היחידות זמן שיש ביום אחד
   */
  static getUnitsPerDay(timeUnit: TimeUnit): number {
    switch (timeUnit) {
      case 'seconds':
        return 86400; // 60 * 60 * 24
      case 'minutes':
        return 1440; // 60 * 24
      case 'hours':
        return 24;
      case 'days':
        return 1;
      case 'weeks':
        return 1 / 7; // 0.142857... (שבוע אחד = כמעט שביעית יום)
      case 'months':
        return 1 / 30; // 0.0333... (חודש אחד = כשלושים יום)
      default:
        return 1;
    }
  }

  /**
   * מייצר טיימר חדש
   */
  static createNewTimer(
    name: string,
    timeUnit: TimeUnit,
    customResetAmount: number,
  ): Timer {
    const now = Date.now();
    return {
      id: now.toString() + Math.random().toString(36).substr(2, 9),
      name,
      startDate: now,
      timeUnit,
      customResetAmount,
      currentValue: 0,
      lastCalculated: now,
      currentStreak: 0,
      bestStreak: 0,
      resetCount: 0,
      lastResetDate: now,
    };
  }
}

