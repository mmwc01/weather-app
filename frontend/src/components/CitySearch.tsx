import { useRef, useState } from 'react';
import { CityOption } from '../types/weather';
import { useCitySearch } from '../hooks/useCitySearch';
import { CityOptionSchema } from '../schemas/api';
import Tooltip from './Tooltip';
import CityDropdown from './CityDropdown';
import { cityLabel } from '../utils/cityLabel';

const API_URL = import.meta.env.VITE_API_URL;

interface CitySearchProps {
  onSelect:      (city: CityOption) => void;
  selectedCity?: CityOption | null;
}

export default function CitySearch({ onSelect, selectedCity }: CitySearchProps) {
  const {
    inputValue, results, isOpen, loading, loadingMore, hasError, hasMore, activeIndex,
    handleChange, handleFocus, handleKeyDown, handleBlur, handleMouseEnter, clearInput, select, loadMore,
  } = useCitySearch(onSelect);

  const [luckyLoading, setLuckyLoading] = useState(false);
  const [luckyError, setLuckyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  function handleClearInput() {
    clearInput();
    inputRef.current?.focus();
  }

  async function handleLucky() {
    setLuckyLoading(true);
    setLuckyError(false);
    try {
      const res = await fetch(`${API_URL}/api/cities/random`);
      if (!res.ok) throw new Error(`${res.status}`);
      const city = CityOptionSchema.parse(await res.json());
      select(city);
    } catch (err) {
      console.warn('Lucky city fetch failed:', err);
      setLuckyError(true);
      setTimeout(() => setLuckyError(false), 3000);
    } finally {
      setLuckyLoading(false);
    }
  }

  const placeholder = selectedCity ? cityLabel(selectedCity) : 'Start typing to search cities…';

  return (
    <div className="w-full" role="search">
      <label htmlFor="city-search-input" className="block text-xs text-muted mb-1">City</label>
      <div className="flex gap-2 items-stretch">

        <div ref={wrapRef} className="flex-1 min-w-0 relative">

          <div className={[
            'flex items-center gap-2 px-3 min-h-[50px]',
            'bg-[#f6f7fa] rounded-[8px] border transition-colors duration-150',
            'focus-within:border-[#afd8d4] hover:border-[#afd8d4]',
            'border-[rgba(1,1,45,0.3)]',
          ].join(' ')}>
            <input
              ref={inputRef}
              id="city-search-input"
              type="text"
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-owns={isOpen ? 'city-search-listbox' : undefined}
              className="flex-1 bg-transparent outline-none focus:ring-0 focus:shadow-none text-sm cursor-text text-primary placeholder:text-[rgba(1,1,45,0.4)]"
              style={{ fontFamily: 'Figtree, sans-serif' }}
            />

            {loading && (
              <i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin shrink-0 text-muted" style={{ fontSize: 12 }} />
            )}

            {inputValue && !loading && (
              <button
                onMouseDown={(e) => { e.preventDefault(); handleClearInput(); }}
                aria-label="Clear search"
                className="shrink-0 flex items-center justify-center w-4 h-4 text-muted hover:text-primary transition-colors focus:outline-none"
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
              </button>
            )}
          </div>

          {isOpen && (
            <CityDropdown
              results={results}
              hasError={hasError}
              activeIndex={activeIndex}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onSelect={select}
              onMouseEnter={handleMouseEnter}
              onLoadMore={loadMore}
            />
          )}
        </div>

        <Tooltip text={'Drops you in a random city\nanywhere on earth'} side="top" align="center" wrapperClassName="self-stretch flex">
          <button
            onClick={handleLucky}
            disabled={luckyLoading}
            aria-label="I'm feeling lucky — picks a random city for you"
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-[8px] border whitespace-nowrap',
              'text-[11px] font-semibold transition-all duration-200 focus:outline-none',
              'hover:scale-[1.04] active:scale-[0.96]',
              luckyLoading
                ? 'opacity-50 cursor-not-allowed bg-white/60 border-primary/20 text-primary'
                : 'bg-white/60 text-primary border-primary/20 hover:bg-white/90 hover:border-primary/35 hover:shadow-wx-button',
            ].join(' ')}
          >
            <i aria-hidden="true" className="fa-solid fa-shuffle sm:hidden" style={{ fontSize: 11 }} />
            <span className="hidden sm:inline">I'm feeling lucky</span>
          </button>
        </Tooltip>

      </div>

      {luckyError && (
        <p role="alert" className="text-xs text-error mt-1.5">
          Couldn't fetch a random city — please try again.
        </p>
      )}
    </div>
  );
}
