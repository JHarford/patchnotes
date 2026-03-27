import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", normalizedEmail)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    // Reactivate unsubscribed user
    await supabase
      .from("subscribers")
      .update({ status: "active", unsubscribed_at: null })
      .eq("id", existing.id);

    return NextResponse.json({ message: "Welcome back!" });
  }

  const { error } = await supabase.from("subscribers").insert({
    email: normalizedEmail,
  });

  if (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ message: "Subscribed" });
}
