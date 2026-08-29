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
    
    // Insert test data into experience_types
    console.log('Inserting experience type...');
    try {
      await connection.query(
        'INSERT INTO experience_types (name, coverImage, sortOrder) VALUES (?, ?, ?)',
        ['文化体验', '/manus-storage/cultural-icon.svg', 1]
      );
      console.log('✓ Experience type inserted');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠ Experience type already exists');
      } else {
        throw error;
      }
    }
    
    // Insert experience
    console.log('Inserting experience...');
    try {
      await connection.query(
        'INSERT INTO experiences (typeId, name, slug, description, duration, price, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, '茶文化之旅', 'tea-culture-tour', '体验中国传统茶文化，学习茶艺', '3小时', '¥299', 1]
      );
      console.log('✓ Experience inserted');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠ Experience already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seedData().catch(console.error);
