/**
 * Single source of truth for the public app URL.
 * Guards against the "patchnode.gg" typo that exists in some deployed
 * NEXT_PUBLIC_APP_URL env values (Vercel + droplet .env.local).
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || "https://patchnote.gg";
  return raw.replace("patchnode.gg", "patchnote.gg").replace(/\/+$/, "");
}
