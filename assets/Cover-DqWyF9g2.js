import{t as e}from"./jsx-runtime-BseJUIpC.js";var t=Object.assign({"./posts/attention-is-a-spotlight.md":`---\r
title: Attention Is a Spotlight — Transformers Without the Hand-Waving\r
date: 2026-07-18\r
tags: Deep Learning, Explainer\r
excerpt: An intuition-first walk through self-attention: queries, keys, values, why we divide by √d, and what multi-head attention actually buys you. With a few lines of PyTorch.\r
motif: attention\r
kanji: 注\r
---\r
\r
Almost every model I use day to day (the LLMs behind my coding assistant, the vision models I experiment with) is built on one operation: **self-attention**. Here is the explanation I wish I'd had in my first semester.\r
\r
## The problem attention solves\r
\r
Take the sentence: *"The robot picked up the ball because **it** was light."* To understand "it", a model has to look back and decide which earlier word matters. Recurrent networks squeeze the whole past into a single hidden vector and hope. Attention lets every word **look directly at every other word** and decide how much each one matters.\r
\r
## Queries, keys and values\r
\r
Each token's embedding is projected three ways:\r
\r
- **Query (Q)**: "what am I looking for?"\r
- **Key (K)**: "what do I contain?"\r
- **Value (V)**: "what will I hand over if you pick me?"\r
\r
The match between a query and a key is a dot product. High dot product, strong match. Run softmax across all keys and you get a set of weights that sum to 1: the spotlight. The output for a token is the weighted average of everyone's values.\r
\r
\`\`\`python\r
import torch, math\r
\r
def attention(Q, K, V, mask=None):\r
    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))\r
    if mask is not None:\r
        scores = scores.masked_fill(mask == 0, float('-inf'))\r
    weights = scores.softmax(dim=-1)        # the spotlight\r
    return weights @ V, weights\r
\`\`\`\r
\r
That is the whole core of the operation. Everything else is engineering around it.\r
\r
## Why divide by √d?\r
\r
If query and key vectors have dimension *d* with roughly unit-variance entries, their dot product has variance about *d*. With *d = 64*, scores spread over a large range, and softmax of large numbers saturates: one weight becomes ≈1, the rest ≈0, and gradients vanish. Dividing by √d brings the variance back to about 1, so the spotlight stays soft enough to learn.\r
\r
## Masking\r
\r
For a language model that predicts the next token, a word must not peek at the future. A **causal mask** sets scores for future positions to −∞ before softmax, so their weights become exactly zero. Same operation, different mask, and suddenly you have GPT-style generation.\r
\r
## Multi-head attention\r
\r
One spotlight can only focus on one kind of relationship at a time. **Multi-head attention** runs several smaller attentions in parallel, each with its own Q/K/V projections. In practice heads specialise: one tracks the previous word, one links pronouns to nouns, one follows syntax. Their outputs are concatenated and projected back.\r
\r
## Position\r
\r
Attention by itself is order-blind: shuffle the tokens and the weights shuffle with them. Transformers add **positional information** to embeddings (sinusoidal, learned, or rotary as in many modern LLMs) so "dog bites man" and "man bites dog" stay different.\r
\r
## The block\r
\r
A transformer layer is just:\r
\r
1. multi-head self-attention, plus a residual connection and normalisation,\r
2. a position-wise feed-forward MLP, plus a residual connection and normalisation.\r
\r
Stack a few dozen of those and you have the architecture behind nearly every modern LLM.\r
\r
## The intuition to keep\r
\r
Attention is a **learned, content-based lookup**. Every token asks a question, every token advertises an answer, and the network learns both the questions and the advertisements. Once that clicks, papers stop looking like walls of notation and start looking like variations on one good idea.\r
`,"./posts/databases-that-sleep.md":`---\r
title: Databases That Sleep — Serverless SQLite with Hibernation\r
date: 2026-09-27\r
tags: Systems, Databases\r
excerpt: Building CloudForge taught me that the cheapest database is one that isn't running. A look at per-tenant SQLite, hibernating idle databases, and waking them fast enough that nobody notices.\r
motif: db\r
kanji: 眠\r
---\r
\r
When you build a Backend-as-a-Service on a student budget, the main enemy isn't scale. It's **idle cost**. Most projects created on a BaaS are touched for a weekend and then forgotten. If each one keeps a database process warm forever, you pay for a graveyard.\r
\r
CloudForge's answer is simple: **databases sleep when nobody is using them.**\r
\r
## Why SQLite\r
\r
A per-tenant Postgres is heavy: a process, memory, connections. A per-tenant **SQLite** database is *a file*. That changes the economics completely:\r
\r
- Creating a database is creating a file.\r
- An idle database costs disk space and nothing else.\r
- Backups are file copies. Moving a tenant is moving a file.\r
\r
SQLite's limits (one writer at a time, single node) are fine for the long tail of small projects a BaaS mostly serves.\r
\r
## The hibernation lifecycle\r
\r
Each tenant database is in one of three states:\r
\r
\`\`\`text\r
 ┌──────────┐  request   ┌──────────┐  idle > T   ┌────────────┐\r
 │ SLEEPING │ ─────────▶ │  WARM    │ ──────────▶ │ HIBERNATING│\r
 └──────────┘            └──────────┘             └────────────┘\r
      ▲                       │ request resets T        │\r
      └───────────────────────┴──── flush + close ◀─────┘\r
\`\`\`\r
\r
- **Warm**: the connection is open, pages are cached, queries are fast.\r
- **Hibernating**: after an idle timeout, the server checkpoints the WAL, closes the handle and frees memory.\r
- **Sleeping**: just a file on disk.\r
\r
The first request to a sleeping database opens it again. With SQLite that is a file open and a small header read, so it takes milliseconds, not the seconds a cold container needs.\r
\r
## Keeping the wake-up honest\r
\r
The danger with "lazy" anything is the thundering herd: a hundred requests hit a sleeping database at once and each tries to open it. The fix is a per-tenant open lock, so the first caller opens and everyone else awaits the same future.\r
\r
\`\`\`python\r
async def get_db(tenant_id: str):\r
    db = warm.get(tenant_id)\r
    if db:\r
        db.touch()\r
        return db\r
    async with open_locks[tenant_id]:          # one opener per tenant\r
        db = warm.get(tenant_id) or await open_sqlite(tenant_id)\r
        warm[tenant_id] = db\r
        return db\r
\`\`\`\r
\r
A background sweeper walks the warm set and hibernates anything idle past the threshold.\r
\r
## The storage bridge\r
\r
Files have to live somewhere durable. CloudForge's storage daemon, **CFDrive**, is written in Rust and bridges plain HTTP requests to an encrypted remote storage channel. Rust earned its place here for one reason: this daemon sits on the hot path of every file operation, and I wanted predictable memory use with no garbage-collector pauses while streaming large objects.\r
\r
## Guard rails around a multi-tenant system\r
\r
Putting many tenants on one machine means one noisy tenant can hurt everyone, so the API layer has:\r
\r
- **RBAC**: keys are scoped to a project and a role, checked on every request.\r
- **Rate-limiting middleware** per key, so a runaway script gets throttled, not the server.\r
- **Docker Compose** separation between the API, the storage daemon and the dashboard, so a crash in one doesn't take down the others.\r
\r
## Lessons\r
\r
1. **The best scaling strategy for the long tail is to make idle free.**\r
2. **Lazy initialisation needs a lock**, or it becomes a stampede.\r
3. **Pick boring storage formats.** "It's just a file" turned out to be CloudForge's best feature.\r
`,"./posts/growing-a-3d-bust-with-neural-cellular-automata.md":`---\r
title: Growing a 3D Bust of Myself with Neural Cellular Automata\r
date: 2026-11-08\r
tags: Deep Learning, PyTorch, WebGL\r
excerpt: A tiny neural network that runs inside every voxel, learns to grow a sculpture from a single seed, and repairs it when you break it. Trained in PyTorch, running in a Web Worker.\r
motif: cells\r
kanji: 育\r
---\r
\r
Most neural networks you meet are big, centralised and one-shot: an input goes in, an answer comes out. A **Neural Cellular Automaton (NCA)** is the opposite. It is a *tiny* network that every cell in a grid runs on its own, again and again, looking only at its neighbours. Nothing coordinates the cells. And yet, after training, they agree on a shape and build it.\r
\r
On the original version of this portfolio there is a voxel bust of me that grows out of a single cell, and regrows if you damage it. This post is how that works.\r
\r
## The idea in one paragraph\r
\r
Each voxel holds a small state vector. Every step, a voxel looks at itself and at the *gradients* of its 3×3×3 neighbourhood, feeds that through a two-layer MLP, and adds the output to its own state. That is the entire "physics" of the world. Training adjusts the MLP's weights so that, after a few dozen steps starting from one seed, the grid's colour channels match a target shape.\r
\r
This follows Mordvintsev et al.'s 2020 Distill article *Growing Neural Cellular Automata*, extended from 2D images to 3D voxels.\r
\r
## The state of a cell\r
\r
My model uses **12 channels per voxel**:\r
\r
- 4 visible channels: RGBA. Alpha doubles as "how alive am I".\r
- 8 hidden channels the network invents its own meaning for, like chemical signals in a real tissue.\r
\r
The grid for the bust is \`28 × 34 × 16\` voxels, and the target occupies 2,524 of them. The target itself comes from a depth map of my portrait: brighter pixels are closer to the camera, so they get extruded further forward.\r
\r
\`\`\`python\r
C = 12          # channels: RGBA + 8 hidden\r
HID = 64        # MLP hidden units\r
\`\`\`\r
\r
## Perception: Sobel filters, not learned convolutions\r
\r
A cell needs to sense which way the "tissue" around it is growing. Instead of learning that, I give it fixed **3D Sobel kernels** for x, y and z, plus an identity kernel. That makes the perception vector \`4 × C = 48\` numbers per cell.\r
\r
Fixed filters are a quiet but important choice. They make the rule *rotation-aware* by construction and leave the MLP's tiny budget for actual decisions.\r
\r
## The update rule\r
\r
\`\`\`python\r
def step(state):\r
    pre_alive = maxpool3d(state[:, 3:4], 3) > 0.1\r
    p = perceive(state)                   # identity + sobel x/y/z\r
    dx = mlp(p)                           # 4C -> 64 (ReLU) -> C\r
    fire = rand_like(dx[:, :1]) < 0.5     # stochastic update\r
    state = state + dx * fire\r
    post_alive = maxpool3d(state[:, 3:4], 3) > 0.1\r
    return state * (pre_alive & post_alive)\r
\`\`\`\r
\r
Three details do most of the work:\r
\r
1. **Stochastic updates.** Each cell only fires with probability 0.5 per step. No global clock exists, so the rule has to be robust to cells being out of sync, just like real cells.\r
2. **The life mask.** A cell is allowed to exist only if something in its 3×3×3 neighbourhood has alpha above 0.1, both before *and* after the update. Growth has to spread from the seed; nothing can appear out of thin air.\r
3. **The final layer starts at zero.** At initialisation the network does nothing, and training slowly teaches it to do something useful.\r
\r
## Making the shape stable: pools and damage\r
\r
If you only train "grow for N steps and match the target", the model learns to hit the target *at step N* and then happily explodes at step N+20. Two tricks fix that:\r
\r
- **Sample pool.** Keep a pool of states produced by previous training runs and start new batches from them. The model is forced to treat "already grown" as a valid starting point and keep it that way. The target becomes an *attractor*.\r
- **Damage.** Randomly carve holes out of some pool samples before training on them. The network learns regeneration as a side effect, and that's why you can break the bust and watch it heal.\r
\r
## Running it in the browser\r
\r
The trained weights export to a flat \`weights.bin\` plus a small \`meta.json\` that records \`C\`, \`HID\`, the grid size and the seed position. In the browser, inference runs in a **Web Worker** so the main thread stays free for scrolling and WebGL.\r
\r
The worker mirrors the PyTorch step exactly, with one optimisation: it only computes cells inside the pre-alive region, because the mask zeroes everything else anyway. Early in the growth that is a handful of voxels, so the first frames are almost free.\r
\r
\`\`\`js\r
// Sobel kernels for x/y/z built once, normalised by 32\r
const s = [1, 2, 1], d = [-1, 0, 1];\r
KX[k] = (s[dz] * s[dy] * d[dx]) / 32;\r
\`\`\`\r
\r
## What I took away\r
\r
- **Small models can show surprising emergent behaviour** if the update rule is local and the training objective rewards stability, not just accuracy.\r
- **Constraints are features.** The life mask and stochastic firing look like handicaps. They are exactly what makes the result robust.\r
- **Mirror training and inference exactly.** Most of my debugging time went into tiny mismatches between the PyTorch reference and the JS port: padding mode, kernel normalisation, the order of masking.\r
\r
Next, I want to try conditioning a single model on a "which shape" signal, so one network can grow a bust, a brain or a chip on demand instead of shipping one model per shape.\r
`,"./posts/one-gateway-seventeen-llms.md":`---\r
title: One Gateway, Seventeen LLMs — Designing a Privacy-First AI Coding Assistant\r
date: 2026-10-21\r
tags: LLMs, Systems\r
excerpt: What I learned building Octrops Code, a VS Code extension that talks to 17+ model providers directly from your machine, with no middleman server, no telemetry, and graceful rate-limit handling.\r
motif: gateway\r
kanji: 門\r
---\r
\r
Every AI coding assistant has to answer one question before anything else: **where does your code go?** For most tools the answer is "to our server, then to a model provider". With Octrops Code I wanted the answer to be "straight from your editor to the provider *you* chose, and nowhere else."\r
\r
That one constraint shaped the whole architecture.\r
\r
## Constraint first: no server in the middle\r
\r
A serverless, local-first extension means:\r
\r
- API keys live in the editor's secret storage, not in a backend database.\r
- Requests go from the extension host process directly to the provider.\r
- There is no telemetry endpoint to "accidentally" log a prompt.\r
\r
It also means every problem a backend would normally absorb (rate limits, provider outages, inconsistent APIs) now has to be solved **inside the client**.\r
\r
## The adapter layer\r
\r
Seventeen-plus providers do not speak one language. Some follow the OpenAI chat-completions shape, some don't. Streaming formats differ. Error codes differ. Gemini, Groq, OpenRouter and NVIDIA NIM each have their own personality.\r
\r
The fix is boring and effective: a single internal message format, and a thin adapter per provider.\r
\r
\`\`\`ts\r
interface ChatRequest {\r
  model: string;\r
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];\r
  stream: boolean;\r
}\r
\r
interface ProviderAdapter {\r
  id: string;\r
  send(req: ChatRequest, key: string): AsyncIterable<string>; // yields text deltas\r
  isRateLimit(err: unknown): boolean;\r
}\r
\`\`\`\r
\r
Everything above the adapter (the sidebar chat, inline refactors, the diff previewer) only ever sees \`AsyncIterable<string>\`. Adding a provider means writing one adapter, not touching the UI.\r
\r
## Rate limits are a feature, not an error\r
\r
Free and low-tier keys hit limits constantly. If the extension surfaces each \`429\` as an error, it feels broken. So the gateway treats rate limits as **routing information**:\r
\r
1. Each key has a cooldown timestamp.\r
2. A \`429\` puts that key on cooldown (respecting \`Retry-After\` when present).\r
3. The request is retried on the next healthy key for the same provider.\r
4. If every key is cooling down, the user sees *one* clear message with the time until the earliest key is back.\r
\r
\`\`\`ts\r
function pickKey(keys: KeyState[], now = Date.now()) {\r
  const ready = keys.filter((k) => k.cooldownUntil <= now);\r
  return ready.sort((a, b) => a.lastUsed - b.lastUsed)[0]; // least recently used\r
}\r
\`\`\`\r
\r
Least-recently-used rotation spreads load evenly, so one key doesn't burn out while others sit idle.\r
\r
## Context is the product\r
\r
A model is only as good as what you show it. For multi-file generation the extension indexes the workspace and retrieves relevant chunks for each request. The practical lessons:\r
\r
- **Chunk on syntax, not on character counts.** Splitting in the middle of a function produces garbage context.\r
- **Always include the file the cursor is in**, even if retrieval didn't rank it highly.\r
- **Budget tokens explicitly.** Reserve room for the answer first, then fill the remaining context window by relevance.\r
\r
## Streaming UX\r
\r
Streaming isn't only about speed. It changes how trust feels. When the explanation appears token by token, the user can stop a wrong answer early. For edits, I never apply changes directly. The model's output goes into a **diff preview** the user accepts or rejects. An assistant that edits silently is an assistant you stop trusting after the first bad edit.\r
\r
## What I'd tell someone building one\r
\r
- Pick your **privacy story first**. It decides where every other piece can live.\r
- **Normalise early.** One internal request/response shape saves you from N×M complexity.\r
- Treat **failure as a normal state**: cooldowns, fallbacks, partial streams.\r
- **Never mutate code without a preview.**\r
\r
The extension is open source on my GitHub as \`destopian-octrops\` if you want to read the real adapters.\r
`,"./posts/scroll-is-a-timeline.md":`---\r
title: Scroll Is a Timeline — Motion Design Principles for Engineers\r
date: 2026-08-12\r
tags: Frontend, Motion Design\r
excerpt: The scroll bar is a playhead. Here is how I think about choreographing pages like this one with GSAP, ScrollTrigger and Lenis, without making them heavy, janky or annoying.\r
motif: motion\r
kanji: 動\r
---\r
\r
The moment it clicked for me: **a scroll bar is a playhead.** Once you see the page as a timeline the user scrubs, motion design stops being "add some fades" and becomes choreography. This site is built on that idea, and here are the principles behind it.\r
\r
## 1. Decide what is scrubbed and what is triggered\r
\r
There are two kinds of scroll animation, and mixing them up is the most common source of "this feels weird".\r
\r
- **Scrubbed**: the animation's progress *is* the scroll position. Scroll back and it rewinds. Use it for spatial things: parallax, pinned horizontal tracks, the 3D camera flying through the torii gates behind this text.\r
- **Triggered**: crossing a threshold *plays* an animation over a fixed duration. Use it for reveals: headings, cards, counters.\r
\r
\`\`\`js\r
// scrubbed: progress follows scroll\r
gsap.to('.track', { x: -2000, ease: 'none',\r
  scrollTrigger: { trigger: '.journey', pin: true, scrub: 0.4, end: '+=2000' } });\r
\r
// triggered: plays once the heading enters\r
gsap.from(split.chars, { yPercent: 110, stagger: 0.02, ease: 'expo.out',\r
  scrollTrigger: { trigger: heading, start: 'top 85%' } });\r
\`\`\`\r
\r
Rule of thumb: if it *moves through space*, scrub it. If it *appears*, trigger it.\r
\r
## 2. Use \`ease: 'none'\` when scrubbing\r
\r
When the scroll is the clock, the user's hand already provides the easing. Adding \`power3.inOut\` on top makes the motion feel rubbery and disconnected from the wheel. Smoothness belongs to the scroll itself, which is what Lenis is for.\r
\r
## 3. One clock\r
\r
Lenis smooths the scroll; GSAP drives animation. If they run on different \`requestAnimationFrame\` loops they drift, and you get a one-frame shimmer on pinned sections. Drive Lenis from GSAP's ticker so there is exactly one heartbeat:\r
\r
\`\`\`js\r
const lenis = new Lenis();\r
lenis.on('scroll', ScrollTrigger.update);\r
gsap.ticker.add((t) => lenis.raf(t * 1000));\r
gsap.ticker.lagSmoothing(0);\r
\`\`\`\r
\r
## 4. Animate transforms and opacity, almost nothing else\r
\r
Transforms and opacity can be composited on the GPU. Animating \`top\`, \`width\` or \`box-shadow\` forces layout or paint on every frame. My exceptions are deliberate and small: \`clip-path\` for the manga-panel wipes, and CSS variables that drive a transform.\r
\r
## 5. Stagger tells the eye where to read\r
\r
A heading revealing character by character from left to right *reads* left to right. A grid of cards that staggers from the top-left tells the eye where the list starts. Stagger is a reading-order tool, not decoration. Keep each step short (15–30 ms per character, 60–100 ms per card), or the page feels like it's loading.\r
\r
## 6. Velocity is a free signal\r
\r
Scroll velocity is information about *intent*. Someone flicking fast wants to get somewhere, so this site responds: the speed lines flare, the 3D camera's field of view widens, the marquee speeds up. Someone scrolling slowly is reading, so everything calms down. It costs one number per frame and makes the page feel alive.\r
\r
## 7. Respect \`prefers-reduced-motion\`\r
\r
Every timeline on this site checks \`prefers-reduced-motion\`. When it's set, content simply appears: no pinning, no scrubbing, no parallax. Motion should be an enhancement to content that already works without it.\r
\r
## 8. Refresh after layout changes\r
\r
ScrollTrigger measures positions once. Web fonts loading, images arriving, a section above changing height: each one silently breaks your start and end points. Call \`ScrollTrigger.refresh()\` after \`document.fonts.ready\` and image loads, and use function-based values with \`invalidateOnRefresh: true\` for anything that depends on size.\r
\r
---\r
\r
Good motion is invisible in the best way: people don't say "nice animations", they say "this feels good to scroll". That's the target.\r
`,"./posts/yolo-on-the-edge.md":`---\r
title: YOLO on the Edge — Shipping Computer Vision Where the Road Is\r
date: 2026-09-02\r
tags: Computer Vision, Edge AI\r
excerpt: Notes from RoadGuard AI on running real-time object detection on modest hardware, what quantisation buys you, and why a detection is useless without a good GPS fix.\r
motif: vision\r
kanji: 視\r
---\r
\r
Detecting potholes in a curated dataset is a weekend project. Detecting them **from a moving vehicle, on cheap hardware, and putting them on a map someone can act on** is an engineering problem. RoadGuard AI was my attempt at the second one.\r
\r
## The pipeline\r
\r
\`\`\`text\r
camera ─▶ frame sampler ─▶ YOLOv8 detector ─▶ tracker/dedup ─▶ GPS tag ─▶ sync to map\r
\`\`\`\r
\r
Each stage exists because the previous one is noisy.\r
\r
## Choosing the model size\r
\r
YOLOv8 comes in sizes from *nano* to *x-large*. On the edge, the question isn't "which is most accurate" but **"which is accurate enough at the frame rate I need"**. A vehicle at 40 km/h covers about 11 metres per second. If your detector runs at 2 FPS, a pothole is visible for maybe two or three frames. That's enough, *if* the model is confident on those frames.\r
\r
My rule of thumb:\r
\r
- Start with the smallest model and measure **recall on your own footage**, not on the benchmark.\r
- Move up a size only when the misses are clearly model capacity, not bad data.\r
\r
Most of my early "the model is bad" moments were actually "my training data has no wet roads or night footage".\r
\r
## Quantisation: the free lunch that isn't quite free\r
\r
Exporting to ONNX and quantising weights from FP32 to INT8 cuts model size about 4× and speeds up CPU inference substantially. The price is a small accuracy drop, usually on the hardest examples: small, low-contrast defects.\r
\r
Two practices kept that price low:\r
\r
1. **Calibrate with representative frames.** Post-training quantisation picks activation ranges from calibration data. Calibrate on clean daytime images and your night accuracy collapses.\r
2. **Compare per-class, not overall.** A 1% overall drop can hide a 10% drop on the one class you care about.\r
\r
## From boxes to events\r
\r
A detector outputs boxes per frame. A road authority needs *one record per pothole*. The same defect appears in several consecutive frames, so the system:\r
\r
- associates boxes across frames by position and overlap,\r
- keeps the **highest-confidence** observation as the representative,\r
- emits a single event once the track ends.\r
\r
Without this step, the map fills with duplicate pins and nobody trusts it.\r
\r
## GPS is half the product\r
\r
A perfect detection with a bad location is worthless. Phone and module GPS can wander several metres, especially near buildings. Mitigations:\r
\r
- **Timestamp-align** frames and GPS fixes. Don't just grab "the latest fix".\r
- Interpolate between fixes using the frame time.\r
- Store the reported accuracy with each event so downstream tools can filter.\r
\r
Synced events then go to a Google Maps layer and a processing dashboard where defects can be reviewed.\r
\r
## What edge AI really means\r
\r
The model was maybe 30% of the work. The rest was sampling, deduplication, timing and data. If I had to compress it into one line: **on the edge, the system around the model matters more than the model.**\r
`}),n=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),r=e=>e.toLowerCase().replace(/<[^>]+>/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);function i(e){let t=[];return e=e.replace(/`([^`]+)`/g,(e,n)=>(t.push(n),`@@CODE${t.length-1}@@`)),e=n(e).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/(^|[^*])\*(?!\s)(.+?)\*/g,`$1<em>$2</em>`).replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,`<a href="$2" target="_blank" rel="noreferrer">$1</a>`),e.replace(/@@CODE(\d+)@@/g,(e,r)=>`<code>${n(t[+r])}</code>`)}function a(e){let t=e.replace(/\r\n/g,`
`).split(`
`),a=[],o=[],s=0;for(;s<t.length;){let e=t[s];if(!e.trim()){s++;continue}let c=e.match(/^```(\w*)/);if(c){let e=[];for(s++;s<t.length&&!t[s].startsWith("```");)e.push(t[s++]);s++,a.push(`<pre class="md-code" data-lang="${c[1]||`text`}"><code>${n(e.join(`
`))}</code></pre>`);continue}let l=e.match(/^(#{2,4})\s+(.*)$/);if(l){let e=l[1].length,t=i(l[2]),n=r(l[2]);e===2&&o.push({id:n,text:l[2].replace(/[*`]/g,``)}),a.push(`<h${e} id="${n}">${t}</h${e}>`),s++;continue}if(/^---+\s*$/.test(e)){a.push(`<hr />`),s++;continue}if(e.startsWith(`>`)){let e=[];for(;s<t.length&&t[s].startsWith(`>`);)e.push(t[s++].replace(/^>\s?/,``));a.push(`<blockquote><p>${i(e.join(` `))}</p></blockquote>`);continue}let u=/^\s*[-*]\s+/,d=/^\s*\d+\.\s+/;if(u.test(e)||d.test(e)){let n=d.test(e),r=n?d:u,o=[];for(;s<t.length&&r.test(t[s]);){let e=t[s++].replace(r,``);for(;s<t.length&&/^\s{2,}\S/.test(t[s])&&!u.test(t[s])&&!d.test(t[s]);)e+=` `+t[s++].trim();o.push(`<li>${i(e)}</li>`)}a.push(n?`<ol>${o.join(``)}</ol>`:`<ul>${o.join(``)}</ul>`);continue}let f=[];for(;s<t.length&&t[s].trim()&&!/^(```|#{2,4}\s|>|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(t[s]);)f.push(t[s++]);a.push(`<p>${i(f.join(` `))}</p>`)}return{html:a.join(`
`),toc:o}}function o(e,t){let n=t.replace(/\r\n/g,`
`).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/),r={},i=n?n[2]:t;n&&n[1].split(`
`).forEach(e=>{let t=e.indexOf(`:`);t>0&&(r[e.slice(0,t).trim()]=e.slice(t+1).trim())});let a=e.split(`/`).pop().replace(/\.md$/,``),o=i.split(/\s+/).filter(Boolean).length;return{slug:a,title:r.title||a,date:r.date||``,tags:(r.tags||``).split(`,`).map(e=>e.trim()).filter(Boolean),excerpt:r.excerpt||``,motif:r.motif||`cells`,kanji:r.kanji||`書`,minutes:Math.max(1,Math.round(o/220)),body:i}}var s=Object.entries(t).map(([e,t])=>o(e,t)).sort((e,t)=>e.date<t.date?1:-1).map((e,t)=>({...e,seed:11+t*7})),c=Array.from(new Set(s.flatMap(e=>e.tags))).sort(),l=e=>e?new Date(`${e}T00:00:00`).toLocaleDateString(`en-GB`,{day:`2-digit`,month:`short`,year:`numeric`}):``,u=e=>`/blog2/?post=${encodeURIComponent(e)}`,d=e(),f=e=>{let t=e;return()=>(t=t*16807%2147483647,(t-1)/2147483646)};function p({r:e=140,n:t=48}){return(0,d.jsx)(`g`,{className:`cv-burst`,children:Array.from({length:t},(n,r)=>{let i=r/t*Math.PI*2,a=i+.035;return(0,d.jsx)(`polygon`,{points:`0,0 ${Math.cos(i)*e*3},${Math.sin(i)*e*3} ${Math.cos(a)*e*3},${Math.sin(a)*e*3}`},r)})})}var m={cells:e=>(0,d.jsx)(`g`,{transform:`translate(200 150)`,children:Array.from({length:13},(t,n)=>Array.from({length:19},(t,r)=>{let i=r-9,a=n-6,o=Math.hypot(i,a*1.2),s=o<5.2+e()*1.6,c=o<2.2||s&&e()>.86;return(0,d.jsx)(`rect`,{x:i*20-8,y:a*20-8,width:`16`,height:`16`,rx:`2`,className:c?`cv-red`:s?`cv-ink`:`cv-ghost`},`${r}-${n}`)}))}),gateway:e=>(0,d.jsxs)(`g`,{children:[Array.from({length:17},(e,t)=>{let n=20+t*16;return(0,d.jsx)(`path`,{d:`M0 ${n} C 120 ${n}, 150 150, 200 150`,className:t===8?`cv-stroke-red`:`cv-stroke`},t)}),(0,d.jsx)(`path`,{d:`M200 150 L400 150`,className:`cv-stroke-red cv-thick`}),(0,d.jsx)(`rect`,{x:`182`,y:`96`,width:`36`,height:`108`,className:`cv-ink`}),(0,d.jsx)(`rect`,{x:`170`,y:`88`,width:`60`,height:`12`,className:`cv-red`}),Array.from({length:6},(t,n)=>(0,d.jsx)(`circle`,{cx:260+n*24,cy:`150`,r:4+e()*3,className:`cv-paper-dot`},n))]}),db:()=>(0,d.jsxs)(`g`,{transform:`translate(200 160)`,children:[[-1,0,1].map(e=>(0,d.jsxs)(`g`,{transform:`translate(${e*110} ${e===0?-20:10})`,children:[(0,d.jsx)(`path`,{d:`M-40 -40 v80 a40 12 0 0 0 80 0 v-80`,className:e===0?`cv-red`:`cv-ink`}),(0,d.jsx)(`ellipse`,{cx:`0`,cy:`-40`,rx:`40`,ry:`12`,className:`cv-paper`}),(0,d.jsx)(`path`,{d:`M-40 0 a40 12 0 0 0 80 0`,className:`cv-stroke-paper`})]},e)),(0,d.jsx)(`text`,{x:`40`,y:`-80`,className:`cv-sfx`,children:`Z z z`})]}),vision:e=>(0,d.jsxs)(`g`,{children:[(0,d.jsx)(`path`,{d:`M0 300 L170 120 L230 120 L400 300 Z`,className:`cv-ink`}),Array.from({length:6},(e,t)=>(0,d.jsx)(`rect`,{x:196,y:130+t*28,width:8,height:14+t*3,className:`cv-paper`},t)),(0,d.jsx)(`ellipse`,{cx:`250`,cy:`236`,rx:`38`,ry:`12`,className:`cv-red`}),(0,d.jsx)(`rect`,{x:`200`,y:`206`,width:`104`,height:`58`,className:`cv-box`}),(0,d.jsx)(`rect`,{x:`200`,y:`190`,width:`92`,height:`16`,className:`cv-red`}),(0,d.jsxs)(`text`,{x:`205`,y:`202`,className:`cv-label`,children:[`pothole 0.`,Math.floor(80+e()*19)]})]}),motion:()=>(0,d.jsxs)(`g`,{children:[[0,1,2].map(e=>(0,d.jsx)(`path`,{d:`M30 ${250-e*10} C ${160+e*20} ${250-e*10}, ${200-e*30} ${60+e*16}, 370 ${60+e*16}`,className:e===1?`cv-stroke-red cv-thick`:`cv-stroke`},e)),[30,130,230,330].map((e,t)=>(0,d.jsx)(`rect`,{x:e-9,y:276,width:`18`,height:`18`,transform:`rotate(45 ${e} 285)`,className:t===2?`cv-red`:`cv-ink`},e)),(0,d.jsx)(`line`,{x1:`0`,y1:`285`,x2:`400`,y2:`285`,className:`cv-stroke`})]}),attention:()=>{let e=[50,125,200,275,350];return(0,d.jsxs)(`g`,{children:[[[0,2],[1,4],[0,4],[2,3],[3,4],[1,2]].map(([t,n],r)=>(0,d.jsx)(`path`,{d:`M${e[t]} 200 Q ${(e[t]+e[n])/2} ${200-(e[n]-e[t])*.7} ${e[n]} 200`,className:n===4&&t===0?`cv-stroke-red cv-thick`:`cv-stroke`},r)),e.map((e,t)=>(0,d.jsx)(`rect`,{x:e-30,y:200,width:`60`,height:`34`,rx:`17`,className:t===4?`cv-red`:`cv-ink`},e))]})}};function h({motif:e=`cells`,seed:t=7,kanji:n,className:r=``}){let i=f(t),a=m[e]||m.cells;return(0,d.jsxs)(`svg`,{className:`cover ${r}`,viewBox:`0 0 400 300`,preserveAspectRatio:`xMidYMid slice`,"aria-hidden":`true`,children:[(0,d.jsx)(`rect`,{width:`400`,height:`300`,className:`cv-bg`}),(0,d.jsx)(`g`,{transform:`translate(200 150)`,opacity:`0.5`,children:(0,d.jsx)(p,{})}),(0,d.jsx)(`pattern`,{id:`tone-${t}`,width:`7`,height:`7`,patternUnits:`userSpaceOnUse`,children:(0,d.jsx)(`circle`,{cx:`3.5`,cy:`3.5`,r:`1.3`,className:`cv-tone`})}),(0,d.jsx)(`rect`,{width:`400`,height:`300`,fill:`url(#tone-${t})`,opacity:`0.35`}),a(i),n&&(0,d.jsx)(`text`,{x:`384`,y:`58`,textAnchor:`end`,className:`cv-kanji`,children:n}),(0,d.jsx)(`rect`,{width:`400`,height:`300`,className:`cv-frame`})]})}export{u as a,l as i,c as n,a as o,s as r,h as t};