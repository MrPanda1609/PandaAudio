import { useState } from 'react';
import { usePlayer } from '../audio/player';
import { StoryArt } from './StoryArt';
import { SeekBar } from './SeekBar';
import { Waveform } from './Waveform';
import { SleepTimerMenu } from './SleepTimerMenu';
import { SpeedControl } from './SpeedControl';
import { QueuePanel } from './QueuePanel';
import {
  IconPlay,
  IconPause,
  IconNext,
  IconPrev,
  IconBack10,
  IconFwd30,
  IconChevronDown,
  IconQueue,
} from './Icons';
import { formatTime } from '../lib/format';

interface Props {
  onClose: () => void;
}

/** Trình phát full-screen kiểu Spotify: artwork lớn, sóng âm, điều khiển đầy đủ. */
export function FullPlayer({ onClose }: Props) {
  const { current, playing, loading, toggle, next, prev, seekBy, seekTo, time, duration } =
    usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex animate-slide-up flex-col overflow-hidden bg-ink-950"
      role="dialog"
      aria-label="Trình phát nhạc"
    >
      <div className="ambient-glow pointer-events-none absolute inset-0" />

      <header className="relative flex items-center justify-between px-3 py-3">
        <button
          onClick={onClose}
          aria-label="Thu nhỏ trình phát"
          className="rounded-full p-2.5 text-zinc-300 transition-colors hover:bg-ink-800 hover:text-zinc-50"
        >
          <IconChevronDown className="h-6 w-6" />
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Đang phát</p>
        <button
          onClick={() => setShowQueue((v) => !v)}
          aria-label="Hàng đợi phát"
          className={`rounded-full p-2.5 transition-colors ${
            showQueue ? 'text-brand-400' : 'text-zinc-300 hover:bg-ink-800 hover:text-zinc-50'
          }`}
        >
          <IconQueue className="h-6 w-6" />
        </button>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 pb-6 sm:gap-5">
        <StoryArt
          storyId={current.storyId}
          className="h-56 w-56 shadow-2xl shadow-black/60 sm:h-64 sm:w-64"
          rounded="rounded-3xl"
        />

        <Waveform active={playing} className="h-12 w-full max-w-md sm:h-14" />

        <div className="w-full max-w-md text-center">
          <h2 className="truncate text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">
            {current.storyTitle}
          </h2>
          {current.title !== current.storyTitle && (
            <p className="mt-1 truncate text-[15px] text-zinc-400">{current.title}</p>
          )}
        </div>

        <div className="w-full max-w-md">
          <SeekBar value={time} max={duration} onSeek={seekTo} />
          <div className="mt-0.5 flex justify-between text-[12px] tabular-nums text-zinc-500">
            <span>{formatTime(time)}</span>
            <span>−{formatTime(Math.max(0, duration - time))}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:gap-7">
          <button
            onClick={prev}
            aria-label="Tập trước / về đầu tập"
            className="rounded-full p-2 text-zinc-300 transition-colors hover:text-zinc-50"
          >
            <IconPrev className="h-7 w-7" />
          </button>
          <button
            onClick={() => seekBy(-10)}
            aria-label="Tua lại 10 giây"
            className="rounded-full p-2 text-zinc-300 transition-colors hover:text-zinc-50"
          >
            <IconBack10 className="h-9 w-9" />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-ink-950 shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-ink-950/25 border-t-ink-950" />
            ) : playing ? (
              <IconPause className="h-8 w-8" />
            ) : (
              <IconPlay className="h-8 w-8 translate-x-[2px]" />
            )}
          </button>
          <button
            onClick={() => seekBy(30)}
            aria-label="Tua tới 30 giây"
            className="rounded-full p-2 text-zinc-300 transition-colors hover:text-zinc-50"
          >
            <IconFwd30 className="h-9 w-9" />
          </button>
          <button
            onClick={next}
            aria-label="Tập tiếp theo"
            className="rounded-full p-2 text-zinc-300 transition-colors hover:text-zinc-50"
          >
            <IconNext className="h-7 w-7" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <SpeedControl />
          <SleepTimerMenu />
        </div>
      </div>

      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}
    </div>
  );
}
