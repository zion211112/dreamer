'use client';

import { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { FileTreeWrapper } from '@/components/FileTree';
import { Pane } from '@/components/Pane';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';

interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  modified: boolean;
  active: boolean;
}

const MOCK_CONTENT: Record<string, { content: string; language: string }> = {
  '/src/app/page.tsx': {
    language: 'typescript',
    content: `import { FileTreeWrapper } from '@/components/FileTree';
import { Pane } from '@/components/Pane';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden terminal-font">
      <FileTreeWrapper selectedPath={null} onSelect={() => {}} onToggle={() => {}} />
      <Pane tabs={[]} activeTabId={null} onTabChange={() => {}} onTabClose={() => {}} />
      <StatusBar mode="NORMAL" position={1} total={1} />
      <CommandPalette isOpen={false} onClose={() => {}} />
    </div>
  );
}`
  },
  '/src/app/layout.tsx': {
    language: 'typescript',
    content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'proto.shell — orchestrator interface for everyone',
  description: 'A witty, expert, enterprise-grade file manager interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" class="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-[var(--bg)] text-[var(--fg)] antialiased grid-pattern">
        {children}
      </body>
    </html>
  );
}`
  },
  '/src/app/globals.css': {
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0f1a;
  --bg-elevated: #111827;
  --fg: #e5e7eb;
  --fg-muted: #9ca3af;
  --accent: #22d3ee;
  --accent-dim: #06b6d4;
  --warn: #fbbf24;
  --danger: #f87171;
  --success: #34d399;
  --border: #1f2937;
  --card: #111827;
}

* { box-sizing: border-box; }
html, body, #__next { height: 100%; margin: 0; }

body {
  background: var(--bg);
  color: var(--fg);
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}`
  },
  '/config/package.json': {
    language: 'json',
    content: `{
  "name": "newprotoshell",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.35",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.12",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.40",
    "tailwindcss": "3.4.10",
    "typescript": "5.5.4"
  }
}`
  },
};

function getLanguageFromPath(path: string): string {
  const ext = '.' + path.split('.').pop()?.toLowerCase();
  const LANGUAGES: Record<string, string> = {
    '.tsx': 'typescript', '.ts': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
    '.json': 'json', '.css': 'css', '.html': 'html', '.md': 'markdown',
    '.py': 'python', '.rs': 'rust', '.go': 'go',
  };
  return LANGUAGES[ext] || 'plaintext';
}

function createTab(path: string): Tab {
  const mock = MOCK_CONTENT[path] || { content: `// ${path}\n// File content would load here...`, language: getLanguageFromPath(path) };
  return {
    id: path,
    name: path.split('/').pop() || path,
    path,
    content: mock.content,
    language: mock.language,
    modified: false,
    active: true,
  };
}

export default function Page() {
  const [tabs, setTabs] = useState<Tab[]>([
    createTab('/src/app/page.tsx'),
    createTab('/src/app/layout.tsx'),
    createTab('/config/package.json'),
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('/src/app/page.tsx');
  const [selectedPath, setSelectedPath] = useState<string | null>('/src/app/page.tsx');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mode, setMode] = useState<'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND'>('NORMAL');
  const [cursorPosition, setCursorPosition] = useState({ line: 42, col: 12 });

  const handleFileSelect = useCallback((path: string) => {
    setSelectedPath(path);
    const existingTab = tabs.find(t => t.path === path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = createTab(path);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [tabs]);

  const handleTabChange = useCallback((id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) setSelectedPath(tab.path);
  }, [tabs]);

  const handleTabClose = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id && next.length > 0) {
        setActiveTabId(next[next.length - 1].id);
      }
      return next;
    });
  }, [activeTabId]);

  const handleNewTab = useCallback(() => {
    // In a real app, this would open a new untitled file
  }, []);

  const handleCommand = useCallback((cmd: any) => {
    console.log('Command executed:', cmd.title);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ctrl+K - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Ctrl+P - Quick Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Ctrl+B - Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        // Toggle sidebar logic here
      }
      // Ctrl+` - Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        // Toggle terminal
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden terminal-font" onKeyDown={e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setCommandPaletteOpen(true); }
    }}>
      <FileTreeWrapper
        selectedPath={selectedPath}
        onSelect={handleFileSelect}
        onToggle={() => {}}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Pane
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />
        <StatusBar
          mode={mode}
          position={cursorPosition}
          total={{ lines: 156, chars: 4231 }}
          language={tabs.find(t => t.id === activeTabId)?.language || 'typescript'}
        />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />
    </div>
  );
}