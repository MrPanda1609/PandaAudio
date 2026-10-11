import type { Story } from '../types';
import { IconHome, IconLibrary, IconClose } from './Icons';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  stories: Story[];
  activeView: 'home' | string; // 'home' hoặc storyId
  onHome: () => void;
  onSelectStory: (storyId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function NavContent({ stories, activeView, onHome, onSelectStory, theme, onToggleTheme }: Omit<Props, 'mobileOpen' | 'onCloseMobile'>) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <button onClick={onHome} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800">
            <span role="img" aria-label="PandaAudio" className="text-[24px] leading-none">🐼</span>
          </span>
          <span className="truncate text-lg font-bold tracking-tight text-zinc-50">
            Panda<span className="text-brand-400">Audio</span>
          </span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="h-10 w-10 shrink-0" />
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        <button
          onClick={onHome}
          className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
            activeView === 'home'
              ? 'bg-ink-800 text-zinc-50'
              : 'text-zinc-400 hover:bg-ink-850 hover:text-zinc-200'
          }`}
        >
          <IconHome className="h-5 w-5" />
          Trang chủ
        </button>
      </nav>

      <div className="mt-6 flex items-center gap-2 px-3 text-[13px] font-semibold uppercase tracking-wider text-zinc-500">
        <IconLibrary className="h-4 w-4" />
        Thư viện
        <span className="ml-auto rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-zinc-400">
          {stories.length}
        </span>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto pr-1">
        {stories.length === 0 ? (
          <p className="px-3 py-4 text-[13px] leading-relaxed text-zinc-500">
            Chưa có truyện nào trong thư viện.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {stories.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onSelectStory(s.id)}
                  className={`w-full truncate rounded-lg px-3 py-3 text-left text-[14px] transition-colors ${
                    activeView === s.id
                      ? 'bg-ink-800 font-medium text-zinc-50'
                      : 'text-zinc-400 hover:bg-ink-850 hover:text-zinc-200'
                  }`}
                  title={s.title}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="px-3 pb-2 pt-4 text-[12px] leading-relaxed text-zinc-600">
        Tắt màn hình vẫn phát.
        <br />
        Điều khiển từ màn hình khóa.
      </p>
    </div>
  );
}

export function Sidebar(props: Props) {
  const { mobileOpen, onCloseMobile } = props;
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-800 bg-ink-900/60 p-4 lg:block xl:w-72">
        <NavContent {...props} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-fade-up bg-ink-900 p-4 shadow-2xl">
            <button
              onClick={onCloseMobile}
              aria-label="Đóng menu"
              className="absolute right-3 top-3 rounded-full p-2 text-zinc-400 hover:bg-ink-800 hover:text-zinc-100"
            >
              <IconClose className="h-5 w-5" />
            </button>
            <NavContent {...props} />
          </aside>
        </div>
      )}
    </>
  );
}
