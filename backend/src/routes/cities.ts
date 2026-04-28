import { Router, Request, Response } from 'express';
import { CitiesQuerySchema, NearestQuerySchema, City } from '../schemas/city';

const MAX_COLLECT = 500;

export function createCitiesRouter(cities: City[]) {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const result = CitiesQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const { q, page, limit } = result.data;
    const query = q.toLowerCase();
    const offset = (page - 1) * limit;

    let matches: City[];

    if (!query) {
      matches = cities;
    } else {
      const startsWith: City[] = [];
      const contains: City[] = [];

      for (const city of cities) {
        if (startsWith.length + contains.length >= MAX_COLLECT) break;
        const name = city.name.toLowerCase();
        if (name.startsWith(query)) startsWith.push(city);
        else if (name.includes(query)) contains.push(city);
      }

      matches = [...startsWith, ...contains];
    }

    const pageResults = matches
      .slice(offset, offset + limit)
      .map(({ id, name, state, country, coord }) => ({ id, name, state, country, lat: coord.lat, lon: coord.lon }));

    res.json({
      cities: pageResults,
      hasMore: matches.length > offset + limit,
    });
  });

  router.get('/nearest', (req: Request, res: Response) => {
    const result = NearestQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const { lat, lon } = result.data;
    let best: City | null = null;
    let bestDist = Infinity;

    for (const city of cities) {
      const dlat = city.coord.lat - lat;
      const dlon = city.coord.lon - lon;
      const dist = dlat * dlat + dlon * dlon;
      if (dist < bestDist) {
        bestDist = dist;
        best = city;
      }
    }

    if (!best) {
      res.status(404).json({ error: 'No cities found' });
      return;
    }

    const { id, name, state, country, coord } = best;
    res.json({ id, name, state, country, lat: coord.lat, lon: coord.lon });
  });

  router.get('/random', (_req: Request, res: Response) => {
    if (cities.length === 0) {
      res.status(404).json({ error: 'No cities available' });
      return;
    }
    const city = cities[Math.floor(Math.random() * cities.length)];
    const { id, name, state, country, coord } = city;
    res.json({ id, name, state, country, lat: coord.lat, lon: coord.lon });
  });

  return router;
}
