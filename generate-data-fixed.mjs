import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 安全的 SQL 转义函数
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// 读取所有可用图片
const imageDir = '/home/ubuntu/upload/聚焦';
const images = fs.readdirSync(imageDir).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
});

console.log(`Found ${images.length} images`);

// 5 个城市数据
const cities = [
  {
    name: 'Beijing',
    slug: 'beijing',
    description: 'The capital of China, blending ancient imperial heritage with modern metropolis. Explore the Great Wall, Forbidden City, and vibrant hutong neighborhoods.',
    shortDescription: 'Imperial heritage meets modern China',
    highlights: 'Great Wall, Forbidden City, Summer Palace, Temple of Heaven',
    bestTime: 'April-May, September-October',
    region: 'North China',
    accentColor: '#D4A574'
  },
  {
    name: 'Shanghai',
    slug: 'shanghai',
    description: 'China\'s most cosmopolitan city, showcasing futuristic skyscrapers alongside historic French Concession. Experience world-class dining, art, and nightlife.',
    shortDescription: 'Modern metropolis with artistic soul',
    highlights: 'The Bund, Yu Garden, French Concession, Oriental Pearl Tower',
    bestTime: 'April-May, September-October',
    region: 'East China',
    accentColor: '#8B4513'
  },
  {
    name: 'Guilin',
    slug: 'guilin',
    description: 'Famous for dramatic karst mountains and the serene Li River. A painter\'s paradise with traditional cormorant fishing and bamboo rafting.',
    shortDescription: 'Landscape painting come to life',
    highlights: 'Li River, Karst Mountains, Cormorant Fishing, Reed Flute Cave',
    bestTime: 'April-May, September-October',
    region: 'South China',
    accentColor: '#6B8E23'
  },
  {
    name: 'Hangzhou',
    slug: 'hangzhou',
    description: 'Home to the enchanting West Lake, surrounded by tea plantations and ancient temples. A city of poets and artists.',
    shortDescription: 'Romantic lakeside paradise',
    highlights: 'West Lake, Dragon Well Tea, Lingyin Temple, Pagodas',
    bestTime: 'March-May, September-November',
    region: 'East China',
    accentColor: '#4A90E2'
  },
  {
    name: 'Xian',
    slug: 'xian',
    description: 'Ancient capital along the Silk Road, home to the Terracotta Army. Discover thousands of years of Chinese history and culture.',
    shortDescription: 'Ancient Silk Road capital',
    highlights: 'Terracotta Army, City Walls, Big Wild Goose Pagoda, Muslim Quarter',
    bestTime: 'April-May, September-October',
    region: 'Central China',
    accentColor: '#C41E3A'
  }
];

// 4 个体验类型
const experienceTypes = [
  {
    name: 'Cultural Heritage',
    slug: 'cultural-heritage',
    description: 'Immerse yourself in China\'s rich cultural traditions',
    icon: 'museum',
    sortOrder: 1
  },
  {
    name: 'Nature & Adventure',
    slug: 'nature-adventure',
    description: 'Explore stunning landscapes and outdoor activities',
    icon: 'mountain',
    sortOrder: 2
  },
  {
    name: 'Culinary Journey',
    slug: 'culinary-journey',
    description: 'Taste authentic regional cuisines and cooking traditions',
    icon: 'utensils',
    sortOrder: 3
  },
  {
    name: 'Urban Exploration',
    slug: 'urban-exploration',
    description: 'Discover modern cities and contemporary culture',
    icon: 'building',
    sortOrder: 4
  }
];

