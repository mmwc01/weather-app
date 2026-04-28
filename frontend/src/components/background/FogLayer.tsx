interface FogBlob {
  top: number;
  w: number;
  h: number;
  dur: number;
  delayFrac: number;
  opacity: number;
}

const BLOBS: FogBlob[] = [
  { top: -12, w: 580, h: 320, dur: 52, delayFrac: 0.05, opacity: 0.72 },
  { top:  -8, w: 500, h: 290, dur: 44, delayFrac: 0.22, opacity: 0.70 },
  { top: -10, w: 620, h: 340, dur: 48, delayFrac: 0.40, opacity: 0.68 },
  { top:  -6, w: 460, h: 275, dur: 40, delayFrac: 0.57, opacity: 0.72 },
  { top:  -9, w: 540, h: 300, dur: 56, delayFrac: 0.75, opacity: 0.65 },
  { top:  -5, w: 480, h: 260, dur: 46, delayFrac: 0.90, opacity: 0.68 },

  { top: 14, w: 500, h: 255, dur: 50, delayFrac: 0.12, opacity: 0.45 },
  { top: 17, w: 400, h: 230, dur: 42, delayFrac: 0.45, opacity: 0.40 },
  { top: 15, w: 320, h: 210, dur: 55, delayFrac: 0.78, opacity: 0.38 },

  { top: 30, w: 460, h: 220, dur: 48, delayFrac: 0.20, opacity: 0.22 },
  { top: 34, w: 330, h: 190, dur: 52, delayFrac: 0.62, opacity: 0.18 },

  { top: 46, w: 400, h: 200, dur: 58, delayFrac: 0.38, opacity: 0.10 },
  { top: 50, w: 280, h: 175, dur: 50, delayFrac: 0.80, opacity: 0.08 },
];

export function FogLayer({ windSpeed = 0 }: { windSpeed?: number }) {
  const speedFactor = 1 + Math.max(0, windSpeed - 5) * 0.08;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {BLOBS.map((b, i) => {
        const dur = b.dur / speedFactor;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '110%',
              top: `${b.top}%`,
              width: b.w,
              height: b.h,
              backgroundColor: '#d8dde2',
              borderRadius: '120%',
              filter: 'blur(40px)',
              opacity: b.opacity,
              animation: `wxFogDrift ${dur}s linear ${-(b.delayFrac * dur)}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
