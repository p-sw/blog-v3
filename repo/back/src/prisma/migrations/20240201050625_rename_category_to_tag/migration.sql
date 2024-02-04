/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryLocaled` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post__Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series__Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CategoryLocaled` DROP FOREIGN KEY `CategoryLocaled_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Post__Category` DROP FOREIGN KEY `Post__Category_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Post__Category` DROP FOREIGN KEY `Post__Category_postId_fkey`;

-- DropForeignKey
ALTER TABLE `Series__Category` DROP FOREIGN KEY `Series__Category_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Series__Category` DROP FOREIGN KEY `Series__Category_seriesId_fkey`;

-- DropTable
DROP TABLE `Category`;

-- DropTable
DROP TABLE `CategoryLocaled`;

-- DropTable
DROP TABLE `Post__Category`;

-- DropTable
DROP TABLE `Series__Category`;

-- CreateTable
CREATE TABLE `TagLocaled` (
    `locale` ENUM('EN', 'KO') NOT NULL,
    `tagId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TagLocaled_name_key`(`name`),
    PRIMARY KEY (`locale`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post__Tag` (
    `tagId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,

    PRIMARY KEY (`tagId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Series__Tag` (
    `tagId` INTEGER NOT NULL,
    `seriesId` INTEGER NOT NULL,

    PRIMARY KEY (`tagId`, `seriesId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TagLocaled` ADD CONSTRAINT `TagLocaled_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post__Tag` ADD CONSTRAINT `Post__Tag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post__Tag` ADD CONSTRAINT `Post__Tag_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Series__Tag` ADD CONSTRAINT `Series__Tag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Series__Tag` ADD CONSTRAINT `Series__Tag_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
