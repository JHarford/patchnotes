import Anthropic from "@anthropic-ai/sdk";
import type { NewsletterContent, SearchResult } from "./types";

// Only the first N articles of each main section get lead_title/lead_intro.
// Stories beyond that are vanishingly unlikely to be picked as the lead, so
// skipping them saves Claude output tokens and latency.
const LEAD_OPTIONS_PER_SECTION = 3;

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local for local dev, or to your Vercel project env vars for production. If you just added it, restart the Next.js dev server."
      );
    }
    _anthropic = new Anthropic({ apiKey, timeout: 5 * 60 * 1000 });
  }
  return _anthropic;
}

const SYSTEM_PROMPT = `You are the editor of "Patch Note", a video game industry newsletter. Your tone is informed, slightly irreverent, and insider-y — like a sharp games journalist who respects developers. You never use clickbait. You're direct and opinionated but fair.

Given a set of search results about the video game industry, compile them into a RAW DRAFT newsletter. A human editor will curate the final selection using an admin UI, so your job is to include EVERY viable story — cast the widest possible net. Do NOT self-filter. More is better.

## Main sections (include ALL of these, even if a section only has 1 article):

1. **Studio Movements** (layoffs, hires, acquisitions, closures, new studios)
2. **Dev Tools & Papers** (game engine updates, research papers, new development tools/software)
3. **Releases & Announcements** (exciting new games, platform updates, hardware)
4. **Industry Intel** (business news, market trends, policy, legal)

For each article in a main section:
- Write a punchy headline (not the original title — rewrite it in your voice)
- Write a 2-3 sentence editorialized summary that tells the reader WHY this matters
- Include the source URL and source name
- Set "include" to true (the editor will toggle off what they don't want)

Within each section, put the STRONGEST / most newsworthy stories first — the top of each section is treated as the "lead candidates".

For ONLY the FIRST ${LEAD_OPTIONS_PER_SECTION} articles of each main section (the lead candidates), ALSO write:
- "lead_title": the full newsletter title to use IF the editor chose THIS story as the lead. MUST start with "Patch Note #NNN — " (matching the main title's issue number) and be short, punchy, and centred on this specific story.
- "lead_intro": the 2-3 sentence intro paragraph to use IF this story is the lead. Lead with this story, then briefly tease 2-3 of the OTHER most newsworthy stories from OTHER sections — enough to hint at what else is inside today's issue. Keep the tone consistent with the main intro.

For the 4th article onward in each section, OMIT lead_title and lead_intro entirely (do not include empty strings — leave the fields out of the JSON).

Include EVERY article that has any relevance to that section. Do not skip stories for being minor or niche — the editor decides what stays.

## Quick Hits section (REQUIRED — always include this):

At the end, include a "quick_hits" array of 15-20 rapid-fire one-liners. These cover EVERYTHING that didn't get a full write-up in the main sections: game releases, controversies, minor news, interesting tidbits, rumours, speedrun records, modding news, esports drama, console wars, indie spotlights, mobile gaming, VR/AR, streaming drama, game jams, fan projects, retro gaming. Scrape every last story from the search results. Each quick hit has "include" set to true.

Also write:
- A newsletter title (e.g. "Patch Note #N — [highlight of the day]")
- A short, punchy intro paragraph (2-3 sentences setting the day's tone)

Output ONLY valid JSON matching this structure:
{
  "title": "string",
  "date": "YYYY-MM-DD",
  "intro": "string",
  "sections": [
    {
      "heading": "string",
      "emoji": "string (single emoji)",
      "articles": [
        {
          "headline": "string",
          "summary": "string",
          "source_url": "string",
          "source_name": "string",
          "include": true,
          "lead_title": "string (ONLY for first 3 articles per section; omit otherwise)",
          "lead_intro": "string (ONLY for first 3 articles per section; omit otherwise)"
        }
      ]
    }
  ],
  "quick_hits": [
    {
      "text": "string (single sentence, punchy)",
      "source_url": "string",
      "source_name": "string",
      "include": true
    }
  ]
}`;

