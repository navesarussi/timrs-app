import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {ResetLog, Timer} from '../types';
import {StorageService} from '../services/StorageService';
import {TimerService} from '../services/TimerService';

interface ResetHistoryScreenProps {
  visible: boolean;
  onClose: () => void;
  timerId?: string; // אם מסופק - מציג רק איפוסים של טיימר זה
  timerName?: string;
}

const MOOD_EMOJIS = ['😢', '😟', '😐', '🙂', '😊'];
const MOOD_LABELS = ['גרוע מאוד', 'גרוע', 'בסדר', 'טוב', 'מצוין'];

export const ResetHistoryScreen: React.FC<ResetHistoryScreenProps> = ({
  visible,
  onClose,
  timerId,
  timerName,
}) => {
  const [resetLogs, setResetLogs] = useState<ResetLog[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, timerId]);

  const loadData = async () => {
    try {
      // טוען את כל הטיימרים לשם
      const allTimers = await StorageService.loadTimers();
      setTimers(allTimers);

      // טוען לוגים
      if (timerId) {
        const logs = await StorageService.loadResetLogsByTimer(timerId);
        setResetLogs(logs);
      } else {
        const logs = await StorageService.loadResetLogs();
        setResetLogs(logs);
      }
    } catch (error) {
      console.error('Error loading reset history:', error);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;

    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTimerName = (logTimerId: string): string => {
    const timer = timers.find(t => t.id === logTimerId);
    return timer ? timer.name : 'טיימר שנמחק';
  };

  const getTimerUnit = (logTimerId: string): string => {
    const timer = timers.find(t => t.id === logTimerId);
    return timer ? TimerService.getTimeUnitDisplayName(timer.timeUnit) : '';
  };

  const renderLogItem = ({item}: {item: ResetLog}) => {
    const moodEmoji = MOOD_EMOJIS[item.mood - 1];
    const moodLabel = MOOD_LABELS[item.mood - 1];
    const timerNameText = getTimerName(item.timerId);
    const unit = getTimerUnit(item.timerId);

    return (
      <View style={styles.logCard}>
        {/* כותרת */}
        <View style={styles.logHeader}>
          {!timerId && <Text style={styles.timerName}>{timerNameText}</Text>}
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>

        {/* מצב רוח */}
        <View style={styles.moodRow}>
          <Text style={styles.moodEmoji}>{moodEmoji}</Text>
          <Text style={styles.moodText}>{moodLabel}</Text>
        </View>

        {/* סיבה */}
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>סיבה:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>

        {/* נתונים */}
        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>הורדה</Text>
            <Text style={styles.dataValue}>
              {item.amountReduced} {unit}
            </Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>לפני</Text>
            <Text style={styles.dataValue}>
              {item.valueBeforeReset} {unit}
            </Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>אחרי</Text>
            <Text style={styles.dataValue}>
              {item.valueAfterReset} {unit}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📝</Text>
      <Text style={styles.emptyTitle}>אין היסטוריית איפוסים</Text>
      <Text style={styles.emptySubtitle}>
        איפוסים שתבצע יופיעו כאן
      </Text>
    </View>
  );

  if (!visible) {
    return null;
  }

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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>היסטוריית איפוסים</Text>
            {timerName && <Text style={styles.headerSubtitle}>{timerName}</Text>}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* סטטיסטיקה */}
        <View style={styles.statsBar}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resetLogs.length}</Text>
            <Text style={styles.statLabel}>סך איפוסים</Text>
          </View>
          {resetLogs.length > 0 && (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {Math.round(
                    resetLogs.reduce((sum, log) => sum + log.mood, 0) /
                      resetLogs.length,
                  )}
                </Text>
                <Text style={styles.statLabel}>מצב רוח ממוצע</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {Math.round(
                    resetLogs.reduce((sum, log) => sum + log.amountReduced, 0) /
                      resetLogs.length,
                  )}
                </Text>
                <Text style={styles.statLabel}>הורדה ממוצעת</Text>
              </View>
            </>
          )}
        </View>

        <FlatList
          data={resetLogs}
          renderItem={renderLogItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            resetLogs.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 2,
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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  reasonContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textAlign: 'right',
  },
  reasonText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    textAlign: 'right',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

