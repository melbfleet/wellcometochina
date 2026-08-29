import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { X, ChevronLeft } from 'lucide-react';

/**
 * Destinations Overlay Component
 * Design: Black Tomato-inspired full-screen white overlay
 * - Landscape: 3-col layout (city list | experiences | preview image)
 * - Portrait/mobile: 2-page layout
 *   Page 1: city list single column, tap to go to page 2
 *   Page 2: experience list for selected city, back button top-left
 */

interface DestinationsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Destination {
  id: string;
  name: string;
  previewImage: string;
  experiences: string[];
  route?: string;
}

const destinations: Destination[] = [
  {
    id: 'chengdu-sichuan',
    name: 'Chengdu & Sichuan',
    previewImage: '',
    route: '/destinations/sichuan',
    experiences: [
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
    id: 'chongqing',
    name: 'Chongqing',
    previewImage: '',
    experiences: [
      'Yangtze River Cruises',
      'Hotpot Culture',
      'Ancient Town Walks',
      'Night Views of the City',
      'Three Gorges Exploration',
      'Local Street Food',
      'Mountain Village Hikes',
    ],
  },
  {
    id: 'yunnan',
    name: 'Yunnan (Dali, Lijiang, Shangri-La)',
    previewImage: '',
    experiences: [
      'Dali Old Town',
      'Lijiang Ancient City',
      'Shangri-La Grasslands',
      'Tiger Leaping Gorge',
      'Ethnic Minority Villages',
      'Naxi Culture & Music',
      'High-Altitude Trekking',
    ],
  },
  {
    id: 'tibet',
    name: 'Tibet / Xizang',
    previewImage: '',
    experiences: [
      'Potala Palace',
      'Jokhang Temple',
      'Tibetan Monastery Visits',
      'Plateau Trekking',
      'Nomadic Family Stays',
      'Sacred Lake Namtso',
      'Tibetan Buddhist Culture',
    ],
  },
  {
    id: 'guizhou',
    name: 'Guizhou',
    previewImage: '',
    experiences: [
      'Miao Village Festivals',
      'Dong Drum Tower Culture',
      'Huangguoshu Waterfall',
      'Rice Terrace Landscapes',
      'Traditional Embroidery',
      'Ancient Town Exploration',
      'Local Minority Cuisine',
    ],
  },
  {
    id: 'yangshuo-guilin',
    name: 'Yangshuo & Guilin',
    previewImage: '',
    experiences: [
      'Li River Cruise',
      'Karst Peak Cycling',
      'Reed Flute Cave',
      'Longji Rice Terraces',
      'Cormorant Fishing',
      'Local Village Walks',
      'Cooking with Locals',
    ],
  },
  {
    id: 'zhangjiajie',
    name: 'Zhangjiajie',
    previewImage: '',
    experiences: [
      'Avatar Mountains Hike',
      'Glass Bridge Walk',
      'Tianmen Mountain Cable Car',
      'Hidden Valley Trails',
      'Tujia Cultural Villages',
      'Forest Canopy Walks',
      'Sunrise Photography',
    ],
  },
  {
    id: 'xian',
    name: "Xi'an",
    previewImage: '',
    experiences: [
      'Terracotta Warriors',
      'Ancient City Wall Cycling',
      'Muslim Quarter Food Tour',
      'Tang Dynasty Culture',
      'Silk Road History',
      'Drum & Bell Tower',
      'Local Dumpling Banquet',
    ],
  },
  {
    id: 'xinjiang',
    name: 'Xinjiang',
    previewImage: '',
    experiences: [
      'Kashgar Old City',
      'Taklamakan Desert',
      'Tianchi Lake',
      'Uyghur Culture & Cuisine',
      'Silk Road Bazaars',
      'Grape Valley Turpan',
      'Karakoram Highway Drive',
    ],
  },
  {
    id: 'beijing',
    name: 'Beijing',
    previewImage: '',
    experiences: [
      'Great Wall Hike',
      'Forbidden City',
      'Hutong Rickshaw Tour',
      'Temple of Heaven',
      'Summer Palace',
      'Peking Duck Dinner',
      'Traditional Courtyard Stay',
    ],
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    previewImage: '',
    experiences: [
      'The Bund Night Walk',
      'French Concession',
      'Yu Garden',
      'Contemporary Art Scene',
      'Xintiandi Culture',
      'Local Longtang Life',
      'Suzhou Day Trip',
    ],
  },
];

export default function DestinationsOverlay({ isOpen, onClose }: DestinationsOverlayProps) {
  const [, setLocation] = useLocation();
  const [activeDestination, setActiveDestination] = useState<Destination>(destinations[0]);
  const [portraitPage, setPortraitPage] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) {
      setActiveDestination(destinations[0]);
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

  const handleDestinationClick = (dest: Destination) => {
    if (dest.route) {
      onClose();
      setLocation(dest.route);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes btSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btCollapseUp {
          from { clip-path: inset(0 0 0 0); }
          to   { clip-path: inset(0 0 100% 0); }
        }
        .bt-closing {
          animation: btCollapseUp 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes btSlideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes btSlideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .bt-fullscreen {
          animation: btSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .bt-portrait-page1 { animation: btSlideRight 0.25s ease forwards; }
        .bt-portrait-page2 { animation: btSlideLeft 0.25s ease forwards; }
        .bt-dest-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: none;
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
        .bt-dest-row:hover { color: #c8a96e; }
        .bt-dest-row.bt-active { color: #c8a96e; }
        .bt-dest-row .bt-arr {
          font-size: 20px;
          margin-left: 10px;
          opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s;
          flex-shrink: 0;
        }
        .bt-dest-row:hover .bt-arr,
        .bt-dest-row.bt-active .bt-arr {
          opacity: 1;
          transform: translateX(4px);
        }
        .bt-exp-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: none;
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
        .bt-exp-row:hover { color: #c8a96e; }

        /* Hide preview image on portrait / narrow screens */
        @media (max-width: 768px) {
          .bt-preview-col { display: none !important; }
          .bt-landscape-layout { display: none !important; }
          .bt-portrait-layout { display: flex !important; }
        }
        @media (orientation: portrait) {
          .bt-preview-col { display: none !important; }
          .bt-landscape-layout { display: none !important; }
          .bt-portrait-layout { display: flex !important; }
        }
        .bt-portrait-layout { display: none; }
      `}</style>

      {/* Full-screen white overlay — starts below navbar (top: 55px) */}
      <div
        className="bt-fullscreen fixed z-40 bg-white overflow-hidden"
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
        <div className="bt-landscape-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Col 1: Destination list */}
          <div
            style={{
              flexShrink: 0,
              overflowY: 'hidden',
              paddingTop: '60px',
              paddingBottom: '40px',
              paddingRight: '40px',
              paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)',
              minWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className={`bt-dest-row${activeDestination.id === dest.id ? ' bt-active' : ''}`}
                onMouseEnter={() => setActiveDestination(dest)}
                onClick={() => handleDestinationClick(dest)}
              >
                <span>{dest.name}</span>
                <span className="bt-arr">›</span>
              </div>
            ))}
          </div>

          {/* Col 2: Experience sub-items */}
          <div
            style={{
              width: '260px',
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
              {activeDestination.experiences.map((exp, i) => (
              <div key={i} className="bt-exp-row">
                <span>{exp}</span>
                <span className="bt-arr">›</span>
              </div>
            ))}
          </div>

          {/* Col 3: Preview image */}
          <div
            className="bt-preview-col"
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
                key={activeDestination.id}
                src={activeDestination.previewImage}
                alt={activeDestination.name}
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
          className="bt-portrait-layout"
          style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        >
          {/* Page 1: City list */}
          {portraitPage === 1 && (
            <div
              className="bt-portrait-page1"
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
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bt-dest-row"
                  onClick={() => {
                    setActiveDestination(dest);
                    setPortraitPage(2);
                  }}
                >
                  <span>{dest.name}</span>
                  <span className="bt-arr">›</span>
                </div>
              ))}
            </div>
          )}

          {/* Page 2: Experience list for selected city */}
          {portraitPage === 2 && (
            <div
              className="bt-portrait-page2"
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
              {/* Back button — vertically aligned with close button (top:12px + 4px padding = 16px center) */}
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

              {/* City name as section title */}
              <div style={{
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#222',
                marginBottom: '16px',
              }}>
                {activeDestination.name}
              </div>

              {activeDestination.experiences.map((exp, i) => (
                <div key={i} className="bt-exp-row">
                  <span>{exp}</span>
                  <span className="bt-arr">›</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
