import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {Timer} from '../types';
import {TimerService} from '../services/TimerService';

interface TimerDetailsModalProps {
  visible: boolean;
  timer: Timer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFullReset: () => void;
  onCustomReset: () => void;
  onShowResetHistory: () => void;
  onShowRecordBreaks: () => void;
}

export const TimerDetailsModal: React.FC<TimerDetailsModalProps> = ({
  visible,
  timer,
  onClose,
  onEdit,
  onDelete,
  onFullReset,
  onCustomReset,
  onShowResetHistory,
  onShowRecordBreaks,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // עדכון אוטומטי כל שנייה
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);
  
  const currentValue = TimerService.calculateElapsedTime(timer);
  const currentStreak = TimerService.calculateCurrentStreak(timer);
  const smartDisplay = TimerService.getSmartTimeDisplay(currentValue, timer.timeUnit);
  const smartStreakDisplay = TimerService.getSmartTimeDisplay(currentStreak, timer.timeUnit);
  const smartBestDisplay = TimerService.getSmartTimeDisplay(timer.bestStreak, timer.timeUnit);
  
  // חישוב תאריך התחלה
  const startDate = new Date(timer.startDate);
  const formattedStartDate = `${startDate.toLocaleDateString('he-IL')} ${startDate.toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}`;
  
  // חישוב תאריך איפוס אחרון
  const lastResetDate = timer.lastResetDate 
    ? new Date(timer.lastResetDate) 
    : null;
  const formattedLastReset = lastResetDate
    ? `${lastResetDate.toLocaleDateString('he-IL')} ${lastResetDate.toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}`
    : 'לא בוצע עדיין';

  const handleDeleteWithConfirm = () => {
    Alert.alert(
      'מחיקת טיימר',
      `האם אתה בטוח שברצונך למחוק את "${timer.name}"?`,
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            onDelete();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            
            {/* Header מינימליסטי */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.timerName}>{timer.name}</Text>
            </View>

            {/* ערך נוכחי - התצוגה הבולטת */}
            <View style={styles.mainValueContainer}>
              <Text style={styles.mainValueLabel}>זמן כולל מאז ההתחלה</Text>
              <Text style={styles.mainValue}>{smartDisplay}</Text>
            </View>

            {/* סטטיסטיקות עיקריות */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statLabel}>סטריק נוכחי</Text>
                <Text style={styles.statValue}>{smartStreakDisplay}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🏆</Text>
                <Text style={styles.statLabel}>שיא אישי</Text>
                <Text style={styles.statValue}>{smartBestDisplay}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔄</Text>
                <Text style={styles.statLabel}>מספר איפוסים</Text>
                <Text style={styles.statValue}>{timer.resetCount}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⚡</Text>
                <Text style={styles.statLabel}>איפוס מותאם</Text>
                <Text style={styles.statValue}>
                  {timer.customResetAmount} {TimerService.getTimeUnitLabel(timer.timeUnit, timer.customResetAmount)}
                </Text>
              </View>
            </View>

            {/* מידע נוסף */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>פרטי טיימר</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{formattedStartDate}</Text>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoLabel}>תאריך התחלה</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{formattedLastReset}</Text>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>🔄</Text>
                  <Text style={styles.infoLabel}>איפוס אחרון</Text>
                </View>
              </View>
              
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <Text style={styles.infoValue}>
                  {timer.timeUnit === 'hours' ? 'שעות' : 
                   timer.timeUnit === 'days' ? 'ימים' : 
                   timer.timeUnit === 'weeks' ? 'שבועות' : 'חודשים'}
                </Text>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <Text style={styles.infoLabel}>יחידת זמן</Text>
                </View>
              </View>
            </View>

            {/* כפתורי פעולה */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>פעולות</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onShowResetHistory();
                  onClose();
                }}>
                <Text style={styles.actionButtonIcon}>📜</Text>
                <Text style={styles.actionButtonText}>היסטוריית איפוסים</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onShowRecordBreaks();
                  onClose();
                }}>
                <Text style={styles.actionButtonIcon}>🏆</Text>
                <Text style={styles.actionButtonText}>שיאים ונצחונות</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={() => {
                  onCustomReset();
                  onClose();
                }}>
                <Text style={styles.actionButtonIcon}>⚡</Text>
                <Text style={styles.actionButtonText}>איפוס מותאם</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.fullResetButton]}
                onPress={() => {
                  onFullReset();
                  onClose();
                }}>
                <Text style={styles.actionButtonIcon}>🔄</Text>
                <Text style={styles.actionButtonText}>איפוס מלא</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onEdit();
                  onClose();
                }}>
                <Text style={styles.actionButtonIcon}>✏️</Text>
                <Text style={styles.actionButtonText}>ערוך טיימר</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteWithConfirm}>
                <Text style={styles.actionButtonIcon}>🗑️</Text>
                <Text style={styles.actionButtonText}>מחק טיימר</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
            
            {/* ריווח תחתון */}
            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '96%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  timerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
  },
  mainValueContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  mainValueLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mainValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FAFAFA',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'left',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginLeft: 16,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  chevron: {
    fontSize: 20,
    color: '#CCC',
    fontWeight: '300',
  },
  resetButton: {
    backgroundColor: '#FFF8F0',
  },
  fullResetButton: {
    backgroundColor: '#FFF5F5',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
});

