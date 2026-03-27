import { exec } from "child_process";

const id = process.argv[2];

if (!id) {
  console.error("Usage: npx tsx scripts/preview.ts <newsletter-id>");
  process.exit(1);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const url = `${appUrl}/api/preview/${id}`;

console.log(`Opening preview: ${url}`);
exec(`open "${url}"`);
