const PALETTE = {
  default: { mark: "#b68235", divider: "#d8d5d1", word: "#201f1d", suffix: "#b68235" },
  inverted: { mark: "#c9963f", divider: "rgba(243,242,242,0.28)", word: "#f3f2f2", suffix: "#c9963f" },
} as const;

interface LogoProps {
  variant?: keyof typeof PALETTE;
  className?: string;
  height?: number;
}

export default function Logo({ variant = "default", className, height = 32 }: LogoProps) {
  const c = PALETTE[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 330 72"
      height={height}
      width={(330 / 72) * height}
      fill="none"
      role="img"
      aria-label="7 Digital LLC"
      className={className}
    >
      <circle cx="36" cy="36" r="31" stroke={c.mark} strokeWidth="1" />
      <path d="M24 25 H49 L33.5 51" stroke={c.mark} strokeWidth="2.6" />
      <path d="M28 38 H41" stroke={c.mark} strokeWidth="1.4" />
      <path d="M91 14 V58" stroke={c.divider} strokeWidth="1" />
      <text
        x="112"
        y="43"
        style={{ fontFamily: "var(--font-heading)" }}
        fontSize="36"
        fontWeight="400"
        fill={c.word}
        letterSpacing="0.4"
      >
        7 Digital
      </text>
      <text
        x="113"
        y="60"
        style={{ fontFamily: "var(--font-body)" }}
        fontSize="9.5"
        fill={c.suffix}
        letterSpacing="4.6"
      >
        L L C
      </text>
    </svg>
  );
}
