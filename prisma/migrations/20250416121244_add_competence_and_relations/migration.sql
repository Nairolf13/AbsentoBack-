/*
  Warnings:

  - You are about to drop the column `dateDebut` on the `Absence` table. All the data in the column will be lost.
  - You are about to drop the column `dateFin` on the `Absence` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Absence` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `Absence` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `Absence` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - Added the required column `employeeId` to the `Absence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Absence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Absence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `Absence_utilisateurId_fkey` ON `Absence`;

-- AlterTable
ALTER TABLE `Absence` DROP COLUMN `dateDebut`,
    DROP COLUMN `dateFin`,
    DROP COLUMN `statut`,
    DROP COLUMN `utilisateurId`,
    ADD COLUMN `employeeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `justification` VARCHAR(191) NULL,
    ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'En attente',
    MODIFY `type` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Competence` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserCompetences` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserCompetences_AB_unique`(`A`, `B`),
    INDEX `_UserCompetences_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserCompetences` ADD CONSTRAINT `_UserCompetences_A_fkey` FOREIGN KEY (`A`) REFERENCES `Competence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserCompetences` ADD CONSTRAINT `_UserCompetences_B_fkey` FOREIGN KEY (`B`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
