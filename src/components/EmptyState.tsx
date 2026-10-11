import { ArtMark } from './StoryArt';

export function EmptyState() {
  return (
    <div className="flex min-h-[60vh] animate-fade-up flex-col items-center justify-center px-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-ink-850 shadow-xl shadow-black/30">
        <ArtMark className="w-12" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-50">Chưa có truyện nào</h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-400">
        Thư viện đang trống. Hãy chạy script lấy audio để thêm truyện vào:
      </p>
      <code className="mt-4 max-w-full overflow-x-auto rounded-xl bg-ink-850 px-4 py-3 text-left text-[13px] text-brand-300">
        node tools/fetch-audio.mjs --story "Tên truyện" "https://youtube.com/..."
      </code>
      <p className="mt-4 max-w-md text-[13px] leading-relaxed text-zinc-500">
        Script tự tải audio từ YouTube/TikTok, chuẩn hóa về .opus nhẹ và cập nhật thư viện.
        Xem chi tiết trong README.md.
      </p>
    </div>
  );
}
