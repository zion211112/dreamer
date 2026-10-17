<<<<<<< HEAD
# APT-LABS African Sovereignty Dashboard

Minimal end-to-end prototype fusing GitHub API connectivity with APT-LABS 5-module workspace architecture.

## Overview

This project demonstrates how APT-LABS principles of **small, opinionated software** can catalyze the African sovereignty journey by enabling independent developers and teams to build software capability without dependency on centralized platforms.

## Architecture

```
src/
  lib/
    github-connector.ts     → GitHub API connection status (APT-LABS minimal connector)
    workspace-modules.ts    → APT-LABS style 5-module workspace
  components/
    GithubDashboard.tsx     → Combined 5-module dashboard UI
  routes/
    index.tsx               → Entry point
```

## The 5 APT-LABS Modules

| Module | Purpose |
|--------|---------|
| **Network** | Connectivity and API access |
| **Builds** | CI/CD and compilation pipeline |
| **Operations** | Runtime operations and deployments |
| **Research** | Exploration and innovation |
| **Kernel** | Core system foundation |

## Running

```sh
npm install
npm run dev
```

Visit http://localhost:5173 to use the dashboard.

## APT-LABS Philosophy

This prototype embodies APT-LABS' commitment to:
- **Minimalism**: Only what's essential, nothing wasted
- **Opinionated choices**: Clear architecture decisions that guide development
- **Sovereignty**: Empowering independent development without platform lock-in
- **African empowerment**: Building local capacity for global software excellence
=======
# newprotoshell

A file-manager-inspired workspace. One page, one route, zero heavy deps.

- Sign in with any handle (demo: ama / kofi / wanjiru, role selectable)
- Files: folder browser with search, sort, breadcrumbs, live file creation
- Builds: React-style flow graphs, vote with your name
- Tenders: issue, bid, vote bids, award (builders bid)
- Console: teacher-only learner records with attendance + marks (unknown ≠ 0)
- Vault: soulbound tokens earned by actions, not purchases

State persists in localStorage. Deploy on Vercel: `vercel` or push to GitHub and import.

Design: dark `#07090d` canvas, jade `#35d9a4` signal, amber `#e8b84b` output,
golden-ratio type rhythm, 8px spacing grid.
>>>>>>> 00f29f52fcb5df38165e2e9f1550b71a6407453b
