import { config } from "dotenv";
config({ path: ".env.local" });
import { supabase } from "../src/lib/supabase";

async function main() {
  const { count } = await supabase
    .from("newsletters")
    .select("*", { count: "exact", head: true });
  console.log(`Total newsletters (all statuses): ${count}`);

  const { data, error } = await supabase
    .from("newsletters")
    .select("id, title, status, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }

  console.log("\nMost recent 10 newsletters:");
  for (const n of data || []) {
    console.log(
      `- [${n.status}] ${n.title}\n    id=${n.id}  created=${n.created_at}  sent=${n.sent_at ?? "—"}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
