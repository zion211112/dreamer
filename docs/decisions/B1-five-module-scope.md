# ADR B1 — Five-module navigation scope

**Status:** Active  
**Date:** 2026-11-10  
**Scope:** Module structure and navigation

## Decision

One workspace, one shared graph, five distinct user jobs: Commons, Network, Workbench, Records, Intelligence.

## Rationale

Five modules cover all user jobs without a sixth primary module unless a genuinely independent user job cannot fit into the five.

## Details

- School Console remains a nested operational boundary under Workbench, not a primary module.
- No duplicate navigation systems inside individual pages.
- No workspace-within-workspace unless an actual permission or operational boundary requires it.

## Routes

- `/workspace/commons` — Commons
- `/workspace/network/{people,institutions,capabilities}` — Network
- `/workspace/workbench`, `/workspace/workbench/:pilot` — Workbench
- `/workspace/records/{canon,annals,roll}` — Records
- `/workspace/intelligence` — Intelligence

## Supersedes

charter §4 "Hard navigation constraints" (permanent bans converted to revisable decision).
