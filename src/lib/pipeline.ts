import { render } from "@react-email/render";
import { searchGameNews, searchFocusTopic } from "./search";
import { compileNewsletter } from "./claude";
import { supabase } from "./supabase";
import type { NewsletterContent, SearchResult } from "./types";
import NewsletterEmail from "../emails/Newsletter";

export async function generateNewsletterDraft(options?: {
  focus?: string;
}): Promise<{
  id: string;
  title: string;
}> {
  const focus = options?.focus;

  // 1. Get previously used source URLs (last 14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: recentNewsletters } = await supabase
    .from("newsletters")
    .select("sources, body_json")
    .gte("created_at", twoWeeksAgo);

  const usedUrls = new Set<string>();
  for (const nl of recentNewsletters || []) {
    for (const url of (nl.sources as string[]) || []) {
      usedUrls.add(url);
    }
  }

  // 2. Search and filter out already-used stories
  const rawResults = await searchGameNews();
  const combined: SearchResult[] = [...rawResults];
  if (focus) {
    const focusResults = await searchFocusTopic(focus);
    const seen = new Set(combined.map((r) => r.url));
    for (const r of focusResults) {
      if (!seen.has(r.url)) {
        combined.push(r);
        seen.add(r.url);
      }
    }
  }
  const results = combined.filter((r) => !usedUrls.has(r.url));

  if (usedUrls.size > 0) {
    console.log(`Filtered out ${rawResults.length - results.length} previously used articles`);
  }

  if (results.length === 0) {
    throw new Error("No new stories found. Try again later.");
  }

  // Collect recent headlines to avoid repetition
  const recentHeadlines: string[] = [];
  for (const nl of recentNewsletters || []) {
    const json = nl.body_json as NewsletterContent | null;
    if (json?.sections) {
      for (const section of json.sections) {
        for (const article of section.articles) {
          recentHeadlines.push(article.headline);
        }
      }
    }
  }

  // 3. Get next issue number
  const { count } = await supabase
    .from("newsletters")
    .select("*", { count: "exact", head: true });
  const issueNumber = (count || 0) + 1;

  // 3. Compile with Claude
  const content = await compileNewsletter(results, issueNumber, recentHeadlines, focus);

  // 4. Render HTML
  console.log("Rendering HTML...");
  const html = await renderNewsletterHtml(content, "#");

  // 5. Save draft to Supabase
  const sources = results.map((r) => r.url);
  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      title: content.title,
      subject: content.title,
      body_html: html,
      body_json: content,
      status: "draft",
      sources,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save draft: ${error.message}`);
  }

  console.log(`Draft saved: ${data.id}`);
  return { id: data.id, title: content.title };
}

export async function renderNewsletterHtml(
  content: NewsletterContent,
  unsubscribeUrl: string
): Promise<string> {
  const html = await render(
    NewsletterEmail({ content, unsubscribeUrl, subscribeUrl: process.env.NEXT_PUBLIC_APP_URL || "https://patchnote.gg" })
  );
  return html;
}
