CREATE TABLE `homepage_story_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionType` enum('image','video') NOT NULL,
	`title` varchar(300) NOT NULL DEFAULT 'Stories From the Road',
	`subtitle` varchar(500) NOT NULL DEFAULT 'Real stories. Meaningful journeys.',
	`isVisible` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_story_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepage_story_sections_sectionType_unique` UNIQUE(`sectionType`)
);
--> statement-breakpoint
ALTER TABLE `homepage_stories` ADD `type` enum('image','video') DEFAULT 'video' NOT NULL;