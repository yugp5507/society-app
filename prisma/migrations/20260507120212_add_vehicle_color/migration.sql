-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "adminResponse" TEXT;

-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "dateOfBirth" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "color" TEXT;
