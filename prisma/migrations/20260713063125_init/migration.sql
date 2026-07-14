/*
  Warnings:

  - You are about to drop the column `userId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `rental_requests` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `rentalRequestId` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_rentalRequestId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_landlordId_fkey";

-- DropForeignKey
ALTER TABLE "rental_requests" DROP CONSTRAINT "rental_requests_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "rental_requests" DROP CONSTRAINT "rental_requests_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_rentalRequestId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_tenantId_fkey";

-- DropIndex
DROP INDEX "reviews_rentalRequestId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "rental_requests" DROP COLUMN "propertyId";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "propertyId",
DROP COLUMN "rentalRequestId";
