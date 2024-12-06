/*
  Warnings:

  - A unique constraint covering the columns `[nid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nid" TEXT NOT NULL DEFAULT 'DEFAULT_NID';

-- CreateIndex
CREATE UNIQUE INDEX "User_nid_key" ON "User"("nid");
