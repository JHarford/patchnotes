import { config } from "dotenv";
config({ path: ".env.local" });
import { supabase } from "../src/lib/supabase";

const id = process.argv[2];

if (!id) {
  console.error("Usage: npx tsx scripts/delete-draft.ts <newsletter-id>");
  process.exit(1);
}

async function main() {
  const { data: nl, error } = await supabase
    .from("newsletters")
    .select("id, title, status")
    .eq("id", id)
    .single();

  if (error || !nl) {
    console.error("Newsletter not found:", id);
    process.exit(1);
  }

  if (nl.status === "sent") {
    console.error(`Refusing to delete a SENT newsletter: ${nl.title}`);
    process.exit(1);
  }

  const { error: delErr } = await supabase
    .from("newsletters")
    .delete()
    .eq("id", id)
    .neq("status", "sent");

  if (delErr) {
    console.error("Delete failed:", delErr);
    process.exit(1);
  }

  console.log(`Deleted [${nl.status}] ${nl.title}`);

  const { data: sentTitles } = await supabase
    .from("newsletters")
    .select("title")
    .eq("status", "sent");
  let maxSent = 0;
  for (const n of sentTitles || []) {
    const m = (n.title as string | null)?.match(/#(\d+)/);
    if (m) maxSent = Math.max(maxSent, parseInt(m[1], 10));
  }
  console.log(`Next issue will be #${String(maxSent + 1).padStart(3, "0")} (sequential over sent issues)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
