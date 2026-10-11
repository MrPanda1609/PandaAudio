interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

/** Nút chuyển theme trắng hồng ↔ đen hổ phách, có hiệu ứng chuyển mượt. */
export function ThemeToggle({ theme, onToggle, className = '' }: Props) {
  const isLight = theme === 'light';
  return (
    <button
      onClick={onToggle}
      aria-label={isLight ? 'Chuyển sang theme tối' : 'Chuyển sang theme sáng'}
      title={isLight ? 'Chuyển sang theme tối' : 'Chuyển sang theme sáng'}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border border-cardborder bg-ink-850 text-[20px] leading-none transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
    >
      <span
        key={theme}
        className="inline-block animate-pop"
        role="img"
        aria-hidden
      >
        {isLight ? '🌙' : '🌸'}
      </span>
    </button>
  );
}
