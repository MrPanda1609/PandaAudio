import { useState } from 'react';

/** Modal "ăn xin" — hiện QR donate + quote hài. */
export function DonateModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const account = '1023591912';
  const name = 'Nguyễn Minh Khôi';

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(account);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = account;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-cardborder bg-ink-900 p-6 text-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <span role="img" aria-label="Ủng hộ" className="text-[48px] leading-none">
          🧋
        </span>
        <h2 className="mt-3 text-[20px] font-extrabold tracking-tight text-zinc-50">
          Ủng hộ admin nghèo vượt khó
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
          Nghe chùa hoài cũng kỳ hen? Quét mã mời admin ly trà đá,
          để admin có sức cày thêm truyện mới mỗi ngày! 🍳
        </p>

        <div className="mx-auto mt-4 w-52 overflow-hidden rounded-2xl border border-cardborder bg-white p-2">
          <img
            src="/donate-qr.jpg"
            alt="QR ủng hộ"
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        <p className="mt-4 text-[13px] text-zinc-500">hoặc chuyển khoản thủ công:</p>
        <button
          onClick={copyAccount}
          className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-xl border border-cardborder bg-ink-850 px-4 py-3 text-left transition-colors active:bg-ink-800"
        >
          <span>
            <span className="block text-[15px] font-bold tabular-nums text-zinc-100">
              {name}
            </span>
            <span className="mt-0.5 block text-[14px] tabular-nums text-brand-400">
              {account}
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-[13px] font-bold text-ink-950">
            {copied ? 'Đã copy ✓' : 'Copy'}
          </span>
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl py-2.5 text-[14px] font-medium text-zinc-500 transition-colors hover:text-zinc-200"
        >
          Để sau vậy 🥲
        </button>
      </div>
    </div>
  );
}
