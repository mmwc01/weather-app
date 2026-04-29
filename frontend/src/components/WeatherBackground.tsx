import { useState, useEffect, useRef, type ReactNode } from 'react';
import { SunLayer } from './background/SunLayer';
import { CloudLayer } from './background/CloudLayer';
import { RainLayer } from './background/RainLayer';
import { SnowLayer } from './background/SnowLayer';
import { ThunderstormLayer } from './background/ThunderstormLayer';
import { FogLayer } from './background/FogLayer';
import { StarLayer } from './background/StarLayer';
import { useFade } from '../hooks/useFade';
import {
  type DayCfg,
  resolveKind,
  resolveCondition,
  CLOUD_TYPES,
  DENSE_NIGHT,
  NIGHT_STARS_OK,
} from '../utils/weatherBackground';

interface Props {
  condition: string;
  flashTrigger?: number;
  windSpeed?: number;
  isNight?: boolean;
}

function renderDayLayer(cfg: DayCfg): ReactNode {
  switch (cfg.kind) {
    case 'rain': return <RainLayer heavy windFactor={cfg.windFactor} />;
    case 'drizzle': return <RainLayer drizzle windFactor={cfg.windFactor} />;
    case 'snow': return <SnowLayer windSpeed={cfg.windSpeed} />;
    case 'thunder': return <ThunderstormLayer flashTrigger={cfg.flashTrigger} />;
    default: return <CloudLayer windFactor={cfg.windFactor} entering={false} />;
  }
}

export default function WeatherBackground({ condition, flashTrigger, windSpeed = 0, isNight = false }: Props) {
  const type = resolveCondition(condition);
  const windFactor = (0.38 + Math.max(0, windSpeed - 11) * 0.2) / 0.38;

  const hasDayClouds = CLOUD_TYPES.has(type);
  const dayCfg: DayCfg = { kind: resolveKind(type), windFactor, windSpeed, flashTrigger };
  const [exitDayCfg, setExitDayCfg] = useState<DayCfg>(dayCfg);
  useEffect(() => {
    if (hasDayClouds) setExitDayCfg({ kind: resolveKind(type), windFactor, windSpeed, flashTrigger }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [hasDayClouds, type, windFactor, windSpeed, flashTrigger]);
  const dayFade = useFade(hasDayClouds, 1800);

  const [dayEnterKey, setDayEnterKey] = useState(0);
  const prevDayActive = useRef(hasDayClouds);
  useEffect(() => {
    if (!prevDayActive.current && hasDayClouds) setDayEnterKey(k => k + 1);
    prevDayActive.current = hasDayClouds;
  }, [hasDayClouds]);

  const nightFade = useFade(isNight, 2000);

  const hasNightClouds = isNight && CLOUD_TYPES.has(type);
  const isDenseNight = DENSE_NIGHT.has(type);
  const [exitNightCfg, setExitNightCfg] = useState({ dense: isDenseNight, windFactor });
  useEffect(() => {
    if (hasNightClouds) setExitNightCfg({ dense: isDenseNight, windFactor }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [hasNightClouds, isDenseNight, windFactor]);
  const nightCloudFade = useFade(hasNightClouds, 1800);

  const [nightEnterKey, setNightEnterKey] = useState(0);
  const prevNightActive = useRef(hasNightClouds);
  useEffect(() => {
    if (!prevNightActive.current && hasNightClouds) setNightEnterKey(k => k + 1);
    prevNightActive.current = hasNightClouds;
  }, [hasNightClouds]);

  const starFade = useFade(isNight && NIGHT_STARS_OK.has(type), 1500);

  const activeDayCfg = dayFade.visible ? dayCfg : exitDayCfg;
  const activeNightDense = nightCloudFade.visible ? isDenseNight : exitNightCfg.dense;
  const activeNightWf = nightCloudFade.visible ? windFactor : exitNightCfg.windFactor;

  return (
    <>
    <div className="fixed inset-0 -z-10">
      {type === 'clear' && <SunLayer />}
      {type === 'fog' && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #d0d8e4 0%, #dde4ed 100%)' }} />
      )}
      {(type === 'default' || (!hasDayClouds && type !== 'clear' && type !== 'fog')) && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #e8edf5 0%, #f3f5fa 100%)' }} />
      )}

      {dayFade.mounted && (
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: dayFade.visible ? 1 : 0, transition: 'opacity 1.8s ease-in',
        }}>
          {activeDayCfg.kind === 'cloud'
            ? <CloudLayer key={dayEnterKey} windFactor={activeDayCfg.windFactor} entering={dayEnterKey > 0} />
            : renderDayLayer(activeDayCfg)
          }
        </div>
      )}

      {nightFade.mounted && (
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: nightFade.visible ? 1 : 0, transition: 'opacity 2s ease',
        }}>
          <div className="absolute inset-0" style={{ background: 'rgba(21,24,41,0.93)' }} />

          {nightCloudFade.mounted && (
            <div className="absolute inset-0" style={{
              opacity: nightCloudFade.visible ? 1 : 0, transition: 'opacity 1.8s ease-in',
            }}>
              <CloudLayer
                key={nightEnterKey}
                dense={activeNightDense}
                windFactor={activeNightWf}
                isNight
                entering={nightEnterKey > 0}
              />
            </div>
          )}

          {starFade.mounted && (
            <div className="absolute inset-0" style={{
              opacity: starFade.visible ? 1 : 0,
              transition: starFade.visible ? 'opacity 4s ease' : 'opacity 1.5s ease-in',
            }}>
              <StarLayer />
            </div>
          )}

          {type === 'thunderstorm' && flashTrigger != null && flashTrigger > 0 && (
            <div
              key={flashTrigger}
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'rgba(230,240,255,0.75)', animation: 'wxFlash 0.45s ease-out forwards' }}
            />
          )}
        </div>
      )}
    </div>

    {type === 'fog' && (
      <div className="fixed inset-0 z-[20] pointer-events-none">
        <FogLayer windSpeed={windSpeed} />
      </div>
    )}
    </>
  );
}
