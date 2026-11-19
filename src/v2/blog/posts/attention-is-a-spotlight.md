---
title: Attention Is a Spotlight — Transformers Without the Hand-Waving
date: 2026-07-18
tags: Deep Learning, Explainer
excerpt: An intuition-first walk through self-attention: queries, keys, values, why we divide by √d, and what multi-head attention actually buys you. With a few lines of PyTorch.
motif: attention
kanji: 注
---

Almost every model I use day to day (the LLMs behind my coding assistant, the vision models I experiment with) is built on one operation: **self-attention**. Here is the explanation I wish I'd had in my first semester.

## The problem attention solves

Take the sentence: *"The robot picked up the ball because **it** was light."* To understand "it", a model has to look back and decide which earlier word matters. Recurrent networks squeeze the whole past into a single hidden vector and hope. Attention lets every word **look directly at every other word** and decide how much each one matters.

## Queries, keys and values

Each token's embedding is projected three ways:

- **Query (Q)**: "what am I looking for?"
- **Key (K)**: "what do I contain?"
- **Value (V)**: "what will I hand over if you pick me?"

The match between a query and a key is a dot product. High dot product, strong match. Run softmax across all keys and you get a set of weights that sum to 1: the spotlight. The output for a token is the weighted average of everyone's values.

```python
import torch, math

def attention(Q, K, V, mask=None):
    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    weights = scores.softmax(dim=-1)        # the spotlight
    return weights @ V, weights
```

That is the whole core of the operation. Everything else is engineering around it.

## Why divide by √d?

If query and key vectors have dimension *d* with roughly unit-variance entries, their dot product has variance about *d*. With *d = 64*, scores spread over a large range, and softmax of large numbers saturates: one weight becomes ≈1, the rest ≈0, and gradients vanish. Dividing by √d brings the variance back to about 1, so the spotlight stays soft enough to learn.

## Masking

For a language model that predicts the next token, a word must not peek at the future. A **causal mask** sets scores for future positions to −∞ before softmax, so their weights become exactly zero. Same operation, different mask, and suddenly you have GPT-style generation.

## Multi-head attention

One spotlight can only focus on one kind of relationship at a time. **Multi-head attention** runs several smaller attentions in parallel, each with its own Q/K/V projections. In practice heads specialise: one tracks the previous word, one links pronouns to nouns, one follows syntax. Their outputs are concatenated and projected back.

## Position

Attention by itself is order-blind: shuffle the tokens and the weights shuffle with them. Transformers add **positional information** to embeddings (sinusoidal, learned, or rotary as in many modern LLMs) so "dog bites man" and "man bites dog" stay different.

## The block

A transformer layer is just:

1. multi-head self-attention, plus a residual connection and normalisation,
2. a position-wise feed-forward MLP, plus a residual connection and normalisation.

Stack a few dozen of those and you have the architecture behind nearly every modern LLM.

## The intuition to keep

Attention is a **learned, content-based lookup**. Every token asks a question, every token advertises an answer, and the network learns both the questions and the advertisements. Once that clicks, papers stop looking like walls of notation and start looking like variations on one good idea.
