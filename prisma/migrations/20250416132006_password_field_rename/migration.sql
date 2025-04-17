/*
  Warnings:

  - You are about to drop the column `motDePasse` on the `Utilisateur` table. All the data in the column will be lost.
  - Added the required column `password` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Utilisateur` DROP COLUMN `motDePasse`,
    ADD COLUMN `password` VARCHAR(191) NOT NULL;
