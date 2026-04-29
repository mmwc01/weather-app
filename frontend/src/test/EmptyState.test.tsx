import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EmptyState from '../components/EmptyState';
import type { CityOption } from '../types/weather';

const toronto: CityOption = { id: 6167865, name: 'Toronto', state: 'Ontario', country: 'CA', lat: 43.7001, lon: -79.4163 };
const london: CityOption  = { id: 99,      name: 'London',  state: '',        country: 'GB', lat: 51.5,    lon: -0.12    };

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ cities: [london], hasMore: false }),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderEmpty(locationStatus: 'idle' | 'loading' | 'granted' | 'denied' = 'idle') {
  const onSelect = vi.fn();
  const onRequestLocation = vi.fn();
  render(<EmptyState onSelect={onSelect} locationStatus={locationStatus} onRequestLocation={onRequestLocation} />);
  return { onSelect, onRequestLocation };
}

describe('EmptyState', () => {
  it('renders the heading and description', () => {
    renderEmpty();
    expect(screen.getByText('Where in the world are you?')).toBeInTheDocument();
    expect(screen.getByText(/Search for a city above/)).toBeInTheDocument();
  });

  it('shows all quick-pick city buttons', () => {
    renderEmpty();
    for (const city of ['Toronto', 'Ottawa', 'Tokyo', 'London', 'New York', 'Sydney', 'Paris']) {
      expect(screen.getByRole('button', { name: city })).toBeInTheDocument();
    }
  });

  it('shows the right label for each location status', () => {
    const cases: Array<[typeof locationStatus, string]> = [
      ['idle',    'Detect my location'],
      ['loading', 'Detecting\u2026'],
      ['granted', 'Location found'],
      ['denied',  'Location access denied'],
    ];
    for (const [status, label] of cases) {
      const { unmount } = render(
        <EmptyState onSelect={vi.fn()} locationStatus={status} onRequestLocation={vi.fn()} />,
      );
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
      unmount();
    }
  });

  it('disables the location button while loading or already granted', () => {
    const { rerender } = render(
      <EmptyState onSelect={vi.fn()} locationStatus="loading" onRequestLocation={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /Detecting/i })).toBeDisabled();

    rerender(<EmptyState onSelect={vi.fn()} locationStatus="granted" onRequestLocation={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Location found/i })).toBeDisabled();
  });

  it('calls onRequestLocation when the button is clicked', () => {
    const { onRequestLocation } = renderEmpty('idle');
    fireEvent.click(screen.getByRole('button', { name: /Detect my location/i }));
    expect(onRequestLocation).toHaveBeenCalledOnce();
  });

  it('shows a hint explaining how to recover from denial', () => {
    renderEmpty('denied');
    expect(screen.getByText(/Location access was denied/)).toBeInTheDocument();
  });

  it('selects a pinned city immediately without hitting the network', () => {
    const { onSelect } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: 'Toronto' }));
    expect(onSelect).toHaveBeenCalledWith(toronto);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('searches by name and selects the first result for non-pinned cities', async () => {
    const { onSelect } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: 'London' }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(london));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=London'));
  });

  it('does nothing if the search comes back empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cities: [], hasMore: false }),
    }));
    const { onSelect } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: 'London' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('silently swallows network errors so the search bar still works', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { onSelect } = renderEmpty();
    fireEvent.click(screen.getByRole('button', { name: 'London' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(onSelect).not.toHaveBeenCalled();
  });
});
