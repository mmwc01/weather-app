import { useState } from 'react';
import { CityOption } from '../types/weather';
import { CitiesResponseSchema } from '../schemas/api';
import type { LocationStatus } from '../hooks/useGeolocation';

const API_URL = import.meta.env.VITE_API_URL;

type QuickCity = { label: string; city?: CityOption };

const QUICK_CITIES: QuickCity[] = [
  { label: 'Toronto', city: { id: 6167865, name: 'Toronto', state: 'Ontario',  country: 'CA', lat: 43.7001, lon: -79.4163 } },
  { label: 'Ottawa',  city: { id: 6094817, name: 'Ottawa',  state: 'Ontario',  country: 'CA', lat: 45.4215, lon: -75.6972 } },
  { label: 'Tokyo',   city: { id: 1850147, name: 'Tokyo',   state: 'Tokyo',    country: 'JP', lat: 35.6895, lon: 139.6917 } },
  { label: 'London' },
  { label: 'New York' },
  { label: 'Sydney' },
  { label: 'Paris' },
];

const LOC_ICON: Record<LocationStatus, string> = {
  idle:    'fa-location-crosshairs',
  loading: 'fa-circle-notch fa-spin',
  granted: 'fa-check',
  denied:  'fa-location-crosshairs',
};

const LOC_LABEL: Record<LocationStatus, string> = {
  idle:    'Detect my location',
  loading: 'Detecting…',
  granted: 'Location found',
  denied:  'Location access denied',
};

interface Props {
  onSelect: (city: CityOption) => void;
  locationStatus: LocationStatus;
  onRequestLocation: () => void;
}

export default function EmptyState({ onSelect, locationStatus, onRequestLocation }: Props) {
  const [pickLoading, setPickLoading] = useState<string | null>(null);

  async function handleQuickPick({ label, city }: QuickCity) {
    if (pickLoading) return;
    if (city) { onSelect(city); return; }
    setPickLoading(label);
    try {
      const res = await fetch(`${API_URL}/api/cities?q=${encodeURIComponent(label)}&limit=1`);
      if (!res.ok) throw new Error('bad response');
      const { cities } = CitiesResponseSchema.parse(await res.json());
      if (cities[0]) onSelect(cities[0]);
    } catch {
      // search is still available at the top
    } finally {
      setPickLoading(null);
    }
  }

  const locDisabled = locationStatus === 'loading' || locationStatus === 'granted';

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-5 text-center">

      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(175,216,212,0.15)',
        border: '1.5px solid rgba(175,216,212,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className="fa-solid fa-location-dot" style={{ fontSize: 22, color: '#afd8d4' }} aria-hidden="true" />
      </div>

      <div>
        <p className="text-sm font-semibold mb-1.5">Where in the world are you?</p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#6b7280' }}>
          Search for a city above, or jump straight in with one of these.
        </p>
      </div>

      <button
        onClick={onRequestLocation}
        disabled={locDisabled}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 8,
          border: locationStatus === 'denied' ? '1.5px solid rgba(210,4,4,0.3)' : '1.5px solid rgba(175,216,212,0.6)',
          background: locationStatus === 'denied' ? 'rgba(210,4,4,0.06)' : 'rgba(175,216,212,0.12)',
          fontFamily: 'Figtree, sans-serif', fontSize: 13, fontWeight: 600,
          color: locationStatus === 'denied' ? '#d20404' : '#01012d',
          cursor: locDisabled ? 'default' : 'pointer',
          opacity: locationStatus === 'loading' ? 0.6 : 1,
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        <i
          className={`fa-solid ${LOC_ICON[locationStatus]}`}
          style={{ fontSize: 13, color: locationStatus === 'denied' ? '#d20404' : '#afd8d4' }}
          aria-hidden="true"
        />
        {LOC_LABEL[locationStatus]}
      </button>

      {locationStatus === 'denied' && (
        <p style={{ fontSize: 12, color: '#a9add3', marginTop: -8 }}>
          Location access was denied — search for a city above.
        </p>
      )}

      <span style={{ fontSize: 11, color: '#8b90a8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        or pick a city
      </span>

      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_CITIES.map((q) => (
          <button
            key={q.label}
            onClick={() => handleQuickPick(q)}
            disabled={!!pickLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8,
              border: '1px solid rgba(1,1,45,0.12)',
              background: pickLoading === q.label ? 'rgba(175,216,212,0.12)' : 'rgba(255,255,255,0.65)',
              fontFamily: 'Figtree, sans-serif', fontSize: 12, fontWeight: 600, color: '#01012d',
              cursor: pickLoading ? 'default' : 'pointer',
              opacity: pickLoading && pickLoading !== q.label ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
          >
            {pickLoading === q.label && (
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 10 }} aria-hidden="true" />
            )}
            {q.label}
          </button>
        ))}
      </div>

    </div>
  );
}
