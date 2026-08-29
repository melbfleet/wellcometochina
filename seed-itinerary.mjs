import { createTRPCClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';

const BASE = 'http://localhost:3001';

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: `${BASE}/api/trpc`,
      transformer: SuperJSON,
    }),
  ],
});

const sections = [
  {
    id: 'section-karst-highlands',
    title: 'Karst Highlands & River Valleys',
    description: 'The journey begins in the dramatic karst landscape of southern China, where limestone peaks rise like ancient sentinels from a sea of green. Each morning brings new vistas, each village a different story woven into the fabric of this extraordinary land.',
    daysRange: 'Days 1 – 3',
    blocks: [
      {
        id: 'block-1',
        dayNumber: 1,
        title: 'Arrival in Guilin — City of Peaks',
        description: 'Touch down in Guilin as the afternoon light turns the karst mountains gold. After settling into your riverside guesthouse, take a slow walk along the Two Rivers and Four Lakes scenic route. The reflection of the peaks in the still water is one of those images that stays with you long after you have left. A quiet dinner of local river fish closes the day.',
        image: '/manus-storage/guilin-sunset_7ee34cdb.jpg',
      },
      {
        id: 'block-2',
        dayNumber: 2,
        title: 'Li River Cruise & Yangshuo',
        description: 'Board a traditional wooden vessel at dawn for the legendary Li River cruise to Yangshuo. For four hours the boat glides between peaks that have inspired Chinese painters for a thousand years. Arrive in Yangshuo for a leisurely afternoon — rent a bicycle, explore the back alleys of West Street, or simply sit by the Yulong River and watch bamboo rafts drift past. The evening belongs to the famous Impression Liu Sanjie light show on the river.',
        image: '/manus-storage/liriver-raft_628d61d9.jpg',
      },
      {
        id: 'block-3',
        dayNumber: 3,
        title: 'Longji Rice Terraces',
        description: 'Rise before dawn to reach the Longji terraces as the first light catches the curved steps carved into the mountainside over seven centuries ago. The Zhuang and Yao minority villages that cling to these slopes are still very much alive — women with hair wound into elaborate towers will invite you for tea, and the smell of wood smoke drifts through the morning mist. Stay long enough to see the terraces shift from silver to gold as the sun moves across the sky.',
        image: '/manus-storage/longji-aerial_b767c19a.jpg',
      },
    ],
    galleryImages: [
      '/manus-storage/guilin-sunset_7ee34cdb.jpg',
      '/manus-storage/guilin-karst_3e4640f3.jpg',
      '/manus-storage/guilin-panorama_8f32b372.webp',
      '/manus-storage/liriver-bamboo_5e65adbc.jpg',
      '/manus-storage/liriver-raft_628d61d9.jpg',
      '/manus-storage/liriver-raft2_65457b4f.jpg',
      '/manus-storage/longji-terraces_8ec2f880.jpg',
      '/manus-storage/longji-aerial_b767c19a.jpg',
    ],
  },
  {
    id: 'section-ancient-sichuan',
    title: 'Ancient Sichuan & Cloud Mountains',
    description: 'The second half of the journey moves north into Sichuan, where the air thickens with the scent of spice and the mountains grow wilder. This is panda country, the land of Jiuzhaigou\'s impossible blue lakes, and the towering sandstone pillars of Zhangjiajie that inspired the floating mountains of Avatar.',
    daysRange: 'Days 4 – 6',
    blocks: [
      {
        id: 'block-4',
        dayNumber: 4,
        title: 'Chengdu — Pandas & Hot Pot',
        description: 'Fly north to Chengdu, the laid-back capital of Sichuan province. The morning is spent at the Giant Panda Breeding Research Base, where you can watch the world\'s most beloved bears tumble through bamboo groves and nap in the sun with magnificent indifference. The afternoon is yours to explore Jinli Ancient Street, browse the tea houses of Renmin Park, or simply sit and watch the city move at its famously unhurried pace. The evening ends around a bubbling hot pot.',
        image: '/manus-storage/panda-bamboo_12d47bff.jpg',
      },
      {
        id: 'block-5',
        dayNumber: 5,
        title: 'Jiuzhaigou — The Valley of Nine Villages',
        description: 'A short flight brings you to one of China\'s most otherworldly landscapes. Jiuzhaigou\'s lakes are an impossible spectrum of turquoise, jade, and sapphire, coloured by mineral deposits and the reflection of the surrounding forest. Walk the wooden boardwalks above the water, past waterfalls that cascade between ancient trees draped in autumn colour. The Tibetan villages that give the valley its name offer a glimpse into a way of life that has changed little in centuries.',
        image: '/manus-storage/jiuzhaigou-lake_ca96fae5.jpg',
      },
      {
        id: 'block-6',
        dayNumber: 6,
        title: 'Zhangjiajie — The Floating Mountains',
        description: 'The final day takes you to the sandstone pillars of Zhangjiajie, the real-world inspiration for the floating Hallelujah Mountains of Avatar. Ride the world\'s longest outdoor escalator to the Tianmen Mountain glass walkway, then descend through the forest on a cable car as clouds swirl around the peaks. The late afternoon light turns the stone columns amber and rose, and for a moment the landscape seems to belong to another world entirely.',
        image: '/manus-storage/zhangjiajie-mist_43c5555d.jpeg',
      },
    ],
    galleryImages: [
      '/manus-storage/panda-bamboo_12d47bff.jpg',
      '/manus-storage/panda-baby_cfd74660.jpg',
      '/manus-storage/panda-eating_a162942a.jpg',
      '/manus-storage/jiuzhaigou-lake_ca96fae5.jpg',
      '/manus-storage/jiuzhaigou-turquoise_dd0c1df6.jpg',
      '/manus-storage/jiuzhaigou-autumn_5fbbc8a1.jpg',
      '/manus-storage/zhangjiajie-tall_1a93a1f9.jpg',
      '/manus-storage/zhangjiajie-mist_43c5555d.jpeg',
      '/manus-storage/zhangjiajie-wide_1b2eb1e2.jpg',
    ],
  },
];

