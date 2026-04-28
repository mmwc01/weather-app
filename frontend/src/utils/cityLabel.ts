import { CityOption } from '../types/weather';

export function cityLabel(city: CityOption): string {
  return city.state
    ? `${city.name}, ${city.state}, ${city.country}`
    : `${city.name}, ${city.country}`;
}
