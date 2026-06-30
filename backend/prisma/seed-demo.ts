// prisma/seed-demo.ts — מילוי האתר בנתוני הדגמה עשירים (כאילו פועל מזמן).
// הרצה:  npx ts-node prisma/seed-demo.ts
// ניקוי: npx ts-node prisma/clean-demo.ts   (מוחק הכל לפי תחילית demo_)
//
// כללים: לשון זכר בלבד · ערי מוקד · ללא תמונות אנשים · מעסיקים אנונימיים באתר.
// כל רשומה מקבלת id עם תחילית "demo_" → הפיך לחלוטין. idempotent (skipDuplicates).

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const DAY = 86_400_000;
const NOW = Date.now();
const daysAgo = (n: number) => new Date(NOW - n * DAY);
const daysAhead = (n: number) => new Date(NOW + n * DAY);
const pick = <T>(arr: readonly T[], i: number): T =>
  arr[((i % arr.length) + arr.length) % arr.length];
const pad = (n: number, w = 3) => String(n).padStart(w, "0");

const STAFF = ["מנחם", "דוד"];
const CITIES = [
  "בני ברק",
  "ירושלים",
  "אלעד",
  "מודיעין עילית",
  "ביתר עילית",
  "בית שמש",
  "אשדוד",
];
const SCOPES = ["משרה מלאה", "משרה חלקית", "משרה גמישה", "עבודה מהבית"];
const EXP: (string | null)[] = [
  null,
  "ללא ניסיון",
  "שנה ומעלה",
  "3 שנים ומעלה",
  "5 שנים ומעלה",
];
const FIELDS = [
  "logistics",
  "admin",
  "sales",
  "education",
  "tech",
  "finance",
  "healthcare",
  "other",
] as const;
type Field = (typeof FIELDS)[number];

const NAMES = [
  "יוסף כהן",
  "משה לוי",
  "אברהם פרידמן",
  "יעקב רוזנברג",
  "יצחק גולדשטיין",
  "שמואל וייס",
  "דוד ברגר",
  "אהרן שפירא",
  "חיים מזרחי",
  "נתן הורוביץ",
  "שלמה כץ",
  "מנחם גרוס",
  "אליהו לנדאו",
  "ישראל פוקס",
  "ברוך שטרן",
  "עזריאל אקרמן",
  "זאב פרלמן",
  "פנחס בידרמן",
  "אריה רוט",
  "טוביה הירש",
  "גרשון בלום",
  "מרדכי זילבר",
  "נפתלי שוורץ",
  "אפרים גרינברג",
  "יהודה לוין",
  "צבי וקנין",
  "עמרם ביטון",
  "שרגא דויטש",
  "מאיר אדלר",
  "קלמן רייך",
];

const COMPANIES = [
  "חברת לוגיסטיקה מובילה",
  "משרד רואי חשבון",
  "רשת חינוך תורני",
  "בית תוכנה",
  "רשת קמעונאות מזון",
  "משרד עורכי דין",
  "מוסד חינוכי",
  "חברת ביטוח",
  "סוכנות נסיעות",
  "רשת גני ילדים",
  "חברת שיווק דיגיטלי",
  "מפעל מזון",
  'חברת נדל"ן',
  "ארגון חסד",
  "חברת ייעוץ פיננסי",
  "מרפאת שיניים",
  "בית דפוס",
  "חברת אבטחה",
  "רשת מסעדות כשרות",
  "חברת תקשורת",
];

const TITLES: Record<Field, string[]> = {
  logistics: [
    "מנהל לוגיסטיקה",
    "איש מחסן",
    "נהג חלוקה",
    "רכז שילוח",
    "סדרן הובלות",
    "מלגזן",
    "אחראי משלוחים",
  ],
  admin: [
    "מזכיר",
    "פקיד קבלה",
    "רכז תפעול",
    "מנהל משרד",
    "אחראי גבייה",
    "רכז משאבי אנוש",
  ],
  sales: [
    "איש מכירות",
    "נציג מכירות טלפוני",
    "מנהל תיקי לקוחות",
    "סוכן מכירות שטח",
    "אחראי שירות לקוחות",
  ],
  education: [
    "מלמד",
    "מורה למתמטיקה",
    "מנהל מוסד חינוכי",
    "רכז חינוכי",
    "מגיה",
    "מורה לאנגלית",
  ],
  tech: [
    "מפתח תוכנה",
    "מתכנת Full Stack",
    "איש תמיכה טכנית",
    "מנהל מערכות מידע",
    "בודק תוכנה",
    "מנהל פרויקטים טכנולוגי",
  ],
  finance: [
    "מנהל חשבונות",
    "רואה חשבון",
    "אנליסט פיננסי",
    "בקר תקציבים",
    "יועץ משכנתאות",
    "חשב שכר",
  ],
  healthcare: [
    "מזכיר רפואי",
    "טכנאי שיניים",
    "רכז מרפאה",
    "מנהל מרפאה",
    "אחראי קבלת מטופלים",
  ],
  other: ["אב בית", "אחראי תחזוקה", "עובד ייצור", "מאבטח", "שליח", "מנהל רכש"],
};

