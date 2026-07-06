// עימוד אחיד בצד שרת — מעטפת תוצאה + חישוב skip/take עם תקרה בטוחה.
// כל רשימת CRM שצומחת (מועמדים/מעסיקים/פניות) מחזירה Paginated<T> במקום מערך מלא,
// כדי לא לטעון אלפי רשומות בבת אחת.

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 20;
/** תקרה קשיחה — מונע בקשה שמושכת את כל הטבלה דרך pageSize ענק. */
export const MAX_PAGE_SIZE = 100;

/** ממיר page/pageSize (שרירותיים מהלקוח) לפרמטרי skip/take תקינים ל-Prisma. */
export function pageArgs(query: { page?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(query.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
