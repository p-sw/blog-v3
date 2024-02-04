/*
  Warnings:

  - You are about to drop the column `authorId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropIndex
DROP INDEX `Session_user_key` ON `Session`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `authorId`;

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `user`;

-- DropTable
DROP TABLE `User`;
