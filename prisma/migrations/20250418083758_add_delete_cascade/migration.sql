-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Disponibilite` DROP FOREIGN KEY `Disponibilite_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Planning` DROP FOREIGN KEY `Planning_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Planning` DROP FOREIGN KEY `Planning_replaceEmployeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_remplacantId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_remplaceId_fkey`;

-- DropForeignKey
ALTER TABLE `UtilisateurEntreprise` DROP FOREIGN KEY `UtilisateurEntreprise_entrepriseId_fkey`;

-- DropForeignKey
ALTER TABLE `UtilisateurEntreprise` DROP FOREIGN KEY `UtilisateurEntreprise_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `Absence_employeeId_fkey` ON `Absence`;

-- DropIndex
DROP INDEX `Disponibilite_utilisateurId_fkey` ON `Disponibilite`;

-- DropIndex
DROP INDEX `Planning_employeeId_fkey` ON `Planning`;

-- DropIndex
DROP INDEX `Planning_replaceEmployeeId_fkey` ON `Planning`;

-- DropIndex
DROP INDEX `Remplacement_remplacantId_fkey` ON `Remplacement`;

-- DropIndex
DROP INDEX `UtilisateurEntreprise_entrepriseId_fkey` ON `UtilisateurEntreprise`;

-- AddForeignKey
ALTER TABLE `UtilisateurEntreprise` ADD CONSTRAINT `UtilisateurEntreprise_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilisateurEntreprise` ADD CONSTRAINT `UtilisateurEntreprise_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplacantId_fkey` FOREIGN KEY (`remplacantId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplaceId_fkey` FOREIGN KEY (`remplaceId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_replaceEmployeeId_fkey` FOREIGN KEY (`replaceEmployeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
