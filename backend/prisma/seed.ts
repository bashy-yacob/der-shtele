// prisma/seed.ts — זריעת נתוני התחלה לפיתוח
// הרצה: npm run prisma:seed

import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * מעסיק לפי שם חברה — find-or-create. ה-DB משותף עם פרודקשן, לכן ה-seed
 * חייב להיות idempotent: לא יוצר כפילויות ולא דורס מעסיק קיים.
 */
async function ensureEmployer(data: Prisma.EmployerCreateInput) {
  const existing = await prisma.employer.findFirst({
    where: { companyName: data.companyName },
  });
  if (existing) return existing;
  return prisma.employer.create({ data });
}

/**
 * משרה לפי (מעסיק + כותרת) — find-or-create. אם המשרה כבר קיימת לא נוגעים
 * בה (לא דורסים עריכות ידניות של הצוות); אחרת יוצרים אותה.
 */
async function ensureJob(data: Prisma.JobUncheckedCreateInput) {
  const existing = await prisma.job.findFirst({
    where: { employerId: data.employerId, title: data.title },
  });
  if (existing) return existing;
  return prisma.job.create({ data });
}

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

  // ---- מעסיקים (find-or-create — לא משכפל מעסיק קיים) ----
  const employerA = await ensureEmployer({
    companyName: 'חברת לוגיסטיקה ותיקה בע"מ',
    contactName: "יוסי כהן",
    contactPhone: "0501234567",
    contactEmail: "logistics@example.com",
    notes: "אמין, משלם בזמן",
  });

  const employerB = await ensureEmployer({
    companyName: "משרד עורכי דין ירושלים",
    contactName: "שרה לוי",
    contactPhone: "0527654321",
    contactEmail: "law@example.com",
  });

  // ---- משרות (אנונימיות באתר הציבורי) ----
  // מעסיק יכול לפרסם כמה משרות — הקשר Employer→Job הוא אחד-לרבים.
  // כאן: מעסיק A עם 3 משרות, מעסיק B עם 2 משרות, להדגמת התצוגה בדשבורד.
  // הכותרות הראשונות בכל מעסיק נשמרו זהות ל-seed המקורי כדי שמשרות שכבר
  // נזרעו ב-DB יזוהו ע"י ensureJob ולא ישוכפלו.
  const jobs: Prisma.JobUncheckedCreateInput[] = [
    // --- מעסיק A: חברת לוגיסטיקה ---
    {
      employerId: employerA.id,
      title: "מנהל לוגיסטיקה",
      descriptionPublic:
        "חברה ותיקה במרכז הארץ מחפשת מנהל לוגיסטיקה עם ניסיון של לפחות 3 שנים. תפקיד מלא עם אחריות על ניהול מחסן וצוות עובדים.",
      descriptionInternal: "דרישות מלאות: ניסיון SAP, ניהול 10 עובדים.",
      field: "logistics",
      region: "בני ברק",
      scope: "משרה מלאה",
      experience: "3 שנים ומעלה",
    },
    {
      employerId: employerA.id,
      title: "איש/אשת מחסן",
      descriptionPublic:
        "חברה במרכז הארץ מחפשת עובד/ת מחסן חרוצ/ה לליקוט, סידור וקבלת סחורה. אווירת עבודה נעימה ושעות נוחות. ניסיון יתרון, לא חובה.",
      descriptionInternal: "עבודה פיזית, משמרת בוקר. רישיון מלגזה יתרון.",
      field: "logistics",
      region: "בני ברק",
      scope: "משרה מלאה",
    },
    {
      employerId: employerA.id,
      title: "רכז/ת תפעול",
      descriptionPublic:
        "דרוש/ה רכז/ת תפעול לתיאום בין מחלקות, מעקב אחר הזמנות ועבודה מול ספקים. תפקיד מגוון בסביבה מסודרת. היקף משרה גמיש.",
      descriptionInternal: "שליטה באקסל, יכולת ארגון גבוהה. אפשרות לחצי משרה.",
      field: "admin",
      region: "בני ברק",
      scope: "משרה גמישה",
      status: "paused",
    },
    // --- מעסיק B: משרד עורכי דין ---
    {
      employerId: employerB.id,
      title: "מזכירה / פקידת קבלה",
      descriptionPublic:
        "משרד עורכי דין בירושלים מחפש מזכיר/ה מסודר/ת ואדיב/ה. היקף משרה גמיש, ניסיון במשרד יתרון.",
      descriptionInternal: "דרישות: הקלדה מהירה, אופיס, אנגלית בסיסית.",
      field: "admin",
      region: "ירושלים",
      scope: "משרה חלקית",
    },
    {
      employerId: employerB.id,
      title: "עוזר/ת משפטי/ת",
      descriptionPublic:
        "משרד עורכי דין בירושלים מחפש עוזר/ת משפטי/ת לניהול תיקים, הכנת מסמכים ותיאום פגישות. תפקיד מקצועי עם אפשרות להתפתחות. ניסיון בתחום המשפטי יתרון.",
      descriptionInternal: "ידע בהגשת כתבי טענות יתרון. עברית ברמה גבוהה.",
      field: "admin",
      region: "ירושלים",
      scope: "משרה מלאה",
      experience: "שנה ומעלה",
    },
  ];

  let created = 0;
  for (const job of jobs) {
    const before = await prisma.job.count({
      where: { employerId: job.employerId, title: job.title },
    });
    await ensureJob(job);
    if (before === 0) created += 1;
  }

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
    `✅ Seed הושלם — admin: ${adminEmail} (הסיסמה מ-SEED_ADMIN_PASSWORD) · ` +
      `משרות חדשות שנוצרו: ${created}/${jobs.length} (קיימות דולגו)`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
