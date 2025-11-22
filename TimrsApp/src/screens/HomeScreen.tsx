import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {Timer, TimerFormData, GlobalStats} from '../types';
import {StorageService} from '../services/StorageService';
import {TimerService} from '../services/TimerService';
import {GlobalStatsService} from '../services/GlobalStatsService';
import {TimerCard} from '../components/TimerCard';
import {TimerForm} from '../components/TimerForm';
import {HistoryScreen} from './HistoryScreen';
import {ResetHistoryScreen} from './ResetHistoryScreen';
import {RecordBreaksScreen} from './RecordBreaksScreen';
import {SettingsScreen} from './SettingsScreen';

export const HomeScreen: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isResetHistoryVisible, setIsResetHistoryVisible] = useState(false);
  const [isRecordBreaksVisible, setIsRecordBreaksVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [selectedTimerId, setSelectedTimerId] = useState<string | undefined>();
  const [selectedTimerName, setSelectedTimerName] = useState<string | undefined>();
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Refs for debouncing and preventing memory leaks
  const lastUpdateTime = useRef<number>(0);
  const updateDebounceMs = 5000; // עדכון רק כל 5 שניות
  const updateGlobalStatsRef = useRef<(() => Promise<void>) | undefined>(undefined);
  

  // טעינת הטיימרים והסטטיסטיקות בהתחלה
  useEffect(() => {
    loadTimers();
    loadGlobalStats();
  }, []);

  const updateGlobalStats = useCallback(async () => {
    if (!globalStats) return;
    
    // Debounce - עדכן רק אם עבר מספיק זמן מהעדכון האחרון
    const now = Date.now();
    if (now - lastUpdateTime.current < updateDebounceMs) {
      return;
    }
    
    try {
      // מעדכן את הסטריק הגלובלי
      const updatedStats = GlobalStatsService.updateGlobalStreak(globalStats);
      const syncedStats = GlobalStatsService.syncStatsWithTimers(updatedStats, timers);
      
      // בדוק אם יש שינוי ממשי לפני שמירה
      const hasChanged = 
        syncedStats.currentStreak !== globalStats.currentStreak ||
        syncedStats.bestStreak !== globalStats.bestStreak ||
        syncedStats.totalResets !== globalStats.totalResets;
      
      if (hasChanged) {
        await StorageService.saveGlobalStats(syncedStats);
        setGlobalStats(syncedStats);
        lastUpdateTime.current = now;
      }
    } catch (error) {
      console.error('Error updating global stats:', error);
    }
  }, [globalStats, timers]);

  // עדכון ה-ref בכל פעם ש-updateGlobalStats משתנה
  useEffect(() => {
    updateGlobalStatsRef.current = updateGlobalStats;
  }, [updateGlobalStats]);

  // עדכון אוטומטי כל שנייה - ללא תלות ב-updateGlobalStats
  // זה מונע יצירת intervals רבים
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      // קריאה דרך ה-ref כדי למנוע re-creation של ה-interval
      if (updateGlobalStatsRef.current) {
        updateGlobalStatsRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // dependencies ריקים - ה-interval נוצר רק פעם אחת

  const loadTimers = async () => {
    try {
      const loadedTimers = await StorageService.loadTimers();
      setTimers(loadedTimers);
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  const loadGlobalStats = async () => {
    try {
      let stats = await StorageService.loadGlobalStats();
      if (!stats) {
        // אם אין סטטיסטיקות, יוצרים חדשות
        stats = GlobalStatsService.createInitialStats();
        await StorageService.saveGlobalStats(stats);
      }
      setGlobalStats(stats);
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  };

  const handleAddTimer = () => {
    setEditingTimer(null);
    setIsFormVisible(true);
  };

  const handleEditTimer = useCallback((timer: Timer) => {
    setEditingTimer(timer);
    setIsFormVisible(true);
  }, []);

  const handleSaveTimer = async (data: TimerFormData) => {
    try {
      if (editingTimer) {
        // עריכת טיימר קיים - שומרים את תאריך ההתחלה המקורי
        const updatedTimer: Timer = {
          ...editingTimer,
          name: data.name,
          timeUnit: data.timeUnit,
          customResetAmount: data.customResetAmount,
        };
        await StorageService.updateTimer(updatedTimer);
      } else {
        // יצירת טיימר חדש
        const newTimer = TimerService.createNewTimer(
          data.name,
          data.timeUnit,
          data.customResetAmount,
        );
        await StorageService.addTimer(newTimer);
      }
      await loadTimers();
      setIsFormVisible(false);
      setEditingTimer(null);
    } catch (error) {
      console.error('Error saving timer:', error);
    }
  };

  const handleUpdateTimer = useCallback(async (timer: Timer) => {
    try {
      await StorageService.updateTimer(timer);
      await loadTimers();
      
      // אם בוצע איפוס חלקי, מעדכן את הסטטיסטיקות הגלובליות
      if (globalStats) {
        const updatedStats = GlobalStatsService.handleReset(globalStats);
        await StorageService.saveGlobalStats(updatedStats);
        setGlobalStats(updatedStats);
      }
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  }, [globalStats]);

  const handleDeleteTimer = useCallback(async (timerId: string) => {
    try {
      await StorageService.deleteTimer(timerId);
      await loadTimers();
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  }, []);

  const handleShowResetHistory = useCallback((timerId: string, timerName: string) => {
    setSelectedTimerId(timerId);
    setSelectedTimerName(timerName);
    setIsResetHistoryVisible(true);
  }, []);

  const handleShowAllResetHistory = () => {
    setSelectedTimerId(undefined);
    setSelectedTimerName(undefined);
    setIsResetHistoryVisible(true);
  };

  const handleShowRecordBreaks = useCallback((timerId?: string, timerName?: string) => {
    setSelectedTimerId(timerId);
    setSelectedTimerName(timerName);
    setIsRecordBreaksVisible(true);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>אין עדיין אתגרים</Text>
      <Text style={styles.emptySubtitle}>
        לחץ על הכפתור למטה כדי ליצור אתגר ראשון
      </Text>
    </View>
  );

  const renderTimer = useCallback(
    ({item}: {item: Timer}) => (
      <TimerCard
        timer={item}
        onUpdate={handleUpdateTimer}
        onDelete={handleDeleteTimer}
        onEdit={handleEditTimer}
        onShowResetHistory={handleShowResetHistory}
        onShowRecordBreaks={handleShowRecordBreaks}
      />
    ),
    [handleUpdateTimer, handleDeleteTimer, handleEditTimer, handleShowResetHistory, handleShowRecordBreaks],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.leftButtons}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setIsHistoryVisible(true)}>
              <Text style={styles.historyButtonText}>📜</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setIsSettingsVisible(true)}>
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>האתגרים שלי</Text>
            <Text style={styles.headerSubtitle}>
              {timers.length} {timers.length === 1 ? 'אתגר' : 'אתגרים'}
            </Text>
          </View>
        </View>
        
        {/* סטטיסטיקות גלובליות */}
        {globalStats && (
          <View style={styles.globalStatsContainer}>
            <View style={styles.globalStatCard}>
              <Text style={styles.globalStatLabel}>סטריק כללי</Text>
              <Text style={styles.globalStatValue}>
                {GlobalStatsService.calculateCurrentGlobalStreak(globalStats)} ימים
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.globalStatCard}
              onPress={() => handleShowRecordBreaks()}>
              <Text style={styles.globalStatLabel}>שיאים 🏆</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.bestStreak} ימים
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.globalStatCard}
              onPress={handleShowAllResetHistory}>
              <Text style={styles.globalStatLabel}>סך איפוסים</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.totalResets}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={timers}
        renderItem={renderTimer}
        keyExtractor={item => item.id}
        extraData={refreshKey}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          timers.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* כפתור FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTimer}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* טופס הוספה/עריכה */}
      <TimerForm
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingTimer(null);
        }}
        onSave={handleSaveTimer}
        editTimer={editingTimer}
      />

      {/* מסך היסטוריה */}
      <HistoryScreen
        visible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        onRestore={() => {
          loadTimers();
          setIsHistoryVisible(false);
        }}
      />

      {/* מסך היסטוריית איפוסים */}
      <ResetHistoryScreen
        visible={isResetHistoryVisible}
        onClose={() => setIsResetHistoryVisible(false)}
        timerId={selectedTimerId}
        timerName={selectedTimerName}
      />

      {/* מסך שיאים ונצחונות */}
      <RecordBreaksScreen
        visible={isRecordBreaksVisible}
        onClose={() => setIsRecordBreaksVisible(false)}
        timerId={selectedTimerId}
        timerName={selectedTimerName}
      />

      {/* מסך הגדרות */}
      <SettingsScreen
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onOpenHistory={() => setIsHistoryVisible(true)}
        onOpenResetHistory={() => setIsResetHistoryVisible(true)}
        onOpenRecordBreaks={() => setIsRecordBreaksVisible(true)}
        onDataReset={() => {
          loadTimers();
          loadGlobalStats();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyButtonText: {
    fontSize: 18,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
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
  fab: {
    position: 'absolute',
    bottom: 62,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  globalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  globalStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  globalStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  globalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
});

