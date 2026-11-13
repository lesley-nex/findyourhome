type IconProps = { className?: string };

function Svg({ className, children, strokeWidth = 1.8 }: IconProps & { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
  </Svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const SlidersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Svg>
);

export const MapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5L9 4Z" />
    <path d="M9 4v13.5M15 6.5V20" />
  </Svg>
);

export const ListIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Svg>
);

export const TrainIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="14" rx="3" />
    <path d="M5 11h14M9 17l-2 4M15 17l2 4M9 14h.01M15 14h.01" />
  </Svg>
);

export const BedIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
    <circle cx="7" cy="11" r="1.5" />
  </Svg>
);

export const BathIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />
  </Svg>
);

export const AreaIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h5V4M20 15h-5v5" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const ShareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </Svg>
);
