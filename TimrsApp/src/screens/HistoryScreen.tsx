import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {DeletedTimer} from '../types';
import {StorageService} from '../services/StorageService';
import {TimerService} from '../services/TimerService';

interface HistoryScreenProps {
  visible: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  visible,
  onClose,
  onRestore,
}) => {
  const [deletedTimers, setDeletedTimers] = useState<DeletedTimer[]>([]);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    try {
      const history = await StorageService.loadDeletedTimers();
      setDeletedTimers(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleRestore = async (timer: DeletedTimer) => {
    Alert.alert(
      'שחזור טיימר',
      `לשחזר את הטיימר "${timer.name}"?`,
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'שחזר',
          onPress: async () => {
            try {
              await StorageService.restoreTimer(timer);
              await loadHistory();
              onRestore();
              Alert.alert('הצלחה', 'הטיימר שוחזר בהצלחה');
            } catch (error) {
              console.error('Error restoring timer:', error);
              Alert.alert('שגיאה', 'לא הצלחנו לשחזר את הטיימר');
            }
          },
        },
      ],
    );
  };

  const handlePermanentDelete = async (timer: DeletedTimer) => {
    Alert.alert(
      'מחיקה סופית',
      `למחוק את "${timer.name}" לצמיתות? לא ניתן לשחזר!`,
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'מחק לצמיתות',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.permanentlyDeleteTimer(timer.id);
              await loadHistory();
            } catch (error) {
              console.error('Error permanently deleting timer:', error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTimer = ({item}: {item: DeletedTimer}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.timerName}>{item.name}</Text>
        <Text style={styles.deletedDate}>נמחק: {formatDate(item.deletedAt)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>ערך סופי</Text>
          <Text style={styles.statValue}>
            {item.finalValue} {TimerService.getTimeUnitLabel(item.timeUnit, item.finalValue)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>השיא</Text>
          <Text style={styles.statValue}>
            {item.bestStreak} {TimerService.getTimeUnitLabel(item.timeUnit, item.bestStreak)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>איפוסים</Text>
          <Text style={styles.statValue}>{item.resetCount}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handlePermanentDelete(item)}>
          <Text style={styles.buttonText}>מחק לצמיתות</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.restoreButton]}
          onPress={() => handleRestore(item)}>
          <Text style={styles.buttonText}>שחזר</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📜</Text>
      <Text style={styles.emptyTitle}>אין היסטוריה</Text>
      <Text style={styles.emptySubtitle}>
        טיימרים שנמחקו יופיעו כאן
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
          <Text style={styles.headerTitle}>היסטוריה</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={deletedTimers}
          renderItem={renderTimer}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            deletedTimers.length === 0 && styles.listContentEmpty,
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
    paddingTop: 50, // מרווח למעלה
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
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
  cardHeader: {
    marginBottom: 12,
  },
  timerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 4,
  },
  deletedDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#EF5350',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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

