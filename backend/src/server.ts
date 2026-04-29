import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import https from 'https';
import zlib from 'zlib';
import path from 'path';
import fs from 'fs';
import { CityListSchema, City } from './schemas/city';
import { createCitiesRouter } from './routes/cities';
import { createWeatherRouter } from './routes/weather';
import { logger } from './logger';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('request', { method: req.method, path: req.path, status: res.statusCode, ms });
  });
  next();
});

const CITY_OVERRIDES: Record<number, { name: string; country: string }> = {
  6167865: { name: 'Toronto', country: 'CA' },
  6094817: { name: 'Ottawa',  country: 'CA' },
  1850147: { name: 'Tokyo',   country: 'JP' },
};

const CITY_LIST_URL = 'https://bulk.openweathermap.org/sample/city.list.json.gz';
const cityListPath = process.env.CITY_LIST_PATH
  ?? path.join(__dirname, 'data/city.list.json');

function downloadCityList(destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    https.get(CITY_LIST_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed with status ${res.statusCode}`));
        return;
      }
      const gunzip = zlib.createGunzip();
      const out = fs.createWriteStream(destPath);
      res.pipe(gunzip).pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
      gunzip.on('error', reject);
    }).on('error', reject);
  });
}

async function loadCities(): Promise<City[]> {
  if (!fs.existsSync(cityListPath)) {
    logger.info('city list not found, downloading', { url: CITY_LIST_URL, dest: cityListPath });
    await downloadCityList(cityListPath);
    logger.info('city list downloaded');
  } else {
    logger.info('city list found, loading from disk', { path: cityListPath });
  }
  const cities = CityListSchema.parse(JSON.parse(fs.readFileSync(cityListPath, 'utf-8')));
  for (const city of cities) {
    const override = CITY_OVERRIDES[city.id];
    if (override) {
      city.name    = override.name;
      city.country = override.country;
    }
  }
  const filtered = cities.filter(c => c.name.trim() !== '-');
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  logger.info('city list loaded', { count: filtered.length });
  return filtered;
}

const apiKey = process.env.OPENWEATHERMAP_API_KEY;
if (!apiKey) {
  logger.warn('OPENWEATHERMAP_API_KEY is not set — weather routes will fail');
}

loadCities().then((cities) => {
  app.use('/api/cities', createCitiesRouter(cities));
  app.use('/api/weather', createWeatherRouter(apiKey ?? ''));

  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendBuildPath)) {
    logger.info('serving frontend', { path: frontendBuildPath });
    app.use(express.static(frontendBuildPath));
    app.get('/{*path}', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error('unhandled error', { message: err.message, path: req.path, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(port, () => {
    logger.info('server started', { port });
  });
}).catch((err: Error) => {
  logger.error('failed to start server', { message: err.message, stack: err.stack });
  process.exit(1);
});