// 14 个体验，分配到各城市和类型
const experiences = [
  // Beijing - 3 experiences
  {
    name: 'Great Wall Sunrise Trek',
    slug: 'great-wall-sunrise-trek',
    typeSlug: 'nature-adventure',
    citySlug: 'beijing',
    description: 'Hike the Great Wall at dawn to witness a breathtaking sunrise over the mountains. This guided trek includes breakfast at a local village.',
    shortDescription: 'Sunrise hike on the Great Wall',
    duration: '6 hours',
    difficulty: 'Moderate',
    groupSize: '4-12 people',
    price: '$120 per person'
  },
  {
    name: 'Forbidden City Private Tour',
    slug: 'forbidden-city-private-tour',
    typeSlug: 'cultural-heritage',
    citySlug: 'beijing',
    description: 'Exclusive after-hours access to the Forbidden City with a historian guide. Explore imperial palaces and learn about 500 years of Chinese history.',
    shortDescription: 'After-hours imperial palace tour',
    duration: '4 hours',
    difficulty: 'Easy',
    groupSize: '2-8 people',
    price: '$200 per group'
  },
  {
    name: 'Hutong Cooking Class',
    slug: 'hutong-cooking-class',
    typeSlug: 'culinary-journey',
    citySlug: 'beijing',
    description: 'Learn to cook traditional Beijing dishes in a local family\'s kitchen. Includes market visit and lunch with the family.',
    shortDescription: 'Cook Beijing cuisine in a hutong home',
    duration: '5 hours',
    difficulty: 'Easy',
    groupSize: '2-6 people',
    price: '$90 per person'
  },
  // Shanghai - 3 experiences
  {
    name: 'Bund Architecture Walk',
    slug: 'bund-architecture-walk',
    typeSlug: 'urban-exploration',
    citySlug: 'shanghai',
    description: 'Guided architectural tour of Shanghai\'s iconic Bund, featuring colonial buildings, modern skyscrapers, and the Huangpu River.',
    shortDescription: 'Explore Shanghai\'s architectural landmarks',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '4-15 people',
    price: '$60 per person'
  },
  {
    name: 'French Concession Art Tour',
    slug: 'french-concession-art-tour',
    typeSlug: 'urban-exploration',
    citySlug: 'shanghai',
    description: 'Discover galleries, street art, and creative spaces in Shanghai\'s artistic French Concession neighborhood.',
    shortDescription: 'Art and culture in French Concession',
    duration: '4 hours',
    difficulty: 'Easy',
    groupSize: '2-10 people',
    price: '$85 per person'
  },
  {
    name: 'Shanghai Dim Sum Experience',
    slug: 'shanghai-dim-sum-experience',
    typeSlug: 'culinary-journey',
    citySlug: 'shanghai',
    description: 'Traditional dim sum breakfast at a historic teahouse, followed by a visit to a local market and cooking demonstration.',
    shortDescription: 'Authentic dim sum and tea culture',
    duration: '3.5 hours',
    difficulty: 'Easy',
    groupSize: '2-8 people',
    price: '$75 per person'
  },
  // Guilin - 3 experiences
  {
    name: 'Li River Bamboo Rafting',
    slug: 'li-river-bamboo-rafting',
    typeSlug: 'nature-adventure',
    citySlug: 'guilin',
    description: 'Traditional bamboo raft journey down the Li River, passing dramatic karst mountains and traditional villages.',
    shortDescription: 'Scenic bamboo raft on the Li River',
    duration: '4 hours',
    difficulty: 'Easy',
    groupSize: '2-20 people',
    price: '$65 per person'
  },
  {
    name: 'Karst Mountain Hiking',
    slug: 'karst-mountain-hiking',
    typeSlug: 'nature-adventure',
    citySlug: 'guilin',
    description: 'Trek through stunning karst landscape with panoramic views. Visit remote villages and experience local culture.',
    shortDescription: 'Hike through karst mountains',
    duration: '7 hours',
    difficulty: 'Moderate',
    groupSize: '4-10 people',
    price: '$95 per person'
  },
  {
    name: 'Cormorant Fishing Night Show',
    slug: 'cormorant-fishing-night-show',
    typeSlug: 'cultural-heritage',
    citySlug: 'guilin',
    description: 'Witness the ancient art of cormorant fishing by lantern light on the Li River. Includes dinner and traditional performance.',
    shortDescription: 'Ancient fishing tradition at night',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '2-30 people',
    price: '$70 per person'
  },
  // Hangzhou - 3 experiences
  {
    name: 'West Lake Sunrise Boat Tour',
    slug: 'west-lake-sunrise-boat-tour',
    typeSlug: 'nature-adventure',
    citySlug: 'hangzhou',
    description: 'Private boat tour on West Lake at sunrise, visiting ancient temples and traditional pagodas.',
    shortDescription: 'Serene sunrise on West Lake',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '2-8 people',
    price: '$80 per person'
  },
  {
    name: 'Dragon Well Tea Plantation',
    slug: 'dragon-well-tea-plantation',
    typeSlug: 'culinary-journey',
    citySlug: 'hangzhou',
    description: 'Visit a Dragon Well tea plantation, learn tea picking and processing, and enjoy a traditional tea ceremony.',
    shortDescription: 'Tea picking and ceremony experience',
    duration: '4 hours',
    difficulty: 'Easy',
    groupSize: '2-12 people',
    price: '$70 per person'
  },
  {
    name: 'Lingyin Temple Meditation',
    slug: 'lingyin-temple-meditation',
    typeSlug: 'cultural-heritage',
    citySlug: 'hangzhou',
    description: 'Guided meditation session at the ancient Lingyin Temple, followed by Buddhist philosophy discussion with a monk.',
    shortDescription: 'Meditation at ancient Buddhist temple',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '2-20 people',
    price: '$60 per person'
  },
  // Xian - 2 experiences
  {
    name: 'Terracotta Army Excavation Tour',
    slug: 'terracotta-army-excavation-tour',
    typeSlug: 'cultural-heritage',
    citySlug: 'xian',
    description: 'Comprehensive tour of the Terracotta Army with expert archaeologist. Includes museum and active excavation site.',
    shortDescription: 'Explore the Terracotta Army',
    duration: '5 hours',
    difficulty: 'Easy',
    groupSize: '2-15 people',
    price: '$110 per person'
  },
  {
    name: 'Muslim Quarter Food Tour',
    slug: 'muslim-quarter-food-tour',
    typeSlug: 'culinary-journey',
    citySlug: 'xian',
    description: 'Street food tasting tour in Xian\'s vibrant Muslim Quarter. Sample dumplings, noodles, and local specialties.',
    shortDescription: 'Street food adventure in Muslim Quarter',
    duration: '3 hours',
    difficulty: 'Easy',
    groupSize: '2-10 people',
    price: '$55 per person'
  }
];

