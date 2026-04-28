import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';

export function SunLayer() {
  const rays = useMemo(() => {
    const rng = seededRng(1);
    return Array.from({ length: 12 }, (_, i) => ({
      angle:    i * 30,
      delay:    rng() * 4,
      duration: 3 + rng() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(170deg, #e8f4fd 0%, #d0eaf8 50%, #f6f7fa 100%)' }}
      />
      <div className="absolute" style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }}>
        {rays.map((r, i) => (
          <div
            key={i}
            className="absolute origin-bottom"
            style={{
              width: 3, height: 220, left: '50%', bottom: '50%', marginLeft: -1.5,
              background: 'linear-gradient(to top, rgba(255,220,80,0.55), transparent)',
              transform: `rotate(${r.angle}deg)`,
              animation: `wxSunRay ${r.duration}s ease-in-out ${r.delay}s infinite`,
              borderRadius: 4,
            }}
          />
        ))}
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'radial-gradient(circle, #ffe94d 40%, #ffd000 100%)',
          boxShadow: '0 0 60px 20px rgba(255,220,60,0.3)',
          animation: 'wxSunPulse 4s ease-in-out infinite',
          position: 'relative', zIndex: 1,
        }} />
      </div>
    </div>
  );
}
