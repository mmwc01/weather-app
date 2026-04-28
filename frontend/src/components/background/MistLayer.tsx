import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';

export function MistLayer({ windSpeed = 0 }: { windSpeed?: number }) {
  const bands = useMemo(() => {
    const rng = seededRng(6);
    return Array.from({ length: 6 }, (_, i) => ({
      top:      `${10 + i * 15 + rng() * 5}%`,
      height:   60 + rng() * 50,
      delay:    -(5 + rng() * 35),
      duration: 25 + rng() * 20,
      opacity:  0.3 + rng() * 0.3,
    }));
  }, []);

  const windFactor = (0.38 + Math.max(0, windSpeed - 11) * 0.2) / 0.38;
  const skewDeg    = Math.max(0, windSpeed - 11) * 1.5;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #d5dce8 0%, #e2e8f0 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ transform: `skewY(-${skewDeg}deg)`, transformOrigin: 'center left' }}
      >
        {bands.map((b, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: b.top, left: '-10%', width: '130%', height: b.height,
              background: 'linear-gradient(90deg, transparent, rgba(210,220,235,0.85), rgba(215,225,240,0.9), transparent)',
              animation: `wxMistDrift ${b.duration / windFactor}s linear ${b.delay}s infinite`,
              opacity: b.opacity, filter: 'blur(8px)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
