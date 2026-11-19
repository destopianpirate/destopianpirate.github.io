---
title: Growing a 3D Bust of Myself with Neural Cellular Automata
date: 2026-11-08
tags: Deep Learning, PyTorch, WebGL
excerpt: A tiny neural network that runs inside every voxel, learns to grow a sculpture from a single seed, and repairs it when you break it. Trained in PyTorch, running in a Web Worker.
motif: cells
kanji: 育
---

Most neural networks you meet are big, centralised and one-shot: an input goes in, an answer comes out. A **Neural Cellular Automaton (NCA)** is the opposite. It is a *tiny* network that every cell in a grid runs on its own, again and again, looking only at its neighbours. Nothing coordinates the cells. And yet, after training, they agree on a shape and build it.

On the original version of this portfolio there is a voxel bust of me that grows out of a single cell, and regrows if you damage it. This post is how that works.

## The idea in one paragraph

Each voxel holds a small state vector. Every step, a voxel looks at itself and at the *gradients* of its 3×3×3 neighbourhood, feeds that through a two-layer MLP, and adds the output to its own state. That is the entire "physics" of the world. Training adjusts the MLP's weights so that, after a few dozen steps starting from one seed, the grid's colour channels match a target shape.

This follows Mordvintsev et al.'s 2020 Distill article *Growing Neural Cellular Automata*, extended from 2D images to 3D voxels.

## The state of a cell

My model uses **12 channels per voxel**:

- 4 visible channels: RGBA. Alpha doubles as "how alive am I".
- 8 hidden channels the network invents its own meaning for, like chemical signals in a real tissue.

The grid for the bust is `28 × 34 × 16` voxels, and the target occupies 2,524 of them. The target itself comes from a depth map of my portrait: brighter pixels are closer to the camera, so they get extruded further forward.

```python
C = 12          # channels: RGBA + 8 hidden
HID = 64        # MLP hidden units
```

## Perception: Sobel filters, not learned convolutions

A cell needs to sense which way the "tissue" around it is growing. Instead of learning that, I give it fixed **3D Sobel kernels** for x, y and z, plus an identity kernel. That makes the perception vector `4 × C = 48` numbers per cell.

Fixed filters are a quiet but important choice. They make the rule *rotation-aware* by construction and leave the MLP's tiny budget for actual decisions.

## The update rule

```python
def step(state):
    pre_alive = maxpool3d(state[:, 3:4], 3) > 0.1
    p = perceive(state)                   # identity + sobel x/y/z
    dx = mlp(p)                           # 4C -> 64 (ReLU) -> C
    fire = rand_like(dx[:, :1]) < 0.5     # stochastic update
    state = state + dx * fire
    post_alive = maxpool3d(state[:, 3:4], 3) > 0.1
    return state * (pre_alive & post_alive)
```

Three details do most of the work:

1. **Stochastic updates.** Each cell only fires with probability 0.5 per step. No global clock exists, so the rule has to be robust to cells being out of sync, just like real cells.
2. **The life mask.** A cell is allowed to exist only if something in its 3×3×3 neighbourhood has alpha above 0.1, both before *and* after the update. Growth has to spread from the seed; nothing can appear out of thin air.
3. **The final layer starts at zero.** At initialisation the network does nothing, and training slowly teaches it to do something useful.

## Making the shape stable: pools and damage

If you only train "grow for N steps and match the target", the model learns to hit the target *at step N* and then happily explodes at step N+20. Two tricks fix that:

- **Sample pool.** Keep a pool of states produced by previous training runs and start new batches from them. The model is forced to treat "already grown" as a valid starting point and keep it that way. The target becomes an *attractor*.
- **Damage.** Randomly carve holes out of some pool samples before training on them. The network learns regeneration as a side effect, and that's why you can break the bust and watch it heal.

## Running it in the browser

The trained weights export to a flat `weights.bin` plus a small `meta.json` that records `C`, `HID`, the grid size and the seed position. In the browser, inference runs in a **Web Worker** so the main thread stays free for scrolling and WebGL.

The worker mirrors the PyTorch step exactly, with one optimisation: it only computes cells inside the pre-alive region, because the mask zeroes everything else anyway. Early in the growth that is a handful of voxels, so the first frames are almost free.

```js
// Sobel kernels for x/y/z built once, normalised by 32
const s = [1, 2, 1], d = [-1, 0, 1];
KX[k] = (s[dz] * s[dy] * d[dx]) / 32;
```

## What I took away

- **Small models can show surprising emergent behaviour** if the update rule is local and the training objective rewards stability, not just accuracy.
- **Constraints are features.** The life mask and stochastic firing look like handicaps. They are exactly what makes the result robust.
- **Mirror training and inference exactly.** Most of my debugging time went into tiny mismatches between the PyTorch reference and the JS port: padding mode, kernel normalisation, the order of masking.

Next, I want to try conditioning a single model on a "which shape" signal, so one network can grow a bust, a brain or a chip on demand instead of shipping one model per shape.
