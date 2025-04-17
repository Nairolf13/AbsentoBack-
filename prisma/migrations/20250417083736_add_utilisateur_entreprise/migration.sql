/*
  Warnings:

  - You are about to drop the column `entrepriseId` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Utilisateur` DROP FOREIGN KEY `Utilisateur_entrepriseId_fkey`;

-- DropIndex
DROP INDEX `Utilisateur_entrepriseId_fkey` ON `Utilisateur`;

-- AlterTable
ALTER TABLE `Utilisateur` DROP COLUMN `entrepriseId`;

-- CreateTable
CREATE TABLE `UtilisateurEntreprise` (
    `utilisateurId` VARCHAR(191) NOT NULL,
    `entrepriseId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`utilisateurId`, `entrepriseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UtilisateurEntreprise` ADD CONSTRAINT `UtilisateurEntreprise_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilisateurEntreprise` ADD CONSTRAINT `UtilisateurEntreprise_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
