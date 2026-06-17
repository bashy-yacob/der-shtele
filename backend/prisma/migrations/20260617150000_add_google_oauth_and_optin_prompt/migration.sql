-- התחברות עם Google: שדות OAuth ל-User + תזכורת opt-in חודשית.
-- כל השינויים אדיטיביים ותואמי-לאחור: passwordHash הופך nullable (הרחבה),
-- העמודות החדשות nullable או עם DEFAULT — נתונים קיימים לא מושפעים.

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'local',
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "optInPromptedAt" TIMESTAMP(3),
ADD COLUMN     "profilePicture" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
