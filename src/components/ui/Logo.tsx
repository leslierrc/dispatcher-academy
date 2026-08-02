const PALETTE = {
  default: {
    circle: "#a8727a",
    stroke: "#a8727a",
    divider: "rgba(232,221,213,0.2)",
    word: "#e8ddd5",
  },
  light: {
    circle: "#8A5F67",
    stroke: "#8A5F67",
    divider: "#DCC7C1",
    word: "#241F1E",
  },
  inverted: {
    circle: "#d4a5a0",
    stroke: "#d4a5a0",
    divider: "rgba(245,242,240,0.28)",
    word: "#f5f2f0",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof PALETTE;
  className?: string;
  height?: number;
}

export default function Logo({ variant = "default", className, height = 28 }: LogoProps) {
  const c = PALETTE[variant];
  const scale = height / 28;
  const width = Math.round(height * (340 / 70));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 70"
      width={width}
      height={height}
      fill="none"
      role="img"
      aria-label="7 Digital LLC"
      className={className}
    >
      <title>7 Digital</title>
      <g transform={`translate(4 5) scale(${0.6 * scale})`}>
        <circle cx="50" cy="50" r="47" stroke={c.circle} strokeWidth="1.5" />
        <g stroke={c.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 40H62" />
          <path d="M62 40L49 79" />
          <path d="M62 40C78 44 81 69 49 79" />
        </g>
      </g>
      <rect x={82} y={17} width="1" height="36" fill={c.divider} />
      <text
        x={102} y={43}
        fontFamily="'Cormorant Garamond', Garamond, serif"
        fontSize={28 * scale}
        fontWeight="300"
        letterSpacing="6.7"
        fill={c.word}
      >
        7 DIGITAL
      </text>
    </svg>
  );
}

export function LogoMark({ className, height = 60 }: { className?: string; height?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={height}
      height={height}
      fill="none"
      role="img"
      aria-label="7 Digital"
      className={className}
    >
      <title>7 Digital</title>
      <circle cx="50" cy="50" r="47" stroke="#8A5F67" strokeWidth="1.5" />
      <g fill="none" stroke="#8A5F67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 40H62" />
        <path d="M62 40L49 79" />
        <path d="M62 40C78 44 81 69 49 79" />
      </g>
    </svg>
  );
}
