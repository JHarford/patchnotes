import type { SearchResult } from "./types";

const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";

const QUERIES = [
  "video game studio layoffs hires 2026",
  "video game studio acquisitions closures",
  "game engine research paper game development tools",
  "new game studio announcements indie",
  "game development technology news",
  "video game industry news today",
  "video game releases this week",
  "gaming controversy drama",
  "esports news",
  "indie game spotlight",
];

async function braveSearch(
  query: string,
  freshness: string = "pd"
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    count: "10",
    freshness,
    text_decorations: "false",
  });

  const res = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY!,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Brave search failed for "${query}": ${res.status} ${body}`);
    return [];
  }

  const data = await res.json();
  const results = data.web?.results || [];

  return results.map(
    (r: { title: string; url: string; description: string; age?: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
      source: new URL(r.url).hostname.replace("www.", ""),
      age: r.age,
    })
  );
}

export async function searchGameNews(): Promise<SearchResult[]> {
  console.log(`Searching for news... (${QUERIES.length} queries)`);

  // Try past day first
  const dailyResults = await Promise.all(
    QUERIES.map((q) => braveSearch(q, "pd"))
  );

  let flat = dailyResults.flat();

  // If slim pickings, widen to past 3 days
  if (flat.length < 20) {
    console.log(`Only ${flat.length} daily results — widening to past 3 days...`);
    const widerResults = await Promise.all(
      QUERIES.map((q) => braveSearch(q, "pw"))
    );
    flat = [...flat, ...widerResults.flat()];
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = flat.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(
    `Found ${flat.length} articles, deduped to ${deduped.length}`
  );

  return deduped;
}
