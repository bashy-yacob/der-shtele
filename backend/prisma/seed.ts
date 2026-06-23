// prisma/seed.ts — זריעת נתוני התחלה לפיתוח
// הרצה: npm run prisma:seed

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---- משתמש מנהל ----
  // הסיסמה מגיעה מ-env (לא קשיחה בקוד). חובה להגדיר SEED_ADMIN_PASSWORD לפני הרצה.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "SEED_ADMIN_PASSWORD חסר או קצר מ-8 תווים — הגדר משתנה סביבה חזק לפני הרצת seed.",
    );
  }
  const adminEmail = "admin@dershtele.co.il";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "מנהל מערכת",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
      optInMarketing: true,
      optInAt: new Date(),
    },
  });

  // ---- מעסיקים ----
  const employerA = await prisma.employer.create({
    data: {
      companyName: 'חברת לוגיסטיקה ותיקה בע"מ',
      contactName: "יוסי כהן",
      contactPhone: "0501234567",
      contactEmail: "logistics@example.com",
      notes: "אמין, משלם בזמן",
    },
  });

  const employerB = await prisma.employer.create({
    data: {
      companyName: "משרד עורכי דין ירושלים",
      contactName: "שרה לוי",
      contactPhone: "0527654321",
      contactEmail: "law@example.com",
    },
  });

  // ---- משרות (אנונימיות באתר הציבורי) ----
  await prisma.job.createMany({
    data: [
      {
        employerId: employerA.id,
        title: "מנהל לוגיסטיקה",
        descriptionPublic:
          "חברה ותיקה במרכז הארץ מחפשת מנהל לוגיסטיקה עם ניסיון של לפחות 3 שנים. תפקיד מלא עם אחריות על ניהול מחסן וצוות עובדים.",
        descriptionInternal: "דרישות מלאות: ניסיון SAP, ניהול 10 עובדים.",
        field: "logistics",
        region: "בני ברק",
        scope: "משרה מלאה",
      },
      {
        employerId: employerB.id,
        title: "מזכירה / פקידת קבלה",
        descriptionPublic:
          "משרד עורכי דין בירושלים מחפש מזכירה מסודרת ואדיבה. היקף משרה גמיש, ניסיון במשרד יתרון.",
        descriptionInternal: "דרישות: הקלדה מהירה, אופיס, אנגלית בסיסית.",
        field: "admin",
        region: "ירושלים",
        scope: "משרה חלקית",
      },
    ],
  });

  // ---- המלצות לקוחות (דף הבית) ----
  // נזרעות רק אם הטבלה ריקה — כדי לא לדרוס/לשכפל המלצות שהצוות הוסיף מהדשבורד.
  // שמות פרטיים / ראשי תיבות בלבד (צניעות ופרטיות).
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          authorName: "י.כ.",
          authorRole: "הושם כמנהל לוגיסטיקה",
          quote:
            "שלחתי קורות חיים פעם אחת, והשאר נעשה בשבילי בשקט ובכבוד. תוך שבועיים הייתי בעבודה שמתאימה לי בדיוק.",
          order: 1,
        },
        {
          authorName: "ש.ל.",
          authorRole: "מועמדת שהושמה במשרד",
          quote:
            "מה שהכי הערכתי זה הדיסקרטיות. אף אחד לא קיבל את הפרטים שלי בלי שידעתי, וכל פנייה עברה דרך הצוות.",
          order: 2,
        },
        {
          authorName: "מ.ג.",
          authorRole: "מנהל גיוס, חברה בבני ברק",
          quote:
            "קיבלנו מועמדים מסוננים ומדויקים, בלי לבזבז זמן. ליווי מקצועי לאורך כל הדרך עד הקליטה.",
          order: 3,
        },
      ],
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `✅ Seed הושלם — admin: ${adminEmail} (הסיסמה מ-SEED_ADMIN_PASSWORD)`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
