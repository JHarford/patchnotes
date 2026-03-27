export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  age?: string;
}

export interface Article {
  headline: string;
  summary: string;
  source_url: string;
  source_name: string;
}

export interface NewsletterSection {
  heading: string;
  emoji: string;
  image_url?: string;
  articles: Article[];
}

export interface QuickHit {
  text: string;
  source_url: string;
  source_name: string;
}

export interface NewsletterContent {
  title: string;
  date: string;
  intro: string;
  sections: NewsletterSection[];
  quick_hits?: QuickHit[];
  header_image_url?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed" | "bounced";
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface Newsletter {
  id: string;
  title: string;
  subject: string;
  body_html: string;
  body_json: NewsletterContent | null;
  header_image_url: string | null;
  status: "draft" | "sending" | "sent" | "failed";
  sources: string[];
  sent_at: string | null;
  total_recipients: number;
  created_at: string;
  updated_at: string;
}
