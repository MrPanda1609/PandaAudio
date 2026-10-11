import { useEffect, useRef } from 'react';
import { sharedAnalyser } from '../audio/analyser';

interface Props {
  /** Sóng có đang chạy theo nhạc không */
  active: boolean;
  bars?: number;
  className?: string;
}

/**
 * Sóng âm vẽ bằng canvas từ Web Audio Analyser.
 * - Chỉ vẽ ~15fps để nhẹ pin.
 * - Khi pause: đứng yên ở mức thấp (analyser đã suspend).
 */
export function Waveform({ active, bars = 56, className = 'h-16 w-full' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let lastDraw = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - lastDraw < 66) return;
      lastDraw = now;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const levels = sharedAnalyser.getLevels(bars);
      const gap = 3;
      const bw = Math.max(2, (w - gap * (bars - 1)) / bars);
      for (let i = 0; i < bars; i++) {
        const v = activeRef.current ? Math.max(0.07, levels[i]) : 0.07;
        const bh = Math.max(3, v * h);
        const x = i * (bw + gap);
        const y = (h - bh) / 2;
        const grad = ctx.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, '#34e07c');
        grad.addColorStop(1, '#0f7a3d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        const r = Math.min(bw / 2, 4);
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, bw, bh, r);
        } else {
          ctx.rect(x, y, bw, bh);
        }
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [bars]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
