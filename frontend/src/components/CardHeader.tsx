import { CityOption } from '../types/weather';
import CitySearch from './CitySearch';
import Button from './Button';

interface Props {
  unit: 'C' | 'F';
  onSelect: (city: CityOption) => void;
  onUnitChange: (unit: 'C' | 'F') => void;
}

export default function CardHeader({ unit, onSelect, onUnitChange }: Props) {
  return (
    <div className="mb-5 sm:mb-6">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary leading-tight">
          Weather Forecast
        </h1>
        <div
          role="group"
          aria-label="Temperature unit"
          className="inline-flex rounded-[8px] overflow-hidden border border-primary/20 night:border-white/25 shrink-0"
        >
          {(['C', 'F'] as const).map((u) => (
            <Button
              key={u}
              variant="unit"
              onClick={() => onUnitChange(u)}
              aria-pressed={unit === u}
              aria-label={`Degrees ${u === 'C' ? 'Celsius' : 'Fahrenheit'}`}
              isActive={unit === u}
            >
              &deg;{u}
            </Button>
          ))}
        </div>
      </div>

      <CitySearch onSelect={onSelect} />
    </div>
  );
}
