import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname, port: parseInt(url.port) || 4000,
  user: url.username, password: url.password,
  database: url.pathname.slice(1), ssl: { rejectUnauthorized: true },
});
console.log('Connected to database');

// 已上传到 S3 的图片 URL（40张）
const IMAGES = [
  '/manus-storage/004ecc3f4bb41300ac803c02c8f95bc3f395e4d2659671e5851a8f41cc030f2b_ec207b2c.jpg',
  '/manus-storage/0a21909d0f5fa9ec26370d3d2edfb407184300717e88061b01510e54705e1131_e4c9b1d2.jpg',
  '/manus-storage/0fb556aecd88dc1177454add18443bddda05c2df2a01f683ba9833462e3d1b5f_8a3f2e1c.jpg',
  '/manus-storage/1_ab07961c.jpg',
  '/manus-storage/1108913c1c7fc2cb4ee2b2b5bd6ee5abb96601fdd53188e0b3dabed17aa788a9_c973712f.jpg',
  '/manus-storage/15a15f98d17a11c3b40735de5640cf7f7dac4396aaa04748cdd2a9e917cb8916_a85355a3.jpg',
  '/manus-storage/15f3db28e93742b8aa70e70bb328f32ec483aa2572347f837b49bc02fe6cf872_7a2d1e9f.jpg',
  '/manus-storage/2_e2f01ccb.jpg',
  '/manus-storage/202ca49a7b3351f17af64f9ca5f41c10e9d5999ea868bd1bd2346d2c33c12236_872835a3.jpg',
  '/manus-storage/235854abfc484b2bd38aca22a88892e939e42da2be2ff509bbda2d6ec98a9b77_a08dcaf4.jpg',
  '/manus-storage/250679d2799ec6870f66a125d9d41bc2278fada09d87f4e0b85991be5f7d0948_f240f13e.jpg',
  '/manus-storage/283f752828f08f0458835888361a313aae2b5a293b3f52dedf82032c10c2938a_e5fc8394.jpg',
  '/manus-storage/29f60e5cab0fdbad2fb29ffc908b8166203c5abde8f1f2b74e6458b3c512f21e_55f44d56.jpg',
  '/manus-storage/2afdbbcb2c4bd21f5b7294d7edefbbd997656eccea237ea038273718e5e14f7e_46613f16.jpg',
  '/manus-storage/3_f588d1d6.jpg',
  '/manus-storage/31b2f88272f2d000d30edf5e48338c40c58f0ba1fbb41e6f7573fcf464f42a2c_654f0ef3.jpg',
  '/manus-storage/33df212cad32187fc4d6e94ddade29b4c0c28c7570fb98ad9f23d47e28a49dd7_b095e2ab.jpg',
  '/manus-storage/3772a9be4d8e22d1d18c890c9df1f6f2154d842c7da46feef4d4088ecef959a9_16e0e866.jpg',
  '/manus-storage/3b5421b6fe82be8db521ac3097707c35077632d5944f0e790d0f68fccc5d55ac_fbdfcf4e.jpg',
  '/manus-storage/3da36ee84b289ca5dc2ecdadb7f69525b971fd8f6a3dc2387d83acf7fe2c6a99_b2f8149c.jpg',
  '/manus-storage/4_c42cb57a.jpg',
  '/manus-storage/413f2ae0d40e78affb3d546ab366894527ffc6b83392f645024c4f27376eebb9_a18b6289.jpg',
  '/manus-storage/4b0392be5989d064a775664cd689a570a8d043a7d45a9add955b6c2433508b37_69d526e9.jpg',
  '/manus-storage/5051d97d5f557e2199a712804d6bca4fe601996a608c67f9a5d9abdffc03300f_d741b087.jpg',
  '/manus-storage/5513839249e9a_f17a4ebe.jpg',
  '/manus-storage/5907fc9044a41_52594583.jpg',
  '/manus-storage/59c3217a71512_7f9d2ca8.jpg',
  '/manus-storage/667d67a2511ae7f046927076fbcf3f1acc889d1862018d9727e1f996f6fd0a64_c33eb77c.jpg',
  '/manus-storage/6797f9954e5e9d9c5175d64652d43db62447357a067ffb3e559d81d586728d21_ee9148ea.jpg',
  '/manus-storage/68ebf35b8a091ac3359e2a514c846a150f5f658bf0835a6fdbee5c8789d4a2a6_cbbe6afd.jpg',
  '/manus-storage/690d92f1c461c9397e088f556af921d48070c66d87295771682227817c332cb8_08cdc3e7.jpg',
  '/manus-storage/69fb9d9b8cb74d88ebeea9e89578630762487ac68098b67fd764d3bedf707343_35f0b224.jpg',
  '/manus-storage/6b8f9eb5bba049e2545202b2aea68570e1f267986f8e8966ab7320161dcd799d_75f93206.jpg',
  '/manus-storage/71057371b66b0488d8b173ebb7264f1c1eb1352b8dd82c473a6d35af20d8c8ef_5cbffb2b.jpg',
  '/manus-storage/762d6e746d2d8fd7a5bd4e683f854e378c9db847a9fac06a2af979986854c28d_ce8fa1f3.jpg',
  '/manus-storage/79c54358c395c1b777f22918a2e4dc182efc8884761756459ebc4b2b6b04cd25_0fc0c002.jpg',
  '/manus-storage/7bb33c8cf7096f1348460a946210cea8d836dd0fed3d0aaff84d5621bb02190e_7085237c.jpg',
  '/manus-storage/7d7cd65b4224f09c0860b8a60041ff67889503b52d4459db6eb393f7a390cedc_3de42411.jpg',
  '/manus-storage/7dfa85c78d475d09adedc49e000b1ea73611892c5c736a412b21787d80e13a76_9b86f01f.jpg',
  '/manus-storage/802718d3cf4e06d977a7ce89b9b5b059961bd30dd185cfc85d50f4b517d86888_1a1afeec.jpg',
];
const img = (n) => IMAGES[n % IMAGES.length];