// 为每个体验生成详细块和标签
function generateDetailBlocks(experienceName) {
  return [
    {
      title: `What to Expect at ${experienceName}`,
      content: `This experience offers an authentic and immersive encounter with local culture and traditions. You will have the opportunity to interact with experienced guides and local community members who are passionate about sharing their heritage.`,
      sortOrder: 1
    },
    {
      title: 'What\'s Included',
      content: 'Professional guide, all entrance fees, transportation between locations, refreshments, and a souvenir photo from the experience.',
      sortOrder: 2
    },
    {
      title: 'Important Information',
      content: 'Please wear comfortable walking shoes and bring sun protection. Photography is permitted. Dietary restrictions can be accommodated with advance notice.',
      sortOrder: 3
    }
  ];
}

function generateLabels() {
  return ['Guided Tour', 'Local Experience', 'Photography', 'Small Group', 'Authentic'];
}

// 生成 SQL 插入语句
let sql = '';

// 插入城市
console.log('\n=== CITIES ===');
cities.forEach(city => {
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const imageUrl = `/uploads/images/${randomImage}`;
  const escapedDesc = escapeSql(city.description);
  const escapedShortDesc = escapeSql(city.shortDescription);
  const escapedHighlights = escapeSql(city.highlights);
  
  sql += `INSERT INTO cities (name, slug, description, shortDescription, highlights, bestTime, region, accentColor, previewImageUrl, isPublished, createdAt, updatedAt) VALUES ('${escapeSql(city.name)}', '${city.slug}', '${escapedDesc}', '${escapedShortDesc}', '${escapedHighlights}', '${city.bestTime}', '${city.region}', '${city.accentColor}', '${escapeSql(imageUrl)}', true, NOW(), NOW());\n`;
  console.log(`✓ ${city.name}`);
});

