import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { generateNewsletterDraft } from "@/lib/pipeline";

// Search + Claude compilation + DB save can take a while.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { focus } = (await req.json().catch(() => ({}))) as {
      focus?: string;
    };

    const { id, title } = await generateNewsletterDraft({ focus });

    return NextResponse.json({ ok: true, id, title });
  } catch (err) {
    console.error("generate endpoint failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Generation failed: ${message}` },
      { status: 500 }
    );
  }
}
