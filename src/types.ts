/** Một tập truyện — 1 file audio. Mỗi video nguồn = 1 tập nguyên. */
export interface Episode {
  id: string;
  storyId: string;
  storyTitle: string;
  title: string;
  /** Đường dẫn tương đối từ root, vd: "/audio/xuyen-khong/tap-1.opus" */
  file: string;
  /** Thời lượng giây (làm tròn) */
  duration: number;
  /** URL gốc (YouTube/TikTok) — để tránh tải trùng, app bỏ qua khi phát */
  source?: string;
  /** Chủ đề: "Xuyên không", "Viễn tưởng", "Mẹ chồng – Nàng dâu", "Báo thù"... */
  category?: string;
}

/** Một bộ truyện = nhóm các tập có cùng storyId */
export interface Story {
  id: string;
  title: string;
  episodes: Episode[];
  totalDuration: number;
}

/** Vị trí đang nghe của một tập */
export interface ProgressEntry {
  /** giây */
  t: number;
  /** timestamp lần cập nhật cuối (ms) */
  at: number;
}
