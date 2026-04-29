# Tokegon Weather App

A weather app with animated background states, triggered by weather conditions — rain falls, snow drifts, lightning strikes. Search any city, toggle between Celsius and Fahrenheit, flip to a 5-day forecast, or use the preview panel to cycle through weather states.

## Prerequisites

- Node 22+
- An [OpenWeatherMap](https://openweathermap.org/api) API key 

## Getting started

Copy the env files and fill them in:

```bash
cp frontend/.env.sample frontend/.env
cp backend/.env.sample backend/.env
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

`backend/.env`:
```
OPENWEATHERMAP_API_KEY=your_key_here
PORT=8000
```

Then install and run:

```bash
npm run install:all
npm run dev
```

Frontend is at `http://localhost:5173`, backend at `http://localhost:8000`. Both have hot reload.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run frontend + backend with hot reload (what you want for development) |
| `npm run install:all` | Install dependencies for root, frontend, and backend |
| `npm run build:all` | Build both frontend and backend |
| `npm run start` | Run the built app (frontend served by the backend, no dev server) |
| `npm run setup-and-start` | Install, build, and start everything in one shot |

## Docker

Builds the frontend, bundles it into the backend image, and serves everything from a single container:

```bash
npm run docker:run
```

App will be at `http://localhost:8080`. To stop it:

```bash
npm run docker:stop
```

## Running tests

```bash
cd frontend && npm test

cd backend && npm test
```

## Assumptions

The spec asked for a dropdown with three fixed cities (Toronto, Ottawa, Tokyo). I treated that as a starting point rather than a hard constraint; a fixed list of three felt too limiting for a real weather app, so I replaced it with a searchable input against the full OpenWeatherMap city database (~200k cities). The core requirement (select a city, see current weather, expand to forecast) is all there.

The spec also had the frontend call OpenWeatherMap directly with the API key in the URL. I moved that behind an Express backend instead, since putting an API key in client-side code isn't something you'd actually ship.

The forecast layout in the spec was a date-tabbed table of 3-hour slots. I went with grouped 5-day cards instead — same data, different presentation.

SCALE ASSUMPTIONS: the backend is a single Node.js process with no response caching and no rate limiting. Every weather or forecast load hits OpenWeatherMap directly. On the free tier (60 calls/minute), you're looking at roughly 20–30 concurrent active users before the api starts returning 429s. City search is fine — that runs against an in-memory list. If this needed to handle real traffic you'd want a short TTL cache on weather responses (weather doesn't change by the minute anyway) and either an upgraded OWM plan or a request queue. I assumed light use for a poc or a take-home assessment like this one.

LIMITATIONS DURING IMPLEMENTATION: the sample from the pdf suggested I display a total of 6 days worth of data, however the free tier of the OpenWeatherMap api has a hard limit of 5 days worth of values, with the caveat that 6 days worth of data is available by upgrading to their One Call api. I assumed for this task, the free tier would suffice.

## Additional features

- **Animated backgrounds**: the background reacts to actual weather conditions: rain, snow, thunderstorms with lightning, fog, clouds, clear sky with sun/moon/stars, wind with flying leaves
- **Full city search**: type-ahead search across the full city database (from OpenWeatherMap) with scroll-to-load pagination
- **Geolocation**: "I'm feeling lucky" button functions like google's feeling lucky button; it randomizes a city to be loaded
- **°C / °F toggle**: changes temperature units
- **Day/night mode**: switches automatically based on actual sunrise/sunset times for the selected city
- **Weather preview panel**: cycle through all weather states in the UI without needing real weather input (just a nice to have visual interaction tool)
- **Docker**: single-container build that serves everything
- **Tests**: frontend (Vitest + Testing Library) and backend both have test coverage
- **Fly.io deployment**: `fly.toml` included, deploy with `fly deploy`
- **Responsive**: The app is both a desktop browser and mobile designed, though more emphasis was placed on designing it for desktop browsing.
