import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { renderNewsletterHtml } from "@/lib/pipeline";
import { sendEmail } from "@/lib/resend";

const REVIEW_EMAIL = "joe@harford.dev";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newsletterId } = await req.json();

  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", newsletterId)
    .single();

  if (error || !newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  const html = newsletter.body_json
    ? await renderNewsletterHtml(newsletter.body_json, "#")
    : newsletter.body_html;

  const result = await sendEmail({
    to: REVIEW_EMAIL,
    subject: `[REVIEW] ${newsletter.subject}`,
    html,
    unsubscribeToken: "review",
  });

  if (result.error) {
    return NextResponse.json({ error: "Failed to send review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: REVIEW_EMAIL });
}
