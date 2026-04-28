import { z } from 'zod';

export const CityOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  state: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export const WeatherDataSchema = z.object({
  city: z.string(),
  country: z.string(),
  condition: z.string(),
  description: z.string(),
  temp: z.number(),
  feelsLike: z.number(),
  tempMin: z.number(),
  tempMax: z.number(),
  humidity: z.number(),
  visibility: z.number().optional(),
  wind: z.number(),
  timezone: z.number(),
  sunrise: z.number(),
  sunset: z.number(),
});

export const ForecastItemSchema = z.object({
  dt: z.number(),
  dtTxt: z.string(),
  condition: z.string(),
  description: z.string(),
  temp: z.number(),
  tempMin: z.number(),
  tempMax: z.number(),
  wind: z.number(),
});

export const ForecastDataSchema = z.object({
  city: z.string(),
  country: z.string(),
  list: z.array(ForecastItemSchema),
});

export const CitiesResponseSchema = z.object({
  cities: z.array(CityOptionSchema),
  hasMore: z.boolean(),
});
