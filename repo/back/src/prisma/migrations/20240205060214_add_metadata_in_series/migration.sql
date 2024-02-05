/*
  Warnings:

  - Added the required column `updatedAt` to the `Series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Series` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `SeriesViewDelta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inc_num` INTEGER NOT NULL,
    `recordStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastRecord` DATETIME(3) NOT NULL,
    `seriesId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SeriesViewDelta` ADD CONSTRAINT `SeriesViewDelta_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
