import mysql from 'mysql2/promise';

const DB_URL = process.env.DATABASE_URL;
const url = new URL(DB_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : undefined,
};

// Real uploaded image URLs
const IMGS = [
  '/manus-storage/1_ab07961c.jpg',
  '/manus-storage/2_e2f01ccb.jpg',
  '/manus-storage/3_3795ad92.jpg',
  '/manus-storage/4_c9e77511.jpg',
  '/manus-storage/1108913c1c7fc2cb4ee2b2b5bd6ee5abb96601fdd53188e0b3dabed17aa788a9_c973712f.jpg',
  '/manus-storage/15a15f98d17a11c3b40735de5640cf7f7dac4396aaa04748cdd2a9e917cb8916_a85355a3.jpg',
  '/manus-storage/202ca49a7b3351f17af64f9ca5f41c10e9d5999ea868bd1bd2346d2c33c12236_872835a3.jpg',
  '/manus-storage/235854abfc484b2bd38aca22a88892e939e42da2be2ff509bbda2d6ec98a9b77_a08dcaf4.jpg',
  '/manus-storage/250679d2799ec6870f66a125d9d41bc2278fada09d87f4e0b85991be5f7d0948_8fb95eee.jpg',
  '/manus-storage/283f752828f08f0458835888361a313aae2b5a293b3f52dedf82032c10c2938a_abc8258e.jpg',
  '/manus-storage/29f60e5cab0fdbad2fb29ffc908b8166203c5abde8f1f2b74e6458b3c512f21e_90207dce.jpg',
  '/manus-storage/31b2f88272f2d000d30edf5e48338c40c58f0ba1fbb41e6f7573fcf464f42a2c_2ec90f4a.jpg',
  '/manus-storage/33df212cad32187fc4d6e94ddade29b4c0c28c7570fb98ad9f23d47e28a49dd7_fed2843b.jpg',
  '/manus-storage/3772a9be4d8e22d1d18c890c9df1f6f2154d842c7da46feef4d4088ecef959a9_5f3f73d4.jpg',
  '/manus-storage/004ecc3f4bb41300ac803c02c8f95bc3f395e4d2659671e5851a8f41cc030f2b_ec207b2c.jpg',
];

const img = (i) => IMGS[i % IMGS.length];
const gallery = (start) => JSON.stringify([img(start), img(start+1), img(start+2), img(start+3), img(start+4)]);

const conn = await mysql.createConnection(config);
console.log('Connected to database');

// Clear existing data
await conn.query('SET FOREIGN_KEY_CHECKS=0');
await conn.query('TRUNCATE TABLE city_what_to_see');
await conn.query('TRUNCATE TABLE city_experiences');
await conn.query('TRUNCATE TABLE experience_details');
await conn.query('TRUNCATE TABLE experience_tags');
await conn.query('TRUNCATE TABLE experiences');
await conn.query('TRUNCATE TABLE experience_types');
await conn.query('TRUNCATE TABLE cities');
await conn.query('TRUNCATE TABLE tags');
await conn.query('SET FOREIGN_KEY_CHECKS=1');
console.log('Cleared existing data');

