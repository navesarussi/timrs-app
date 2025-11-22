/**
 * תפקידי עזר לפורמט וחישובים
 */

import {TimeUnit} from '../types';

/**
 * המרת מספר למחרוזת עם פסיקים (לקריאות)
 */
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * קיצור מספרים גדולים (1000 -> 1K, 1000000 -> 1M)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * חישוב אחוז
 */
export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 0,
): number => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimals));
};

/**
 * פורמט אחוזים
 */
export const formatPercentage = (
  value: number,
  total: number,
  includeSign: boolean = true,
): string => {
  const percentage = calculatePercentage(value, total, 1);
  return includeSign ? `${percentage}%` : percentage.toString();
};

/**
 * קיצור טקסט עם נקודות
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * המרת זמן למילישניות לפי יחידת זמן
 */
export const timeUnitToMilliseconds = (
  value: number,
  unit: TimeUnit,
): number => {
  switch (unit) {
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 1000 * 60;
    case 'hours':
      return value * 1000 * 60 * 60;
    case 'days':
      return value * 1000 * 60 * 60 * 24;
    case 'weeks':
      return value * 1000 * 60 * 60 * 24 * 7;
    case 'months':
      return value * 1000 * 60 * 60 * 24 * 30;
    default:
      return 0;
  }
};

/**
 * המרת מילישניות ליחידת זמן
 */
export const millisecondsToTimeUnit = (
  milliseconds: number,
  unit: TimeUnit,
): number => {
  switch (unit) {
    case 'seconds':
      return Math.floor(milliseconds / 1000);
    case 'minutes':
      return Math.floor(milliseconds / (1000 * 60));
    case 'hours':
      return Math.floor(milliseconds / (1000 * 60 * 60));
    case 'days':
      return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 30));
    default:
      return 0;
  }
};

/**
 * ייצוא הכל
 */
export const FormatUtils = {
  formatNumberWithCommas,
  formatLargeNumber,
  calculatePercentage,
  formatPercentage,
  truncateText,
  timeUnitToMilliseconds,
  millisecondsToTimeUnit,
};

