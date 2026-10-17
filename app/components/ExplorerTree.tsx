'use client';

import { MODULES, MODULE_ORDER, TREE, stateColor, type NavItemId } from '@/lib/ontology';

interface ExplorerTreeProps {
  module: string | null;
  openDirs: Record<string, boolean>;
  page: string | null;
  onSelectModule: (mod: string) => void;
  onToggleModule: (mod: string) => void;
  onSelectPage: (id: string) => void;
}

function PageItem({ p, active, onSelect }: {
  p: (typeof TREE)[string]['pages'][number];
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={'tree-item' + (active ? ' active' : '')}
      data-page={p.id}
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onSelect(p.id); }}
    >
      <span className="dot-state" style={{ background: stateColor(p.state) }} />
      <span className="pname">{p.name}</span>
      <span className="meta">{p.size}</span>
    </div>
  );
}

export function ExplorerTree({
  module,
  openDirs,
  page,
  onSelectModule,
  onToggleModule,
  onSelectPage,
}: ExplorerTreeProps) {
  void onToggleModule;

  return (
    <aside className="explorer" id="explorer">
      <div className="exp-head">
        <span>explorer</span>
        <span className="badge">{MODULE_ORDER.length}</span>
      </div>

      {MODULE_ORDER.map(modId => {
        const mod = MODULES[modId];
        const tree = TREE[modId];
        const isOpen = openDirs[modId];
        const isActive = module === modId;

        return (
          <div className="tree-group" key={modId}>
            <div
              className={'tree-item' + (isActive ? ' active' : '')}
              data-mod={modId}
              onClick={() => onSelectModule(modId)}
            >
              <span
                className="ic"
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: mod.color,
                }}
              >
                ▸
              </span>
              <span className="name">{mod.label}</span>
              <span className="meta">{tree.pages.length}p · {tree.dirs.length}d</span>
            </div>

            <div className={'tree-sub' + (isOpen ? ' open' : '')}>
              {tree.dirs.map(d => {
                const dirPages = tree.pages.filter(p => p.id.startsWith(`${modId}/${d}/`));
                return (
                  <div key={d}>
                    <div className="tree-item" data-dir={`${modId}/${d}`}>
                      <span className="ic">▸</span>
                      <span className="name">{d}</span>
                      <span className="meta">{dirPages.length}p</span>
                    </div>
                    <div className="tree-sub open">
                      {dirPages.map(p => (
                        <PageItem
                          key={p.id}
                          p={p}
                          active={page === p.id}
                          onSelect={onSelectPage}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {tree.pages
                .filter(p => !tree.dirs.some(d => p.id.startsWith(`${modId}/${d}/`)))
                .map(p => (
                  <PageItem key={p.id} p={p} active={page === p.id} onSelect={onSelectPage} />
                ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
