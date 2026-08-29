CREATE TABLE IF NOT EXISTS `site_contact_settings` (
  `id` int NOT NULL DEFAULT 1,
  `addressLabel` varchar(160) NOT NULL,
  `address` text NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `phoneAvailabilityText` varchar(255) NOT NULL,
  `officeHours` json NOT NULL,
  `officeHoursNote` varchar(255) NOT NULL,
  `socialLinks` json NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `site_contact_settings_id` PRIMARY KEY (`id`)
);