const itineraryData = {
  name: 'Peaks, Pandas & Painted Rivers',
  slug: 'peaks-pandas-painted-rivers',
  place: 'Guilin · Yangshuo · Chengdu · Jiuzhaigou · Zhangjiajie',
  shortDescription: 'A six-day journey through southern China\'s most extraordinary landscapes — from the karst peaks of Guilin to the floating mountains of Zhangjiajie.',
  bannerImage: '/manus-storage/guilin-sunset_7ee34cdb.jpg',
  coverImage: '/manus-storage/liriver-raft_628d61d9.jpg',
  overviewTitle: 'Where Ancient Peaks Meet Living Cultures',
  description: 'China\'s southern and central provinces contain some of the most visually dramatic landscapes on earth — landscapes that have shaped Chinese art, poetry, and philosophy for millennia. This six-day journey moves between four of those landscapes: the karst peaks of Guilin, the terraced hillsides of Longji, the turquoise lakes of Jiuzhaigou, and the sandstone pillars of Zhangjiajie. Along the way you will encounter the minority cultures that have called these places home for centuries, eat food that bears no resemblance to what the rest of the world calls Chinese cuisine, and spend enough time in each place to actually feel it rather than simply photograph it.',
  when: 'Apr – Jun, Sep – Nov',
  price: 'From £3,200 pp',
  howLong: '6 nights',
  isActive: true,
  sortOrder: 1,
  sections: sections,
  tagIds: [],
};

try {
  console.log('Creating itinerary...');
  const result = await client.admin.createItinerary.mutate(itineraryData);
  console.log('Success! Created itinerary with ID:', result?.id ?? result);
} catch (err) {
  // Try public procedure if admin fails
  console.log('Admin failed, trying public procedure...', err?.message);
  try {
    const result = await client.cms.createItinerary.mutate(itineraryData);
    console.log('Success via cms! ID:', result?.id ?? result);
  } catch (err2) {
    console.error('Both failed:', err2?.message);
    process.exit(1);
  }
}
