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