// ─── 1. Tags ─────────────────────────────────────────────────────────────────
const [tagResult] = await conn.query(
  `INSERT INTO tags (name, slug, color, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
  ['Cultural Heritage', 'cultural-heritage', '#D4A853', 1, 1]
);
const tagId = tagResult.insertId;
console.log('Created tag:', tagId);

// ─── 2. Experience Type ───────────────────────────────────────────────────────
const [typeResult] = await conn.query(
  `INSERT INTO experience_types (name, cover_image, sort_order, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
  ['Cultural Experiences', img(0), 1]
);
const typeId = typeResult.insertId;
console.log('Created experience type:', typeId);

// ─── 3. Cities ───────────────────────────────────────────────────────────────
const citiesData = [
  {
    name: 'Chengdu',
    slug: 'chengdu',
    description: 'Chengdu, the capital of Sichuan Province, is a vibrant city known for its relaxed lifestyle, spicy cuisine, and as the home of the giant panda. With a history spanning over 2,000 years, it blends ancient culture with modern innovation.',
    coverImage: img(0),
    cityCardImage: img(1),
    introductionTitle: 'Welcome to Chengdu',
    introductionDescription: 'Discover the heart of Sichuan — a city where ancient teahouses sit beside modern art galleries, where the aroma of hot pot fills the streets, and where giant pandas roam in bamboo forests just minutes from the city center.',
    culinaryTravelLargeImage: img(2),
    culinaryTravelLargeTitle: 'The Flavors of Sichuan',
    culinaryTravelLargeDescription: 'Sichuan cuisine is renowned worldwide for its bold, pungent flavors and the unique numbing sensation of Sichuan peppercorns. From street-side skewers to elaborate banquet dishes, every meal in Chengdu is an adventure.',
    culinaryTravelSmall1Image: img(3),
    culinaryTravelSmall1Title: 'Hot Pot Culture',
    culinaryTravelSmall1Description: 'No visit to Chengdu is complete without experiencing the communal joy of hot pot — a bubbling cauldron of spicy broth where friends gather to cook and share.',
    culinaryTravelSmall2Image: img(4),
    culinaryTravelSmall2Title: 'Street Food Paradise',
    culinaryTravelSmall2Description: 'Wander through Jinli Ancient Street and Kuanzhai Alley to discover an endless array of local snacks, from dan dan noodles to rabbit heads.',
    ctaBgColor: '#8B2635',
    sortOrder: 1,
    isActive: 1,
  },
  {
    name: 'Xi\'an',
    slug: 'xian',
    description: 'Xi\'an, one of the oldest cities in China, served as the capital for 13 dynasties. Home to the legendary Terracotta Army and the ancient Silk Road, Xi\'an offers an unparalleled journey through Chinese history and culture.',
    coverImage: img(5),
    cityCardImage: img(6),
    introductionTitle: 'Welcome to Xi\'an',
    introductionDescription: 'Step back in time in Xi\'an, where the ancient city walls still stand tall, the Muslim Quarter buzzes with life, and the Terracotta Warriors stand guard over an emperor\'s eternal domain.',
    culinaryTravelLargeImage: img(7),
    culinaryTravelLargeTitle: 'Silk Road Flavors',
    culinaryTravelLargeDescription: 'Xi\'an\'s cuisine reflects its position as the eastern terminus of the Silk Road, blending Chinese and Central Asian influences into a unique culinary tradition that has evolved over millennia.',
    culinaryTravelSmall1Image: img(8),
    culinaryTravelSmall1Title: 'Muslim Quarter Delights',
    culinaryTravelSmall1Description: 'The Muslim Quarter is a sensory feast of sizzling lamb skewers, freshly pulled noodles, and the sweet aroma of persimmon cakes.',
    culinaryTravelSmall2Image: img(9),
    culinaryTravelSmall2Title: 'Biangbiang Noodles',
    culinaryTravelSmall2Description: 'Xi\'an\'s signature dish — wide, hand-pulled noodles topped with chili oil and vinegar — is a must-try that embodies the bold spirit of Shaanxi cuisine.',
    ctaBgColor: '#4A3728',
    sortOrder: 2,
    isActive: 1,
  },
];

const cityIds = [];
for (const city of citiesData) {
  const [r] = await conn.query(
    `INSERT INTO cities (name, slug, description, cover_image, city_card_image, introduction_title, introduction_description,
      culinary_travel_large_image, culinary_travel_large_title, culinary_travel_large_description,
      culinary_travel_small1_image, culinary_travel_small1_title, culinary_travel_small1_description,
      culinary_travel_small2_image, culinary_travel_small2_title, culinary_travel_small2_description,
      cta_bg_color, sort_order, is_active, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [
      city.name, city.slug, city.description, city.coverImage, city.cityCardImage,
      city.introductionTitle, city.introductionDescription,
      city.culinaryTravelLargeImage, city.culinaryTravelLargeTitle, city.culinaryTravelLargeDescription,
      city.culinaryTravelSmall1Image, city.culinaryTravelSmall1Title, city.culinaryTravelSmall1Description,
      city.culinaryTravelSmall2Image, city.culinaryTravelSmall2Title, city.culinaryTravelSmall2Description,
      city.ctaBgColor, city.sortOrder, city.isActive,
    ]
  );
  cityIds.push(r.insertId);
  console.log(`Created city: ${city.name} (id: ${r.insertId})`);
}

// ─── 4. Experiences ───────────────────────────────────────────────────────────
const experiencesData = [
  {
    name: 'Tea Culture Immersion',
    title: 'Discover the Ancient Art of Chinese Tea',
    slug: 'tea-culture-immersion',
    typeId,
    cityId: cityIds[0],
    description: 'Immerse yourself in the centuries-old tradition of Chinese tea culture in the heart of Chengdu. Visit historic teahouses in People\'s Park, learn the art of gongfu tea ceremony from a master, and explore the diverse world of Chinese teas from Sichuan\'s finest gardens.',
    when: 'Year-round, best in spring (March-May) during new harvest season',
    price: 'From $85 per person',
    duration: 'Full day (8 hours)',
    recommendationTitle: 'Why We Recommend This Experience',
    recommendationDescription: 'Tea culture is the soul of Chengdu\'s social life. This immersive experience takes you beyond the tourist trail into authentic teahouses where locals spend their afternoons playing mahjong and sipping tea. You\'ll leave with a deep appreciation for this living tradition.',
    recommendationImage: img(10),
    cityDisplayImage: img(11),
    gallery: gallery(0),
    ctaBgColor: '#2D5A3D',
    sortOrder: 1,
    isActive: 1,
  },
  {
    name: 'Terracotta Warriors Discovery',
    title: 'Face to Face with China\'s Ancient Army',
    slug: 'terracotta-warriors-discovery',
    typeId,
    cityId: cityIds[1],
    description: 'Stand face to face with thousands of life-sized terracotta soldiers, horses, and chariots that have guarded Emperor Qin Shi Huang\'s tomb for over 2,200 years. This private guided experience goes beyond the standard tour, offering exclusive access and expert insights into one of the world\'s greatest archaeological discoveries.',
    when: 'Year-round, avoid Chinese national holidays for smaller crowds',
    price: 'From $120 per person',
    duration: 'Full day (9 hours)',
    recommendationTitle: 'An Unmissable World Wonder',
    recommendationDescription: 'The Terracotta Army is not just a historical site — it\'s a window into the ambitions and artistry of ancient China. Our expert guides bring the warriors to life with stories of the craftsmen who created them and the emperor who ordered their creation.',
    recommendationImage: img(12),
    cityDisplayImage: img(13),
    gallery: gallery(5),
    ctaBgColor: '#8B4513',
    sortOrder: 2,
    isActive: 1,
  },
];

const expIds = [];
for (const exp of experiencesData) {
  const [r] = await conn.query(
    `INSERT INTO experiences (name, title, slug, type_id, city_id, description, \`when\`, price, duration,
      recommendation_title, recommendation_description, recommendation_image, city_display_image,
      gallery, cta_bg_color, sort_order, is_active, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [
      exp.name, exp.title, exp.slug, exp.typeId, exp.cityId, exp.description,
      exp.when, exp.price, exp.duration,
      exp.recommendationTitle, exp.recommendationDescription, exp.recommendationImage, exp.cityDisplayImage,
      exp.gallery, exp.ctaBgColor, exp.sortOrder, exp.isActive,
    ]
  );
  expIds.push(r.insertId);
  console.log(`Created experience: ${exp.name} (id: ${r.insertId})`);

  // Add experience tag
  await conn.query(
    `INSERT INTO experience_tags (experience_id, tag_id) VALUES (?, ?)`,
    [r.insertId, tagId]
  );
}

// ─── 5. City-Experience Links ─────────────────────────────────────────────────
for (let i = 0; i < expIds.length; i++) {
  await conn.query(
    `INSERT INTO city_experiences (city_id, experience_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
    [cityIds[i], expIds[i], i + 1]
  );
}
console.log('Created city-experience links');

// ─── 6. Experience Details (Detail Blocks) ────────────────────────────────────
const detailsData = [
  // Experience 1 - Tea Culture
  { expId: expIds[0], title: 'Morning: Teahouse Visit in People\'s Park', content: 'Begin your day at one of Chengdu\'s most beloved teahouses, nestled within the serene grounds of People\'s Park. Watch as locals settle in for a morning of tea, conversation, and ear-cleaning — a uniquely Chengdu tradition. Your guide will introduce you to the teahouse culture and help you order your first cup of locally grown green tea.', image: img(0), sortOrder: 1 },
  { expId: expIds[0], title: 'Afternoon: Gongfu Tea Ceremony Masterclass', content: 'In the afternoon, you\'ll participate in a hands-on gongfu tea ceremony led by a certified tea master. Learn the precise movements and timing required to brew the perfect cup, understand the significance of each step, and discover how to identify high-quality teas by sight, smell, and taste. You\'ll sample six different varieties of tea, each with its own story and character.', image: img(1), sortOrder: 2 },
  { expId: expIds[0], title: 'Evening: Tea Garden Sunset Walk', content: 'As the day draws to a close, take a leisurely walk through a traditional tea garden on the outskirts of the city. Watch the sunset paint the bamboo groves in golden light, and enjoy a final cup of aged pu\'er tea as your guide shares the philosophy behind Chinese tea culture — the idea that a good cup of tea, like a good life, requires patience, attention, and care.', image: img(2), sortOrder: 3 },
  // Experience 2 - Terracotta Warriors
  { expId: expIds[1], title: 'Pit 1: The Grand Army', content: 'Enter the largest and most impressive of the three excavated pits, where over 6,000 warriors stand in battle formation. Marvel at the sheer scale of this underground army and notice the remarkable individuality of each figure — no two faces are exactly alike. Your expert guide will explain the military hierarchy represented by the warriors\' different uniforms and positions.', image: img(5), sortOrder: 1 },
  { expId: expIds[1], title: 'Pit 2 & 3: The Command Center', content: 'Explore Pits 2 and 3, which housed the cavalry, archers, and the command headquarters of the terracotta army. See the intricate details of the horses and chariots, and examine the bronze weapons — many still sharp after 2,200 years — that the warriors were equipped with. The museum\'s conservation laboratory offers a rare glimpse into the ongoing work of archaeologists.', image: img(6), sortOrder: 2 },
  { expId: expIds[1], title: 'Emperor Qin\'s Legacy', content: 'Conclude your visit with a comprehensive tour of the museum\'s exhibition halls, which trace the life and reign of Emperor Qin Shi Huang — the man who unified China, built the Great Wall, and created this extraordinary tomb complex. Learn about the thousands of craftsmen who spent their lives creating the terracotta army, and the historical significance of this UNESCO World Heritage Site.', image: img(7), sortOrder: 3 },
];

for (const detail of detailsData) {
  await conn.query(
    `INSERT INTO experience_details (experience_id, title, content, image, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,NOW(),NOW())`,
    [detail.expId, detail.title, detail.content, detail.image, detail.sortOrder]
  );
}
console.log('Created experience details');

// ─── 7. City What to See ──────────────────────────────────────────────────────
for (let i = 0; i < expIds.length; i++) {
  await conn.query(
    `INSERT INTO city_what_to_see (city_id, experience_id, sort_order, created_at, updated_at) VALUES (?,?,?,NOW(),NOW())`,
    [cityIds[i], expIds[i], 1]
  );
}
console.log('Created city what to see');

await conn.end();
console.log('\n✅ All data generated successfully!');
console.log('Cities:', cityIds);
console.log('Experiences:', expIds);