// ===== 5 个城市 =====
// cities 表: id, name, slug, description, coverImage, introductionTitle, introductionDescription,
//   cityCardImage, culinaryTravelLargeImage, culinaryTravelLargeTitle, culinaryTravelLargeDescription,
//   culinaryTravelSmall1Image, culinaryTravelSmall1Title, culinaryTravelSmall1Description,
//   culinaryTravelSmall2Image, culinaryTravelSmall2Title, culinaryTravelSmall2Description,
//   ctaBgColor, sortOrder, isActive, createdAt, updatedAt
const cities = [
  {
    name: 'Beijing',
    slug: 'beijing',
    description: 'The imperial capital of China for over five centuries, Beijing blends ancient grandeur with modern dynamism. Walk where emperors once ruled, witness the world\'s largest palace complex, and explore labyrinthine hutong alleyways that have survived for generations.',
    coverImage: img(0),
    introductionTitle: 'Where Empires Were Built',
    introductionDescription: 'Beijing has served as China\'s capital for more than 700 years, accumulating layers of history that few cities on earth can match. The Forbidden City alone contains 980 buildings across 180 acres — a world unto itself. Beyond the palace walls, the city\'s hutong neighbourhoods preserve a way of life that has endured for centuries, while its contemporary art scene and world-class restaurants signal a city very much alive in the present.',
    cityCardImage: img(1),
    culinaryTravelLargeImage: img(2),
    culinaryTravelLargeTitle: 'Peking Duck & Imperial Cuisine',
    culinaryTravelLargeDescription: 'Beijing\'s culinary identity is defined by its imperial heritage. Peking duck — roasted in a wood-fired oven and served with paper-thin pancakes — was perfected in the kitchens of the Forbidden City. Today, century-old restaurants carry on the tradition with the same reverence.',
    culinaryTravelSmall1Image: img(3),
    culinaryTravelSmall1Title: 'Hutong Street Food',
    culinaryTravelSmall1Description: 'The narrow hutong lanes of Beijing hide some of the city\'s best eating: hand-pulled noodles, sesame-slathered jianbing crêpes, and steaming bowls of zhajiangmian.',
    culinaryTravelSmall2Image: img(4),
    culinaryTravelSmall2Title: 'Rooftop Tea Houses',
    culinaryTravelSmall2Description: 'Traditional tea houses perched above the hutongs offer a quiet respite from the city below, serving rare pu\'er teas alongside candied hawthorn and sesame sweets.',
    ctaBgColor: '#D4A574',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Shanghai',
    slug: 'shanghai',
    description: 'China\'s most cosmopolitan city pulses with creative energy. The iconic Bund waterfront showcases a century of architectural ambition, while the French Concession hides art galleries, boutique cafés, and tree-lined streets that feel worlds away from the gleaming towers of Pudong.',
    coverImage: img(5),
    introductionTitle: 'The City That Never Stops Reinventing Itself',
    introductionDescription: 'Shanghai has always been a city of contradictions — and that tension is precisely what makes it extraordinary. The neoclassical banking palaces of the Bund face off against the futuristic towers of Pudong across the Huangpu River. In between, the French Concession\'s Art Deco streets shelter independent galleries, natural wine bars, and the studios of artists who have made this neighbourhood the creative capital of Asia.',
    cityCardImage: img(6),
    culinaryTravelLargeImage: img(7),
    culinaryTravelLargeTitle: 'Xiaolongbao & Shanghainese Cuisine',
    culinaryTravelLargeDescription: 'Shanghainese cuisine is defined by its sweetness, its richness, and its obsessive attention to technique. The city\'s most iconic dish — the soup dumpling, or xiaolongbao — requires years of practice to perfect: a paper-thin skin encasing a meatball and a spoonful of hot broth.',
    culinaryTravelSmall1Image: img(8),
    culinaryTravelSmall1Title: 'Century-Old Teahouses',
    culinaryTravelSmall1Description: 'The teahouses of the Old City have been serving dim sum since the Qing dynasty. Pull up a bamboo chair, order from the trolley, and watch the city come to life around you.',
    culinaryTravelSmall2Image: img(9),
    culinaryTravelSmall2Title: 'The New Shanghai Table',
    culinaryTravelSmall2Description: 'A new generation of chefs is reinterpreting Shanghainese classics with seasonal ingredients and a lighter touch, earning the city a growing reputation as one of Asia\'s most exciting dining destinations.',
    ctaBgColor: '#8B4513',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Guilin',
    slug: 'guilin',
    description: 'Guilin\'s landscape reads like a classical Chinese ink painting brought to life. Karst limestone peaks rise dramatically from the Li River, their reflections shimmering in the jade-green water below. Cormorant fishermen still ply these waters by lantern light, a tradition unchanged for a thousand years.',
    coverImage: img(10),
    introductionTitle: 'The Landscape That Inspired a Thousand Paintings',
    introductionDescription: 'For two thousand years, Chinese painters have come to Guilin to capture what words cannot adequately describe: a landscape of impossible beauty, where hundreds of karst peaks rise from flat rice paddies and river plains like the brushstrokes of a master calligrapher. The Li River connects Guilin to the village of Yangshuo through 83 kilometres of scenery that has been declared one of China\'s most beautiful natural areas.',
    cityCardImage: img(11),
    culinaryTravelLargeImage: img(12),
    culinaryTravelLargeTitle: 'River Fish & Rice Noodles',
    culinaryTravelLargeDescription: 'Guilin\'s cuisine is shaped by its rivers and its minority cultures. The city\'s most famous dish — Guilin rice noodles — is a bowl of silky noodles in a slow-cooked pork and herb broth, topped with pickled vegetables and crispy soybeans. Every family has its own recipe.',
    culinaryTravelSmall1Image: img(13),
    culinaryTravelSmall1Title: 'Longji Minority Cuisine',
    culinaryTravelSmall1Description: 'In the terraced hills above Guilin, the Zhuang and Yao minority peoples prepare dishes of bamboo-tube rice, smoked pork, and wild mountain herbs that reflect a culinary tradition entirely distinct from Han Chinese cooking.',
    culinaryTravelSmall2Image: img(14),
    culinaryTravelSmall2Title: 'Riverside Night Markets',
    culinaryTravelSmall2Description: 'As darkness falls over the Li River, the night markets of Yangshuo come alive with the aromas of beer fish, stuffed snails, and freshly pressed sugarcane juice.',
    ctaBgColor: '#6B8E23',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Hangzhou',
    slug: 'hangzhou',
    description: 'Marco Polo called it the finest and most splendid city in the world. West Lake remains the jewel of Hangzhou — a UNESCO-listed masterpiece of pagodas, causeways, and lotus-filled waters. The surrounding hills are blanketed with Dragon Well tea plantations, their leaves still picked by hand each spring.',
    coverImage: img(15),
    introductionTitle: 'Heaven on Earth',
    introductionDescription: 'There is a Chinese proverb: "Above is heaven; below is Hangzhou." West Lake — the city\'s centrepiece and a UNESCO World Heritage Site — has inspired poets, painters, and emperors for over a thousand years. The lake\'s ten classical views, each named for a season or a time of day, reward repeated visits: the moon reflected in three pools, the orioles singing in the willows, the broken bridge in winter snow.',
    cityCardImage: img(16),
    culinaryTravelLargeImage: img(17),
    culinaryTravelLargeTitle: 'Dragon Well Tea & Longjing Cuisine',
    culinaryTravelLargeDescription: 'Hangzhou\'s most celebrated ingredient is its tea. Dragon Well (Longjing) green tea — flat, jade-green, and intensely fragrant — is harvested from the hillside plantations above the city each spring. The finest leaves, picked before the Qingming festival, fetch extraordinary prices and are served in the city\'s best restaurants as both a drink and a cooking ingredient.',
    culinaryTravelSmall1Image: img(18),
    culinaryTravelSmall1Title: 'West Lake Vinegar Fish',
    culinaryTravelSmall1Description: 'The dish that defines Hangzhou cuisine: a freshwater grass carp from West Lake, steamed and dressed with a sweet-sour Zhejiang vinegar sauce. The recipe has been unchanged for centuries.',
    culinaryTravelSmall2Image: img(19),
    culinaryTravelSmall2Title: 'Dongpo Pork',
    culinaryTravelSmall2Description: 'Named after the Song dynasty poet Su Dongpo, who is said to have invented it, this slow-braised pork belly in Shaoxing wine and soy sauce is Hangzhou\'s most beloved comfort food.',
    ctaBgColor: '#4A90E2',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "Xi'an",
    slug: 'xian',
    description: 'The eastern terminus of the ancient Silk Road, Xi\'an guarded China\'s western frontier for millennia. Beneath its fields lie 8,000 terracotta warriors standing eternal watch over China\'s first emperor. The old city walls still encircle a vibrant Muslim Quarter where the aromas of cumin and sesame fill the air.',
    coverImage: img(20),
    introductionTitle: 'Where the Silk Road Began',
    introductionDescription: 'For over a thousand years, Xi\'an was the largest city on earth — the terminus of the Silk Road and the starting point of journeys that would carry Chinese silk, porcelain, and ideas to Rome and beyond. Today, the city\'s 14-kilometre Ming dynasty walls still encircle the old town, and the Muslim Quarter\'s labyrinthine lanes preserve the legacy of the Central Asian merchants who settled here centuries ago.',
    cityCardImage: img(21),
    culinaryTravelLargeImage: img(22),
    culinaryTravelLargeTitle: 'Biang Biang Noodles & Silk Road Flavours',
    culinaryTravelLargeDescription: 'Xi\'an\'s cuisine bears the unmistakable influence of the Silk Road: the bold spicing of Central Asia, the lamb and flatbreads of the Muslim Quarter, and the hand-pulled noodles that are the foundation of Shaanxi cooking. The city\'s most famous dish — biang biang noodles, named for the sound they make when slapped against the counter — are wide as a belt and dressed with chilli oil, vinegar, and garlic.',
    culinaryTravelSmall1Image: img(23),
    culinaryTravelSmall1Title: 'Roujiamo: The Original Burger',
    culinaryTravelSmall1Description: 'Long before the hamburger, Xi\'an had the roujiamo: slow-braised spiced pork stuffed into a crispy flatbread. Street vendors have been selling them in the Muslim Quarter for centuries.',
    culinaryTravelSmall2Image: img(24),
    culinaryTravelSmall2Title: 'Lamb Paomo',
    culinaryTravelSmall2Description: 'Xi\'an\'s most ceremonial dish: a bowl of rich lamb broth into which diners tear their own flatbread by hand, then return to the kitchen to be finished with glass noodles and slow-cooked mutton.',
    ctaBgColor: '#C41E3A',
    sortOrder: 5,
    isActive: true,
  },
];