// 插入体验类型
console.log('\n=== EXPERIENCE TYPES ===');
experienceTypes.forEach(type => {
  const escapedDesc = escapeSql(type.description);
  sql += `INSERT INTO experienceTypes (name, slug, description, icon, sortOrder, isPublished, createdAt, updatedAt) VALUES ('${type.name}', '${type.slug}', '${escapedDesc}', '${type.icon}', ${type.sortOrder}, true, NOW(), NOW());\n`;
  console.log(`✓ ${type.name}`);
});

// 插入体验
console.log('\n=== EXPERIENCES ===');
experiences.forEach(exp => {
  const escapedName = escapeSql(exp.name);
  const escapedDesc = escapeSql(exp.description);
  const escapedShortDesc = escapeSql(exp.shortDescription);
  
  sql += `INSERT INTO experiences (name, slug, description, shortDescription, duration, difficulty, groupSize, price, isPublished, createdAt, updatedAt) VALUES ('${escapedName}', '${exp.slug}', '${escapedDesc}', '${escapedShortDesc}', '${exp.duration}', '${exp.difficulty}', '${exp.groupSize}', '${exp.price}', true, NOW(), NOW());\n`;
  console.log(`✓ ${exp.name}`);
});

// 生成关联关系的 SQL
console.log('\n=== GENERATING ASSOCIATIONS SQL ===');
sql += `
-- 获取城市和体验类型的 ID 并建立关联
SET @beijing_id = (SELECT id FROM cities WHERE slug = 'beijing' LIMIT 1);
SET @shanghai_id = (SELECT id FROM cities WHERE slug = 'shanghai' LIMIT 1);
SET @guilin_id = (SELECT id FROM cities WHERE slug = 'guilin' LIMIT 1);
SET @hangzhou_id = (SELECT id FROM cities WHERE slug = 'hangzhou' LIMIT 1);
SET @xian_id = (SELECT id FROM cities WHERE slug = 'xian' LIMIT 1);

SET @cultural_id = (SELECT id FROM experienceTypes WHERE slug = 'cultural-heritage' LIMIT 1);
SET @nature_id = (SELECT id FROM experienceTypes WHERE slug = 'nature-adventure' LIMIT 1);
SET @culinary_id = (SELECT id FROM experienceTypes WHERE slug = 'culinary-journey' LIMIT 1);
SET @urban_id = (SELECT id FROM experienceTypes WHERE slug = 'urban-exploration' LIMIT 1);

-- 城市体验关联
INSERT INTO cityExperiences (cityId, experienceId, sortOrder, createdAt, updatedAt)
SELECT @beijing_id, id, 1, NOW(), NOW() FROM experiences WHERE slug IN ('great-wall-sunrise-trek', 'forbidden-city-private-tour', 'hutong-cooking-class');

INSERT INTO cityExperiences (cityId, experienceId, sortOrder, createdAt, updatedAt)
SELECT @shanghai_id, id, 1, NOW(), NOW() FROM experiences WHERE slug IN ('bund-architecture-walk', 'french-concession-art-tour', 'shanghai-dim-sum-experience');

INSERT INTO cityExperiences (cityId, experienceId, sortOrder, createdAt, updatedAt)
SELECT @guilin_id, id, 1, NOW(), NOW() FROM experiences WHERE slug IN ('li-river-bamboo-rafting', 'karst-mountain-hiking', 'cormorant-fishing-night-show');

INSERT INTO cityExperiences (cityId, experienceId, sortOrder, createdAt, updatedAt)
SELECT @hangzhou_id, id, 1, NOW(), NOW() FROM experiences WHERE slug IN ('west-lake-sunrise-boat-tour', 'dragon-well-tea-plantation', 'lingyin-temple-meditation');

INSERT INTO cityExperiences (cityId, experienceId, sortOrder, createdAt, updatedAt)
SELECT @xian_id, id, 1, NOW(), NOW() FROM experiences WHERE slug IN ('terracotta-army-excavation-tour', 'muslim-quarter-food-tour');

-- 体验类型关联
INSERT INTO experienceTags (experienceId, tagId, createdAt, updatedAt)
SELECT id, @cultural_id, NOW(), NOW() FROM experiences WHERE slug IN ('forbidden-city-private-tour', 'cormorant-fishing-night-show', 'lingyin-temple-meditation', 'terracotta-army-excavation-tour');

INSERT INTO experienceTags (experienceId, tagId, createdAt, updatedAt)
SELECT id, @nature_id, NOW(), NOW() FROM experiences WHERE slug IN ('great-wall-sunrise-trek', 'li-river-bamboo-rafting', 'karst-mountain-hiking', 'west-lake-sunrise-boat-tour');

INSERT INTO experienceTags (experienceId, tagId, createdAt, updatedAt)
SELECT id, @culinary_id, NOW(), NOW() FROM experiences WHERE slug IN ('hutong-cooking-class', 'shanghai-dim-sum-experience', 'dragon-well-tea-plantation', 'muslim-quarter-food-tour');

INSERT INTO experienceTags (experienceId, tagId, createdAt, updatedAt)
SELECT id, @urban_id, NOW(), NOW() FROM experiences WHERE slug IN ('bund-architecture-walk', 'french-concession-art-tour');
`;

