'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopNav, type NavItemId } from '@/components/TopNav';
import { ExplorerTree } from '@/components/ExplorerTree';
import { ModuleSurface } from '@/components/ModuleSurface';
import { Inspector } from '@/components/Inspector';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';
import { ChatAgent } from '@/components/ChatAgent';

interface Toast {
  id: number;
  msg: string;
  icon: string;
  out: boolean;
}

const initialOpenDirs: Record<string, boolean> = {
  workspace: true,
  kernel: true,
  network: true,
  builds: true,
  operations: true,
  laboratory: true,
};

export default function ClientComponent() {
  const [module, setModule] = useState<string>('workspace');
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>(initialOpenDirs);
  const [file, setFile] = useState<string | null>(null);
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

  const selectModule = useCallback((mod: string) => {
    setModule(mod);
    setFile(null);
    setOpenDirs(prev => ({ ...prev, [mod]: true }));
  }, []);

  const selectFile = useCallback((id: string) => {
    const mod = id.split('/')[0];
    setModule(mod);
    setFile(id);
    setOpenDirs(prev => ({ ...prev, [mod]: true }));
  }, []);

  const toggleModule = useCallback((mod: string) => {
    setOpenDirs(prev => ({ ...prev, [mod]: !prev[mod] }));
  }, []);

  const toggleAgent = useCallback(() => setAgentOpen(v => !v), []);

  // Keybindings: ⌘K/⌘P palette, ⌘⇧A agent, ⌘1-6 modules, Esc.
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
      if (meta && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const mods = ['workspace', 'kernel', 'network', 'builds', 'operations', 'laboratory'];
        const i = parseInt(e.key, 10) - 1;
        if (mods[i]) selectModule(mods[i]);
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
    const t = setTimeout(() => toast('Control surface v1.4 · ready', '◆'), 400);
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
    if (mod === module) {
      toggleModule(mod);
    } else {
      selectModule(mod);
    }
  }, [module, selectModule, toggleModule]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '40px 1fr 26px',
        gridTemplateColumns: '260px 1fr 320px',
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
          active={module as NavItemId}
          onNav={selectModule}
          onPalette={() => setPaletteOpen(true)}
        />
      </div>

      <div style={{ gridArea: 'explorer' }}>
        <ExplorerTree
          module={module}
          openDirs={openDirs}
          file={file}
          onSelectModule={handleExplorerModuleClick}
          onToggleModule={toggleModule}
          onSelectFile={selectFile}
        />
      </div>

      <div style={{ gridArea: 'main' }}>
        <ModuleSurface
          module={module}
          file={file}
          onNav={selectModule}
          onSelectFile={selectFile}
          onOpenFile={selectFile}
          toast={toast}
        />
      </div>

      <div style={{ gridArea: 'inspector' }}>
        <Inspector
          module={module}
          file={file}
          onAction={handleInspectorAction}
        />
      </div>

      <div style={{ gridArea: 'status' }}>
        <StatusBar file={file} mode={mode} />
      </div>

      <ChatAgent
        isOpen={agentOpen}
        file={file}
        module={module}
        onToggle={toggleAgent}
      />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNav={selectModule}
        onSelectFile={selectFile}
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
  );
}