// ===== 4 个体验类型 =====
// experience_types 表: id, name, coverImage, sortOrder, createdAt, updatedAt
const experienceTypes = [
  { name: 'Cultural Heritage', coverImage: img(0), sortOrder: 1 },
  { name: 'Nature & Adventure', coverImage: img(10), sortOrder: 2 },
  { name: 'Culinary Journey', coverImage: img(20), sortOrder: 3 },
  { name: 'Urban Exploration', coverImage: img(30), sortOrder: 4 },
];

// ===== 14 个体验 =====
// experiences 表: id, typeId, cityId, name, title, slug, when, price, duration, gallery,
//   description, ctaBgColor, recommendationImage, recommendationTitle, recommendationDescription,
//   cityDisplayImage, isActive, sortOrder, createdAt, updatedAt
const experiences = [
  // Beijing (3)
  {
    name: 'Great Wall Sunrise Trek',
    title: 'Hike the Wild Wall at Dawn',
    slug: 'great-wall-sunrise-trek',
    city_slug: 'beijing',
    type_name: 'Nature & Adventure',
    when: 'Year-round, best April–October',
    price: 'From $120 per person',
    duration: '6 hours',
    gallery: JSON.stringify([img(0), img(1), img(2), img(3), img(4)]),
    description: 'Depart before dawn to hike a wild, unrestored section of the Great Wall as the sun rises over the mountains. Your expert guide shares stories of the Ming dynasty soldiers who once patrolled these battlements. Breakfast is served at a farmhouse in the valley below.',
    ctaBgColor: '#D4A574',
    recommendationImage: img(5),
    recommendationTitle: 'Why We Love This Experience',
    recommendationDescription: 'The wild sections of the Great Wall — crumbling, overgrown, and utterly silent at dawn — offer a connection to history that the restored tourist sections simply cannot match.',
    cityDisplayImage: img(6),
    isActive: true,
    sortOrder: 1,
    labels: ['Guided Tour', 'Outdoor', 'Photography', 'Small Group', 'Sunrise'],
    details: [
      { description: 'A pre-dawn drive to a remote section of the wall, followed by a 3-hour hike along ancient battlements with sweeping valley views. The experience concludes with a traditional farmhouse breakfast.', imageUrl: img(7), sortOrder: 1 },
      { description: 'Expert guide, private transport, entrance fees, farmhouse breakfast, and a printed trail map included.', imageUrl: img(8), sortOrder: 2 },
    ],
  },
  {
    name: 'Forbidden City After Hours',
    title: 'The Palace After Dark',
    slug: 'forbidden-city-after-hours',
    city_slug: 'beijing',
    type_name: 'Cultural Heritage',
    when: 'Selected evenings, April–October',
    price: 'From $220 per group',
    duration: '3 hours',
    gallery: JSON.stringify([img(9), img(10), img(11), img(12), img(13)]),
    description: 'Step inside the Forbidden City after the last tourist has left. With only your private historian guide and the silence of 600 years of imperial history, explore halls and courtyards that are closed to the general public.',
    ctaBgColor: '#8B4513',
    recommendationImage: img(14),
    recommendationTitle: 'An Experience Like No Other',
    recommendationDescription: 'The Forbidden City at dusk, empty and silent, is a completely different place from the crowded daytime attraction. This is the palace as emperors experienced it.',
    cityDisplayImage: img(15),
    isActive: true,
    sortOrder: 2,
    labels: ['Private Tour', 'Cultural Heritage', 'After Hours', 'Exclusive', 'Historical'],
    details: [
      { description: 'An exclusive evening tour of the Forbidden City\'s inner courtyards and imperial gardens, guided by a specialist historian with deep knowledge of Ming and Qing dynasty court life.', imageUrl: img(16), sortOrder: 1 },
      { description: 'Private historian guide, special after-hours access permit, and a curated reading list on imperial Beijing included.', imageUrl: img(17), sortOrder: 2 },
    ],
  },
  {
    name: 'Hutong Family Cooking Class',
    title: 'Cook & Eat with a Beijing Family',
    slug: 'hutong-family-cooking-class',
    city_slug: 'beijing',
    type_name: 'Culinary Journey',
    when: 'Year-round',
    price: 'From $95 per person',
    duration: '5 hours',
    gallery: JSON.stringify([img(18), img(19), img(20), img(21), img(22)]),
    description: 'Join a local family in their hutong courtyard home for a morning of cooking, conversation, and connection. Visit the neighbourhood wet market together, then learn to make Peking duck pancakes, hand-folded dumplings, and a classic red-braised pork belly.',
    ctaBgColor: '#D4A574',
    recommendationImage: img(23),
    recommendationTitle: 'The Heart of Beijing Hospitality',
    recommendationDescription: 'There is no better way to understand Beijing than through its food, and no better place to learn than in a family kitchen in the hutongs.',
    cityDisplayImage: img(24),
    isActive: true,
    sortOrder: 3,
    labels: ['Cooking Class', 'Local Family', 'Market Visit', 'Lunch Included', 'Hands-on'],
    details: [
      { description: 'A market walk, three-dish cooking session, and a shared family lunch in a traditional courtyard home.', imageUrl: img(25), sortOrder: 1 },
      { description: 'Market tour, all ingredients, cooking instruction, lunch, recipe cards, and a small jar of homemade chilli sauce to take home included.', imageUrl: img(26), sortOrder: 2 },
    ],
  },
  // Shanghai (3)
  {
    name: 'Bund & Beyond Architecture Walk',
    title: 'A Century of Architecture in One Afternoon',
    slug: 'bund-beyond-architecture-walk',
    city_slug: 'shanghai',
    type_name: 'Urban Exploration',
    when: 'Year-round',
    price: 'From $65 per person',
    duration: '3.5 hours',
    gallery: JSON.stringify([img(27), img(28), img(29), img(30), img(31)]),
    description: 'Shanghai is one of the world\'s great architectural cities. Move from the neoclassical banking palaces of the Bund to the Art Deco towers of the French Concession, then cross the river to stand beneath the futuristic towers of Pudong.',
    ctaBgColor: '#8B4513',
    recommendationImage: img(32),
    recommendationTitle: 'Architecture as Living History',
    recommendationDescription: 'Every building on the Bund tells a story of ambition, empire, and reinvention. Our architect guide brings those stories to life.',
    cityDisplayImage: img(33),
    isActive: true,
    sortOrder: 1,
    labels: ['Walking Tour', 'Architecture', 'Photography', 'Expert Guide', 'City History'],
    details: [
      { description: 'A guided walk covering the Bund waterfront, the French Concession\'s Art Deco streets, and a ferry crossing to Pudong for skyline views.', imageUrl: img(34), sortOrder: 1 },
      { description: 'Expert architect guide, ferry ticket, and a beautifully illustrated architectural map of Shanghai included.', imageUrl: img(35), sortOrder: 2 },
    ],
  },
  {
    name: 'French Concession Art & Design Tour',
    title: 'Galleries, Studios & Street Art',
    slug: 'french-concession-art-design-tour',
    city_slug: 'shanghai',
    type_name: 'Urban Exploration',
    when: 'Year-round',
    price: 'From $90 per person',
    duration: '4 hours',
    gallery: JSON.stringify([img(36), img(37), img(38), img(39), img(0)]),
    description: 'The French Concession is Shanghai\'s most creative neighbourhood. This curated tour takes you inside its best galleries, design studios, and independent bookshops, ending with a private tasting at a natural wine bar.',
    ctaBgColor: '#6B8E23',
    recommendationImage: img(1),
    recommendationTitle: 'The Creative Soul of Shanghai',
    recommendationDescription: 'The French Concession\'s back lanes hide some of Asia\'s most exciting contemporary art. Our guide knows every studio, every gallery, every hidden mural.',
    cityDisplayImage: img(2),
    isActive: true,
    sortOrder: 2,
    labels: ['Art Tour', 'Creative', 'Studio Visits', 'Wine Tasting', 'Small Group'],
    details: [
      { description: 'Visits to 2–3 curated galleries, a working artist\'s studio, and a street art trail through the back lanes of the French Concession.', imageUrl: img(3), sortOrder: 1 },
      { description: 'Expert art guide, gallery entrance fees, studio visit, and wine tasting included.', imageUrl: img(4), sortOrder: 2 },
    ],
  },
  {
    name: 'Old Shanghai Dim Sum Morning',
    title: 'Breakfast the Shanghainese Way',
    slug: 'old-shanghai-dim-sum-morning',
    city_slug: 'shanghai',
    type_name: 'Culinary Journey',
    when: 'Year-round',
    price: 'From $80 per person',
    duration: '3.5 hours',
    gallery: JSON.stringify([img(5), img(6), img(7), img(8), img(9)]),
    description: 'Begin the day as Shanghainese locals do — with a leisurely dim sum breakfast at a century-old teahouse, followed by a wet market walk and a hands-on steamed bun demonstration.',
    ctaBgColor: '#8B4513',
    recommendationImage: img(10),
    recommendationTitle: 'The Original Breakfast Culture',
    recommendationDescription: 'Shanghai\'s teahouse breakfast tradition dates back centuries. Our guide brings it to life with stories, tastings, and a hands-on cooking session.',
    cityDisplayImage: img(11),
    isActive: true,
    sortOrder: 3,
    labels: ['Food Tour', 'Dim Sum', 'Tea Culture', 'Cooking Demo', 'Morning'],
    details: [
      { description: 'Breakfast at a historic teahouse with a guided dim sum tasting, followed by a wet market walk and a 45-minute steamed bun making demonstration.', imageUrl: img(12), sortOrder: 1 },
      { description: 'Dim sum breakfast, tea service, market tour, cooking demonstration, and a recipe card included.', imageUrl: img(13), sortOrder: 2 },
    ],
  },
  // Guilin (3)
  {
    name: 'Li River Bamboo Raft Journey',
    title: 'Drift Through a Living Painting',
    slug: 'li-river-bamboo-raft-journey',
    city_slug: 'guilin',
    type_name: 'Nature & Adventure',
    when: 'April–October',
    price: 'From $70 per person',
    duration: '5 hours',
    gallery: JSON.stringify([img(14), img(15), img(16), img(17), img(18)]),
    description: 'Drift downstream on a traditional bamboo raft as the karst peaks of the Li River valley unfold around you. Stop for a picnic lunch on a riverside sandbar, then explore a traditional fishing village on foot.',
    ctaBgColor: '#6B8E23',
    recommendationImage: img(19),
    recommendationTitle: 'The World\'s Most Beautiful River Journey',
    recommendationDescription: 'The Li River valley is one of the most photographed landscapes on earth — and it is even more beautiful from water level on a bamboo raft.',
    cityDisplayImage: img(20),
    isActive: true,
    sortOrder: 1,
    labels: ['River Journey', 'Bamboo Raft', 'Scenic', 'Picnic Included', 'Village Visit'],
    details: [
      { description: 'A 3-hour raft journey along the most scenic section of the Li River, with a sandbar picnic lunch and a 1-hour walk through a traditional fishing village.', imageUrl: img(21), sortOrder: 1 },
      { description: 'Private bamboo raft, experienced raftsman, riverside picnic lunch, and village guide included.', imageUrl: img(22), sortOrder: 2 },
    ],
  },
  {
    name: 'Karst Peaks & Hidden Villages Trek',
    title: 'Beyond the Tourist Trail',
    slug: 'karst-peaks-hidden-villages-trek',
    city_slug: 'guilin',
    type_name: 'Nature & Adventure',
    when: 'March–November',
    price: 'From $100 per person',
    duration: '7 hours',
    gallery: JSON.stringify([img(23), img(24), img(25), img(26), img(27)]),
    description: 'Leave the tourist trail behind and hike through a landscape that has inspired Chinese painters for 2,000 years. Your guide leads you through rice paddies, past ancient banyan trees, and up to a summit viewpoint revealing hundreds of karst peaks.',
    ctaBgColor: '#6B8E23',
    recommendationImage: img(28),
    recommendationTitle: 'The Guilin That Few Visitors See',
    recommendationDescription: 'Away from the cruise boats and tour groups, the karst countryside around Guilin is a place of extraordinary peace and beauty.',
    cityDisplayImage: img(29),
    isActive: true,
    sortOrder: 2,
    labels: ['Hiking', 'Remote', 'Village Lunch', 'Panoramic Views', 'Off the Beaten Path'],
    details: [
      { description: 'A full-day hike of approximately 12 km through karst countryside, with a summit viewpoint and a home-cooked lunch in a remote village.', imageUrl: img(30), sortOrder: 1 },
      { description: 'Expert local guide, village lunch, entrance fees, and hiking poles on request included.', imageUrl: img(31), sortOrder: 2 },
    ],
  },
  {
    name: 'Cormorant Fishing by Lantern Light',
    title: 'An Ancient Tradition at Dusk',
    slug: 'cormorant-fishing-by-lantern-light',
    city_slug: 'guilin',
    type_name: 'Cultural Heritage',
    when: 'Year-round',
    price: 'From $75 per person',
    duration: '3 hours',
    gallery: JSON.stringify([img(32), img(33), img(34), img(35), img(36)]),
    description: 'As dusk settles over the Li River, join a master cormorant fisherman on his bamboo raft for an evening that has barely changed in a thousand years. Dinner is served on the riverbank as the lanterns of the village reflect in the water.',
    ctaBgColor: '#D4A574',
    recommendationImage: img(37),
    recommendationTitle: 'A Living Connection to the Past',
    recommendationDescription: 'Cormorant fishing on the Li River is one of China\'s oldest and most visually spectacular traditions. An evening with a master fisherman is an experience that stays with you forever.',
    cityDisplayImage: img(38),
    isActive: true,
    sortOrder: 3,
    labels: ['Cultural Heritage', 'Evening', 'Lanterns', 'Riverside Dinner', 'Traditional'],
    details: [
      { description: 'A 90-minute cormorant fishing demonstration on the Li River at dusk, followed by a traditional dinner on the riverbank with the fisherman and his family.', imageUrl: img(39), sortOrder: 1 },
      { description: 'Raft ride, cormorant fishing demonstration, riverside dinner, and a traditional lantern to take home included.', imageUrl: img(0), sortOrder: 2 },
    ],
  },
  // Hangzhou (3)
  {
    name: 'West Lake at First Light',
    title: 'Dawn on the Most Beautiful Lake in China',
    slug: 'west-lake-at-first-light',
    city_slug: 'hangzhou',
    type_name: 'Nature & Adventure',
    when: 'Year-round',
    price: 'From $85 per person',
    duration: '2.5 hours',
    gallery: JSON.stringify([img(1), img(2), img(3), img(4), img(5)]),
    description: 'West Lake at dawn belongs to the tai chi practitioners, the fishermen, and the early-rising poets. Join a private boat tour as the morning mist lifts from the water, revealing ancient pagodas and willow-fringed causeways.',
    ctaBgColor: '#4A90E2',
    recommendationImage: img(6),
    recommendationTitle: 'The Lake That Inspired a Thousand Poems',
    recommendationDescription: 'West Lake has been celebrated in Chinese poetry and painting for over a thousand years. At dawn, with the mist still on the water, it is easy to understand why.',
    cityDisplayImage: img(7),
    isActive: true,
    sortOrder: 1,
    labels: ['Boat Tour', 'Sunrise', 'Scenic', 'Private', 'UNESCO Site'],
    details: [
      { description: 'A private wooden boat tour departing at sunrise, visiting the Three Pools Mirroring the Moon island, the Broken Bridge, and the Su Causeway.', imageUrl: img(8), sortOrder: 1 },
      { description: 'Private boat and boatman, expert guide, and a flask of Dragon Well tea to enjoy on the water included.', imageUrl: img(9), sortOrder: 2 },
    ],
  },
  {
    name: 'Dragon Well Tea Harvest Experience',
    title: 'Pick, Roast & Taste the World\'s Finest Green Tea',
    slug: 'dragon-well-tea-harvest-experience',
    city_slug: 'hangzhou',
    type_name: 'Culinary Journey',
    when: 'Year-round (best March–May)',
    price: 'From $75 per person',
    duration: '4 hours',
    gallery: JSON.stringify([img(10), img(11), img(12), img(13), img(14)]),
    description: 'Spend a morning on a family-owned Dragon Well tea plantation learning to identify the finest leaves, picking them by hand, and then pan-frying your harvest in a traditional iron wok. The day ends with a formal tea ceremony and a tasting of five different grades.',
    ctaBgColor: '#4A90E2',
    recommendationImage: img(15),
    recommendationTitle: 'The World\'s Most Celebrated Green Tea',
    recommendationDescription: 'Dragon Well tea has been presented to foreign dignitaries and Chinese emperors for centuries. This experience takes you to the source.',
    cityDisplayImage: img(16),
    isActive: true,
    sortOrder: 2,
    labels: ['Tea Culture', 'Hands-on', 'Family Farm', 'Tea Ceremony', 'Take Home Tea'],
    details: [
      { description: 'A guided tour of the plantation, hands-on tea picking, a pan-roasting demonstration, and a formal tea ceremony with five-grade tasting.', imageUrl: img(17), sortOrder: 1 },
      { description: 'Plantation tour, tea picking, roasting demonstration, tea ceremony, tasting, and 50g of your own tea included.', imageUrl: img(18), sortOrder: 2 },
    ],
  },
  {
    name: 'Lingyin Temple Meditation Retreat',
    title: 'Stillness at the Temple of the Soul\'s Retreat',
    slug: 'lingyin-temple-meditation-retreat',
    city_slug: 'hangzhou',
    type_name: 'Cultural Heritage',
    when: 'Year-round',
    price: 'From $65 per person',
    duration: '4 hours',
    gallery: JSON.stringify([img(19), img(20), img(21), img(22), img(23)]),
    description: 'Arrive before the crowds for a guided meditation session with a resident monk in the temple\'s quietest courtyard. Afterwards, walk the forested path to the ancient cliff carvings of the Five Hundred Arhats, and share a simple vegetarian lunch in the monks\' dining hall.',
    ctaBgColor: '#4A90E2',
    recommendationImage: img(24),
    recommendationTitle: '1,700 Years of Contemplation',
    recommendationDescription: 'Lingyin Temple has been a place of retreat and reflection since 328 CE. A morning here, guided by a resident monk, offers a rare glimpse into living Buddhist practice.',
    cityDisplayImage: img(25),
    isActive: true,
    sortOrder: 3,
    labels: ['Meditation', 'Buddhist Temple', 'Mindfulness', 'Vegetarian Lunch', 'Spiritual'],
    details: [
      { description: 'A 45-minute guided meditation with a monk, a walk to the cliff carvings, and a simple vegetarian lunch in the temple dining hall.', imageUrl: img(26), sortOrder: 1 },
      { description: 'Temple entrance, meditation session, monk guide, cliff carving walk, and vegetarian lunch included.', imageUrl: img(27), sortOrder: 2 },
    ],
  },
  // Xi'an (2)
  {
    name: "Terracotta Army: The Archaeologist's Tour",
    title: 'Behind the Scenes with a Working Archaeologist',
    slug: 'terracotta-army-archaeologists-tour',
    city_slug: 'xian',
    type_name: 'Cultural Heritage',
    when: 'Year-round',
    price: 'From $130 per person',
    duration: '5 hours',
    gallery: JSON.stringify([img(28), img(29), img(30), img(31), img(32)]),
    description: 'This specialist tour, led by a working archaeologist, takes you into the active excavation pits, the conservation laboratory, and the museum\'s restricted storage vaults where thousands of unrestored figures await their turn.',
    ctaBgColor: '#C41E3A',
    recommendationImage: img(33),
    recommendationTitle: 'The Greatest Archaeological Discovery of the 20th Century',
    recommendationDescription: 'The Terracotta Army was discovered by farmers digging a well in 1974. Today, archaeologists are still uncovering new figures. This tour takes you to the frontier of that discovery.',
    cityDisplayImage: img(34),
    isActive: true,
    sortOrder: 1,
    labels: ['Exclusive Access', 'Archaeologist Guide', 'Behind the Scenes', 'UNESCO Site', 'Small Group'],
    details: [
      { description: 'A comprehensive tour of all three excavation pits, access to the active dig site and conservation lab, and a visit to the restricted storage vault.', imageUrl: img(35), sortOrder: 1 },
      { description: 'Specialist archaeologist guide, all entrance and access fees, and a signed copy of the guide\'s published book on the Terracotta Army included.', imageUrl: img(36), sortOrder: 2 },
    ],
  },
  {
    name: "Muslim Quarter Street Food Trail",
    title: "Taste the Silk Road in Xi'an's Ancient Food Quarter",
    slug: 'muslim-quarter-street-food-trail',
    city_slug: 'xian',
    type_name: 'Culinary Journey',
    when: 'Year-round',
    price: 'From $60 per person',
    duration: '3 hours',
    gallery: JSON.stringify([img(37), img(38), img(39), img(0), img(1)]),
    description: "The Muslim Quarter of Xi'an has been feeding travellers on the Silk Road for over a thousand years. This evening food trail takes you through its lantern-lit lanes, tasting roujiamo, biang biang noodles, pomegranate juice, and legendary spiced lamb skewers.",
    ctaBgColor: '#C41E3A',
    recommendationImage: img(2),
    recommendationTitle: 'A Thousand Years of Street Food',
    recommendationDescription: "The Muslim Quarter's food culture is one of the most distinctive in China — a living legacy of the Silk Road merchants who settled in Xi'an centuries ago.",
    cityDisplayImage: img(3),
    isActive: true,
    sortOrder: 2,
    labels: ['Street Food', 'Evening Tour', 'Silk Road', 'Muslim Quarter', 'Tasting'],
    details: [
      { description: 'An evening walk through the Muslim Quarter with 6–8 street food tastings, including roujiamo, biang biang noodles, lamb skewers, and pomegranate juice.', imageUrl: img(4), sortOrder: 1 },
      { description: 'Expert local guide, all food tastings, and a printed food map of the Muslim Quarter included. All food is halal.', imageUrl: img(5), sortOrder: 2 },
    ],
  },
];

