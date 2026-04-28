import { useEffect, useRef, RefObject, memo } from 'react';
import {
  VW, VH, CLOUD_LERP, BODY_LERP, WIND_BASE,
  CLOUD_PATHS, CLOUD_FILLS, CLOUD_FILLS_THUNDER, CLOUD_FILLS_NIGHT,
  CARD_BG, CARD_BG_NIGHT,
  resolveType,
  type SceneAnimState,
} from '../utils/sceneConstants';
import {
  drawStars, drawRain, drawSplashes, drawSnow, drawWindLeaves,
  type FrameMetrics,
} from '../utils/sceneDrawing';
import { useLightning } from '../hooks/useLightning';

export { CARD_BG, CARD_BG_NIGHT };

interface Props {
  condition: string;
  windSpeed?: number;
  isNight?: boolean;
  onLightning?: () => void;
  contentRef?: RefObject<HTMLDivElement | null>;
}

function WeatherScene({ condition, windSpeed = 0, isNight = false, onLightning, contentRef }: Props) {
  const type = resolveType(condition);

  const cloudRefs = useRef<(SVGGElement | null)[]>([null, null, null]);
  const sunRef = useRef<SVGCircleElement>(null);
  const moonRef = useRef<SVGGElement>(null);
  const lightRef = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outerRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgHeightRef = useRef<number>(0);
  const cloudBaseRef = useRef<number>(0);

  useEffect(() => {
    const content = contentRef?.current;
    const svgEl = svgRef.current;
    if (!content || !svgEl) return;
    const update = () => {
      svgHeightRef.current = content.offsetHeight;
      svgEl.style.height = `${content.offsetHeight}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(content);
    return () => ro.disconnect();
  }, [contentRef]);

  const state = useRef<SceneAnimState>({
    type: 'cloud',
    cloudOff: [0, VW * 0.33, VW * 0.66],
    cloudSlide: 0,
    cloudsHidden: false,
    sunY: -100,
    sunTargetY: -100,
    moonY: -300,
    moonTargetY: -300,
    isNight: false,
    starTime: 0,
    starFadeIn: 0,
    windSpeed: 0,
    cloudBase: 0,
    rain: [],
    innerSnow: [],
    fadingSnow: [],
    splashes: [],
    windLeavesIn: [],
    windLeavesOut: [],
  });

  useEffect(() => {
    state.current.windSpeed = windSpeed;
    if (windSpeed <= 7) { state.current.windLeavesIn = []; state.current.windLeavesOut = []; }
  }, [windSpeed]);

  useEffect(() => {
    const s = state.current;
    s.isNight = isNight;
    s.sunTargetY = (s.type === 'sun' && !isNight) ? VH * 0.42 : -100;
    s.moonTargetY = (s.type === 'sun' && isNight) ? VH * 0.42 : -300;
    if (!isNight) s.starFadeIn = 0;
  }, [isNight]);

  useEffect(() => {
    const s = state.current;
    s.type = type;
    s.cloudsHidden = type === 'sun';
    s.sunTargetY = (type === 'sun' && !s.isNight) ? VH * 0.42 : -100;
    s.moonTargetY = (type === 'sun' && s.isNight) ? VH * 0.42 : -300;
    s.rain = []; s.innerSnow = []; s.fadingSnow = []; s.splashes = [];
  }, [type]);

  useLightning(type, lightRef, cloudBaseRef, onLightning);

  useEffect(() => {
    const canvas = canvasRef.current;
    const outer = outerRef.current;
    if (!canvas || !outer) return;
    const ctx = canvas.getContext('2d');
    const octx = outer.getContext('2d');
    if (!ctx || !octx) return;

    let rafId: number;

    const loop = () => {
      const s = state.current;
      const dpr = window.devicePixelRatio || 1;

      const cardW = canvas.offsetWidth;
      const cardH = canvas.offsetHeight;
      const svgH  = svgHeightRef.current || cardH;

      const cw = Math.round(cardW * dpr), ch = Math.round(cardH * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.clearRect(0, 0, cw, ch);

      const ovw = Math.round(window.innerWidth * dpr), ovh = Math.round(window.innerHeight * dpr);
      if (outer.width !== ovw || outer.height !== ovh) { outer.width = ovw; outer.height = ovh; }
      octx.clearRect(0, 0, ovw, ovh);

      const sliceS = Math.max(cardW / VW, svgH / VH);
      const sOX = (cardW - VW * sliceS) / 2;
      const sOY = (svgH - VH * sliceS) / 2;
      const csS = sliceS * dpr;
      const csOX = sOX * dpr;
      const csOY = sOY * dpr;
      const FLOOR = (cardH - sOY - 6) / sliceS;
      const visXMin = sOX < 0 ? -sOX / sliceS : 0;
      const visXMax = sOX < 0 ? (cardW - sOX) / sliceS : VW;

      const fm: FrameMetrics = {
        dpr, cardW, cardH, sliceS, csS, sOX, sOY, FLOOR, visXMin, visXMax,
        mobileFactor: Math.min(1, cardW / 380),
        cX: (x) => x * csS + csOX,
        cY: (y) => y * csS + csOY,
      };

      const maxBase = sOY < 0 ? -sOY / sliceS : 0;
      const wantBase = Math.max(0, (0.22 * svgH - sOY) / sliceS - 87);
      const cloudBase = Math.min(maxBase, wantBase);
      s.cloudBase = cloudBase;
      cloudBaseRef.current = cloudBase;
      const slideTarget = s.cloudsHidden ? -VH : 0;
      s.cloudSlide += (slideTarget - s.cloudSlide) * CLOUD_LERP;
      const cloudY = cloudBase + s.cloudSlide;
      const wind = WIND_BASE + Math.max(0, s.windSpeed - 7) * 0.2;
      for (let i = 0; i < 3; i++) {
        s.cloudOff[i] += wind / (i + 1);
        if (s.cloudOff[i] > VW) s.cloudOff[i] -= VW;
        cloudRefs.current[i]?.setAttribute('transform', `translate(${s.cloudOff[i]},${cloudY})`);
      }

      s.sunY += (s.sunTargetY - s.sunY) * BODY_LERP;
      sunRef.current?.setAttribute('cy', String(s.sunY));
      s.moonY += (s.moonTargetY - s.moonY) * BODY_LERP;
      moonRef.current?.setAttribute('transform', `translate(${VW / 2}, ${s.moonY})`);

      drawStars(ctx, s, fm);

      if (s.type === 'rain' || s.type === 'thunder' || s.type === 'drizzle') {
        drawRain(ctx, s, fm);
        drawSplashes(ctx, s, dpr);
      } else {
        s.rain = []; s.splashes = [];
      }

      if (s.type === 'snow') {
        drawSnow(ctx, octx, s, fm, canvas);
      } else {
        s.innerSnow = []; s.fadingSnow = [];
      }

      if (s.windSpeed > 7) {
        drawWindLeaves(ctx, octx, s, fm, canvas);
      } else {
        s.windLeavesIn = []; s.windLeavesOut = [];
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const fills = isNight ? CLOUD_FILLS_NIGHT : type === 'thunder' ? CLOUD_FILLS_THUNDER : CLOUD_FILLS;

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ pointerEvents: 'none', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute top-0 left-0 w-full"
          style={{ display: 'block' }}
        >
          <defs>
            <mask id="wxMoonMask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="600" height="600">
              <rect x="-200" y="-200" width="600" height="600" fill="white" />
              <circle cx="45" cy="-15" r="65" fill="black" />
            </mask>
          </defs>

          <circle ref={sunRef} cx={VW / 2} cy={-100} r={70} fill="#F7ED47" opacity={0.95} />

          <g ref={moonRef} transform={`translate(${VW / 2}, -300)`}>
            <circle cx={0} cy={0} r={92} fill="rgba(255,220,80,0.10)" />
            <circle cx={0} cy={0} r={70} fill="#F7ED47" opacity={0.95} mask="url(#wxMoonMask)" />
          </g>

          <g ref={(el) => { cloudRefs.current[2] = el; }}><path d={CLOUD_PATHS[2]} fill={fills[2]} /></g>
          <g ref={(el) => { cloudRefs.current[1] = el; }}><path d={CLOUD_PATHS[1]} fill={fills[1]} /></g>
          <g ref={(el) => { cloudRefs.current[0] = el; }}><path d={CLOUD_PATHS[0]} fill={fills[0]} /></g>

          <path
            ref={lightRef} d="" fill="none" stroke="white" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }}
          />
        </svg>

        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />
      </div>

      <canvas ref={outerRef} aria-hidden="true" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        display: 'block', pointerEvents: 'none', zIndex: -1,
      }} />
    </>
  );
}

export default memo(WeatherScene);
