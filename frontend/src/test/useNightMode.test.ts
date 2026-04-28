import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNightMode } from '../hooks/useNightMode';
import { CityOption } from '../types/weather';

function makeCity(lon: number): CityOption {
  return { id: 1, name: 'Test', state: '', country: 'XX', lat: 0, lon };
}

describe('useNightMode', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('defaults to day with no city', () => {
    const { result } = renderHook(() => useNightMode(null));
    expect(result.current.isNight).toBe(false);
    expect(result.current.nightOverride).toBeNull();
  });

  it('detects night hours', () => {
    vi.setSystemTime(new Date('2024-01-01T22:00:00Z'));
    const { result } = renderHook(() => useNightMode(makeCity(0)));
    expect(result.current.isNight).toBe(true);
  });

  it('detects day hours', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const { result } = renderHook(() => useNightMode(makeCity(0)));
    expect(result.current.isNight).toBe(false);
  });

  it('shifts local hour by longitude', () => {
    vi.setSystemTime(new Date('2024-01-01T09:00:00Z'));
    expect(renderHook(() => useNightMode(makeCity(135))).result.current.isNight).toBe(false);

    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    expect(renderHook(() => useNightMode(makeCity(-180))).result.current.isNight).toBe(true);
  });

  it('manual toggle overrides auto-detection', () => {
    vi.setSystemTime(new Date('2024-01-01T22:00:00Z'));
    const { result } = renderHook(() => useNightMode(makeCity(0)));
    expect(result.current.isNight).toBe(true);
    act(() => { result.current.toggleNight(); });
    expect(result.current.nightOverride).toBe(false);
    expect(result.current.isNight).toBe(false);
  });

  it('toggle forces night when currently day', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const { result } = renderHook(() => useNightMode(makeCity(0)));
    act(() => { result.current.toggleNight(); });
    expect(result.current.nightOverride).toBe(true);
    expect(result.current.isNight).toBe(true);
  });

  it('toggle flips an existing override', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const { result } = renderHook(() => useNightMode(makeCity(0)));
    act(() => { result.current.toggleNight(); });
    act(() => { result.current.toggleNight(); });
    expect(result.current.nightOverride).toBe(false);
    expect(result.current.isNight).toBe(false);
  });
});
