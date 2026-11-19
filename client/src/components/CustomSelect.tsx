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
  id?: string;
  label?: string;
  errorId?: string;
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
  id,
  label,
  errorId,
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
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    if (open && searchable && window.matchMedia('(pointer: fine)').matches) {
      searchRef.current?.focus({ preventScroll: true });
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

  if (!searchable) {
    return (
      <div className={`relative w-full ${className}`}>
        <select
          id={id}
          aria-label={label}
          aria-invalid={hasError || undefined}
          aria-describedby={errorId}
          value={value}
          onChange={event => onChange(event.target.value)}
          className={`h-[50px] w-full appearance-none rounded-none border bg-white pl-4 pr-9 text-base focus:border-[#777777] focus:outline-none ${hasError ? 'border-red-400' : 'border-transparent'} ${value ? 'text-[#2d2d2d]' : 'text-[#666666]'}`}
        >
          <option value="">{placeholder}</option>
          {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#666666]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      {/* Trigger */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-label={label && `${label}: ${selected?.label || placeholder}`}
        aria-expanded={open}
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
                aria-label="Search country codes"
                placeholder="Search country or code"
                className="min-w-0 flex-1 outline-none text-base text-[#2d2d2d] placeholder-[#666666] bg-transparent"
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
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                      triggerRef.current?.focus({ preventScroll: true });
                    }
                  }}
                  className={`flex w-full items-center gap-3 px-4 text-left text-base transition-colors duration-150
                    ${opt.disabled ? 'text-[#cccccc] cursor-not-allowed' : 'text-[#2d2d2d] cursor-pointer hover:bg-[#f5f5f5]'}
                    ${opt.value === value ? 'bg-[#f0f0f0]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}
                  `}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  {opt.optionLabel ?? opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
