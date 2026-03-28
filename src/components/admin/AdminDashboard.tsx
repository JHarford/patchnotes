"use client";

import { useState, useCallback } from "react";

interface Article {
  headline: string;
  summary: string;
  source_url: string;
  source_name: string;
  include?: boolean;
}

interface QuickHit {
  text: string;
  source_url: string;
  source_name: string;
  include?: boolean;
}

interface Section {
  heading: string;
  emoji: string;
  articles: Article[];
}

interface BodyJson {
  title?: string;
  date?: string;
  intro?: string;
  sections?: Section[];
  quick_hits?: QuickHit[];
}

interface NewsletterRow {
  id: string;
  title: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  total_recipients: number;
  body_json: BodyJson | null;
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
  const [curateId, setCurateId] = useState<string | null>(null);
  const [curateJson, setCurateJson] = useState<BodyJson | null>(null);
  const [saving, setSaving] = useState(false);
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

  function includedCount(json: BodyJson): { articles: number; total: number; quickHits: number; totalQuickHits: number } {
    let articles = 0;
    let total = 0;
    let quickHits = 0;
    let totalQuickHits = 0;
    for (const s of json.sections || []) {
      for (const a of s.articles || []) {
        total++;
        if (a.include !== false) articles++;
      }
    }
    for (const q of json.quick_hits || []) {
      totalQuickHits++;
      if (q.include !== false) quickHits++;
    }
    return { articles, total, quickHits, totalQuickHits };
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

  function openCurate(nl: NewsletterRow) {
    if (curateId === nl.id) {
      setCurateId(null);
      setCurateJson(null);
      return;
    }
    // Deep clone body_json, default include to true where missing
    const json = JSON.parse(JSON.stringify(nl.body_json || {})) as BodyJson;
    for (const s of json.sections || []) {
      for (const a of s.articles || []) {
        if (a.include === undefined) a.include = true;
      }
    }
    for (const q of json.quick_hits || []) {
      if (q.include === undefined) q.include = true;
    }
    setCurateId(nl.id);
    setCurateJson(json);
    // Close preview if open
    if (previewId === nl.id) {
      setPreviewId(null);
      setPreviewHtml(null);
    }
  }

  const toggleArticle = useCallback((sectionIdx: number, articleIdx: number) => {
    setCurateJson((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as BodyJson;
      const article = next.sections?.[sectionIdx]?.articles?.[articleIdx];
      if (article) article.include = !article.include;
      return next;
    });
  }, []);

  const toggleQuickHit = useCallback((idx: number) => {
    setCurateJson((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as BodyJson;
      const qh = next.quick_hits?.[idx];
      if (qh) qh.include = !qh.include;
      return next;
    });
  }, []);

  const setSectionAll = useCallback((sectionIdx: number, value: boolean) => {
    setCurateJson((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as BodyJson;
      for (const a of next.sections?.[sectionIdx]?.articles || []) {
        a.include = value;
      }
      return next;
    });
  }, []);

  const setQuickHitsAll = useCallback((value: boolean) => {
    setCurateJson((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as BodyJson;
      for (const q of next.quick_hits || []) {
        q.include = value;
      }
      return next;
    });
  }, []);

  async function saveCuration(id: string) {
    if (!curateJson) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/newsletters/${id}/curate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body_json: curateJson }),
      });
      if (res.ok) {
        setFeedback((f) => ({
          ...f,
          [id]: { type: "success", message: "Curation saved" },
        }));
        // Refresh preview
        setPreviewId(id);
        setPreviewHtml(null);
        const previewRes = await fetch(`/api/preview/${id}`);
        const html = await previewRes.text();
        setPreviewHtml(html);
      } else {
        const data = await res.json();
        setFeedback((f) => ({
          ...f,
          [id]: { type: "error", message: data.error || "Save failed" },
        }));
      }
    } catch {
      setFeedback((f) => ({
        ...f,
        [id]: { type: "error", message: "Network error" },
      }));
    }
    setSaving(false);
  }

  async function sendReview(id: string) {
    setLoading(id + "-review");
    try {
      const res = await fetch("/api/admin/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId: id }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Server returned ${res.status}` };
      }
      setLoading(null);
      if (res.ok) {
        setFeedback((f) => ({
          ...f,
          [id]: { type: "success", message: `Review sent to ${data.email}` },
        }));
      } else {
        setFeedback((f) => ({
          ...f,
          [id]: { type: "error", message: data.error || `Failed (${res.status})` },
        }));
      }
    } catch {
      setLoading(null);
      setFeedback((f) => ({
        ...f,
        [id]: { type: "error", message: "Network error" },
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
    try {
      const res = await fetch(`/api/newsletters/${id}/send`, { method: "POST" });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Server returned ${res.status}` };
      }
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
          [id]: { type: "error", message: data.error || `Failed (${res.status})` },
        }));
      }
    } catch {
      setLoading(null);
      setFeedback((f) => ({
        ...f,
        [id]: { type: "error", message: "Network error — check server logs" },
      }));
    }
  }

  const statusColor: Record<string, string> = {
    draft: "#6366f1",
    sending: "#eab308",
    sent: "#22c55e",
    failed: "#ef4444",
  };

  const btnStyle = {
    padding: "8px 16px",
    background: "#1a1a26",
    border: "1px solid #2a2a3a",
    borderRadius: "6px",
    color: "#e4e4ef",
    fontSize: "13px",
    cursor: "pointer",
  } as const;

  function renderCurationView(nl: NewsletterRow) {
    if (curateId !== nl.id || !curateJson) return null;
    const counts = includedCount(curateJson);

    return (
      <div
        style={{
          marginTop: "16px",
          background: "#0e0e16",
          border: "1px solid #2a2a3a",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ color: "#e4e4ef", fontSize: "15px", fontWeight: 600, margin: 0 }}>
            Editorial Curation
          </h4>
          <span style={{ color: "#8888a0", fontSize: "13px" }}>
            {counts.articles}/{counts.total} articles, {counts.quickHits}/{counts.totalQuickHits} quick hits
          </span>
        </div>

        {/* Sections */}
        {curateJson.sections?.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                paddingBottom: "6px",
                borderBottom: "1px solid #1e1e2e",
              }}
            >
              <span style={{ color: "#a5a5c0", fontSize: "14px", fontWeight: 600 }}>
                {section.emoji} {section.heading}
                <span style={{ color: "#5a5a70", fontWeight: 400, marginLeft: "8px", fontSize: "12px" }}>
                  ({section.articles?.filter((a) => a.include !== false).length}/{section.articles?.length})
                </span>
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setSectionAll(sIdx, true)}
                  style={{
                    padding: "3px 8px",
                    background: "transparent",
                    border: "1px solid #2a2a3a",
                    borderRadius: "4px",
                    color: "#22c55e",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  All Yes
                </button>
                <button
                  onClick={() => setSectionAll(sIdx, false)}
                  style={{
                    padding: "3px 8px",
                    background: "transparent",
                    border: "1px solid #2a2a3a",
                    borderRadius: "4px",
                    color: "#ef4444",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  All No
                </button>
              </div>
            </div>

            {section.articles?.map((article, aIdx) => (
              <div
                key={aIdx}
                onClick={() => toggleArticle(sIdx, aIdx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "10px 12px",
                  marginBottom: "4px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: article.include !== false ? "#12121a" : "#0a0a10",
                  opacity: article.include !== false ? 1 : 0.45,
                  transition: "opacity 0.15s, background 0.15s",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: article.include !== false ? "#16322a" : "#2a1a1a",
                    color: article.include !== false ? "#22c55e" : "#ef4444",
                    border: `1px solid ${article.include !== false ? "#22c55e33" : "#ef444433"}`,
                  }}
                >
                  {article.include !== false ? "Y" : "N"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e4e4ef", fontSize: "13px", fontWeight: 600, lineHeight: "1.3" }}>
                    {article.headline}
                  </div>
                  <div
                    style={{
                      color: "#7a7a90",
                      fontSize: "12px",
                      marginTop: "3px",
                      lineHeight: "1.4",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {article.summary}
                  </div>
                  <div style={{ color: "#5a5a70", fontSize: "11px", marginTop: "3px" }}>
                    {article.source_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Quick Hits */}
        {curateJson.quick_hits && curateJson.quick_hits.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                paddingBottom: "6px",
                borderBottom: "1px solid #1e1e2e",
              }}
            >
              <span style={{ color: "#a5a5c0", fontSize: "14px", fontWeight: 600 }}>
                Quick Hits
                <span style={{ color: "#5a5a70", fontWeight: 400, marginLeft: "8px", fontSize: "12px" }}>
                  ({curateJson.quick_hits.filter((q) => q.include !== false).length}/{curateJson.quick_hits.length})
                </span>
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setQuickHitsAll(true)}
                  style={{
                    padding: "3px 8px",
                    background: "transparent",
                    border: "1px solid #2a2a3a",
                    borderRadius: "4px",
                    color: "#22c55e",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  All Yes
                </button>
                <button
                  onClick={() => setQuickHitsAll(false)}
                  style={{
                    padding: "3px 8px",
                    background: "transparent",
                    border: "1px solid #2a2a3a",
                    borderRadius: "4px",
                    color: "#ef4444",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  All No
                </button>
              </div>
            </div>

            {curateJson.quick_hits.map((qh, qIdx) => (
              <div
                key={qIdx}
                onClick={() => toggleQuickHit(qIdx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  marginBottom: "3px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: qh.include !== false ? "#12121a" : "#0a0a10",
                  opacity: qh.include !== false ? 1 : 0.45,
                  transition: "opacity 0.15s, background 0.15s",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "24px",
                    height: "24px",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: qh.include !== false ? "#16322a" : "#2a1a1a",
                    color: qh.include !== false ? "#22c55e" : "#ef4444",
                    border: `1px solid ${qh.include !== false ? "#22c55e33" : "#ef444433"}`,
                  }}
                >
                  {qh.include !== false ? "Y" : "N"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e4e4ef", fontSize: "12px", lineHeight: "1.4" }}>
                    {qh.text}
                  </div>
                  <div style={{ color: "#5a5a70", fontSize: "11px", marginTop: "1px" }}>
                    {qh.source_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={() => saveCuration(nl.id)}
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: "#6366f1",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save & Preview"}
          </button>
        </div>
      </div>
    );
  }

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
              onClick={() => openCurate(nl)}
              style={{
                ...btnStyle,
                background: curateId === nl.id ? "#2a2a3a" : "#1a1a26",
                color: "#eab308",
                borderColor: curateId === nl.id ? "#eab308" : "#2a2a3a",
              }}
            >
              {curateId === nl.id ? "Hide Curation" : "Curate"}
            </button>
            <button
              onClick={() => togglePreview(nl.id)}
              style={{
                ...btnStyle,
                background: previewId === nl.id ? "#2a2a3a" : "#1a1a26",
              }}
            >
              {previewId === nl.id ? "Hide Preview" : "Preview"}
            </button>
            <button
              onClick={() => sendReview(nl.id)}
              disabled={loading === nl.id + "-review"}
              style={{
                ...btnStyle,
                color: "#818cf8",
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

        {renderCurationView(nl)}

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
