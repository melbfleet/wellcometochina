ALTER TABLE `experience_types` ADD `slug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `experience_types` ADD CONSTRAINT `experience_types_slug_unique` UNIQUE(`slug`);