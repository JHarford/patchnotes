"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're in. Check your inbox for a welcome email.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#0d0d14",
            border: "1px solid #1a1a26",
            borderRadius: "8px",
            color: "#e4e4ef",
            fontSize: "16px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "12px 24px",
            background: "#6366f1",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: status === "loading" ? "wait" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {message && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14px",
            color: status === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
