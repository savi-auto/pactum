interface PactumLogoProps {
  size?: number;
}

export function PactumLogo({ size = 32 }: PactumLogoProps) {
  const iconSize = size * 0.55;
  return (
    <div
      className="flex items-center justify-center rounded-lg gradient-orange"
      style={{ width: size, height: size }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left chain link – pill shape */}
        <rect
          x="1.5"
          y="7.5"
          width="11"
          height="9"
          rx="4.5"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Right chain link – pill shape */}
        <rect
          x="11.5"
          y="7.5"
          width="11"
          height="9"
          rx="4.5"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
