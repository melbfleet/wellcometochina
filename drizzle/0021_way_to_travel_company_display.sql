ALTER TABLE `ways_to_travel`
  ADD COLUMN IF NOT EXISTS `isCompanyDisplay` boolean NOT NULL DEFAULT false AFTER `recommendationDescription`;
--> statement-breakpoint
ALTER TABLE `way_to_travel_details`
  ADD COLUMN IF NOT EXISTS `exploreUrl` varchar(512) NULL AFTER `imageUrl`;
