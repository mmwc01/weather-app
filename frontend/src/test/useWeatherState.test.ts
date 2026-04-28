import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useWeatherState } from '../hooks/useWeatherState';
import { WeatherData, ForecastData } from '../types/weather';

const mockCity = { id: 1, name: 'Tokyo', state: '', country: 'JP', lat: 35.6, lon: 139.7 };

const mockWeather: WeatherData = {
  city: 'Tokyo', country: 'JP', condition: 'Clouds',
  description: 'broken clouds', temp: 23, feelsLike: 21, tempMin: 20, tempMax: 25, humidity: 65, wind: 4,
  timezone: 32400, sunrise: 1700000000, sunset: 1700040000,
};

const mockForecast: ForecastData = {
  city: 'Tokyo', country: 'JP',
  list: [{ dt: 1, dtTxt: '2024-01-01 12:00:00', condition: 'Clouds', description: 'clouds', temp: 23, tempMin: 20, tempMax: 25, wind: 4 }],
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockWeather,
  }));
});

describe('useWeatherState', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useWeatherState());
    expect(result.current.selectedCity).toBeNull();
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('loads weather for the selected city', async () => {
    const { result } = renderHook(() => useWeatherState());
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    expect(result.current.selectedCity).toEqual(mockCity);
    expect(result.current.weather).toEqual(mockWeather);
    expect(result.current.loading).toBe(false);
  });

  it('resets forecast when city changes', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeather })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeather }),
    );
    const { result } = renderHook(() => useWeatherState());
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    await act(async () => { await result.current.handleToggleForecast(); });
    expect(result.current.showForecast).toBe(true);
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    expect(result.current.forecast).toBeNull();
    expect(result.current.showForecast).toBe(false);
  });

  it('shows error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { result } = renderHook(() => useWeatherState());
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    expect(result.current.error).toBe('Could not load weather data. Please try again.');
    expect(result.current.weather).toBeNull();
  });

  it('shows error on bad response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    const { result } = renderHook(() => useWeatherState());
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    expect(result.current.error).toBe('Could not load weather data. Please try again.');
  });

  it('closes forecast if already open', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeather })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast }),
    );
    const { result } = renderHook(() => useWeatherState());
    await act(async () => { await result.current.handleCitySelect(mockCity); });
    await act(async () => { await result.current.handleToggleForecast(); });
    expect(result.current.showForecast).toBe(true);
    await act(async () => { await result.current.handleToggleForecast(); });
    expect(result.current.showForecast).toBe(false);
  });
});
