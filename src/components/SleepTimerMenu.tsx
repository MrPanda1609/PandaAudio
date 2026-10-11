import { useEffect, useState } from 'react';
import { usePlayer } from '../audio/player';
import type { SleepMode } from '../audio/player';
import { IconTimer, IconCheck, IconClose } from './Icons';
import { formatRemaining } from '../lib/format';

const OPTIONS: { label: string; mode: SleepMode }[] = [
  { label: 'Tắt hẹn giờ', mode: { kind: 'off' } },
  { label: 'Sau 15 phút', mode: { kind: 'minutes', minutes: 15, endsAt: 0 } },
  { label: 'Sau 30 phút', mode: { kind: 'minutes', minutes: 30, endsAt: 0 } },
  { label: 'Sau 45 phút', mode: { kind: 'minutes', minutes: 45, endsAt: 0 } },
  { label: 'Sau 60 phút', mode: { kind: 'minutes', minutes: 60, endsAt: 0 } },
  { label: 'Hết tập này', mode: { kind: 'end' } },
];

function sameKind(a: SleepMode, b: SleepMode): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'minutes' && b.kind === 'minutes') return a.minutes === b.minutes;
  return true;
}

export function SleepTimerMenu() {
  const { sleep, setSleep } = usePlayer();
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);

  // Đếm ngược hiển thị thời gian còn lại
  useEffect(() => {
    if (!open || sleep.kind !== 'minutes') return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open, sleep]);

  const choose = (mode: SleepMode) => {
    if (mode.kind === 'minutes') {
      setSleep({ kind: 'minutes', minutes: mode.minutes, endsAt: Date.now() + mode.minutes * 60_000 });
    } else {
      setSleep(mode);
    }
    setOpen(false);
  };

  const active = sleep.kind !== 'off';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Hẹn giờ tắt"
        title="Hẹn giờ tắt"
        style={{ minHeight: 48 }}
        className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${
          active ? 'text-brand-400' : 'text-zinc-400 hover:text-zinc-100'
        }`}
      >
        <span className="relative">
          <IconTimer className="h-6 w-6" />
          {active && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-400" />}
        </span>
        <span className="text-[11px] font-medium">
          {sleep.kind === 'minutes'
            ? formatRemaining(sleep.endsAt - Date.now())
            : sleep.kind === 'end'
              ? 'Hết tập'
              : 'Hẹn giờ'}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-1/2 z-50 mb-3 w-56 -translate-x-1/2 animate-pop overflow-hidden rounded-2xl border border-ink-700 bg-ink-800 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[14px] font-bold text-zinc-100">Hẹn giờ tắt</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-400 hover:bg-ink-700 hover:text-zinc-100"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <ul className="pb-2">
              {OPTIONS.map((opt) => {
                const isActive = sameKind(sleep, opt.mode);
                return (
                  <li key={opt.label}>
                    <button
                      onClick={() => choose(opt.mode)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors ${
                        isActive ? 'text-brand-300' : 'text-zinc-300 hover:bg-ink-700 hover:text-zinc-50'
                      }`}
                    >
                      {opt.label}
                      {isActive && <IconCheck className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="px-4 pb-3 text-[12px] leading-relaxed text-zinc-500">
              Hết giờ app sẽ tự dừng phát — hợp khi nghe trước lúc ngủ.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
