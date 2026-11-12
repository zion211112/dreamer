# ADR B3 — Shell pane ownership

**Status:** Active  
**Date:** 2026-11-10  
**Scope:** Shell layout (topbar, rail, sidebar, main, inspector, dock, statusbar)

## Decision

Each shell pane has one job; no duplicate navigation systems.

## Details

| Pane | Job |
|------|-----|
| Topbar | Working-context identity |
| Rail | Module switching (exactly five icons) |
| Sidebar | Within-module context only |
| Main | Work surface |
| Inspector | Contextual, opens on selection |
| Dock | Contextual per-module change-set / evidence strip |
| Statusbar | Single boundary line + ledger head state |

## Supersedes

Fixed panel and shell assumptions from prior direction memos.
