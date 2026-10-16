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