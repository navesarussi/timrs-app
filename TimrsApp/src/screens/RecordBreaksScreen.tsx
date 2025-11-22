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

interface RecordBreaksScreenProps {
  visible: boolean;
  onClose: () => void;
  timerId?: string;
  timerName?: string;
}

export const RecordBreaksScreen: React.FC<RecordBreaksScreenProps> = ({
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
      console.error('Error loading record breaks:', error);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
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
    return timer ? timer.timeUnit : 'days';
  };

  const renderRecordBreak = ({item}: {item: RecordBreak}) => {
    const timerNameText = getTimerName(item.timerId);
    const unit = getTimerUnit(item.timerId);
    const improvement = item.newRecord - item.oldRecord;

    return (
      <View style={styles.card}>
        <View style={styles.trophy}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </View>

        <View style={styles.content}>
          {!timerId && <Text style={styles.timerName}>{timerNameText}</Text>}
          
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>

          <View style={styles.recordRow}>
            <View style={styles.recordBox}>
              <Text style={styles.recordLabel}>שיא חדש</Text>
              <Text style={styles.newRecord}>
                {item.newRecord} {TimerService.getTimeUnitLabel(unit, item.newRecord)}
              </Text>
            </View>

            <Text style={styles.arrow}>⬅️</Text>

            <View style={styles.recordBox}>
              <Text style={styles.recordLabel}>שיא קודם</Text>
              <Text style={styles.oldRecord}>
                {item.oldRecord} {TimerService.getTimeUnitLabel(unit, item.oldRecord)}
              </Text>
            </View>
          </View>

          <View style={styles.improvement}>
            <Text style={styles.improvementText}>
              שיפור של +{improvement} {TimerService.getTimeUnitLabel(unit, improvement)}! 🎉
            </Text>
          </View>

          {item.reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏆</Text>
      <Text style={styles.emptyTitle}>אין עדיין שיאים</Text>
      <Text style={styles.emptySubtitle}>
        כשתשבור שיא, הוא יופיע כאן!
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
            <Text style={styles.headerTitle}>🏆 שיאים ונצחונות</Text>
            {timerName && <Text style={styles.headerSubtitle}>{timerName}</Text>}
          </View>
          <View style={styles.placeholder} />
        </View>

        {recordBreaks.length > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recordBreaks.length}</Text>
              <Text style={styles.statLabel}>סך שיאים</Text>
            </View>
          </View>
        )}

        <FlatList
          data={recordBreaks}
          renderItem={renderRecordBreak}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA726',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  trophy: {
    position: 'absolute',
    top: -15,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  trophyEmoji: {
    fontSize: 32,
  },
  content: {
    marginTop: 20,
  },
  timerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 16,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  recordBox: {
    flex: 1,
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  newRecord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  oldRecord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  improvement: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  reasonBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
  },
  reasonText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

