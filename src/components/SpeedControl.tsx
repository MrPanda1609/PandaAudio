import { useState } from 'react';
import { usePlayer } from '../audio/player';
import { IconSpeed, IconCheck, IconClose } from './Icons';

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function SpeedControl() {
  const { rate, setRate } = usePlayer();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Tốc độ phát"
        title="Tốc độ phát"
        style={{ minHeight: 48 }}
        className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${
          rate !== 1 ? 'text-brand-400' : 'text-zinc-400 hover:text-zinc-100'
        }`}
      >
        <IconSpeed className="h-6 w-6" />
        <span className="text-[11px] font-medium">{rate}×</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-1/2 z-50 mb-3 w-44 -translate-x-1/2 animate-pop overflow-hidden rounded-2xl border border-ink-700 bg-ink-800 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[14px] font-bold text-zinc-100">Tốc độ</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-400 hover:bg-ink-700 hover:text-zinc-100"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <ul className="pb-2">
              {RATES.map((r) => (
                <li key={r}>
                  <button
                    onClick={() => {
                      setRate(r);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors ${
                      rate === r ? 'text-brand-300' : 'text-zinc-300 hover:bg-ink-700 hover:text-zinc-50'
                    }`}
                  >
                    {r === 1 ? 'Chuẩn (1×)' : `${r}×`}
                    {rate === r && <IconCheck className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
