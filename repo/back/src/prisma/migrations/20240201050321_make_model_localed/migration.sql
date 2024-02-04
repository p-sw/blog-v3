/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `short` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Series` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Series` table. All the data in the column will be lost.
  - Added the required column `locale` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `Category`;

-- AlterTable
ALTER TABLE `Category` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `locale` ENUM('EN', 'KO') NOT NULL;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `content`,
    DROP COLUMN `short`,
    DROP COLUMN `title`;

-- AlterTable
ALTER TABLE `Series` DROP COLUMN `description`,
    DROP COLUMN `title`;

-- CreateTable
CREATE TABLE `PostLocaled` (
    `locale` ENUM('EN', 'KO') NOT NULL,
    `postId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `short` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PostLocaled_title_key`(`title`),
    PRIMARY KEY (`locale`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeriesLocaled` (
    `locale` ENUM('EN', 'KO') NOT NULL,
    `seriesId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`locale`, `seriesId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryLocaled` (
    `locale` ENUM('EN', 'KO') NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CategoryLocaled_name_key`(`name`),
    PRIMARY KEY (`locale`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostLocaled` ADD CONSTRAINT `PostLocaled_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeriesLocaled` ADD CONSTRAINT `SeriesLocaled_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryLocaled` ADD CONSTRAINT `CategoryLocaled_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
