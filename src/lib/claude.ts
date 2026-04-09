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
    _anthropic = new Anthropic({ apiKey });
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
- "lead_intro": the 2-3 sentence intro paragraph to use IF this story is the lead. It should explicitly frame today's issue around this story — not just mention it, but lead with it. Keep the tone consistent with the main intro.

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

  const response = await getAnthropic().messages.create({
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
 * Enriches an existing newsletter draft with per-article lead_title/lead_intro
 * fields. Used to retrofit drafts that were generated before lead-options support.
 */
export async function generateLeadOptions(
  content: NewsletterContent
): Promise<NewsletterContent> {
  console.log("Generating lead options for existing draft...");

  const articleList: { key: string; headline: string; summary: string }[] = [];
  for (let si = 0; si < content.sections.length; si++) {
    const section = content.sections[si];
    const limit = Math.min(section.articles.length, LEAD_OPTIONS_PER_SECTION);
    for (let ai = 0; ai < limit; ai++) {
      const a = section.articles[ai];
      articleList.push({
        key: `${si}-${ai}`,
        headline: a.headline,
        summary: a.summary,
      });
    }
  }

  if (articleList.length === 0) return content;

  const paddedNum =
    content.title.match(/#(\d+)/)?.[1] || "001";

  const prompt = `You are the editor of "Patch Note", a video game industry newsletter. I have an existing draft and need you to generate "lead options" for each article — i.e. for each article, the newsletter title and intro paragraph that would be used if THAT article were chosen as the lead story.

Current newsletter title: ${content.title}
Current intro: ${content.intro}

Articles (keyed by "sectionIdx-articleIdx"):
${articleList.map((a) => `[${a.key}] ${a.headline}\n${a.summary}`).join("\n\n")}

For EACH article, output:
- lead_title: MUST start with "Patch Note #${paddedNum} —" and centre on that specific story (short & punchy)
- lead_intro: 2-3 sentence intro that explicitly frames today's issue around that story

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

  // Deep clone and apply
  const next: NewsletterContent = JSON.parse(JSON.stringify(content));
  for (let si = 0; si < next.sections.length; si++) {
    for (let ai = 0; ai < next.sections[si].articles.length; ai++) {
      const opt = byKey.get(`${si}-${ai}`);
      if (opt) {
        next.sections[si].articles[ai].lead_title = opt.lead_title;
        next.sections[si].articles[ai].lead_intro = opt.lead_intro;
      }
    }
  }

  return next;
}
