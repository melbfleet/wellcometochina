CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`coverImage` varchar(512),
	`introductionTitle` varchar(200),
	`introductionDescription` text,
	`cityCardImage` varchar(512),
	`culinaryTravelLargeImage` varchar(512),
	`culinaryTravelLargeTitle` varchar(200),
	`culinaryTravelLargeDescription` text,
	`culinaryTravelSmall1Image` varchar(512),
	`culinaryTravelSmall1Title` varchar(200),
	`culinaryTravelSmall1Description` text,
	`culinaryTravelSmall2Image` varchar(512),
	`culinaryTravelSmall2Title` varchar(200),
	`culinaryTravelSmall2Description` text,
	`ctaBgColor` varchar(7) DEFAULT '#a84900',
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `city_experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`experienceId` int NOT NULL,
	`displayImage` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `city_experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `city_what_to_see` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`experienceId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `city_what_to_see_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL DEFAULT '',
	`email` varchar(320) NOT NULL,
	`phone` varchar(64) NOT NULL,
	`destination` text,
	`month` varchar(32),
	`year` varchar(16),
	`duration` varchar(64),
	`groupSize` varchar(32),
	`budget` varchar(64),
	`hearAboutUs` varchar(128),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experienceId` int NOT NULL,
	`description` text,
	`imageUrl` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experience_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_labels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experienceId` int NOT NULL,
	`label` varchar(100) NOT NULL,
	CONSTRAINT `experience_labels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experienceId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `experience_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`coverImage` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experience_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`typeId` int,
	`cityId` int,
	`name` varchar(200) NOT NULL,
	`title` varchar(200),
	`slug` varchar(200) NOT NULL,
	`when` varchar(200),
	`price` varchar(100),
	`duration` varchar(100),
	`gallery` text,
	`description` text,
	`ctaBgColor` varchar(7) DEFAULT '#1a1a1a',
	`recommendationImage` varchar(512),
	`recommendationTitle` varchar(200),
	`recommendationDescription` text,
	`cityDisplayImage` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`),
	CONSTRAINT `experiences_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storagePath` varchar(512) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`category` varchar(50),
	`description` text,
	`uploadedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itineraries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`shortDescription` varchar(500),
	`description` text,
	`coverImage` varchar(512),
	`days` int NOT NULL DEFAULT 1,
	`price` varchar(50),
	`difficulty` enum('easy','medium','hard') DEFAULT 'easy',
	`maxPeople` int,
	`details` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `itineraries_id` PRIMARY KEY(`id`),
	CONSTRAINT `itineraries_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `itinerary_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `itinerary_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(512) NOT NULL,
	`storageKey` varchar(512),
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`source` varchar(50),
	`sourceId` int,
	`sourceLabel` varchar(200),
	`sourceUrl` varchar(512),
	`assetType` enum('logo','banner','cta','general') NOT NULL DEFAULT 'general',
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`content` text,
	`coverImage` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `story_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `story_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('city','experience_type','other') NOT NULL DEFAULT 'other',
	`color` varchar(7) DEFAULT '#888888',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`role` varchar(200) NOT NULL,
	`bio1` text,
	`bio2` text,
	`quote` text,
	`image` varchar(512),
	`specialty` varchar(255),
	`storyTitle` varchar(200),
	`storySubtitle` varchar(200),
	`storyText` text,
	`storyImage` varchar(512),
	`storyImage2` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `video_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`videoUrl` varchar(512) NOT NULL,
	`coverImage` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`),
	CONSTRAINT `videos_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','editor') NOT NULL DEFAULT 'user';