CREATE TABLE `homepage_hero` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`backgroundImage` varchar(512),
	`title` varchar(300) NOT NULL DEFAULT 'THE LUXURY TRAVEL EXPERTS',
	`subtitle` varchar(500) NOT NULL DEFAULT 'TAILOR-MADE TRIPS, AWARD WINNING SERVICE. EST. 2005.',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_hero_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_intro` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`title` varchar(300) NOT NULL DEFAULT 'THE LUXURY TRAVEL EXPERTS',
	`content` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_intro_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_sponsors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`name` varchar(200) NOT NULL,
	`logo` varchar(512) NOT NULL,
	`url` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_sponsors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`name` varchar(200) NOT NULL,
	`videoId` varchar(50),
	`image` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_stories_id` PRIMARY KEY(`id`)
);
