"use client";

export default function HeroBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Space fade — black from top, transparent by ~50% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, #0a0a0f 0%, #0a0a0f 30%, transparent 55%)",
          zIndex: 4,
        }}
      />

      {/* 50% dark overlay on the bottom half */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "50%",
          background: "rgba(10, 10, 15, 0.50)",
          zIndex: 3,
        }}
      />

      {/* Atmosphere glow — the bright band */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-5%",
          width: "140%",
          height: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0.12) 30%, rgba(139,92,246,0.06) 50%, transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* Secondary atmosphere — wider, softer */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-10%",
          width: "200%",
          height: "55%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99,102,241,0.10) 0%, rgba(56,189,248,0.04) 40%, transparent 65%)",
          zIndex: 1,
        }}
      />

      {/* The planet arc / crescent world */}
      <svg
        viewBox="0 0 1600 900"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-38%",
          width: "160%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Atmosphere glow filter */}
          <filter id="atmosGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
          </filter>

          {/* Planet surface gradient */}
          <radialGradient id="planetGrad" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="60%" stopColor="#12121a" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </radialGradient>

          {/* Atmosphere arc gradient */}
          <linearGradient id="atmosArc" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          {/* Grid line color */}
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="30%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          {/* Clip to planet surface */}
          <clipPath id="planetClip">
            <ellipse cx="800" cy="680" rx="720" ry="420" />
          </clipPath>
        </defs>

        {/* Planet body */}
        <ellipse cx="800" cy="680" rx="720" ry="420" fill="url(#planetGrad)" />

        {/* Surface grid lines — curved to follow the planet */}
        <g clipPath="url(#planetClip)" opacity="0.6">
          {/* Horizontal latitude lines */}
          {[300, 320, 345, 375, 410, 455, 510].map((ry, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="800"
              cy="680"
              rx={680 - i * 30}
              ry={ry}
              fill="none"
              stroke="url(#gridFade)"
              strokeWidth="0.5"
            />
          ))}
          {/* Vertical longitude lines */}
          {[-300, -200, -100, 0, 100, 200, 300].map((offset, i) => (
            <ellipse
              key={`lon-${i}`}
              cx={800 + offset}
              cy="680"
              rx={60 + Math.abs(offset) * 0.15}
              ry="420"
              fill="none"
              stroke="#6366f1"
              strokeWidth="0.5"
              opacity={0.12 - Math.abs(offset) * 0.0002}
            />
          ))}
        </g>

        {/* Abstract "structures" on the surface — geometric clusters */}
        <g clipPath="url(#planetClip)" opacity="0.7">
          {/* City cluster left */}
          <g transform="translate(420, 370)">
            <rect x="0" y="0" width="2" height="14" fill="#818cf8" opacity="0.5" />
            <rect x="5" y="4" width="2" height="10" fill="#6366f1" opacity="0.4" />
            <rect x="9" y="2" width="1.5" height="12" fill="#a5b4fc" opacity="0.3" />
            <rect x="13" y="6" width="2" height="8" fill="#6366f1" opacity="0.35" />
            <circle cx="6" cy="0" r="1" fill="#818cf8" opacity="0.6" />
          </g>

          {/* City cluster center-left */}
          <g transform="translate(580, 340)">
            <rect x="0" y="3" width="1.5" height="16" fill="#818cf8" opacity="0.4" />
            <rect x="4" y="0" width="2" height="19" fill="#6366f1" opacity="0.5" />
            <rect x="8" y="5" width="1.5" height="14" fill="#a5b4fc" opacity="0.35" />
            <rect x="12" y="2" width="2" height="17" fill="#818cf8" opacity="0.4" />
            <rect x="16" y="7" width="1.5" height="12" fill="#6366f1" opacity="0.3" />
            <circle cx="5" cy="-2" r="1.2" fill="#a5b4fc" opacity="0.5" />
          </g>

          {/* City cluster center */}
          <g transform="translate(760, 320)">
            <rect x="0" y="2" width="2" height="22" fill="#6366f1" opacity="0.5" />
            <rect x="5" y="0" width="2.5" height="24" fill="#818cf8" opacity="0.55" />
            <rect x="10" y="4" width="2" height="20" fill="#a5b4fc" opacity="0.4" />
            <rect x="15" y="1" width="2" height="23" fill="#6366f1" opacity="0.45" />
            <rect x="20" y="6" width="1.5" height="18" fill="#818cf8" opacity="0.35" />
            <rect x="24" y="3" width="2" height="21" fill="#6366f1" opacity="0.4" />
            <circle cx="8" cy="-3" r="1.5" fill="#a5b4fc" opacity="0.6" />
            <circle cx="18" cy="-1" r="1" fill="#818cf8" opacity="0.5" />
          </g>

          {/* City cluster center-right */}
          <g transform="translate(940, 335)">
            <rect x="0" y="4" width="2" height="15" fill="#818cf8" opacity="0.4" />
            <rect x="5" y="1" width="1.5" height="18" fill="#6366f1" opacity="0.45" />
            <rect x="9" y="3" width="2" height="16" fill="#a5b4fc" opacity="0.35" />
            <rect x="14" y="0" width="2" height="19" fill="#6366f1" opacity="0.4" />
            <circle cx="7" cy="-1" r="1" fill="#818cf8" opacity="0.5" />
          </g>

          {/* City cluster right */}
          <g transform="translate(1100, 365)">
            <rect x="0" y="2" width="1.5" height="12" fill="#6366f1" opacity="0.4" />
            <rect x="4" y="0" width="2" height="14" fill="#818cf8" opacity="0.45" />
            <rect x="8" y="4" width="1.5" height="10" fill="#a5b4fc" opacity="0.3" />
            <circle cx="5" cy="-2" r="1" fill="#a5b4fc" opacity="0.5" />
          </g>

          {/* Scattered small nodes — people/data points */}
          {[
            [350, 395, 0.8],
            [480, 360, 1.0],
            [530, 385, 0.7],
            [650, 350, 0.9],
            [720, 380, 0.6],
            [860, 345, 0.8],
            [900, 370, 0.7],
            [1020, 355, 0.9],
            [1060, 380, 0.6],
            [1160, 385, 0.7],
            [1200, 400, 0.5],
            [380, 410, 0.5],
            [620, 395, 0.6],
            [980, 390, 0.5],
          ].map(([x, y, o], i) => (
            <circle
              key={`node-${i}`}
              cx={x}
              cy={y}
              r={0.8 + (i % 3) * 0.3}
              fill="#818cf8"
              opacity={o as number * 0.5}
            />
          ))}

          {/* Connection lines between nodes */}
          {[
            [480, 360, 530, 385],
            [650, 350, 720, 380],
            [860, 345, 900, 370],
            [1020, 355, 1060, 380],
            [580, 355, 650, 350],
            [900, 370, 980, 390],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={`conn-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6366f1"
              strokeWidth="0.4"
              opacity="0.2"
            />
          ))}
        </g>

        {/* Atmosphere arc — bright glowing edge */}
        <ellipse
          cx="800"
          cy="680"
          rx="722"
          ry="422"
          fill="none"
          stroke="url(#atmosArc)"
          strokeWidth="3"
          filter="url(#atmosGlow)"
        />

        {/* Tighter inner atmosphere line */}
        <ellipse
          cx="800"
          cy="680"
          rx="721"
          ry="421"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1"
          opacity="0.4"
          filter="url(#softGlow)"
        />

        {/* Wide outer glow */}
        <ellipse
          cx="800"
          cy="680"
          rx="730"
          ry="428"
          fill="none"
          stroke="#6366f1"
          strokeWidth="6"
          opacity="0.08"
          filter="url(#bigGlow)"
        />

        {/* Scattered stars in the space above */}
        {[
          [120, 80, 1.2, 0.4],
          [300, 150, 0.8, 0.3],
          [450, 50, 1.0, 0.35],
          [600, 120, 0.6, 0.25],
          [750, 30, 1.1, 0.4],
          [900, 90, 0.7, 0.3],
          [1050, 60, 0.9, 0.35],
          [1200, 130, 0.8, 0.25],
          [1350, 40, 1.0, 0.3],
          [1480, 110, 0.7, 0.35],
          [200, 200, 0.5, 0.2],
          [680, 180, 0.6, 0.2],
          [1100, 190, 0.5, 0.15],
          [1400, 170, 0.7, 0.2],
          [50, 160, 0.6, 0.2],
          [550, 210, 0.4, 0.15],
          [950, 220, 0.5, 0.18],
          [1250, 70, 0.9, 0.3],
          [380, 240, 0.4, 0.12],
          [820, 250, 0.5, 0.15],
        ].map(([x, y, r, o], i) => (
          <circle
            key={`star-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill="#e4e4ef"
            opacity={o}
          />
        ))}
      </svg>
    </div>
  );
}
