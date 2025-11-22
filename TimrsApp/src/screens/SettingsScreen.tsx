/**
 * Settings Screen - מסך הגדרות מקיף ומינימליסטי
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {SyncService} from '../services/SyncService';
import {FirebaseService} from '../services/FirebaseService';
import {NetworkService} from '../services/NetworkService';
import {StorageService} from '../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SyncStatus, BugReport} from '../types';
import {formatRelativeDate} from '../utils/dateUtils';
import {v4 as uuidv4} from 'uuid';
import {Platform} from 'react-native';

const APP_VERSION = '2.3.0';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
  onOpenResetHistory?: () => void;
  onOpenRecordBreaks?: () => void;
  onDataReset?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  onClose,
  onOpenHistory,
  onOpenResetHistory,
  onOpenRecordBreaks,
  onDataReset,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState({
    enabled: false,
    initialized: false,
    userId: null as string | null,
  });
  const [bugReport, setBugReport] = useState('');

  useEffect(() => {
    if (visible) {
      loadData();
      
      // האזנה לשינויים בסטטוס
      const unsubscribeSync = SyncService.addListener(setSyncStatus);
      const unsubscribeNetwork = NetworkService.addListener(status => {
        setIsOnline(status === 'online');
      });

      return () => {
        unsubscribeSync();
        unsubscribeNetwork();
      };
    }
  }, [visible]);

  const loadData = async () => {
    setPendingCount(SyncService.getPendingCount());
    const lastSync = await SyncService.getLastSyncTime();
    setLastSyncTime(lastSync);
    setFirebaseStatus(FirebaseService.getStatus());
    setIsOnline(NetworkService.isOnline());
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('אין חיבור', 'אנא בדוק את החיבור לאינטרנט');
      return;
    }

    setIsSyncing(true);
    try {
      await SyncService.syncAll();
      await loadData();
      Alert.alert('הצלחה', 'הסנכרון הושלם בהצלחה');
    } catch {
      Alert.alert('שגיאה', 'הסנכרון נכשל. אנא נסה שוב.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearQueue = () => {
    Alert.alert(
      'ניקוי תור',
      'למחוק את כל הפעולות הממתינות? פעולה זו לא ניתנת לביטול.',
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            await SyncService.clearQueue();
            await loadData();
          },
        },
      ],
    );
  };

  const handleResetAllData = () => {
    Alert.alert(
      '⚠️ איפוס מלא של כל הנתונים',
      'פעולה זו תמחק לצמיתות:\n\n• כל הטיימרים הפעילים\n• כל ההיסטוריה והלוגים\n• כל הסטטיסטיקות\n• כל הנתונים בענן\n\nהאם אתה בטוח שברצונך להמשיך?',
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'אפס הכל',
          style: 'destructive',
          onPress: () => {
            // בדיקה נוספת לוודא שהמשתמש באמת רוצה
            Alert.alert(
              'אישור סופי',
              'זו הזדמנות אחרונה לבטל!\n\nכל הנתונים יימחקו לצמיתות.',
              [
                {text: 'ביטול', style: 'cancel'},
                {
                  text: 'כן, אפס הכל',
                  style: 'destructive',
                  onPress: performFullReset,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const performFullReset = async () => {
    setIsSyncing(true);
    try {
      console.log('[SettingsScreen] Starting full data reset...');

      // 1. מחיקת נתונים מ-Firebase ראשון (אם מחובר)
      if (FirebaseService.isEnabled()) {
        try {
          console.log('[SettingsScreen] Deleting Firebase data...');
          await FirebaseService.deleteAllUserData();
          console.log('[SettingsScreen] Firebase data cleared successfully');
        } catch (firebaseError) {
          console.error('[SettingsScreen] Firebase cleanup failed:', firebaseError);
          // ממשיכים גם אם Firebase נכשל
          Alert.alert(
            'אזהרה',
            'מחיקת הנתונים מהענן נכשלה. ממשיך למחוק נתונים מקומיים.',
            [{text: 'המשך'}],
          );
        }
      }

      // 2. מחיקת כל הנתונים מ-AsyncStorage
      const keys = [
        '@timrs_timers',
        '@timrs_global_stats',
        '@timrs_deleted_timers',
        '@timrs_reset_logs',
        '@timrs_record_breaks',
        '@timrs_pending_syncs',
        '@timrs_last_sync',
      ];

      await AsyncStorage.multiRemove(keys);
      console.log('[SettingsScreen] Local storage cleared');

      // 3. ניקוי תור הסנכרון
      await SyncService.clearQueue();
      console.log('[SettingsScreen] Sync queue cleared');

      // 4. רענון הנתונים
      await loadData();

      console.log('[SettingsScreen] Full reset completed successfully');

      // רענון המסך הראשי
      if (onDataReset) {
        onDataReset();
      }

      Alert.alert(
        '✅ הושלם בהצלחה',
        'כל הנתונים נמחקו!\nהמקומי והענן נקיים.\nהאפליקציה מוכנה לשימוש חדש! 🎉',
        [
          {
            text: 'מעולה',
            onPress: onClose,
          },
        ],
      );
    } catch (error) {
      console.error('[SettingsScreen] Reset failed:', error);
      Alert.alert(
        'שגיאה',
        'אירעה שגיאה באיפוס הנתונים.\n\nנסה שוב או סגור ופתח מחדש את האפליקציה.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckDatabaseStatus = async () => {
    setIsSyncing(true);
    try {
      // בדיקת נתונים מקומיים
      const localTimers = await StorageService.loadTimers();
      const localDeletedTimers = await StorageService.loadDeletedTimers();
      const localResetLogs = await StorageService.loadResetLogs();
      const localRecordBreaks = await StorageService.loadRecordBreaks();
      const localGlobalStats = await StorageService.loadGlobalStats();

      let message = '📊 סטטוס נתונים מקומיים:\n\n';
      message += `• טיימרים פעילים: ${localTimers.length}\n`;
      message += `• טיימרים מחוקים: ${localDeletedTimers.length}\n`;
      message += `• לוגי איפוסים: ${localResetLogs.length}\n`;
      message += `• שבירות שיאים: ${localRecordBreaks.length}\n`;
      message += `• סטטיסטיקות: ${localGlobalStats ? 'קיים' : 'אין'}\n`;

      // בדיקת נתונים בענן
      if (FirebaseService.isEnabled()) {
        try {
          const cloudData = await FirebaseService.getUserDataCount();
          message += '\n☁️ סטטוס נתונים בענן:\n\n';
          message += `• טיימרים פעילים: ${cloudData.timers}\n`;
          message += `• טיימרים מחוקים: ${cloudData.deletedTimers}\n`;
          message += `• לוגי איפוסים: ${cloudData.resetLogs}\n`;
          message += `• שבירות שיאים: ${cloudData.recordBreaks}\n`;
          message += `• דיווחי באגים: ${cloudData.bugReports}\n`;
          message += `• סטטיסטיקות: ${cloudData.hasGlobalStats ? 'קיים' : 'אין'}\n`;
        } catch {
          message += '\n⚠️ לא הצלחתי לבדוק את הענן';
        }
      } else {
        message += '\n☁️ Firebase לא מופעל';
      }

      Alert.alert('סטטוס מסד הנתונים', message);
    } catch (error) {
      console.error('[SettingsScreen] Check database status failed:', error);
      Alert.alert('שגיאה', 'לא הצלחתי לבדוק את הסטטוס');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderStatusSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>סטטוס סנכרון</Text>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>מצב רשת:</Text>
        <Text style={[styles.value, isOnline ? styles.statusOnline : styles.statusOffline]}>
          {isOnline ? 'מקוון ✓' : 'לא מקוון ✗'}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.label}>סטטוס סנכרון:</Text>
        <Text style={styles.value}>{getSyncStatusText(syncStatus)}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.label}>פעולות ממתינות:</Text>
        <Text style={styles.value}>{pendingCount}</Text>
      </View>

      {lastSyncTime && (
        <View style={styles.statusRow}>
          <Text style={styles.label}>סונכרן לאחרונה:</Text>
          <Text style={styles.value}>{formatRelativeDate(lastSyncTime)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, isSyncing && styles.disabledButton]}
        onPress={handleManualSync}
        disabled={isSyncing || !isOnline}>
        {isSyncing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>סנכרן כעת</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const handleShowUserId = () => {
    if (firebaseStatus.userId) {
      Alert.alert(
        'User ID המלא',
        firebaseStatus.userId + '\n\n' + 
        'חפש את ה-ID הזה ב-Firebase Console:\n' +
        'Firestore → users → [לחץ על ה-ID הזה]',
        [
          {text: 'סגור', style: 'cancel'},
        ]
      );
    }
  };

  const renderFirebaseSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>☁️ Firebase Cloud</Text>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>מצב:</Text>
        <Text style={[styles.value, firebaseStatus.enabled ? styles.statusOnline : styles.statusDisabled]}>
          {firebaseStatus.enabled ? 'מופעל ✓' : 'כבוי ✗'}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.label}>אותחל:</Text>
        <Text style={[styles.value, firebaseStatus.initialized ? styles.statusOnline : styles.statusOffline]}>
          {firebaseStatus.initialized ? 'כן ✓' : 'לא ✗'}
        </Text>
      </View>

      {firebaseStatus.userId && (
        <>
          <View style={styles.statusRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={[styles.value, styles.monoText]} numberOfLines={1} ellipsizeMode="middle">
              {firebaseStatus.userId.substring(0, 8)}...{firebaseStatus.userId.substring(firebaseStatus.userId.length - 4)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleShowUserId}>
            <Text style={styles.buttonText}>🔍 הצג User ID המלא</Text>
          </TouchableOpacity>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 כדי לראות את הטיימרים שלך ב-Firebase Console:{'\n'}
              1. לך ל-Firestore Database{'\n'}
              2. לחץ על users collection{'\n'}
              3. חפש את ה-User ID שלך{'\n'}
              4. לחץ עליו ותראה את ה-sub-collections (timers, globalStats...)
            </Text>
          </View>
        </>
      )}

      {!firebaseStatus.enabled && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ Firebase אינו מופעל. כדי להפעיל סנכרון ענן, יש להגדיר Firebase בקובץ ההגדרות.
          </Text>
        </View>
      )}

      {firebaseStatus.enabled && !firebaseStatus.userId && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ Firebase מופעל אך אין משתמש מחובר. נסה לסגור ולפתוח את האפליקציה מחדש.
          </Text>
        </View>
      )}
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>פעולות</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.infoButton, isSyncing && styles.disabledButton]}
        onPress={handleCheckDatabaseStatus}
        disabled={isSyncing}>
        {isSyncing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>📊 בדוק מצב נתונים</Text>
        )}
      </TouchableOpacity>

      {pendingCount > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearQueue}>
          <Text style={styles.buttonText}>נקה תור סנכרון ({pendingCount})</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.resetButton, isSyncing && styles.disabledButton]}
        onPress={handleResetAllData}
        disabled={isSyncing}>
        <Text style={styles.buttonText}>⚠️ איפוס מלא - מחק הכל</Text>
      </TouchableOpacity>
      
      <Text style={styles.resetWarning}>
        פעולה זו תמחק את כל הנתונים לצמיתות ולא ניתן לשחזר אותם
      </Text>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>אודות</Text>
      
      <View style={styles.aboutContent}>
        <Text style={styles.appName}>TimrsApp</Text>
        <Text style={styles.version}>גרסה {APP_VERSION}</Text>
        <Text style={styles.aboutDescription}>
          אפליקציית ניהול טיימרים ואתגרים אישיים עם סנכרון ענן
        </Text>
        <Text style={styles.aboutDescription}>
          מעקב אחר הרגלים, שבירת שיאים, וניהול סטטיסטיקות
        </Text>
      </View>
    </View>
  );

  const renderHistorySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>היסטוריה</Text>
      
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          onClose();
          onOpenHistory?.();
        }}>
        <Text style={styles.listItemText}>טיימרים מחוקים</Text>
        <Text style={styles.listItemIcon}>📜</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          onClose();
          onOpenResetHistory?.();
        }}>
        <Text style={styles.listItemText}>היסטוריית איפוסים</Text>
        <Text style={styles.listItemIcon}>🔄</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          onClose();
          onOpenRecordBreaks?.();
        }}>
        <Text style={styles.listItemText}>שיאים ונצחונות</Text>
        <Text style={styles.listItemIcon}>🏆</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubmitBugReport = async () => {
    if (!bugReport.trim()) {
      Alert.alert('שגיאה', 'אנא כתוב תיאור של הבאג');
      return;
    }

    setIsSyncing(true);
    try {
      // יצירת אובייקט דיווח באג
      const report: BugReport = {
        id: uuidv4(),
        description: bugReport.trim(),
        timestamp: Date.now(),
        appVersion: APP_VERSION,
        deviceInfo: `${Platform.OS} ${Platform.Version}`,
        status: 'pending',
      };

      console.log('[SettingsScreen] Saving bug report:', report.id);

      // שמירה מקומית
      await StorageService.saveBugReport(report);

      console.log('[SettingsScreen] Bug report saved successfully');

      // ניקוי השדה
      setBugReport('');

      Alert.alert(
        '✅ תודה!',
        'הדיווח נשמר בהצלחה!\n\nהדיווח נשמר מקומית ויסונכרן לענן.\nנעבוד על תיקון הבעיה בהקדם.',
        [{text: 'סגור'}],
      );
    } catch (error) {
      console.error('[SettingsScreen] Failed to save bug report:', error);
      Alert.alert(
        'שגיאה',
        'לא הצלחנו לשמור את הדיווח.\nאנא נסה שוב או פנה לתמיכה.',
        [{text: 'סגור'}],
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const renderBugReportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>דיווח על באג 🐛</Text>
      
      <Text style={styles.bugReportLabel}>תאר את הבעיה שנתקלת בה:</Text>
      <TextInput
        style={styles.bugReportInput}
        placeholder="לדוגמה: הכפתור לא עובד, הסנכרון נכשל..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={bugReport}
        onChangeText={setBugReport}
        textAlign="right"
      />
      
      <TouchableOpacity
        style={[styles.button, styles.bugReportButton, (!bugReport.trim() || isSyncing) && styles.disabledButton]}
        onPress={handleSubmitBugReport}
        disabled={!bugReport.trim() || isSyncing}>
        {isSyncing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>שלח דיווח</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.bugReportHint}>
        הדיווח יישמר מקומית, יסונכרן לענן, ויעזור לנו לשפר את האפליקציה
      </Text>
    </View>
  );

  const getSyncStatusText = (status: SyncStatus): string => {
    switch (status) {
      case 'synced':
        return 'מסונכרן ✓';
      case 'syncing':
        return 'מסנכרן...';
      case 'pending':
        return 'ממתין';
      case 'offline':
        return 'לא מקוון';
      case 'error':
        return 'שגיאה';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הגדרות</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderAboutSection()}
          {renderStatusSection()}
          {renderFirebaseSection()}
          {renderHistorySection()}
          {renderBugReportSection()}
          {renderActionsSection()}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️</Text>
            <Text style={styles.footerSubtext}>
              © 2024 TimrsApp
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: '#7E57C2',
  },
  infoButton: {
    backgroundColor: '#29B6F6',
  },
  dangerButton: {
    backgroundColor: '#EF5350',
  },
  resetButton: {
    backgroundColor: '#C62828',
    borderWidth: 2,
    borderColor: '#FF1744',
  },
  resetWarning: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'right',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BBB',
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  listItemIcon: {
    fontSize: 20,
  },
  bugReportLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'right',
  },
  bugReportInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bugReportButton: {
    backgroundColor: '#FF9800',
  },
  bugReportHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  statusOnline: {
    color: '#4CAF50',
  },
  statusOffline: {
    color: '#EF5350',
  },
  statusDisabled: {
    color: '#999',
  },
});

