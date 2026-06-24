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

  // ---- משתמש פורטל למעסיק A (להדגמת פורטל המעסיקים, שלב 4) ----
  // ⚠️ חשבון דמו — להחליף סיסמה / למחוק לפני שימוש אמיתי. ניתן לדרוס דרך
  // SEED_EMPLOYER_PASSWORD. עם role=employer ו-employerId, נכנס ב-/portal/login.
  const employerPassword =
    process.env.SEED_EMPLOYER_PASSWORD ?? "DerShtele!2026";
  const employerEmail = "employer@dershtele.co.il";
  await prisma.user.upsert({
    where: { email: employerEmail },
    update: { employerId: employerA.id, role: "employer", emailVerified: true },
    create: {
      email: employerEmail,
      fullName: employerA.contactName,
      passwordHash: await bcrypt.hash(employerPassword, 12),
      role: "employer",
      employerId: employerA.id,
      emailVerified: true,
    },
  });

  // ---- משרה ממתינה לאישור (הדגמת זרימת האישור בפורטל ובאדמין) ----
  await ensureJob({
    employerId: employerA.id,
    title: "נהג/ת חלוקה",
    descriptionPublic:
      "חברת לוגיסטיקה מחפשת נהג/ת חלוקה אחראי/ת לאזור המרכז. שעות נוחות, תנאים טובים ואווירה משפחתית.",
    descriptionInternal: "רישיון עד 12 טון. עבודה יומית, יציאה מבני ברק.",
    field: "logistics",
    region: "בני ברק",
    scope: "משרה מלאה",
    status: "pending",
  });

  // ---- מועמדים מודגמים + הצגות + גיוס עם עמלה (הדגמת תצוגת הפורטל) ----
  const demoJob = await prisma.job.findFirst({
    where: { employerId: employerA.id, title: "מנהל לוגיסטיקה" },
  });
  if (demoJob) {
    const ensureCandidate = async (data: Prisma.CandidateCreateInput) => {
      const found = await prisma.candidate.findFirst({
        where: { email: data.email },
      });
      return found ?? prisma.candidate.create({ data });
    };
    const ensurePresentation = async (
      candidateId: string,
      status: "presented" | "hired",
    ) => {
      const found = await prisma.jobPresentation.findFirst({
        where: { jobId: demoJob.id, candidateId },
      });
      if (!found) {
        await prisma.jobPresentation.create({
          data: { jobId: demoJob.id, candidateId, status },
        });
      }
    };

    // מועמד שגויס — מציג גיוס + עמלה לגבייה.
    const hired = await ensureCandidate({
      fullName: "דוד לוי",
      phone: "0500000001",
      email: "candidate1.demo@example.com",
      field: "logistics",
      region: "בני ברק",
      status: "hired",
    });
    await ensurePresentation(hired.id, "hired");

    // מועמד שהוצג בלבד — מציג סטטוס "הוצג".
    const presented = await ensureCandidate({
      fullName: "משה ישראלי",
      phone: "0500000002",
      email: "candidate2.demo@example.com",
      field: "logistics",
      region: "בני ברק",
      status: "presented",
    });
    await ensurePresentation(presented.id, "presented");

    // גיוס + עמלה — placedAt לפני ~120 יום ⇒ הערבות עברה ⇒ העמלה "לגבייה".
    const existingPlacement = await prisma.placement.findFirst({
      where: {
        jobId: demoJob.id,
        candidateId: hired.id,
        status: { not: "cancelled" },
      },
    });
    if (!existingPlacement) {
      const placedAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 120);
      const guaranteeEndsAt = new Date(placedAt);
      guaranteeEndsAt.setMonth(guaranteeEndsAt.getMonth() + 3);
      await prisma.placement.create({
        data: {
          jobId: demoJob.id,
          candidateId: hired.id,
          employerId: employerA.id,
          placedAt,
          guaranteeEndsAt,
          status: "completed",
          commissionAmount: 9000,
          commissionStatus: "due",
          events: {
            create: { type: "created", note: "גיוס דמו · עמלה ₪9,000" },
          },
        },
      });
    }
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
      `משרות חדשות שנוצרו: ${created}/${jobs.length} (קיימות דולגו)\n` +
      `👔 פורטל מעסיק (דמו): ${employerEmail} / ${employerPassword} → /portal/login`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
