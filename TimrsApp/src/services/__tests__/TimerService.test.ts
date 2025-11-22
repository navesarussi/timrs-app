import {TimerService} from '../TimerService';
import {Timer, TimeUnit} from '../../types';

describe('TimerService', () => {
  const createMockTimer = (overrides?: Partial<Timer>): Timer => ({
    id: 'test-id',
    name: 'Test Timer',
    startDate: Date.now() - 86400000, // 1 day ago
    timeUnit: 'days' as TimeUnit,
    customResetAmount: 1,
    currentValue: 0,
    lastCalculated: Date.now(),
    currentStreak: 0,
    bestStreak: 0,
    resetCount: 0,
    lastResetDate: Date.now(),
    ...overrides,
  });

  describe('calculateElapsedTime', () => {
    it('should calculate elapsed days correctly', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        timeUnit: 'days',
      });
      const elapsed = TimerService.calculateElapsedTime(timer);
      expect(elapsed).toBe(2);
    });

    it('should calculate elapsed hours correctly', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        timeUnit: 'hours',
      });
      const elapsed = TimerService.calculateElapsedTime(timer);
      expect(elapsed).toBe(5);
    });

    it('should return 0 for future dates', () => {
      const timer = createMockTimer({
        startDate: Date.now() + 86400000, // 1 day in future
        timeUnit: 'days',
      });
      const elapsed = TimerService.calculateElapsedTime(timer);
      expect(elapsed).toBe(0);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should calculate streak from last reset date', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        lastResetDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        timeUnit: 'days',
      });
      const streak = TimerService.calculateCurrentStreak(timer);
      expect(streak).toBe(3);
    });

    it('should calculate streak from start date if no reset', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        lastResetDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        timeUnit: 'days',
      });
      const streak = TimerService.calculateCurrentStreak(timer);
      expect(streak).toBe(5);
    });
  });

  describe('fullReset', () => {
    it('should reset timer to zero', () => {
      const timer = createMockTimer({
        currentValue: 100,
        currentStreak: 50,
      });
      const resetTimer = TimerService.fullReset(timer);
      
      expect(resetTimer.currentValue).toBe(0);
      expect(resetTimer.currentStreak).toBe(0);
      expect(resetTimer.startDate).toBeGreaterThan(timer.startDate);
    });

    it('should not affect bestStreak', () => {
      const timer = createMockTimer({
        bestStreak: 100,
      });
      const resetTimer = TimerService.fullReset(timer);
      
      expect(resetTimer.bestStreak).toBe(100);
    });
  });

  describe('customReset', () => {
    it('should reduce timer value by custom amount', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        customResetAmount: 3,
        timeUnit: 'days',
      });
      
      const {timer: resetTimer} = TimerService.customReset(timer);
      const newValue = TimerService.calculateElapsedTime(resetTimer);
      
      expect(newValue).toBeLessThan(10);
    });

    it('should increment reset count', () => {
      const timer = createMockTimer({
        resetCount: 5,
      });
      const {timer: resetTimer} = TimerService.customReset(timer);
      
      expect(resetTimer.resetCount).toBe(6);
    });

    it('should return record break when breaking best streak', () => {
      const timer = createMockTimer({
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        lastResetDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        bestStreak: 5,
        timeUnit: 'days',
      });
      
      const {recordBreak} = TimerService.customReset(timer);
      
      expect(recordBreak).not.toBeNull();
      expect(recordBreak?.oldRecord).toBe(5);
      expect(recordBreak?.newRecord).toBeGreaterThan(5);
    });
  });

  describe('getTimeUnitLabel', () => {
    it('should return singular for 1', () => {
      expect(TimerService.getTimeUnitLabel('days', 1)).toBe('יום');
      expect(TimerService.getTimeUnitLabel('hours', 1)).toBe('שעה');
    });

    it('should return plural for multiple', () => {
      expect(TimerService.getTimeUnitLabel('days', 2)).toBe('ימים');
      expect(TimerService.getTimeUnitLabel('hours', 3)).toBe('שעות');
    });
  });

  describe('createNewTimer', () => {
    it('should create timer with correct initial values', () => {
      const timer = TimerService.createNewTimer('Test', 'days', 1);
      
      expect(timer.name).toBe('Test');
      expect(timer.timeUnit).toBe('days');
      expect(timer.customResetAmount).toBe(1);
      expect(timer.currentValue).toBe(0);
      expect(timer.currentStreak).toBe(0);
      expect(timer.bestStreak).toBe(0);
      expect(timer.resetCount).toBe(0);
      expect(timer.id).toBeTruthy();
    });
  });
});

