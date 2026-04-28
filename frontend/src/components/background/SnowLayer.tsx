import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';
import { CloudLayer } from './CloudLayer';

export function SnowLayer({ windSpeed = 0 }: { windSpeed?: number }) {
  const flakes = useMemo(() => {
    const rng = seededRng(4);
    return Array.from({ length: 55 }, () => ({
      left:     `${rng() * 100}%`,
      delay:    -(rng() * 5),
      duration: 4 + rng() * 4,
      size:     4 + rng() * 7,
      opacity:  0.5 + rng() * 0.4,
    }));
  }, []);

  const skewDeg   = Math.max(0, windSpeed - 11) * 2;
  const windFactor = (0.38 + Math.max(0, windSpeed - 11) * 0.2) / 0.38;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CloudLayer windFactor={windFactor} />
      <div
        className="absolute inset-0"
        style={{ transform: `skewX(-${skewDeg}deg)`, transformOrigin: 'top center' }}
      >
        {flakes.map((f, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: f.left, top: '-3%', width: f.size, height: f.size,
              background: 'rgba(200, 220, 240, 0.95)',
              animation: `wxSnowFall ${f.duration}s ease-in-out ${f.delay}s infinite`,
              opacity: f.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
