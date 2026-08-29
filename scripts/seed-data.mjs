import mysql from 'mysql2/promise';

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

async function seedData() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('Connected to database:', config.database);
    
    // Create tables
    console.log('Creating tables...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS experience_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(512),
        sortOrder INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        typeId INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        description TEXT,
        coverImage VARCHAR(512),
        cityDisplayImage VARCHAR(512),
        detailImage VARCHAR(512),
        duration VARCHAR(64),
        groupSize VARCHAR(64),
        difficulty VARCHAR(32),
        highlights TEXT,
        itinerary TEXT,
        price DECIMAL(10,2),
        currency VARCHAR(3),
        sortOrder INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS city_experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cityId INT NOT NULL,
        experienceId INT NOT NULL,
        displayImage VARCHAR(512),
        sortOrder INT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Insert test data
    console.log('Inserting test data...');
    
    // Insert experience type
    await connection.query(
      'INSERT INTO experience_types (name, slug, description, sortOrder, isActive) VALUES (?, ?, ?, ?, ?)',
      ['文化体验', 'cultural', '深入了解当地文化和传统', 1, true]
    );
    console.log('✓ Experience type inserted');
    
    // Insert experience
    await connection.query(
      'INSERT INTO experiences (typeId, name, slug, description, duration, groupSize, difficulty, sortOrder, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, '茶文化之旅', 'tea-culture-tour', '体验中国传统茶文化，学习茶艺', '3小时', '2-8人', '简单', 1, true]
    );
    console.log('✓ Experience inserted');
    
    // Insert city experience
    await connection.query(
      'INSERT INTO city_experiences (cityId, experienceId, displayImage, sortOrder) VALUES (?, ?, ?, ?)',
      [1, 1, '/manus-storage/test-city-exp.jpg', 1]
    );
    console.log('✓ City experience inserted');
    
    console.log('\n✅ Data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seedData().catch(console.error);
