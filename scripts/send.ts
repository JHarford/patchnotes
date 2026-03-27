import { config } from "dotenv";
config({ path: ".env.local" });
import { createInterface } from "readline";
import { supabase } from "../src/lib/supabase";

const id = process.argv[2];

if (!id) {
  console.error("Usage: npx tsx scripts/send.ts <newsletter-id>");
  process.exit(1);
}

async function main() {
  // Get newsletter
  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select("title, status")
    .eq("id", id)
    .single();

  if (error || !newsletter) {
    console.error("Newsletter not found:", id);
    process.exit(1);
  }

  if (newsletter.status === "sent") {
    console.error("Newsletter already sent.");
    process.exit(1);
  }

  // Get subscriber count
  const { count } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  console.log(`\nNewsletter: ${newsletter.title}`);
  console.log(`Subscribers: ${count} active`);

  if (!count || count === 0) {
    console.error("No active subscribers.");
    process.exit(1);
  }

  // Confirm
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
    rl.question("\nSend? (y/n): ", resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== "y") {
    console.log("Cancelled.");
    process.exit(0);
  }

  // Call the send API
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/newsletters/${id}/send`, {
    method: "POST",
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("Send failed:", result.error);
    process.exit(1);
  }

  console.log(
    `\nDone. Sent: ${result.sent}, Failed: ${result.failed}, Total: ${result.total}`
  );
}

main().catch((err) => {
  console.error("Send failed:", err);
  process.exit(1);
});
