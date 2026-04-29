import { useState, useEffect, useRef } from 'react';

export function useFade(active: boolean, outMs = 1500): { mounted: boolean; visible: boolean } {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    timer.current = setTimeout(() => setMounted(false), outMs);
    return () => clearTimeout(timer.current);
  }, [active, outMs]);

  return { mounted, visible };
}
