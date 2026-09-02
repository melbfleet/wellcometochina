CREATE TABLE IF NOT EXISTS `homepage_cta_settings` (
  `id` int NOT NULL DEFAULT 1,
  `title` varchar(255) NOT NULL DEFAULT 'So, ready to start?',
  `buttonText` varchar(100) NOT NULL DEFAULT 'Get in Touch',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
--> statement-breakpoint
INSERT IGNORE INTO `homepage_cta_settings` (`id`, `title`, `buttonText`)
VALUES (1, 'So, ready to start?', 'Get in Touch');
