import { useState, useRef } from 'react';
import { CityOption, WeatherData, ForecastData } from '../types/weather';
import { WeatherDataSchema, ForecastDataSchema } from '../schemas/api';

const API_URL = import.meta.env.VITE_API_URL;

interface WeatherState {
  selectedCity: CityOption | null;
  weather: WeatherData | null;
  forecast: ForecastData | null;
  showForecast: boolean;
  loading: boolean;
  error: string;
  handleCitySelect: (city: CityOption) => Promise<void>;
  handleToggleForecast: () => Promise<void>;
}

export function useWeatherState(): WeatherState {
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [weather,      setWeather]      = useState<WeatherData | null>(null);
  const [forecast,     setForecast]     = useState<ForecastData | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const handleCitySelect = async (city: CityOption) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedCity(city);
    setShowForecast(false);
    setForecast(null);
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/weather/${city.id}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch weather');
      setWeather(WeatherDataSchema.parse(await res.json()));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Could not load weather data. Please try again.');
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  };

  const handleToggleForecast = async () => {
    if (showForecast)  { setShowForecast(false); return; }
    if (forecast)      { setShowForecast(true);  return; }
    if (!selectedCity) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/weather/${selectedCity.id}/forecast`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch forecast');
      setForecast(ForecastDataSchema.parse(await res.json()));
      setShowForecast(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Could not load forecast data. Please try again.');
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  };

  return { selectedCity, weather, forecast, showForecast, loading, error, handleCitySelect, handleToggleForecast };
}
