/** Màn hình loading toàn màn hình — hiện khi mở web, mờ dần khi tải xong. */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950 animate-fade-in">
      {/* nền trang trí nhẹ */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 30%, var(--accent-5) 0%, transparent 70%)',
          opacity: 0.08,
        }}
      />

      {/* logo gấu nhảy */}
      <div className="relative">
        <span
          role="img"
          aria-label="Đang tải"
          className="block text-[72px] leading-none animate-panda-bounce"
        >
          🐼
        </span>
        {/* sóng âm nhảy múa dưới chân gấu */}
        <div className="mt-4 flex items-end justify-center gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-brand-500 animate-eq"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-[22px] font-extrabold tracking-tight text-zinc-50">
        Panda<span className="text-brand-400">Audio</span>
      </p>
      <p className="mt-2 text-[13px] text-zinc-500 animate-pulse">
        Đang tải thư viện truyện…
      </p>

      {/* thanh progress */}
      <div className="mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full w-1/3 rounded-full bg-brand-500 animate-loadbar" />
      </div>
    </div>
  );
}
