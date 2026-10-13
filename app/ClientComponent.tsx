'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopNav, type NavItemId, type ViewId } from '@/components/TopNav';
import { ExplorerTree } from '@/components/ExplorerTree';
import { ModuleSurface } from '@/components/ModuleSurface';
import { Inspector } from '@/components/Inspector';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';
import { ChatAgent } from '@/components/ChatAgent';
import { SessionProvider } from '@/lib/session';

interface Toast {
  id: number;
  msg: string;
  icon: string;
  out: boolean;
}

const MODULE_KEYS: NavItemId[] = ['kernel', 'network', 'builds', 'operations', 'research'];

const initialOpenDirs: Record<string, boolean> = {
  kernel: true,
  network: true,
  builds: true,
  operations: true,
  research: true,
};

export default function ClientComponent() {
  const [view, setView] = useState<ViewId>('kemet');
  const [module, setModule] = useState<NavItemId | null>(null);
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>(initialOpenDirs);
  const [page, setPage] = useState<string | null>(null);
  const [agentOpen, setAgentOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mode] = useState('NORMAL');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, icon = '◆') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, icon, out: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 2200);
  }, []);

  // Entering a module lands on the workspace branch.
  const selectModule = useCallback((mod: NavItemId) => {
    setModule(mod);
    setPage(null);
    setView('workspace');
    setOpenDirs(prev => ({ ...prev, [mod]: true }));
  }, []);

  const selectPage = useCallback((id: string) => {
    const mod = id.split('/')[0] as NavItemId;
    setModule(mod);
    setPage(id);
    setView('workspace');
    setOpenDirs(prev => ({ ...prev, [mod]: true }));
  }, []);

  const selectView = useCallback((v: ViewId) => {
    setView(v);
    if (v === 'kemet') setPage(null);
  }, []);

  const toggleModule = useCallback((mod: string) => {
    setOpenDirs(prev => ({ ...prev, [mod]: !prev[mod] }));
  }, []);

  const toggleAgent = useCallback(() => setAgentOpen(v => !v), []);

  // Keybindings: ⌘K/⌘P palette, ⌘⇧A agent, ⌘0 kemet-os, ⌘B workspace,
  // ⌘1–5 modules, Escape.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
        return;
      }
      if (meta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggleAgent();
        return;
      }
      if (meta && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setView(v => (v === 'kemet' ? 'workspace' : 'kemet'));
        return;
      }
      if (meta && e.key === '0') {
        e.preventDefault();
        setView('kemet');
        setPage(null);
        return;
      }
      if (meta && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const i = parseInt(e.key, 10) - 1;
        if (MODULE_KEYS[i]) selectModule(MODULE_KEYS[i]);
        return;
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectModule, toggleAgent]);

  // Boot toast.
  useEffect(() => {
    const t = setTimeout(() => toast('Kemet-OS v1.4 · ready', '◈'), 400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleInspectorAction = useCallback((action: 'mint' | 'fork' | 'audit', id: string) => {
    const f = id.split('/').pop() || id;
    if (action === 'mint') toast(`Minting ${f} to The Roll…`, '◈');
    else if (action === 'fork') toast(`Fork request queued for ${f}`, '⟐');
    else toast(`Audit request submitted · ${f}`, '◎');
    setTimeout(() => toast(`✓ ${f} · ${action} confirmed`, '◆'), 900);
  }, [toast]);

  const handleExplorerModuleClick = useCallback((mod: string) => {
    if (mod === module && view === 'workspace') {
      toggleModule(mod);
    } else {
      selectModule(mod as NavItemId);
    }
  }, [module, view, selectModule, toggleModule]);

  return (
    <SessionProvider toast={toast}>
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '40px 1fr 26px',
        gridTemplateColumns: '232px 1fr 304px',
        gridTemplateAreas: `
          "header header header"
          "explorer main inspector"
          "status status status"
        `,
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ gridArea: 'header' }}>
        <TopNav
          view={view}
          active={module}
          onNav={selectModule}
          onView={selectView}
          onPalette={() => setPaletteOpen(true)}
        />
      </div>

      <div style={{ gridArea: 'explorer' }}>
        <ExplorerTree
          module={module}
          openDirs={openDirs}
          page={page}
          onSelectModule={handleExplorerModuleClick}
          onToggleModule={toggleModule}
          onSelectPage={selectPage}
        />
      </div>

      <div style={{ gridArea: 'main' }}>
        <ModuleSurface
          view={view}
          module={module}
          page={page}
          onNav={selectModule}
          onSelectPage={selectPage}
          onOpenPage={selectPage}
          onView={selectView}
          toast={toast}
        />
      </div>

      <div style={{ gridArea: 'inspector' }}>
        <Inspector
          module={module || 'kernel'}
          page={page}
          onAction={handleInspectorAction}
        />
      </div>

      <div style={{ gridArea: 'status' }}>
        <StatusBar page={page} mode={mode} />
      </div>

      <ChatAgent
        isOpen={agentOpen}
        page={page}
        module={module || 'kernel'}
        onToggle={toggleAgent}
      />

      <CommandPalette
        isOpen={paletteOpen}
        view={view}
        onClose={() => setPaletteOpen(false)}
        onNav={selectModule}
        onView={selectView}
        onSelectPage={selectPage}
        onToggleAgent={toggleAgent}
      />

      <div className="toast-wrap" id="toastWrap">
        {toasts.map(t => (
          <div key={t.id} className={'toast' + (t.out ? ' out' : '')}>
            <span className="ic">{t.icon}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
    </SessionProvider>
  );
}
