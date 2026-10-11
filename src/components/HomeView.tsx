import type { Episode, Story } from '../types';
import type { ContinueItem, CategoryInfo } from '../data/library';
import { StoryCard } from './StoryCard';
import { StoryArt } from './StoryArt';
import { formatTime } from '../lib/format';
import { getProgress } from '../lib/storage';
import { IconPlay, IconChevronRight, IconSparkle } from './Icons';
import { usePlayer } from '../audio/player';

interface Props {
  stories: Story[];
  continueList: ContinueItem[];
  todayPicks: Episode[];
  categories: CategoryInfo[];
  onSelectStory: (storyId: string) => void;
  onSelectCategory: (name: string) => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Khuya rồi, nghe truyện rồi ngủ nhé';
  if (h < 11) return 'Chào buổi sáng';
  if (h < 13) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[19px] font-bold tracking-tight text-zinc-50">{title}</h2>
      {sub && <p className="mt-0.5 text-[13px] text-zinc-500">{sub}</p>}
    </div>
  );
}

/** Thẻ gợi ý ngang — vuốt bằng ngón tay cái, snap từng thẻ. */
function PickCard({ episode }: { episode: Episode }) {
  const { playEpisode, current, playing } = usePlayer();
  const isCurrent = current?.id === episode.id && playing;
  const p = getProgress(episode.id);
  const pct = p && episode.duration > 0 ? Math.min(100, (p.t / episode.duration) * 100) : 0;

  return (
    <button
      onClick={() => playEpisode(episode)}
      className="w-40 shrink-0 snap-start rounded-2xl border border-cardborder bg-ink-850 p-3 text-left transition-colors active:bg-ink-800"
    >
      <div className="relative">
        <StoryArt storyId={episode.storyId} category={episode.category} className="aspect-square w-full" rounded="rounded-xl" />
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-100">
          {formatTime(episode.duration)}
        </span>
        {isCurrent && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-ink-950">
            Đang phát
          </span>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 min-h-[2.5em] text-[13.5px] font-semibold leading-snug text-zinc-100">
        {episode.storyTitle}
      </p>
      <p className="mt-1 truncate text-[12px] text-zinc-500">{episode.category ?? 'Truyện audio'}</p>
      {pct > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  );
}

/** Thẻ chủ đề — đen thống nhất, bấm để duyệt. */
function CategoryCard({ cat, onOpen }: { cat: CategoryInfo; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex min-h-[92px] items-center justify-between gap-2 overflow-hidden rounded-2xl border border-cardborder bg-ink-850 p-4 text-left transition-transform active:scale-[0.98]"
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-bold text-zinc-100">{cat.name}</span>
        <span className="mt-1 block text-[12px] text-zinc-500">
          {cat.episodes.length} tập · {cat.stories.length} truyện
        </span>
      </span>
      <IconChevronRight className="h-5 w-5 shrink-0 text-brand-400" />
    </button>
  );
}

export function HomeView({
  stories,
  continueList,
  todayPicks,
  categories,
  onSelectStory,
  onSelectCategory,
}: Props) {
  const { playEpisode, current, playing } = usePlayer();

  return (
    <div className="animate-fade-up pb-8 pt-6">
      <h1 className="px-4 text-[22px] font-bold tracking-tight text-zinc-50 sm:px-6 sm:text-2xl lg:px-8">
        {greeting()}
      </h1>

      {/* Nghe gì hôm nay? — gợi ý đổi mỗi ngày */}
      {todayPicks.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2 px-4 sm:px-6 lg:px-8">
            <IconSparkle className="h-5 w-5 text-brand-400" />
            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-zinc-50">Nghe gì hôm nay?</h2>
              <p className="mt-0.5 text-[13px] text-zinc-500">Gợi ý mới mỗi ngày, đúng gu của bạn</p>
            </div>
          </div>
          <div className="-mx-0 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:px-6 lg:px-8">
            {todayPicks.map((ep) => (
              <PickCard key={ep.id} episode={ep} />
            ))}
          </div>
        </section>
      )}

      {/* Nghe tiếp */}
      {continueList.length > 0 && (
        <section className="mt-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Nghe tiếp" sub="Tiếp tục đúng chỗ bạn đang nghe dở" />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {continueList.map(({ episode, t }) => {
              const isCurrent = current?.id === episode.id && playing;
              const pct = episode.duration > 0 ? Math.min(100, (t / episode.duration) * 100) : 0;
              return (
                <button
                  key={episode.id}
                  onClick={() => playEpisode(episode)}
                  className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-cardborder bg-ink-850 p-3 text-left transition-colors active:bg-ink-800"
                >
                  <StoryArt storyId={episode.storyId} category={episode.category} className="h-14 w-14" minimal />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-zinc-100">
                      {episode.title}
                    </p>
                    <p className="truncate text-[12.5px] text-zinc-400">{episode.storyTitle}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-700">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11.5px] text-zinc-500">
                      Còn {formatTime(episode.duration - t)}
                      {isCurrent ? ' · Đang phát' : ''}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-700 text-zinc-200 active:bg-brand-500 active:text-ink-950">
                    <IconPlay className="h-4 w-4 translate-x-[1px]" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Chủ đề */}
      {categories.length > 0 && (
        <section className="mt-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Khám phá theo chủ đề" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} onOpen={() => onSelectCategory(cat.name)} />
            ))}
          </div>
        </section>
      )}

      {/* Tất cả truyện */}
      <section className="mt-8 px-4 sm:px-6 lg:px-8">
        <SectionTitle title="Tất cả truyện" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5">
          {stories.map((s, i) => (
            <div
              key={s.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <StoryCard story={s} onOpen={onSelectStory} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
