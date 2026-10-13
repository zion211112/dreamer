'use client';

export interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  modified: boolean;
  saved: boolean;
  cursorPosition?: { line: number; col: number };
  scrollPosition?: { top: number; left: number };
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
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.sh': 'bash',
};

export function getLanguageFromPath(path: string): string {
  const ext = '.' + path.split('.').pop()?.toLowerCase();
  return LANGUAGES[ext] || 'plaintext';
}

export function createTab(path: string, content?: string): Tab {
  const language = getLanguageFromPath(path);
  return {
    id: path,
    name: path.split('/').pop() || path,
    path,
    content: content || `// ${path}\n// Start editing...`,
    language,
    modified: false,
    saved: !!content,
    cursorPosition: { line: 1, col: 1 },
    scrollPosition: { top: 0, left: 0 },
  };
}

const MOCK_CONTENTS: Record<string, string> = {
  '/products/web/page.tsx': `export default function Page() {
  return (
    <div className="flex h-screen">
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-medium mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back</p>
      </main>
    </div>
  );
}`,
  '/products/web/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'File manager interface',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}`,
  '/products/web/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0f1a;
  --foreground: #e5e7eb;
  --muted: #111827;
  --muted-foreground: #9ca3af;
  --accent: #22d3ee;
  --accent-foreground: #0a0f1a;
  --border: #1f2937;
  --card: #111827;
}

* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.5; }`,
  '/foundation/core/config.ts': `export const config = {
  app: { name: 'workspace', version: '1.0.0' },
  editor: { tabSize: 2, fontSize: 12, lineHeight: 1.6 },
  tree: { indent: 16, showSizes: true, showDates: true },
} as const;`,
  '/foundation/core/types.ts': `export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  path: string;
}

export interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  modified: boolean;
}`,
  '/design/tokens/colors.ts': `export const colors = {
  bg: '#0a0f1a';
  bgElevated: '#111827';
  fg: '#e5e7eb';
  fgMuted: '#9ca3af';
  accent: '#22d3ee';
  accentDim: '#06b6d4';
  warn: '#fbbf24';
  danger: '#f87171';
  success: '#34d399';
  border: '#1f2937';
  card: '#111827';
} as const;`,
  '/operations/infrastructure/Dockerfile': `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`,
  '/laboratory/experiments/wasm-runtime.ts': `export class WasmRuntime {
  private module: WebAssembly.Module | null = null;
  private instance: WebAssembly.Instance | null = null;

  async load(bytes: Uint8Array): Promise<void> {
    this.module = await WebAssembly.compile(bytes);
    this.instance = await WebAssembly.instantiate(this.module, {
      env: { memory: new WebAssembly.Memory({ initial: 256 }) },
    });
  }

  call(fn: string, ...args: number[]): number {
    if (!this.instance) throw new Error('Not loaded');
    return (this.instance.exports[fn] as Function)(...args);
  }
}`,
  // Teacher console - real-feeling UI copy for teacher workflow
  '/people/teachers/console.tsx': `import { CredentialCard } from '@/components/CredentialCard';
import { IssuanceForm } from '@/components/IssuanceForm';
import { ReputationMetrics } from '@/components/ReputationMetrics';

export default function TeacherConsole() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Teaching Console
        </h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 border rounded hover:bg-accent/10">
            New Credential
          </button>
          <button className="px-4 py-2 border rounded hover:bg-accent/10">
            Manage Templates
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <ReputationMetrics />
          <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              Issued "Advanced Web Development" to 12 learners • 2 hours ago
            </div>
            <div className="p-3 border rounded">
              Revoked expired certificate for JS-2024-001 • 1 day ago
            </div>
            <div className="p-3 border rounded">
              Received endorsement from Senior Dev • 3 days ago
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Issue New Credential</h2>
          <IssuanceForm />
        </section>
      </div>
    </div>
  );
}`,
  // School console - real-feeling UI copy for institutional workflow
  '/institutions/schools/console.tsx': `import { AccreditationStatus } from '@/components/AccreditationStatus';
import { RosterManager } from '@/components/RosterManager';
import { CurriculumMap } from '@/components/CurriculumMap';

