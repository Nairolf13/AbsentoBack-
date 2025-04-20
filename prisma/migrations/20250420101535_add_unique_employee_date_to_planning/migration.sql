/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,date]` on the table `Planning` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Planning_employeeId_date_key` ON `Planning`(`employeeId`, `date`);
