-- AlterTable
ALTER TABLE `AccessCode` ADD COLUMN `createdById` BIGINT NULL;

-- CreateIndex
CREATE INDEX `AccessCode_createdById_idx` ON `AccessCode`(`createdById`);

-- AddForeignKey
ALTER TABLE `AccessCode` ADD CONSTRAINT `AccessCode_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
