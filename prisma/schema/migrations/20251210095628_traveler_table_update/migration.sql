/*
  Warnings:

  - You are about to drop the column `travelerId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_travelerId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "travelerId";

-- AddForeignKey
ALTER TABLE "travelers" ADD CONSTRAINT "travelers_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
