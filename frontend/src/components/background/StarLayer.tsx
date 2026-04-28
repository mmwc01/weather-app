import { useMemo } from 'react';
import { seededRng } from '../../utils/seededRng';

const CROSS_CLIP = 'polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)';

export function StarLayer() {
  const stars = useMemo(() => {
    const rng = seededRng(9);
    return Array.from({ length: 55 }, () => {
      const cross = rng() < 0.35;
      return {
        left:     `${rng() * 100}%`,
        top:      `${rng() * 96}%`,
        size:     cross ? 4 + rng() * 3 : 1 + rng() * 2,
        delay:    -(rng() * 10),
        duration: 2.5 + rng() * 5,
        cross,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: s.left, top: s.top, width: s.size, height: s.size,
            background:   '#fff5a0',
            borderRadius: s.cross ? 0 : '50%',
            clipPath:     s.cross ? CROSS_CLIP : undefined,
            animation:    `${s.cross ? 'wxCrossStarTwinkle' : 'wxStarTwinkle'} ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
