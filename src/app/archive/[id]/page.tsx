import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("title, body_html, sent_at")
    .eq("id", id)
    .single();

  if (!newsletter) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 24px" }}>
        <p style={{ color: "#8888a0", fontSize: "13px", marginBottom: "16px" }}>
          {newsletter.sent_at
            ? new Date(newsletter.sent_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Draft"}
        </p>
        <div dangerouslySetInnerHTML={{ __html: newsletter.body_html }} />
      </main>
    </div>
  );
}
