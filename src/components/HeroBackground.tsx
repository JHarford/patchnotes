"use client";

export default function HeroBackground() {
  // City light nodes scattered across the surface
  const cityNodes = [
    // Major hubs (brighter, larger)
    { x: 800, y: 340, r: 2.5, o: 0.9, glow: true },
    { x: 620, y: 355, r: 2.2, o: 0.85, glow: true },
    { x: 970, y: 350, r: 2.0, o: 0.8, glow: true },
    { x: 450, y: 380, r: 1.8, o: 0.75, glow: true },
    { x: 1120, y: 375, r: 1.8, o: 0.7, glow: true },
    // Secondary cities
    { x: 540, y: 365, r: 1.5, o: 0.7 },
    { x: 700, y: 348, r: 1.4, o: 0.65 },
    { x: 870, y: 342, r: 1.6, o: 0.7 },
    { x: 1040, y: 358, r: 1.4, o: 0.65 },
    { x: 380, y: 400, r: 1.3, o: 0.6 },
    { x: 1200, y: 390, r: 1.3, o: 0.55 },
    { x: 660, y: 360, r: 1.2, o: 0.6 },
    { x: 760, y: 352, r: 1.3, o: 0.6 },
    { x: 910, y: 348, r: 1.2, o: 0.6 },
    { x: 1080, y: 365, r: 1.1, o: 0.55 },
    // Smaller towns/outposts
    { x: 330, y: 415, r: 0.9, o: 0.45 },
    { x: 490, y: 375, r: 1.0, o: 0.5 },
    { x: 580, y: 358, r: 0.9, o: 0.5 },
    { x: 730, y: 345, r: 0.8, o: 0.45 },
    { x: 840, y: 340, r: 0.9, o: 0.5 },
    { x: 950, y: 355, r: 0.8, o: 0.45 },
    { x: 1000, y: 362, r: 0.9, o: 0.5 },
    { x: 1150, y: 380, r: 0.8, o: 0.4 },
    { x: 1250, y: 400, r: 0.7, o: 0.35 },
    { x: 420, y: 392, r: 0.8, o: 0.45 },
    { x: 680, y: 365, r: 0.7, o: 0.4 },
    { x: 810, y: 355, r: 0.7, o: 0.4 },
    { x: 1180, y: 385, r: 0.7, o: 0.35 },
    // Scattered outposts
    { x: 300, y: 430, r: 0.5, o: 0.3 },
    { x: 360, y: 420, r: 0.6, o: 0.3 },
    { x: 510, y: 378, r: 0.6, o: 0.35 },
    { x: 640, y: 370, r: 0.5, o: 0.3 },
    { x: 780, y: 358, r: 0.5, o: 0.3 },
    { x: 860, y: 350, r: 0.5, o: 0.3 },
    { x: 930, y: 360, r: 0.5, o: 0.3 },
    { x: 1060, y: 370, r: 0.5, o: 0.3 },
    { x: 1140, y: 382, r: 0.5, o: 0.3 },
    { x: 1280, y: 410, r: 0.5, o: 0.25 },
    { x: 1310, y: 420, r: 0.4, o: 0.2 },
    { x: 270, y: 440, r: 0.4, o: 0.2 },
    { x: 470, y: 388, r: 0.5, o: 0.3 },
    { x: 750, y: 362, r: 0.4, o: 0.25 },
    { x: 990, y: 368, r: 0.5, o: 0.3 },
  ];

  // Connection lines between cities (indices into cityNodes or direct coords)
  const connections = [
    // Major trunk lines
    [800, 340, 620, 355],
    [800, 340, 970, 350],
    [620, 355, 450, 380],
    [970, 350, 1120, 375],
    [620, 355, 540, 365],
    [800, 340, 870, 342],
    [970, 350, 1040, 358],
    // Cross connections
    [540, 365, 700, 348],
    [700, 348, 800, 340],
    [870, 342, 970, 350],
    [1040, 358, 1120, 375],
    [450, 380, 380, 400],
    [1120, 375, 1200, 390],
    // Secondary network
    [660, 360, 620, 355],
    [760, 352, 800, 340],
    [910, 348, 870, 342],
    [1080, 365, 1040, 358],
    [490, 375, 540, 365],
    [580, 358, 620, 355],
    [730, 345, 700, 348],
    [840, 340, 800, 340],
    [950, 355, 970, 350],
    [1000, 362, 1040, 358],
    [1150, 380, 1120, 375],
    [420, 392, 450, 380],
    [680, 365, 700, 348],
    [810, 355, 840, 340],
    // Long-haul arcs
    [450, 380, 620, 355],
    [800, 340, 1040, 358],
    [540, 365, 870, 342],
    [700, 348, 970, 350],
    [380, 400, 540, 365],
    [1040, 358, 1200, 390],
    // Far reach
    [330, 415, 450, 380],
    [1250, 400, 1200, 390],
    [300, 430, 380, 400],
    [1280, 410, 1250, 400],
  ];

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
      {/* Space fade — black from top, fades later so glow shows more */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, #0a0a0f 0%, #0a0a0f 20%, rgba(10,10,15,0.85) 35%, rgba(10,10,15,0.4) 50%, transparent 60%)",
          zIndex: 4,
        }}
      />

      {/* Reduced dark overlay on the bottom — 30% instead of 50% */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "50%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 15, 0.30) 40%, rgba(10, 10, 15, 0.35) 100%)",
          zIndex: 3,
        }}
      />

      {/* Primary atmosphere glow — brighter, more vibrant */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-5%",
          width: "140%",
          height: "55%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.50) 0%, rgba(129,140,248,0.25) 25%, rgba(99,102,241,0.12) 40%, rgba(139,92,246,0.06) 55%, transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* Hot white-blue core glow at the horizon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "0%",
          width: "100%",
          height: "30%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(165,180,252,0.25) 0%, rgba(99,102,241,0.12) 30%, transparent 60%)",
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
          height: "60%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99,102,241,0.15) 0%, rgba(56,189,248,0.06) 35%, rgba(139,92,246,0.03) 50%, transparent 65%)",
          zIndex: 1,
        }}
      />

      {/* Upward spill glow — atmosphere light reaching into space */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "10%",
          width: "80%",
          height: "40%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(99,102,241,0.08) 0%, rgba(129,140,248,0.03) 40%, transparent 70%)",
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
          {/* Glow filters */}
          <filter id="atmosGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
          </filter>
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          <filter id="nodeGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          {/* Planet surface gradient */}
          <radialGradient id="planetGrad" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="60%" stopColor="#12121a" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </radialGradient>

          {/* Atmosphere arc gradient — brighter */}
          <linearGradient id="atmosArc" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
            <stop offset="20%" stopColor="#818cf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          {/* Grid line color */}
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="20%" stopColor="#6366f1" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.14" />
            <stop offset="80%" stopColor="#6366f1" stopOpacity="0.08" />
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
        <g clipPath="url(#planetClip)" opacity="0.5">
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
              opacity={0.08 - Math.abs(offset) * 0.00015}
            />
          ))}
        </g>

        {/* Connection network — glowing lines between cities */}
        <g clipPath="url(#planetClip)">
          {/* Glow layer for connections */}
          {connections.map(([x1, y1, x2, y2], i) => (
            <line
              key={`conn-glow-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#818cf8"
              strokeWidth="1.5"
              opacity="0.08"
              filter="url(#softGlow)"
            />
          ))}
          {/* Sharp line layer */}
          {connections.map(([x1, y1, x2, y2], i) => (
            <line
              key={`conn-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6366f1"
              strokeWidth={i < 7 ? "0.6" : i < 17 ? "0.4" : "0.3"}
              opacity={i < 7 ? 0.35 : i < 17 ? 0.25 : 0.15}
            />
          ))}
        </g>

        {/* City lights on the surface */}
        <g clipPath="url(#planetClip)">
          {/* Glow halos behind major hubs */}
          {cityNodes
            .filter((n) => n.glow)
            .map((n, i) => (
              <circle
                key={`hub-glow-${i}`}
                cx={n.x}
                cy={n.y}
                r={n.r * 4}
                fill="#818cf8"
                opacity={n.o * 0.15}
                filter="url(#nodeGlow)"
              />
            ))}

          {/* City glow layer */}
          {cityNodes.map((n, i) => (
            <circle
              key={`city-glow-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r * 2.5}
              fill="#a5b4fc"
              opacity={n.o * 0.12}
              filter="url(#cityGlow)"
            />
          ))}

          {/* City core dots */}
          {cityNodes.map((n, i) => (
            <circle
              key={`city-${i}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.glow ? "#c7d2fe" : "#a5b4fc"}
              opacity={n.o}
            />
          ))}

          {/* Bright center of major hubs */}
          {cityNodes
            .filter((n) => n.glow)
            .map((n, i) => (
              <circle
                key={`hub-core-${i}`}
                cx={n.x}
                cy={n.y}
                r={n.r * 0.5}
                fill="#e0e7ff"
                opacity={0.9}
              />
            ))}
        </g>

        {/* Atmosphere arc — bright glowing edge (boosted) */}
        <ellipse
          cx="800"
          cy="680"
          rx="724"
          ry="424"
          fill="none"
          stroke="#6366f1"
          strokeWidth="8"
          opacity="0.12"
          filter="url(#bigGlow)"
        />
        <ellipse
          cx="800"
          cy="680"
          rx="723"
          ry="423"
          fill="none"
          stroke="url(#atmosArc)"
          strokeWidth="4"
          filter="url(#atmosGlow)"
        />
        <ellipse
          cx="800"
          cy="680"
          rx="721.5"
          ry="421.5"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="1.5"
          opacity="0.6"
          filter="url(#softGlow)"
        />
        {/* Crisp bright edge */}
        <ellipse
          cx="800"
          cy="680"
          rx="721"
          ry="421"
          fill="none"
          stroke="#c7d2fe"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Wide outer atmospheric glow */}
        <ellipse
          cx="800"
          cy="680"
          rx="740"
          ry="435"
          fill="none"
          stroke="#6366f1"
          strokeWidth="12"
          opacity="0.06"
          filter="url(#bigGlow)"
        />
        <ellipse
          cx="800"
          cy="680"
          rx="750"
          ry="442"
          fill="none"
          stroke="#818cf8"
          strokeWidth="20"
          opacity="0.03"
          filter="url(#bigGlow)"
        />

        {/* Scattered stars */}
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
