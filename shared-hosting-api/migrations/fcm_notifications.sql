-- ============================================================
-- Yarana LifeOS — FCM Notifications DB Migration
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================================

-- 1. FCM tokens table (one per user device)
CREATE TABLE IF NOT EXISTS `fcm_tokens` (
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `user_id`    INT          NOT NULL,
    `token`      TEXT         NOT NULL,
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Add notification_sent flag to tasks (prevents duplicate notifications)
ALTER TABLE `tasks` 
    ADD COLUMN IF NOT EXISTS `notification_sent` TINYINT(1) NOT NULL DEFAULT 0;

-- 3. Index for cron query performance
CREATE INDEX IF NOT EXISTS `idx_tasks_reminder` 
    ON `tasks` (`reminder_time`, `status`, `notification_sent`);
