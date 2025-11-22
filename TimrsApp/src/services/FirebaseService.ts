/**
 * Firebase Service - שכבת abstraction מעל Firebase
 * מספק ממשק פשוט לעבודה עם Firestore ו-Auth
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {FirebaseConfig, FirestoreCollections, StorageKeys} from '../config/firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Timer,
  GlobalStats,
  DeletedTimer,
  ResetLog,
  RecordBreak,
  BugReport,
} from '../types';
import {ErrorHandler} from '../utils/ErrorHandler';

class FirebaseServiceClass {
  private userId: string | null = null;
  private isInitialized: boolean = false;
  private firestoreEnabled: boolean = false;

  /**
   * אתחול Firebase
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('[FirebaseService] Already initialized');
      // וודא שיש user ID
      if (!this.userId) {
        await this.signInAnonymously();
      }
      return true;
    }

    if (!FirebaseConfig.enabled) {
      console.log('[FirebaseService] Firebase is disabled in config');
      return false;
    }

    try {
      console.log('[FirebaseService] Starting initialization...');
      
      // אתחול Firestore settings
      if (FirebaseConfig.firestore.persistenceEnabled) {
        try {
          await firestore().settings({
            persistence: true,
            cacheSizeBytes: FirebaseConfig.firestore.cacheSizeBytes,
          });
          console.log('[FirebaseService] Firestore settings configured successfully');
          this.firestoreEnabled = true;
        } catch (settingsError) {
          console.error('[FirebaseService] Failed to configure Firestore settings:', settingsError);
          // ממשיכים אבל ללא persistence
          this.firestoreEnabled = false;
          throw settingsError;
        }
      } else {
        this.firestoreEnabled = true;
      }

      this.isInitialized = true;
      
      console.log('[FirebaseService] Firestore initialized');
      await AsyncStorage.setItem(StorageKeys.FIREBASE_INITIALIZED, 'true');
      
      // ניסיון להתחבר אנונימית מיד
      const userId = await this.signInAnonymously();
      if (userId) {
        console.log('[FirebaseService] Initialized successfully with user:', userId);
        return true;
      } else {
        console.warn('[FirebaseService] Initialized but no user ID');
        return false;
      }
    } catch (error) {
      console.error('[FirebaseService] Initialization error:', error);
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.initialize');
      return false;
    }
  }

  /**
   * התחברות אנונימית
   */
  public async signInAnonymously(): Promise<string | null> {
    try {
      console.log('[FirebaseService] Attempting anonymous sign in...');
      
      // בדיקה אם כבר מחובר
      const currentUser = auth().currentUser;
      if (currentUser) {
        this.userId = currentUser.uid;
        await AsyncStorage.setItem(StorageKeys.USER_ID, currentUser.uid);
        console.log('[FirebaseService] Already signed in:', currentUser.uid);
        return currentUser.uid;
      }

      // התחברות חדשה
      console.log('[FirebaseService] Signing in anonymously...');
      const userCredential = await auth().signInAnonymously();
      this.userId = userCredential.user.uid;
      
      await AsyncStorage.setItem(StorageKeys.USER_ID, this.userId);
      console.log('[FirebaseService] ✅ Signed in anonymously successfully:', this.userId);
      
      return this.userId;
    } catch (error: any) {
      console.error('[FirebaseService] ❌ Sign in failed:', error);
      console.error('[FirebaseService] Error code:', error.code);
      console.error('[FirebaseService] Error message:', error.message);
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.signInAnonymously');
      return null;
    }
  }

  /**
   * קבלת User ID נוכחי
   */
  public async getUserId(): Promise<string | null> {
    if (this.userId) {
      return this.userId;
    }

    // ניסיון לטעון מ-AsyncStorage
    const storedUserId = await AsyncStorage.getItem(StorageKeys.USER_ID);
    if (storedUserId) {
      this.userId = storedUserId;
      return storedUserId;
    }

    // אם אין - התחברות חדשה
    return await this.signInAnonymously();
  }

  /**
   * קבלת reference ל-user collection
   */
  private async getUserRef() {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('No user ID available');
    }
    return firestore().collection(FirestoreCollections.USERS).doc(userId);
  }

  // ===== Timers Operations =====

  /**
   * שמירת טיימר ל-Firestore
   */
  public async saveTimer(timer: Timer): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.TIMERS)
        .doc(timer.id)
        .set(timer);
      
      console.log('[FirebaseService] Timer saved:', timer.id);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveTimer');
      throw error;
    }
  }

  /**
   * טעינת כל הטיימרים
   */
  public async loadTimers(): Promise<Timer[]> {
    if (!this.isEnabled()) return [];

    try {
      const userRef = await this.getUserRef();
      const snapshot = await userRef
        .collection(FirestoreCollections.TIMERS)
        .get();
      
      const timers: Timer[] = [];
      snapshot.forEach(doc => {
        timers.push(doc.data() as Timer);
      });
      
      console.log('[FirebaseService] Loaded timers:', timers.length);
      return timers;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadTimers');
      return [];
    }
  }

  /**
   * מחיקת טיימר
   */
  public async deleteTimer(timerId: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.TIMERS)
        .doc(timerId)
        .delete();
      
      console.log('[FirebaseService] Timer deleted:', timerId);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.deleteTimer');
      throw error;
    }
  }

  // ===== Global Stats Operations =====

  /**
   * שמירת סטטיסטיקות גלובליות
   */
  public async saveGlobalStats(stats: GlobalStats): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.GLOBAL_STATS)
        .doc('stats')
        .set(stats);
      
      console.log('[FirebaseService] Global stats saved');
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveGlobalStats');
      throw error;
    }
  }

  /**
   * טעינת סטטיסטיקות גלובליות
   */
  public async loadGlobalStats(): Promise<GlobalStats | null> {
    if (!this.isEnabled()) return null;

    try {
      const userRef = await this.getUserRef();
      const doc = await userRef
        .collection(FirestoreCollections.GLOBAL_STATS)
        .doc('stats')
        .get();
      
      if (doc.exists()) {
        return doc.data() as GlobalStats;
      }
      return null;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadGlobalStats');
      return null;
    }
  }

  // ===== Deleted Timers Operations =====

  /**
   * שמירת טיימר מחוק
   */
  public async saveDeletedTimer(timer: DeletedTimer): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.DELETED_TIMERS)
        .doc(timer.id)
        .set(timer);
      
      console.log('[FirebaseService] Deleted timer saved:', timer.id);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveDeletedTimer');
      throw error;
    }
  }

  /**
   * טעינת טיימרים מחוקים
   */
  public async loadDeletedTimers(): Promise<DeletedTimer[]> {
    if (!this.isEnabled()) return [];

    try {
      const userRef = await this.getUserRef();
      const snapshot = await userRef
        .collection(FirestoreCollections.DELETED_TIMERS)
        .orderBy('deletedAt', 'desc')
        .limit(50)
        .get();
      
      const timers: DeletedTimer[] = [];
      snapshot.forEach(doc => {
        timers.push(doc.data() as DeletedTimer);
      });
      
      return timers;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadDeletedTimers');
      return [];
    }
  }

  /**
   * מחיקת טיימר מחוק לצמיתות
   */
  public async deleteDeletedTimer(timerId: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.DELETED_TIMERS)
        .doc(timerId)
        .delete();
      
      console.log('[FirebaseService] Deleted timer permanently removed from cloud:', timerId);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.deleteDeletedTimer');
      throw error;
    }
  }

  // ===== Reset Logs Operations =====

  /**
   * שמירת לוג איפוס
   */
  public async saveResetLog(log: ResetLog): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.RESET_LOGS)
        .doc(log.id)
        .set(log);
      
      console.log('[FirebaseService] Reset log saved:', log.id);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveResetLog');
      throw error;
    }
  }

  /**
   * טעינת לוגי איפוס
   */
  public async loadResetLogs(timerId?: string): Promise<ResetLog[]> {
    if (!this.isEnabled()) return [];

    try {
      const userRef = await this.getUserRef();
      let query = userRef
        .collection(FirestoreCollections.RESET_LOGS)
        .orderBy('timestamp', 'desc')
        .limit(200);
      
      if (timerId) {
        query = query.where('timerId', '==', timerId) as any;
      }
      
      const snapshot = await query.get();
      
      const logs: ResetLog[] = [];
      snapshot.forEach(doc => {
        logs.push(doc.data() as ResetLog);
      });
      
      return logs;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadResetLogs');
      return [];
    }
  }

  // ===== Record Breaks Operations =====

  /**
   * שמירת שבירת שיא
   */
  public async saveRecordBreak(record: RecordBreak): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.RECORD_BREAKS)
        .doc(record.id)
        .set(record);
      
      console.log('[FirebaseService] Record break saved:', record.id);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveRecordBreak');
      throw error;
    }
  }

  /**
   * טעינת שבירות שיא
   */
  public async loadRecordBreaks(timerId?: string): Promise<RecordBreak[]> {
    if (!this.isEnabled()) return [];

    try {
      const userRef = await this.getUserRef();
      let query = userRef
        .collection(FirestoreCollections.RECORD_BREAKS)
        .orderBy('timestamp', 'desc')
        .limit(100);
      
      if (timerId) {
        query = query.where('timerId', '==', timerId) as any;
      }
      
      const snapshot = await query.get();
      
      const records: RecordBreak[] = [];
      snapshot.forEach(doc => {
        records.push(doc.data() as RecordBreak);
      });
      
      return records;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadRecordBreaks');
      return [];
    }
  }

  // ===== Utility Methods =====

  /**
   * בדיקה האם Firebase מופעל
   */
  public isEnabled(): boolean {
    return this.isInitialized && this.firestoreEnabled && FirebaseConfig.enabled;
  }

  /**
   * בדיקה האם Firebase מוכן לשימוש (מופעל + יש user)
   */
  public async isReady(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }
    const userId = await this.getUserId();
    return userId !== null;
  }

  /**
   * קבלת סטטוס
   */
  public getStatus(): {
    enabled: boolean;
    initialized: boolean;
    userId: string | null;
  } {
    return {
      enabled: FirebaseConfig.enabled,
      initialized: this.isInitialized,
      userId: this.userId,
    };
  }

  /**
   * ניקוי מטמון
   */
  public async clearCache(): Promise<void> {
    try {
      await firestore().clearPersistence();
      console.log('[FirebaseService] Cache cleared');
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.clearCache');
    }
  }

  /**
   * מחיקה מלאה של כל הנתונים של המשתמש
   */
  public async deleteAllUserData(): Promise<void> {
    if (!this.isEnabled()) {
      console.log('[FirebaseService] Firebase not enabled, skipping deletion');
      return;
    }

    try {
      const userRef = await this.getUserRef();
      console.log('[FirebaseService] Starting full data deletion...');

      // מחיקת כל הטיימרים - עם טיפול בכשלונות חלקיים
      const timersSnapshot = await userRef
        .collection(FirestoreCollections.TIMERS)
        .get();
      console.log('[FirebaseService] Deleting', timersSnapshot.size, 'timers');
      const timerDeletions = timersSnapshot.docs.map(doc => doc.ref.delete());
      const timerResults = await Promise.allSettled(timerDeletions);
      const timerFailed = timerResults.filter(r => r.status === 'rejected').length;
      if (timerFailed > 0) {
        console.warn(`[FirebaseService] Failed to delete ${timerFailed} timers`);
      }

      // מחיקת כל הטיימרים המחוקים
      const deletedTimersSnapshot = await userRef
        .collection(FirestoreCollections.DELETED_TIMERS)
        .get();
      console.log('[FirebaseService] Deleting', deletedTimersSnapshot.size, 'deleted timers');
      const deletedTimerDeletions = deletedTimersSnapshot.docs.map(doc => doc.ref.delete());
      const deletedResults = await Promise.allSettled(deletedTimerDeletions);
      const deletedFailed = deletedResults.filter(r => r.status === 'rejected').length;
      if (deletedFailed > 0) {
        console.warn(`[FirebaseService] Failed to delete ${deletedFailed} deleted timers`);
      }

      // מחיקת כל לוגי האיפוסים
      const resetLogsSnapshot = await userRef
        .collection(FirestoreCollections.RESET_LOGS)
        .get();
      console.log('[FirebaseService] Deleting', resetLogsSnapshot.size, 'reset logs');
      const resetLogDeletions = resetLogsSnapshot.docs.map(doc => doc.ref.delete());
      const resetResults = await Promise.allSettled(resetLogDeletions);
      const resetFailed = resetResults.filter(r => r.status === 'rejected').length;
      if (resetFailed > 0) {
        console.warn(`[FirebaseService] Failed to delete ${resetFailed} reset logs`);
      }

      // מחיקת כל שבירות השיאים
      const recordBreaksSnapshot = await userRef
        .collection(FirestoreCollections.RECORD_BREAKS)
        .get();
      console.log('[FirebaseService] Deleting', recordBreaksSnapshot.size, 'record breaks');
      const recordBreakDeletions = recordBreaksSnapshot.docs.map(doc => doc.ref.delete());
      const recordResults = await Promise.allSettled(recordBreakDeletions);
      const recordFailed = recordResults.filter(r => r.status === 'rejected').length;
      if (recordFailed > 0) {
        console.warn(`[FirebaseService] Failed to delete ${recordFailed} record breaks`);
      }

      // מחיקת הסטטיסטיקות הגלובליות
      await userRef
        .collection(FirestoreCollections.GLOBAL_STATS)
        .doc('stats')
        .delete();
      console.log('[FirebaseService] Deleted global stats');

      // מחיקת כל דיווחי הבאגים
      const bugReportsSnapshot = await userRef
        .collection(FirestoreCollections.BUG_REPORTS)
        .get();
      console.log('[FirebaseService] Deleting', bugReportsSnapshot.size, 'bug reports');
      const bugReportDeletions = bugReportsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(bugReportDeletions);

      console.log('[FirebaseService] ✅ All user data deleted successfully');
    } catch (error) {
      console.error('[FirebaseService] ❌ Error deleting user data:', error);
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.deleteAllUserData');
      throw error;
    }
  }

  // ===== Bug Reports Operations =====

  /**
   * שמירת דיווח באג
   */
  public async saveBugReport(report: BugReport): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.BUG_REPORTS)
        .doc(report.id)
        .set(report);
      
      console.log('[FirebaseService] Bug report saved:', report.id);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.saveBugReport');
      throw error;
    }
  }

  /**
   * טעינת דיווחי באגים
   */
  public async loadBugReports(): Promise<BugReport[]> {
    if (!this.isEnabled()) return [];

    try {
      const userRef = await this.getUserRef();
      const snapshot = await userRef
        .collection(FirestoreCollections.BUG_REPORTS)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      const reports: BugReport[] = [];
      snapshot.forEach(doc => {
        reports.push(doc.data() as BugReport);
      });
      
      console.log('[FirebaseService] Loaded bug reports:', reports.length);
      return reports;
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.loadBugReports');
      return [];
    }
  }

  /**
   * מחיקת דיווח באג מהענן
   */
  public async deleteBugReport(reportId: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const userRef = await this.getUserRef();
      await userRef
        .collection(FirestoreCollections.BUG_REPORTS)
        .doc(reportId)
        .delete();
      
      console.log('[FirebaseService] Bug report deleted from cloud:', reportId);
    } catch (error) {
      ErrorHandler.handleFirebaseError(error as Error, 'FirebaseService.deleteBugReport');
      throw error;
    }
  }

  // ===== Utility Methods =====

  /**
   * קבלת מידע על כמות הנתונים של המשתמש
   */
  public async getUserDataCount(): Promise<{
    timers: number;
    deletedTimers: number;
    resetLogs: number;
    recordBreaks: number;
    bugReports: number;
    hasGlobalStats: boolean;
  }> {
    if (!this.isEnabled()) {
      return {
        timers: 0,
        deletedTimers: 0,
        resetLogs: 0,
        recordBreaks: 0,
        bugReports: 0,
        hasGlobalStats: false,
      };
    }

    try {
      const userRef = await this.getUserRef();

      const [
        timersSnapshot,
        deletedTimersSnapshot,
        resetLogsSnapshot,
        recordBreaksSnapshot,
        bugReportsSnapshot,
        globalStatsDoc,
      ] = await Promise.all([
        userRef.collection(FirestoreCollections.TIMERS).get(),
        userRef.collection(FirestoreCollections.DELETED_TIMERS).get(),
        userRef.collection(FirestoreCollections.RESET_LOGS).get(),
        userRef.collection(FirestoreCollections.RECORD_BREAKS).get(),
        userRef.collection(FirestoreCollections.BUG_REPORTS).get(),
        userRef.collection(FirestoreCollections.GLOBAL_STATS).doc('stats').get(),
      ]);

      return {
        timers: timersSnapshot.size,
        deletedTimers: deletedTimersSnapshot.size,
        resetLogs: resetLogsSnapshot.size,
        recordBreaks: recordBreaksSnapshot.size,
        bugReports: bugReportsSnapshot.size,
        hasGlobalStats: globalStatsDoc.exists(),
      };
    } catch (error) {
      console.error('[FirebaseService] Error getting user data count:', error);
      throw error;
    }
  }
}

// Singleton instance
export const FirebaseService = new FirebaseServiceClass();

