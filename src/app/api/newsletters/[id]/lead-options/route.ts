import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { generateLeadOptions } from "@/lib/claude";
import type { NewsletterContent } from "@/lib/types";

// Claude call can take 20-40s; override Vercel's default 10s serverless limit.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body_json } = (await req.json()) as {
      body_json?: NewsletterContent;
    };

    if (!body_json || !body_json.sections) {
      return NextResponse.json(
        { error: "body_json with sections is required" },
        { status: 400 }
      );
    }

    const enriched = await generateLeadOptions(body_json);

    // Don't persist — the admin UI will save via the existing curation flow
    // so user's unsaved Y/N toggles aren't overwritten.
    return NextResponse.json({ ok: true, body_json: enriched });
  } catch (err) {
    console.error("lead-options endpoint failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Lead options generation failed: ${message}` },
      { status: 500 }
    );
  }
}
