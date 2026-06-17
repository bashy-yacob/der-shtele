import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** מאחד class names עם פתרון התנגשויות Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** תאריך עברי קצר (he-IL). */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** תאריך + שעה (he-IL) — לרשומות שיחה והסכמות. */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** סכום בשקלים (₪). */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
}
