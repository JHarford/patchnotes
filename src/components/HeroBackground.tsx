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
      {/* Space fade — black from top, lets the image show in bottom half */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, #0a0a0f 0%, #0a0a0f 15%, rgba(10,10,15,0.7) 35%, rgba(10,10,15,0.2) 50%, transparent 60%)",
          zIndex: 2,
        }}
      />

      {/* Dark overlay on the bottom for text readability */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "50%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 15, 0.30) 50%, rgba(10, 10, 15, 0.40) 100%)",
          zIndex: 2,
        }}
      />

      {/* Generated planet image */}
      <img
        src="https://emoxfnfdgueoxyyejpbo.supabase.co/storage/v1/object/public/newsletter-images/1774617971651-mlojxo.png"
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: "120%",
          maxWidth: "none",
          transform: "translateX(-50%)",
          zIndex: 1,
          display: "block",
        }}
      />
    </div>
  );
}
