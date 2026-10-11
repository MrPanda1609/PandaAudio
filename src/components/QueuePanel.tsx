import { usePlayer } from '../audio/player';
import { StoryArt } from './StoryArt';
import { formatTime } from '../lib/format';
import { IconClose } from './Icons';

interface Props {
  onClose: () => void;
}

export function QueuePanel({ onClose }: Props) {
  const { current, upcoming, playAt, index } = usePlayer();

  return (
    <div className="absolute inset-x-0 bottom-0 top-16 z-10 flex flex-col rounded-t-3xl border-t border-ink-700 bg-ink-900 animate-slide-up">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-[16px] font-bold text-zinc-100">
          Phát tiếp theo
          <span className="ml-2 text-[13px] font-normal text-zinc-500">{upcoming.length} tập</span>
        </p>
        <button
          onClick={onClose}
          aria-label="Đóng hàng đợi"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-400 hover:bg-ink-800 hover:text-zinc-100"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {current && (
          <div className="mb-2 px-2">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Đang phát</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-ink-800 p-2.5">
              <StoryArt storyId={current.storyId} category={current.category} className="h-11 w-11" minimal />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-brand-300">{current.title}</p>
                <p className="truncate text-[12px] text-zinc-500">{current.storyTitle}</p>
              </div>
            </div>
          </div>
        )}

        {upcoming.length === 0 ? (
          <p className="px-2 py-8 text-center text-[14px] text-zinc-500">
            Hết danh sách — tập này là tập cuối.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {upcoming.map((ep, i) => (
              <li key={ep.id}>
                <button
                  onClick={() => playAt(index + 1 + i)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-ink-850"
                >
                  <StoryArt storyId={ep.storyId} category={ep.category} className="h-11 w-11" minimal />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-zinc-200">{ep.title}</p>
                    <p className="truncate text-[12px] text-zinc-500">{ep.storyTitle}</p>
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-zinc-500">
                    {formatTime(ep.duration)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
