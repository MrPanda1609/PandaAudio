import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Episode } from '../types';
import { flushProgress, getProgress, loadRate, saveProgress, saveRate } from '../lib/storage';
import { clearMediaSession, setupMediaSession, updatePositionState } from '../lib/mediaSession';
import { sharedAnalyser } from './analyser';
import { loadLibrary } from '../data/library';
import { setBackgroundAudio } from '../lib/backgroundAudio';
import { resolveAudioUrl } from '../lib/appUrls';

export type SleepMode =
  | { kind: 'off' }
  | { kind: 'minutes'; minutes: number; endsAt: number }
  | { kind: 'end' };

interface PlayerContextValue {
  episodes: Episode[];
  libraryLoaded: boolean;
  queue: Episode[];
  index: number;
  current: Episode | null;
  playing: boolean;
  loading: boolean;
  time: number;
  duration: number;
  rate: number;
  sleep: SleepMode;
  upcoming: Episode[];
  fullOpen: boolean;
  setFullOpen: (v: boolean) => void;
  playEpisode: (ep: Episode, context?: Episode[]) => void;
  playAt: (i: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (t: number) => void;
  seekBy: (d: number) => void;
  setRate: (r: number) => void;
  setSleep: (s: SleepMode) => void;
  getAudioEl: () => HTMLAudioElement | null;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer phải dùng trong <PlayerProvider>');
  return ctx;
}

interface Mutable {
  all: Episode[];
  queue: Episode[];
  index: number;
  sleep: SleepMode;
  rate: number;
  pendingSeek: number;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  // MỘT thẻ <audio> duy nhất cho toàn app — tạo 1 lần, sống suốt vòng đời.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) {
    const a = new Audio();
    // 'metadata' thay vì 'auto': chỉ tải thông tin file trước, bấm phát mới stream.
    // 'auto' sẽ tải cả file 15MB+ ngay khi chọn truyện → chậm, tốn data 4G.
    a.preload = 'metadata';
    audioRef.current = a;
  }

  const st = useRef<Mutable>({
    all: [],
    queue: [],
    index: -1,
    sleep: { kind: 'off' },
    rate: 1,
    pendingSeek: 0,
  });
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef(0);
  const lastPosRef = useRef(0);

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [queue, setQueue] = useState<Episode[]>([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [sleep, setSleepState] = useState<SleepMode>({ kind: 'off' });
  const [fullOpen, setFullOpen] = useState(false);

  const current: Episode | null = index >= 0 && index < queue.length ? queue[index] : null;

  const startPlayback = useCallback((a: HTMLAudioElement) => {
    setLoading(true);
    // ensure analyser nối vào element (chỉ nối 1 lần), resume để sóng chạy
    sharedAnalyser.ensure(a);
    sharedAnalyser.resume();
    void a.play().catch(() => {
      setLoading(false);
    });
  }, []);

  const playAt = useCallback(
    (i: number) => {
      const a = audioRef.current;
      if (!a) return;
      const q = st.current.queue;
      if (i < 0 || i >= q.length) return;
      const ep = q[i];
      st.current.index = i;
      setIndex(i);
      setTime(0);
      setDuration(ep.duration || 0);
      // Nhớ vị trí: mở lại tiếp tục đúng giây đã nghe
      const saved = getProgress(ep.id);
      const dur = ep.duration || 0;
      st.current.pendingSeek =
        saved && saved.t > 10 && (dur === 0 || saved.t < dur - 15) ? saved.t : 0;
      if (a.getAttribute('src') !== ep.file) {
        a.src = resolveAudioUrl(ep.file);
      } else if (st.current.pendingSeek > 0) {
        a.currentTime = Math.min(st.current.pendingSeek, Math.max(0, (a.duration || dur) - 1));
        st.current.pendingSeek = 0;
      }
      a.playbackRate = st.current.rate;
      startPlayback(a);
    },
    [startPlayback],
  );

  const playEpisode = useCallback(
    (ep: Episode, context?: Episode[]) => {
      const all = st.current.all;
      let q = context ?? all.filter((e) => e.storyId === ep.storyId);
      let i = q.findIndex((e) => e.id === ep.id);
      if (i < 0) {
        q = [ep];
        i = 0;
      }
      st.current.queue = q;
      setQueue(q);
      playAt(i);
    },
    [playAt],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !st.current.queue.length) return;
    if (a.paused) {
      sharedAnalyser.ensure(a);
      sharedAnalyser.resume();
      setLoading(true);
      void a.play().catch(() => setLoading(false));
    } else {
      a.pause();
    }
  }, []);

