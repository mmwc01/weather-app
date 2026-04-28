import { CityOption } from '../types/weather';
import { cityLabel } from '../utils/cityLabel';

interface Props {
  results: CityOption[];
  hasError: boolean;
  activeIndex: number;
  hasMore: boolean;
  loadingMore: boolean;
  onSelect: (city: CityOption) => void;
  onMouseEnter: (index: number) => void;
  onLoadMore: () => void;
}

export default function CityDropdown({
  results, hasError, activeIndex, hasMore, loadingMore,
  onSelect, onMouseEnter, onLoadMore,
}: Props) {
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (!hasMore || loadingMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      onLoadMore();
    }
  }

  return (
    <div
      role="listbox"
      id="city-search-listbox"
      aria-label="City search results"
      className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-[8px] overflow-y-auto max-h-[280px]"
      style={{ boxShadow: '0px 4px 20px rgba(22, 19, 69, 0.13)' }}
      onScroll={handleScroll}
    >
      {hasError && (
        <div className="px-4 py-3 text-sm text-error" style={{ fontFamily: 'Figtree, sans-serif' }}>
          Something went wrong. Please try again.
        </div>
      )}

      {!hasError && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted" style={{ fontFamily: 'Figtree, sans-serif' }}>
          No locations found
        </div>
      )}

      {!hasError && results.map((city, i) => (
        <button
          key={city.id}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => { e.preventDefault(); onSelect(city); }}
          onMouseEnter={() => onMouseEnter(i)}
          className={[
            'w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors',
            i < results.length - 1 || hasMore || loadingMore ? 'border-b border-[rgba(1,1,45,0.06)]' : '',
            i === activeIndex
              ? 'bg-[#01012d] text-white'
              : 'text-[#01012d] hover:bg-[#a7c9e1]',
          ].join(' ')}
          style={{ fontFamily: 'Figtree, sans-serif' }}
        >
          {cityLabel(city)}
        </button>
      ))}

      {loadingMore && (
        <div className="flex justify-center py-2.5">
          <i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin text-muted" style={{ fontSize: 12 }} />
        </div>
      )}
    </div>
  );
}
