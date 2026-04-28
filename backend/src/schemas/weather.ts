import { z } from 'zod';

// OpenWeatherMap API response schemas (internal)
const OWMWeatherConditionSchema = z.object({
  main: z.string(),
  description: z.string(),
});

export const OWMCurrentWeatherSchema = z.object({
  weather: z.array(OWMWeatherConditionSchema),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
  }),
  visibility: z.number().optional(),
  wind: z.object({
    speed: z.number(),
  }),
  timezone: z.number(),
  name: z.string(),
  sys: z.object({
    country: z.string(),
    sunrise: z.number(),
    sunset:  z.number(),
  }),
});

export const OWMForecastSchema = z.object({
  list: z.array(
    z.object({
      dt: z.number(),
      dt_txt: z.string(),
      weather: z.array(OWMWeatherConditionSchema),
      main: z.object({
        temp: z.number(),
        temp_min: z.number(),
        temp_max: z.number(),
      }),
      wind: z.object({
        speed: z.number(),
      }),
    })
  ),
  city: z.object({
    name: z.string(),
    country: z.string(),
  }),
});

export const WeatherParamsSchema = z.object({
  cityId: z.coerce.number().int().positive(),
});
