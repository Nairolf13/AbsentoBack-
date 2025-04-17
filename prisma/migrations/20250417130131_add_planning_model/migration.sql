-- CreateTable
CREATE TABLE `Planning` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `moment` VARCHAR(191) NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `replaceEmployeeId` INTEGER NOT NULL,
    `absenceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_replaceEmployeeId_fkey` FOREIGN KEY (`replaceEmployeeId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Planning` ADD CONSTRAINT `Planning_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
