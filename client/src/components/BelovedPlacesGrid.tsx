import React from 'react';

interface DestinationCard {
  id: number;
  name: string;
  description: string;
  image: string;
}

const destinationData: DestinationCard[] = [
  {
    id: 1,
    name: 'GUILIN',
    description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone, creating timeless beauty that has inspired artists for centuries.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  },
  {
    id: 2,
    name: 'ZHANGJIAJIE',
    description: 'Towering stone pillars pierce the clouds. A realm of vertical cliffs and misty valleys, where nature sculpts monuments to inspire wonder and adventure.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  },
  {
    id: 3,
    name: 'YUNNAN',
    description: 'Terraced rice fields cascade down mountainsides. Golden waves of grain reflect centuries of harmony between people and landscape.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  },
  {
    id: 4,
    name: 'TIBET',
    description: 'Stand at the roof of the world where vast grasslands meet snow-capped Himalayas, prayer flags flutter in thin air, and infinite horizons inspire profound tranquility.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  }
];

export default function BelovedPlacesGrid() {
  return (
    <section className="bg-[#F5F3EF]">
      <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-[600px]">
        {/* 左侧深灰色背景 - 30% */}
        <div className="w-full lg:w-[30%] bg-[#3A3A3A] px-8 lg:px-12 py-12 lg:py-16 flex flex-col justify-center">
          <h2 className="text-white font-serif text-3xl lg:text-4xl font-light mb-4 tracking-wide">
            FROM BELOVED PLACES
          </h2>
          <p className="text-gray-300 text-sm font-light leading-relaxed max-w-sm">
            Remarkable experiences to inspire the mind. Picture yourself strolling down sun-soaked beaches, journeying through jungles, or honouring the history of celebrated cities.
          </p>
        </div>

        {/* 右侧卡片网格 - 70% */}
        <div className="w-full lg:w-[70%] bg-[#F5F3EF] p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationData.map((destination) => (
              <div 
                key={destination.id}
                className="relative overflow-hidden group h-[350px] md:h-[320px] lg:h-[300px]"
              >
                {/* 图片 */}
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>

                {/* 内容 */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white font-serif text-2xl font-light mb-3">
                    {destination.name}
                  </h3>
                  <p className="text-gray-200 text-xs leading-relaxed font-light line-clamp-2">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
