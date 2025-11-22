import {
  validateTimerName,
  validateResetAmount,
  validateResetReason,
  validateMood,
  validatePositiveInteger,
  sanitizeNumberInput,
  sanitizeTextInput,
} from '../validationUtils';

describe('ValidationUtils', () => {
  describe('validateTimerName', () => {
    it('should accept valid timer names', () => {
      const result = validateTimerName('My Timer');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty names', () => {
      const result = validateTimerName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = validateTimerName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('50');
    });

    it('should trim whitespace', () => {
      const result = validateTimerName('  Valid Name  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateResetAmount', () => {
    it('should accept valid positive integers', () => {
      const result = validateResetAmount(5);
      expect(result.isValid).toBe(true);
    });

    it('should reject zero', () => {
      const result = validateResetAmount(0);
      expect(result.isValid).toBe(false);
    });

    it('should reject negative numbers', () => {
      const result = validateResetAmount(-5);
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN', () => {
      const result = validateResetAmount(NaN);
      expect(result.isValid).toBe(false);
    });

    it('should reject decimal numbers', () => {
      const result = validateResetAmount(5.5);
      expect(result.isValid).toBe(false);
    });

    it('should reject numbers exceeding max', () => {
      const result = validateResetAmount(1000001);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateResetReason', () => {
    it('should accept valid reasons', () => {
      const result = validateResetReason('Had a bad day');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty reasons', () => {
      const result = validateResetReason('');
      expect(result.isValid).toBe(false);
    });

    it('should reject reasons that are too long', () => {
      const longReason = 'a'.repeat(501);
      const result = validateResetReason(longReason);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMood', () => {
    it('should accept valid mood values (1-5)', () => {
      for (let mood = 1; mood <= 5; mood++) {
        const result = validateMood(mood);
        expect(result.isValid).toBe(true);
      }
    });

    it('should reject null', () => {
      const result = validateMood(null);
      expect(result.isValid).toBe(false);
    });

    it('should reject values outside range', () => {
      expect(validateMood(0).isValid).toBe(false);
      expect(validateMood(6).isValid).toBe(false);
    });
  });

  describe('validatePositiveInteger', () => {
    it('should accept positive integers', () => {
      const result = validatePositiveInteger(10, 'Test Field');
      expect(result.isValid).toBe(true);
    });

    it('should reject negative numbers', () => {
      const result = validatePositiveInteger(-5, 'Test Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('שלילי');
    });

    it('should reject decimals', () => {
      const result = validatePositiveInteger(5.5, 'Test Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('שלם');
    });
  });

  describe('sanitizeNumberInput', () => {
    it('should convert valid number strings', () => {
      expect(sanitizeNumberInput('42')).toBe(42);
      expect(sanitizeNumberInput('0')).toBe(0);
    });

    it('should return null for empty strings', () => {
      expect(sanitizeNumberInput('')).toBeNull();
      expect(sanitizeNumberInput('   ')).toBeNull();
    });

    it('should return null for invalid numbers', () => {
      expect(sanitizeNumberInput('abc')).toBeNull();
      expect(sanitizeNumberInput('12.34.56')).toBeNull();
    });

    it('should handle negative numbers', () => {
      expect(sanitizeNumberInput('-42')).toBe(-42);
    });
  });

  describe('sanitizeTextInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeTextInput('  hello  ')).toBe('hello');
    });

    it('should replace multiple spaces with single space', () => {
      expect(sanitizeTextInput('hello    world')).toBe('hello world');
    });

    it('should handle mixed whitespace', () => {
      expect(sanitizeTextInput('  hello   world  ')).toBe('hello world');
    });
  });
});

