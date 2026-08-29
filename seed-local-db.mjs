import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'wayseek_local',
  password: 'wayseek_local_pass',
  database: 'wayseek_local',
});

try {
  console.log('开始填充种子数据...');
  
  // Tags
  const tags = [
    { name: 'Cultural', type: 'city' },
    { name: 'Nature', type: 'city' },
    { name: 'Adventure', type: 'experience_type' },
    { name: 'Food', type: 'experience_type' },
    { name: 'History', type: 'other' },
  ];
  for (const tag of tags) {
    await connection.execute('INSERT INTO tags (name, type) VALUES (?, ?)', [tag.name, tag.type]);
  }
  console.log(`✓ tags: ${tags.length} 行`);
  
  // Experience Types
  const expTypes = [
    { name: 'Cultural Immersion' },
    { name: 'Nature & Hiking' },
    { name: 'Food & Culinary' },
    { name: 'Historical Tours' },
    { name: 'Adventure Sports' },
  ];
  for (const type of expTypes) {
    await connection.execute('INSERT INTO experience_types (name) VALUES (?)', [type.name]);
  }
  console.log(`✓ experience_types: ${expTypes.length} 行`);
  
  // Cities
  const cities = [
    { name: 'Chengdu & Sichuan', slug: 'chengdu-sichuan', description: 'Sichuan Province' },
    { name: 'Yunnan', slug: 'yunnan', description: 'Yunnan Province' },
    { name: 'Guilin & Yangshuo', slug: 'guilin-yangshuo', description: 'Guilin and Yangshuo' },
    { name: 'Xi\'an', slug: 'xian', description: 'Xi\'an City' },
  ];
  for (const city of cities) {
    await connection.execute('INSERT INTO cities (name, slug, description) VALUES (?, ?, ?)', [city.name, city.slug, city.description]);
  }
  console.log(`✓ cities: ${cities.length} 行`);
  
  // Experiences (使用实际的列名)
  const experiences = [
    { name: 'Panda Sanctuary', slug: 'panda-sanctuary', description: 'Visit pandas' },
    { name: 'Zhangjiajie Trekking', slug: 'zhangjiajie-trekking', description: 'Mountain trekking' },
    { name: 'Sichuan Hotpot', slug: 'sichuan-hotpot', description: 'Hotpot experience' },
  ];
  for (const exp of experiences) {
    await connection.execute('INSERT INTO experiences (name, slug, description) VALUES (?, ?, ?)', 
      [exp.name, exp.slug, exp.description]);
  }
  console.log(`✓ experiences: ${experiences.length} 行`);
  
  // Team Members
  const members = [
    { name: 'Sarah Chen', role: 'Guide', bio: 'Expert guide' },
    { name: 'Michael Zhang', role: 'Manager', bio: 'Tour manager' },
    { name: 'Lisa Wang', role: 'Guide', bio: 'Cultural guide' },
  ];
  for (const member of members) {
    await connection.execute('INSERT INTO team_members (name, role, bio) VALUES (?, ?, ?)', 
      [member.name, member.role, member.bio]);
  }
  console.log(`✓ team_members: ${members.length} 行`);
  
  // Itineraries
  const itineraries = [
    { name: 'Sichuan Culture & Nature', slug: 'sichuan-culture-nature', days: 12, price: '$3500' },
    { name: 'Yunnan Mountains & Minorities', slug: 'yunnan-mountains-minorities', days: 10, price: '$2800' },
    { name: 'Xi\'an Imperial Legacy', slug: 'xian-imperial-legacy', days: 8, price: '$2200' },
  ];
  for (const itin of itineraries) {
    await connection.execute('INSERT INTO itineraries (name, slug, days, price) VALUES (?, ?, ?, ?)', 
      [itin.name, itin.slug, itin.days, itin.price]);
  }
  console.log(`✓ itineraries: ${itineraries.length} 行`);
  
  // Stories
  const stories = [
    { title: 'Family Transformation in Guilin', slug: 'family-transformation-guilin', content: 'Story content' },
    { title: 'Finding Myself in Yunnan', slug: 'finding-myself-yunnan', content: 'Story content' },
  ];
  for (const story of stories) {
    await connection.execute('INSERT INTO stories (title, slug, content) VALUES (?, ?, ?)', 
      [story.title, story.slug, story.content]);
  }
  console.log(`✓ stories: ${stories.length} 行`);
  
  // Videos
  const videos = [
    { title: 'Guilin Karst Wonders', slug: 'guilin-karst-wonders', url: 'https://youtube.com/watch?v=1' },
    { title: 'Yunnan Mountain Trails', slug: 'yunnan-mountain-trails', url: 'https://youtube.com/watch?v=2' },
  ];
  for (const video of videos) {
    await connection.execute('INSERT INTO videos (title, slug, url) VALUES (?, ?, ?)', 
      [video.title, video.slug, video.url]);
  }
  console.log(`✓ videos: ${videos.length} 行`);
  
  console.log('\n✅ 种子数据填充完成！');
  await connection.end();
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}
