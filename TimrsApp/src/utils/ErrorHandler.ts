/**
 * מנהל שגיאות מרכזי לאפליקציה
 */

export enum ErrorType {
  NETWORK = 'network',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  SYNC = 'sync',
  FIREBASE = 'firebase',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  context?: string;
  retryable?: boolean;
}

class ErrorHandlerClass {
  private errorListeners: Array<(error: AppError) => void> = [];

  /**
   * רישום listener לשגיאות
   */
  public addErrorListener(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);
    // החזרת פונקציה להסרה
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  /**
   * טיפול בשגיאה
   */
  public handle(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    context?: string,
    retryable: boolean = false,
  ): AppError {
    const appError: AppError = {
      type,
      message: this.getErrorMessage(error),
      originalError: error instanceof Error ? error : undefined,
      timestamp: Date.now(),
      context,
      retryable,
    };

    // לוג לקונסול
    console.error('[ErrorHandler]', {
      type,
      message: appError.message,
      context,
      error: appError.originalError,
    });

    // הודעה ל-listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(appError);
      } catch (e) {
        console.error('[ErrorHandler] Error in listener:', e);
      }
    });

    return appError;
  }

  /**
   * טיפול בשגיאת רשת
   */
  public handleNetworkError(error: Error | string, context?: string): AppError {
    return this.handle(error, ErrorType.NETWORK, context, true);
  }

  /**
   * טיפול בשגיאת אחסון
   */
  public handleStorageError(error: Error | string, context?: string): AppError {
    return this.handle(error, ErrorType.STORAGE, context, true);
  }

  /**
   * טיפול בשגיאת ולידציה
   */
  public handleValidationError(
    error: Error | string,
    context?: string,
  ): AppError {
    return this.handle(error, ErrorType.VALIDATION, context, false);
  }

  /**
   * טיפול בשגיאת סנכרון
   */
  public handleSyncError(error: Error | string, context?: string): AppError {
    return this.handle(error, ErrorType.SYNC, context, true);
  }

  /**
   * טיפול בשגיאת Firebase
   */
  public handleFirebaseError(error: Error | string, context?: string): AppError {
    return this.handle(error, ErrorType.FIREBASE, context, true);
  }

  /**
   * קבלת הודעת שגיאה ידידותית למשתמש
   */
  public getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'בעיית חיבור לאינטרנט. אנא בדוק את החיבור שלך.';
      case ErrorType.STORAGE:
        return 'שגיאה בשמירת הנתונים. אנא נסה שוב.';
      case ErrorType.VALIDATION:
        return error.message; // הודעת הולידציה עצמה ברורה
      case ErrorType.SYNC:
        return 'שגיאה בסנכרון. הנתונים נשמרו מקומית ויסונכרנו בהזדמנות הבאה.';
      case ErrorType.FIREBASE:
        return 'שגיאת שרת. אנא נסה שוב מאוחר יותר.';
      default:
        return 'אירעה שגיאה לא צפויה. אנא נסה שוב.';
    }
  }

  /**
   * קבלת הודעת שגיאה מהאובייקט
   */
  private getErrorMessage(error: Error | string): string {
    if (typeof error === 'string') {
      return error;
    }
    return error.message || 'Unknown error';
  }

  /**
   * בדיקה האם השגיאה ניתנת לניסיון חוזר
   */
  public isRetryable(error: AppError): boolean {
    return error.retryable === true;
  }

  /**
   * ניקוי listeners (לשימוש בעת unmount)
   */
  public clearListeners(): void {
    this.errorListeners = [];
  }
}

// Singleton instance
export const ErrorHandler = new ErrorHandlerClass();

/**
 * Wrapper לפונקציות אסינכרוניות עם טיפול בשגיאות
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: string,
): Promise<{data?: T; error?: AppError}> {
  try {
    const data = await fn();
    return {data};
  } catch (error) {
    const appError = ErrorHandler.handle(
      error as Error,
      errorType,
      context,
      errorType === ErrorType.NETWORK || errorType === ErrorType.SYNC,
    );
    return {error: appError};
  }
}

