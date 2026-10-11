import type { Episode } from '../types';
import { usePlayer } from '../audio/player';
import { StoryArt } from './StoryArt';
import { formatTime } from '../lib/format';
import { getProgress } from '../lib/storage';
import { IconPlay, IconPause } from './Icons';

interface Props {
  episode: Episode;
  /** Hiện số thứ tự thay vì artwork */
  numbered?: boolean;
  index?: number;
  /** Hiện tên truyện dưới tiêu đề tập */
  showStory?: boolean;
}

/** Một dòng tập trong danh sách — dùng chung cho StoryDetail và CategoryView. */
export function EpisodeListRow({ episode, numbered = false, index = 0, showStory = false }: Props) {
  const { current, playing, toggle, playEpisode } = usePlayer();
  const isCurrent = current?.id === episode.id;
  const p = getProgress(episode.id);
  const pct = p && episode.duration > 0 ? Math.min(100, (p.t / episode.duration) * 100) : 0;
  const finished = p != null && episode.duration > 0 && p.t >= episode.duration - 20;

  const handleClick = () => {
    if (isCurrent) toggle();
    else playEpisode(episode);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors active:bg-ink-850 sm:gap-3 sm:px-3 ${
        isCurrent ? 'bg-ink-800' : 'sm:hover:bg-ink-850'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
          isCurrent
            ? 'bg-brand-500 text-ink-950'
            : 'bg-ink-700 text-zinc-300 active:bg-brand-500 active:text-ink-950'
        }`}
      >
        {isCurrent && playing ? (
          <IconPause className="h-4 w-4" />
        ) : (
          <IconPlay className="h-4 w-4 translate-x-[1px]" />
        )}
      </span>

      {numbered ? (
        <span className="w-6 shrink-0 text-center text-[13px] tabular-nums text-zinc-500">
          {index + 1}
        </span>
      ) : (
        <StoryArt storyId={episode.storyId} category={episode.category} className="hidden h-11 w-11 sm:flex" rounded="rounded-lg" minimal />
      )}

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-medium ${
            isCurrent ? 'text-brand-300' : finished ? 'text-zinc-400' : 'text-zinc-100'
          }`}
        >
          {episode.title}
          {isCurrent && playing && (
            <span className="ml-2 text-[11px] font-normal text-zinc-400">Đang phát</span>
          )}
        </span>
        {showStory && (
          <span className="block truncate text-[12px] text-zinc-500">{episode.storyTitle}</span>
        )}
        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink-700">
          <span
            className={`block h-full rounded-full ${finished ? 'bg-zinc-500' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }}
          />
        </span>
      </span>

      <span className="shrink-0 text-[13px] tabular-nums text-zinc-400">
        {formatTime(episode.duration)}
      </span>
    </button>
  );
}
