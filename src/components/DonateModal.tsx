import { useState } from 'react';

/** Modal "ăn xin" — hiện QR donate + quote hài. */
export function DonateModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const bank = 'Vietcombank (VCB)';
  const account = '1023591912';
  const name = 'Nguyễn Minh Khôi';

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
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
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-cardborder bg-ink-900 p-6 text-center animate-fade-up"
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

        <a
          href="/donate-qr.jpg"
          download="qr-ung-ho-panda-audio.jpg"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-ink-800 px-5 py-2.5 text-[14px] font-semibold text-zinc-200 transition-colors hover:bg-ink-700"
        >
          ⬇️ Tải QR về máy
        </a>

        <p className="mt-4 text-[13px] text-zinc-500">hoặc chuyển khoản thủ công:</p>
        <div className="mt-1.5 rounded-xl border border-cardborder bg-ink-850 px-4 py-3 text-left">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
            {bank}
          </p>
          <p className="mt-1 text-[15px] font-bold text-zinc-100">{name}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[16px] font-bold tabular-nums text-brand-400">
              {account}
            </span>
            <button
              onClick={() => copyText(`${bank} - ${name} - ${account}`)}
              className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-[13px] font-bold text-ink-950 transition-transform active:scale-95"
            >
              {copied ? 'Đã copy ✓' : 'Copy'}
            </button>
          </div>
        </div>

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
