/**
 * Sync Service - ניהול סנכרון בין local ל-Firebase
 * Offline-first approach עם queue management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseService} from './FirebaseService';
import {StorageService} from './StorageService';
import {NetworkService, NetworkStatus} from './NetworkService';
import {StorageKeys} from '../config/firebase.config';
import {
  Timer,
  GlobalStats,
  DeletedTimer,
  ResetLog,
  RecordBreak,
  SyncQueueItem,
  SyncStatus,
} from '../types';
import {ErrorHandler, ErrorType} from '../utils/ErrorHandler';

type SyncListener = (status: SyncStatus) => void;

class SyncServiceClass {
  private syncStatus: SyncStatus = 'offline';
  private isSyncing: boolean = false;
  private syncQueue: SyncQueueItem[] = [];
  private listeners: SyncListener[] = [];
  private autoSyncInterval: NodeJS.Timeout | null = null;

  /**
   * אתחול שירות הסנכרון
   */
  public async initialize(): Promise<void> {
    console.log('[SyncService] Initializing...');

    // טעינת תור הסנכרון
    await this.loadSyncQueue();

    // אתחול Network Service
    NetworkService.initialize();
    
    // האזנה לשינויים במצב הרשת
    NetworkService.addListener(this.handleNetworkChange.bind(this));

    // אתחול Firebase (אסינכרוני - לא חוסם)
    FirebaseService.initialize()
      .then(initialized => {
        if (initialized) {
          console.log('[SyncService] Firebase initialized, ready to sync');
          // אם יש תור ואנחנו online - נסה לעבד
          if (this.syncQueue.length > 0 && NetworkService.isOnline()) {
            this.processQueue();
          }
        } else {
          console.log('[SyncService] Firebase not initialized');
        }
      })
      .catch(error => {
        console.error('[SyncService] Firebase initialization failed:', error);
      });

    console.log('[SyncService] Initialized');
  }

  /**
   * טיפול בשינוי מצב רשת
   */
  private handleNetworkChange(networkStatus: NetworkStatus): void {
    console.log('[SyncService] Network status changed:', networkStatus);

    if (networkStatus === 'online') {
      // כשחוזר אינטרנט - נסה לסנכרן
      this.updateStatus('pending');
      this.syncAll().catch(error => {
        console.error('[SyncService] Auto-sync failed:', error);
      });
    } else {
      this.updateStatus('offline');
    }
  }

  /**
   * עדכון סטטוס סנכרון
   */
  private updateStatus(status: SyncStatus): void {
    if (this.syncStatus !== status) {
      this.syncStatus = status;
      console.log('[SyncService] Status changed:', status);
      this.notifyListeners(status);
    }
  }

  /**
   * רישום listener לשינויי סטטוס
   */
  public addListener(listener: SyncListener): () => void {
    this.listeners.push(listener);
    listener(this.syncStatus);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * הודעה ל-listeners
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('[SyncService] Error in listener:', error);
      }
    });
  }

  /**
   * קבלת סטטוס נוכחי
   */
  public getStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * הוספת פריט לתור
   */
  private async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();
    
    console.log('[SyncService] Added to queue:', queueItem.type, queueItem.collection);

    // אם אונליין וFirebase מוכן - נסה לסנכרן מיד
    if (NetworkService.isOnline() && !this.isSyncing && FirebaseService.isEnabled()) {
      // בדיקה אם יש user ID
      const userId = await FirebaseService.getUserId();
      if (userId) {
        this.processQueue().catch(error => {
          console.error('[SyncService] Failed to process queue:', error);
        });
      } else {
        console.log('[SyncService] No user ID yet, queue will be processed later');
      }
    }
  }

  /**
   * שמירת תור ל-AsyncStorage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageKeys.PENDING_SYNCS,
        JSON.stringify(this.syncQueue),
      );
    } catch (error) {
      console.error('[SyncService] Error saving sync queue:', error);
    }
  }

  /**
   * טעינת תור מ-AsyncStorage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(StorageKeys.PENDING_SYNCS);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        console.log('[SyncService] Loaded queue:', this.syncQueue.length, 'items');
      }
    } catch (error) {
      console.error('[SyncService] Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * עיבוד התור
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    if (!NetworkService.isOnline()) {
      this.updateStatus('offline');
      return;
    }

    if (!FirebaseService.isEnabled()) {
      console.log('[SyncService] Firebase not enabled, skipping queue');
      return;
    }

    this.isSyncing = true;
    this.updateStatus('syncing');

    console.log('[SyncService] Processing queue:', this.syncQueue.length, 'items');

    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error('[SyncService] Failed to process item:', item, error);
        
        // אם נכשל - נוסיף בחזרה לתור
        item.retryCount++;
        if (item.retryCount < 3) {
          this.syncQueue.push(item);
        } else {
          console.error('[SyncService] Item exceeded max retries:', item);
        }
      }
    }

    await this.saveSyncQueue();
    this.isSyncing = false;

    if (this.syncQueue.length > 0) {
      this.updateStatus('pending');
    } else {
      this.updateStatus('synced');
      await this.updateLastSyncTime();
    }
  }

  /**
   * עיבוד פריט בודד מהתור
   */
  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    // וודא ש-Firebase מוכן ומחובר
    const isReady = await FirebaseService.isReady();
    if (!isReady) {
      console.log('[SyncService] Firebase not ready, initializing...');
      const initialized = await FirebaseService.initialize();
      if (!initialized) {
        throw new Error('Firebase initialization failed');
      }
      const userId = await FirebaseService.getUserId();
      if (!userId) {
        throw new Error('Firebase initialized but no user ID');
      }
      console.log('[SyncService] Firebase ready with user:', userId);
    }
    
    switch (item.collection) {
      case 'timers':
        if (item.type === 'create' || item.type === 'update') {
          await FirebaseService.saveTimer(item.data as Timer);
        } else if (item.type === 'delete') {
          await FirebaseService.deleteTimer(item.data.id);
        }
        break;

      case 'globalStats':
        await FirebaseService.saveGlobalStats(item.data as GlobalStats);
        break;

      case 'deletedTimers':
        await FirebaseService.saveDeletedTimer(item.data as DeletedTimer);
        break;

      case 'resetLogs':
        await FirebaseService.saveResetLog(item.data as ResetLog);
        break;

      case 'recordBreaks':
        await FirebaseService.saveRecordBreak(item.data as RecordBreak);
        break;
    }
  }

  // ===== Public Methods for Syncing =====

  /**
   * סנכרון טיימר
   */
  public async syncTimer(timer: Timer, operation: 'create' | 'update' | 'delete' = 'update'): Promise<void> {
    await this.addToQueue({
      type: operation,
      collection: 'timers',
      data: timer,
    });
  }

  /**
   * סנכרון סטטיסטיקות גלובליות
   */
  public async syncGlobalStats(stats: GlobalStats): Promise<void> {
    await this.addToQueue({
      type: 'update',
      collection: 'globalStats',
      data: stats,
    });
  }

  /**
   * סנכרון טיימר מחוק
   */
  public async syncDeletedTimer(timer: DeletedTimer): Promise<void> {
    await this.addToQueue({
      type: 'create',
      collection: 'deletedTimers',
      data: timer,
    });
  }

  /**
   * סנכרון לוג איפוס
   */
  public async syncResetLog(log: ResetLog): Promise<void> {
    await this.addToQueue({
      type: 'create',
      collection: 'resetLogs',
      data: log,
    });
  }

  /**
   * סנכרון שבירת שיא
   */
  public async syncRecordBreak(record: RecordBreak): Promise<void> {
    await this.addToQueue({
      type: 'create',
      collection: 'recordBreaks',
      data: record,
    });
  }

  /**
   * סנכרון מלא (pull + push)
   */
  public async syncAll(): Promise<void> {
    if (!NetworkService.isOnline()) {
      throw new Error('No internet connection');
    }

    if (!FirebaseService.isEnabled()) {
      console.log('[SyncService] Firebase not enabled');
      return;
    }

    try {
      this.updateStatus('syncing');

      // תחילה - דחיפה של כל מה שבתור
      await this.processQueue();

      // אחר כך - משיכה מהענן
      await this.pullFromCloud();

      this.updateStatus('synced');
      await this.updateLastSyncTime();
      
      console.log('[SyncService] Full sync completed');
    } catch (error) {
      this.updateStatus('error');
      ErrorHandler.handleSyncError(error as Error, 'SyncService.syncAll');
      throw error;
    }
  }

  /**
   * משיכה מהענן
   */
  private async pullFromCloud(): Promise<void> {
    try {
      // טעינת נתונים מ-Firebase
      const [timers, globalStats, deletedTimers] = await Promise.all([
        FirebaseService.loadTimers(),
        FirebaseService.loadGlobalStats(),
        FirebaseService.loadDeletedTimers(),
      ]);

      // מיזוג עם נתונים מקומיים
      if (timers.length > 0) {
        await StorageService.saveTimers(timers);
      }

      if (globalStats) {
        await StorageService.saveGlobalStats(globalStats);
      }

      console.log('[SyncService] Pulled from cloud:', {
        timers: timers.length,
        hasGlobalStats: !!globalStats,
        deletedTimers: deletedTimers.length,
      });
    } catch (error) {
      console.error('[SyncService] Error pulling from cloud:', error);
      throw error;
    }
  }

  /**
   * עדכון זמן הסנכרון האחרון
   */
  private async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageKeys.LAST_SYNC,
        Date.now().toString(),
      );
    } catch (error) {
      console.error('[SyncService] Error updating last sync time:', error);
    }
  }

  /**
   * קבלת זמן הסנכרון האחרון
   */
  public async getLastSyncTime(): Promise<number | null> {
    try {
      const lastSync = await AsyncStorage.getItem(StorageKeys.LAST_SYNC);
      return lastSync ? parseInt(lastSync, 10) : null;
    } catch (error) {
      console.error('[SyncService] Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * קבלת מספר פריטים ממתינים
   */
  public getPendingCount(): number {
    return this.syncQueue.length;
  }

  /**
   * ניקוי תור
   */
  public async clearQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
    console.log('[SyncService] Queue cleared');
  }
}

// Singleton instance
export const SyncService = new SyncServiceClass();

