---
title: One Gateway, Seventeen LLMs — Designing a Privacy-First AI Coding Assistant
date: 2026-10-21
tags: LLMs, Systems
excerpt: What I learned building Octrops Code, a VS Code extension that talks to 17+ model providers directly from your machine, with no middleman server, no telemetry, and graceful rate-limit handling.
motif: gateway
kanji: 門
---

Every AI coding assistant has to answer one question before anything else: **where does your code go?** For most tools the answer is "to our server, then to a model provider". With Octrops Code I wanted the answer to be "straight from your editor to the provider *you* chose, and nowhere else."

That one constraint shaped the whole architecture.

## Constraint first: no server in the middle

A serverless, local-first extension means:

- API keys live in the editor's secret storage, not in a backend database.
- Requests go from the extension host process directly to the provider.
- There is no telemetry endpoint to "accidentally" log a prompt.

It also means every problem a backend would normally absorb (rate limits, provider outages, inconsistent APIs) now has to be solved **inside the client**.

## The adapter layer

Seventeen-plus providers do not speak one language. Some follow the OpenAI chat-completions shape, some don't. Streaming formats differ. Error codes differ. Gemini, Groq, OpenRouter and NVIDIA NIM each have their own personality.

The fix is boring and effective: a single internal message format, and a thin adapter per provider.

```ts
interface ChatRequest {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  stream: boolean;
}

interface ProviderAdapter {
  id: string;
  send(req: ChatRequest, key: string): AsyncIterable<string>; // yields text deltas
  isRateLimit(err: unknown): boolean;
}
```

Everything above the adapter (the sidebar chat, inline refactors, the diff previewer) only ever sees `AsyncIterable<string>`. Adding a provider means writing one adapter, not touching the UI.

## Rate limits are a feature, not an error

Free and low-tier keys hit limits constantly. If the extension surfaces each `429` as an error, it feels broken. So the gateway treats rate limits as **routing information**:

1. Each key has a cooldown timestamp.
2. A `429` puts that key on cooldown (respecting `Retry-After` when present).
3. The request is retried on the next healthy key for the same provider.
4. If every key is cooling down, the user sees *one* clear message with the time until the earliest key is back.

```ts
function pickKey(keys: KeyState[], now = Date.now()) {
  const ready = keys.filter((k) => k.cooldownUntil <= now);
  return ready.sort((a, b) => a.lastUsed - b.lastUsed)[0]; // least recently used
}
```

Least-recently-used rotation spreads load evenly, so one key doesn't burn out while others sit idle.

## Context is the product

A model is only as good as what you show it. For multi-file generation the extension indexes the workspace and retrieves relevant chunks for each request. The practical lessons:

- **Chunk on syntax, not on character counts.** Splitting in the middle of a function produces garbage context.
- **Always include the file the cursor is in**, even if retrieval didn't rank it highly.
- **Budget tokens explicitly.** Reserve room for the answer first, then fill the remaining context window by relevance.

## Streaming UX

Streaming isn't only about speed. It changes how trust feels. When the explanation appears token by token, the user can stop a wrong answer early. For edits, I never apply changes directly. The model's output goes into a **diff preview** the user accepts or rejects. An assistant that edits silently is an assistant you stop trusting after the first bad edit.

## What I'd tell someone building one

- Pick your **privacy story first**. It decides where every other piece can live.
- **Normalise early.** One internal request/response shape saves you from N×M complexity.
- Treat **failure as a normal state**: cooldowns, fallbacks, partial streams.
- **Never mutate code without a preview.**

The extension is open source on my GitHub as `destopian-octrops` if you want to read the real adapters.
