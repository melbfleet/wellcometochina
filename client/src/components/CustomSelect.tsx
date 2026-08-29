import { useState, useRef, useEffect, RefObject, ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;           // text label for search matching and fallback
  displayLabel?: ReactNode; // JSX to render in trigger button when selected
  optionLabel?: ReactNode;  // JSX to render in the dropdown list
  searchLabel?: string;     // extra text for search matching
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
  searchable?: boolean;
  dropdownContainerRef?: RefObject<HTMLElement | null>;
}

const ITEM_HEIGHT = 50;
const MAX_VISIBLE = 5;
const SEARCH_HEIGHT = 50;

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select',
  hasError = false,
  className = '',
  searchable = false,
  dropdownContainerRef,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = searchable && search.trim()
    ? options.filter(o => {
        const q = search.toLowerCase();
        return (
          o.label.toLowerCase().includes(q) ||
          (o.searchLabel || '').toLowerCase().includes(q)
        );
      })
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const clickedInside =
        (containerRef.current && containerRef.current.contains(e.target as Node)) ||
        (dropdownContainerRef?.current && dropdownContainerRef.current.contains(e.target as Node));
      if (!clickedInside) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownContainerRef]);

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setSearch('');
  }, [open, searchable]);

  useEffect(() => {
    if (!open || !dropdownContainerRef?.current || !containerRef.current) {
      setPanelStyle({});
      return;
    }
    const extRect = dropdownContainerRef.current.getBoundingClientRect();
    const selfRect = containerRef.current.getBoundingClientRect();
    const offsetLeft = selfRect.left - extRect.left;
    setPanelStyle({
      width: `${extRect.width}px`,
      left: `-${offsetLeft}px`,
      right: 'auto',
    });
  }, [open, dropdownContainerRef]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 bg-white outline-none border transition-all duration-300 text-base text-left
          ${open ? 'border-[#777777]' : 'border-transparent hover:border-[#777777]'}
          ${hasError ? '!border-red-400' : ''}
        `}
        style={{ height: `${ITEM_HEIGHT}px` }}
      >
        <span className={`flex items-center gap-2 ${selected ? 'text-[#2d2d2d]' : 'text-[#aaaaaa]'}`}>
          {selected
            ? (selected.displayLabel ?? selected.label)
            : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#aaaaaa] flex-shrink-0 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full z-50 bg-white overflow-hidden shadow-md"
          style={Object.keys(panelStyle).length > 0 ? panelStyle : { left: 0, right: 0 }}
        >
          {/* Search box */}
          {searchable && (
            <div className="flex items-center px-3 border-b border-[#eeeeee]" style={{ height: `${SEARCH_HEIGHT}px` }}>
              <Search size={14} className="text-[#aaaaaa] flex-shrink-0 mr-2" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 outline-none text-base text-[#2d2d2d] placeholder-[#aaaaaa] bg-transparent"
              />
            </div>
          )}

          {/* Options list */}
          <div
            className="overflow-y-auto"
            style={{ height: filtered.length === 0 ? `${ITEM_HEIGHT}px` : `${Math.min(filtered.length, MAX_VISIBLE) * ITEM_HEIGHT}px` }}
          >
            {filtered.length === 0 ? (
              <div className="flex items-center px-4 text-base text-[#aaaaaa]" style={{ height: `${ITEM_HEIGHT}px` }}>
                No results
              </div>
            ) : (
              filtered.map((opt, idx) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }
                  }}
                  className={`flex items-center gap-3 px-4 text-base transition-colors duration-150
                    ${opt.disabled ? 'text-[#cccccc] cursor-not-allowed' : 'text-[#2d2d2d] cursor-pointer hover:bg-[#f5f5f5]'}
                    ${opt.value === value ? 'bg-[#f0f0f0]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}
                  `}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  {opt.optionLabel ?? opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
