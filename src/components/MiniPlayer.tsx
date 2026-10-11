import { usePlayer } from '../audio/player';
import { StoryArt } from './StoryArt';
import { IconPlay, IconPause, IconNext } from './Icons';

interface Props {
  onOpen: () => void;
}

/**
 * Thanh phát mini luôn hiện ở đáy màn hình — bấm để mở full player.
 * Mobile-first: nền đặc (không blur để cuộn mượt), nút ≥44px, thao tác bằng ngón cái.
 */
export function MiniPlayer({ onOpen }: Props) {
  const { current, playing, loading, toggle, next, time, duration } = usePlayer();
  if (!current) return null;

  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="pointer-events-auto mx-2 mb-2 animate-fade-up overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/50 sm:mx-4">
        <div className="h-[3px] w-full bg-ink-700">
          <div className="h-full bg-brand-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-1.5 p-2">
          <button
            onClick={onOpen}
            aria-label="Mở trình phát"
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center"
          >
            <StoryArt storyId={current.storyId} category={current.category} className="h-11 w-11" rounded="rounded-lg" minimal />
          </button>
          <button onClick={onOpen} className="min-w-0 flex-1 self-stretch py-1 text-left">
            <p className="truncate text-[14.5px] font-semibold text-zinc-100">{current.storyTitle}</p>
            {current.title !== current.storyTitle && (
              <p className="truncate text-[12.5px] text-zinc-400">{current.title}</p>
            )}
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-ink-950 transition-transform active:scale-95"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
            ) : playing ? (
              <IconPause className="h-5 w-5" />
            ) : (
              <IconPlay className="h-5 w-5 translate-x-[1px]" />
            )}
          </button>
          <button
            onClick={next}
            aria-label="Tập tiếp theo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors active:text-zinc-50"
          >
            <IconNext className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
