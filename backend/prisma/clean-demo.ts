// prisma/clean-demo.ts — מחיקת כל נתוני ההדגמה (כל רשומה עם id שמתחיל ב-"demo_").
// הרצה: npx ts-node prisma/clean-demo.ts
// בטוח: נוגע אך ורק ברשומות demo_ — נתונים אמיתיים לא מושפעים.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const W = { id: { startsWith: "demo_" } };

async function main() {
  // סדר מחיקה: ילדים לפני הורים (אילוצי מפתח זר).
  const r = {
    placementEvents: (await prisma.placementEvent.deleteMany({ where: W }))
      .count,
    placements: (await prisma.placement.deleteMany({ where: W })).count,
    presentations: (await prisma.jobPresentation.deleteMany({ where: W }))
      .count,
    callLogs: (await prisma.callLog.deleteMany({ where: W })).count,
    reminders: (await prisma.reminder.deleteMany({ where: W })).count,
    jobs: (await prisma.job.deleteMany({ where: W })).count,
    candidates: (await prisma.candidate.deleteMany({ where: W })).count,
    testimonials: (await prisma.testimonial.deleteMany({ where: W })).count,
    employers: (await prisma.employer.deleteMany({ where: W })).count,
  };
  console.log("Demo data removed:");
  console.table(r);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
