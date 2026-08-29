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

try {
  await connection.execute('DROP TABLE IF EXISTS __drizzle_migrations');
  console.log('✓ Dropped __drizzle_migrations table');
} catch (e) {
  console.error('Error:', e.message);
}

await connection.end();
