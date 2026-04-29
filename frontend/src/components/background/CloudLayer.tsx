import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';

interface CloudSpec {
  top: string; width: number; opacity: number;
  delay: number; duration: number; blur: number; color: string;
}

function CloudShape({ spec }: { spec: CloudSpec }) {
  return (
    <div
      className="absolute"
      style={{
        top: spec.top, left: '-25%',
        width: spec.width, height: spec.width * 0.42,
        animation: `wxCloudDrift ${spec.duration}s linear ${spec.delay}s infinite`,
        opacity: spec.opacity, filter: `blur(${spec.blur}px)`,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '60%', background: spec.color, borderRadius: '50px' }} />
        <div style={{ position: 'absolute', bottom: '38%', left: '18%', width: '42%', height: '65%', background: spec.color, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '35%', left: '42%', width: '30%', height: '55%', background: spec.color, borderRadius: '50%' }} />
      </div>
    </div>
  );
}

export interface CloudLayerProps {
  dense?: boolean;
  windFactor?: number;
  isNight?: boolean;
  entering?: boolean;
}

export function CloudLayer({ dense = false, windFactor = 1, isNight = false, entering = false }: CloudLayerProps) {
  const clouds = useMemo<CloudSpec[]>(() => {
    const rng = seededRng(2);
    return Array.from({ length: dense ? 9 : 6 }, () => ({
      top:     `${5 + rng() * 60}%`,
      width:   160 + rng() * 200,
      opacity: 0.55 + rng() * 0.35,
      delay:   entering ? rng() * 20 : -(6 + rng() * 60),
      duration: 40 + rng() * 40,
      blur:    dense ? 1 + rng() * 2 : rng() * 1.5,
      color: isNight
        ? (dense
          ? `rgba(${60  + Math.floor(rng() * 20)}, ${70  + Math.floor(rng() * 20)}, ${130 + Math.floor(rng() * 20)}, 0.88)`
          : `rgba(${75  + Math.floor(rng() * 25)}, ${88  + Math.floor(rng() * 20)}, ${155 + Math.floor(rng() * 20)}, 0.82)`)
        : (dense
          ? `rgba(${160 + Math.floor(rng() * 30)}, ${165 + Math.floor(rng() * 30)}, ${195 + Math.floor(rng() * 30)}, 0.85)`
          : `rgba(${220 + Math.floor(rng() * 35)}, ${230 + Math.floor(rng() * 25)}, ${245 + Math.floor(rng() * 10)}, 0.9)`),
    }));
  }, [dense, isNight, entering]);

  const bg = isNight
    ? 'transparent'
    : (dense
      ? 'linear-gradient(180deg, #b8c4d8 0%, #cdd5e0 60%, #dce2ea 100%)'
      : 'linear-gradient(180deg, #dce8f5 0%, #e8f0f8 50%, #f3f6fa 100%)');

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!isNight && <div className="absolute inset-0" style={{ background: bg }} />}
      {clouds.map((c, i) => (
        <CloudShape key={i} spec={{ ...c, duration: c.duration / windFactor }} />
      ))}
    </div>
  );
}
