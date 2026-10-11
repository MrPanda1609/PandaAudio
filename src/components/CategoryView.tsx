import { useMemo } from 'react';
import type { Episode } from '../types';
import { groupStories } from '../data/library';
import { EpisodeListRow } from './EpisodeListRow';
import { StoryCard } from './StoryCard';
import { formatDurationLong } from '../lib/format';
import { IconChevronRight } from './Icons';

interface Props {
  name: string;
  episodes: Episode[];
  onBack: () => void;
  onSelectStory: (storyId: string) => void;
}

/** Trang duyệt theo chủ đề: banner + lưới truyện + danh sách tất cả tập kèm thời lượng. */
export function CategoryView({ name, episodes, onBack, onSelectStory }: Props) {
  const stories = useMemo(() => groupStories(episodes), [episodes]);
  const totalDur = episodes.reduce((s, e) => s + (e.duration || 0), 0);

  return (
    <div className="animate-fade-up px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="mb-5 flex min-h-[44px] items-center gap-1 rounded-full bg-ink-800 px-4 text-[14px] font-medium text-zinc-300 transition-colors active:bg-ink-700 active:text-zinc-100"
      >
        <IconChevronRight className="h-4 w-4 rotate-180" />
        Chủ đề
      </button>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-ink-850 p-5 sm:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
          Chủ đề
        </p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-white sm:text-3xl">
          {name}
        </h1>
        <p className="mt-2 text-[13px] text-white/75">
          {episodes.length} tập · {stories.length} bộ truyện · {formatDurationLong(totalDur)}
        </p>
      </div>

      <h2 className="mt-8 text-[17px] font-bold text-zinc-100">Bộ truyện</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {stories.map((s) => (
          <StoryCard key={s.id} story={s} onOpen={onSelectStory} />
        ))}
      </div>

      <h2 className="mt-8 text-[17px] font-bold text-zinc-100">Tất cả tập</h2>
      <div className="mt-2 flex flex-col gap-0.5">
        {episodes.map((ep) => (
          <EpisodeListRow key={ep.id} episode={ep} showStory />
        ))}
      </div>
    </div>
  );
}
