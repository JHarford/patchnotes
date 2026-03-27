# CLAUDE.md

## Project

**Patch Notes** — Daily video game industry newsletter. Searches the web, compiles with Claude, generates images with Nano Banana (Gemini), sends via Resend.

## Build Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run generate     # Run newsletter generation pipeline
npm run preview      # Open newsletter draft in browser
npm run send         # Send a newsletter draft
```

## Architecture

Next.js 16 + TypeScript + Tailwind v4. Supabase for data + image storage.

### Key Files

- `src/lib/pipeline.ts` — Orchestrates: search → compile → images → render → save draft
- `src/lib/search.ts` — Brave Search API wrapper (parallel game industry queries)
- `src/lib/claude.ts` — Claude API content compilation into NewsletterContent JSON
- `src/lib/gemini.ts` — Nano Banana image generation + Supabase Storage upload
- `src/lib/resend.ts` — Email sending with List-Unsubscribe headers
- `src/emails/Newsletter.tsx` — React Email responsive template
- `scripts/generate.ts` — CLI: full pipeline, saves draft to Supabase
- `scripts/send.ts` — CLI: sends a reviewed draft to all subscribers
- `scripts/preview.ts` — CLI: opens draft preview in browser

### CLI Workflow

```bash
npx tsx scripts/generate.ts          # search → compile → images → draft
npx tsx scripts/preview.ts <id>      # open in browser
npx tsx scripts/send.ts <id>         # confirm & send
```

### Path Alias

`@/*` imports from `src/`
