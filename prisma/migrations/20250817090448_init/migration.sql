-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('approved', 'pending');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('customer', 'shop_owner', 'admin');

-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('Restaurant', 'Shop');

-- CreateEnum
CREATE TYPE "public"."BusinessCategory" AS ENUM ('Pizza', 'Burger', 'Coffee', 'Dessert', 'IceCream', 'Sandwich', 'Salad', 'Pasta', 'Seafood', 'Other');

-- CreateEnum
CREATE TYPE "public"."AddProductStatus" AS ENUM ('Visible', 'Invisible');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "business_name" TEXT,
    "business_type" "public"."BusinessType",
    "business_category" "public"."BusinessCategory"[],
    "status" "public"."UserStatus",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branches" TEXT,
    "phone_number" TEXT,
    "business_address" TEXT,
    "city" TEXT,
    "area" TEXT,
    "postal_code" TEXT,
    "storefrontPhoto" TEXT,
    "companyLogo" TEXT,
    "verificationCode" TEXT,
    "codeExpireAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."AddProduct" ADD CONSTRAINT "AddProduct_shopOwnerId_fkey" FOREIGN KEY ("shopOwnerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddProduct" ADD CONSTRAINT "AddProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
