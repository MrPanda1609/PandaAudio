import { storyHue } from '../data/library';
import { PandaLogo } from './Icons';

interface Props {
  storyId: string;
  className?: string;
  rounded?: string;
  /** Ẩn logo gấu khi artwork quá nhỏ */
  minimal?: boolean;
}

/**
 * Artwork cho mỗi truyện: gradient sinh từ storyId + logo gấu trúc.
 * Không cần ảnh ngoài — mỗi truyện có màu riêng, nhất quán mọi nơi.
 */
export function StoryArt({ storyId, className = 'h-12 w-12', rounded = 'rounded-xl', minimal = false }: Props) {
  const hue = storyHue(storyId);
  const hue2 = (hue + 50) % 360;
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 30%) 0%, hsl(${hue2} 60% 13%) 100%)`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(80% 60% at 20% 10%, hsl(${hue} 80% 55% / 0.5), transparent 70%)`,
        }}
      />
      {!minimal && (
        <PandaLogo className="relative h-1/2 w-1/2 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" />
      )}
    </div>
  );
}
