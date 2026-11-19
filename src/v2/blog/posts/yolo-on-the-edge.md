---
title: YOLO on the Edge — Shipping Computer Vision Where the Road Is
date: 2026-09-02
tags: Computer Vision, Edge AI
excerpt: Notes from RoadGuard AI on running real-time object detection on modest hardware, what quantisation buys you, and why a detection is useless without a good GPS fix.
motif: vision
kanji: 視
---

Detecting potholes in a curated dataset is a weekend project. Detecting them **from a moving vehicle, on cheap hardware, and putting them on a map someone can act on** is an engineering problem. RoadGuard AI was my attempt at the second one.

## The pipeline

```text
camera ─▶ frame sampler ─▶ YOLOv8 detector ─▶ tracker/dedup ─▶ GPS tag ─▶ sync to map
```

Each stage exists because the previous one is noisy.

## Choosing the model size

YOLOv8 comes in sizes from *nano* to *x-large*. On the edge, the question isn't "which is most accurate" but **"which is accurate enough at the frame rate I need"**. A vehicle at 40 km/h covers about 11 metres per second. If your detector runs at 2 FPS, a pothole is visible for maybe two or three frames. That's enough, *if* the model is confident on those frames.

My rule of thumb:

- Start with the smallest model and measure **recall on your own footage**, not on the benchmark.
- Move up a size only when the misses are clearly model capacity, not bad data.

Most of my early "the model is bad" moments were actually "my training data has no wet roads or night footage".

## Quantisation: the free lunch that isn't quite free

Exporting to ONNX and quantising weights from FP32 to INT8 cuts model size about 4× and speeds up CPU inference substantially. The price is a small accuracy drop, usually on the hardest examples: small, low-contrast defects.

Two practices kept that price low:

1. **Calibrate with representative frames.** Post-training quantisation picks activation ranges from calibration data. Calibrate on clean daytime images and your night accuracy collapses.
2. **Compare per-class, not overall.** A 1% overall drop can hide a 10% drop on the one class you care about.

## From boxes to events

A detector outputs boxes per frame. A road authority needs *one record per pothole*. The same defect appears in several consecutive frames, so the system:

- associates boxes across frames by position and overlap,
- keeps the **highest-confidence** observation as the representative,
- emits a single event once the track ends.

Without this step, the map fills with duplicate pins and nobody trusts it.

## GPS is half the product

A perfect detection with a bad location is worthless. Phone and module GPS can wander several metres, especially near buildings. Mitigations:

- **Timestamp-align** frames and GPS fixes. Don't just grab "the latest fix".
- Interpolate between fixes using the frame time.
- Store the reported accuracy with each event so downstream tools can filter.

Synced events then go to a Google Maps layer and a processing dashboard where defects can be reviewed.

## What edge AI really means

The model was maybe 30% of the work. The rest was sampling, deduplication, timing and data. If I had to compress it into one line: **on the edge, the system around the model matters more than the model.**
