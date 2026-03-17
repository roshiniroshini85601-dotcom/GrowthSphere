-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT 'changeme123',
    `contactNo` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'INTERN', 'MENTOR', 'NOT_MENTOR', 'NOT_EMPLOYEE') NOT NULL DEFAULT 'NOT_EMPLOYEE',
    `address` VARCHAR(191) NULL,
    `collegeName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `flagged` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentorMentee` (
    `id` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `menteeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MentorMentee_mentorId_menteeId_key`(`mentorId`, `menteeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopicMilestone` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `link` VARCHAR(191) NULL,
    `topicId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InternMilestone` (
    `id` VARCHAR(191) NOT NULL,
    `internId` VARCHAR(191) NOT NULL,
    `milestoneId` VARCHAR(191) NOT NULL,
    `dateAssigned` DATETIME(3) NOT NULL,
    `internStatus` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `InternMilestone_internId_milestoneId_key`(`internId`, `milestoneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `internId` VARCHAR(191) NOT NULL,
    `dateReviewed` DATETIME(3) NOT NULL,
    `status` ENUM('COMPLETED', 'REOPENED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `reviewerId` VARCHAR(191) NOT NULL,
    `feedback` JSON NOT NULL,
    `internStatus` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `internId` VARCHAR(191) NOT NULL,
    `dateReviewed` DATETIME(3) NOT NULL,
    `status` ENUM('COMPLETED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `reviewerId` VARCHAR(191) NOT NULL,
    `feedback` JSON NOT NULL,
    `internStatus` BOOLEAN NOT NULL DEFAULT false,
    `milestoneIds` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorMentee` ADD CONSTRAINT `MentorMentee_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorMentee` ADD CONSTRAINT `MentorMentee_menteeId_fkey` FOREIGN KEY (`menteeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopicMilestone` ADD CONSTRAINT `TopicMilestone_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternMilestone` ADD CONSTRAINT `InternMilestone_internId_fkey` FOREIGN KEY (`internId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternMilestone` ADD CONSTRAINT `InternMilestone_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `TopicMilestone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_internId_fkey` FOREIGN KEY (`internId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_internId_fkey` FOREIGN KEY (`internId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
