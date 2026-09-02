CREATE TABLE IF NOT EXISTS `way_to_travel_link_clicks` (
  `detailId` int NOT NULL,
  `wayToTravelId` int NOT NULL,
  `blockTitle` varchar(255) NULL,
  `targetUrl` varchar(512) NOT NULL,
  `clickCount` int NOT NULL DEFAULT 0,
  `lastClickedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`detailId`),
  INDEX `way_to_travel_link_clicks_wayToTravelId_idx` (`wayToTravelId`),
  INDEX `way_to_travel_link_clicks_clickCount_idx` (`clickCount`)
);
