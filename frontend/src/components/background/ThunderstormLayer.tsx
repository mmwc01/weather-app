import { RainLayer } from './RainLayer';

export function ThunderstormLayer({ flashTrigger = 0 }: { flashTrigger?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <RainLayer heavy />
      {flashTrigger > 0 && (
        <div
          key={flashTrigger}
          className="absolute inset-0"
          style={{
            background: 'rgba(230, 240, 255, 0.75)',
            animation: 'wxFlash 0.45s ease-out forwards',
          }}
        />
      )}
    </div>
  );
}
