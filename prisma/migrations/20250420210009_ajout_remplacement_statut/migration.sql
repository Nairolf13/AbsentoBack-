/*
  Warnings:

  - You are about to drop the column `heureDebut` on the `Planning` table. All the data in the column will be lost.
  - You are about to drop the column `heureFin` on the `Planning` table. All the data in the column will be lost.
  - You are about to drop the column `dateValidation` on the `Remplacement` table. All the data in the column will be lost.
  - You are about to drop the column `validé` on the `Remplacement` table. All the data in the column will be lost.
  - Made the column `moment` on table `Planning` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Remplacement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_absenceId_fkey`;

-- DropForeignKey
ALTER TABLE `Remplacement` DROP FOREIGN KEY `Remplacement_remplaceId_fkey`;

-- DropIndex
DROP INDEX `Remplacement_remplaceId_key` ON `Remplacement`;

-- AlterTable
ALTER TABLE `Planning` DROP COLUMN `heureDebut`,
    DROP COLUMN `heureFin`,
    MODIFY `moment` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Remplacement` DROP COLUMN `dateValidation`,
    DROP COLUMN `validé`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'En cours',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


