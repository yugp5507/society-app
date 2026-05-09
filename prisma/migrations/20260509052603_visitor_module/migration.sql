/*
  Warnings:

  - Added the required column `flatNumber` to the `Visitor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('INSIDE', 'LEFT', 'DENIED');

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "apartmentId" TEXT,
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "flatNumber" TEXT NOT NULL,
ADD COLUMN     "isExpected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "VisitorStatus" NOT NULL DEFAULT 'INSIDE';

-- CreateTable
CREATE TABLE "ExpectedVisitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "vehiclePlate" TEXT,
    "purpose" TEXT NOT NULL,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "residentId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "apartmentNumber" TEXT NOT NULL,
    "isVisited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpectedVisitor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedVisitor" ADD CONSTRAINT "ExpectedVisitor_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedVisitor" ADD CONSTRAINT "ExpectedVisitor_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;
