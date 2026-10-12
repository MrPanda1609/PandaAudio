import { useState } from 'react';
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

/** Đường dẫn thumbnail AI của truyện (nếu đã được tạo). */
export function storyArtwork(storyId: string): string {
  return `/art/${storyId}.webp`;
}

/** Motif sóng âm trừu tượng — dùng cho artwork và empty state. */
export function ArtMark({ className = 'w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} style={{ color: 'var(--art-bars)' }} fill="currentColor" aria-hidden>
      {BARS.map((h, i) => (
        <rect key={i} x={i * 7} y={32 - h * 32} width={4.5} height={h * 32} rx={2.25} />
      ))}
    </svg>
  );
}

/**
 * Artwork theo theme: nếu có thumbnail AI thì dùng ảnh thật,
 * chưa có thì fallback về nền gradient + motif sóng âm.
 */
export function StoryArt({ storyId, category, className = 'h-12 w-12', rounded = 'rounded-xl', minimal = false }: Props) {
  const hue = categoryHue(category ?? storyId);
  const [imgOk, setImgOk] = useState(true);
  const [imgGone, setImgGone] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${className} ${imgOk && !imgLoaded ? 'shimmer' : ''}`}
      style={{ background: 'linear-gradient(150deg, var(--art-from) 0%, var(--art-mid) 55%, var(--art-to) 100%)' }}
      aria-hidden
    >
      {/* ánh tông theo chủ đề — rất nhẹ */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(90% 70% at 50% 0%, hsl(${hue} 45% 55% / 0.10), transparent 70%)` }}
      />
      {!minimal && imgGone && <ArtMark className="relative w-[36%]" />}
      {/* thumbnail AI — lỗi thì ẩn đi, dùng motif sóng */}
      {imgOk && (
        <img
          src={storyArtwork(storyId)}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onLoad={() => { setImgLoaded(true); setImgGone(false); }}
          onError={() => { setImgOk(false); setImgGone(true); }}
        />
      )}
      {/* vignette cho chiều sâu */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 120% at 50% 50%, transparent 60%, var(--art-vignette) 100%)' }}
      />
    </div>
  );
}
