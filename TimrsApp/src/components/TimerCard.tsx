import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Timer, ResetLog, RecordBreak} from '../types';
import {TimerService} from '../services/TimerService';
import {StorageService} from '../services/StorageService';
import {CustomResetDialog} from './CustomResetDialog';

interface TimerCardProps {
  timer: Timer;
  onUpdate: (timer: Timer) => void;
  onDelete: (timerId: string) => void;
  onEdit: (timer: Timer) => void;
  onShowResetHistory: (timerId: string, timerName: string) => void;
  onShowRecordBreaks: (timerId: string, timerName: string) => void;
}

const TimerCardComponent: React.FC<TimerCardProps> = ({
  timer,
  onUpdate,
  onDelete,
  onEdit,
  onShowResetHistory,
  onShowRecordBreaks,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [previousBestStreak, setPreviousBestStreak] = useState(timer.bestStreak);
  
  const currentValue = TimerService.calculateElapsedTime(timer);
  const currentStreak = TimerService.calculateCurrentStreak(timer);
  const smartDisplay = TimerService.getSmartTimeDisplay(currentValue, timer.timeUnit);
  const smartStreakDisplay = TimerService.getSmartTimeDisplay(currentStreak, timer.timeUnit);
  const smartBestDisplay = TimerService.getSmartTimeDisplay(timer.bestStreak, timer.timeUnit);

  // בדיקה אם נשבר שיא
  useEffect(() => {
    const checkRecordBreak = async () => {
      if (currentStreak > previousBestStreak && currentStreak > timer.bestStreak) {
        // נשבר שיא!
        const recordBreak: RecordBreak = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timerId: timer.id,
          timestamp: Date.now(),
          oldRecord: previousBestStreak,
          newRecord: currentStreak,
          isGlobalRecord: false,
          context: `הגיע ל-${smartStreakDisplay}`,
        };
        
        try {
          await StorageService.saveRecordBreak(recordBreak);
          setPreviousBestStreak(currentStreak);
          
          // עדכון הטיימר עם השיא החדש
          const updatedTimer = {
            ...timer,
            bestStreak: currentStreak,
          };
          onUpdate(updatedTimer);
        } catch (error) {
          console.error('Error saving record break:', error);
        }
      }
    };
    
    checkRecordBreak();
  }, [currentStreak]);

  const handleCustomReset = async (amount: number, reason: string, mood: number) => {
    const currentValue = TimerService.calculateElapsedTime(timer);
    
    // עדכון הטיימר עם הכמות שנבחרה
    const updatedTimer = {...timer, customResetAmount: amount};
    const {timer: resetTimer, recordBreak} = TimerService.customReset(updatedTimer);
    
    // שמירת הלוג
    const resetLog: ResetLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timerId: timer.id,
      timestamp: Date.now(),
      amountReduced: amount,
      reason: reason,
      mood: mood,
      valueBeforeReset: currentValue,
      valueAfterReset: Math.max(0, currentValue - amount),
    };
    
    try {
      await StorageService.saveResetLog(resetLog);
      
      // שמירת שבירת שיא אם היתה
      if (recordBreak) {
        await StorageService.saveRecordBreak(recordBreak);
        Alert.alert(
          '🏆 שיא חדש!',
          `מזל טוב! שברת את השיא הקודם של ${recordBreak.oldRecord} ${TimerService.getTimeUnitLabel(timer.timeUnit, recordBreak.oldRecord)}!`,
          [{text: 'מעולה!'}]
        );
      }
      
      onUpdate(resetTimer);
      setShowResetDialog(false);
    } catch (error) {
      console.error('Error saving reset log:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לשמור את הלוג');
    }
  };

  const handleFullReset = useCallback(async () => {
    const currentValue = TimerService.calculateElapsedTime(timer);
    
    Alert.alert(
      'איפוס מלא',
      'לאפס את הטיימר לחלוטין?',
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'אישור',
          style: 'destructive',
          onPress: async () => {
            const resetTimer = TimerService.fullReset(timer);
            
            // שמירת לוג איפוס מלא
            const resetLog: ResetLog = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timerId: timer.id,
              timestamp: Date.now(),
              amountReduced: currentValue,
              reason: 'איפוס מלא',
              mood: 3, // ניטרלי
              valueBeforeReset: currentValue,
              valueAfterReset: 0,
            };
            
            try {
              await StorageService.saveResetLog(resetLog);
              onUpdate(resetTimer);
            } catch (error) {
              console.error('Error saving full reset log:', error);
              Alert.alert('שגיאה', 'לא הצלחנו לשמור את הלוג, אך הטיימר אופס');
              onUpdate(resetTimer);
            }
          },
        },
      ],
    );
  }, [timer, onUpdate]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'מחיקת טיימר',
      `למחוק את הטיימר "${timer.name}"?`,
      [
        {text: 'ביטול', style: 'cancel'},
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => onDelete(timer.id),
        },
      ],
    );
  }, [timer.id, timer.name, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(timer);
  }, [timer, onEdit]);

  const handleShowHistory = useCallback(() => {
    onShowResetHistory(timer.id, timer.name);
  }, [timer.id, timer.name, onShowResetHistory]);

  const handleToggleDialog = useCallback(() => {
    setShowResetDialog(prev => !prev);
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onLongPress={handleDelete}
        onPress={handleEdit}
      >
        <Text style={styles.timerName}>{timer.name}</Text>
        <Text style={styles.smartDisplay}>{smartDisplay}</Text>
      </TouchableOpacity>
      
      {/* קאונטרים וסטטיסטיקות */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statBox}
          onPress={handleShowHistory}>
          <Text style={styles.statLabel}>איפוסים</Text>
          <Text style={styles.statValue}>{timer.resetCount}</Text>
        </TouchableOpacity>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>סטריק</Text>
          <Text style={styles.statValue}>{smartStreakDisplay}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => onShowRecordBreaks(timer.id, timer.name)}>
          <Text style={styles.statLabel}>🏆</Text>
          <Text style={styles.statValue}>{smartBestDisplay}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.customResetButton]}
          onPress={handleToggleDialog}>
          <Text style={styles.buttonText}>איפוס מותאם</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.fullResetButton]}
          onPress={handleFullReset}>
          <Text style={styles.buttonText}>איפוס מלא</Text>
        </TouchableOpacity>
      </View>

      {/* דיאלוג איפוס מותאם */}
      <CustomResetDialog
        visible={showResetDialog}
        timer={timer}
        onClose={handleToggleDialog}
        onConfirm={handleCustomReset}
      />
    </View>
  );
};

// Memoize the component
export const TimerCard = React.memo(TimerCardComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant props changed
  return (
    prevProps.timer.id === nextProps.timer.id &&
    prevProps.timer.name === nextProps.timer.name &&
    prevProps.timer.startDate === nextProps.timer.startDate &&
    prevProps.timer.currentValue === nextProps.timer.currentValue &&
    prevProps.timer.currentStreak === nextProps.timer.currentStreak &&
    prevProps.timer.bestStreak === nextProps.timer.bestStreak &&
    prevProps.timer.resetCount === nextProps.timer.resetCount &&
    prevProps.timer.timeUnit === nextProps.timer.timeUnit &&
    prevProps.timer.customResetAmount === nextProps.timer.customResetAmount
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    maxWidth: '48%',
  },
  cardHeader: {
    marginBottom: 10,
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'right',
  },
  smartDisplay: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'right',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  customResetButton: {
    backgroundColor: '#FFA726',
  },
  fullResetButton: {
    backgroundColor: '#EF5350',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
});

