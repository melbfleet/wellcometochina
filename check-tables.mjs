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

const [tables] = await connection.execute('SHOW TABLES');
console.log('Tables in database:');
tables.forEach(t => console.log(' -', Object.values(t)[0]));

await connection.end();