const TASKS: Record<Field, string[]> = {
  logistics: [
    "לניהול מחסן וצוות עובדים",
    "לתיאום משלוחים ומעקב מלאי",
    "לעבודת חלוקה באזור",
    "לסידור וקבלת סחורה",
  ],
  admin: [
    "לניהול שוטף של המשרד",
    "לתיאום פגישות וניהול יומן",
    "לעבודת גבייה ומעקב תשלומים",
    "לקבלת קהל ומענה טלפוני",
  ],
  sales: [
    "לפיתוח עסקי וגיוס לקוחות",
    "למכירה טלפונית ומענה ללקוחות",
    "לניהול תיקי לקוחות קיימים",
    "למכירות שטח באזור",
  ],
  education: [
    "להוראה במוסד תורני",
    "לליווי וריכוז פדגוגי",
    "להוראת מקצועות ליבה",
    "לעבודה חינוכית עם תלמידים",
  ],
  tech: [
    "לפיתוח ותחזוקת מערכות",
    "לתמיכה טכנית במשתמשים",
    "לניהול תשתיות מחשוב",
    "לבדיקות תוכנה ואבטחת איכות",
  ],
  finance: [
    "לניהול הנהלת חשבונות",
    "לבקרה תקציבית ודיווח",
    "לייעוץ פיננסי ללקוחות",
    "לחישוב וניהול שכר",
  ],
  healthcare: [
    "לניהול מרפאה ותיאום תורים",
    "לעבודה במעבדת שיניים",
    "לתמיכה מנהלית במרפאה",
    "לקבלת מטופלים ומענה",
  ],
  other: [
    "לאחזקת מבנה ותפעול שוטף",
    "לעבודת ייצור בקו",
    "לאבטחת מתחם",
    "לעבודת שליחויות",
  ],
};

function jobDescription(
  field: Field,
  region: string,
  title: string,
  i: number,
): string {
  const intro = pick(
    [
      `חברה מובילה ב${region} מחפשת ${title}`,
      `ארגון מסודר ב${region} מגייס ${title}`,
      `מעסיק איכותי ב${region} מחפש ${title}`,
      `דרוש לעסק מצליח ב${region} ${title}`,
    ],
    i,
  );
  const task = pick(TASKS[field], i);
  const close = pick(
    [
      "סביבת עבודה המתאימה לציבור החרדי, שעות נוחות ותנאים טובים למתאים.",
      "אווירה נעימה, יחס אישי ותנאים מעולים. הזדמנות לטווח ארוך.",
      "תפקיד יציב עם אפשרות להתפתחות מקצועית. תנאים טובים למתאים.",
      "מקום עבודה מכבד ושומר מסורת, עם תנאים נוחים ויחס אישי.",
    ],
    i + 1,
  );
  return `${intro} ${task}. ${close}`;
}