  const next = useCallback(() => {
    const s = st.current;
    if (s.index + 1 < s.queue.length) playAt(s.index + 1);
  }, [playAt]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    const s = st.current;
    if (!a) return;
    // Đang nghe > 5s: bấm prev = về đầu tập; ngược lại = tập trước
    if (a.currentTime > 5) {
      a.currentTime = 0;
      setTime(0);
    } else if (s.index > 0) {
      playAt(s.index - 1);
    } else {
      a.currentTime = 0;
      setTime(0);
    }
  }, [playAt]);

  const seekTo = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    const dur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : st.current.queue[st.current.index]?.duration ?? 0;
    const clamped = Math.max(0, Math.min(t, Math.max(0, dur - 0.5)));
    a.currentTime = clamped;
    setTime(clamped);
    const ep = st.current.queue[st.current.index];
    if (ep) saveProgress(ep.id, clamped);
    updatePositionState(a);
  }, []);

  const seekBy = useCallback(
    (d: number) => {
      const a = audioRef.current;
      if (!a) return;
      seekTo(a.currentTime + d);
    },
    [seekTo],
  );

  const setRate = useCallback((r: number) => {
    const a = audioRef.current;
    st.current.rate = r;
    setRateState(r);
    saveRate(r);
    if (a) {
      a.playbackRate = r;
      updatePositionState(a);
    }
  }, []);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  }, []);

  const setSleep = useCallback(
    (s: SleepMode) => {
      clearSleepTimer();
      st.current.sleep = s;
      setSleepState(s);
      if (s.kind === 'minutes') {
        const delay = Math.max(1000, s.endsAt - Date.now());
        sleepTimerRef.current = setTimeout(() => {
          const a = audioRef.current;
          if (a) a.pause();
          st.current.sleep = { kind: 'off' };
          setSleepState({ kind: 'off' });
        }, delay);
      }
    },
    [clearSleepTimer],
  );

  const getAudioEl = useCallback(() => audioRef.current, []);

  // ---- Gắn sự kiện cho thẻ audio: 1 lần duy nhất ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoadedMetadata = () => {
      const dur = Number.isFinite(a.duration) ? a.duration : 0;
      if (dur > 0) setDuration(dur);
      const seek = st.current.pendingSeek;
      if (seek > 0 && dur > 0) {
        a.currentTime = Math.min(seek, Math.max(0, dur - 1));
        setTime(a.currentTime);
      }
      st.current.pendingSeek = 0;
      updatePositionState(a);
    };
    const onTimeUpdate = () => {
      const t = a.currentTime;
      setTime(t);
      const now = Date.now();
      const ep = st.current.queue[st.current.index];
      if (ep && now - lastSaveRef.current > 5000) {
        lastSaveRef.current = now;
        saveProgress(ep.id, t);
      }
      if (now - lastPosRef.current > 5000) {
        lastPosRef.current = now;
        updatePositionState(a);
      }
    };
    const onPlay = () => {
      setPlaying(true);
      setLoading(false);
      // App Android: bật foreground service giữ audio dưới nền
      const ep = st.current.queue[st.current.index];
      void setBackgroundAudio(true, ep?.storyTitle, ep?.title);
    };
    const onPlaying = () => setLoading(false);
    const onPause = () => {
      setPlaying(false);
      setLoading(false);
      void setBackgroundAudio(false);
      sharedAnalyser.suspend(); // dừng xử lý sóng âm để đỡ tốn pin
      const ep = st.current.queue[st.current.index];
      if (ep) flushProgress(ep.id, a.currentTime);
    };
    const onWaiting = () => setLoading(true);
    const onEnded = () => {
      const s = st.current;
      const ep = s.queue[s.index];
      if (ep) flushProgress(ep.id, a.duration || 0);
      if (s.sleep.kind === 'end') {
        // Hẹn giờ "hết tập này": dừng, không tự phát tiếp
        s.sleep = { kind: 'off' };
        setSleepState({ kind: 'off' });
        setPlaying(false);
        void setBackgroundAudio(false);
        return;
      }
      if (s.index + 1 < s.queue.length) {
        playAt(s.index + 1);
      } else {
        setPlaying(false);
        void setBackgroundAudio(false);
      }
    };
    const onError = () => setLoading(false);

    a.addEventListener('loadedmetadata', onLoadedMetadata);
    a.addEventListener('timeupdate', onTimeUpdate);
    a.addEventListener('play', onPlay);
    a.addEventListener('playing', onPlaying);
    a.addEventListener('pause', onPause);
    a.addEventListener('waiting', onWaiting);
    a.addEventListener('ended', onEnded);
    a.addEventListener('error', onError);
    return () => {
      a.removeEventListener('loadedmetadata', onLoadedMetadata);
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('waiting', onWaiting);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('error', onError);
    };
  }, [playAt]);

  // ---- Nạp thư viện ----
  useEffect(() => {
    let cancelled = false;
    void loadLibrary().then((eps) => {
      if (cancelled) return;
      st.current.all = eps;
      setEpisodes(eps);
      setLibraryLoaded(true);
    });
    setRateState(loadRate());
    st.current.rate = loadRate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Áp playbackRate khi audio sẵn sàng (trường hợp set trước khi có element)
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = st.current.rate;
  }, [libraryLoaded]);

  // ---- Media Session API: metadata + điều khiển màn hình khóa ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) {
      clearMediaSession();
      return;
    }
    setupMediaSession(a, current, {
      onPlay: () => {
        sharedAnalyser.ensure(a);
        sharedAnalyser.resume();
        void a.play().catch(() => undefined);
      },
      onPause: () => a.pause(),
      onPrev: () => prev(),
      onNext: () => next(),
      onSeekBy: (d) => seekBy(d),
      onSeekTo: (t) => seekTo(t),
    });
  }, [current?.id, prev, next, seekBy, seekTo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lưu vị trí khi đóng/rời trang
  useEffect(() => {
    const onUnload = () => {
      const a = audioRef.current;
      const s = st.current;
      const ep = s.queue[s.index];
      if (a && ep) flushProgress(ep.id, a.currentTime);
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const upcoming = useMemo(
    () => (index >= 0 ? queue.slice(index + 1) : []),
    [queue, index],
  );

  const value: PlayerContextValue = {
    episodes,
    libraryLoaded,
    queue,
    index,
    current,
    playing,
    loading,
    time,
    duration,
    rate,
    sleep,
    upcoming,
    fullOpen,
    setFullOpen,
    playEpisode,
    playAt,
    toggle,
    next,
    prev,
    seekTo,
    seekBy,
    setRate,
    setSleep,
    getAudioEl,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
