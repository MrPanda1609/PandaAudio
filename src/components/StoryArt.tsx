import { categoryHue } from '../data/library';

interface Props {
  storyId: string;
  category?: string;
  className?: string;
  rounded?: string;
  minimal?: boolean;
}

/** Chiều cao tương đối của các cột sóng âm trang trí */
const BARS = [0.42, 0.75, 0.55, 1, 0.62, 0.88, 0.48];

/** Motif sóng âm trừu tượng — dùng cho artwork và empty state. */
export function ArtMark({ className = 'w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={`text-zinc-600 ${className}`} fill="currentColor" aria-hidden>
      {BARS.map((h, i) => (
        <rect key={i} x={i * 7} y={32 - h * 32} width={4.5} height={h * 32} rx={2.25} />
      ))}
    </svg>
  );
}

/**
 * Artwork "đen + 1 màu": nền đen thống nhất cho mọi truyện, chỉ pha một chút
 * tông theo chủ đề ở mức rất nhẹ + motif sóng âm trừu tượng.
 * Không còn mặt gấu nhìn chằm chằm trên card.
 */
export function StoryArt({ storyId, category, className = 'h-12 w-12', rounded = 'rounded-xl', minimal = false }: Props) {
  const hue = categoryHue(category ?? storyId);
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ background: 'linear-gradient(150deg, #26262f 0%, #141419 55%, #0b0b0f 100%)' }}
      aria-hidden
    >
      {/* ánh tông theo chủ đề — rất nhẹ, giữ tổng thể đen */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(90% 70% at 50% 0%, hsl(${hue} 45% 55% / 0.10), transparent 70%)` }}
      />
      {!minimal && <ArtMark className="relative w-[36%]" />}
      {/* vignette cho chiều sâu */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.45) 100%)' }}
      />
    </div>
  );
}
