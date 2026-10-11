import type { Story } from '../types';
import { StoryArt } from './StoryArt';
import { formatDurationLong } from '../lib/format';
import { IconPlay } from './Icons';
import { usePlayer } from '../audio/player';

interface Props {
  story: Story;
  onOpen: (storyId: string) => void;
}

export function StoryCard({ story, onOpen }: Props) {
  const { playEpisode, current } = usePlayer();
  const isCurrentStory = current?.storyId === story.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (story.episodes.length > 0) playEpisode(story.episodes[0], story.episodes);
  };

  return (
    <button
      onClick={() => onOpen(story.id)}
      className="group flex flex-col gap-3 rounded-2xl bg-ink-850 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-brand-400"
    >
      <div className="relative">
        <StoryArt storyId={story.id} category={story.episodes[0]?.category} className="aspect-square w-full" rounded="rounded-xl" />
        <span
          role="button"
          aria-label={`Phát ${story.title}`}
          onClick={handlePlay}
          className="absolute bottom-2 right-2 flex h-11 w-11 translate-y-1 items-center justify-center rounded-full bg-brand-500 text-ink-950 opacity-0 shadow-lg shadow-black/40 transition-all duration-200 hover:scale-105 hover:bg-brand-400 group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100"
        >
          <IconPlay className="h-5 w-5 translate-x-[1px]" />
        </span>
        {isCurrentStory && (
          <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-semibold text-brand-400 backdrop-blur">
            Đang nghe
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-zinc-100">{story.title}</p>
        <p className="mt-1 text-[13px] text-zinc-400">
          {story.episodes.length} tập · {formatDurationLong(story.totalDuration)}
        </p>
      </div>
    </button>
  );
}
