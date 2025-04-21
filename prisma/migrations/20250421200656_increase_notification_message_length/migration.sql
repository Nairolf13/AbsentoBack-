-- AlterTable
ALTER TABLE `Notification` MODIFY `message` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplaceId_fkey` FOREIGN KEY (`remplaceId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
