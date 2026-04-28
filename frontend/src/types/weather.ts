export interface CityOption {
  id: number;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: string;
  country: string;
  condition: string;
  description: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  visibility?: number;
  wind: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastItem {
  dt: number;
  dtTxt: string;
  condition: string;
  description: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  wind: number;
}

export interface ForecastData {
  city: string;
  country: string;
  list: ForecastItem[];
}
