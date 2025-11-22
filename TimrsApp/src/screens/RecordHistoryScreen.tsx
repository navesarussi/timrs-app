import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {RecordBreak, Timer} from '../types';
import {StorageService} from '../services/StorageService';
import {TimerService} from '../services/TimerService';

interface RecordHistoryScreenProps {
  visible: boolean;
  onClose: () => void;
  timerId?: string; // אם מסופק - מציג רק שיאים של טיימר זה
  timerName?: string;
}

export const RecordHistoryScreen: React.FC<RecordHistoryScreenProps> = ({
  visible,
  onClose,
  timerId,
  timerName,
}) => {
  const [recordBreaks, setRecordBreaks] = useState<RecordBreak[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, timerId]);

  const loadData = async () => {
    try {
      const allTimers = await StorageService.loadTimers();
      setTimers(allTimers);

      if (timerId) {
        const records = await StorageService.loadRecordBreaksByTimer(timerId);
        setRecordBreaks(records);
      } else {
        const records = await StorageService.loadRecordBreaks();
        setRecordBreaks(records);
      }
    } catch (error) {
      console.error('Error loading record history:', error);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimerName = (recordTimerId: string): string => {
    const timer = timers.find(t => t.id === recordTimerId);
    return timer ? timer.name : 'אתגר שנמחק';
  };

  const getTimerUnit = (recordTimerId: string): string => {
    const timer = timers.find(t => t.id === recordTimerId);
    return timer ? TimerService.getTimeUnitDisplayName(timer.timeUnit) : '';
  };

  const renderRecordItem = ({item}: {item: RecordBreak}) => {
    const timerNameText = getTimerName(item.timerId);
    const unit = getTimerUnit(item.timerId);
    const improvementPercent = item.oldRecord > 0 
      ? Math.round((item.improvement / item.oldRecord) * 100) 
      : 0;

    return (
      <View style={styles.recordCard}>
        <View style={styles.trophyBanner}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.bannerText}>שיא חדש!</Text>
          {item.isGlobalRecord && (
            <Text style={styles.globalBadge}>🌟 שיא כללי</Text>
          )}
        </View>

        {/* כותרת */}
        <View style={styles.recordHeader}>
          {!timerId && <Text style={styles.timerName}>{timerNameText}</Text>}
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>

        {/* השיאים */}
        <View style={styles.recordsRow}>
          <View style={styles.recordBox}>
            <Text style={styles.recordLabel}>שיא קודם</Text>
            <Text style={styles.oldRecord}>
              {item.oldRecord} {unit}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>

          <View style={styles.recordBox}>
            <Text style={styles.recordLabel}>שיא חדש</Text>
            <Text style={styles.newRecord}>
              {item.newRecord} {unit}
            </Text>
          </View>
        </View>

        {/* שיפור */}
        <View style={styles.improvementBox}>
          <Text style={styles.improvementLabel}>שיפור</Text>
          <Text style={styles.improvementValue}>
            +{item.improvement} {unit}
          </Text>
          {improvementPercent > 0 && (
            <Text style={styles.improvementPercent}>
              (+{improvementPercent}%)
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏆</Text>
      <Text style={styles.emptyTitle}>אין עדיין שיאים חדשים</Text>
      <Text style={styles.emptySubtitle}>
        כשתשבור שיא, הוא יופיע כאן
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
            <Text style={styles.headerTitle}>🏆 היסטוריית שיאים</Text>
            {timerName && <Text style={styles.headerSubtitle}>{timerName}</Text>}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* סטטיסטיקה */}
        {recordBreaks.length > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{recordBreaks.length}</Text>
              <Text style={styles.statLabel}>שיאים חדשים</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {Math.round(
                  recordBreaks.reduce((sum, r) => sum + r.improvement, 0) /
                    recordBreaks.length,
                )}
              </Text>
              <Text style={styles.statLabel}>שיפור ממוצע</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {recordBreaks.filter(r => r.isGlobalRecord).length}
              </Text>
              <Text style={styles.statLabel}>שיאים כלליים</Text>
            </View>
          </View>
        )}

        <FlatList
          data={recordBreaks}
          renderItem={renderRecordItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            recordBreaks.length === 0 && styles.listContentEmpty,
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
    backgroundColor: '#FFF9E6',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFD700',
    borderBottomWidth: 2,
    borderBottomColor: '#FFA000',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA000',
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
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  trophyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    gap: 8,
  },
  trophyEmoji: {
    fontSize: 24,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  globalBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
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
  recordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF9E6',
  },
  recordBox: {
    flex: 1,
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  oldRecord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  newRecord: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  arrow: {
    fontSize: 24,
    color: '#4A90E2',
  },
  improvementBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  improvementLabel: {
    fontSize: 14,
    color: '#666',
  },
  improvementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  improvementPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
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
