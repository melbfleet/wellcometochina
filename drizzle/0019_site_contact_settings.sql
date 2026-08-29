CREATE TABLE IF NOT EXISTS `site_contact_settings` (
  `id` int NOT NULL DEFAULT 1,
  `addressLabel` varchar(160) NOT NULL DEFAULT 'Address Chengdu',
  `address` text NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `phoneAvailabilityText` varchar(255) NOT NULL DEFAULT 'We''re open at 9.00am',
  `officeHours` json NOT NULL,
  `officeHoursNote` varchar(255) NOT NULL DEFAULT '(excluding national holidays)',
  `socialLinks` json NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `site_contact_settings_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
INSERT IGNORE INTO `site_contact_settings` (
  `id`, `addressLabel`, `address`, `email`, `phone`, `phoneAvailabilityText`, `officeHours`, `officeHoursNote`, `socialLinks`
) VALUES (
  1,
  'Address Chengdu',
  '26th Floor, No. 1-2 Hangkong Road,\nWuhou District, Chengdu, Sichuan',
  'info@wellcometochina.com',
  '+86 130 0812 2836',
  'We''re open at 9.00am',
  JSON_ARRAY(
    JSON_OBJECT('day', 'Monday', 'hours', '2:00pm - 5:30pm'),
    JSON_OBJECT('day', 'Tuesday', 'hours', '9:00am - 11:00pm'),
    JSON_OBJECT('day', 'Wednesday', 'hours', '9:00am - 11:00pm'),
    JSON_OBJECT('day', 'Thursday', 'hours', '9:00am - 11:00pm'),
    JSON_OBJECT('day', 'Friday', 'hours', '9:00am - 11:00pm'),
    JSON_OBJECT('day', 'Saturday', 'hours', 'Closed'),
    JSON_OBJECT('day', 'Sunday', 'hours', 'Closed')
  ),
  '(excluding national holidays)',
  JSON_ARRAY(
    JSON_OBJECT('platform', 'YouTube', 'url', '', 'isVisible', TRUE),
    JSON_OBJECT('platform', 'TikTok', 'url', '', 'isVisible', TRUE),
    JSON_OBJECT('platform', 'Instagram', 'url', '', 'isVisible', TRUE),
    JSON_OBJECT('platform', 'Facebook', 'url', '', 'isVisible', TRUE)
  )
);
