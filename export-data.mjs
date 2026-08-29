import { createConnection } from 'mysql2/promise';
import fs from 'fs';

async function exportData() {
  const url = process.env.DATABASE_URL;
  // parse mysql://user:pass@host:port/db
  const urlObj = new URL(url.replace('mysql://', 'http://'));
  const user = urlObj.username;
  const password = urlObj.password;
  const host = urlObj.hostname;
  const port = parseInt(urlObj.port || '3306');
  const database = urlObj.pathname.replace('/', '');

  const conn = await createConnection({
    host, port, user, password, database,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  const tables = [
    'users','enquiries','tags','cities','experiences','experience_tags',
    'itineraries','itinerary_tags','stories','story_tags','videos','video_tags',
    'images','media_assets','team_members','homepage_hero','homepage_intro',
    'homepage_stories','homepage_story_sections','homepage_sponsors',
    'about_sections','why_us_sections'
  ];

  let sql = 'SET FOREIGN_KEY_CHECKS=0;\n\n';

  for (const table of tables) {
    try {
      const [rows] = await conn.query('SELECT * FROM `' + table + '`');
      if (rows.length === 0) {
        sql += `-- ${table}: empty\n`;
        continue;
      }

      sql += `-- Table: ${table} (${rows.length} rows)\n`;
      for (const row of rows) {
        const cols = Object.keys(row).map(k => '`' + k + '`').join(', ');
        const vals = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (v instanceof Date) return "'" + v.toISOString().replace('T', ' ').slice(0, 19) + "'";
          if (typeof v === 'boolean') return v ? '1' : '0';
          if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
          return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
        }).join(', ');
        sql += `INSERT IGNORE INTO \`${table}\` (${cols}) VALUES (${vals});\n`;
      }
      sql += '\n';
    } catch (e) {
      sql += `-- ${table}: ERROR - ${e.message}\n`;
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';
  fs.writeFileSync('/home/ubuntu/hostinger-deploy/data.sql', sql);
  console.log('Exported data.sql successfully');
  console.log('Tables exported:', tables.length);
  await conn.end();
}

exportData().catch(console.error);
