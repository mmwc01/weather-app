import Button from './Button';
import Tooltip from './Tooltip';

interface Props {
  isNight:  boolean;
  onToggle: () => void;
}

export default function DayNightToggle({ isNight, onToggle }: Props) {
  return (
    <Tooltip text={isNight ? 'Switch to day' : 'Switch to night'} side="bottom" align="end">
      <Button
        variant="icon"
        isActive={isNight}
        isNight={false}
        onClick={onToggle}
        aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
        aria-pressed={isNight}
      >
        {isNight
          ? <i aria-hidden="true" className="fa-solid fa-moon" style={{ fontSize: 17 }} />
          : (
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 100 100"
                 style={{ display: 'block', overflow: 'visible' }}>
              <circle cx="50" cy="50" r="22" fill="currentColor" />
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x="47.5" y="8" width="5" height="14" rx="2.5" fill="currentColor"
                      transform={`rotate(${i * 30}, 50, 50)`} />
              ))}
            </svg>
          )
        }
      </Button>
    </Tooltip>
  );
}
