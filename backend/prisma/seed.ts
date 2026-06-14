// prisma/seed.ts — זריעת נתוני התחלה לפיתוח
// הרצה: npm run prisma:seed

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ---- משתמש מנהל ----
  const adminEmail = 'admin@dershtele.co.il';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'מנהל מערכת',
      passwordHash: await bcrypt.hash('admin1234', 10),
      role: 'admin',
      optInMarketing: true,
      optInAt: new Date(),
    },
  });

  // ---- מעסיקים ----
  const employerA = await prisma.employer.create({
    data: {
      companyName: 'חברת לוגיסטיקה ותיקה בע"מ',
      contactName: 'יוסי כהן',
      contactPhone: '0501234567',
      contactEmail: 'logistics@example.com',
      notes: 'אמין, משלם בזמן',
    },
  });

  const employerB = await prisma.employer.create({
    data: {
      companyName: 'משרד עורכי דין ירושלים',
      contactName: 'שרה לוי',
      contactPhone: '0527654321',
      contactEmail: 'law@example.com',
    },
  });

  // ---- משרות (אנונימיות באתר הציבורי) ----
  await prisma.job.createMany({
    data: [
      {
        employerId: employerA.id,
        title: 'מנהל לוגיסטיקה',
        descriptionPublic:
          'חברה ותיקה במרכז הארץ מחפשת מנהל לוגיסטיקה עם ניסיון של לפחות 3 שנים. תפקיד מלא עם אחריות על ניהול מחסן וצוות עובדים.',
        descriptionInternal: 'דרישות מלאות: ניסיון SAP, ניהול 10 עובדים.',
        field: 'logistics',
        region: 'bnei_brak',
        gender: 'men',
        scope: 'משרה מלאה',
        rabbinicalApproval: true,
        rabbinicalApprovalBy: 'הרב פלוני',
      },
      {
        employerId: employerB.id,
        title: 'מזכירה / פקידת קבלה',
        descriptionPublic:
          'משרד עורכי דין בירושלים מחפש מזכירה מסודרת ואדיבה. היקף משרה גמיש, ניסיון במשרד יתרון.',
        descriptionInternal: 'דרישות: הקלדה מהירה, אופיס, אנגלית בסיסית.',
        field: 'admin',
        region: 'jerusalem',
        gender: 'women',
        scope: 'משרה חלקית',
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('✅ Seed הושלם — admin@dershtele.co.il / admin1234');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
