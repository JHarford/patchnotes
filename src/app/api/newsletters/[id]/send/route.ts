import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { renderNewsletterHtml } from "@/lib/pipeline";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get newsletter
  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  }

  if (newsletter.status === "sent") {
    return NextResponse.json({ error: "Already sent" }, { status: 409 });
  }

  try {

  // Get active subscribers
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id, email, unsubscribe_token")
    .eq("status", "active");

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
  }

  // Mark as sending
  await supabase
    .from("newsletters")
    .update({ status: "sending" })
    .eq("id", id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://patchnote.gg";
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${sub.unsubscribe_token}`;

    // Render per-subscriber HTML with their unsubscribe link
    const html = newsletter.body_json
      ? await renderNewsletterHtml(newsletter.body_json, unsubscribeUrl)
      : newsletter.body_html;

    const result = await sendEmail({
      to: sub.email,
      subject: newsletter.subject,
      html,
      unsubscribeToken: sub.unsubscribe_token,
    });

    const resendId = result.data?.id || null;
    const status = result.error ? "failed" : "sent";

    await supabase.from("newsletter_recipients").insert({
      newsletter_id: id,
      subscriber_id: sub.id,
      email: sub.email,
      status,
      resend_id: resendId,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    });

    if (result.error) {
      failed++;
      console.error(`Failed to send to ${sub.email}:`, result.error);
    } else {
      sent++;
    }
  }

  // Update newsletter status
  await supabase
    .from("newsletters")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      total_recipients: subscribers.length,
    })
    .eq("id", id);

  return NextResponse.json({ sent, failed, total: subscribers.length });

  } catch (err) {
    console.error("Send failed:", err);
    // Reset status so it can be retried
    await supabase
      .from("newsletters")
      .update({ status: "draft" })
      .eq("id", id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
