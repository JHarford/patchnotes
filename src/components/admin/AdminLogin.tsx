"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      setError("Wrong password");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#12121a",
          border: "1px solid #2a2a3a",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <h1
          style={{
            color: "#6366f1",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "2px",
            marginBottom: "24px",
          }}
        >
          PATCH NOTE ADMIN
        </h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#0d0d14",
            border: "1px solid #1a1a26",
            borderRadius: "8px",
            color: "#e4e4ef",
            fontSize: "16px",
            outline: "none",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#6366f1",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "..." : "Log in"}
        </button>
        {error && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "12px" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
