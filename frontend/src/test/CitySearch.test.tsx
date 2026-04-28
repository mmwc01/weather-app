import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CitySearch from '../components/CitySearch';
import type { CityOption } from '../types/weather';

const mockCities: CityOption[] = [
  { id: 1, name: 'Toronto', state: 'Ontario', country: 'CA', lat: 43.7, lon: -79.4 },
  { id: 2, name: 'Tokyo', state: '', country: 'JP', lat: 35.6, lon: 139.7 },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ cities: mockCities, hasMore: false }),
  }));
});

describe('CitySearch', () => {
  it('renders the city label', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('renders the placeholder text', () => {
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Start typing to search cities\u2026')).toBeInTheDocument();
  });

  it('shows full label with state as placeholder when city is selected', () => {
    render(<CitySearch onSelect={vi.fn()} selectedCity={mockCities[0]} />);
    expect(screen.getByPlaceholderText('Toronto, Ontario, CA')).toBeInTheDocument();
  });

  it('omits state from placeholder when state is empty', () => {
    render(<CitySearch onSelect={vi.fn()} selectedCity={mockCities[1]} />);
    expect(screen.getByPlaceholderText('Tokyo, JP')).toBeInTheDocument();
  });

  it('survives a fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<CitySearch onSelect={vi.fn()} />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });
});
