const SPOKES = 12;
const CX = 50, CY = 50;
const CIRCLE_R   = 22;
const SPOKE_INNER = 28;
const SPOKE_OUTER = 42;
const SPOKE_W    = 5;
const SPOKE_RX   = 2.5;

export default function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: '#eef0f5' }}
      role="status"
      aria-label="Loading weather data"
    >

      <svg
        width="100" height="100"
        viewBox="0 0 100 100"
        className="wx-spin-slow"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <circle cx={CX} cy={CY} r={CIRCLE_R} fill="#9ca3af" />

        <g className="wx-spoke-breath">
          {Array.from({ length: SPOKES }, (_, i) => {
            const angle = (i * 360) / SPOKES;
            const x = CX - SPOKE_W / 2;
            const y = CY - SPOKE_OUTER;
            const h = SPOKE_OUTER - SPOKE_INNER;
            return (
              <rect
                key={i}
                x={x} y={y}
                width={SPOKE_W} height={h}
                rx={SPOKE_RX}
                fill="#9ca3af"
                transform={`rotate(${angle}, ${CX}, ${CY})`}
              />
            );
          })}
        </g>
      </svg>

      <p className="mt-8 loading-message" >
        stepping outside to check the weather&hellip; hold on&hellip;
      </p>
    </div>
  );
}
