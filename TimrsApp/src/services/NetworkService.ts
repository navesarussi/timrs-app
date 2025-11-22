/**
 * Network Service - ניטור מצב חיבור לאינטרנט
 */

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

type NetworkListener = (status: NetworkStatus) => void;

class NetworkServiceClass {
  private currentStatus: NetworkStatus = 'unknown';
  private listeners: NetworkListener[] = [];
  private unsubscribe: (() => void) | null = null;

  /**
   * אתחול השירות
   */
  public initialize(): void {
    if (this.unsubscribe) {
      console.warn('[NetworkService] Already initialized');
      return;
    }

    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus: NetworkStatus = this.getStatusFromState(state);
      
      if (newStatus !== this.currentStatus) {
        console.log('[NetworkService] Status changed:', this.currentStatus, '->', newStatus);
        this.currentStatus = newStatus;
        this.notifyListeners(newStatus);
      }
    });

    // בדיקה ראשונית
    NetInfo.fetch().then((state: NetInfoState) => {
      this.currentStatus = this.getStatusFromState(state);
      console.log('[NetworkService] Initial status:', this.currentStatus);
      this.notifyListeners(this.currentStatus);
    });
  }

  /**
   * סגירת השירות
   */
  public shutdown(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }

  /**
   * קבלת סטטוס נוכחי
   */
  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * בדיקה האם יש חיבור
   */
  public isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  /**
   * בדיקה האם אין חיבור
   */
  public isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  /**
   * רישום listener לשינויים
   */
  public addListener(listener: NetworkListener): () => void {
    this.listeners.push(listener);
    
    // קריאה מיידית עם הסטטוס הנוכחי
    listener(this.currentStatus);
    
    // החזרת פונקציה להסרה
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * בדיקה ידנית של מצב הרשת
   */
  public async checkConnection(): Promise<NetworkStatus> {
    try {
      const state = await NetInfo.fetch();
      const status = this.getStatusFromState(state);
      
      if (status !== this.currentStatus) {
        this.currentStatus = status;
        this.notifyListeners(status);
      }
      
      return status;
    } catch (error) {
      console.error('[NetworkService] Error checking connection:', error);
      return 'unknown';
    }
  }

  /**
   * המרת NetInfo state לסטטוס פשוט
   */
  private getStatusFromState(state: NetInfoState): NetworkStatus {
    if (state.isConnected === true && state.isInternetReachable === true) {
      return 'online';
    } else if (state.isConnected === false) {
      return 'offline';
    } else {
      return 'unknown';
    }
  }

  /**
   * הודעה לכל ה-listeners
   */
  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('[NetworkService] Error in listener:', error);
      }
    });
  }

  /**
   * ניקוי listeners
   */
  public clearListeners(): void {
    this.listeners = [];
  }
}

// Singleton instance
export const NetworkService = new NetworkServiceClass();

