import crypto from "crypto";

function computeToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("patchnotes-admin")
    .digest("hex");
}

export function verifyAdminToken(token: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  const expected = computeToken(password);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export function generateAdminToken(): string {
  return computeToken(process.env.ADMIN_PASSWORD!);
}
