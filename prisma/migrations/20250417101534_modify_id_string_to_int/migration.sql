/*
  Warnings:

  - The primary key for the `Absence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Absence` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `employeeId` on the `Absence` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Competence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Competence` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Disponibilite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Disponibilite` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `utilisateurId` on the `Disponibilite` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Justificatif` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Justificatif` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `absenceId` on the `Justificatif` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Remplacement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Remplacement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `absenceId` on the `Remplacement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `remplacantId` on the `Remplacement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `remplaceId` on the `Remplacement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Utilisateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `UtilisateurEntreprise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `utilisateurId` on the `UtilisateurEntreprise` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `A` on the `_UserCompetences` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `B` on the `_UserCompetences` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Disponibilite` DROP FOREIGN KEY `Disponibilite_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Justificatif` DROP FOREIGN KEY `Justificatif_absenceId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_absenceId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_remplacantId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_remplaceId_fkey`;

-- DropForeignKey
ALTER TABLE `UtilisateurEntreprise` DROP FOREIGN KEY `UtilisateurEntreprise_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `_UserCompetences` DROP FOREIGN KEY `_UserCompetences_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserCompetences` DROP FOREIGN KEY `_UserCompetences_B_fkey`;

-- DropIndex
DROP INDEX `Absence_employeeId_fkey` ON `Absence`;

-- DropIndex
DROP INDEX `Disponibilite_utilisateurId_fkey` ON `Disponibilite`;

-- DropIndex
DROP INDEX `Remplacement_remplacantId_fkey` ON `Remplacement`;

-- AlterTable
ALTER TABLE `Absence` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `employeeId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Competence` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Disponibilite` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `utilisateurId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Justificatif` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `absenceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Remplacement` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `absenceId` INTEGER NOT NULL,
    MODIFY `remplacantId` INTEGER NOT NULL,
    MODIFY `remplaceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Utilisateur` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UtilisateurEntreprise` DROP PRIMARY KEY,
    MODIFY `utilisateurId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`utilisateurId`, `entrepriseId`);

-- AlterTable
ALTER TABLE `_UserCompetences` MODIFY `A` INTEGER NOT NULL,
    MODIFY `B` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `UtilisateurEntreprise` ADD CONSTRAINT `UtilisateurEntreprise_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Justificatif` ADD CONSTRAINT `Justificatif_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplacantId_fkey` FOREIGN KEY (`remplacantId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplaceId_fkey` FOREIGN KEY (`remplaceId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserCompetences` ADD CONSTRAINT `_UserCompetences_A_fkey` FOREIGN KEY (`A`) REFERENCES `Competence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserCompetences` ADD CONSTRAINT `_UserCompetences_B_fkey` FOREIGN KEY (`B`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
