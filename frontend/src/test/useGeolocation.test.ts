import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeolocation } from '../hooks/useGeolocation';
import type { CityOption } from '../types/weather';

const mockCity: CityOption = { id: 1, name: 'Toronto', state: 'Ontario', country: 'CA', lat: 43.7, lon: -79.4 };

// matches GeolocationPositionError.PERMISSION_DENIED
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;

function makeGeoError(code: number): GeolocationPositionError {
  return { code, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError;
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockCity,
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useGeolocation', () => {
  it('resolves immediately when the browser has no geolocation support', async () => {
    vi.stubGlobal('navigator', { ...navigator, geolocation: undefined });
    const { result } = renderHook(() => useGeolocation(vi.fn()));
    await act(async () => {});
    expect(result.current.geoResolved).toBe(true);
    expect(result.current.locationStatus).toBe('idle');
  });

  it('skips the permission prompt if geo is already denied', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
      geolocation: { getCurrentPosition: vi.fn() },
    });
    const { result } = renderHook(() => useGeolocation(vi.fn()));
    await act(async () => {});
    expect(result.current.geoResolved).toBe(true);
    // getCurrentPosition should never have been called
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('detects location and calls onCity when permission is granted', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({ coords: { latitude: 43.7, longitude: -79.4 } } as GeolocationPosition);
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
      geolocation: { getCurrentPosition },
    });
    const onCity = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useGeolocation(onCity));
    await act(async () => {});
    expect(result.current.locationStatus).toBe('granted');
    expect(result.current.geoResolved).toBe(true);
    expect(onCity).toHaveBeenCalledWith(mockCity);
  });

  it('goes to denied status when the user blocks the permission dialog', async () => {
    const getCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
      error(makeGeoError(PERMISSION_DENIED));
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
      geolocation: { getCurrentPosition },
    });
    const { result } = renderHook(() => useGeolocation(vi.fn()));
    await act(async () => {});
    expect(result.current.locationStatus).toBe('denied');
    expect(result.current.geoResolved).toBe(true);
  });

  it('falls back to idle for other geo errors (e.g. position unavailable)', async () => {
    const getCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
      error(makeGeoError(POSITION_UNAVAILABLE));
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
      geolocation: { getCurrentPosition },
    });
    const { result } = renderHook(() => useGeolocation(vi.fn()));
    await act(async () => {});
    expect(result.current.locationStatus).toBe('idle');
    expect(result.current.geoResolved).toBe(true);
  });

  it('requestLocation works after an initial denial', async () => {
    const getCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
      error(makeGeoError(PERMISSION_DENIED));
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
      geolocation: { getCurrentPosition },
    });
    const onCity = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useGeolocation(onCity));
    await act(async () => {});
    expect(result.current.locationStatus).toBe('denied');

    getCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 43.7, longitude: -79.4 } } as GeolocationPosition);
    });
    await act(async () => { result.current.requestLocation(); });
    expect(result.current.locationStatus).toBe('granted');
    expect(onCity).toHaveBeenCalledWith(mockCity);
  });

  it('ignores repeated requestLocation calls while one is in flight', async () => {
    let capturedSuccess: PositionCallback | null = null;
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      capturedSuccess = success; // don't resolve yet
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
      geolocation: { getCurrentPosition },
    });
    const { result } = renderHook(() => useGeolocation(vi.fn().mockResolvedValue(undefined)));
    await act(async () => {});
    expect(result.current.locationStatus).toBe('loading');

    const callsBefore = getCurrentPosition.mock.calls.length;
    act(() => { result.current.requestLocation(); });
    expect(getCurrentPosition.mock.calls.length).toBe(callsBefore);

    // resolve so the hook doesn't leak into other tests
    await act(async () => {
      capturedSuccess?.({ coords: { latitude: 43.7, longitude: -79.4 } } as GeolocationPosition);
    });
  });
});
