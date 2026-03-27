import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id: string;
    to: string[];
    [key: string]: unknown;
  };
}

export async function POST(req: NextRequest) {
  const event: ResendWebhookEvent = await req.json();

  const emailAddress = event.data.to?.[0];
  if (!emailAddress) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "email.bounced") {
    await supabase
      .from("subscribers")
      .update({ status: "bounced" })
      .eq("email", emailAddress.toLowerCase());
  }

  if (event.type === "email.complained") {
    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("email", emailAddress.toLowerCase());
  }

  // Track delivery status on newsletter_recipients if resend_id matches
  if (event.data.email_id) {
    const statusMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.bounced": "bounced",
      "email.complained": "failed",
    };
    const newStatus = statusMap[event.type];
    if (newStatus) {
      await supabase
        .from("newsletter_recipients")
        .update({ status: newStatus })
        .eq("resend_id", event.data.email_id);
    }
  }

  return NextResponse.json({ received: true });
}
