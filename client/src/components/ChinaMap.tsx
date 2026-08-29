import { useState, useCallback } from 'react';
import china from '@svg-maps/china';

interface ChinaMapProps {
  onProvinceClick?: (provinceId: string, provinceName: string) => void;
  externalHoveredProvince?: string | null;
  showTooltip?: boolean;
}

export default function ChinaMap({ onProvinceClick, externalHoveredProvince, showTooltip = true }: ChinaMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const displayedHovered = externalHoveredProvince || hoveredLocation;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleLocationClick = (event: React.MouseEvent<SVGPathElement>) => {
    const locationId = event.currentTarget.getAttribute('id');
    const locationName = event.currentTarget.getAttribute('name');
    if (locationId && locationName && onProvinceClick) {
      onProvinceClick(locationId, locationName);
    }
  };

  const handleLocationMouseOver = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    const locationName = event.currentTarget.getAttribute('name');
    setHoveredLocation(locationName);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleLocationMouseOut = useCallback(() => {
    setHoveredLocation(null);
  }, []);

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <svg
        viewBox={china.viewBox}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        {china.locations.map((location: any) => (
          <path
            key={location.id}
            id={location.id}
            name={location.name}
            d={location.path}
            fill={displayedHovered === location.name ? '#d4af37' : '#2a2a2a'}
            stroke="#ffffff"
            strokeWidth="0.5"
            className="transition-colors duration-200 cursor-pointer hover:fill-[#d4af37] will-change-[fill]"
            onMouseOver={handleLocationMouseOver}
            onMouseOut={handleLocationMouseOut}
            onClick={handleLocationClick}
          />
        ))}
      </svg>
      
      {hoveredLocation && showTooltip && (
        <div 
          className="fixed bg-black/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm pointer-events-none z-50 shadow-lg border border-[#d4af37]/30"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        >
          <p className="font-display text-sm whitespace-nowrap">{hoveredLocation}</p>
        </div>
      )}
    </div>
  );
}
