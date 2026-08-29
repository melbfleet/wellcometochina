import mysql from 'mysql2/promise';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

// 解析 DATABASE_URL
const url = new URL(DATABASE_URL);
const sslParam = url.searchParams.get('ssl');

const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: sslParam ? JSON.parse(sslParam) : undefined,
});

console.log('Connected to database');

// 要导出的表（按依赖顺序）
const tables = [
  'users',
  'tags',
  'cities',
  'experience_types',
  'experiences',
  'city_experiences',
  'city_what_to_see',
  'enquiries',
  'experience_details',
  'experience_labels',
  'experience_tags',
  'images',
  'itineraries',
  'itinerary_tags',
  'media_assets',
  'stories',
  'story_tags',
  'video_tags',
  'videos',
  'homepage_hero',
  'homepage_intro',
  'homepage_sponsors',
  'homepage_stories',
  'homepage_story_sections',
  'about_sections',
  'why_us_sections',
];

let output = `-- ============================================================
-- Wayseek China Travel - 完整数据导出
-- 数据库: u932753542_wayseekchina
-- 用户: u932753542_wayseekmark
-- 生成时间: ${new Date().toISOString()}
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET NAMES utf8mb4;

`;

for (const table of tables) {
  try {
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    
    if (rows.length === 0) {
      output += `-- Table: ${table} (0 rows)\n\n`;
      continue;
    }

    output += `-- Table: ${table} (${rows.length} rows)\n`;
    
    // 获取列名
    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `\`${c}\``).join(', ');
    
    // 生成 INSERT 语句（每行一个）
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
        // 转义字符串
        const escaped = String(val)
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return `'${escaped}'`;
      }).join(', ');
      
      output += `INSERT IGNORE INTO \`${table}\` (${colList}) VALUES (${values});\n`;
    }
    
    output += '\n';
    console.log(`Exported ${table}: ${rows.length} rows`);
  } catch (err) {
    console.error(`Error exporting ${table}:`, err.message);
    output += `-- Table: ${table} - ERROR: ${err.message}\n\n`;
  }
}

output += `SET FOREIGN_KEY_CHECKS = 1;\n\n-- 导出完成\n`;

fs.writeFileSync('/home/ubuntu/hostinger-deploy/data_fresh.sql', output);
console.log(`\nExport complete! File size: ${output.length} bytes`);

await connection.end();
