---
title: Databases That Sleep — Serverless SQLite with Hibernation
date: 2026-09-27
tags: Systems, Databases
excerpt: Building CloudForge taught me that the cheapest database is one that isn't running. A look at per-tenant SQLite, hibernating idle databases, and waking them fast enough that nobody notices.
motif: db
kanji: 眠
---

When you build a Backend-as-a-Service on a student budget, the main enemy isn't scale. It's **idle cost**. Most projects created on a BaaS are touched for a weekend and then forgotten. If each one keeps a database process warm forever, you pay for a graveyard.

CloudForge's answer is simple: **databases sleep when nobody is using them.**

## Why SQLite

A per-tenant Postgres is heavy: a process, memory, connections. A per-tenant **SQLite** database is *a file*. That changes the economics completely:

- Creating a database is creating a file.
- An idle database costs disk space and nothing else.
- Backups are file copies. Moving a tenant is moving a file.

SQLite's limits (one writer at a time, single node) are fine for the long tail of small projects a BaaS mostly serves.

## The hibernation lifecycle

Each tenant database is in one of three states:

```text
 ┌──────────┐  request   ┌──────────┐  idle > T   ┌────────────┐
 │ SLEEPING │ ─────────▶ │  WARM    │ ──────────▶ │ HIBERNATING│
 └──────────┘            └──────────┘             └────────────┘
      ▲                       │ request resets T        │
      └───────────────────────┴──── flush + close ◀─────┘
```

- **Warm**: the connection is open, pages are cached, queries are fast.
- **Hibernating**: after an idle timeout, the server checkpoints the WAL, closes the handle and frees memory.
- **Sleeping**: just a file on disk.

The first request to a sleeping database opens it again. With SQLite that is a file open and a small header read, so it takes milliseconds, not the seconds a cold container needs.

## Keeping the wake-up honest

The danger with "lazy" anything is the thundering herd: a hundred requests hit a sleeping database at once and each tries to open it. The fix is a per-tenant open lock, so the first caller opens and everyone else awaits the same future.

```python
async def get_db(tenant_id: str):
    db = warm.get(tenant_id)
    if db:
        db.touch()
        return db
    async with open_locks[tenant_id]:          # one opener per tenant
        db = warm.get(tenant_id) or await open_sqlite(tenant_id)
        warm[tenant_id] = db
        return db
```

A background sweeper walks the warm set and hibernates anything idle past the threshold.

## The storage bridge

Files have to live somewhere durable. CloudForge's storage daemon, **CFDrive**, is written in Rust and bridges plain HTTP requests to an encrypted remote storage channel. Rust earned its place here for one reason: this daemon sits on the hot path of every file operation, and I wanted predictable memory use with no garbage-collector pauses while streaming large objects.

## Guard rails around a multi-tenant system

Putting many tenants on one machine means one noisy tenant can hurt everyone, so the API layer has:

- **RBAC**: keys are scoped to a project and a role, checked on every request.
- **Rate-limiting middleware** per key, so a runaway script gets throttled, not the server.
- **Docker Compose** separation between the API, the storage daemon and the dashboard, so a crash in one doesn't take down the others.

## Lessons

1. **The best scaling strategy for the long tail is to make idle free.**
2. **Lazy initialisation needs a lock**, or it becomes a stampede.
3. **Pick boring storage formats.** "It's just a file" turned out to be CloudForge's best feature.
