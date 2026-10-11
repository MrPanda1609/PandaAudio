/** Bộ icon SVG tự vẽ — không dùng ảnh ngoài, không emoji. */
interface IconProps {
  className?: string;
}

function base(props: IconProps) {
  return {
    className: props.className ?? 'h-6 w-6',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  } as const;
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg {...base({ className })}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
  );
}

export function IconPause({ className }: IconProps) {
  return (
    <svg {...base({ className })}><rect x="6.5" y="5" width="4" height="14" rx="1.2" /><rect x="13.5" y="5" width="4" height="14" rx="1.2" /></svg>
  );
}

export function IconNext({ className }: IconProps) {
  return (
    <svg {...base({ className })}><path d="M6 5.5v13l8.5-6.5L6 5.5Z" /><rect x="16" y="5" width="2.6" height="14" rx="1" /></svg>
  );
}

export function IconPrev({ className }: IconProps) {
  return (
    <svg {...base({ className })}><path d="M18 5.5v13L9.5 12l8.5-6.5Z" /><rect x="5.4" y="5" width="2.6" height="14" rx="1" /></svg>
  );
}

export function IconBack10({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 2.6-6.3M3 4v5h5" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8" fontWeight={700} fill="currentColor" stroke="none">10</text>
    </svg>
  );
}

export function IconFwd30({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8" fontWeight={700} fill="currentColor" stroke="none">30</text>
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconTimer({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="13" r="7.5" />
      <path strokeLinecap="round" d="M12 9.5V13l2.5 1.5M9.5 2.5h5M12 2.5V6" />
    </svg>
  );
}

export function IconSpeed({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M4 14a8 8 0 1 1 16 0" />
      <path strokeLinecap="round" d="M12 14l4-4.5" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconQueue({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M4 6h12M4 10h12M4 14h7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m17 13 4 3-4 3v-6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 10.5 8.5-7 8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function IconLibrary({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM13 6.5h5.5A1.5 1.5 0 0 1 20 8v9.5a1.5 1.5 0 0 1-1.5 1.5H13V6.5Z" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Logo PandaAudio — dùng emoji 🐼 thay cho SVG vẽ tay. */

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg {...base({ className })} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}
