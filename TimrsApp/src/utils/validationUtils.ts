/**
 * תפקידי עזר לולידציות
 */

import {ValidationRules} from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * ולידציה לשם טיימר
 */
export const validateTimerName = (name: string): ValidationResult => {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return {isValid: false, error: 'שם הטיימר לא יכול להיות ריק'};
  }

  if (trimmedName.length < ValidationRules.timer.nameMinLength) {
    return {
      isValid: false,
      error: `שם הטיימר חייב להכיל לפחות ${ValidationRules.timer.nameMinLength} תווים`,
    };
  }

  if (trimmedName.length > ValidationRules.timer.nameMaxLength) {
    return {
      isValid: false,
      error: `שם הטיימר לא יכול להכיל יותר מ-${ValidationRules.timer.nameMaxLength} תווים`,
    };
  }

  return {isValid: true};
};

/**
 * ולידציה לכמות איפוס
 */
export const validateResetAmount = (amount: number): ValidationResult => {
  if (isNaN(amount) || !isFinite(amount)) {
    return {isValid: false, error: 'כמות האיפוס חייבת להיות מספר תקין'};
  }

  if (amount < ValidationRules.timer.customResetAmountMin) {
    return {
      isValid: false,
      error: `כמות האיפוס חייבת להיות לפחות ${ValidationRules.timer.customResetAmountMin}`,
    };
  }

  if (amount > ValidationRules.timer.customResetAmountMax) {
    return {
      isValid: false,
      error: `כמות האיפוס לא יכולה להיות יותר מ-${ValidationRules.timer.customResetAmountMax}`,
    };
  }

  if (!Number.isInteger(amount)) {
    return {isValid: false, error: 'כמות האיפוס חייבת להיות מספר שלם'};
  }

  return {isValid: true};
};

/**
 * ולידציה לסיבת איפוס
 */
export const validateResetReason = (reason: string): ValidationResult => {
  const trimmedReason = reason.trim();

  if (trimmedReason.length === 0) {
    return {isValid: false, error: 'נא להזין סיבה לאיפוס'};
  }

  if (trimmedReason.length < ValidationRules.resetLog.reasonMinLength) {
    return {
      isValid: false,
      error: `הסיבה חייבת להכיל לפחות ${ValidationRules.resetLog.reasonMinLength} תווים`,
    };
  }

  if (trimmedReason.length > ValidationRules.resetLog.reasonMaxLength) {
    return {
      isValid: false,
      error: `הסיבה לא יכולה להכיל יותר מ-${ValidationRules.resetLog.reasonMaxLength} תווים`,
    };
  }

  return {isValid: true};
};

/**
 * ולידציה למצב רוח
 */
export const validateMood = (mood: number | null): ValidationResult => {
  if (mood === null) {
    return {isValid: false, error: 'נא לבחור מצב רוח'};
  }

  if (
    mood < ValidationRules.resetLog.moodMin ||
    mood > ValidationRules.resetLog.moodMax
  ) {
    return {
      isValid: false,
      error: `מצב רוח חייב להיות בין ${ValidationRules.resetLog.moodMin} ל-${ValidationRules.resetLog.moodMax}`,
    };
  }

  return {isValid: true};
};

/**
 * ולידציה כללית - בדיקת מספר שלם חיובי
 */
export const validatePositiveInteger = (
  value: number,
  fieldName: string,
): ValidationResult => {
  if (isNaN(value) || !isFinite(value)) {
    return {isValid: false, error: `${fieldName} חייב להיות מספר תקין`};
  }

  if (value < 0) {
    return {isValid: false, error: `${fieldName} לא יכול להיות שלילי`};
  }

  if (!Number.isInteger(value)) {
    return {isValid: false, error: `${fieldName} חייב להיות מספר שלם`};
  }

  return {isValid: true};
};

/**
 * ניקוי והמרת input למספר
 */
export const sanitizeNumberInput = (input: string): number | null => {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);
  if (isNaN(num) || !isFinite(num)) return null;

  return num;
};

/**
 * ניקוי טקסט
 */
export const sanitizeTextInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' '); // החלפת רווחים מרובים ברווח יחיד
};

