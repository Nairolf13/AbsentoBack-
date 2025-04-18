/*
  Warnings:

  - You are about to alter the column `passwordToken` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Utilisateur` MODIFY `passwordToken` VARCHAR(191) NULL,
    MODIFY `passwordTokenExpires` DATETIME(3) NULL;
