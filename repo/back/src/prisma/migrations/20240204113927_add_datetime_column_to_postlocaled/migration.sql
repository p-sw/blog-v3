/*
  Warnings:

  - Added the required column `updatedAt` to the `PostLocaled` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PostLocaled` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