const TESTIMONIALS = [
  [
    "י.כ.",
    "מועמד שהושם בבני ברק",
    "פניתי, שלחתי קורות חיים, ותוך כמה ימים חזרו אליי עם הצעה שממש התאימה. הכל נעשה בשקט ובכבוד.",
  ],
  [
    "מ.ל.",
    "מנהל גיוס בחברה בירושלים",
    "הציגו לנו רק מועמדים רלוונטיים, בלי הצפה. חסכו לנו זמן יקר והגיוס הצליח.",
  ],
  [
    "ש.פ.",
    "מועמד שהושם במודיעין עילית",
    "הליווי היה אישי ומכבד לאורך כל הדרך. מצאתי פרנסה יציבה קרוב לבית.",
  ],
  [
    "א.ר.",
    "מעסיק מאלעד",
    "סוף סוף שירות שמבין את הציבור. קיבלתי עובד מתאים בלי לבזבז שבועות על מיונים.",
  ],
  [
    "נ.ה.",
    "מועמד שהושם בירושלים",
    "לא האמנתי כמה פשוט זה היה. שלחתי קורות חיים פעם אחת, והם עשו את כל השאר.",
  ],
  [
    "ד.ב.",
    "מנהל בעסק בבני ברק",
    "דיסקרטיות מלאה — בדיוק מה שחיפשתי. הפרטים שלי נשמרו, וההתאמה הייתה מדויקת.",
  ],
  [
    "ח.מ.",
    "מועמד שהושם בבית שמש",
    "הצוות הקשיב באמת למה שאני מחפש, ולא לחץ. כשהגיעה ההצעה הנכונה — היא הייתה בול.",
  ],
  [
    "ב.ש.",
    "מעסיק מירושלים",
    "עבדנו עם כמה מקומות, וזה היחיד שהביא מועמדים שבאמת מתאימים לאופי שלנו.",
  ],
  [
    "ע.ל.",
    "מועמד שהושם באלעד",
    "הרגשתי שמלווים אותי, לא שמוכרים אותי. יחס אנושי ומקצועי מהרגע הראשון.",
  ],
  [
    "י.פ.",
    "מנהל גיוס",
    "המקצועיות והרצינות ניכרו בכל שלב. ההשמה נסגרה מהר ובלי כאב ראש.",
  ],
  [
    "ז.פ.",
    "מועמד שהושם בבני ברק",
    "חיפשתי בשקט בלי שהמעסיק הנוכחי יידע. הם שמרו על זה לחלוטין. תודה.",
  ],
  [
    "מ.ז.",
    "מעסיק מבני ברק",
    "תשלום רק על תוצאה זה מה ששכנע אותי לנסות — וזה באמת השתלם.",
  ],
  [
    "א.ג.",
    "מועמד שהושם בביתר עילית",
    "אחרי חודשים של חיפוש לבד, תוך שבועיים איתם כבר התחלתי עבודה חדשה.",
  ],
  [
    "ט.ה.",
    "מנהל בארגון חינוכי",
    "הבינו בדיוק את הרגישויות שלנו וסיננו בהתאם. חוויית גיוס נעימה ומכבדת.",
  ],
  [
    "ק.ר.",
    "מועמד שהושם בירושלים",
    "הליווי לא נגמר ביום הקבלה — נשארו זמינים גם אחרי. מרגישים שבאמת אכפת.",
  ],
  [
    "צ.ו.",
    "מעסיק מאשדוד",
    "שירות מסודר, אמין ומכבד. נעבוד איתם שוב בלי היסוס.",
  ],
];

