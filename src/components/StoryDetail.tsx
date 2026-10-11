import type { Story } from '../types';
import { StoryArt } from './StoryArt';
import { EpisodeListRow } from './EpisodeListRow';
import { formatDurationLong } from '../lib/format';
import { getProgress } from '../lib/storage';
import { IconPlay } from './Icons';
import { usePlayer } from '../audio/player';

interface Props {
  story: Story;
  onBack: () => void;
}

export function StoryDetail({ story, onBack }: Props) {
  const { playEpisode } = usePlayer();

  const handlePlayAll = () => {
    if (story.episodes.length > 0) {
      // Tìm tập đầu tiên chưa nghe xong để phát tiếp
      const nextEp =
        story.episodes.find((ep) => {
          const p = getProgress(ep.id);
          return !p || p.t < (ep.duration || 0) - 20;
        }) ?? story.episodes[0];
      playEpisode(nextEp, story.episodes);
    }
  };

  return (
    <div className="animate-fade-up px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="mb-6 flex min-h-[44px] items-center rounded-full bg-ink-800 px-5 text-[14px] font-medium text-zinc-300 transition-colors active:bg-ink-700 active:text-zinc-100"
      >
        ← Thư viện
      </button>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <StoryArt storyId={story.id} className="h-40 w-40 sm:h-52 sm:w-52" rounded="rounded-2xl" />
        <div className="min-w-0 pb-1">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">Bộ truyện</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-zinc-50 sm:text-4xl">
            {story.title}
          </h1>
          <p className="mt-2 text-[14px] text-zinc-400">
            {story.episodes.length} tập · {formatDurationLong(story.totalDuration)}
          </p>
          <button
            onClick={handlePlayAll}
            className="mt-4 flex min-h-[48px] items-center gap-2 rounded-full bg-brand-500 px-7 text-[15px] font-bold text-ink-950 transition-all active:scale-[0.98]"
          >
            <IconPlay className="h-5 w-5" />
            Phát
          </button>
        </div>
      </div>

      <h2 className="mt-8 text-[17px] font-bold text-zinc-100">Danh sách tập</h2>
      <div className="mt-2 flex flex-col gap-0.5">
        {story.episodes.map((ep, i) => (
          <EpisodeListRow key={ep.id} episode={ep} index={i} numbered />
        ))}
      </div>
    </div>
  );
}
