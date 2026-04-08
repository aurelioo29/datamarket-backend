/*
  Warnings:

  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_datasetId_fkey`;

-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_userId_fkey`;

-- DropTable
DROP TABLE `Purchase`;
