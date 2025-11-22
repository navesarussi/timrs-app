import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {Timer} from '../types';
import {TimerService} from '../services/TimerService';

interface CustomResetDialogProps {
  visible: boolean;
  timer: Timer | null;
  onClose: () => void;
  onConfirm: (amount: number, reason: string, mood: number) => void;
}

const MOOD_EMOJIS = ['😢', '😟', '😐', '🙂', '😊'];
const MOOD_LABELS = ['גרוע מאוד', 'גרוע', 'בסדר', 'טוב', 'מצוין'];

export const CustomResetDialog: React.FC<CustomResetDialogProps> = ({
  visible,
  timer,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  React.useEffect(() => {
    if (visible && timer) {
      setAmount(timer.customResetAmount.toString());
      setReason('');
      setSelectedMood(null);
    }
  }, [visible, timer]);

  // כפתורים מהירים - זמנים עגולים
  const getQuickAmounts = (): number[] => {
    if (!timer) return [];
    
    const unitsPerDay = TimerService.getUnitsPerDay(timer.timeUnit);
    
    switch (timer.timeUnit) {
      case 'seconds':
        return [60, 300, 900, 1800, 3600, Math.floor(unitsPerDay)]; // 1 דקה, 5 דקות, 15 דקות, 30 דקות, שעה, יום
      case 'minutes':
        return [5, 15, 30, 60, 120, Math.floor(unitsPerDay)]; // 5, 15, 30 דקות, שעה, שעתיים, יום
      case 'hours':
        return [1, 2, 4, 8, 12, 24]; // 1-24 שעות
      case 'days':
        return [1, 2, 3, 7, 14, 30]; // 1 יום עד חודש
      case 'weeks':
        return [1, 2, 4, 8, 12, 26]; // 1 שבוע עד חצי שנה
      case 'months':
        return [1, 2, 3, 6, 12, 24]; // 1 חודש עד שנתיים
      default:
        return [1];
    }
  };

  const getQuickLabel = (value: number): string => {
    if (!timer) return '';
    
    switch (timer.timeUnit) {
      case 'seconds':
        if (value === 60) return '1 דקה';
        if (value === 300) return '5 דקות';
        if (value === 900) return '15 דקות';
        if (value === 1800) return '30 דקות';
        if (value === 3600) return 'שעה';
        if (value === 86400) return 'יום';
        break;
      case 'minutes':
        if (value === 60) return 'שעה';
        if (value === 120) return '2 שעות';
        if (value === 1440) return 'יום';
        break;
      case 'hours':
        if (value === 24) return 'יום';
        break;
      case 'days':
        if (value === 7) return 'שבוע';
        if (value === 30) return 'חודש';
        break;
      case 'weeks':
        if (value === 4) return 'חודש';
        if (value === 26) return 'חצי שנה';
        break;
      case 'months':
        if (value === 6) return 'חצי שנה';
        if (value === 12) return 'שנה';
        if (value === 24) return 'שנתיים';
        break;
    }
    
    return `${value} ${TimerService.getTimeUnitLabel(timer.timeUnit, value)}`;
  };

  const handleConfirm = () => {
    const numAmount = parseInt(amount, 10);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    
    if (!reason.trim()) {
      return;
    }
    
    if (selectedMood === null) {
      return;
    }

    onConfirm(numAmount, reason.trim(), selectedMood);
    setAmount('');
    setReason('');
    setSelectedMood(null);
    onClose();
  };

  const isValid = amount && !isNaN(parseInt(amount, 10)) && parseInt(amount, 10) > 0 && reason.trim() && selectedMood !== null;

  if (!timer) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>איפוס מותאם</Text>
          <Text style={styles.timerName}>{timer.name}</Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* כפתורים מהירים */}
            <Text style={styles.label}>בחירה מהירה</Text>
            <View style={styles.quickButtonsContainer}>
              {getQuickAmounts().map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickButton,
                    amount === value.toString() && styles.quickButtonSelected,
                  ]}
                  onPress={() => setAmount(value.toString())}>
                  <Text style={[
                    styles.quickButtonText,
                    amount === value.toString() && styles.quickButtonTextSelected,
                  ]}>
                    {getQuickLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* כמות להורדה - שדה חופשי */}
            <Text style={styles.label}>או הזן כמות מדויקת</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={timer.customResetAmount.toString()}
              placeholderTextColor="#999"
              textAlign="right"
            />
            <Text style={styles.hint}>
              יחידת זמן: {TimerService.getTimeUnitDisplayName(timer.timeUnit)}
            </Text>

            {/* סיבה לאיפוס */}
            <Text style={styles.label}>מה קרה? (חובה)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="תאר את הסיבה לאיפוס..."
              placeholderTextColor="#999"
              textAlign="right"
              multiline
              numberOfLines={3}
            />

            {/* מצב רוח */}
            <Text style={styles.label}>איך אתה מרגיש?</Text>
            <View style={styles.moodContainer}>
              {MOOD_EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moodButton,
                    selectedMood === index + 1 && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(index + 1)}>
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text style={styles.moodLabel}>{MOOD_LABELS[index]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* כפתורים */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !isValid && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={!isValid}>
              <Text style={[
                styles.confirmButtonText,
                !isValid && styles.disabledButtonText,
              ]}>
                אפס
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  timerName: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#FFA726',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#999',
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  quickButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickButtonSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFA726',
  },
  quickButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  quickButtonTextSelected: {
    color: '#FFA726',
    fontWeight: 'bold',
  },
});

