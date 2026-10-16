# Github Sparkle Link Dashboard

Fusion prototype combining GitHub API connectivity with dreamer's workspace/module structure.

**Live demo**: http://localhost:5173 (local development)

## What This Prototype Does

This project fuses two concepts:
1. **GitHub API connection** from `github-sparkle-link` - connects to GitHub API and shows user info
2. **Workspace/module structure** from `dreamer` - APT-LABS style module organization with 5 modules

## Features

- GitHub API connection status
- 5 modules: Network, Builds, Operations, Research, Kernel
- Real-time status tracking
- Connect/Reconnect button
- Minimal, sublime UI

## Development

```sh
npm i
npm run dev
```

Open http://localhost:5173 to see the dashboard.

## Fusion Design

This prototype demonstrates how to combine:
- GitHub API integration (from sparkle-link)
- Workspace module organization (from dreamer)
- End-to-end data flow from API to UI