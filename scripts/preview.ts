import { exec } from "child_process";
import { getAppUrl } from "../src/lib/app-url";

const id = process.argv[2];

if (!id) {
  console.error("Usage: npx tsx scripts/preview.ts <newsletter-id>");
  process.exit(1);
}

const appUrl = getAppUrl();
const url = `${appUrl}/api/preview/${id}`;

console.log(`Opening preview: ${url}`);
exec(`open "${url}"`);
