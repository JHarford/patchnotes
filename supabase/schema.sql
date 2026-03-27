-- Patch Notes: Newsletter Database Schema

-- Subscribers
CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  unsubscribe_token uuid DEFAULT gen_random_uuid(),
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_token ON subscribers(unsubscribe_token);

-- Newsletters (drafts and sent)
CREATE TABLE newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_json jsonb,
  header_image_url text,
  status text NOT NULL DEFAULT 'draft',
  sources jsonb DEFAULT '[]',
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Per-recipient send tracking
CREATE TABLE newsletter_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES subscribers(id),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  resend_id text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(newsletter_id, subscriber_id)
);
CREATE INDEX idx_nr_newsletter ON newsletter_recipients(newsletter_id);
CREATE INDEX idx_nr_subscriber ON newsletter_recipients(subscriber_id);

-- Supabase Storage: create a public bucket called "newsletter-images" in the dashboard
