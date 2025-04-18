-- Ajout du champ passwordToken et passwordTokenExpires à la table Utilisateur
ALTER TABLE `Utilisateur`
ADD COLUMN `passwordToken` VARCHAR(255),
ADD COLUMN `passwordTokenExpires` DATETIME;
