# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
```

## Architecture

**Clovis** is a Medicare member support chatbot ("Ask Clover") for Clover Health, built with Next.js App Router, React 19, TypeScript, Tailwind CSS, and the Anthropic Claude SDK.

### Data Flow

1. User types a message in `ChatInput` → `Chat` calls `POST /api/chat` with message history
2. `/api/chat/route.ts` sends messages + system prompt to `claude-sonnet-4-20250514` (max 1000 tokens)
3. Claude responds with plain text, optionally appending `CHIPS: [option1] | [option2]` for quick-reply suggestions, and escalation trigger phrases
4. `buildBotMessage()` in `src/lib/utils.ts` parses the raw response into a `Message` object with `chips` and `showEscalate` fields
5. `MessageBubble` renders the segmented content, chips, and optional phone CTA

### Key Conventions

**Response format from Claude:** The system prompt instructs Claude to append chips in `CHIPS: [label] | [label]` format at the end of responses. `parseChips()` extracts them; `parseSegments()` renders paragraphs and bullet lists. Bold text uses `**text**` syntax.

**Escalation:** `shouldEscalate()` checks the response text against `ESCALATION_TRIGGERS` in `constants.ts`. When triggered, `MessageBubble` renders a "call us" notice with the `PHONE_NUMBER`.

**Sidebar → Chat communication:** `page.tsx` uses a `chatRef` (forwarded ref on `Chat`) so `Sidebar`'s quick action buttons can call `chatRef.current.sendText(prompt)` to inject messages programmatically.

**Hardcoded member context:** The member persona (Margaret T., CLOV-2847-NJ, PPO Choice, NJ) is defined in `src/lib/constants.ts` and is baked into the system prompt — there is no auth or dynamic member loading.

### Path Alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json`).