async function main() {
  console.log("Seeding demo data (reversible — all ids prefixed 'demo_')...");

  // ---- מעסיקים (20, מאושרים, נוצרו לאורך ~10 חודשים) ----
  const employers: Prisma.EmployerCreateManyInput[] = COMPANIES.map(
    (name, i) => {
      const created = daysAgo(300 - i * 12);
      return {
        id: `demo_emp_${pad(i + 1)}`,
        companyName: `${name} (${pick(CITIES, i)})`,
        contactName: pick(NAMES, i),
        contactPhone:
          `05${pick([0, 2, 3, 4, 5], i)}${pad(1000000 + i * 13577, 7)}`.slice(
            0,
            10,
          ),
        contactEmail: `employer${i + 1}@demo.local`,
        notes: "[DEMO] מעסיק הדגמה",
        status: "approved",
        approvedAt: created,
        createdAt: created,
        updatedAt: created,
      };
    },
  );

  // ---- משרות (70) ----
  const jobs: Prisma.JobCreateManyInput[] = [];
  for (let i = 0; i < 70; i++) {
    const field = pick(FIELDS, i) as Field;
    const region = pick(CITIES, i * 3);
    const title = pick(TITLES[field], i);
    const scope = pick(SCOPES, i);
    const opened = daysAgo(3 + ((i * 37) % 262));
    let status: string = "active";
    let closedAt: Date | undefined;
    if (i % 14 === 0) {
      status = "filled";
      closedAt = daysAgo(3 + ((i * 37) % 60));
    } else if (i % 17 === 0) {
      status = "paused";
    } else if (i % 29 === 0) {
      status = "closed";
      closedAt = daysAgo(2 + ((i * 11) % 40));
    }
    const featured = status === "active" && i % 13 === 0;
    jobs.push({
      id: `demo_job_${pad(i + 1, 4)}`,
      employerId: employers[i % employers.length].id!,
      title,
      descriptionPublic: jobDescription(field, region, title, i),
      descriptionInternal: `[DEMO] דרישות פנימיות לתפקיד ${title}. נתוני הדגמה בלבד.`,
      field,
      region,
      scope,
      experience: pick(EXP, i) ?? undefined,
      salary:
        i % 3 === 0 ? `${7 + (i % 8)},000-${10 + (i % 8)},000 ₪` : undefined,
      status: status as Prisma.JobCreateManyInput["status"],
      openedAt: opened,
      closedAt,
      featuredUntil: featured ? daysAhead(30) : undefined,
      featuredPaymentStatus: featured ? "paid" : "unpaid",
      featuredPaidAt: featured ? daysAgo(5) : undefined,
      featuredPrice: featured ? 250 : undefined,
      createdAt: opened,
      updatedAt: opened,
    });
  }

  // ---- מועמדים (30) ----
  const candStatuses = ["new", "in_progress", "presented", "not_suitable"];
  const candidates: Prisma.CandidateCreateManyInput[] = NAMES.map((name, i) => {
    const created = daysAgo(280 - i * 8);
    return {
      id: `demo_cand_${pad(i + 1)}`,
      fullName: name,
      phone:
        `05${pick([2, 3, 4, 5, 8], i)}${pad(2000000 + i * 31771, 7)}`.slice(
          0,
          10,
        ),
      email: `candidate${i + 1}@demo.local`,
      city: pick(CITIES, i + 2),
      field: pick(FIELDS, i) as Prisma.CandidateCreateManyInput["field"],
      region: pick(CITIES, i + 2),
      birthYear: 1980 + (i % 22),
      status: (i < 12
        ? "hired"
        : pick(candStatuses, i)) as Prisma.CandidateCreateManyInput["status"],
      notes: "[DEMO] מועמד הדגמה",
      createdAt: created,
      updatedAt: created,
    };
  });

  // ---- המלצות (16) ----
  const testimonials: Prisma.TestimonialCreateManyInput[] = TESTIMONIALS.map(
    ([authorName, authorRole, quote], i) => ({
      id: `demo_tst_${pad(i + 1)}`,
      authorName,
      authorRole,
      quote,
      published: true,
      order: i,
      createdAt: daysAgo(190 - i * 10),
      updatedAt: daysAgo(190 - i * 10),
    }),
  );

  // ---- הצגות מועמדים למשרות (~25, זוגות ייחודיים) ----
  const presentations: Prisma.JobPresentationCreateManyInput[] = [];
  const seenPairs = new Set<string>();
  for (let k = 0; k < 28 && presentations.length < 25; k++) {
    const ci = k % candidates.length;
    const ji = (k * 7) % jobs.length;
    const key = `${ji}-${ci}`;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    presentations.push({
      id: `demo_pres_${pad(presentations.length + 1)}`,
      jobId: jobs[ji].id!,
      candidateId: candidates[ci].id!,
      presentedAt: daysAgo(60 + ((k * 5) % 120)),
      status: (k % 4 === 0
        ? "hired"
        : "presented") as Prisma.JobPresentationCreateManyInput["status"],
      notes: "[DEMO]",
    });
  }

  // ---- גיוסים + לוג עמלות (12) — מכבד את כללי העמלה ----
  const placements: Prisma.PlacementCreateManyInput[] = [];
  const events: Prisma.PlacementEventCreateManyInput[] = [];
  for (let p = 0; p < 12; p++) {
    const ji = (p * 5) % jobs.length;
    const job = jobs[ji];
    const placementId = `demo_plc_${pad(p + 1)}`;
    const bucket = p % 3; // 0=ותיק שולם · 1=בתוך ערבות · 2=ערבות הסתיימה (לגבייה)
    const placedDaysAgo =
      bucket === 0 ? 150 + p * 8 : bucket === 1 ? 30 + p * 3 : 95 + p * 2;
    const placedAt = daysAgo(placedDaysAgo);
    const guaranteeEndsAt = new Date(placedAt.getTime() + 90 * DAY);
    const amount = 6000 + (p % 8) * 1200;
    const staff = pick(STAFF, p);

    let status: string, commissionStatus: string;
    const evTypes: { type: string; off: number; note?: string }[] = [
      { type: "created", off: 0, note: "סימון גיוס" },
      { type: "confirmed", off: 1 },
      { type: "guarantee", off: 2, note: "כניסה לתקופת ערבות" },
    ];
    if (bucket === 0) {
      status = "completed";
      commissionStatus = "paid";
      evTypes.push(
        { type: "completed", off: 90, note: "הערבות עברה בהצלחה" },
        {
          type: "commission_due",
          off: 90,
          note: `עמלה ${amount} ₪ נכנסה לגבייה`,
        },
        { type: "commission_invoiced", off: 95 },
        { type: "commission_paid", off: 110, note: "שולם" },
      );
    } else if (bucket === 1) {
      status = "guarantee";
      commissionStatus = "not_due";
    } else {
      status = "completed";
      commissionStatus = "due";
      evTypes.push(
        { type: "completed", off: 90, note: "הערבות עברה בהצלחה" },
        {
          type: "commission_due",
          off: 90,
          note: `עמלה ${amount} ₪ נכנסה לגבייה`,
        },
      );
    }

    placements.push({
      id: placementId,
      jobId: job.id!,
      candidateId: candidates[p].id!,
      employerId: job.employerId,
      placedAt,
      guaranteeEndsAt,
      status: status as Prisma.PlacementCreateManyInput["status"],
      commissionAmount: amount,
      commissionStatus:
        commissionStatus as Prisma.PlacementCreateManyInput["commissionStatus"],
      notes: "[DEMO] גיוס הדגמה",
      createdAt: placedAt,
      updatedAt: placedAt,
    });

    evTypes.forEach((e, ei) => {
      events.push({
        id: `demo_evt_${pad(p + 1)}_${ei}`,
        placementId,
        type: e.type as Prisma.PlacementEventCreateManyInput["type"],
        note: e.note,
        createdBy: staff,
        createdAt: new Date(placedAt.getTime() + e.off * DAY),
      });
    });
  }

  // ---- לוג שיחות (20) ----
  const callSummaries = [
    "שיחת היכרות ראשונית. מתאים לתפקידים באזור המרכז.",
    "בירור ציפיות שכר והיקף. מעוניין במשרה מלאה.",
    "עדכון: הוצג למעסיק, ממתין למשוב.",
    "ביקש להמתין לחזרה לאחר החגים.",
    "מחפש קרוב לבית בלבד. עודכנו ההעדפות.",
    "שיחת מעקב — עדיין מחפש, פתוח להצעות.",
  ];
  const callLogs: Prisma.CallLogCreateManyInput[] = Array.from(
    { length: 20 },
    (_, i) => {
      const ci = i % candidates.length;
      return {
        id: `demo_cl_${pad(i + 1)}`,
        candidateId: candidates[ci].id!,
        staffName: pick(STAFF, i),
        calledAt: daysAgo(20 + ((i * 9) % 200)),
        summary: `[DEMO] ${pick(callSummaries, i)}`,
        followUpAt: i % 3 === 0 ? daysAhead(2 + (i % 7)) : undefined,
      };
    },
  );

  // ---- תזכורות צוות (8) ----
  const reminderMsgs = [
    "לחזור למועמד לגבי המשרה החדשה",
    "לעדכן מעסיק על מצב הגיוס",
    "לבדוק תום ערבות והעברת עמלה לגבייה",
    "לתאם ראיון שני",
  ];
  const reminders: Prisma.ReminderCreateManyInput[] = Array.from(
    { length: 8 },
    (_, i) => ({
      id: `demo_rem_${pad(i + 1)}`,
      candidateId:
        i % 2 === 0 ? candidates[i % candidates.length].id! : undefined,
      message: `[DEMO] ${pick(reminderMsgs, i)}`,
      remindAt: i % 3 === 0 ? daysAgo(5 + i) : daysAhead(1 + i),
      done: i % 3 === 0,
      createdBy: pick(STAFF, i),
      createdAt: daysAgo(10 + i),
    }),
  );

  // ---- כתיבה ל-DB (הורים לפני ילדים; skipDuplicates ⇒ idempotent) ----
  const r1 = await prisma.employer.createMany({
    data: employers,
    skipDuplicates: true,
  });
  const r2 = await prisma.job.createMany({ data: jobs, skipDuplicates: true });
  const r3 = await prisma.candidate.createMany({
    data: candidates,
    skipDuplicates: true,
  });
  const r4 = await prisma.testimonial.createMany({
    data: testimonials,
    skipDuplicates: true,
  });
  const r5 = await prisma.jobPresentation.createMany({
    data: presentations,
    skipDuplicates: true,
  });
  const r6 = await prisma.placement.createMany({
    data: placements,
    skipDuplicates: true,
  });
  const r7 = await prisma.placementEvent.createMany({
    data: events,
    skipDuplicates: true,
  });
  const r8 = await prisma.callLog.createMany({
    data: callLogs,
    skipDuplicates: true,
  });
  const r9 = await prisma.reminder.createMany({
    data: reminders,
    skipDuplicates: true,
  });

  console.log("Demo data seeded:");
  console.table({
    employers: r1.count,
    jobs: r2.count,
    candidates: r3.count,
    testimonials: r4.count,
    presentations: r5.count,
    placements: r6.count,
    placementEvents: r7.count,
    callLogs: r8.count,
    reminders: r9.count,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
