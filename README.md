# PandaAudio 🐼

Web nghe truyện audio cá nhân — giao diện kiểu Spotify/YouTube Music, phát dưới nền,
nhớ vị trí đang nghe, hẹn giờ tắt, tốc độ phát.

## Tính năng

- **"Nghe gì hôm nay?"**: gợi ý đổi mỗi ngày (ưu tiên tập đang nghe dở), vuốt ngang
- **Duyệt theo chủ đề**: Xuyên không, Viễn tưởng, Mẹ chồng – Nàng dâu, Báo thù...
  (gắn bằng `--category` khi chạy script), mỗi chủ đề có trang riêng: banner,
  lưới truyện + danh sách tất cả tập kèm thời lượng
- **Thư viện truyện**: sidebar liệt kê các bộ truyện, trang chi tiết liệt kê từng tập
- **Trình phát**: 1 thẻ `<audio>` duy nhất toàn app — play/pause, seek, tua ±10s/±30s
- **Phát dưới nền**: Media Session API → điều khiển từ màn hình khóa / tai nghe Bluetooth,
  Chrome Android giữ audio chạy khi tắt màn hình
- **Nhớ vị trí**: mỗi tập nhớ đúng giây đang nghe (localStorage), mở lại tự tiếp tục
- **Tự phát tập tiếp theo** trong cùng bộ truyện
- **Hẹn giờ tắt**: sau 15/30/45/60 phút hoặc khi hết tập (hợp nghe trước lúc ngủ)
- **Tốc độ phát**: 0.75× – 2× (ghi nhớ lựa chọn)
- **Sóng âm** theo nhạc bằng Web Audio Analyser — tự dừng khi pause để đỡ tốn pin
- **PWA**: cài như app, icon gấu trúc tự vẽ, cache audio để nghe offline
- **Empty state** đẹp khi thư viện trống

## Yêu cầu

- Node.js 18+
- `ffmpeg` trong PATH (để chuẩn hóa audio)
- `yt-dlp`: script `tools/fetch-audio.mjs` tự tải binary nếu chưa có

## Chạy local

```bash
npm install
npm run dev
```

## Thêm truyện mới (quan trọng)

Audio lấy từ YouTube/TikTok — **chỉ lấy tiếng, mỗi video = 1 tập nguyên**:

```bash
# Thêm 1 bộ truyện từ nhiều URL, gắn chủ đề để duyệt theo category
node tools/fetch-audio.mjs --story "Tên bộ truyện" --category "Xuyên không" "<url1>" "<url2>" ...

# Hoặc đọc URL từ file (mỗi dòng 1 URL, dòng # là comment)
node tools/fetch-audio.mjs --story "Tên bộ truyện" --file urls.txt

# Xem trước sẽ làm gì mà không tải
node tools/fetch-audio.mjs --story "Tên bộ truyện" --file urls.txt --dry-run

# Video cần đăng nhập / giới hạn tuổi: xuất cookies từ trình duyệt (dạng Netscape)
node tools/fetch-audio.mjs --story "Tên bộ truyện" --cookies cookies.txt "<url>"
```

Script sẽ:
1. Tải audio-only bằng `yt-dlp` (tự tải binary nếu máy chưa có)
2. Chuẩn hóa bằng `ffmpeg` → `.opus` (libopus, 48kbps, mono, 48kHz,
   `loudnorm` cho âm lượng đồng đều mọi tập, `voip` tối ưu giọng nói)
3. Lưu vào `public/audio/<story-id>/<tap>.opus`
4. Tự cập nhật `public/data/library.json` (bỏ qua URL đã có — không tải trùng)

Cấu trúc `library.json`:

```json
[
  {
    "id": "xuyen-khong-tap-1",
    "storyId": "xuyen-khong",
    "storyTitle": "Xuyên Không Về Cổ Đại",
    "title": "Tập 1 — ...",
    "file": "/audio/xuyen-khong/tap-1.opus",
    "duration": 2743,
    "category": "Xuyên không"
  }
]
```

