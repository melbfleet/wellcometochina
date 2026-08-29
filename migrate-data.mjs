import mysql from 'mysql2/promise';

// 原数据库连接信息
const sourceDb = {
  host: 'gateway06.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3iyiHfBmR8JKKYd.root',
  password: 'qeTR3f77e4BdgqsGq81P',
  database: 'MyrusigSFyHt56mC6szNGy',
  ssl: {
    rejectUnauthorized: false
  },
};

async function migrateData() {
  try {
    console.log('连接到原数据库...');
    const sourceConnection = await mysql.createConnection(sourceDb);
    
    console.log('获取所有表...');
    const [tables] = await sourceConnection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [sourceDb.database]
    );
    
    console.log(`找到 ${tables.length} 个表`);
    
    // 导出每个表的数据
    const allData = {};
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`导出表: ${tableName}`);
      
      const [rows] = await sourceConnection.query(`SELECT * FROM ${tableName}`);
      allData[tableName] = rows;
      console.log(`  - ${rows.length} 行数据`);
    }
    
    await sourceConnection.end();
    
    // 保存为 JSON
    console.log('保存数据到文件...');
    const fs = await import('fs').then(m => m.promises);
    await fs.writeFile('./migrated-data.json', JSON.stringify(allData, null, 2));
    
    console.log('数据导出完成！');
    
  } catch (error) {
    console.error('迁移失败:', error.message);
    process.exit(1);
  }
}

migrateData();
