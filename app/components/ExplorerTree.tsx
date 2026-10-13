'use client';

import { MODULES, MODULE_ORDER, TREE, stateColor, type NavItemId } from '@/lib/ontology';

interface ExplorerTreeProps {
  module: string;
  openDirs: Record<string, boolean>;
  file: string | null;
  onSelectModule: (mod: string) => void;
  onToggleModule: (mod: string) => void;
  onSelectFile: (id: string) => void;
}

function FileItem({ f, active }: { f: (typeof TREE)[string]['files'][number]; active: boolean }) {
  return (
    <div
      className={'tree-item' + (active ? ' active' : '')}
      data-file={f.id}
    >
      <span className="dot-state" style={{ background: stateColor(f.state) }} />
      <span className="fname">{f.name}</span>
      <span className="meta">{f.size}</span>
    </div>
  );
}

export function ExplorerTree({
  module,
  openDirs,
  file,
  onSelectModule,
  onToggleModule,
  onSelectFile,
}: ExplorerTreeProps) {
  const totalFiles = Object.values(TREE).reduce((n, t) => n + t.files.length, 0);
  const totalDirs = Object.values(TREE).reduce((n, t) => n + t.dirs.length, 0);
  void totalFiles;
  void totalDirs;

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
              <span className="meta">{tree.files.length}f · {tree.dirs.length}d</span>
            </div>

            <div className={'tree-sub' + (isOpen ? ' open' : '')}>
              {tree.dirs.map(d => {
                const dirFiles = tree.files.filter(f => f.id.startsWith(`${modId}/${d}/`));
                return (
                  <div key={d}>
                    <div className="tree-item" data-dir={`${modId}/${d}`}>
                      <span className="ic">▸</span>
                      <span className="name">{d}</span>
                      <span className="meta">{dirFiles.length}</span>
                    </div>
                    <div className="tree-sub open">
                      {dirFiles.map(f => (
                        <FileItem
                          key={f.id}
                          f={f}
                          active={file === f.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {tree.files
                .filter(f => !tree.dirs.some(d => f.id.startsWith(`${modId}/${d}/`)))
                .map(f => (
                  <FileItem key={f.id} f={f} active={file === f.id} />
                ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
