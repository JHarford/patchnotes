import { config } from "dotenv";
config({ path: ".env.local" });
import { supabase } from "../src/lib/supabase";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npx tsx scripts/cleanup-failed.ts <newsletter-id>");
  process.exit(1);
}

async function main() {
  const { data, error } = await supabase
    .from("newsletter_recipients")
    .delete()
    .eq("newsletter_id", id)
    .eq("status", "failed")
    .select("id, email");

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Cleaned up ${data.length} failed recipient records`);
  }
}

main();
