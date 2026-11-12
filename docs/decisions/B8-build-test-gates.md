# ADR B8 — Build and test gates

**Status:** Active  
**Date:** 2026-11-10  
**Scope:** Engineering practice

## Decision

`npm run build` (tsc + vite build) and `npm run test:unit -- --run` must be green before starting the next phase.

## Rationale

Never break the working build; every phase leaves build and tests green before starting the next.

## Details

- Small, reversible changes preferred over broad rewrites.