// ===== 执行插入 =====
await conn.query('SET FOREIGN_KEY_CHECKS=0');

// 1. 插入城市
console.log('\n--- Inserting Cities ---');
const cityIds = {};
for (const city of cities) {
  const [result] = await conn.query(
    `INSERT INTO cities (name, slug, description, coverImage, introductionTitle, introductionDescription,
      cityCardImage, culinaryTravelLargeImage, culinaryTravelLargeTitle, culinaryTravelLargeDescription,
      culinaryTravelSmall1Image, culinaryTravelSmall1Title, culinaryTravelSmall1Description,
      culinaryTravelSmall2Image, culinaryTravelSmall2Title, culinaryTravelSmall2Description,
      ctaBgColor, sortOrder, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [city.name, city.slug, city.description, city.coverImage, city.introductionTitle, city.introductionDescription,
     city.cityCardImage, city.culinaryTravelLargeImage, city.culinaryTravelLargeTitle, city.culinaryTravelLargeDescription,
     city.culinaryTravelSmall1Image, city.culinaryTravelSmall1Title, city.culinaryTravelSmall1Description,
     city.culinaryTravelSmall2Image, city.culinaryTravelSmall2Title, city.culinaryTravelSmall2Description,
     city.ctaBgColor, city.sortOrder, city.isActive]
  );
  cityIds[city.slug] = result.insertId;
  console.log(`✓ City: ${city.name} (id=${result.insertId})`);
}

// 2. 插入体验类型
console.log('\n--- Inserting Experience Types ---');
const typeIds = {};
for (const type of experienceTypes) {
  const [result] = await conn.query(
    `INSERT INTO experience_types (name, coverImage, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())`,
    [type.name, type.coverImage, type.sortOrder]
  );
  typeIds[type.name] = result.insertId;
  console.log(`✓ Type: ${type.name} (id=${result.insertId})`);
}

// 3. 插入体验
console.log('\n--- Inserting Experiences ---');
for (const exp of experiences) {
  const cityId = cityIds[exp.city_slug];
  const typeId = typeIds[exp.type_name];

  const [result] = await conn.query(
    `INSERT INTO experiences (typeId, cityId, name, title, slug, \`when\`, price, duration, gallery,
      description, ctaBgColor, recommendationImage, recommendationTitle, recommendationDescription,
      cityDisplayImage, isActive, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [typeId, cityId, exp.name, exp.title, exp.slug, exp.when, exp.price, exp.duration, exp.gallery,
     exp.description, exp.ctaBgColor, exp.recommendationImage, exp.recommendationTitle, exp.recommendationDescription,
     exp.cityDisplayImage, exp.isActive, exp.sortOrder]
  );
  const expId = result.insertId;
  console.log(`✓ Experience: ${exp.name} (id=${expId}, city=${exp.city_slug}, type=${exp.type_name})`);

  // 关联城市 (city_experiences)
  if (cityId) {
    await conn.query(
      `INSERT INTO city_experiences (cityId, experienceId, displayImage, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [cityId, expId, exp.preview_image_url || exp.recommendationImage, exp.sortOrder]
    );
  }

  // 关联体验类型 (experience_tags: experienceId, tagId)
  if (typeId) {
    await conn.query(
      `INSERT INTO experience_tags (experienceId, tagId) VALUES (?, ?)`,
      [expId, typeId]
    ).catch(e => console.log(`  Note: tag link: ${e.message}`));
  }

  // 插入详情块 (experience_details: experienceId, description, imageUrl, sortOrder)
  for (const detail of exp.details) {
    await conn.query(
      `INSERT INTO experience_details (experienceId, description, imageUrl, sortOrder, createdAt) VALUES (?, ?, ?, ?, NOW())`,
      [expId, detail.description, detail.imageUrl, detail.sortOrder]
    );
  }

  // 插入标签 (experience_labels: experienceId, label)
  for (const label of exp.labels) {
    await conn.query(
      `INSERT INTO experience_labels (experienceId, label) VALUES (?, ?)`,
      [expId, label]
    ).catch(() => {});
  }
}

// 验证
console.log('\n--- Verification ---');
const [cityCount] = await conn.query('SELECT COUNT(*) as n FROM cities');
const [typeCount] = await conn.query('SELECT COUNT(*) as n FROM experience_types');
const [expCount] = await conn.query('SELECT COUNT(*) as n FROM experiences');
const [ceCount] = await conn.query('SELECT COUNT(*) as n FROM city_experiences');
const [etCount] = await conn.query('SELECT COUNT(*) as n FROM experience_tags');
const [elCount] = await conn.query('SELECT COUNT(*) as n FROM experience_labels');
console.log(`Cities: ${cityCount[0].n}`);
console.log(`Experience Types: ${typeCount[0].n}`);
console.log(`Experiences: ${expCount[0].n}`);
console.log(`City-Experience links: ${ceCount[0].n}`);
console.log(`Experience-Type links: ${etCount[0].n}`);
console.log(`Experience Labels: ${elCount[0].n}`);

await conn.query('SET FOREIGN_KEY_CHECKS=1');
await conn.end();
console.log('\n✅ All data inserted successfully!');
