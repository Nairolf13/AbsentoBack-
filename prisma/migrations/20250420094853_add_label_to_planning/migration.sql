-- DropForeignKey
ALTER TABLE `Planning` DROP FOREIGN KEY `Planning_absenceId_fkey`;

-- DropIndex
DROP INDEX `Planning_absenceId_fkey` ON `Planning`;

-- AlterTable
ALTER TABLE `Planning` ADD COLUMN `label` VARCHAR(191) NULL,
    MODIFY `replaceEmployeeId` INTEGER NULL,
    MODIFY `absenceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
