-- CreateEnum
CREATE TYPE "QrStatus" AS ENUM ('PENDING', 'APPROVED', 'CONSUMED', 'EXPIRED');

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "content" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bestRank" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "equippedBadge" TEXT,
ADD COLUMN     "equippedFrame" TEXT,
ADD COLUMN     "equippedNameEffect" TEXT,
ADD COLUMN     "equippedTitle" TEXT,
ADD COLUMN     "prestige" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "qr_login_sessions" (
    "id" TEXT NOT NULL,
    "status" "QrStatus" NOT NULL DEFAULT 'PENDING',
    "approvedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_login_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rewards" (
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("userId","rewardId")
);

-- CreateIndex
CREATE INDEX "qr_login_sessions_expiresAt_idx" ON "qr_login_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "user_rewards_userId_idx" ON "user_rewards"("userId");

-- AddForeignKey
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
