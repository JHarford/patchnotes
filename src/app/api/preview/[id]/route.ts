import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { renderNewsletterHtml } from "@/lib/pipeline";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select("body_json, body_html")
    .eq("id", id)
    .single();

  if (error || !newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  // Re-render from JSON for fresh preview, or use stored HTML
  let html = newsletter.body_html;
  if (newsletter.body_json) {
    html = await renderNewsletterHtml(newsletter.body_json, "#");
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
