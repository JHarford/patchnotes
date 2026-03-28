import SubscribeForm from "@/components/SubscribeForm";
import Header from "@/components/Header";
import HeroBackground from "@/components/HeroBackground";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <HeroBackground />
      <Header />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#6366f1",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "3px",
            marginBottom: "16px",
          }}
        >
          VIDEO GAME INDUSTRY NEWSLETTER
        </p>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "16px",
            maxWidth: "600px",
          }}
        >
          The industry moves fast.
          <br />
          <span style={{ color: "#6366f1" }}>Stay patched in.</span>
        </h1>
        <p
          style={{
            color: "#b0b0c8",
            fontSize: "18px",
            lineHeight: 1.6,
            maxWidth: "500px",
            marginBottom: "12px",
          }}
        >
          Studio movements, dev tool releases, engine papers, and the news that
          matters — in your inbox every morning.
        </p>
        <p
          style={{
            color: "#8888a0",
            fontSize: "13px",
            lineHeight: 1.5,
            maxWidth: "460px",
            marginBottom: "32px",
          }}
        >
          AI-powered research, human-curated editorial. Every story is reviewed
          and selected by a real person before it hits your inbox.
        </p>
        <SubscribeForm />
        <p
          style={{
            color: "#8888a0",
            fontSize: "12px",
            marginTop: "16px",
          }}
        >
          Free. Unsubscribe anytime. No spam, ever.
        </p>
      </main>
    </div>
  );
}
