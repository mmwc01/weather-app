import { useState, useRef, useCallback, useEffect } from 'react';
import { CityOption } from '../types/weather';
import { CityOptionSchema } from '../schemas/api';

const API_URL = import.meta.env.VITE_API_URL;

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

async function lookupNearestCity(lat: number, lon: number, onCity: (city: CityOption) => Promise<void>) {
  try {
    const res = await fetch(`${API_URL}/api/cities/nearest?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const city = CityOptionSchema.parse(await res.json());
      await onCity(city);
    }
  } catch (err) {
    console.warn('Geolocation city lookup failed:', err);
  }
}

function errorStatus(err: GeolocationPositionError): LocationStatus {
  return err.code === 1 /* PERMISSION_DENIED */ ? 'denied' : 'idle';
}

export function useGeolocation(onCity: (city: CityOption) => Promise<void>) {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [geoResolved, setGeoResolved] = useState(false);
  const onCityRef = useRef(onCity);
  useEffect(() => { onCityRef.current = onCity; });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoResolved(true);
      return;
    }

    const tryDetect = () => {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await lookupNearestCity(pos.coords.latitude, pos.coords.longitude, onCityRef.current);
          setLocationStatus('granted');
          setGeoResolved(true);
        },
        (err) => {
          setLocationStatus(errorStatus(err));
          setGeoResolved(true);
        },
      );
    };

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(perm => { perm.state === 'denied' ? setGeoResolved(true) : tryDetect(); })
        .catch(() => tryDetect());
    } else {
      tryDetect();
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation || locationStatus === 'loading') return;
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await lookupNearestCity(pos.coords.latitude, pos.coords.longitude, onCityRef.current);
        setLocationStatus('granted');
      },
      (err) => setLocationStatus(errorStatus(err)),
    );
  }, [locationStatus]);

  return { locationStatus, requestLocation, geoResolved };
}
