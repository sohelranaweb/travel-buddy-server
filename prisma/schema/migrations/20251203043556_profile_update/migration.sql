/*
  Warnings:

  - The `travelInterests` column on the `travelers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `visitedCountries` column on the `travelers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "travelers" DROP COLUMN "travelInterests",
ADD COLUMN     "travelInterests" TEXT[],
DROP COLUMN "visitedCountries",
ADD COLUMN     "visitedCountries" TEXT[];
