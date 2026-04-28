import request from 'supertest';
import express from 'express';
import { createWeatherRouter } from './weather';

const app = express();
app.use(express.json());
app.use('/api/weather', createWeatherRouter('test-api-key'));

const mockOWMWeather = {
  weather: [{ main: 'Clouds', description: 'broken clouds' }],
  main: { temp: 23.6, temp_min: 20.5, temp_max: 25.2 },
  wind: { speed: 4.1 },
  name: 'Tokyo',
  sys: { country: 'JP' },
};

const mockOWMForecast = {
  list: [
    {
      dt: 1694779200,
      dt_txt: '2023-09-15 12:00:00',
      weather: [{ main: 'Rain', description: 'light rain' }],
      main: { temp: 24.1, temp_min: 24.05, temp_max: 24.85 },
      wind: { speed: 3.0 },
    },
    {
      dt: 1694790000,
      dt_txt: '2023-09-15 15:00:00',
      weather: [{ main: 'Rain', description: 'moderate rain' }],
      main: { temp: 25.4, temp_min: 25.0, temp_max: 26.1 },
      wind: { speed: 3.5 },
    },
  ],
  city: { name: 'Tokyo', country: 'JP' },
};

function mockFetchOk(data: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response);
}

function mockFetchError(status: number, message: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ message }),
  } as unknown as Response);
}

describe('GET /api/weather/:cityId', () => {
  it('returns 400 for a non-numeric cityId', async () => {
    const res = await request(app).get('/api/weather/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a negative cityId', async () => {
    const res = await request(app).get('/api/weather/-1');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with transformed weather data', async () => {
    mockFetchOk(mockOWMWeather);
    const res = await request(app).get('/api/weather/1850147');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      city: 'Tokyo',
      country: 'JP',
      condition: 'Clouds',
      description: 'broken clouds',
      temp: 24,
      tempMin: 20.5,
      tempMax: 25.2,
      wind: 4.1,
    });
  });

  it('rounds temperature to the nearest integer', async () => {
    mockFetchOk({ ...mockOWMWeather, main: { temp: 23.4, temp_min: 20.0, temp_max: 25.0 } });
    const res = await request(app).get('/api/weather/1850147');
    expect(res.body.temp).toBe(23);
  });

  it('forwards the OWM error status and message when OWM returns an error', async () => {
    mockFetchError(404, 'city not found');
    const res = await request(app).get('/api/weather/9999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('city not found');
  });

  it('calls the OWM API with the correct cityId and units', async () => {
    mockFetchOk(mockOWMWeather);
    await request(app).get('/api/weather/1850147');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('id=1850147')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('units=metric')
    );
  });
});

describe('GET /api/weather/:cityId/forecast', () => {
  it('returns 400 for a non-numeric cityId', async () => {
    const res = await request(app).get('/api/weather/abc/forecast');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with transformed forecast data', async () => {
    mockFetchOk(mockOWMForecast);
    const res = await request(app).get('/api/weather/1850147/forecast');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Tokyo');
    expect(res.body.country).toBe('JP');
    expect(Array.isArray(res.body.list)).toBe(true);
    expect(res.body.list).toHaveLength(2);
  });

  it('transforms each forecast item correctly', async () => {
    mockFetchOk(mockOWMForecast);
    const res = await request(app).get('/api/weather/1850147/forecast');
    const first = res.body.list[0];
    expect(first).toEqual({
      dt: 1694779200,
      dtTxt: '2023-09-15 12:00:00',
      condition: 'Rain',
      description: 'light rain',
      temp: 24,
      tempMin: 24.05,
      tempMax: 24.85,
      wind: 3.0,
    });
  });

  it('rounds each forecast item temperature', async () => {
    mockFetchOk(mockOWMForecast);
    const res = await request(app).get('/api/weather/1850147/forecast');
    expect(res.body.list[1].temp).toBe(25);
  });

  it('forwards the OWM error status and message when OWM returns an error', async () => {
    mockFetchError(401, 'Invalid API key');
    const res = await request(app).get('/api/weather/1850147/forecast');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid API key');
  });

  it('calls the OWM forecast API with the correct cityId and units', async () => {
    mockFetchOk(mockOWMForecast);
    await request(app).get('/api/weather/1850147/forecast');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('id=1850147')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('units=metric')
    );
  });
});
