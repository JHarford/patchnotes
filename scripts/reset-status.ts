import { config } from "dotenv";
config({ path: ".env.local" });
import { supabase } from "../src/lib/supabase";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npx tsx scripts/reset-status.ts <newsletter-id>");
  process.exit(1);
}

async function main() {
  const { data, error } = await supabase
    .from("newsletters")
    .update({ status: "draft" })
    .eq("id", id)
    .select("id, status");

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Reset:", data);
  }
}

main();
