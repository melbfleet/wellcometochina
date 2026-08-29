import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: {},
});

console.log('✓ Connected to database');

// Insert Tags
const tagData = [
  ['Cultural', 'experience_type'],
  ['Nature', 'experience_type'],
  ['Adventure', 'experience_type'],
  ['Food', 'experience_type'],
  ['History', 'experience_type'],
];

for (const [name, type] of tagData) {
  try {
    await connection.execute(
      'INSERT INTO tags (name, type) VALUES (?, ?)',
      [name, type]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted tags');

// Insert Experience Types
const expTypeData = [
  ['Cultural Immersion', '/manus-storage/cultural-immersion.jpg'],
  ['Nature & Hiking', '/manus-storage/nature-hiking.jpg'],
  ['Food & Culinary', '/manus-storage/food-culinary.jpg'],
];

for (const [name, image] of expTypeData) {
  try {
    await connection.execute(
      'INSERT INTO experience_types (name, coverImage, sortOrder) VALUES (?, ?, ?)',
      [name, image, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted experience types');

// Insert Cities
const cityData = [
  {
    name: 'Chengdu & Sichuan',
    slug: 'chengdu-sichuan',
    description: 'Experience the spicy flavors and ancient culture of Sichuan',
    coverImage: '/manus-storage/chengdu-cover.jpg',
    introductionTitle: 'Welcome to Chengdu',
    introductionDescription: 'Discover the heart of Sichuan province',
  },
  {
    name: 'Yunnan',
    slug: 'yunnan',
    description: 'Mountains, minorities, and mystical landscapes',
    coverImage: '/manus-storage/yunnan-cover.jpg',
    introductionTitle: 'Yunnan Wonders',
    introductionDescription: 'Explore the diverse cultures of Yunnan',
  },
  {
    name: 'Guilin & Yangshuo',
    slug: 'guilin-yangshuo',
    description: 'Karst mountains and river landscapes',
    coverImage: '/manus-storage/guilin-cover.jpg',
    introductionTitle: 'Karst Beauty',
    introductionDescription: 'Witness the iconic limestone peaks',
  },
  {
    name: 'Xi\'an',
    slug: 'xian',
    description: 'Ancient imperial capital and Terracotta Army',
    coverImage: '/manus-storage/xian-cover.jpg',
    introductionTitle: 'Imperial Xi\'an',
    introductionDescription: 'Explore thousands of years of history',
  },
];

for (const city of cityData) {
  try {
    await connection.execute(
      `INSERT INTO cities (name, slug, description, coverImage, introductionTitle, introductionDescription, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [city.name, city.slug, city.description, city.coverImage, city.introductionTitle, city.introductionDescription, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted cities');

// Insert Experiences
const experienceData = [
  {
    name: 'Panda Sanctuary Visit',
    title: 'Meet Giant Pandas',
    slug: 'panda-sanctuary',
    description: 'Get up close with giant pandas in their natural habitat',
    typeId: 1,
    cityId: 1,
  },
  {
    name: 'Trekking in Zhangjiajie',
    title: 'Mountain Trekking',
    slug: 'zhangjiajie-trekking',
    description: 'Hike through stunning mountain landscapes',
    typeId: 2,
    cityId: 2,
  },
  {
    name: 'Sichuan Hotpot Cooking Class',
    title: 'Learn to Cook Hotpot',
    slug: 'hotpot-class',
    description: 'Master the art of authentic Sichuan hotpot',
    typeId: 3,
    cityId: 1,
  },
];

for (const exp of experienceData) {
  try {
    await connection.execute(
      `INSERT INTO experiences (name, title, slug, description, typeId, cityId, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [exp.name, exp.title, exp.slug, exp.description, exp.typeId, exp.cityId, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted experiences');

// Insert Team Members
const teamData = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    bio1: 'Sarah founded Wayseek with a passion for authentic travel experiences.',
    bio2: 'With 10 years of experience in China travel, she leads the team with vision and expertise.',
    quote: 'Travel is not about the destination, it\'s about the journey and the people you meet.',
    image: '/manus-storage/sarah-chen.jpg',
    specialty: 'Cultural Immersion',
    storyTitle: 'From Tourist to Local',
    storySubtitle: 'How Sarah discovered the real China',
    storyText: 'Sarah\'s journey began as a curious tourist. Over the years, she transformed into a local advocate...',
    sortOrder: 1,
  },
  {
    name: 'Michael Zhang',
    role: 'Head of Operations',
    bio1: 'Michael ensures every trip runs smoothly and exceeds expectations.',
    bio2: 'His attention to detail and local knowledge make him invaluable to the team.',
    quote: 'Every guest is unique, and every journey should reflect that.',
    image: '/manus-storage/michael-zhang.jpg',
    specialty: 'Logistics & Planning',
    storyTitle: 'The Art of Perfect Planning',
    storySubtitle: 'Michael\'s behind-the-scenes magic',
    storyText: 'Michael has mastered the art of coordinating complex travel logistics...',
    sortOrder: 2,
  },
  {
    name: 'Lisa Wang',
    role: 'Lead Guide',
    bio1: 'Lisa is our most experienced guide with deep knowledge of Yunnan and Tibet.',
    bio2: 'Her storytelling brings history and culture to life.',
    quote: 'The mountains have taught me more than any book ever could.',
    image: '/manus-storage/lisa-wang.jpg',
    specialty: 'Mountain Trekking & Culture',
    storyTitle: 'A Guide\'s Perspective',
    storySubtitle: 'Lisa\'s adventures in remote regions',
    storyText: 'Lisa has spent years exploring the remote regions of western China...',
    sortOrder: 3,
  },
];

for (const member of teamData) {
  try {
    await connection.execute(
      `INSERT INTO team_members (name, role, bio1, bio2, quote, image, specialty, storyTitle, storySubtitle, storyText, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [member.name, member.role, member.bio1, member.bio2, member.quote, member.image, member.specialty, 
       member.storyTitle, member.storySubtitle, member.storyText, member.sortOrder]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted team members');

// Insert Itineraries
const itineraryData = [
  {
    name: 'Sichuan: Culture & Nature',
    slug: 'sichuan-culture-nature',
    shortDescription: 'Explore the spicy heart of China',
    description: 'A comprehensive 12-day journey through Sichuan province',
    days: 12,
    price: '$2,500',
    difficulty: 'medium',
  },
  {
    name: 'Yunnan: Mountains & Minorities',
    slug: 'yunnan-mountains-minorities',
    shortDescription: 'Discover diverse cultures and landscapes',
    description: 'A 10-day adventure through Yunnan\'s stunning mountains',
    days: 10,
    price: '$2,200',
    difficulty: 'medium',
  },
  {
    name: 'Xi\'an: Imperial Legacy',
    slug: 'xian-imperial-legacy',
    shortDescription: 'Walk through 3,000 years of history',
    description: 'An 8-day exploration of ancient China',
    days: 8,
    price: '$1,800',
    difficulty: 'easy',
  },
];

for (const itinerary of itineraryData) {
  try {
    await connection.execute(
      `INSERT INTO itineraries (name, slug, shortDescription, description, days, price, difficulty, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itinerary.name, itinerary.slug, itinerary.shortDescription, itinerary.description, 
       itinerary.days, itinerary.price, itinerary.difficulty, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted itineraries');

// Insert Stories
const storyData = [
  {
    title: 'A Family\'s Transformation in Guilin',
    slug: 'family-transformation-guilin',
    content: 'The Johnson family came to Guilin expecting a typical tourist experience. What they found was so much more...',
    coverImage: '/manus-storage/story-guilin.jpg',
  },
  {
    title: 'Finding Myself in Yunnan',
    slug: 'finding-self-yunnan',
    content: 'Emma spent three weeks in Yunnan and discovered a part of herself she didn\'t know existed...',
    coverImage: '/manus-storage/story-yunnan.jpg',
  },
];

for (const story of storyData) {
  try {
    await connection.execute(
      `INSERT INTO stories (title, slug, content, coverImage, sortOrder) 
       VALUES (?, ?, ?, ?, ?)`,
      [story.title, story.slug, story.content, story.coverImage, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted stories');

// Insert Videos
const videoData = [
  {
    title: 'Guilin: Karst Wonders',
    slug: 'guilin-karst-wonders',
    description: 'Explore the iconic limestone peaks of Guilin',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    coverImage: '/manus-storage/video-guilin.jpg',
  },
  {
    title: 'Yunnan: Mountain Trails',
    slug: 'yunnan-mountain-trails',
    description: 'Trek through the misty mountains of Yunnan',
    videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    coverImage: '/manus-storage/video-yunnan.jpg',
  },
];

for (const video of videoData) {
  try {
    await connection.execute(
      `INSERT INTO videos (title, slug, description, videoUrl, coverImage, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [video.title, video.slug, video.description, video.videoUrl, video.coverImage, 0]
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') throw e;
  }
}
console.log('✓ Inserted videos');

await connection.end();
console.log('\n✅ Database seeding completed successfully!');
