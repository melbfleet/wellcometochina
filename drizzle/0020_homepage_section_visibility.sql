CREATE TABLE IF NOT EXISTS `homepage_section_visibility` (
  `sectionKey` varchar(64) NOT NULL,
  `isVisible` boolean NOT NULL DEFAULT true,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `homepage_section_visibility_sectionKey` PRIMARY KEY (`sectionKey`)
);
--> statement-breakpoint
INSERT IGNORE INTO `homepage_section_visibility` (`sectionKey`, `isVisible`) VALUES
  ('plan_your_trip', true),
  ('explore_trips', true),
  ('why_us', true),
  ('ready_to_start', true);
