import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body_json } = await req.json();

  if (!body_json) {
    return NextResponse.json({ error: "body_json is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("newsletters")
    .update({ body_json, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
