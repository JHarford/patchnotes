import { supabase } from "./supabase";

/**
 * Generate a bold typography header image as SVG and upload to Supabase Storage.
 * Pure code-generated graphics — no AI, no external images.
 */
export async function generateHeaderImage(
  title: string,
  leadStory: string
): Promise<string | null> {
  console.log("Generating header image...");

  try {
    // Extract issue number from title (e.g. "Patch Note #002" → "002")
    const issueMatch = title.match(/#(\d+)/);
    const issueNumber = issueMatch ? issueMatch[1] : "";

    // Truncate lead story to fit as a tagline
    const tagline =
      leadStory.length > 80 ? leadStory.slice(0, 77) + "..." : leadStory;

    const svg = buildSvg(issueNumber, tagline);

    const filename = `header-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.svg`;

    const { error } = await supabase.storage
      .from("newsletter-images")
      .upload(filename, Buffer.from(svg, "utf-8"), {
        contentType: "image/svg+xml",
        upsert: false,
      });

    if (error) {
      console.error("Failed to upload header image:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("newsletter-images").getPublicUrl(filename);

    console.log("Header image uploaded:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.error("Header image generation failed:", err);
    return null;
  }
}

function buildSvg(issueNumber: string, tagline: string): string {
  // Generate deterministic-ish decorative elements from the tagline
  const seed = hashCode(tagline);

  // Accent colors
  const colors = ["#6366f1", "#22d3ee", "#ec4899"];
  const c1 = colors[Math.abs(seed) % 3];
  const c2 = colors[Math.abs(seed + 1) % 3];
  const c3 = colors[Math.abs(seed + 2) % 3];

  // Dot grid pattern
  const dots = generateDotGrid(seed);

  // Geometric accent lines
  const lines = generateAccentLines(seed, c1, c2);

  // Diagonal stripe accent
  const stripeY = 120 + (Math.abs(seed) % 60);

  // Escape tagline for XML
  const safeTagline = escapeXml(tagline);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="600" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="50%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="300" fill="url(#bg)"/>

  <!-- Subtle dot grid -->
  ${dots}

  <!-- Geometric accent lines -->
  ${lines}

  <!-- Diagonal gradient stripe -->
  <rect x="0" y="${stripeY}" width="600" height="2" fill="url(#accent)" opacity="0.6"/>
  <rect x="0" y="${stripeY + 4}" width="400" height="1" fill="url(#fade)"/>

  <!-- Corner accents -->
  <rect x="0" y="0" width="3" height="40" fill="${c1}" opacity="0.8"/>
  <rect x="0" y="0" width="40" height="3" fill="${c1}" opacity="0.8"/>
  <rect x="597" y="260" width="3" height="40" fill="${c2}" opacity="0.8"/>
  <rect x="560" y="297" width="40" height="3" fill="${c2}" opacity="0.8"/>

  <!-- PATCH NOTE wordmark -->
  <text x="40" y="60" font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="6" fill="#ffffff" opacity="0.5">PATCH NOTE</text>

  <!-- Issue number (large) -->
  ${issueNumber ? `<text x="40" y="${tagline ? 160 : 190}" font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="100" font-weight="800" fill="url(#accent)">#${issueNumber}</text>` : ""}

  <!-- Tagline -->
  ${safeTagline ? buildTaglineText(safeTagline, issueNumber ? 210 : 160) : ""}

  <!-- Bottom accent bar -->
  <rect x="40" y="270" width="120" height="4" rx="2" fill="url(#accent)" opacity="0.8"/>
  <circle cx="175" cy="272" r="3" fill="${c2}" opacity="0.6"/>
</svg>`;
}

function buildTaglineText(tagline: string, y: number): string {
  // Split long taglines across two lines
  if (tagline.length > 45) {
    const mid = tagline.lastIndexOf(" ", 45);
    const line1 = tagline.slice(0, mid);
    const line2 = tagline.slice(mid + 1);
    return `
  <text x="40" y="${y}" font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="600" fill="#ffffff" opacity="0.9">${line1}</text>
  <text x="40" y="${y + 26}" font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="600" fill="#ffffff" opacity="0.9">${line2}</text>`;
  }
  return `<text x="40" y="${y}" font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="600" fill="#ffffff" opacity="0.9">${tagline}</text>`;
}

function generateDotGrid(seed: number): string {
  const dots: string[] = [];
  const spacing = 30;
  for (let x = 20; x < 600; x += spacing) {
    for (let y = 20; y < 300; y += spacing) {
      // Only render ~30% of dots for subtlety
      if (pseudoRandom(seed + x * 7 + y * 13) > 0.7) {
        const opacity = 0.05 + pseudoRandom(seed + x + y * 3) * 0.1;
        dots.push(
          `<circle cx="${x}" cy="${y}" r="1" fill="#ffffff" opacity="${opacity.toFixed(2)}"/>`
        );
      }
    }
  }
  return dots.join("\n  ");
}

function generateAccentLines(seed: number, c1: string, c2: string): string {
  const lines: string[] = [];
  const count = 3 + (Math.abs(seed) % 3);

  for (let i = 0; i < count; i++) {
    const x1 = (pseudoRandom(seed + i * 17) * 600) | 0;
    const y1 = (pseudoRandom(seed + i * 31) * 300) | 0;
    const x2 = x1 + ((pseudoRandom(seed + i * 43) * 200 - 100) | 0);
    const y2 = y1 + ((pseudoRandom(seed + i * 59) * 100 - 50) | 0);
    const color = i % 2 === 0 ? c1 : c2;
    const opacity = (0.08 + pseudoRandom(seed + i * 71) * 0.12).toFixed(2);
    const width = (1 + pseudoRandom(seed + i * 89) * 2).toFixed(1);

    lines.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`
    );
  }

  return lines.join("\n  ");
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return hash;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
