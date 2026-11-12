/**
 * Safe local date formatting and calculations.
 * Always uses local time getFullYear, getMonth, getDate to avoid UTC+7 date shift.
 */

export function getDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function getYesterdayKey(currentDateKey: string): string {
  const date = parseDateKey(currentDateKey);
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

export function getDaysDifference(dateKeyA: string, dateKeyB: string): number {
  const dateA = parseDateKey(dateKeyA);
  const dateB = parseDateKey(dateKeyB);
  const diffTime = dateA.getTime() - dateB.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatVietnameseDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

export function getMsUntilNextMidnight(now: Date = new Date()): number {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return Math.max(1000, tomorrow.getTime() - now.getTime());
}
