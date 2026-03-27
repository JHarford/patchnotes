import Header from "@/components/Header";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const messages: Record<string, { title: string; body: string }> = {
    success: {
      title: "You've been unsubscribed",
      body: "Sorry to see you go. You won't receive any more emails from Patch Notes.",
    },
    already: {
      title: "Already unsubscribed",
      body: "You were already unsubscribed from Patch Notes.",
    },
    invalid: {
      title: "Invalid link",
      body: "This unsubscribe link is invalid or has expired.",
    },
  };

  const msg = messages[status || ""] || messages.invalid;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          {msg.title}
        </h1>
        <p
          style={{
            color: "#8888a0",
            fontSize: "16px",
            maxWidth: "400px",
          }}
        >
          {msg.body}
        </p>
      </main>
    </div>
  );
}
