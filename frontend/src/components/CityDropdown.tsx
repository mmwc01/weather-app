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
  function handleScroll(e: React.UIEvent<HTMLUListElement>) {
    const el = e.currentTarget;
    if (!hasMore || loadingMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      onLoadMore();
    }
  }

  return (
    <ul
      role="listbox"
      id="city-search-listbox"
      aria-label="City search results"
      className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-[8px] overflow-y-auto max-h-[280px] list-none m-0 p-0"
      style={{ boxShadow: '0px 4px 20px rgba(22, 19, 69, 0.13)' }}
      onScroll={handleScroll}
    >
      {hasError && (
        <li className="px-4 py-3 text-sm text-error" style={{ fontFamily: 'Figtree, sans-serif' }}>
          Something went wrong. Please try again.
        </li>
      )}

      {!hasError && results.length === 0 && (
        <li className="px-4 py-3 text-sm text-muted" style={{ fontFamily: 'Figtree, sans-serif' }}>
          No locations found
        </li>
      )}

      {!hasError && results.map((city, i) => (
        <li
          key={city.id}
          id={`city-option-${city.id}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => { e.preventDefault(); onSelect(city); }}
          onMouseEnter={() => onMouseEnter(i)}
          className={[
            'px-4 py-2.5 text-sm cursor-pointer transition-colors',
            i < results.length - 1 || hasMore || loadingMore ? 'border-b border-[rgba(1,1,45,0.06)]' : '',
            i === activeIndex
              ? 'bg-[#01012d] text-white'
              : 'text-[#01012d] hover:bg-[#a7c9e1]',
          ].join(' ')}
          style={{ fontFamily: 'Figtree, sans-serif' }}
        >
          {cityLabel(city)}
        </li>
      ))}

      {loadingMore && (
        <li className="flex justify-center py-2.5">
          <i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin text-muted" style={{ fontSize: 12 }} />
        </li>
      )}
    </ul>
  );
}
