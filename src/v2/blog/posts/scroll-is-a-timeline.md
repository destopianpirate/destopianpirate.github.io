---
title: Scroll Is a Timeline — Motion Design Principles for Engineers
date: 2026-08-12
tags: Frontend, Motion Design
excerpt: The scroll bar is a playhead. Here is how I think about choreographing pages like this one with GSAP, ScrollTrigger and Lenis, without making them heavy, janky or annoying.
motif: motion
kanji: 動
---

The moment it clicked for me: **a scroll bar is a playhead.** Once you see the page as a timeline the user scrubs, motion design stops being "add some fades" and becomes choreography. This site is built on that idea, and here are the principles behind it.

## 1. Decide what is scrubbed and what is triggered

There are two kinds of scroll animation, and mixing them up is the most common source of "this feels weird".

- **Scrubbed**: the animation's progress *is* the scroll position. Scroll back and it rewinds. Use it for spatial things: parallax, pinned horizontal tracks, the 3D camera flying through the torii gates behind this text.
- **Triggered**: crossing a threshold *plays* an animation over a fixed duration. Use it for reveals: headings, cards, counters.

```js
// scrubbed: progress follows scroll
gsap.to('.track', { x: -2000, ease: 'none',
  scrollTrigger: { trigger: '.journey', pin: true, scrub: 0.4, end: '+=2000' } });

// triggered: plays once the heading enters
gsap.from(split.chars, { yPercent: 110, stagger: 0.02, ease: 'expo.out',
  scrollTrigger: { trigger: heading, start: 'top 85%' } });
```

Rule of thumb: if it *moves through space*, scrub it. If it *appears*, trigger it.

## 2. Use `ease: 'none'` when scrubbing

When the scroll is the clock, the user's hand already provides the easing. Adding `power3.inOut` on top makes the motion feel rubbery and disconnected from the wheel. Smoothness belongs to the scroll itself, which is what Lenis is for.

## 3. One clock

Lenis smooths the scroll; GSAP drives animation. If they run on different `requestAnimationFrame` loops they drift, and you get a one-frame shimmer on pinned sections. Drive Lenis from GSAP's ticker so there is exactly one heartbeat:

```js
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

## 4. Animate transforms and opacity, almost nothing else

Transforms and opacity can be composited on the GPU. Animating `top`, `width` or `box-shadow` forces layout or paint on every frame. My exceptions are deliberate and small: `clip-path` for the manga-panel wipes, and CSS variables that drive a transform.

## 5. Stagger tells the eye where to read

A heading revealing character by character from left to right *reads* left to right. A grid of cards that staggers from the top-left tells the eye where the list starts. Stagger is a reading-order tool, not decoration. Keep each step short (15–30 ms per character, 60–100 ms per card), or the page feels like it's loading.

## 6. Velocity is a free signal

Scroll velocity is information about *intent*. Someone flicking fast wants to get somewhere, so this site responds: the speed lines flare, the 3D camera's field of view widens, the marquee speeds up. Someone scrolling slowly is reading, so everything calms down. It costs one number per frame and makes the page feel alive.

## 7. Respect `prefers-reduced-motion`

Every timeline on this site checks `prefers-reduced-motion`. When it's set, content simply appears: no pinning, no scrubbing, no parallax. Motion should be an enhancement to content that already works without it.

## 8. Refresh after layout changes

ScrollTrigger measures positions once. Web fonts loading, images arriving, a section above changing height: each one silently breaks your start and end points. Call `ScrollTrigger.refresh()` after `document.fonts.ready` and image loads, and use function-based values with `invalidateOnRefresh: true` for anything that depends on size.

---

Good motion is invisible in the best way: people don't say "nice animations", they say "this feels good to scroll". That's the target.
