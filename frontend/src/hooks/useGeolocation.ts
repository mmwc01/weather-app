import { useEffect, useRef } from 'react';
import { CityOption } from '../types/weather';
import { CityOptionSchema } from '../schemas/api';

const API_URL = import.meta.env.VITE_API_URL;

export function useGeolocation(onCity: (city: CityOption) => Promise<void>): void {
  const onCityRef = useRef(onCity);
  useEffect(() => { onCityRef.current = onCity; });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const res = await fetch(`${API_URL}/api/cities/nearest?lat=${lat}&lon=${lon}`);
        if (!res.ok) return;
        const city = CityOptionSchema.parse(await res.json());
        await onCityRef.current(city);
      } catch (err) {
        console.warn('Geolocation city lookup failed:', err);
      }
    });
  }, []);
}
