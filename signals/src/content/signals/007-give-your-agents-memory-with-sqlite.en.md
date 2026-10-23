---
number: 7
lang: en
slug: give-your-agents-memory-with-sqlite
title: "Give your agents memory with a single SQLite file"
deck: "Full-text search with FTS5, no GPU, no external services. The pattern I use in Jezero, step by step."
topic: tutorial
cover: strata
coverCaption: "Cover generated from signal 007: the strata of Jezero crater."
publishedAt: 2026-10-21
tags: ["SQLite", "Agents", "MCP", "Python"]
draft: true
---

Your agents forget. Every session starts from zero: what we decided yesterday, the command that finally worked, the exact error we fixed last week. And you end up repeating context, like explaining the same thing to a new teammate every morning.

The temptation is to set up a vector database, an embeddings service and a GPU. For a team’s working memory, you almost never need them. Start with something smaller: **a single SQLite file with full-text search**.

## Why full-text search and not embeddings

What you look up most in an agent’s memory is exact: an error message, a file name, a flag, a decision in its own words. That is where lexical search wins. It finds the literal match in milliseconds, and you can explain why it found it.

`FTS5` is the full-text search extension that ships with SQLite. It ranks by relevance with `bm25`, highlights the matching fragments and needs no server at all.

> [!TIP]
> Start with FTS5. Add embeddings only when you have real queries that fail because of synonyms, not before.

## One virtual table, four columns

Memory lives in a virtual table. Only what you search is indexed; the source and the date go in unindexed columns.

```sql title="schema.sql"
CREATE VIRTUAL TABLE atoms USING fts5(
  kind,               -- decision, error, fix, command
  body,
  source UNINDEXED,   -- which agent wrote it
  created_at UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2'
);
```

The `unicode61` tokenizer with `remove_diacritics 2` makes «decisión» and «decision» match the same rows. In Spanish, that matters.

## Store atoms, not whole sessions

A full session is noise: hundreds of lines for a single useful decision. Before storing, summarise each session into **atoms**: a decision, its why, an exact error, the fix, the command that worked. One atom, one row.

```python title="save.py"
import sqlite3

db = sqlite3.connect("memory.db")
db.execute(
    "INSERT INTO atoms (kind, body, source, created_at) VALUES (?, ?, ?, ?)",
    ("decision", "We use SQLite FTS5: milliseconds, no GPU.", "claude-code", "2026-10-02"),
)
db.commit()
```

> A memory you cannot read yourself is not a memory you can trust.

## Search with ranking

To get something back, `MATCH` filters, `bm25()` ranks (lower means more relevant) and `snippet()` returns the exact matching fragment, ready to drop into the agent’s context.

```sql title="search.sql"
SELECT kind,
       snippet(atoms, 1, '[', ']', '…', 12) AS hit,
       source
FROM atoms
WHERE atoms MATCH 'sqlite OR fts5'
ORDER BY bm25(atoms)
LIMIT 5;
```

With a few thousand atoms, this query takes milliseconds on a laptop. And the whole file is copied, versioned and deleted like any other.

## Everyone reads, nobody writes

The last step is giving them access. I expose it as a **read-only** MCP server: any agent can ask what was decided or what failed, but none of them can rewrite the memory. A separate process writes, and it redacts secrets before storing anything.

- One file, no services: you understand it, copy it and delete it.
- Small atoms: the agent gets short, precise context.
- Read for everyone, write for one: memory does not corrupt itself.

This is the pattern behind [Jezero](https://github.com/MarsGotta/jezero), the shared memory of my agents, which is now open source.
