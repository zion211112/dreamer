'use client';

import { useState, useEffect, useRef } from 'react';

interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  modified: boolean;
  active: boolean;
}

const LANGUAGES: Record<string, string> = {
  '.tsx': 'typescript',
  '.ts': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.json': 'json',
  '.css': 'css',
  '.html': 'html',
  '.md': 'markdown',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
};

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
      <body class="h-full bg-[var(--bg)] text-[var(--fg)] antialiased grid-pattern">
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
  return LANGUAGES[ext] || 'plaintext';
}

function getMockContent(path: string) {
  return MOCK_CONTENT[path] || { content: `// ${path}\n// File content would load here...`, language: getLanguageFromPath(path) };
}

function highlightLine(line: string, language: string): string {
  if (language === 'typescript' || language === 'javascript') {
    return line
      .replace(/(\/\/.*$)/gm, '<span class="text-[var(--fg-muted)]">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|default|interface|type|class|extends|implements|public|private|protected|readonly|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|as|is)\b/g, '<span class="text-[var(--accent)]">$1</span>')
      .replace(/\b(string|number|boolean|object|any|void|never|unknown|Record|Array|Promise|Map|Set)\b/g, '<span class="text-[var(--warn)]">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-[var(--success)]">$1</span>')
      .replace(/(\d+)/g, '<span class="text-[var(--warn)]">$1</span>');
  }
  if (language === 'json') {
    return line
      .replace(/(".*?")\s*:/g, '<span class="text-[var(--accent)]">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-[var(--success)]">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-[var(--warn)]">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="text-[var(--warn)]">$1</span>');
  }
  if (language === 'css') {
    return line
      .replace(/([^{}:]+)\s*{/g, '<span class="text-[var(--accent)]">$1</span> {')
      .replace(/(\s+)([^:]+):/g, '$1<span class="text-[var(--warn)]">$2</span>:')
      .replace(/:\s*([^;]+);/g, ': <span class="text-[var(--success)]">$1</span>;');
  }
  return line;
}

function Editor({ tab, onChange }: { tab: Tab; onChange: (content: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const lines = tab.content.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1);

  return (
    <div className="flex-1 flex relative">
      <div
        className="w-10 bg-[var(--bg)] border-r border-[var(--border)] flex flex-col items-center pt-2 select-none overflow-hidden"
        style={{ fontSize: '11px', lineHeight: '1.6' }}
      >
        {lineNumbers.map((num, i) => (
          <div key={i} className="w-full text-right pr-2 text-[var(--fg-muted)]" style={{ height: '1.6em' }}>
            {num}
          </div>
        ))}
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className="absolute inset-0 bg-transparent border-none resize-none outline-none terminal-font tab-size-2"
          style={{
            fontSize: '12px',
            lineHeight: '1.6',
            padding: '8px 12px',
            color: 'var(--fg)',
            caretColor: 'var(--accent)',
          }}
          value={tab.content}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
        />
        <div
          className="absolute inset-0 pointer-events-none terminal-font overflow-hidden"
          style={{
            fontSize: '12px',
            lineHeight: '1.6',
            padding: '8px 12px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ height: '1.6em' }} dangerouslySetInnerHTML={{ __html: highlightLine(line, tab.language) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Pane({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
}: {
  tabs: Tab[];
  activeTabId: string | null;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}) {
  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-elevated)]">
      <div className="flex items-center h-8 px-2 border-b border-[var(--border)] bg-[var(--card)] gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-t transition-colors whitespace-nowrap ${
              tab.id === activeTabId
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] border-b-2 border-[var(--accent)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg)]'
            }`}
          >
            <span className="text-[var(--accent)]" style={{ fontSize: '11px' }}>
              {tab.path.match(/\.(\w+)$/)?.[1] || '○'}
            </span>
            <span className="truncate max-w-[160px]">{tab.name}</span>
            {tab.modified && <span className="text-[var(--warn)]" style={{ fontSize: '9px' }}>●</span>}
            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
              className="ml-1 p-0.5 rounded hover:bg-[var(--fg)]/10 text-[var(--fg-muted)] hover:text-[var(--danger)] transition-colors"
              style={{ fontSize: '10px', lineHeight: 1 }}
            >
              ×
            </button>
          </button>
        ))}
        <button
          onClick={onNewTab}
          className="flex items-center justify-center w-8 h-6 rounded text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg)] transition-colors"
          style={{ fontSize: '14px' }}
          title="New file (Ctrl+N)"
        >
          +
        </button>
        {tabs.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[var(--fg-muted)] text-[12px] px-4">
            No files open. Double-click a file or press <kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded text-[10px] border border-[var(--border)]">Ctrl+P</kbd> to search
          </div>
        )}
      </div>
      <div className="flex-1 flex overflow-hidden">
        {activeTab ? (
          <Editor tab={activeTab} onChange={(content) => {
            // In a real app, update tab content
          }} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--fg-muted)]">
            <div className="text-center p-8">
              <div className="text-[var(--accent)] text-4xl mb-4" style={{ fontSize: '48px', opacity: 0.3 }}>proto.shell</div>
              <p className="text-[13px] mb-2">Orchestrator interface for everyone</p>
              <p className="text-[11px] opacity-60">Press <kbd className="px-2 py-1 bg-[var(--bg)] rounded border border-[var(--border)]">Ctrl+K</kbd> for commands</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}