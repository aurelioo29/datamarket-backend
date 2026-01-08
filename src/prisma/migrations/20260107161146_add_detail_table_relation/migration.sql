-- CreateTable
CREATE TABLE `Dataset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `short_desc` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `domain` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'IDR',
    `thumbnail` VARCHAR(191) NULL,
    `sample_url` VARCHAR(191) NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `tags` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Dataset_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `datasetId` INTEGER NOT NULL,
    `price_paid` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'IDR',
    `order_id` VARCHAR(191) NOT NULL,
    `payment_ref` VARCHAR(191) NULL,
    `payment_type` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `license_code` VARCHAR(191) NOT NULL,
    `download_count` INTEGER NOT NULL DEFAULT 0,
    `last_download_at` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Purchase_order_id_key`(`order_id`),
    UNIQUE INDEX `Purchase_license_code_key`(`license_code`),
    INDEX `Purchase_userId_datasetId_idx`(`userId`, `datasetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `OtpCode_userId_type_idx` ON `OtpCode`(`userId`, `type`);

-- AddForeignKey
ALTER TABLE `Dataset` ADD CONSTRAINT `Dataset_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_datasetId_fkey` FOREIGN KEY (`datasetId`) REFERENCES `Dataset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
