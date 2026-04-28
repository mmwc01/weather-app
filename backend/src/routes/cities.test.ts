import request from 'supertest';
import express from 'express';
import { createCitiesRouter } from './cities';
import { City } from '../schemas/city';

const makeCity = (id: number, name: string, country: string, state = ''): City => ({
  id,
  name,
  country,
  state,
  coord: { lon: 0, lat: 0 },
});

const mockCities: City[] = [
  makeCity(1, 'Toronto', 'CA', 'Ontario'),
  makeCity(2, 'Tokyo', 'JP'),
  makeCity(3, 'Ottawa', 'CA', 'Ontario'),
  makeCity(4, 'Tomsk', 'RU'),
  makeCity(5, 'Toulouse', 'FR'),
  makeCity(6, 'Torun', 'PL'),
  makeCity(7, 'Torino', 'IT'),
  makeCity(8, 'Tokat', 'TR'),
  makeCity(9, 'Torbay', 'GB'),
  makeCity(10, 'Tongi', 'BD'),
  makeCity(11, 'Tokushima', 'JP'),
  makeCity(12, 'Kyoto', 'JP'),
  makeCity(13, 'Porto', 'PT'),
  makeCity(14, 'Stoke', 'GB'),
  makeCity(15, 'Victoria', 'CA'),
  makeCity(16, 'Boston', 'US'),
  makeCity(17, 'London', 'GB'),
  makeCity(18, 'Berlin', 'DE'),
  makeCity(19, 'Paris', 'FR'),
];

const paginationCities: City[] = Array.from({ length: 25 }, (_, i) =>
  makeCity(100 + i, `Paris${i}`, 'FR')
);

const app = express();
app.use('/api/cities', createCitiesRouter([...mockCities, ...paginationCities]));

describe('GET /api/cities', () => {
  it('returns default cities when q is missing', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cities');
    expect(Array.isArray(res.body.cities)).toBe(true);
  });

  it('returns default cities when q is empty', async () => {
    const res = await request(app).get('/api/cities?q=');
    expect(res.status).toBe(200);
    expect(res.body.cities.length).toBeGreaterThan(0);
  });

  it('returns a hasMore flag in the response', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.body).toHaveProperty('hasMore');
    expect(typeof res.body.hasMore).toBe('boolean');
  });

  it('returns results for a single character query', async () => {
    const res = await request(app).get('/api/cities?q=t');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cities)).toBe(true);
  });

  it('returns 200 with matching cities for a valid query', async () => {
    const res = await request(app).get('/api/cities?q=ot');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cities');
    expect(Array.isArray(res.body.cities)).toBe(true);
  });

  it('returns cities with the correct response shape', async () => {
    const res = await request(app).get('/api/cities?q=to');
    expect(res.status).toBe(200);
    const city = res.body.cities[0];
    expect(city).toHaveProperty('id');
    expect(city).toHaveProperty('name');
    expect(city).toHaveProperty('state');
    expect(city).toHaveProperty('country');
    expect(city).not.toHaveProperty('coord');
  });

  it('prioritizes startsWith matches over contains matches', async () => {
    const res = await request(app).get('/api/cities?q=to');
    expect(res.status).toBe(200);
    const names: string[] = res.body.cities.map((c: { name: string }) => c.name.toLowerCase());
    const startsWithIdx = names.findIndex((n) => n.startsWith('to'));
    const containsIdx = names.findIndex((n) => !n.startsWith('to') && n.includes('to'));
    if (startsWithIdx !== -1 && containsIdx !== -1) {
      expect(startsWithIdx).toBeLessThan(containsIdx);
    }
  });

  it('respects the limit param', async () => {
    const res = await request(app).get('/api/cities?q=to&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.cities.length).toBeLessThanOrEqual(5);
  });

  it('returns hasMore=true when there are more results beyond the current page', async () => {
    const res = await request(app).get('/api/cities?q=paris&page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.hasMore).toBe(true);
  });

  it('returns hasMore=false on the last page', async () => {
    const res = await request(app).get('/api/cities?q=paris&page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.hasMore).toBe(false);
  });

  it('returns the correct cities for page 2', async () => {
    const page1 = await request(app).get('/api/cities?q=paris&page=1&limit=10');
    const page2 = await request(app).get('/api/cities?q=paris&page=2&limit=10');
    const page1Ids = page1.body.cities.map((c: { id: number }) => c.id);
    const page2Ids = page2.body.cities.map((c: { id: number }) => c.id);
    expect(page2Ids.length).toBeGreaterThan(0);
    expect(page2Ids).not.toEqual(page1Ids);
  });

  it('returns an empty array when there are no matches', async () => {
    const res = await request(app).get('/api/cities?q=zzz');
    expect(res.status).toBe(200);
    expect(res.body.cities).toEqual([]);
    expect(res.body.hasMore).toBe(false);
  });

  it('is case-insensitive', async () => {
    const lower = await request(app).get('/api/cities?q=toronto');
    const upper = await request(app).get('/api/cities?q=TORONTO');
    expect(lower.body.cities).toEqual(upper.body.cities);
  });
});
