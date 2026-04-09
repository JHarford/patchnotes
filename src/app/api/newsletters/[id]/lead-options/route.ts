import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/admin-auth";
import { generateLeadOptions } from "@/lib/claude";
import type { NewsletterContent } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: newsletter, error: fetchError } = await supabase
    .from("newsletters")
    .select("body_json")
    .eq("id", id)
    .single();

  if (fetchError || !newsletter?.body_json) {
    return NextResponse.json(
      { error: "Newsletter not found or has no content" },
      { status: 404 }
    );
  }

  const enriched = await generateLeadOptions(
    newsletter.body_json as NewsletterContent
  );

  const { error: updateError } = await supabase
    .from("newsletters")
    .update({ body_json: enriched, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, body_json: enriched });
}
