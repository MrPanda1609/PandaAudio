import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlayer } from './audio/player';
import { groupStories, getContinueList, getCategories, getTodayPicks, getRecentStories } from './data/library';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { StoryDetail } from './components/StoryDetail';
import { CategoryView } from './components/CategoryView';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { EmptyState } from './components/EmptyState';
import { IconLibrary } from './components/Icons';
import { DonateModal } from './components/DonateModal';
import { LoadingScreen } from './components/LoadingScreen';
import { ThemeToggle } from './components/ThemeToggle';

type View = { type: 'home' } | { type: 'story'; id: string } | { type: 'category'; name: string };

export default function App() {
  const { episodes, libraryLoaded, current, fullOpen, setFullOpen } = usePlayer();
  const [view, setView] = useState<View>({ type: 'home' });
  const [mobileNav, setMobileNav] = useState(false);
  // Theme trắng hồng là mặc định mỗi khi mở web; nhớ lựa chọn của user
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('panda-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  // Màn hình loading: hiện lúc mở web, mờ dần khi tải xong thư viện
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFading, setLoaderFading] = useState(false);
  // Modal donate "ăn xin"
  const [donateOpen, setDonateOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('panda-theme', theme);
    } catch {
      /* bỏ qua */
    }
  }, [theme]);

  useEffect(() => {
    if (libraryLoaded) {
      // chờ tối thiểu 900ms cho hiệu ứng loading được thấy, rồi mờ dần
      const t1 = setTimeout(() => setLoaderFading(true), 900);
      const t2 = setTimeout(() => setLoaderVisible(false), 1400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [libraryLoaded]);

  const toggleTheme = () => {
    // bật hiệu ứng chuyển màu mượt trong lúc đổi theme
    document.documentElement.classList.add('theme-anim');
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
    setTimeout(() => document.documentElement.classList.remove('theme-anim'), 450);
  };

  const stories = useMemo(() => groupStories(episodes), [episodes]);
  const continueList = useMemo(
    () => (libraryLoaded ? getContinueList(episodes) : []),
    // Tính lại khi đổi view / đổi tập đang phát để "Nghe tiếp" luôn mới
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [episodes, libraryLoaded, current?.id, view],
  );
  const categories = useMemo(() => getCategories(episodes), [episodes]);
  const todayPicks = useMemo(
    () => (libraryLoaded ? getTodayPicks(episodes) : []),
    // Gợi ý đổi theo ngày — tính lại khi đổi view
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [episodes, libraryLoaded, view],
  );
  const recentStories = useMemo(
    () => (libraryLoaded ? getRecentStories(episodes) : []),
    [episodes, libraryLoaded],
  );
  const activeCategory =
    view.type === 'category' ? categories.find((c) => c.name === view.name) : undefined;

  const activeStory =
    view.type === 'story' ? stories.find((s) => s.id === view.id) : undefined;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [view]);

  const goHome = () => {
    setView({ type: 'home' });
    setMobileNav(false);
  };
  const openStory = (id: string) => {
    setView({ type: 'story', id });
    setMobileNav(false);
  };
  const openCategory = (name: string) => {
    setView({ type: 'category', name });
    setMobileNav(false);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-ink-950 text-zinc-100">
      <Sidebar
        stories={stories}
        activeView={view.type === 'story' ? view.id : 'home'}
        onHome={goHome}
        onSelectStory={openStory}
        onDonate={() => setDonateOpen(true)}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar mobile */}
        <header className="flex shrink-0 items-center gap-3 border-b border-ink-800 bg-ink-900/60 px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Mở thư viện"
            className="rounded-xl p-2 text-zinc-300 hover:bg-ink-800 hover:text-zinc-50"
          >
            <IconLibrary className="h-6 w-6" />
          </button>
          <button onClick={goHome} className="flex items-center gap-2">
            <span role="img" aria-label="PandaAudio" className="text-[24px] leading-none">🐼</span>
            <span className="text-[17px] font-bold tracking-tight">
              Panda<span className="text-brand-400">Audio</span>
            </span>
          </button>
          <div className="ml-auto">
            <ThemeToggle theme={theme} onToggle={toggleTheme} className="h-10 w-10" />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto pb-32">
          {stories.length === 0 && libraryLoaded ? (
            <EmptyState />
          ) : activeCategory ? (
            <CategoryView
              name={activeCategory.name}
              episodes={activeCategory.episodes}
              onBack={goHome}
              onSelectStory={openStory}
            />
          ) : activeStory ? (
            <StoryDetail story={activeStory} onBack={goHome} />
          ) : (
            <HomeView
              stories={stories}
              continueList={continueList}
              todayPicks={todayPicks}
              recentStories={recentStories}
              categories={categories}
              onSelectStory={openStory}
              onSelectCategory={openCategory}
            />
          )}
        </main>
      </div>

      <MiniPlayer onOpen={() => setFullOpen(true)} />
      {fullOpen && current && <FullPlayer onClose={() => setFullOpen(false)} />}

      {/* Màn hình loading toàn màn hình — mờ dần khi xong */}
      {loaderVisible && (
        <div className={loaderFading ? 'animate-loader-fadeout' : ''}>
          <LoadingScreen />
        </div>
      )}

      {/* Modal donate */}
      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
