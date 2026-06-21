-- מעקב טיפול הצוות בפניות. nullable — תואם-לאחור, פניות קיימות נשארות "טרם טופל".

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "handledAt" TIMESTAMP(3);
