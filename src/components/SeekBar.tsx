import type { CSSProperties } from 'react';

interface Props {
  value: number;
  max: number;
  onSeek: (t: number) => void;
  className?: string;
  label?: string;
}

export function SeekBar({ value, max, onSeek, className = '', label = 'Tua' }: Props) {
  const safeMax = Math.max(1, max || 0);
  const pct = Math.min(100, Math.max(0, ((value || 0) / safeMax) * 100));
  return (
    <input
      type="range"
      className={`seek w-full ${className}`}
      min={0}
      max={safeMax}
      step={0.5}
      value={Math.min(value || 0, safeMax)}
      style={{ '--fill': `${pct}%` } as CSSProperties}
      onChange={(e) => onSeek(parseFloat(e.target.value))}
      aria-label={label}
    />
  );
}
