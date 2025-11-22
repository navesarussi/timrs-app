import AsyncStorage from '@react-native-async-storage/async-storage';
import {Timer, GlobalStats, DeletedTimer, ResetLog, RecordBreak, BugReport} from '../types';
import {TimerService} from './TimerService';

const STORAGE_KEY = '@timrs_timers';
const GLOBAL_STATS_KEY = '@timrs_global_stats';
const DELETED_TIMERS_KEY = '@timrs_deleted_timers';
const RESET_LOGS_KEY = '@timrs_reset_logs';
const RECORD_BREAKS_KEY = '@timrs_record_breaks';
const BUG_REPORTS_KEY = '@timrs_bug_reports';

// עכב טעינת SyncService למניעת circular dependency
let SyncServiceInstance: any = null;
const getSyncService = async () => {
  if (!SyncServiceInstance) {
    const {SyncService} = await import('./SyncService');
    SyncServiceInstance = SyncService;
  }
  return SyncServiceInstance;
};

export class StorageService {
  /**
   * שומר את כל הטיימרים ל-AsyncStorage
   */
  static async saveTimers(timers: Timer[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(timers);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving timers:', error);
      throw error;
    }
  }

  /**
   * טוען את כל הטיימרים מ-AsyncStorage ומבצע מיגרציה אם צריך
   */
  static async loadTimers(): Promise<Timer[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue == null) return [];
      
      const timers = JSON.parse(jsonValue);
      
      // מיגרציה של טיימרים ישנים - הוספת שדות חדשים אם חסרים
      const migratedTimers = timers.map((timer: any) => ({
        ...timer,
        currentStreak: timer.currentStreak ?? 0,
        bestStreak: timer.bestStreak ?? 0,
        resetCount: timer.resetCount ?? 0,
        lastResetDate: timer.lastResetDate ?? timer.startDate ?? Date.now(),
      }));
      
      // שמירת הטיימרים המעודכנים
      if (migratedTimers.some((t: Timer, i: number) => 
        JSON.stringify(t) !== JSON.stringify(timers[i])
      )) {
        await this.saveTimers(migratedTimers);
      }
      
