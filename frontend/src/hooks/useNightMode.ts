import { useState, useEffect } from 'react';
import { CityOption } from '../types/weather';

interface NightMode {
  isNight: boolean;
  nightOverride: boolean | null;
  toggleNight: () => void;
}

export function useNightMode(selectedCity: CityOption | null): NightMode {
  const [isNightAuto,   setIsNightAuto]   = useState(false);
  const [nightOverride, setNightOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      if (!selectedCity) { setIsNightAuto(false); return; }
      const utcHour   = new Date().getUTCHours();
      const tzOffset  = Math.round(selectedCity.lon / 15);
      const localHour = (utcHour + tzOffset + 24) % 24;
      setIsNightAuto(localHour >= 20 || localHour < 6);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [selectedCity]);

  const isNight    = nightOverride !== null ? nightOverride : isNightAuto;
  const toggleNight = () => setNightOverride(prev => prev !== null ? !prev : !isNightAuto);

  return { isNight, nightOverride, toggleNight };
}
