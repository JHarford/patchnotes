import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
  unsubscribeToken,
}: {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken: string;
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@patchnote.gg";
  const fromName = process.env.RESEND_FROM_NAME || "Patch Note";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const result = await getResend().emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  return result;
}

export { getResend as resend };
