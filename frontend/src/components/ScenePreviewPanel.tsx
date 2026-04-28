import Tooltip from './Tooltip';
import WeatherStateToggle from './WeatherStateToggle';

const CONDITIONS = [
  { label: 'Clear', value: 'Clear', icon: 'fa-solid fa-sun' },
  { label: 'Cloudy', value: 'Clouds', icon: 'fa-solid fa-cloud' },
  { label: 'Rain', value: 'Rain', icon: 'fa-solid fa-cloud-showers-heavy' },
  { label: 'Drizzle', value: 'Drizzle', icon: 'fa-solid fa-cloud-rain' },
  { label: 'Thunder', value: 'Thunderstorm', icon: 'fa-solid fa-bolt' },
  { label: 'Snow', value: 'Snow', icon: 'fa-solid fa-snowflake' },
  { label: 'Fog', value: 'Fog', icon: 'fa-solid fa-smog' },
];

const WINDS = [
  { label: 'Breezy', value: 9, icon: 'fa-solid fa-wind', tooltip: 'Wind of > 7m/s' },
  { label: 'Gusty', value: 20, icon: 'fa-solid fa-wind', tooltip: 'Strong winds, wind of > 20m/s' },
];

interface Props {
  previewCondition: string | null;
  previewWind: number | null;
  isNight: boolean;
  onToggle: (value: string) => void;
  onToggleWind: (value: number) => void;
}

export default function ScenePreviewPanel({ previewCondition, previewWind, isNight, onToggle, onToggleWind }: Props) {
  const isActive = previewCondition !== null || previewWind !== null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="relative group inline-block">

        <button
          aria-label="Scene previews"
          aria-haspopup="true"
          className={[
            'relative flex items-center justify-center w-10 h-10 rounded-[10px]',
            'transition-all duration-200 backdrop-blur-[10px] shadow-wx-button',
            'hover:scale-[1.08] active:scale-[0.95]',
            isActive
              ? isNight
                ? 'bg-white/[0.22] text-white border border-white/30'
                : 'bg-primary text-white'
              : isNight
                ? 'bg-white/[0.08] text-[rgba(210,225,255,0.8)] border border-white/[0.15] hover:bg-white/[0.18]'
                : 'bg-white/60 text-primary hover:bg-white/90 hover:shadow-[0_4px_14px_rgba(1,1,45,0.22)]',
          ].join(' ')}
        >
          <i aria-hidden="true" className="fa-solid fa-palette" style={{ fontSize: 15 }} />
          <span aria-hidden="true" className={[
            'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 bg-[#8b5cf6]',
            isNight ? 'ring-[rgba(10,10,40,0.9)]' : 'ring-white/90',
          ].join(' ')} />
        </button>

        <div className={[
          'absolute top-full left-0 pt-1 z-[60]',
          'opacity-0 translate-y-1 pointer-events-none',
          'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto',
          'group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto',
          'transition-all duration-200 ease-out',
        ].join(' ')}>
          <div
            className={[
              'rounded-[12px] p-3 min-w-[210px]',
              isNight
                ? 'bg-[rgba(8,8,35,0.62)] backdrop-blur-[16px] border border-white/[0.12]'
                : 'bg-white/75 backdrop-blur-[8px]',
            ].join(' ')}
            style={{ boxShadow: '0px 4px 24px rgba(22, 19, 69, 0.14)' }}
          >
            <p className="text-[10px] font-semibold mb-2.5 uppercase tracking-[0.08em] text-muted">
              Weather state previews
            </p>

            <div role="group" aria-label="Weather condition previews" className="flex flex-wrap gap-1.5">
              {CONDITIONS.map(({ label, value, icon }) => (
                <WeatherStateToggle
                  key={value}
                  label={label}
                  icon={icon}
                  isActive={previewCondition === value}
                  isNight={isNight}
                  onClick={() => onToggle(value)}
                />
              ))}
            </div>

            <div className={[
              'mt-3 pt-3 border-t',
              isNight ? 'border-white/[0.10]' : 'border-primary/10',
            ].join(' ')}>
              <p className="text-[10px] font-semibold mb-2.5 uppercase tracking-[0.08em] text-muted">
                Wind
              </p>
              <div role="group" aria-label="Wind speed previews" className="flex gap-1.5">
                {WINDS.map(({ label, value, icon, tooltip }) => (
                  <Tooltip key={value} text={tooltip} side="top" align="center">
                    <WeatherStateToggle
                      label={label}
                      icon={icon}
                      isActive={previewWind === value}
                      isNight={isNight}
                      onClick={() => onToggleWind(value)}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
