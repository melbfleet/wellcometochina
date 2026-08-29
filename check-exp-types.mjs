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

async function checkSchema() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('Connected to database:', config.database);
    
    // Check experience_types table
    const [rows] = await connection.query('DESCRIBE experience_types');
    console.log('\nexperience_types table structure:');
    rows.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema().catch(console.error);
