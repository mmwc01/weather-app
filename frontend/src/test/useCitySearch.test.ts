import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCitySearch } from '../hooks/useCitySearch';
import type { CityOption } from '../types/weather';

const mockCities: CityOption[] = [
  { id: 1, name: 'Toronto', state: 'Ontario', country: 'CA', lat: 43.7, lon: -79.4 },
  { id: 2, name: 'Tokyo', state: '', country: 'JP', lat: 35.6, lon: 139.7 },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ cities: mockCities, hasMore: false }),
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useCitySearch', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    expect(result.current.inputValue).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.activeIndex).toBe(-1);
  });

  it('does not fetch for short input', async () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'T' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('fetches after debounce for valid input', async () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'Tokyo' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/cities?q=Tokyo'), expect.any(Object));
  });

  it('opens dropdown with results after fetch', async () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'Tokyo' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.results).toEqual(mockCities);
  });

  it('clears results and closes dropdown when input is emptied', () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('calls onSelect and resets state when a city is selected', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCitySearch(onSelect));
    act(() => { result.current.select(mockCities[0]); });
    expect(onSelect).toHaveBeenCalledWith(mockCities[0]);
    expect(result.current.inputValue).toBe('');
    expect(result.current.isOpen).toBe(false);
  });

  it('clears input state on clearInput', () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => { result.current.clearInput(); });
    expect(result.current.inputValue).toBe('');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('sets hasError on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'Berlin' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    expect(result.current.hasError).toBe(true);
  });

  it('navigates results with keyboard', async () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'Tokyo' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.activeIndex).toBe(0);
    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.activeIndex).toBe(1);
    act(() => {
      result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('closes dropdown on Escape', async () => {
    const { result } = renderHook(() => useCitySearch(vi.fn()));
    act(() => {
      result.current.handleChange({ target: { value: 'Tokyo' } } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => { vi.runAllTimers(); });
    act(() => {
      result.current.handleKeyDown({ key: 'Escape', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.isOpen).toBe(false);
  });
});
