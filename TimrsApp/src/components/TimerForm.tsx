import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {Timer, TimeUnit, TimerFormData} from '../types';
import {TimerService} from '../services/TimerService';

interface TimerFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TimerFormData) => void;
  editTimer?: Timer | null;
}

const TIME_UNITS: TimeUnit[] = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];

export const TimerForm: React.FC<TimerFormProps> = ({
  visible,
  onClose,
  onSave,
  editTimer,
}) => {
  const [name, setName] = useState(editTimer?.name || '');
  const [selectedUnit, setSelectedUnit] = useState<TimeUnit>(editTimer?.timeUnit || 'days');
  const [resetAmount, setResetAmount] = useState(
    editTimer?.customResetAmount.toString() || '1'
  );

  React.useEffect(() => {
    if (editTimer) {
      setName(editTimer.name);
      setSelectedUnit(editTimer.timeUnit);
      setResetAmount(editTimer.customResetAmount.toString());
    } else {
      setName('');
      setSelectedUnit('days');
      // דיפולט של יום אחד בכל יחידת זמן
      const defaultAmount = TimerService.getUnitsPerDay('days');
      setResetAmount(defaultAmount.toString());
    }
  }, [editTimer, visible]);

  // כשמשנים יחידת זמן, מעדכנים את הדיפולט להיות יום אחד באותה יחידה
  const handleUnitChange = (unit: TimeUnit) => {
    setSelectedUnit(unit);
    // אם זה לא עריכה, מעדכנים את כמות האיפוס להיות יום אחד ביחידה החדשה
    if (!editTimer) {
      const unitsPerDay = TimerService.getUnitsPerDay(unit);
      setResetAmount(Math.floor(unitsPerDay).toString());
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    const amount = parseInt(resetAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    onSave({
      name: name.trim(),
      timeUnit: selectedUnit,
      customResetAmount: amount,
    });

    // איפוס הטופס
    setName('');
    setSelectedUnit('days');
    setResetAmount('1');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editTimer ? 'עריכת אתגר' : 'אתגר חדש'}
            </Text>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>שם האתגר</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="לדוגמה:ימים בלי קפה"
              placeholderTextColor="#999"
              textAlign="right"
            />

            <Text style={styles.label}>יחידת זמן</Text>
            <View style={styles.unitGrid}>
              {TIME_UNITS.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    selectedUnit === unit && styles.unitButtonSelected,
                  ]}
                  onPress={() => handleUnitChange(unit)}>
                  <Text
                    style={[
                      styles.unitButtonText,
                      selectedUnit === unit && styles.unitButtonTextSelected,
                    ]}>
                    {TimerService.getTimeUnitDisplayName(unit)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>כמות להורדה באיפוס מותאם</Text>
            <TextInput
              style={styles.input}
              value={resetAmount}
              onChangeText={setResetAmount}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#999"
              textAlign="right"
            />
            <Text style={styles.helperText}>
              באיפוס מותאם יורדו {resetAmount} {TimerService.getTimeUnitLabel(selectedUnit, parseInt(resetAmount, 10) || 1)}
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editTimer ? 'עדכן' : 'צור'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'right',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  unitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unitButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  unitButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  unitButtonTextSelected: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

