import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .single();

  if (error || !subscriber) {
    return NextResponse.redirect(
      new URL("/unsubscribe?status=invalid", req.url)
    );
  }

  if (subscriber.status === "unsubscribed") {
    return NextResponse.redirect(
      new URL("/unsubscribe?status=already", req.url)
    );
  }

  await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  return NextResponse.redirect(
    new URL("/unsubscribe?status=success", req.url)
  );
}

// Handle List-Unsubscribe-Post one-click
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id")
    .eq("unsubscribe_token", token)
    .single();

  if (!subscriber) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  return NextResponse.json({ message: "Unsubscribed" });
}
