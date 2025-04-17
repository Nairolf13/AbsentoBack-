-- CreateTable
CREATE TABLE `Entreprise` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `siret` VARCHAR(191) NOT NULL,
    `secteur` VARCHAR(191) NULL,
    `taille` VARCHAR(191) NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `emailContact` VARCHAR(191) NOT NULL,
    `responsableNom` VARCHAR(191) NOT NULL,
    `responsablePrenom` VARCHAR(191) NOT NULL,
    `emailResponsable` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Entreprise_siret_key`(`siret`),
    UNIQUE INDEX `Entreprise_emailResponsable_key`(`emailResponsable`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `dateNaissance` DATETIME(3) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `poste` VARCHAR(191) NOT NULL,
    `role` ENUM('EMPLOYE', 'MANAGER', 'RH', 'ADMIN') NOT NULL DEFAULT 'EMPLOYE',
    `entrepriseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Disponibilite` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `jour` ENUM('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE') NOT NULL,
    `heureDebut` VARCHAR(191) NOT NULL,
    `heureFin` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absence` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `type` ENUM('MALADIE', 'CONGE', 'RTT', 'AUTRE') NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'VALIDEE', 'REFUSEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Justificatif` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `absenceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Justificatif_absenceId_key`(`absenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remplacement` (
    `id` VARCHAR(191) NOT NULL,
    `absenceId` VARCHAR(191) NOT NULL,
    `remplacantId` VARCHAR(191) NOT NULL,
    `remplaceId` VARCHAR(191) NOT NULL,
    `validé` BOOLEAN NOT NULL DEFAULT false,
    `dateValidation` DATETIME(3) NULL,

    UNIQUE INDEX `Remplacement_absenceId_key`(`absenceId`),
    UNIQUE INDEX `Remplacement_remplaceId_key`(`remplaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Justificatif` ADD CONSTRAINT `Justificatif_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_absenceId_fkey` FOREIGN KEY (`absenceId`) REFERENCES `Absence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplacantId_fkey` FOREIGN KEY (`remplacantId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remplacement` ADD CONSTRAINT `Remplacement_remplaceId_fkey` FOREIGN KEY (`remplaceId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
