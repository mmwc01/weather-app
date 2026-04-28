import { useRef, useCallback, ReactNode } from 'react';
import WeatherScene from './WeatherScene';
import { ErrorBoundary } from './ErrorBoundary';
import { hasScene } from '../utils/cardScene';

interface Props {
  cardBg: string;
  isNight: boolean;
  activeCondition: string | null;
  activeWind: number;
  onFlash?: () => void;
  children: ReactNode;
  forecastSlot?: ReactNode;
}

export default function Card({
  cardBg,
  isNight,
  activeCondition,
  activeWind,
  onFlash,
  children,
  forecastSlot,
}: Props) {
  const cardRef    = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLightning = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.classList.remove('wx-shake');
    void el.offsetWidth;
    el.classList.add('wx-shake');
    if (onFlash) setTimeout(onFlash, 500);
  }, [onFlash]);

  return (
    <div
      ref={cardRef}
      data-night={isNight}
      className="w-full rounded-[20px] shadow-2xl relative"
      style={{ background: cardBg, transition: 'background 1.8s ease' }}
    >
      <div aria-hidden="true" className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-[1]">
        {hasScene(activeCondition) && activeCondition && (
          <ErrorBoundary>
            <WeatherScene
              condition={activeCondition}
              windSpeed={activeWind}
              isNight={isNight}
              onLightning={handleLightning}
              contentRef={contentRef}
            />
          </ErrorBoundary>
        )}
        <div className="absolute inset-0 wx-card-gradient" />
      </div>

      <div className="relative z-[2]">
        <div ref={contentRef} className="px-4 sm:px-8 py-5 sm:py-8">
          {children}
        </div>
        {forecastSlot && (
          <div className="border-t border-white/40">
            {forecastSlot}
          </div>
        )}
      </div>
    </div>
  );
}
