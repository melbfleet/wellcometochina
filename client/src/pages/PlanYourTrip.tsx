import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useMediaObjectPosition } from '@/lib/media-position';
import './PlanYourTrip.css';

interface TravelCard {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  category: 'destination' | 'experience';
  route?: string;
}

const PlanYourTrip: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'destination' | 'experience'>('experience');
  const [showAll, setShowAll] = useState(false);
  const [, navigate] = useLocation();
  const getObjectPosition = useMediaObjectPosition();

  const VISIBLE_COUNT = 6;

  // 动态加载城市列表
  const { data: citiesData = [] } = trpc.cms.listCitiesWithExperiences.useQuery();
  
  // 动态加载体验类型列表
  const { data: experienceTypesData = [] } = trpc.cms.listExperienceTypes.useQuery();
  
  // 动态加载完整体验列表
  const { data: experiencesData = [] } = trpc.cms.listExperiences.useQuery({});

  // 构建城市卡片
  const destinationCards: TravelCard[] = useMemo(() => {
    return citiesData.map(city => ({
      id: String(city.id),
      title: city.name.toUpperCase(),
      image: city.coverImage || '',
      category: 'destination' as const,
      route: `/destinations/${city.slug}`,
    }));
  }, [citiesData]);

  // 构建体验卡片
  const experienceCards: TravelCard[] = useMemo(() => {
    return experiencesData.map(exp => {
      const typeInfo = experienceTypesData.find(t => t.id === exp.typeId);
      const typeSlug = typeInfo?.slug || 'experience';
      return {
        id: String(exp.id),
        title: exp.name.toUpperCase(),
        image: exp.recommendationImage || '',
        category: 'experience' as const,
        route: `/experiences/${typeSlug}/${exp.slug}`,
      };
    });
  }, [experiencesData, experienceTypesData]);

  // 合并所有卡片
  const travelCards = [...destinationCards, ...experienceCards];

  const tabs: { key: 'destination' | 'experience'; label: string }[] = [
    { key: 'experience', label: 'BY EXPERIENCE' },
    { key: 'destination', label: 'BY DESTINATION' },
  ];

  const filteredCards = travelCards.filter(c => c.category === activeTab);
  const visibleCards = showAll ? filteredCards : filteredCards.slice(0, VISIBLE_COUNT);
  const hasMore = filteredCards.length > VISIBLE_COUNT;

  // Reset showAll when switching tabs
  const handleTabChange = (key: 'destination' | 'experience') => {
    setActiveTab(key);
    setShowAll(false);
  };

  const handleCardClick = (card: TravelCard) => {
    if (card.route) {
      navigate(card.route);
    }
  };

  return (
    <section className="w-full bg-white" style={{backgroundColor: '#e8e8e8', paddingTop: '50px', paddingBottom: '64px'}}>
      <div className="max-w-7xl mx-auto px-4">
        {/* 主标题 */}
        <h1
          className="text-center text-black mb-6"
          style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', 'Impact', sans-serif",
            fontWeight: '700',
            fontSize: '35px',
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          START YOUR JOURNEY
        </h1>

        {/* 筛选标签 */}
        <div className="flex justify-center gap-8 mb-10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                fontFamily: 'sans-serif',
                fontSize: '12px',
                fontWeight: '400',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: activeTab === tab.key ? '#111' : '#888',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                paddingBottom: '6px',
                borderBottom: activeTab === tab.key ? '2px solid #F5569B' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 卡片网格 */}
        <div className="plan-your-trip-grid mb-0">
          {visibleCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden group cursor-pointer"
              onClick={() => handleCardClick(card)}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: getObjectPosition(card.image) }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <h3
                  className="text-white text-center"
                  style={{
                    fontFamily: "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)",
                    fontSize: 'clamp(25px, 2.87vw, 37px)',
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    lineHeight: 0.95,
                    textTransform: 'uppercase',
                    maxWidth: '88%',
                  }}
                >
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-white/75 text-xs tracking-widest text-center font-sans" style={{ letterSpacing: '0.12em' }}>
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* VIEW MORE 按钮 */}
        {hasMore && !showAll && (
          <div className="flex justify-center mt-10">
            <button
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; setShowAll(true); }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                padding: '12px 32px',
                background: '#000',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '2px solid #000',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.3s, color 0.3s, transform 0.1s',
              }}
            >
              VIEW MORE
            </button>
          </div>
        )}

        {/* SHOW LESS 按钮（展开后显示） */}
        {showAll && hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(false)}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                padding: '12px 32px',
                background: '#000',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '2px solid #000',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.3s, color 0.3s, transform 0.1s',
              }}
            >
              SHOW LESS
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlanYourTrip;
