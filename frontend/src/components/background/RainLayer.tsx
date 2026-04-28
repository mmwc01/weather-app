import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';
import { CloudLayer } from './CloudLayer';

interface RainLayerProps {
  heavy?: boolean;
  drizzle?: boolean;
  windFactor?: number;
}

export function RainLayer({ heavy = false, drizzle = false, windFactor = 1 }: RainLayerProps) {
  const count = heavy ? 80 : drizzle ? 25 : 50;
  const drops = useMemo(() => {
    const rng = seededRng(drizzle ? 7 : 3);
    return Array.from({ length: count }, () => ({
      left:     `${rng() * 100}%`,
      delay:    -(rng() * 1.6),
      duration: 0.55 + rng() * 0.4,
      opacity:  0.35 + rng() * 0.45,
      height:   heavy ? 14 + rng() * 10 : 10 + rng() * 8,
      width:    heavy ? 1.5 : 1,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heavy, drizzle]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CloudLayer dense={heavy} windFactor={windFactor} />
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: d.left, top: '-5%', width: d.width, height: d.height,
            background: 'rgba(167, 201, 225, 0.85)', borderRadius: 2,
            animation: `wxRainFall ${d.duration}s linear ${d.delay}s infinite`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}
