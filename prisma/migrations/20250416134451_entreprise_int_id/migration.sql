/*
  Warnings:

  - The primary key for the `Entreprise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Entreprise` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `entrepriseId` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Utilisateur` DROP FOREIGN KEY `Utilisateur_entrepriseId_fkey`;

-- DropIndex
DROP INDEX `Utilisateur_entrepriseId_fkey` ON `Utilisateur`;

-- AlterTable
ALTER TABLE `Entreprise` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Utilisateur` MODIFY `entrepriseId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
