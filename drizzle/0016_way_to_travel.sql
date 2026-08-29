CREATE TABLE IF NOT EXISTS `way_to_travel_types` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `coverImage` varchar(512),
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `way_to_travel_types_id` PRIMARY KEY (`id`),
  CONSTRAINT `way_to_travel_types_slug_unique` UNIQUE (`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ways_to_travel` (
  `id` int AUTO_INCREMENT NOT NULL,
  `typeId` int,
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
  `isActive` boolean NOT NULL DEFAULT true,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `ways_to_travel_id` PRIMARY KEY (`id`),
  CONSTRAINT `ways_to_travel_slug_unique` UNIQUE (`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `way_to_travel_details` (
  `id` int AUTO_INCREMENT NOT NULL,
  `wayToTravelId` int NOT NULL,
  `title` varchar(255),
  `description` text,
  `imageUrl` varchar(512),
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `way_to_travel_details_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `way_to_travel_labels` (
  `id` int AUTO_INCREMENT NOT NULL,
  `wayToTravelId` int NOT NULL,
  `label` varchar(100) NOT NULL,
  CONSTRAINT `way_to_travel_labels_id` PRIMARY KEY (`id`)
);