export default function SchoolConsole() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Lincoln Academic Consortium
        </h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 border rounded hover:bg-accent/10">
            Update Accreditation
          </button>
          <button className="px-4 py-2 border rounded hover:bg-accent/10">
            Manage Partnerships
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="space-y-4">
          <AccreditationStatus />
          <h2 className="text-lg font-medium mb-2">Recent Verifications</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              Verified 45 learner credentials • Today
            </div>
            <div className="p-3 border rounded">
              Updated curriculum standards • 2 days ago
            </div>
            <div className="p-3 border rounded">
              Partnered with Tech Institute • 1 week ago
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <RosterManager />
          <h2 className="text-lg font-medium mb-2">Faculty Updates</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              Added 3 new instructor profiles
            </div>
            <div className="p-3 border rounded">
              Updated availability for Spring term
            </div>
            <div className="p-3 border rounded">
              Completed background checks
            </div>
          </div>
        </section>

        <section>
          <CurriculumMap />
          <h2 className="text-lg font-medium mb-2>Standards Alignment</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              87% of courses aligned to v2.1 framework
            </div>
            <div className="p-3 border rounded">
              New cybersecurity track under review
            </div>
            <div className="p-3 border rounded">
              Audit scheduled for Q1 next year
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}`,
};

export function getMockContent(path: string): string {
  return MOCK_CONTENTS[path] || `// ${path}\n// Start editing...\\n`;
}

export function highlightLine(line: string, language: string): string {
  if (!line) return '<span></span>';

  let html = escapeHtml(line);

  if (language === 'typescript' || language === 'javascript') {
    html = html
      .replace(/(\/\/.*$)/, '<span class="comment">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|default|interface|type|class|extends|implements|public|private|protected|readonly|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|as|is)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(string|number|boolean|object|any|void|never|unknown|Record|Array|Promise|Map|Set|Date|Error|console)\b/g, '<span class="type">$1</span>')
      .replace(/(?:".*?"|'.*?'|`.*?`)/g, '<span class="string">$&</span>')
      .replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>');
  } else if (language === 'json') {
    html = html
      .replace(/(".*?")\s*:/g, '<span class="key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="number">$1</span>')
      .replace(/:\s*(true|false|null)\b/g, ': <span class="keyword">$1</span>');
  } else if (language === 'css') {
    html = html
      .replace(/([^{}:]+)\s*{/g, '<span class="selector">$1</span> {')
      .replace(/(\s+)([^:]+):/g, '$1<span class="property">$2</span>:')
      .replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;');
  } else if (language === 'markdown') {
    html = html
      .replace(/^(#{1,6})\s+(.+)$/gm, '<span class="keyword">$1</span> <span class="heading">$2</span>')
      .replace(/`([^`]+)`/g, '<span class="string">`$1`</span>')
      .replace(/\*\*(.+?)\*\*/g, '<span class="bold">$1</span>')
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<span class="italic">$1</span>');
  } else if (language === 'yaml') {
    html = html
      .replace(/^(\s*)(.+?):\s*(.*)$/gm, '$1<span class="key">$2</span>: <span class="value">$3</span>')
      .replace(/:\s*(".*?"|'.*?')/g, ': <span class="string">$1</span>');
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

/**
 * Syntax highlight a source string into HTML with task1.txt token classes.
 * Output is safe to inject via dangerouslySetInnerHTML (input is escaped first).
 * Supports typescript + markdown like the original control surface.
 */
export function highlight(content: string, lang: string): string {
  let html = escapeHtml(content);

  if (lang === 'typescript') {
    // comments first (before keywords so // lines don't get keyword-wrapped)
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="cmt">$1</span>');
    html = html.replace(/\b(export|interface|function|const|type|return|import|from)\b/g, '<span class="kw">$1</span>');
    html = html.replace(/"([^"]*)"/g, '<span class="str">"$1"</span>');
    html = html.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  } else if (lang === 'markdown') {
    html = html.replace(/(^#{1,6} [^\n]*)/gm, '<span class="kw">$1</span>');
    html = html.replace(/(^[-*] )/gm, '<span class="cmt">$1</span>');
  }

  return html;
}

export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function countLines(content: string): number {
  return content.split('\n').length;
}

export function countChars(content: string): number {
  return content.length;
}

export function getLineAndCol(content: string, index: number): { line: number; col: number } {
  const before = content.slice(0, index);
  const lines = before.split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}