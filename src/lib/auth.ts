// lib/auth.ts
// אימות לממשק ה-CRM הפנימי
// שלב ב: לממש JWT מלא עם next-auth או jose
//
// שימוש בכל admin route:
//   const authError = await requireAdmin(req);
//   if (authError) return authError;

import { NextResponse } from 'next/server';

export interface AdminSession {
  userId: string;
  name: string;     // שם הנציג
  role: 'admin';
}

/**
 * מאמת שהבקשה מגיעה מנציג מחובר.
 * מחזיר null אם הכל תקין, NextResponse עם שגיאה אם לא.
 *
 * TODO שלב ב: לממש עם JWT (jose) או next-auth
 */
export async function requireAdmin(
  req: Request
): Promise<NextResponse | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'נדרשת כניסה למערכת' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  const session = await verifyToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'פגישה פגה — נא להתחבר מחדש' },
      { status: 401 }
    );
  }

  if (session.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'אין הרשאה' },
      { status: 403 }
    );
  }

  return null; // הכל תקין
}

/**
 * TODO שלב ב: לממש אימות JWT אמיתי
 * לדוגמה עם jose:
 *   import { jwtVerify } from 'jose';
 *   const { payload } = await jwtVerify(token, secret);
 */
async function verifyToken(token: string): Promise<AdminSession | null> {
  // placeholder — תמיד נכשל עד שמממשים
  void token;
  return null;
}
