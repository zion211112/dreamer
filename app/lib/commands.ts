'use client';

import { Tab, getMockContent, createTab } from '@/lib/editor';
import { WORKSPACE_ROOT, findNode, FileNode } from '@/lib/ontology';

export interface Command {
  id: string;
  title: string;
  description?: string;
  shortcut?: string;
  category: string;
  action: (context: CommandContext) => void | Promise<void>;
  keywords: string[];
  when?: (context: CommandContext) => boolean;
}

export interface CommandContext {
  tabs: Tab[];
  activeTabId: string | null;
  selectedPath: string | null;
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  setActiveTabId: (id: string | null) => void;
  setSelectedPath: (path: string | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMode: (mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND') => void;
  onTabUpdate: (id: string, updates: Partial<Tab>) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

function matchCommand(query: string, cmd: Command): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const title = cmd.title.toLowerCase();
  const desc = cmd.description?.toLowerCase() || '';

  if (title.startsWith(q)) score += 100;
  else if (title.includes(q)) score += 50;
  else if (desc.includes(q)) score += 25;
  else if (cmd.keywords.some(k => k.includes(q) || q.includes(k))) score += 30;
  else {
    let ti = 0;
    for (const c of q) {
      const idx = title.indexOf(c, ti);
      if (idx === -1) { score = 0; break; }
      score += idx === ti ? 10 : 1;
      ti = idx + 1;
    }
  }

  return score;
}

function getActiveTab(context: CommandContext): Tab | null {
  return context.tabs.find(t => t.id === context.activeTabId) || null;
}

function openFile(context: CommandContext, path: string) {
  const existingTab = context.tabs.find(t => t.path === path);
  if (existingTab) {
    context.setActiveTabId(existingTab.id);
    context.setSelectedPath(path);
  } else {
    const node = findNode(path);
    const content = node?.type === 'file' ? getMockContent(path) : '';
    const newTab = { ...createTab(path, content), active: true };
    context.setTabs(prev => [...prev, newTab]);
    context.setActiveTabId(newTab.id);
    context.setSelectedPath(path);
  }
}

function createCommands(): Command[] {
  return [
    // File operations
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new untitled file',
      shortcut: 'Ctrl+N',
      category: 'File',
      action: (ctx) => ctx.onNewTab(),
      keywords: ['new', 'create', 'file']
    },
    {
      id: 'open-file',
      title: 'Open File...',
      description: 'Open file from workspace',
      shortcut: 'Ctrl+P',
      category: 'File',
      action: (ctx) => ctx.setCommandPaletteOpen(true),
      keywords: ['open', 'file', 'find']
    },
    {
      id: 'save-file',
      title: 'Save File',
      description: 'Save current file',
      shortcut: 'Ctrl+S',
      category: 'File',
      action: (ctx) => {
        const tab = getActiveTab(ctx);
        if (tab?.modified) {
          ctx.onTabUpdate(tab.id, { modified: false, saved: true });
          ctx.showNotification(`Saved ${tab.name}`, 'success');
        }
      },
      keywords: ['save', 'write'],
      when: (ctx) => !!getActiveTab(ctx)?.modified
    },
    {
      id: 'save-all',
      title: 'Save All',
      description: 'Save all modified files',
      shortcut: 'Ctrl+K S',
      category: 'File',
      action: (ctx) => {
        let count = 0;
        ctx.setTabs(prev => prev.map(t => {
          if (t.modified) { count++; return { ...t, modified: false, saved: true }; }
          return t;
        }));
        ctx.showNotification(`Saved ${count} file${count !== 1 ? 's' : ''}`, 'success');
      },
      keywords: ['save', 'all'],
      when: (ctx) => ctx.tabs.some(t => t.modified)
    },
    {
      id: 'close-file',
      title: 'Close File',
      description: 'Close current tab',
      shortcut: 'Ctrl+W',
      category: 'File',
      action: (ctx) => {
        if (ctx.activeTabId) ctx.onTabClose(ctx.activeTabId);
      },
      keywords: ['close', 'tab'],
      when: (ctx) => !!ctx.activeTabId
    },
    {
      id: 'close-others',
      title: 'Close Other Tabs',
      description: 'Close all tabs except current',
      shortcut: 'Ctrl+K O',
      category: 'File',
      action: (ctx) => {
        if (!ctx.activeTabId) return;
        ctx.setTabs(prev => prev.filter(t => t.id === ctx.activeTabId));
      },
      keywords: ['close', 'others', 'tabs'],
      when: (ctx) => ctx.tabs.length > 1
    },

    // Edit operations
    {
      id: 'undo',
      title: 'Undo',
      description: 'Undo last action',
      shortcut: 'Ctrl+Z',
      category: 'Edit',
      action: () => document.execCommand('undo'),
      keywords: ['undo', 'back']
    },
    {
      id: 'redo',
      title: 'Redo',
      description: 'Redo last undone action',
      shortcut: 'Ctrl+Shift+Z',
      category: 'Edit',
      action: () => document.execCommand('redo'),
      keywords: ['redo', 'forward']
    },
    {
      id: 'find',
      title: 'Find in File',
      description: 'Search in current file',
      shortcut: 'Ctrl+F',
      category: 'Edit',
      action: () => { /* Handled by browser */ },
      keywords: ['find', 'search', 'replace']
    },
    {
      id: 'find-replace',
      title: 'Replace in File',
      description: 'Find and replace in current file',
      shortcut: 'Ctrl+H',
      category: 'Edit',
      action: () => { /* Handled by browser */ },
      keywords: ['replace', 'find']
    },
    {
      id: 'find-in-files',
      title: 'Search in Workspace',
      description: 'Search across all files',
      shortcut: 'Ctrl+Shift+F',
      category: 'Edit',
      action: (ctx) => ctx.showNotification('Workspace search - not implemented', 'info'),
      keywords: ['search', 'workspace', 'grep']
    },

    // Navigation
    {
      id: 'go-to-line',
      title: 'Go to Line...',
      description: 'Jump to specific line number',
      shortcut: 'Ctrl+G',
      category: 'Navigation',
      action: () => { /* Would open input */ },
      keywords: ['goto', 'line', 'jump']
    },
    {
      id: 'go-to-symbol',
      title: 'Go to Symbol...',
      description: 'Jump to symbol in current file',
      shortcut: 'Ctrl+Shift+O',
      category: 'Navigation',
      action: () => { /* Would show symbol list */ },
      keywords: ['symbol', 'function', 'class']
    },
    {
      id: 'quick-open',
      title: 'Quick Open',
      description: 'Quick open file by name',
      shortcut: 'Ctrl+P',
      category: 'Navigation',
      action: (ctx) => ctx.setCommandPaletteOpen(true),
      keywords: ['quick', 'open', 'file']
    },

    // Terminal
    {
      id: 'new-terminal',
      title: 'New Terminal',
      description: 'Open integrated terminal',
      shortcut: 'Ctrl+`',
      category: 'Terminal',
      action: (ctx) => ctx.showNotification('Terminal - not implemented', 'info'),
      keywords: ['terminal', 'shell', 'command']
    },
    {
      id: 'run-task',
      title: 'Run Task...',
      description: 'Run a configured task',
      shortcut: 'Ctrl+Shift+P',
      category: 'Terminal',
      action: (ctx) => ctx.setCommandPaletteOpen(true),
      keywords: ['task', 'run', 'build']
    },

    // View
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      description: 'Show/hide file explorer',
      shortcut: 'Ctrl+B',
      category: 'View',
      action: (ctx) => ctx.showNotification('Sidebar toggle - not implemented', 'info'),
      keywords: ['sidebar', 'explorer', 'toggle']
    },
    {
      id: 'toggle-panel',
      title: 'Toggle Panel',
      description: 'Show/hide bottom panel',
      shortcut: 'Ctrl+J',
      category: 'View',
      action: (ctx) => ctx.showNotification('Panel toggle - not implemented', 'info'),
      keywords: ['panel', 'terminal', 'output']
    },
    {
      id: 'zen-mode',
      title: 'Toggle Zen Mode',
      description: 'Distraction-free editing',
      shortcut: 'Ctrl+K Z',
      category: 'View',
      action: (ctx) => ctx.showNotification('Zen mode - not implemented', 'info'),
      keywords: ['zen', 'focus', 'distraction']
    },

    // Workspace commands - open department roots
    {
      id: 'open-foundation',
      title: 'Open Foundation',
      description: 'Open foundation department',
      shortcut: '',
      category: 'Workspace',
      action: (ctx) => openFile(ctx, '/foundation/core/config.ts'),
      keywords: ['foundation', 'core', 'config']
    },
    {
      id: 'open-products',
      title: 'Open Products',
      description: 'Open products department',
      shortcut: '',
      category: 'Workspace',
      action: (ctx) => openFile(ctx, '/products/web/page.tsx'),
      keywords: ['products', 'web', 'page']
    },
    {
      id: 'open-design',
      title: 'Open Design System',
      description: 'Open design system',
      shortcut: '',
      category: 'Workspace',
      action: (ctx) => openFile(ctx, '/design/tokens/colors.ts'),
      keywords: ['design', 'tokens', 'colors']
    },
    {
      id: 'open-operations',
      title: 'Open Operations',
      description: 'Open operations infrastructure',
      shortcut: '',
      category: 'Workspace',
      action: (ctx) => openFile(ctx, '/operations/infrastructure/Dockerfile'),
      keywords: ['operations', 'infrastructure', 'docker']
    },
    {
      id: 'open-laboratory',
      title: 'Open Laboratory',
      description: 'Open laboratory experiments',
      shortcut: '',
      category: 'Workspace',
      action: (ctx) => openFile(ctx, '/laboratory/experiments/wasm-runtime.ts'),
      keywords: ['laboratory', 'experiments', 'wasm']
    },

    // Mode switching
    {
      id: 'mode-normal',
      title: 'Normal Mode',
      description: 'Switch to normal mode',
      shortcut: 'Esc',
      category: 'Mode',
      action: (ctx) => ctx.setMode('NORMAL'),
      keywords: ['normal', 'mode', 'escape']
    },
    {
      id: 'mode-insert',
      title: 'Insert Mode',
      description: 'Switch to insert mode',
      shortcut: 'i',
      category: 'Mode',
      action: (ctx) => ctx.setMode('INSERT'),
      keywords: ['insert', 'mode', 'edit']
    },
    {
      id: 'mode-visual',
      title: 'Visual Mode',
      description: 'Switch to visual mode',
      shortcut: 'v',
      category: 'Mode',
      action: (ctx) => ctx.setMode('VISUAL'),
      keywords: ['visual', 'mode', 'select']
    },

    // Help
    {
      id: 'show-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Show all keyboard shortcuts',
      shortcut: 'Ctrl+K Ctrl+S',
      category: 'Help',
      action: (ctx) => ctx.showNotification('Shortcuts reference - not implemented', 'info'),
      keywords: ['shortcuts', 'keys', 'help', 'reference']
    },
    {
      id: 'about',
      title: 'About',
      description: 'Show version and info',
      shortcut: '',
      category: 'Help',
      action: (ctx) => ctx.showNotification('workspace v1.0.0 — file manager for systems thinkers', 'info'),
      keywords: ['about', 'version', 'info']
    },
  ];
}

export const COMMANDS = createCommands();

export function filterCommands(query: string, context: CommandContext): Command[] {
  return COMMANDS
    .filter(cmd => !cmd.when || cmd.when(context))
    .map(cmd => ({ cmd, score: matchCommand(query, cmd) }))
    .filter(x => x.score > 0 || !query)
    .sort((a, b) => b.score - a.score)
    .map(x => x.cmd);
}

export { matchCommand };