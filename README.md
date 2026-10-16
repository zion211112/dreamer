# Github Sparkle Link Fusion Prototype

Minimal end-to-end prototype fusing GitHub API connectivity with dreamer's workspace/module structure.

## Overview

This project combines:
- **GitHub API integration** from `github-sparkle-link` repository
- **Workspace/module architecture** from `dreamer` project

## Architecture

```
src/
  lib/
    github-connector.ts   → GitHub API connection status
    workspace-modules.ts   → APT-LABS style 5-module workspace
  components/
    GithubDashboard.tsx   → Combined dashboard UI
  routes/
    index.tsx             → Entry point
    README.md             → Project documentation
```

## Running

```sh
npm install
npm run dev
```

Visit http://localhost:5173 to use the dashboard.

## Modules

| Module | Component | Status |
|--------|-----------|--------|
| Network | GitHubNetwork | idle |
| Builds | GitHubBuilds | idle |
| Operations | GitHubOperations | idle |
| Research | GitHubResearch | idle |
| Kernel | GitHubKernel | idle |