import { config } from "dotenv";
config({ path: ".env.local" });
import { generateNewsletterDraft } from "../src/lib/pipeline";
import { resend } from "../src/lib/resend";
import { getAppUrl } from "../src/lib/app-url";

const appUrl = getAppUrl();
// Internal notification recipients — defaults to the editor's addresses.
// Override with a comma-separated CURATION_NOTIFY_EMAIL env var.
const notifyTo = (process.env.CURATION_NOTIFY_EMAIL || "josephharford@gmail.com,joe@goairship.uk")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

function parseFocus(argv: string[]): string | undefined {
  const idx = argv.findIndex((a) => a === "--focus");
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
  const inline = argv.find((a) => a.startsWith("--focus="));
  if (inline) return inline.slice("--focus=".length);
  return undefined;
}

// Plain internal notification — no List-Unsubscribe headers (this is not a
// subscriber send), so we hit the Resend client directly rather than sendEmail().
async function notify(subject: string, html: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@patchnote.gg";
  const fromName = process.env.RESEND_FROM_NAME || "Patch Note";
  await resend().emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: notifyTo,
    subject,
    html,
  });
}

async function main() {
  console.log("=== Patch Note Generator (with notification) ===\n");

  const focus = parseFocus(process.argv.slice(2));
  if (focus) console.log(`Editorial focus: ${focus}\n`);

  const { id, title } = await generateNewsletterDraft({ focus });
  const curateUrl = `${appUrl}/admin?curate=${id}`;
  const previewUrl = `${appUrl}/api/preview/${id}`;

  console.log(`\nNewsletter: ${title}`);
  console.log(`Draft ID: ${id}`);
  console.log(`Curate: ${curateUrl}`);
  console.log(`Preview: ${previewUrl}`);

  await notify(
    `🎮 Patch Note ready for curation — ${title}`,
    `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
       <p>A fresh Patch Note draft is ready for curation.</p>
       <p><strong>${title}</strong></p>
       <p><a href="${curateUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Review &amp; curate →</a></p>
       <p style="color:#555;font-size:13px">Draft ID: <code>${id}</code><br>
       Read-only preview: <a href="${previewUrl}">${previewUrl}</a></p>
     </div>`,
  );
  console.log(`\nNotification sent to ${notifyTo}`);
}

main().catch(async (err) => {
  console.error("Generation failed:", err);
  // Notify on failure too, so a silent cron error doesn't go unnoticed.
  try {
    await notify(
      `⚠️ Patch Note generation failed`,
      `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
         <p>This morning's Patch Note generation failed — no draft was created.</p>
         <pre style="background:#f4f4f4;padding:12px;border-radius:6px;overflow:auto;font-size:13px">${String(
           err?.stack || err,
         ).replace(/</g, "&lt;")}</pre>
       </div>`,
    );
    console.log(`Failure notification sent to ${notifyTo}`);
  } catch (notifyErr) {
    console.error("Also failed to send failure notification:", notifyErr);
  }
  process.exit(1);
});
