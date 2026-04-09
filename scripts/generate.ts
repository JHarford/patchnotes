import { config } from "dotenv";
config({ path: ".env.local" });
import { generateNewsletterDraft } from "../src/lib/pipeline";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function parseFocus(argv: string[]): string | undefined {
  const idx = argv.findIndex((a) => a === "--focus");
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
  const inline = argv.find((a) => a.startsWith("--focus="));
  if (inline) return inline.slice("--focus=".length);
  return undefined;
}

async function main() {
  console.log("=== Patch Note Generator ===\n");

  const focus = parseFocus(process.argv.slice(2));
  if (focus) console.log(`Editorial focus: ${focus}\n`);

  const { id, title } = await generateNewsletterDraft({ focus });

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
