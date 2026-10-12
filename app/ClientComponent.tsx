'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { TopNav, type NavItemId } from '@/components/TopNav';
import { SearchLane } from '@/components/SearchLane';
import { ExplorerTree } from '@/components/ExplorerTree';
import { ModuleSurface } from '@/components/ModuleSurface';
import { Inspector } from '@/components/Inspector';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';
import { Tab, createTab, getMockContent } from '@/lib/editor';
import { CommandContext } from '@/lib/commands';
import { findNode, DEPARTMENTS } from '@/lib/ontology';

export default function ClientComponent() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set([
    '/kernel', '/kernel/issuance', '/network', '/network/institutions', '/network/people', '/builds',
  ]));
  const [navSection, setNavSection] = useState<NavItemId>('workspace');
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND'>('NORMAL');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);
  const [sidebarWidth, setSidebarWidth] = useState(264);

  useEffect(() => {
    const initialTabs = [
      createTab('/kernel/issuance/core.ts', getMockContent('/kernel/issuance/core.ts')),
      createTab('/kernel/identity/did-method.ts', getMockContent('/kernel/identity/did-method.ts')),
    ];
    setTabs(initialTabs);
    setActiveTabId(initialTabs[0].id);
    setSelectedPath(initialTabs[0].path);
  }, []);

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 2800);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path);
    const node = findNode(path);
    if (node?.type === 'dir') {
      setExpandedPaths(prev => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path); else next.add(path);
        return next;
      });
      return;
    }
    setTabs(prev => {
      const existing = prev.find(t => t.path === path);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab = createTab(path, getMockContent(path));
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
  }, []);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const handleNav = useCallback((id: NavItemId) => {
    setNavSection(id);
    if (id === 'workspace') return;
    const dept = DEPARTMENTS.find(d => d.id === id);
    if (dept) {
      setExpandedPaths(prev => new Set(prev).add(dept.root.path));
      setSelectedPath(dept.root.path);
      const first = dept.root.children?.find(c => c.type === 'file');
      if (first) handleSelect(first.path);
    }
  }, [handleSelect]);

  const handleTabChange = useCallback((id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) setSelectedPath(tab.path);
  }, [tabs]);

  const handleTabClose = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id && next.length > 0) setActiveTabId(next[next.length - 1].id);
      if (next.length === 0) setActiveTabId(null);
      return next;
    });
  }, [activeTabId]);

  const handleTabUpdate = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleNewTab = useCallback(() => {
    const newTab = createTab('/untitled-' + Date.now() + '.txt');
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const commandContext: CommandContext = useMemo(() => ({
    tabs, activeTabId, selectedPath, setTabs, setActiveTabId, setSelectedPath,
    setCommandPaletteOpen, setMode,
    onTabUpdate: handleTabUpdate, onTabClose: handleTabClose, onNewTab: handleNewTab,
    showNotification,
  }), [tabs, activeTabId, selectedPath, handleTabUpdate, handleTabClose, handleNewTab, showNotification]);

  useEffect(() => {
    const onOpenPath = (e: Event) => {
      const path = (e as CustomEvent).detail as string;
      if (path) handleSelect(path);
    };
    window.addEventListener('sbt:open-path', onOpenPath);
    return () => window.removeEventListener('sbt:open-path', onOpenPath);
  }, [handleSelect]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setCommandPaletteOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setSidebarOpen(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab?.modified) {
          handleTabUpdate(activeTab.id, { modified: false, saved: true });
          showNotification('Saved ' + activeTab.name, 'success');
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewTab(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (activeTabId) handleTabClose(activeTabId); }
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        else if (mode !== 'NORMAL') setMode('NORMAL');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, mode, searchOpen, handleTabUpdate, handleTabClose, handleNewTab, showNotification]);

  useEffect(() => {
    let dragging = false;
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      setSidebarWidth(Math.min(420, Math.max(200, e.clientX)));
    };
    const onUp = () => { dragging = false; };
    const el = document.getElementById('sidebar-resize');
    if (el) {
      el.addEventListener('mousedown', () => { dragging = true; });
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const totalLines = activeTab ? activeTab.content.split('\n').length : 1;
  const totalChars = activeTab ? activeTab.content.length : 0;
  const activeNode = selectedPath ? findNode(selectedPath) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav active={navSection} onNav={handleNav} onPalette={() => setSearchOpen(v => !v)} />
      <SearchLane />

      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <div className="flex flex-shrink-0 relative">
            <div className="flex flex-col h-full border-r hairline" style={{ width: sidebarWidth }}>
              <ExplorerTree
                selectedPath={selectedPath}
                expandedPaths={expandedPaths}
                onSelect={handleSelect}
                onToggle={handleToggle}
              />
            </div>
            <div id="sidebar-resize" className="resize-handle self-stretch" />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <ModuleSurface section={navSection} />
          <StatusBar
            mode={mode}
            position={cursorPosition}
            total={{ lines: totalLines, chars: totalChars }}
            language={activeTab?.language || 'typescript'}
            modified={activeTab?.modified || false}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(v => !v)}
          />
        </div>

        <Inspector
          node={activeNode}
          onOpenFile={handleSelect}
          onToggle={handleToggle}
          expandedPaths={expandedPaths}
        />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        context={commandContext}
      />

      {notifications.map(n => (
        <div
          key={n.id}
          className={"fixed bottom-12 right-6 z-50 px-4 py-2.5 rounded-lg shadow-2xl text-[12px] font-medium animate-slide-in glass border hairline " +
            (n.type === 'success' ? 'text-[var(--success)]' : '') +
            (n.type === 'error' ? 'text-[var(--danger)]' : '') +
            (n.type === 'warning' ? 'text-[var(--warn)]' : '') +
            (n.type === 'info' ? 'text-[var(--fg)]' : '')}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}