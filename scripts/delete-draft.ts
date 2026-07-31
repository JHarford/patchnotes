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

  const { count } = await supabase
    .from("newsletters")
    .select("*", { count: "exact", head: true });
  console.log(`Total newsletters now: ${count} → next issue will be #${String((count || 0) + 1).padStart(3, "0")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
