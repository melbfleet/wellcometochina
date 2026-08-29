import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { X, ChevronLeft } from 'lucide-react';

/**
 * Experiences Overlay Component
 * Same design as DestinationsOverlay:
 * - Landscape: 3-col layout (category list | sub-items | preview image)
 * - Portrait/mobile: 2-page layout
 *   Page 1: category list single column, tap to go to page 2
 *   Page 2: sub-items for selected category, back button top-left
 */

interface ExperiencesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExperienceCategory {
  id: string;
  name: string;
  previewImage: string;
  items: string[];
}

const categories: ExperienceCategory[] = [
  {
    id: 'nature',
    name: 'Nature',
    previewImage: '',
    items: [
      "Tea Mountains of Ya'an",
      'Panda Habitat Walks',
      'Bamboo Forest Hikes',
      'Countryside Villages',
      'Mount Emei',
      'Western Sichuan Landscapes',
      'Rural Farming Experiences',
    ],
  },
  {
    id: 'culture',
    name: 'Culture',
    previewImage: '',
    items: [
      'Thangka Painting',
      'Sichuan Opera',
      'Tea Ceremony',
      'Tibetan Family Culture',
      'Traditional Crafts',
      'Calligraphy',
      'Local Festivals',
    ],
  },
  {
    id: 'history',
    name: 'History',
    previewImage: '',
    items: [
      'Leshan Giant Buddha',
      'Ancient Towns',
      'Tea Horse Road',
      'Historical Villages',
      'Religious Heritage',
      'Old Sichuan Architecture',
    ],
  },
  {
    id: 'adventure',
    name: 'Adventure',
    previewImage: '',
    items: [
      'Western Sichuan Road Trips',
      'Tibetan Highland Trekking',
      'Horse Riding',
      'Camping',
      'Hidden Village Exploration',
      'Plateau Journeys',
    ],
  },
  {
    id: 'local-life',
    name: 'Local Life',
    previewImage: '',
    items: [
      'Mahjong with Locals',
      'Local Markets',
      'Home Cooking',
      'Village Family Visits',
      'Teahouse Culture',
      'Blind Massage',
      'Traditional Chinese Medicine',
      'Daily Chengdu Life',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    previewImage: '',
    items: [
      'Sichuan Cooking Classes',
      'Hotpot Experiences',
      'Street Food Tours',
      'Tea Tasting',
      'Farm Dining',
      'Spice Markets',
      'Regional Cuisine',
    ],
  },
  {
    id: 'wellness',
    name: 'Wellness',
    previewImage: '',
    items: [
      'Traditional Chinese Medicine',
      'Meditation Retreats',
      'Tea Mindfulness',
      'Mountain Escapes',
      'Tibetan Healing Culture',
      'Temple Visits',
    ],
  },
];

export default function ExperiencesOverlay({ isOpen, onClose }: ExperiencesOverlayProps) {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>(categories[0]);
  const [portraitPage, setPortraitPage] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory(categories[0]);
      setPortraitPage(1);
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes expSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expCollapseUp {
          from { clip-path: inset(0 0 0 0); }
          to   { clip-path: inset(0 0 100% 0); }
        }
        .exp-closing {
          animation: expCollapseUp 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes expSlideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes expSlideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .exp-fullscreen {
          animation: expSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .exp-portrait-page1 { animation: expSlideRight 0.25s ease forwards; }
        .exp-portrait-page2 { animation: expSlideLeft 0.25s ease forwards; }
        .exp-cat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #222;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .exp-cat-row:hover { color: #c8a96e; }
        .exp-cat-row.exp-active { color: #c8a96e; }
        .exp-cat-row .exp-arr {
          font-size: 20px;
          margin-left: 10px;
          opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s;
          flex-shrink: 0;
        }
        .exp-cat-row:hover .exp-arr,
        .exp-cat-row.exp-active .exp-arr {
          opacity: 1;
          transform: translateX(4px);
        }
        .exp-sub-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #222;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .exp-sub-row:hover { color: #c8a96e; }
        .exp-sub-row .exp-arr {
          font-size: 20px;
          margin-left: 10px;
          opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s;
          flex-shrink: 0;
        }
        .exp-sub-row:hover .exp-arr {
          opacity: 1;
          transform: translateX(4px);
        }

        /* Hide preview image on portrait / narrow screens */
        @media (max-width: 768px) {
          .exp-preview-col { display: none !important; }
          .exp-landscape-layout { display: none !important; }
          .exp-portrait-layout { display: flex !important; }
        }
        @media (orientation: portrait) {
          .exp-preview-col { display: none !important; }
          .exp-landscape-layout { display: none !important; }
          .exp-portrait-layout { display: flex !important; }
        }
        .exp-portrait-layout { display: none; }
      `}</style>

      {/* Full-screen white overlay */}
      <div
        className="exp-fullscreen fixed z-40 bg-white overflow-hidden"
        style={{ top: '55px', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}
      >
        {/* Close button — aligned with ENQUIRE NOW right edge */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: 'clamp(28px, calc(-645px + 49.82vw), 305px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#222',
            padding: '4px',
          }}
        >
          <X size={24} />
        </button>

        {/* ── LANDSCAPE layout (3 columns) ── */}
        <div className="exp-landscape-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Col 1: Category list */}
          <div
            style={{
              flexShrink: 0,
              overflowY: 'hidden',
              paddingTop: '60px',
              paddingBottom: '40px',
              paddingRight: '40px',
              paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)',
              minWidth: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`exp-cat-row${activeCategory.id === cat.id ? ' exp-active' : ''}`}
                onMouseEnter={() => setActiveCategory(cat)}
                onClick={() => setActiveCategory(cat)}
              >
                <span>{cat.name}</span>
                <span className="exp-arr">›</span>
              </div>
            ))}
          </div>

          {/* Col 2: Sub-items */}
          <div
            style={{
              width: '320px',
              flexShrink: 0,
              overflowY: 'hidden',
              paddingTop: '60px',
              paddingBottom: '40px',
              paddingLeft: '28px',
              paddingRight: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {activeCategory.items.map((item, i) => (
              <div key={i} className="exp-sub-row">
                <span>{item}</span>
                <span className="exp-arr">›</span>
              </div>
            ))}
          </div>

          {/* Col 3: Preview image */}
          <div
            className="exp-preview-col"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              paddingTop: '60px',
              paddingBottom: '32px',
              paddingLeft: '32px',
              paddingRight: 'clamp(28px, calc(-645px + 49.82vw), 305px)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                height: '100%',
                maxHeight: '600px',
                overflow: 'hidden',
                flexShrink: 1,
              }}
            >
              <img
                key={activeCategory.id}
                src={activeCategory.previewImage}
                alt={activeCategory.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'right',
                  transition: 'opacity 0.4s ease',
                  display: 'block',
                }}
              />
            </div>
          </div>

        </div>

        {/* ── PORTRAIT layout (2-page) ── */}
        <div
          className="exp-portrait-layout"
          style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        >
          {/* Page 1: Category list */}
          {portraitPage === 1 && (
            <div
              className="exp-portrait-page1"
              style={{
                position: 'absolute', inset: 0,
                overflowY: 'auto',
                paddingTop: '60px',
                paddingBottom: '40px',
                paddingLeft: '32px',
                paddingRight: '64px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="exp-cat-row"
                  onClick={() => {
                    setActiveCategory(cat);
                    setPortraitPage(2);
                  }}
                >
                  <span>{cat.name}</span>
                  <span className="exp-arr">›</span>
                </div>
              ))}
            </div>
          )}

          {/* Page 2: Sub-items for selected category */}
          {portraitPage === 2 && (
            <div
              className="exp-portrait-page2"
              style={{
                position: 'absolute', inset: 0,
                overflowY: 'auto',
                paddingTop: '12px',
                paddingBottom: '40px',
                paddingLeft: '32px',
                paddingRight: '64px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Back button — vertically aligned with close button */}
              <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginBottom: '28px' }}>
                <button
                  onClick={() => setPortraitPage(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#222',
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '0',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              </div>

              {/* Category name as section title */}
              <div style={{
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#222',
                marginBottom: '16px',
              }}>
                {activeCategory.name}
              </div>

              {activeCategory.items.map((item, i) => (
                <div key={i} className="exp-sub-row">
                  <span>{item}</span>
                  <span className="exp-arr">›</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
