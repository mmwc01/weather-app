import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CitySearch from '../components/CitySearch';
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

describe('CitySearch', () => {
  it('renders the city label', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('renders the placeholder', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search cities\u2026')).toBeInTheDocument();
  });

  it('has combobox role and aria-controls wired to the listbox', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-controls', 'city-search-listbox');
  });

  it('fills the input with the city label on select', async () => {
    render(<CitySearch onSelect={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await act(async () => { vi.runAllTimers(); });
    const option = screen.getByText('Toronto, Ontario, CA');
    fireEvent.mouseDown(option);
    expect((input as HTMLInputElement).value).toBe('Toronto, Ontario, CA');
  });

  it('survives a fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });
});
