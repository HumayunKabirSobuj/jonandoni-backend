/*
  Warnings:

  - The values [Pizza,Burger,Coffee,Dessert,IceCream,Sandwich,Salad,Pasta,Seafood] on the enum `BusinessCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BusinessCategory_new" AS ENUM ('Restaurant', 'Grocery', 'Electronics', 'Fashion', 'Pharmacy', 'Bakery', 'Cafe', 'Bookstore', 'Furniture', 'Other');
ALTER TABLE "public"."User" ALTER COLUMN "business_category" TYPE "public"."BusinessCategory_new"[] USING ("business_category"::text::"public"."BusinessCategory_new"[]);
ALTER TYPE "public"."BusinessCategory" RENAME TO "BusinessCategory_old";
ALTER TYPE "public"."BusinessCategory_new" RENAME TO "BusinessCategory";
DROP TYPE "public"."BusinessCategory_old";
COMMIT;
