import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { NewsletterContent } from "../lib/types";

interface NewsletterEmailProps {
  content: NewsletterContent;
  unsubscribeUrl: string;
  subscribeUrl: string;
}

export default function NewsletterEmail({
  content,
  unsubscribeUrl,
  subscribeUrl,
}: NewsletterEmailProps) {
  return (
    <Html>
      <Head>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}
        </style>
      </Head>
      <Preview>{content.intro.slice(0, 140)}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Subscribe banner for forwarded recipients */}
          <Section style={subscribeBanner}>
            <Text style={subscribeBannerText}>
              Got this from a friend?{" "}
              <Link href={subscribeUrl} style={subscribeBannerLink}>
                Subscribe here
              </Link>{" "}
              to get Patch Note in your inbox.
            </Text>
          </Section>

          {/* Logo bar */}
          <Section style={logoBar}>
            <Text style={logoText}>PATCH NOTE</Text>
          </Section>

          <Section style={headerSection}>
            <Text style={date}>{content.date}</Text>
          </Section>

          <Section style={introSection}>
            <Text style={intro}>{content.intro}</Text>
          </Section>

          <Hr style={divider} />

          {content.sections
            .filter((section) => section.articles.some((a) => a.include !== false))
            .map((section, si, filteredSections) => (
            <Section key={si} style={sectionBlock}>
              <Heading as="h2" style={sectionHeading}>
                {section.emoji} {section.heading}
              </Heading>

              {section.articles
                .filter((a) => a.include !== false)
                .map((article, ai) => (
                <Section key={ai} style={articleBlock}>
                  <Text style={articleHeadline}>{article.headline}</Text>
                  <Text style={articleSummary}>{article.summary}</Text>
                  <Text style={articleSource}>
                    <Link href={article.source_url} style={sourceLink}>
                      {article.source_name} &rarr;
                    </Link>
                  </Text>
                </Section>
              ))}

              {si < filteredSections.length - 1 && <Hr style={divider} />}
            </Section>
          ))}

          {content.quick_hits && content.quick_hits.filter((h) => h.include !== false).length > 0 && (
            <>
              <Hr style={divider} />
              <Section style={sectionBlock}>
                <Heading as="h2" style={sectionHeading}>
                  ⚡ Quick Hits
                </Heading>
                {content.quick_hits
                  .filter((h) => h.include !== false)
                  .map((hit, hi) => (
                  <Text key={hi} style={quickHitLine}>
                    &bull;&nbsp;{hit.text}{" "}
                    <Link href={hit.source_url} style={quickHitSource}>
                      [{hit.source_name}]
                    </Link>
                  </Text>
                ))}
              </Section>
            </>
          )}

          <Hr style={divider} />

          <Section style={forwardSection}>
            <Text style={forwardText}>
              Know someone in game dev?{" "}
              Forward this email — they can{" "}
              <Link href={subscribeUrl} style={forwardLink}>
                subscribe here
              </Link>.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerLogo}>PATCH NOTE</Text>
            <Text style={footerText}>
              AI-powered research. Human-curated editorial.
            </Text>
            <Text style={footerText}>
              You received this because you subscribed to Patch Note.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={unsubLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---- Light theme styles ----

const body = {
  backgroundColor: "#f4f4f7",
  fontFamily: "system-ui, -apple-system, sans-serif",
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
  border: "1px solid #e5e5ea",
};

const subscribeBanner = {
  backgroundColor: "#eef2ff",
  padding: "10px 24px",
  textAlign: "center" as const,
};

const subscribeBannerText = {
  color: "#6366f1",
  fontSize: "12px",
  margin: "0",
};

const subscribeBannerLink = {
  color: "#4f46e5",
  fontWeight: "700" as const,
  textDecoration: "underline",
};

const logoBar = {
  backgroundColor: "#1a1a2e",
  padding: "20px 24px",
  textAlign: "center" as const,
};

const logoText = {
  fontFamily: "'Press Start 2P', monospace",
  color: "#818cf8",
  fontSize: "18px",
  letterSpacing: "4px",
  margin: "0",
};

const headerSection = {
  padding: "24px 24px 12px",
};

const date = {
  color: "#888898",
  fontSize: "13px",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const introSection = {
  padding: "0 24px",
};

const intro = {
  color: "#3a3a4a",
  fontSize: "15px",
  lineHeight: "1.7",
};

const divider = {
  borderColor: "#e5e5ea",
  margin: "24px",
};

const sectionBlock = {
  padding: "0 24px",
};

const sectionHeading = {
  color: "#1a1a2e",
  fontSize: "18px",
  fontWeight: "600" as const,
  margin: "0 0 16px",
  borderBottom: "2px solid #6366f1",
  paddingBottom: "8px",
};

const articleBlock = {
  marginBottom: "24px",
};

const articleHeadline = {
  color: "#1a1a2e",
  fontSize: "15px",
  fontWeight: "600" as const,
  margin: "0 0 6px",
  lineHeight: "1.4",
};

const articleSummary = {
  color: "#555566",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 6px",
};

const articleSource = {
  margin: "0",
};

const sourceLink = {
  color: "#6366f1",
  fontSize: "12px",
  textDecoration: "none",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const quickHitLine = {
  color: "#3a3a4a",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const quickHitSource = {
  color: "#6366f1",
  fontSize: "11px",
  textDecoration: "none",
};

const forwardSection = {
  padding: "0 24px",
  textAlign: "center" as const,
};

const forwardText = {
  color: "#888898",
  fontSize: "13px",
  margin: "0",
};

const forwardLink = {
  color: "#6366f1",
  textDecoration: "underline",
};

const footer = {
  padding: "16px 24px 32px",
  textAlign: "center" as const,
};

const footerLogo = {
  fontFamily: "'Press Start 2P', monospace",
  color: "#d4d4dc",
  fontSize: "10px",
  letterSpacing: "3px",
  margin: "0 0 12px",
};

const footerText = {
  color: "#888898",
  fontSize: "11px",
  margin: "0 0 8px",
};

const unsubLink = {
  color: "#888898",
  textDecoration: "underline",
};
