-- CreateTable
CREATE TABLE `Payment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PAYMENT_DETECTED') NOT NULL DEFAULT 'PENDING',
    `rawNotification` JSON NULL,
    `detectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_status_amount_idx`(`status`, `amount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QrisNotification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `signature` VARCHAR(255) NOT NULL,
    `amount` INTEGER NOT NULL,
    `receivedAt` BIGINT NOT NULL,
    `rawPayload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `QrisNotification_signature_key`(`signature`),
    INDEX `QrisNotification_amount_receivedAt_idx`(`amount`, `receivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

