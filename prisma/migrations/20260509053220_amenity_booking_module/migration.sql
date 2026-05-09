-- CreateEnum
CREATE TYPE "AmenityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'REFUNDED');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Amenity" ADD COLUMN     "advanceBookDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "availableDays" TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "closeTime" TEXT NOT NULL DEFAULT '22:00',
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "openTime" TEXT NOT NULL DEFAULT '06:00',
ADD COLUMN     "pricePerSlot" DECIMAL(10,2),
ADD COLUMN     "slotDuration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "status" "AmenityStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amountPaid" DECIMAL(10,2),
ADD COLUMN     "guestCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "purpose" TEXT,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;