`category` là tùy chọn — thiếu thì tập rơi vào nhóm "Khác". Các chủ đề gợi ý:
"Xuyên không", "Viễn tưởng", "Mẹ chồng – Nàng dâu", "Báo thù" (tự đặt thêm chủ đề
mới tùy ý, web tự nhận).

### Lưu ý về dung lượng audio

- Opus 48k mono ≈ **22MB/giờ** — 1 tập 60 phút ≈ 22MB.
- GitHub giới hạn **100MB/file**; Vercel deploy static file lớn vẫn ổn nhưng build sẽ lâu.
- Nếu thư viện phình to (> vài GB): cân nhắc đưa audio lên object storage
  (Cloudflare R2 / S3) rồi đổi `file` trong `library.json` thành URL tuyệt đối —
  app phát URL ngoài bình thường, chỉ mất cache offline của PWA.

## Deploy lên Vercel

1. Nén project thành zip (đã có audio trong `public/audio/`), push lên GitHub repo mới
2. Vào [vercel.com](https://vercel.com) → Add New Project → chọn repo
3. Framework preset: **Vite** (tự nhận). Build command: `npm run build`, output: `dist`
4. Deploy. Mỗi lần thêm truyện: chạy script → commit → push → Vercel tự deploy lại.

`vercel.json` đã cấu hình sẵn rewrite SPA về `index.html` + cache lâu cho `/audio/*`.

## Cấu trúc project

```
panda-audio/
├── public/
│   ├── audio/            # file .opus (do script tải về)
│   ├── data/library.json # metadata thư viện
│   └── icons/            # icon PWA (gấu trúc tự vẽ)
├── src/
│   ├── audio/player.tsx  # PlayerProvider: 1 thẻ <audio> duy nhất + toàn bộ logic phát
│   ├── audio/analyser.ts # Web Audio Analyser cho sóng âm
│   ├── lib/mediaSession.ts # Media Session API (màn hình khóa / phát nền)
│   ├── lib/storage.ts    # nhớ vị trí nghe, tốc độ (localStorage)
│   ├── lib/format.ts     # format thời gian
│   ├── data/library.ts   # đọc library.json, gom truyện, "Nghe tiếp"
│   ├── components/       # Sidebar, StoryCard, StoryDetail, MiniPlayer,
│   │                     # FullPlayer, Waveform, SleepTimerMenu, SpeedControl,
│   │                     # QueuePanel, SeekBar, EmptyState, Icons, StoryArt
│   ├── App.tsx
│   └── main.tsx
├── tools/fetch-audio.mjs # script tải + chuẩn hóa audio
├── vercel.json
└── README.md
```

## Mobile-first

Web được tối ưu cho Chrome / Cốc Cốc trên Android (đều là Chromium):

- Touch target tối thiểu **44px** cho mọi nút bấm; seekbar có vùng chạm cao 32px
- Không phụ thuộc hover — mọi nút quan trọng luôn hiện trên cảm ứng
  (nút play trên card hiện sẵn ở mobile, chỉ ẩn-hiện theo hover ở desktop)
- **Không dùng backdrop-filter blur** trên diện tích lớn (bài học cũ: gây lag khi cuộn);
  mini-player dùng nền đặc
- Layout mobile-first, chữ ≥13px, mini-player và full-player thao tác bằng ngón cái
- `viewport-fit=cover` + `100dvh` để khít màn hình tai thỏ / thanh điều hướng

## Lộ trình lên app Android

1. **PWA trước** (đã xong): cài từ Chrome → chạy fullscreen, phát nền OK.
2. **Capacitor sau**: bọc web thành app native (`@capacitor/core` + plugin background
   audio / foreground service) để phát nền ổn định hơn và lên CH Play.

## Giấy phép

Dự án cá nhân — audio trong `public/audio/` chỉ dùng để nghe riêng, không phân phối lại.
