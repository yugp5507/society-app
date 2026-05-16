/*
  Warnings:

  - You are about to alter the column `amount` on the `Maintenance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[residentId]` on the table `Apartment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId]` on the table `Society` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apartmentId` to the `Maintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Maintenance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SOCIETY_ADMIN', 'SUB_ADMIN', 'RESIDENT', 'SECURITY_GUARD');

-- CreateEnum
CREATE TYPE "GateEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'INSIDE', 'LEFT');

-- CreateEnum
CREATE TYPE "EntryMethod" AS ENUM ('QR_SCAN', 'MANUAL', 'PRE_APPROVED');

-- AlterEnum
ALTER TYPE "MaintenanceStatus" ADD VALUE 'PARTIAL';

-- AlterEnum
ALTER TYPE "VisitorStatus" ADD VALUE 'APPROVED';

-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_subAdminId_fkey";

-- DropForeignKey
ALTER TABLE "ExpectedVisitor" DROP CONSTRAINT "ExpectedVisitor_residentId_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_userId_fkey";

-- DropForeignKey
ALTER TABLE "Visitor" DROP CONSTRAINT "Visitor_approvedById_fkey";

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "apartmentId" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'RESIDENT';

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "expectedDate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "GuardProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "gateAssignment" TEXT,
    "shift" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateEntry" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorPhone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "vehicleNumber" TEXT,
    "photo" TEXT,
    "duration" TEXT,
    "entryMethod" "EntryMethod" NOT NULL DEFAULT 'MANUAL',
    "apartmentId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "guardId" TEXT,
    "status" "GateEntryStatus" NOT NULL DEFAULT 'PENDING',
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GateEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateQR" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "gateName" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateQR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardProfile_userId_key" ON "GuardProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GateQR_token_key" ON "GateQR"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_residentId_key" ON "Apartment"("residentId");

-- CreateIndex
CREATE UNIQUE INDEX "Society_adminId_key" ON "Society"("adminId");

-- AddForeignKey
ALTER TABLE "GuardProfile" ADD CONSTRAINT "GuardProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardProfile" ADD CONSTRAINT "GuardProfile_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateEntry" ADD CONSTRAINT "GateEntry_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateEntry" ADD CONSTRAINT "GateEntry_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateEntry" ADD CONSTRAINT "GateEntry_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateQR" ADD CONSTRAINT "GateQR_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
