ALTER TABLE `cities`
  ADD COLUMN IF NOT EXISTS `ctaTitle` varchar(255) NULL DEFAULT 'So, ready to start?' AFTER `ctaBgColor`,
  ADD COLUMN IF NOT EXISTS `ctaButtonText` varchar(100) NULL DEFAULT 'Get in Touch' AFTER `ctaTitle`,
  ADD COLUMN IF NOT EXISTS `ctaButtonUrl` varchar(512) NULL DEFAULT '/make-an-enquiry' AFTER `ctaButtonText`;
--> statement-breakpoint
ALTER TABLE `experiences`
  ADD COLUMN IF NOT EXISTS `ctaTitle` varchar(255) NULL DEFAULT 'So, ready to start?' AFTER `ctaBgColor`,
  ADD COLUMN IF NOT EXISTS `ctaButtonText` varchar(100) NULL DEFAULT 'Get in Touch' AFTER `ctaTitle`,
  ADD COLUMN IF NOT EXISTS `ctaButtonUrl` varchar(512) NULL DEFAULT '/make-an-enquiry' AFTER `ctaButtonText`;
--> statement-breakpoint
ALTER TABLE `ways_to_travel`
  ADD COLUMN IF NOT EXISTS `ctaTitle` varchar(255) NULL DEFAULT 'So, ready to start?' AFTER `ctaBgColor`,
  ADD COLUMN IF NOT EXISTS `ctaButtonText` varchar(100) NULL DEFAULT 'Get in Touch' AFTER `ctaTitle`,
  ADD COLUMN IF NOT EXISTS `ctaButtonUrl` varchar(512) NULL DEFAULT '/make-an-enquiry' AFTER `ctaButtonText`;
