/*
  Warnings:

  - You are about to drop the column `totalLikes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `LikedDelta` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `views` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `LikedDelta` DROP FOREIGN KEY `LikedDelta_postId_fkey`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `totalLikes`,
    ADD COLUMN `views` INTEGER NOT NULL;

-- DropTable
DROP TABLE `LikedDelta`;

-- CreateTable
CREATE TABLE `ViewDelta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inc_num` INTEGER NOT NULL,
    `recordStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastRecord` DATETIME(3) NOT NULL,
    `postId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ViewDelta` ADD CONSTRAINT `ViewDelta_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
