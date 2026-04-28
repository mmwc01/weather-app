import { useEffect, useRef, type RefObject } from 'react';
import { VW, VH } from '../utils/sceneConstants';

export function useLightning(
  type: string,
  lightRef: RefObject<SVGPathElement | null>,
  cloudBaseRef: RefObject<number>,
  onLightning: (() => void) | undefined,
) {
  const onLightRef = useRef(onLightning);
  useEffect(() => { onLightRef.current = onLightning; }, [onLightning]);

  const typeRef = useRef(type);
  useEffect(() => { typeRef.current = type; }, [type]);

  useEffect(() => {
    if (type !== 'thunder') {
      if (lightRef.current) lightRef.current.setAttribute('d', '');
      return;
    }

    let tid: ReturnType<typeof setTimeout> | null = null;

    function strike() {
      const el = lightRef.current;
      if (!el) return;
      const px = 60 + Math.random() * (VW - 120);
      const boltStartY = cloudBaseRef.current + 87;
      const pts = [`${px},${boltStartY}`];
      for (let i = 0; i < 15; i++)
        pts.push(`${px + (Math.random() * 24 - 12)},${boltStartY + (VH - boltStartY) / 15 * (i + 1)}`);
      el.setAttribute('d', `M${pts.join(' ')}`);
      el.style.opacity = '0.9';
      let op = 0.9;
      const fade = setInterval(() => {
        op -= 0.07;
        if (el) el.style.opacity = String(Math.max(0, op));
        if (op <= 0) { clearInterval(fade); el?.setAttribute('d', ''); }
      }, 20);
      onLightRef.current?.();
    }

    function schedule() {
      tid = setTimeout(() => {
        if (typeRef.current === 'thunder') { strike(); schedule(); }
      }, 1500 + Math.random() * 5000);
    }
    schedule();

    return () => { if (tid) clearTimeout(tid); };
  }, [type, lightRef, cloudBaseRef]);
}
