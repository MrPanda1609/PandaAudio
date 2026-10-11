/**
 * Web Audio Analyser dùng chung cho hiệu ứng sóng âm.
 * - Tạo AudioContext lười (chỉ sau gesture đầu tiên của user).
 * - suspend() khi pause để đỡ tốn pin, resume() khi play.
 * - MediaElementSource chỉ được tạo 1 lần duy nhất cho mỗi <audio>.
 */
class SharedAnalyser {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private wired: WeakSet<HTMLAudioElement> = new WeakSet();

  /** Nối analyser vào thẻ audio (an toàn khi gọi nhiều lần). */
  ensure(audio: HTMLAudioElement): AnalyserNode | null {
    try {
      if (!this.ctx) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (!this.wired.has(audio)) {
        const src = this.ctx.createMediaElementSource(audio);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.82;
        src.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.wired.add(audio);
      }
      return this.analyser;
    } catch {
      return null;
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  /** Dừng xử lý audio khi pause — tiết kiệm pin, sóng âm đứng yên. */
  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend().catch(() => undefined);
    }
  }

  /** Lấy N mức năng lượng (0..1) từ dải tần, đã làm mượt. */
  getLevels(n: number): number[] {
    if (!this.analyser || !this.ctx || this.ctx.state !== 'running') {
      return new Array(n).fill(0);
    }
    const bins = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(bins);
    const out: number[] = [];
    // Lấy dải tần thấp-trung (giọng nói), bỏ bớt bin cao ít ý nghĩa
    const usable = Math.floor(bins.length * 0.7);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.pow(i / n, 1.4) * usable);
      const v = bins[Math.min(idx, bins.length - 1)] / 255;
      out.push(Math.min(1, v * 1.25));
    }
    return out;
  }
}

export const sharedAnalyser = new SharedAnalyser();