// 为每个体验添加详细块和标签
experiences.forEach(exp => {
  const details = generateDetailBlocks(exp.name);
  const labels = generateLabels();
  
  details.forEach((detail, idx) => {
    const escapedTitle = escapeSql(detail.title);
    const escapedContent = escapeSql(detail.content);
    sql += `INSERT INTO experienceDetails (experienceId, title, content, sortOrder, createdAt, updatedAt) SELECT id, '${escapedTitle}', '${escapedContent}', ${detail.sortOrder}, NOW(), NOW() FROM experiences WHERE slug = '${exp.slug}' LIMIT 1;\n`;
  });
  
  labels.forEach(label => {
    sql += `INSERT INTO experienceLabels (experienceId, label, createdAt, updatedAt) SELECT id, '${label}', NOW(), NOW() FROM experiences WHERE slug = '${exp.slug}' LIMIT 1;\n`;
  });
});

// 为每个体验添加 5 个随机图片
console.log('\n=== ADDING GALLERY IMAGES ===');
experiences.forEach(exp => {
  const selectedImages = [];
  for (let i = 0; i < 5; i++) {
    let randomImage;
    do {
      randomImage = images[Math.floor(Math.random() * images.length)];
    } while (selectedImages.includes(randomImage));
    selectedImages.push(randomImage);
    
    const imageUrl = `/uploads/images/${escapeSql(randomImage)}`;
    sql += `INSERT INTO experienceGallery (experienceId, imageUrl, sortOrder, createdAt, updatedAt) SELECT id, '${imageUrl}', ${i + 1}, NOW(), NOW() FROM experiences WHERE slug = '${exp.slug}' LIMIT 1;\n`;
  }
  console.log(`✓ Added 5 gallery images for ${exp.name}`);
});

// 写入 SQL 文件
fs.writeFileSync(path.join(__dirname, 'seed-data.sql'), sql);
console.log('\n✓ SQL file generated: seed-data.sql');
console.log(`Total SQL lines: ${sql.split('\n').length}`);
