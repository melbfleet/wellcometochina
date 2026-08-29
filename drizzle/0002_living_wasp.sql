ALTER TABLE `itineraries` MODIFY COLUMN `price` varchar(100);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `place` varchar(200);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `bannerImage` varchar(512);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `overviewTitle` varchar(300);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `when` varchar(200);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `howLong` varchar(200);--> statement-breakpoint
ALTER TABLE `itineraries` ADD `sections` json;--> statement-breakpoint
ALTER TABLE `itineraries` DROP COLUMN `difficulty`;--> statement-breakpoint
ALTER TABLE `itineraries` DROP COLUMN `maxPeople`;--> statement-breakpoint
ALTER TABLE `itineraries` DROP COLUMN `details`;