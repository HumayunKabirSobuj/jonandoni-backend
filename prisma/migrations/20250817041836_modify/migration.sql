/*
  Warnings:

  - The values [ACTIVE,BLOCKED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address_Pickup_Location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AddParcel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GetInTouch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestrictedUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShippoLineItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShippoOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('customer', 'shop_owner', 'admin');

-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('Restaurant', 'Shop');

-- CreateEnum
CREATE TYPE "public"."BusinessCategory" AS ENUM ('Pizza', 'Burger', 'Coffee', 'Dessert', 'IceCream', 'Sandwich', 'Salad', 'Pasta', 'Seafood', 'Other');

-- CreateEnum
CREATE TYPE "public"."AddProductStatus" AS ENUM ('Visible', 'Invisible');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserStatus_new" AS ENUM ('approved', 'pending');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "status" TYPE "public"."UserStatus_new" USING ("status"::text::"public"."UserStatus_new");
ALTER TYPE "public"."UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "public"."UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AddParcel" DROP CONSTRAINT "AddParcel_addressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddParcel" DROP CONSTRAINT "AddParcel_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddParcel" DROP CONSTRAINT "AddParcel_marchentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_marchentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Customer" DROP CONSTRAINT "Customer_marchentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentMethod" DROP CONSTRAINT "PaymentMethod_marchentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RestrictedUser" DROP CONSTRAINT "RestrictedUser_marchentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShippoLineItem" DROP CONSTRAINT "ShippoLineItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_marchentId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "address_Pickup_Location",
DROP COLUMN "businessName",
DROP COLUMN "createdAt",
DROP COLUMN "isDeleted",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "area" TEXT,
ADD COLUMN     "branches" TEXT,
ADD COLUMN     "business_address" TEXT,
ADD COLUMN     "business_category" "public"."BusinessCategory"[],
ADD COLUMN     "business_name" TEXT,
ADD COLUMN     "business_type" "public"."BusinessType",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "codeExpireAt" TIMESTAMP(3),
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "storefrontPhoto" TEXT,
ADD COLUMN     "verificationCode" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."AddParcel";

-- DropTable
DROP TABLE "public"."Address";

-- DropTable
DROP TABLE "public"."Customer";

-- DropTable
DROP TABLE "public"."GetInTouch";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."PaymentMethod";

-- DropTable
DROP TABLE "public"."RestrictedUser";

-- DropTable
DROP TABLE "public"."ShippoLineItem";

-- DropTable
DROP TABLE "public"."ShippoOrder";

-- DropTable
DROP TABLE "public"."comments";

-- DropTable
DROP TABLE "public"."tickets";

-- DropEnum
DROP TYPE "public"."ParcelStatus";

-- DropEnum
DROP TYPE "public"."ParcelType";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."PaymentType";

-- DropEnum
DROP TYPE "public"."RESTRICTED_USER_ROLE";

-- DropEnum
DROP TYPE "public"."SupportCategory";

-- DropEnum
DROP TYPE "public"."SupportPriority";

-- DropEnum
DROP TYPE "public"."SupportStatus";

-- DropEnum
DROP TYPE "public"."USER_ROLE";

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddProduct" (
    "id" TEXT NOT NULL,
    "shopOwnerId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "public"."AddProductStatus" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "discountActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AddProduct" ADD CONSTRAINT "AddProduct_shopOwnerId_fkey" FOREIGN KEY ("shopOwnerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddProduct" ADD CONSTRAINT "AddProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
