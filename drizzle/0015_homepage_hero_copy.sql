ALTER TABLE `homepage_hero`
  ALTER COLUMN `title` SET DEFAULT 'The Immersive China Experts',
  ALTER COLUMN `subtitle` SET DEFAULT 'Tailor-made experiences, crafted with local insight.';

UPDATE `homepage_hero`
SET
  `title` = 'The Immersive China Experts',
  `subtitle` = 'Tailor-made experiences, crafted with local insight.'
WHERE
  `title` = 'THE LUXURY TRAVEL EXPERTS'
  AND `subtitle` = 'TAILOR-MADE TRIPS, AWARD WINNING SERVICE. EST. 2005.';