export async function compileNewsletter(
  results: SearchResult[],
  issueNumber: number,
  recentHeadlines?: string[],
  focus?: string
): Promise<NewsletterContent> {
  console.log(`Compiling issue #${String(issueNumber).padStart(3, "0")} with Claude...`);

  const userMessage = results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\nSource: ${r.source}\n${r.snippet}\n`
    )
    .join("\n");

  const paddedNum = String(issueNumber).padStart(3, "0");

  let recentContext = "";
  if (recentHeadlines && recentHeadlines.length > 0) {
    recentContext = `\n\nHEADLINES FROM RECENT ISSUES (do NOT repeat these unless there is a genuine update/development — if a story has progressed, frame it as an update, e.g. "UPDATE: ..."):\n${recentHeadlines.map((h) => `- ${h}`).join("\n")}`;
  }

  let focusContext = "";
  if (focus) {
    focusContext = `\n\nEDITORIAL FOCUS: This issue should feature a couple of stories (at least 2 if the source material supports it) specifically about "${focus}". These belong in "Industry Intel" unless a more appropriate section exists. Do not force stories that are not genuinely related, but prioritise any that are and give them proper editorial weight.`;
  }

  const makeRequest = () =>
    getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `This is issue #${paddedNum}. Today's date: ${new Date().toISOString().split("T")[0]}.\n\nHere are today's search results:\n\n${userMessage}${recentContext}${focusContext}\n\nCompile these into Patch Note #${paddedNum}. The title MUST start with "Patch Note #${paddedNum} —"`,
        },
      ],
    });

  let response;
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await makeRequest();
      break;
    } catch (err: unknown) {
      const isConnection =
        err instanceof Error && (err.message.includes("Connection error") || err.message.includes("ETIMEDOUT"));
      if (isConnection && attempt < maxRetries) {
        console.log(`Connection failed (attempt ${attempt}/${maxRetries}), retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }
  if (!response) throw new Error("Failed after all retries");

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON");
  }

  const content: NewsletterContent = JSON.parse(jsonMatch[0]);
  return content;
}

/**
 * Generates per-article lead_title/lead_intro based on the current curation
 * state. Only the top N Y-included articles per section get lead options, and
 * each lead_intro teases a handful of the OTHER Y-included stories so it feels
 * tailored to what the editor actually kept.
 *
 * Stale lead options on non-candidate articles are cleared so the UI only
 * surfaces stars whose intros reflect the current selection.
 */
export async function generateLeadOptions(
  content: NewsletterContent
): Promise<NewsletterContent> {
  console.log("Generating lead options for current selection...");

  // Walk included (Y) articles. Collect top-N-per-section as candidates and
  // every included headline (with its section) for use as "other stories"
  // context when Claude writes each lead_intro.
  const candidates: {
    key: string;
    sectionHeading: string;
    headline: string;
    summary: string;
  }[] = [];
  const includedHeadlines: { key: string; section: string; headline: string }[] = [];

  for (let si = 0; si < content.sections.length; si++) {
    const section = content.sections[si];
    let pickedInSection = 0;
    for (let ai = 0; ai < section.articles.length; ai++) {
      const a = section.articles[ai];
      if (a.include === false) continue;
      const key = `${si}-${ai}`;
      includedHeadlines.push({
        key,
        section: section.heading,
        headline: a.headline,
      });
      if (pickedInSection < LEAD_OPTIONS_PER_SECTION) {
        candidates.push({
          key,
          sectionHeading: section.heading,
          headline: a.headline,
          summary: a.summary,
        });
        pickedInSection++;
      }
    }
  }

  if (candidates.length === 0) return content;

  const paddedNum = content.title.match(/#(\d+)/)?.[1] || "001";

  const prompt = `You are the editor of "Patch Note", a video game industry newsletter. Your tone is informed, slightly irreverent, and insider-y — like a sharp games journalist who respects developers. You never use clickbait.

I have a draft that the editor has curated. For each LEAD CANDIDATE below, generate the newsletter title and intro paragraph that would be used if THAT story was chosen as the lead.

## LEAD CANDIDATES (keyed by "sectionIdx-articleIdx"):
${candidates
  .map(
    (c) =>
      `[${c.key}] (${c.sectionHeading})\n${c.headline}\n${c.summary}`
  )
  .join("\n\n")}

## OTHER INCLUDED STORIES (these are also in today's issue — tease 2-3 of them in each lead_intro to hint at what's inside):
${includedHeadlines
  .map((h) => `[${h.key}] (${h.section}) ${h.headline}`)
  .join("\n")}

For EACH lead candidate, output:
- lead_title: MUST start with "Patch Note #${paddedNum} —" and centre on that specific story. Short, punchy, no clickbait.
- lead_intro: 2-3 sentences. Sentence 1 leads with the candidate story. Sentences 2-3 briefly tease 2-3 of the OTHER INCLUDED STORIES (pick the most newsworthy, prefer stories from different sections to the lead). Don't just list them — weave them in naturally.

Do NOT reuse the same tease combination across every candidate — vary which "other stories" you pick so each intro feels distinct.

Output ONLY valid JSON:
{
  "options": [
    { "key": "0-0", "lead_title": "...", "lead_intro": "..." }
  ]
}`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON for lead options");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    options: { key: string; lead_title: string; lead_intro: string }[];
  };

  const byKey = new Map(parsed.options.map((o) => [o.key, o]));

  // Deep clone and apply. Clear stale lead options from any article that isn't
  // a current candidate — their intros would reference a stale selection.
  const next: NewsletterContent = JSON.parse(JSON.stringify(content));
  for (let si = 0; si < next.sections.length; si++) {
    for (let ai = 0; ai < next.sections[si].articles.length; ai++) {
      const key = `${si}-${ai}`;
      const article = next.sections[si].articles[ai];
      const opt = byKey.get(key);
      if (opt) {
        article.lead_title = opt.lead_title;
        article.lead_intro = opt.lead_intro;
      } else {
        delete article.lead_title;
        delete article.lead_intro;
      }
    }
  }

  return next;
}
