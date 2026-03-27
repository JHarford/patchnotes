"use client";

import { useState } from "react";

interface NewsletterRow {
  id: string;
  title: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  total_recipients: number;
  body_json: {
    sections?: { articles: unknown[] }[];
  } | null;
}

interface Stats {
  sent: number;
  failed: number;
  total: number;
}

export default function AdminDashboard({
  newsletters,
  stats,
  subscriberCount,
}: {
  newsletters: NewsletterRow[];
  stats: Record<string, Stats>;
  subscriberCount: number;
}) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    Record<string, { type: "success" | "error"; message: string }>
  >({});

  const drafts = newsletters.filter((n) => n.status === "draft");
  const sent = newsletters.filter((n) => n.status === "sent" || n.status === "sending");

  function articleCount(nl: NewsletterRow): number {
    return (
      nl.body_json?.sections?.reduce(
        (sum, s) => sum + (s.articles?.length || 0),
        0
      ) || 0
    );
  }

  async function togglePreview(id: string) {
    if (previewId === id) {
      setPreviewId(null);
      setPreviewHtml(null);
      return;
    }
    setPreviewId(id);
    setPreviewHtml(null);
    const res = await fetch(`/api/preview/${id}`);
    const html = await res.text();
    setPreviewHtml(html);
  }

  async function sendReview(id: string) {
    setLoading(id + "-review");
    const res = await fetch("/api/admin/send-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletterId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.ok) {
      setFeedback((f) => ({
        ...f,
        [id]: { type: "success", message: `Review sent to ${data.email}` },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        [id]: { type: "error", message: data.error || "Failed" },
      }));
    }
  }

  async function approveSend(id: string) {
    if (confirmSend !== id) {
      setConfirmSend(id);
      setTimeout(() => setConfirmSend((c) => (c === id ? null : c)), 5000);
      return;
    }
    setConfirmSend(null);
    setLoading(id + "-send");
    const res = await fetch(`/api/newsletters/${id}/send`, { method: "POST" });
    const data = await res.json();
    setLoading(null);
    if (res.ok) {
      setFeedback((f) => ({
        ...f,
        [id]: {
          type: "success",
          message: `Sent to ${data.sent} subscribers (${data.failed} failed)`,
        },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        [id]: { type: "error", message: data.error || "Send failed" },
      }));
    }
  }

  const statusColor: Record<string, string> = {
    draft: "#6366f1",
    sending: "#eab308",
    sent: "#22c55e",
    failed: "#ef4444",
  };

  function renderCard(nl: NewsletterRow, isDraft: boolean) {
    const fb = feedback[nl.id];
    return (
      <div
        key={nl.id}
        style={{
          background: "#12121a",
          border: "1px solid #2a2a3a",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                color: "#e4e4ef",
                fontSize: "17px",
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              {nl.title}
            </h3>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                fontSize: "13px",
                color: "#8888a0",
              }}
            >
              <span
                style={{
                  color: statusColor[nl.status] || "#8888a0",
                  border: `1px solid ${statusColor[nl.status] || "#2a2a3a"}`,
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {nl.status}
              </span>
              <span>
                {(nl.sent_at || nl.created_at) &&
                  new Date(nl.sent_at || nl.created_at).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
              </span>
              <span>{articleCount(nl)} articles</span>
              {nl.status === "sent" && stats[nl.id] && (
                <span>
                  <span style={{ color: "#22c55e" }}>{stats[nl.id].sent} sent</span>
                  {stats[nl.id].failed > 0 && (
                    <>
                      {" / "}
                      <span style={{ color: "#ef4444" }}>
                        {stats[nl.id].failed} failed
                      </span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {isDraft && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => togglePreview(nl.id)}
              style={{
                padding: "8px 16px",
                background: previewId === nl.id ? "#2a2a3a" : "#1a1a26",
                border: "1px solid #2a2a3a",
                borderRadius: "6px",
                color: "#e4e4ef",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {previewId === nl.id ? "Hide Preview" : "Preview"}
            </button>
            <button
              onClick={() => sendReview(nl.id)}
              disabled={loading === nl.id + "-review"}
              style={{
                padding: "8px 16px",
                background: "#1a1a26",
                border: "1px solid #2a2a3a",
                borderRadius: "6px",
                color: "#818cf8",
                fontSize: "13px",
                cursor:
                  loading === nl.id + "-review" ? "wait" : "pointer",
              }}
            >
              {loading === nl.id + "-review"
                ? "Sending..."
                : "Send Review Copy"}
            </button>
            <button
              onClick={() => approveSend(nl.id)}
              disabled={loading === nl.id + "-send"}
              style={{
                padding: "8px 16px",
                background:
                  confirmSend === nl.id ? "#7f1d1d" : "#6366f1",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor:
                  loading === nl.id + "-send" ? "wait" : "pointer",
              }}
            >
              {loading === nl.id + "-send"
                ? "Sending to all..."
                : confirmSend === nl.id
                ? `Confirm — Send to ${subscriberCount} subscribers?`
                : "Approve & Send"}
            </button>
          </div>
        )}

        {fb && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              color: fb.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            {fb.message}
          </p>
        )}

        {previewId === nl.id && (
          <div style={{ marginTop: "16px" }}>
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                style={{
                  width: "100%",
                  minHeight: "700px",
                  border: "1px solid #2a2a3a",
                  borderRadius: "8px",
                  background: "#fff",
                }}
                sandbox="allow-same-origin"
              />
            ) : (
              <p style={{ color: "#8888a0", fontSize: "13px" }}>
                Loading preview...
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e4e4ef",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #2a2a3a",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#6366f1",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          PATCH NOTES ADMIN
        </span>
        <span style={{ color: "#8888a0", fontSize: "13px" }}>
          {subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}
        </span>
      </header>

      <main
        style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#e4e4ef",
          }}
        >
          Drafts
        </h2>
        {drafts.length === 0 ? (
          <p style={{ color: "#8888a0", marginBottom: "32px" }}>
            No drafts. Run <code>npm run generate</code> to create one.
          </p>
        ) : (
          <div style={{ marginBottom: "32px" }}>
            {drafts.map((nl) => renderCard(nl, true))}
          </div>
        )}

        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#e4e4ef",
          }}
        >
          Sent
        </h2>
        {sent.length === 0 ? (
          <p style={{ color: "#8888a0" }}>No newsletters sent yet.</p>
        ) : (
          <div>{sent.map((nl) => renderCard(nl, false))}</div>
        )}
      </main>
    </div>
  );
}
