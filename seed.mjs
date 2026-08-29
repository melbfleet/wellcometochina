import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname, port: parseInt(url.port) || 4000,
  user: url.username, password: url.password,
  database: url.pathname.slice(1), ssl: { rejectUnauthorized: true },
});

const I = [
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
const g = (s) => JSON.stringify([I[s%15],I[(s+1)%15],I[(s+2)%15],I[(s+3)%15],I[(s+4)%15]]);

// Clear all tables
await conn.query('SET FOREIGN_KEY_CHECKS=0');
for (const t of ['city_what_to_see','city_experiences','experience_details','experience_tags','experiences','experience_types','cities','tags']) {
  await conn.query(`DELETE FROM ${t}`);
}
await conn.query('SET FOREIGN_KEY_CHECKS=1');
console.log('Cleared');

// Check tags table columns
const [tagCols] = await conn.query('DESCRIBE tags');
console.log('tags columns:', tagCols.map(c => c.Field).join(', '));

// Check experiences table columns
const [expCols] = await conn.query('DESCRIBE experiences');
console.log('experiences columns:', expCols.map(c => c.Field).join(', '));

// Tag
const [tr] = await conn.query(`INSERT INTO tags (name, type, color, createdAt) VALUES (?,?,?,NOW())`, ['Cultural Heritage','other','#D4A853']);
const tagId = tr.insertId;

// Experience Type - check columns first
const [etCols] = await conn.query('DESCRIBE experience_types');
console.log('experience_types columns:', etCols.map(c => c.Field).join(', '));
const [etr] = await conn.query(`INSERT INTO experience_types (name, coverImage, sortOrder, createdAt, updatedAt) VALUES (?,?,?,NOW(),NOW())`, ['Cultural Experiences', I[0], 1]);
const typeId = etr.insertId;

// Check cities columns
const [cityCols] = await conn.query('DESCRIBE cities');
console.log('cities columns:', cityCols.map(c => c.Field).join(', '));

// City 1 - Chengdu
const [cr1] = await conn.query(
  `INSERT INTO cities (name,slug,description,coverImage,cityCardImage,introductionTitle,introductionDescription,culinaryTravelLargeImage,culinaryTravelLargeTitle,culinaryTravelLargeDescription,culinaryTravelSmall1Image,culinaryTravelSmall1Title,culinaryTravelSmall1Description,culinaryTravelSmall2Image,culinaryTravelSmall2Title,culinaryTravelSmall2Description,ctaBgColor,sortOrder,isActive,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
  ['Chengdu','chengdu','Chengdu, capital of Sichuan Province, is a vibrant city known for its relaxed lifestyle, spicy cuisine, and giant pandas. With over 2,000 years of history, it blends ancient culture with modern innovation.',I[0],I[1],'Welcome to Chengdu','Discover the heart of Sichuan — where ancient teahouses sit beside modern art galleries, the aroma of hot pot fills the streets, and giant pandas roam bamboo forests just minutes from the city center.',I[2],'The Flavors of Sichuan','Sichuan cuisine is renowned worldwide for its bold, pungent flavors and the unique numbing sensation of Sichuan peppercorns. Every meal in Chengdu is an adventure.',I[3],'Hot Pot Culture','No visit to Chengdu is complete without the communal joy of hot pot — a bubbling cauldron of spicy broth where friends gather to cook and share.',I[4],'Street Food Paradise','Wander through Jinli Ancient Street to discover endless local snacks, from dan dan noodles to rabbit heads.','#8B2635',1,1]
);
const city1 = cr1.insertId;

// City 2 - Xian
const [cr2] = await conn.query(
  `INSERT INTO cities (name,slug,description,coverImage,cityCardImage,introductionTitle,introductionDescription,culinaryTravelLargeImage,culinaryTravelLargeTitle,culinaryTravelLargeDescription,culinaryTravelSmall1Image,culinaryTravelSmall1Title,culinaryTravelSmall1Description,culinaryTravelSmall2Image,culinaryTravelSmall2Title,culinaryTravelSmall2Description,ctaBgColor,sortOrder,isActive,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
  ["Xian","xian","Xi'an, one of China's oldest cities, served as capital for 13 dynasties. Home to the Terracotta Army and the ancient Silk Road, Xi'an offers an unparalleled journey through Chinese history.",I[5],I[6],"Welcome to Xi'an","Step back in time in Xi'an, where ancient city walls still stand tall, the Muslim Quarter buzzes with life, and the Terracotta Warriors guard an emperor's eternal domain.",I[7],'Silk Road Flavors',"Xi'an's cuisine reflects its position as the eastern terminus of the Silk Road, blending Chinese and Central Asian influences into a unique culinary tradition.",I[8],'Muslim Quarter Delights','The Muslim Quarter is a sensory feast of sizzling lamb skewers, freshly pulled noodles, and the sweet aroma of persimmon cakes.',I[9],'Biangbiang Noodles',"Xi'an's signature dish — wide, hand-pulled noodles topped with chili oil and vinegar — embodies the bold spirit of Shaanxi cuisine.",'#4A3728',2,1]
);
const city2 = cr2.insertId;
console.log('Cities:', city1, city2);

// Experience 1
const [er1] = await conn.query(
  `INSERT INTO experiences (name,title,slug,typeId,cityId,description,\`when\`,price,duration,recommendationTitle,recommendationDescription,recommendationImage,cityDisplayImage,gallery,ctaBgColor,sortOrder,isActive,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
  ['Tea Culture Immersion','Discover the Ancient Art of Chinese Tea','tea-culture-immersion',typeId,city1,"Immerse yourself in the centuries-old tradition of Chinese tea culture in Chengdu. Visit historic teahouses in People's Park, learn the art of gongfu tea ceremony from a master, and explore the diverse world of Chinese teas.",'Year-round, best in spring (March-May)','From $85 per person','Full day (8 hours)','Why We Recommend This Experience',"Tea culture is the soul of Chengdu's social life. This immersive experience takes you beyond the tourist trail into authentic teahouses where locals spend their afternoons playing mahjong and sipping tea.",I[10],I[11],g(0),'#2D5A3D',1,1]
);
const exp1 = er1.insertId;

// Experience 2
const [er2] = await conn.query(
  `INSERT INTO experiences (name,title,slug,typeId,cityId,description,\`when\`,price,duration,recommendationTitle,recommendationDescription,recommendationImage,cityDisplayImage,gallery,ctaBgColor,sortOrder,isActive,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
  ["Terracotta Warriors Discovery","Face to Face with China's Ancient Army","terracotta-warriors-discovery",typeId,city2,"Stand face to face with thousands of life-sized terracotta soldiers that have guarded Emperor Qin Shi Huang's tomb for over 2,200 years. This private guided experience offers expert insights into one of the world's greatest archaeological discoveries.",'Year-round, avoid Chinese national holidays','From $120 per person','Full day (9 hours)','An Unmissable World Wonder',"The Terracotta Army is a window into the ambitions and artistry of ancient China. Our expert guides bring the warriors to life with stories of the craftsmen who created them.",I[12],I[13],g(5),'#8B4513',2,1]
);
const exp2 = er2.insertId;
console.log('Experiences:', exp1, exp2);

// Experience Tags
await conn.query(`INSERT INTO experience_tags (experienceId, tagId) VALUES (?,?),(?,?)`, [exp1,tagId,exp2,tagId]);

// City Experiences
await conn.query(`INSERT INTO city_experiences (cityId,experienceId,sortOrder,createdAt,updatedAt) VALUES (?,?,?,NOW(),NOW()),(?,?,?,NOW(),NOW())`, [city1,exp1,1,city2,exp2,1]);

// City What To See
await conn.query(`INSERT INTO city_what_to_see (cityId,experienceId,sortOrder,createdAt,updatedAt) VALUES (?,?,?,NOW(),NOW()),(?,?,?,NOW(),NOW())`, [city1,exp1,1,city2,exp2,1]);

// Experience Details
for (const [eid,title,content,image,order] of [
  [exp1,"Morning: Teahouse Visit in People's Park","Begin your day at one of Chengdu's most beloved teahouses, nestled within the serene grounds of People's Park. Watch as locals settle in for a morning of tea, conversation, and ear-cleaning — a uniquely Chengdu tradition.",I[0],1],
  [exp1,"Afternoon: Gongfu Tea Ceremony Masterclass","Participate in a hands-on gongfu tea ceremony led by a certified tea master. Learn the precise movements and timing required to brew the perfect cup, and sample six different varieties of tea, each with its own story and character.",I[1],2],
  [exp1,"Evening: Tea Garden Sunset Walk","Take a leisurely walk through a traditional tea garden on the outskirts of the city. Watch the sunset paint the bamboo groves in golden light, and enjoy a final cup of aged pu'er tea.",I[2],3],
  [exp2,"Pit 1: The Grand Army","Enter the largest pit, where over 6,000 warriors stand in battle formation. Marvel at the sheer scale of this underground army and notice the remarkable individuality of each figure — no two faces are exactly alike.",I[5],1],
  [exp2,"Pit 2 & 3: The Command Center","Explore Pits 2 and 3, which housed the cavalry, archers, and the command headquarters. See the intricate details of the horses and chariots, and examine the bronze weapons — many still sharp after 2,200 years.",I[6],2],
  [exp2,"Emperor Qin's Legacy","Conclude your visit with a tour of the museum's exhibition halls, which trace the life and reign of Emperor Qin Shi Huang — the man who unified China, built the Great Wall, and created this extraordinary tomb complex.",I[7],3],
]) {
  await conn.query(`INSERT INTO experience_details (experienceId,description,imageUrl,sortOrder,createdAt) VALUES (?,?,?,?,NOW())`, [eid,`${title}: ${content}`,image,order]);
}

await conn.end();
console.log('✅ Done!');
