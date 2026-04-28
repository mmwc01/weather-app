import { Router, Request, Response } from 'express';
import { OWMCurrentWeatherSchema, OWMForecastSchema, WeatherParamsSchema } from '../schemas/weather';
import { logger } from '../logger';

const OWM_BASE = 'http://api.openweathermap.org/data/2.5';

export function createWeatherRouter(apiKey: string) {
  const router = Router();

  router.get('/:cityId', async (req: Request, res: Response) => {
    const params = WeatherParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.issues[0].message });
      return;
    }

    const { cityId } = params.data;

    let owmRes: globalThis.Response;
    try {
      owmRes = await fetch(`${OWM_BASE}/weather?id=${cityId}&appid=${apiKey}&units=metric`);
    } catch (err) {
      logger.error('failed to reach OWM weather API', { cityId, error: String(err) });
      res.status(502).json({ error: 'Weather service unavailable' });
      return;
    }

    if (!owmRes.ok) {
      const body = await owmRes.json().catch(() => ({})) as { message?: string };
      logger.warn('OWM weather API error', { cityId, status: owmRes.status, message: body.message });
      res.status(owmRes.status).json({ error: body.message ?? 'Failed to fetch weather' });
      return;
    }

    try {
      const raw = OWMCurrentWeatherSchema.parse(await owmRes.json());
      res.json({
        city:        raw.name,
        country:     raw.sys.country,
        condition:   raw.weather[0].main,
        description: raw.weather[0].description,
        temp:        Math.round(raw.main.temp),
        feelsLike:   Math.round(raw.main.feels_like),
        tempMin:     raw.main.temp_min,
        tempMax:     raw.main.temp_max,
        humidity:    raw.main.humidity,
        visibility:  raw.visibility != null ? Math.round(raw.visibility / 1000) : undefined,
        wind:        raw.wind.speed,
        timezone:    raw.timezone,
        sunrise:     raw.sys.sunrise,
        sunset:      raw.sys.sunset,
      });
    } catch (err) {
      logger.error('failed to parse OWM weather response', { cityId, error: String(err) });
      res.status(502).json({ error: 'Unexpected response from weather service' });
    }
  });

  router.get('/:cityId/forecast', async (req: Request, res: Response) => {
    const params = WeatherParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.issues[0].message });
      return;
    }

    const { cityId } = params.data;

    let owmRes: globalThis.Response;
    try {
      owmRes = await fetch(`${OWM_BASE}/forecast?id=${cityId}&appid=${apiKey}&units=metric`);
    } catch (err) {
      logger.error('failed to reach OWM forecast API', { cityId, error: String(err) });
      res.status(502).json({ error: 'Weather service unavailable' });
      return;
    }

    if (!owmRes.ok) {
      const body = await owmRes.json().catch(() => ({})) as { message?: string };
      logger.warn('OWM forecast API error', { cityId, status: owmRes.status, message: body.message });
      res.status(owmRes.status).json({ error: body.message ?? 'Failed to fetch forecast' });
      return;
    }

    try {
      const raw = OWMForecastSchema.parse(await owmRes.json());
      res.json({
        city:    raw.city.name,
        country: raw.city.country,
        list:    raw.list.map((item) => ({
          dt:          item.dt,
          dtTxt:       item.dt_txt,
          condition:   item.weather[0].main,
          description: item.weather[0].description,
          temp:        Math.round(item.main.temp),
          tempMin:     item.main.temp_min,
          tempMax:     item.main.temp_max,
          wind:        item.wind.speed,
        })),
      });
    } catch (err) {
      logger.error('failed to parse OWM forecast response', { cityId, error: String(err) });
      res.status(502).json({ error: 'Unexpected response from weather service' });
    }
  });

  return router;
}
