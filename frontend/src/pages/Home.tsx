import { useState, useCallback, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import TodaysForecast from '../components/TodaysForecast';
import ForecastTable from '../components/ForecastTable';
import MapPreview from '../components/MapPreview';
import WeatherBackground from '../components/WeatherBackground';
import ScenePreviewPanel from '../components/ScenePreviewPanel';
import Card from '../components/Card';
import CardHeader from '../components/CardHeader';
import EmptyState from '../components/EmptyState';
import ResetButton from '../components/ResetButton';
import DayNightToggle from '../components/DayNightToggle';
import { useWeatherState } from '../hooks/useWeatherState';
import { useGeolocation } from '../hooks/useGeolocation';
import { resolveCardBg } from '../utils/cardScene';

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const { selectedCity, weather, forecast, showForecast, loading, error, handleCitySelect, handleToggleForecast } = useWeatherState();
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [previewCondition, setPreviewCondition] = useState<string | null>(null);
  const [previewWind, setPreviewWind] = useState<number | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [bgFlashCount, setBgFlashCount] = useState(0);

  const [prefetchReady, setPrefetchReady] = useState(false);
  const { locationStatus, requestLocation, geoResolved } = useGeolocation(handleCitySelect);

  useEffect(() => {
    fetch(`${API_URL}/api/cities?q=&page=1&limit=10`)
      .catch(() => {})
      .finally(() => setPrefetchReady(true));
  }, []);

  const nightForWeather = useCallback((w: typeof weather) => {
    if (!w) return false;
    const now = Date.now() / 1000;
    return now <= w.sunrise || now > w.sunset;
  }, []);

  useEffect(() => {
    setIsNight(nightForWeather(weather)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [weather]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    setPreviewCondition(null);
    setPreviewWind(null);
    setIsNight(nightForWeather(weather));
  }, [weather, nightForWeather]);

  const handleFlash = useCallback(() => {
    setBgFlashCount((c) => c + 1);
  }, []);

  const toggleCondition = useCallback((value: string) => {
    setPreviewCondition(prev => prev === value ? null : value);
  }, []);

  const toggleWind = useCallback((value: number) => {
    setPreviewWind(prev => prev === value ? null : value);
  }, []);

  const activeCondition = previewCondition ?? weather?.condition ?? null;
  const activeWind = previewWind ?? weather?.wind ?? 0;
  const cardBg = resolveCardBg(activeCondition, isNight);

  if (!prefetchReady || !geoResolved || (loading && !weather)) return <LoadingSpinner />;

  return (
    <>
      {activeCondition
        ? <WeatherBackground condition={activeCondition} flashTrigger={bgFlashCount} windSpeed={activeWind} isNight={isNight} />
        : <div aria-hidden="true" className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(180deg, #e8edf5 0%, #f3f5fa 100%)' }} />
      }

      <ScenePreviewPanel
        previewCondition={previewCondition}
        previewWind={previewWind}
        isNight={isNight}
        onToggle={toggleCondition}
        onToggleWind={toggleWind}
      />

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {(previewCondition !== null || previewWind !== null || weather) && (
          <ResetButton isNight={isNight} onReset={handleReset} />
        )}
        <DayNightToggle isNight={isNight} onToggle={() => setIsNight(n => !n)} />
      </div>

      <main className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16">
        <div className="w-full max-w-[980px] pb-5 sm:pb-10">
          <Card
            cardBg={cardBg}
            isNight={isNight}
            activeCondition={activeCondition}
            activeWind={activeWind}
            onFlash={handleFlash}
            forecastSlot={showForecast && forecast ? <ForecastTable forecast={forecast} unit={unit} /> : undefined}
          >
            <CardHeader
              unit={unit}
              onSelect={handleCitySelect}
              onUnitChange={setUnit}
            />

            {error && <p role="alert" className="text-error text-sm mt-4">{error}</p>}

            <div className="flex flex-col lg:flex-row items-start gap-5 mt-5 min-h-[220px]">
              {weather ? (
                <>
                  <div className="flex-1 min-w-0 w-full">
                    <TodaysForecast
                      weather={weather}
                      unit={unit}
                      showForecast={showForecast}
                      onToggleForecast={handleToggleForecast}
                    />
                  </div>
                  {selectedCity && (
                    <div className="w-full lg:w-auto flex-shrink-0 p-1">
                      <MapPreview
                        lat={selectedCity.lat}
                        lon={selectedCity.lon}
                        cityName={selectedCity.name}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full">
                  <EmptyState
                    onSelect={handleCitySelect}
                    locationStatus={locationStatus}
                    onRequestLocation={requestLocation}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
