import { useState, useRef, useCallback, useEffect } from 'react';
import { CityOption } from '../types/weather';
import { CitiesResponseSchema } from '../schemas/api';
import { cityLabel } from '../utils/cityLabel';

const API_URL = import.meta.env.VITE_API_URL;
const MIN_CHARS = 1;
const DEBOUNCE = 150;
const LIMIT = 10;

interface CachedPage {
  cities: CityOption[];
  hasMore: boolean;
}

export interface CitySearchState {
  inputValue: string;
  results: CityOption[];
  isOpen: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasError: boolean;
  hasMore: boolean;
  activeIndex: number;
}

export interface CitySearchActions {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleMouseEnter: (index: number) => void;
  clearInput: () => void;
  closeDropdown: () => void;
  select: (city: CityOption) => void;
  loadMore: () => void;
}

export function useCitySearch(
  onSelect: (city: CityOption) => void,
): CitySearchState & CitySearchActions {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const cache = useRef(new Map<string, CachedPage>());
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef<string | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    fetch(`${API_URL}/api/cities?q=&page=1&limit=${LIMIT}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const parsed = CitiesResponseSchema.safeParse(data);
        if (parsed.success) cache.current.set('', { cities: parsed.data.cities, hasMore: parsed.data.hasMore });
      })
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async (raw: string, allowEmpty = false) => {
    const q = raw.trim().toLowerCase();

    if (!allowEmpty && q.length < MIN_CHARS) {
      setResults([]); setIsOpen(false); setLoading(false);
      return;
    }

    if (cache.current.has(q)) {
      const cached = cache.current.get(q)!;
      setResults(cached.cities);
      setHasMore(cached.hasMore);
      setIsOpen(true); setLoading(false); setHasError(false);
      currentQueryRef.current = q;
      pageRef.current = 1;
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    currentQueryRef.current = q;
    pageRef.current = 1;
    setLoading(true); setHasError(false);

    try {
      const res = await fetch(
        `${API_URL}/api/cities?q=${encodeURIComponent(raw.trim())}&page=1&limit=${LIMIT}`,
        { signal: abortRef.current.signal },
      );
      if (!res.ok) throw new Error('bad response');
      const { cities, hasMore: more } = CitiesResponseSchema.parse(await res.json());

      if (cache.current.size >= 200) {
        const oldest = cache.current.keys().next().value;
        if (oldest !== undefined) cache.current.delete(oldest);
      }
      cache.current.set(q, { cities, hasMore: more });

      setResults(cities); setHasMore(more); setIsOpen(true); setActiveIndex(-1);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setHasError(true); setResults([]); setHasMore(false); setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (currentQueryRef.current === null || !hasMore || loadingMore) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const q = currentQueryRef.current;
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);

    try {
      const res = await fetch(
        `${API_URL}/api/cities?q=${encodeURIComponent(q)}&page=${nextPage}&limit=${LIMIT}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error('bad response');
      const { cities, hasMore: more } = CitiesResponseSchema.parse(await res.json());

      pageRef.current = nextPage;
      setResults(prev => [...prev, ...cities]);
      setHasMore(more);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val); setActiveIndex(-1);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!val.trim()) {
      abortRef.current?.abort();
      setResults([]); setIsOpen(false); setLoading(false); setHasError(false); setHasMore(false);
      return;
    }

    timerRef.current = setTimeout(() => doSearch(val), DEBOUNCE);
  }

  function handleFocus() {
    if (isOpen) return;
    if (inputValue.trim().length >= MIN_CHARS) {
      doSearch(inputValue);
      return;
    }
    doSearch('', true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) { e.preventDefault(); select(results[activeIndex]); }
    } else if (e.key === 'Escape') {
      setIsOpen(false); setActiveIndex(-1);
    }
  }

  function handleBlur() {
    setTimeout(() => { setIsOpen(false); setActiveIndex(-1); }, 100);
  }

  function handleMouseEnter(index: number) { setActiveIndex(index); }

  function select(city: CityOption) {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setInputValue(cityLabel(city)); setResults([]); setIsOpen(false); setActiveIndex(-1);
    setLoading(false); setLoadingMore(false); setHasMore(false);
    currentQueryRef.current = null;
    onSelect(city);
  }

  function closeDropdown() {
    setIsOpen(false); setActiveIndex(-1);
  }

  function clearInput() {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setInputValue(''); setResults([]); setIsOpen(false); setLoading(false);
    setHasError(false); setHasMore(false);
    currentQueryRef.current = null;
  }

  return {
    inputValue, results, isOpen, loading, loadingMore, hasError, hasMore, activeIndex,
    handleChange, handleFocus, handleKeyDown, handleBlur, handleMouseEnter, clearInput, closeDropdown, select, loadMore,
  };
}
