import mysql from 'mysql2/promise';
import fs from 'fs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

// Parse MySQL connection string
const url = new URL(connectionString);
const config = {
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : undefined,
};

// Get random image from the folder
const imageDir = '/home/ubuntu/upload/聚焦';
const images = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg'));

function getRandomImage() {
  return `/manus-storage/${images[Math.floor(Math.random() * images.length)]}`;
}

function getRandomColor() {
  // Generate random color, but not black
  let color;
  do {
    color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  } while (color === '#000000');
  return color;
}

async function generateSampleData() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('Connected to database:', config.database);
    
    // Clear all data first
    console.log('\nClearing existing data...');
    await connection.query('DELETE FROM experience_tags');
    await connection.query('DELETE FROM experience_details');
    await connection.query('DELETE FROM experiences');
    await connection.query('DELETE FROM experience_types');
    await connection.query('DELETE FROM tags');
    await connection.query('DELETE FROM cities');
    console.log('✓ All data cleared');
    
    // 1. Create a city
    console.log('\n1. Creating a city...');
    const cityData = {
      name: 'Chengdu',
      slug: 'chengdu-city',
      description: 'Chengdu is the capital of Sichuan Province, known for its laid-back lifestyle, delicious cuisine, and giant pandas.',
      coverImage: getRandomImage(),
      cityCardImage: getRandomImage(),
      introductionTitle: 'Welcome to Chengdu',
      introductionDescription: 'Experience the charm of ancient Sichuan culture combined with modern urban development.',
      culinaryTravelLargeImage: getRandomImage(),
      culinaryTravelLargeTitle: 'Sichuan Culinary Journey',
      culinaryTravelLargeDescription: 'Discover the bold and spicy flavors of authentic Sichuan cuisine.',
      culinaryTravelSmall1Image: getRandomImage(),
      culinaryTravelSmall1Title: 'Street Food Culture',
      culinaryTravelSmall1Description: 'Explore vibrant night markets and local street food vendors.',
      culinaryTravelSmall2Image: getRandomImage(),
      culinaryTravelSmall2Title: 'Tea House Tradition',
      culinaryTravelSmall2Description: 'Relax in traditional teahouses and enjoy local tea culture.',
      ctaBgColor: getRandomColor(),
      sortOrder: 1,
      isActive: true,
    };
    
    await connection.query(
      `INSERT INTO cities (name, slug, description, coverImage, cityCardImage, introductionTitle, introductionDescription, 
       culinaryTravelLargeImage, culinaryTravelLargeTitle, culinaryTravelLargeDescription,
       culinaryTravelSmall1Image, culinaryTravelSmall1Title, culinaryTravelSmall1Description,
       culinaryTravelSmall2Image, culinaryTravelSmall2Title, culinaryTravelSmall2Description,
       ctaBgColor, sortOrder, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cityData.name, cityData.slug, cityData.description, cityData.coverImage, cityData.cityCardImage,
        cityData.introductionTitle, cityData.introductionDescription,
        cityData.culinaryTravelLargeImage, cityData.culinaryTravelLargeTitle, cityData.culinaryTravelLargeDescription,
        cityData.culinaryTravelSmall1Image, cityData.culinaryTravelSmall1Title, cityData.culinaryTravelSmall1Description,
        cityData.culinaryTravelSmall2Image, cityData.culinaryTravelSmall2Title, cityData.culinaryTravelSmall2Description,
        cityData.ctaBgColor, cityData.sortOrder, cityData.isActive,
      ]
    );
    console.log('✓ City created: Chengdu');
    
    // 2. Create an experience type
    console.log('\n2. Creating an experience type...');
    const expTypeData = {
      name: 'Cultural Experiences',
      coverImage: getRandomImage(),
      sortOrder: 1,
    };
    
    await connection.query(
      'INSERT INTO experience_types (name, coverImage, sortOrder) VALUES (?, ?, ?)',
      [expTypeData.name, expTypeData.coverImage, expTypeData.sortOrder]
    );
    console.log('✓ Experience type created: Cultural Experiences');
    
    // 3. Create an experience
    console.log('\n3. Creating an experience...');
    const experienceData = {
      typeId: 1,
      cityId: 1,
      name: 'Tea Culture Immersion',
      title: 'Traditional Tea Art and Ceremony',
      slug: 'tea-culture-immersion',
      when: 'Year-round, best in spring and autumn',
      price: '$89 per person',
      duration: '3 hours',
      description: 'Learn the art of traditional Chinese tea preparation and ceremony. This immersive experience takes you through the history of tea culture, the different types of tea, and the proper techniques for brewing and serving.',
      recommendationTitle: 'A Must-Do Experience',
      recommendationDescription: 'Perfect for tea enthusiasts and anyone wanting to understand Chinese culture deeper. Our expert tea masters will guide you through an authentic tea ceremony.',
      ctaBgColor: getRandomColor(),
      cityDisplayImage: getRandomImage(),
      recommendationImage: getRandomImage(),
      gallery: JSON.stringify([getRandomImage(), getRandomImage(), getRandomImage(), getRandomImage(), getRandomImage()]),
      sortOrder: 1,
      isActive: true,
    };
    
    await connection.query(
      `INSERT INTO experiences (typeId, cityId, name, title, slug, \`when\`, price, duration, description, 
       recommendationTitle, recommendationDescription, ctaBgColor, cityDisplayImage, recommendationImage, gallery, sortOrder, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        experienceData.typeId, experienceData.cityId, experienceData.name, experienceData.title, experienceData.slug,
        experienceData.when, experienceData.price, experienceData.duration, experienceData.description,
        experienceData.recommendationTitle, experienceData.recommendationDescription, experienceData.ctaBgColor,
        experienceData.cityDisplayImage, experienceData.recommendationImage, experienceData.gallery,
        experienceData.sortOrder, experienceData.isActive,
      ]
    );
    console.log('✓ Experience created: Tea Culture Immersion');
    
    // 4. Create detail blocks for the experience
    console.log('\n4. Creating detail blocks...');
    const detailBlocks = [
      {
        experienceId: 1,
        description: 'Begin your journey with an introduction to the history of Chinese tea culture spanning over 4,000 years. Learn about the different regions and their unique tea varieties.',
        imageUrl: getRandomImage(),
        sortOrder: 1,
      },
      {
        experienceId: 1,
        description: 'Master the traditional tea brewing techniques including water temperature, steeping time, and the proper way to handle tea leaves. Practice with our expert instructors.',
        imageUrl: getRandomImage(),
        sortOrder: 2,
      },
      {
        experienceId: 1,
        description: 'Participate in a formal tea ceremony and learn the etiquette and significance of each movement. Enjoy tasting different premium teas paired with traditional snacks.',
        imageUrl: getRandomImage(),
        sortOrder: 3,
      },
    ];
    
    for (const block of detailBlocks) {
      await connection.query(
        'INSERT INTO experience_details (experienceId, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?)',
        [block.experienceId, block.description, block.imageUrl, block.sortOrder]
      );
    }
    console.log(`✓ ${detailBlocks.length} detail blocks created`);
    
    // 5. Create a tag
    console.log('\n5. Creating a tag...');
    const tagData = {
      name: 'Cultural Heritage',
      type: 'experience_type',
      color: getRandomColor(),
    };
    
    await connection.query(
      'INSERT INTO tags (name, type, color) VALUES (?, ?, ?)',
      [tagData.name, tagData.type, tagData.color]
    );
    console.log('✓ Tag created: Cultural Heritage');
    
    // 6. Link experience to tag
    console.log('\n6. Linking experience to tag...');
    await connection.query(
      'INSERT INTO experience_tags (experienceId, tagId) VALUES (?, ?)',
      [1, 1]
    );
    console.log('✓ Experience linked to tag');
    
    console.log('\n✅ Sample data generated successfully!');
    console.log('\nSummary:');
    console.log('  - City: Chengdu');
    console.log('  - Experience Type: Cultural Experiences');
    console.log('  - Experience: Tea Culture Immersion');
    console.log('  - Detail Blocks: 3');
    console.log('  - Tag: Cultural Heritage');
    
  } catch (error) {
    console.error('Error generating sample data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

generateSampleData().catch(console.error);
