/*
  Warnings:

  - You are about to drop the column `dob` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "dob",
DROP COLUMN "name",
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'END_USER';

-- CreateTable
CREATE TABLE "NidVerification" (
    "id" SERIAL NOT NULL,
    "nid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NidVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NidVerification_nid_key" ON "NidVerification"("nid");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_nid_fkey" FOREIGN KEY ("nid") REFERENCES "NidVerification"("nid") ON DELETE RESTRICT ON UPDATE CASCADE;
