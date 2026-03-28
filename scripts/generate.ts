import { config } from "dotenv";
config({ path: ".env.local" });
import { generateNewsletterDraft } from "../src/lib/pipeline";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function main() {
  console.log("=== Patch Note Generator ===\n");

  const { id, title } = await generateNewsletterDraft();

  console.log(`\nNewsletter: ${title}`);
  console.log(`Draft ID: ${id}`);
  console.log(`Preview: ${appUrl}/api/preview/${id}`);
  console.log(`\nTo preview: npx tsx scripts/preview.ts ${id}`);
  console.log(`To send:    npx tsx scripts/send.ts ${id}`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
