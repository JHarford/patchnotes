import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, title, sent_at, total_recipients, body_json")
    .eq("status", "sent")
    .order("sent_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>
          Archive
        </h1>

        {!newsletters || newsletters.length === 0 ? (
          <p style={{ color: "#8888a0" }}>No newsletters sent yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {newsletters.map((nl) => {
              const articleCount =
                nl.body_json?.sections?.reduce(
                  (sum: number, s: { articles: unknown[] }) =>
                    sum + (s.articles?.length || 0),
                  0
                ) || 0;

              return (
                <Link
                  key={nl.id}
                  href={`/archive/${nl.id}`}
                  style={{
                    display: "block",
                    padding: "20px",
                    background: "#12121a",
                    border: "1px solid #2a2a3a",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  <h2
                    style={{
                      color: "#e4e4ef",
                      fontSize: "18px",
                      fontWeight: 600,
                      margin: "0 0 8px",
                    }}
                  >
                    {nl.title}
                  </h2>
                  <p style={{ color: "#8888a0", fontSize: "13px", margin: 0 }}>
                    {nl.sent_at
                      ? new Date(nl.sent_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Draft"}{" "}
                    &middot; {articleCount} articles &middot;{" "}
                    {nl.total_recipients} recipients
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