      return migratedTimers;
    } catch (error) {
      console.error('Error loading timers:', error);
      return [];
    }
  }

  /**
   * מוסיף טיימר חדש
   */
  static async addTimer(timer: Timer): Promise<void> {
    try {
      const timers = await this.loadTimers();
      timers.push(timer);
      await this.saveTimers(timers);
      
      // סנכרון לענן - לא חוסם את השמירה המקומית
      try {
        const SyncService = await getSyncService();
        await SyncService.syncTimer(timer, 'create');
      } catch (syncError) {
        console.warn('Cloud sync failed, but local save succeeded:', syncError);
        // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
      }
    } catch (error) {
      console.error('Error adding timer:', error);
      throw error;
    }
  }

  /**
   * מעדכן טיימר קיים
   */
  static async updateTimer(updatedTimer: Timer): Promise<void> {
    try {
      const timers = await this.loadTimers();
      const index = timers.findIndex(t => t.id === updatedTimer.id);
      if (index !== -1) {
        timers[index] = updatedTimer;
        await this.saveTimers(timers);
        
        // סנכרון לענן - לא חוסם את השמירה המקומית
        try {
          const SyncService = await getSyncService();
          await SyncService.syncTimer(updatedTimer, 'update');
        } catch (syncError) {
          console.warn('Cloud sync failed, but local save succeeded:', syncError);
          // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
        }
      }
    } catch (error) {
      console.error('Error updating timer:', error);
      throw error;
    }
  }

  /**
   * מוחק טיימר ושומר אותו בהיסטוריה
   */
  static async deleteTimer(timerId: string): Promise<void> {
    try {
      const timers = await this.loadTimers();
      const timerToDelete = timers.find(t => t.id === timerId);
      
      if (timerToDelete) {
        // שמירה בהיסטוריה
        const deletedTimer: DeletedTimer = {
          ...timerToDelete,
          deletedAt: Date.now(),
          finalValue: TimerService.calculateElapsedTime(timerToDelete),
        };
        await this.addToDeletedHistory(deletedTimer);
        
        // סנכרון לענן - לא חוסם את השמירה המקומית
        try {
          const SyncService = await getSyncService();
          await SyncService.syncDeletedTimer(deletedTimer);
          await SyncService.syncTimer(timerToDelete, 'delete');
        } catch (syncError) {
          console.warn('Cloud sync failed, but local save succeeded:', syncError);
          // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
        }
      }
      
      const filteredTimers = timers.filter(t => t.id !== timerId);
      await this.saveTimers(filteredTimers);
    } catch (error) {
      console.error('Error deleting timer:', error);
      throw error;
    }
  }

  /**
   * שומר את הסטטיסטיקות הגלובליות
   */
  static async saveGlobalStats(stats: GlobalStats): Promise<void> {
    try {
      const jsonValue = JSON.stringify(stats);
      await AsyncStorage.setItem(GLOBAL_STATS_KEY, jsonValue);
      
      // סנכרון לענן - לא חוסם את השמירה המקומית
      try {
        const SyncService = await getSyncService();
        await SyncService.syncGlobalStats(stats);
      } catch (syncError) {
        console.warn('Cloud sync failed, but local save succeeded:', syncError);
        // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
      }
    } catch (error) {
      console.error('Error saving global stats:', error);
      throw error;
    }
  }

  /**
   * טוען את הסטטיסטיקות הגלובליות
   */
  static async loadGlobalStats(): Promise<GlobalStats | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(GLOBAL_STATS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading global stats:', error);
      return null;
    }
  }

  /**
   * מוסיף טיימר למחוקים להיסטוריה
   */
  static async addToDeletedHistory(deletedTimer: DeletedTimer): Promise<void> {
    try {
      const history = await this.loadDeletedTimers();
      history.unshift(deletedTimer); // מוסיף בהתחלה (החדש ביותר)
      
      // שומר רק 50 אחרונים
      const limitedHistory = history.slice(0, 50);
      
      const jsonValue = JSON.stringify(limitedHistory);
      await AsyncStorage.setItem(DELETED_TIMERS_KEY, jsonValue);
    } catch (error) {
      console.error('Error adding to deleted history:', error);
      throw error;
    }
  }

  /**
   * טוען את היסטוריית הטיימרים המחוקים
   */
  static async loadDeletedTimers(): Promise<DeletedTimer[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(DELETED_TIMERS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading deleted timers:', error);
      return [];
    }
  }

  /**
   * משחזר טיימר מההיסטוריה
   */
  static async restoreTimer(deletedTimer: DeletedTimer): Promise<void> {
    try {
      // מסיר מההיסטוריה מקומית
      const history = await this.loadDeletedTimers();
      const updatedHistory = history.filter(t => t.id !== deletedTimer.id);
      await AsyncStorage.setItem(DELETED_TIMERS_KEY, JSON.stringify(updatedHistory));
      
      // מחיקה גם מהענן
      const {FirebaseService} = await import('./FirebaseService');
      await FirebaseService.deleteDeletedTimer(deletedTimer.id);
      
      // מוסיף חזרה לטיימרים פעילים
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {deletedAt, finalValue, ...timer} = deletedTimer;
      await this.addTimer(timer);
    } catch (error) {
      console.error('Error restoring timer:', error);
      throw error;
    }
  }

  /**
   * מוחק טיימר מההיסטוריה לצמיתות
   */
  static async permanentlyDeleteTimer(timerId: string): Promise<void> {
    try {
      const history = await this.loadDeletedTimers();
      const updatedHistory = history.filter(t => t.id !== timerId);
      await AsyncStorage.setItem(DELETED_TIMERS_KEY, JSON.stringify(updatedHistory));
      
      // מחיקה גם מהענן
      const {FirebaseService} = await import('./FirebaseService');
      await FirebaseService.deleteDeletedTimer(timerId);
    } catch (error) {
      console.error('Error permanently deleting timer:', error);
      throw error;
    }
  }

  /**
   * שומר לוג איפוס חדש
   */
  static async saveResetLog(resetLog: ResetLog): Promise<void> {
    try {
      const logs = await this.loadResetLogs();
      logs.unshift(resetLog); // מוסיף בהתחלה
      
      // שומר רק 200 אחרונים
      const limitedLogs = logs.slice(0, 200);
      
      const jsonValue = JSON.stringify(limitedLogs);
      await AsyncStorage.setItem(RESET_LOGS_KEY, jsonValue);
      
      // סנכרון לענן - לא חוסם את השמירה המקומית
      try {
        const SyncService = await getSyncService();
        await SyncService.syncResetLog(resetLog);
      } catch (syncError) {
        console.warn('Cloud sync failed, but local save succeeded:', syncError);
        // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
      }
    } catch (error) {
      console.error('Error saving reset log:', error);
      throw error;
    }
  }

  /**
   * טוען את כל לוגי האיפוסים
   */
  static async loadResetLogs(): Promise<ResetLog[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(RESET_LOGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading reset logs:', error);
      return [];
    }
  }

  /**
   * טוען לוגי איפוסים של טיימר ספציפי
   */
  static async loadResetLogsByTimer(timerId: string): Promise<ResetLog[]> {
    try {
      const allLogs = await this.loadResetLogs();
      return allLogs.filter(log => log.timerId === timerId);
    } catch (error) {
      console.error('Error loading timer reset logs:', error);
      return [];
    }
  }

  /**
   * סופר איפוסים לפי טיימר
   */
  static async countResetsByTimer(timerId: string): Promise<number> {
    try {
      const logs = await this.loadResetLogsByTimer(timerId);
      return logs.length;
    } catch (error) {
      console.error('Error counting resets:', error);
      return 0;
    }
  }

  /**
   * שומר שבירת שיא
   */
  static async saveRecordBreak(recordBreak: RecordBreak): Promise<void> {
    try {
      const records = await this.loadRecordBreaks();
      records.unshift(recordBreak);
      
      // שומר רק 100 אחרונים
      const limitedRecords = records.slice(0, 100);
      
      const jsonValue = JSON.stringify(limitedRecords);
      await AsyncStorage.setItem(RECORD_BREAKS_KEY, jsonValue);
      
      // סנכרון לענן - לא חוסם את השמירה המקומית
      try {
        const SyncService = await getSyncService();
        await SyncService.syncRecordBreak(recordBreak);
      } catch (syncError) {
        console.warn('Cloud sync failed, but local save succeeded:', syncError);
        // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
      }
    } catch (error) {
      console.error('Error saving record break:', error);
      throw error;
    }
  }

  /**
   * טוען את כל שבירות השיאים
   */
  static async loadRecordBreaks(): Promise<RecordBreak[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(RECORD_BREAKS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading record breaks:', error);
      return [];
    }
  }

  /**
   * טוען שבירות שיאים של טיימר ספציפי
   */
  static async loadRecordBreaksByTimer(timerId: string): Promise<RecordBreak[]> {
    try {
      const allRecords = await this.loadRecordBreaks();
      return allRecords.filter(record => record.timerId === timerId);
    } catch (error) {
      console.error('Error loading timer record breaks:', error);
      return [];
    }
  }

  /**
   * טוען רק שבירות שיאים גלובליים
   */
  static async loadGlobalRecordBreaks(): Promise<RecordBreak[]> {
    try {
      const allRecords = await this.loadRecordBreaks();
      return allRecords.filter(record => record.isGlobalRecord);
    } catch (error) {
      console.error('Error loading global record breaks:', error);
      return [];
    }
  }

  /**
   * שומר דיווח באג חדש
   */
  static async saveBugReport(bugReport: BugReport): Promise<void> {
    try {
      const reports = await this.loadBugReports();
      reports.unshift(bugReport);
      
      // שומר רק 50 אחרונים
      const limitedReports = reports.slice(0, 50);
      
      const jsonValue = JSON.stringify(limitedReports);
      await AsyncStorage.setItem(BUG_REPORTS_KEY, jsonValue);
      
      console.log('[StorageService] Bug report saved:', bugReport.id);
      
      // סנכרון לענן - לא חוסם את השמירה המקומית
      try {
        const SyncService = await getSyncService();
        await SyncService.syncBugReport(bugReport);
      } catch (syncError) {
        console.warn('Cloud sync failed, but local save succeeded:', syncError);
        // לא זורקים שגיאה - הסנכרון יתבצע מאוחר יותר
      }
    } catch (error) {
      console.error('Error saving bug report:', error);
      throw error;
    }
  }

  /**
   * טוען את כל דיווחי הבאגים
   */
  static async loadBugReports(): Promise<BugReport[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(BUG_REPORTS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading bug reports:', error);
      return [];
    }
  }

  /**
   * מחיקת דיווח באג מקומי (אחרי סנכרון מוצלח)
   */
  static async deleteBugReport(reportId: string): Promise<void> {
    try {
      const reports = await this.loadBugReports();
      const updatedReports = reports.filter(r => r.id !== reportId);
      await AsyncStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(updatedReports));
      console.log('[StorageService] Bug report deleted:', reportId);
    } catch (error) {
      console.error('Error deleting bug report:', error);
      throw error;
    }
  }

  /**
   * עדכון סטטוס דיווח באג
   */
  static async updateBugReportStatus(reportId: string, status: 'pending' | 'synced'): Promise<void> {
    try {
      const reports = await this.loadBugReports();
      const reportIndex = reports.findIndex(r => r.id === reportId);
      if (reportIndex !== -1) {
        reports[reportIndex].status = status;
        await AsyncStorage.setItem(BUG_REPORTS_KEY, JSON.stringify(reports));
        console.log('[StorageService] Bug report status updated:', reportId, status);
      }
    } catch (error) {
      console.error('Error updating bug report status:', error);
      throw error;
    }
  }
}

