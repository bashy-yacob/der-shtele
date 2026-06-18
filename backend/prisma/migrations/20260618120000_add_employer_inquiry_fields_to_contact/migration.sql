-- פרטים מובְנים מטופס פניית מעסיק בטבלת contacts.
-- כל העמודות nullable — תואם-לאחור, פניות מועמד/כללי קיימות לא מושפעות.

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "email" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "businessNumber" TEXT,
ADD COLUMN     "companyLocation" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "field" "JobField",
ADD COLUMN     "region" TEXT,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "salary" TEXT;
