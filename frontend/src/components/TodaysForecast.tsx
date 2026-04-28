import { WeatherData } from '../types/weather';
import { formatTemp } from '../utils/temperature';
import Button from './Button';

const CONDITION_ICONS: Record<string, string> = {
  clear:        'fa-solid fa-sun',
  clouds:       'fa-solid fa-cloud',
  rain:         'fa-solid fa-cloud-showers-heavy',
  drizzle:      'fa-solid fa-cloud-rain',
  thunderstorm: 'fa-solid fa-bolt',
  snow:         'fa-solid fa-snowflake',
  mist:         'fa-solid fa-smog',
  fog:          'fa-solid fa-smog',
  haze:         'fa-solid fa-smog',
};

function conditionIcon(condition: string): string {
  return CONDITION_ICONS[condition.toLowerCase()] ?? 'fa-solid fa-cloud';
}

interface Props {
  weather:          WeatherData;
  unit:             'C' | 'F';
  showForecast:     boolean;
  onToggleForecast: () => void;
}

const DETAIL_DIVIDER = 'border-l border-primary/10';

export default function TodaysForecast({ weather, unit, showForecast, onToggleForecast }: Props) {
  const details = [
    { label: 'Feels Like', value: `${formatTemp(weather.feelsLike, unit)}°` },
    { label: 'Wind',       value: String(weather.wind), sub: 'm/s' },
    { label: 'Humidity',   value: `${weather.humidity}%` },
    { label: 'Visibility', value: weather.visibility != null ? `${weather.visibility} km` : '—' },
  ];

  const cityNow    = new Date(Date.now() + weather.timezone * 1000);
  const todayLabel = cityNow.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeLabel  = cityNow.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="mt-2">
      <p className="text-lg font-bold leading-tight text-primary">
        {weather.city}{' '}
        <span className="text-sm font-medium opacity-55">{weather.country}</span>
      </p>

      <div className="mb-3 mt-0.5">
        <p className="text-[10px] font-semibold tracking-[0.8px] uppercase text-primary/45">
          Today's Forecast
        </p>
        <p className="text-xs font-medium text-primary/55">
          {todayLabel} · {timeLabel} (local time)
        </p>
      </div>

      <i
        aria-hidden="true"
        className={`${conditionIcon(weather.condition)} block text-[52px] opacity-75 mb-1 text-primary`}
      />

      <p className="text-[13px] font-semibold tracking-[0.6px] uppercase opacity-55 text-primary">
        {weather.description}
      </p>

      <div className="flex items-start leading-none mt-1">
        <span
          className="font-extrabold leading-none text-primary"
          style={{ fontSize: 96, letterSpacing: -4, lineHeight: 1 }}
        >
          {formatTemp(weather.temp, unit)}
        </span>
        <span
          className="font-medium opacity-70 text-primary mt-2"
          style={{ fontSize: 40, verticalAlign: 'super' }}
        >
          °{unit}
        </span>
      </div>

      <p className="text-[13px] font-semibold opacity-50 mt-0.5 mb-5 text-primary">
        H: {formatTemp(weather.tempMax, unit)}°&nbsp;&nbsp;·&nbsp;&nbsp;L: {formatTemp(weather.tempMin, unit)}°
      </p>

      <div className="flex bg-white/35 backdrop-blur-[8px] rounded-[12px] border border-white/50 overflow-hidden">
        {details.map(({ label, value, sub }, i) => (
          <div
            key={label}
            className={`flex-1 flex flex-col items-center py-3 px-2 gap-1 ${i > 0 ? DETAIL_DIVIDER : ''}`}
          >
            <p className="text-[10px] font-semibold tracking-[0.5px] uppercase opacity-45 text-primary">
              {label}
            </p>
            <p className="text-[15px] font-bold opacity-85 text-primary">
              {value}
            </p>
            {sub && (
              <p className="text-[10px] font-medium opacity-40 text-primary">
                {sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center mt-5">
        <Button variant="outline" onClick={onToggleForecast}>
          5-Day Forecast
          <svg
            aria-hidden="true"
            width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            style={{ transition: 'transform 0.3s', transform: showForecast ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
