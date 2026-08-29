ALTER TABLE `media_assets`
  MODIFY `assetType` enum('logo','icon','banner','cta','page_bg','general') NOT NULL DEFAULT 'general';
