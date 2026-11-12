# ADR B5 — Anti-slop converted to design tests

**Status:** Active  
**Date:** 2026-11-10  
**Scope:** Visual design and component selection

## Decision

Do not ban a component merely because it can be misused. Do not use it without a clear semantic or interaction purpose.

## Details

Former anti-slop items (gradient washes, rounded-card kits, all-caps eyebrows, arbitrary micro-labels, generic AI dashboard layouts, unnecessary animation, motion without user action, decorative metrics, fake functionality) are converted into design tests:

- Each pattern must achieve a clear semantic or interaction purpose
- Communicate meaning rather than decorate
- Pass WCAG AA

The agent must still challenge generic, decorative, inaccessible, or misleading implementations.

## Dependencies

B4

## Supersedes

charter §8 "Anti-slop rules" (permanent bans).
