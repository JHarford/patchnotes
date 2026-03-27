import Anthropic from "@anthropic-ai/sdk";
import type { NewsletterContent, SearchResult } from "./types";

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic();
  }
  return _anthropic;
}

const SYSTEM_PROMPT = `You are the editor of "Patch Notes", a daily video game industry newsletter. Your tone is informed, slightly irreverent, and insider-y — like a sharp games journalist who respects developers. You never use clickbait. You're direct and opinionated but fair.

Given a set of search results about the video game industry, compile them into a structured newsletter.

## Main sections (skip any with fewer than 2 articles):

1. **Studio Movements** (layoffs, hires, acquisitions, closures, new studios)
2. **Dev Tools & Papers** (game engine updates, research papers, new development tools/software)
3. **Releases & Announcements** (exciting new games, platform updates, hardware)
4. **Industry Intel** (business news, market trends, policy, legal)

For each article in a main section:
- Write a punchy headline (not the original title — rewrite it in your voice)
- Write a 2-3 sentence editorialized summary that tells the reader WHY this matters
- Include the source URL and source name

## Quick Hits section (REQUIRED — always include this):

At the end, include a "quick_hits" array of 5-10 rapid-fire one-liners. These are headlines that didn't make the main sections but are still worth knowing: game releases, controversies, minor news, interesting tidbits, rumours. Each quick hit is a single punchy sentence with a source link. Cast the net wide here — game releases, speedrun records, modding news, esports drama, console wars, indie spotlights. This section ensures the newsletter always feels packed with content even on slow news days.

Also write:
- A newsletter title (e.g. "Patch Notes #N — [highlight of the day]")
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
          "source_name": "string"
        }
      ]
    }
  ],
  "quick_hits": [
    {
      "text": "string (single sentence, punchy)",
      "source_url": "string",
      "source_name": "string"
    }
  ]
}`;

export async function compileNewsletter(
  results: SearchResult[],
  issueNumber: number,
  recentHeadlines?: string[]
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

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `This is issue #${paddedNum}. Today's date: ${new Date().toISOString().split("T")[0]}.\n\nHere are today's search results:\n\n${userMessage}${recentContext}\n\nCompile these into Patch Notes #${paddedNum}. The title MUST start with "Patch Notes #${paddedNum} —"`,
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
