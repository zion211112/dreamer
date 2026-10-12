'use client';

import { useState, useMemo } from 'react';
import { DEPARTMENTS, DEPARTMENT_COLORS, FileNode, getIcon, WORKSPACE_ROOT, DEPARTMENT_COLORS as DEPT_COLORS } from '@/lib/ontology';
import { formatSize } from '@/lib/editor';

type MarketView = 'supply' | 'demand' | 'modules';

interface MarketMetrics {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface MarketNode extends FileNode {
  metrics?: MarketMetrics[];
  marketType?: 'school' | 'accreditation' | 'authority' | 'learner' | 'teacher' | 'anchor';
}

interface ExplorerTreeProps {
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

function TreeNode({
  node, depth, selectedPath, expandedPaths, onSelect, onToggle,
}: {
  node: FileNode; depth: number; selectedPath: string | null;
  expandedPaths: Set<string>; onSelect: (p: string) => void; onToggle: (p: string) => void;
}) {
  const isDir = node.type === 'dir';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = isDir && node.children && node.children.length > 0;
  const indent = depth * 13;

  return (
    <div>
      <div
        className={'flex items-center gap-1 pr-2 transition-colors cursor-pointer h-[25px] group relative ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
        style={{ paddingLeft: indent + 4 }}
        onClick={e => {
          e.stopPropagation();
          if (isDir) onToggle(node.path); else onSelect(node.path);
        }}
      >
        {isSelected && (
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />
        )}
        <span className="w-3.5 text-center text-[9px] text-[var(--fg-faint)] select-none flex-shrink-0">
          {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
        </span>
        <span className={'w-4 text-center text-[10px] select-none flex-shrink-0 ' + (isDir ? 'text-[var(--accent-hi)]' : 'text-[var(--fg-muted)]')}>
          {getIcon(node.name, node.type, isExpanded)}
        </span>
        <span className={'truncate flex-1 text-[12px] ' + (isSelected ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)] group-hover:text-[var(--fg)]')}>
          {node.name}
        </span>
        {node.size !== undefined && (
          <span className="text-[var(--fg-faint)] text-[10px] font-mono select-none hidden xl:inline">
            {formatSize(node.size)}
          </span>
        )}
      </div>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleHead({
  dept, expandedPaths, onToggle, onSelect, selectedPath,
}: {
  dept: typeof DEPARTMENTS[number];
  expandedPaths: Set<string>;
  onToggle: (p: string) => void;
  onSelect: (p: string) => void;
  selectedPath: string | null;
}) {
  const isExpanded = expandedPaths.has(dept.root.path);
  const isSelected = selectedPath === dept.root.path;
  const color = DEPARTMENT_COLORS[dept.id] || 'var(--accent)';
  const fileCount = dept.root.children?.filter(c => c.type === 'file').length ?? 0;
  const dirCount = (dept.root.children?.length ?? 0) - fileCount;

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(dept.root.path)}
        onDoubleClick={() => onSelect(dept.root.path)}
        className={'w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
      >
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] flex-shrink-0"
          style={{ background: color + '1a', color, border: `1px solid ${color}44` }}
        >
          {dept.icon}
        </span>
        <span className={'flex-1 truncate text-[12px] font-semibold tracking-wide ' + (isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg)]')}>
          {dept.name}
        </span>
        <span className="text-[9px] font-mono text-[var(--fg-faint)] flex-shrink-0">
          {fileCount}f · {dirCount}d
        </span>
        <svg
          width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={'transition-transform flex-shrink-0 ' + (isExpanded ? '' : '-rotate-90')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-0.5 border-l hairline ml-5 pl-1">
          {dept.root.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={0}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Supply-side market data (Institutions)
const SUPPLY_NODES: MarketNode[] = [
  {
    id: 'supply-schools',
    name: 'Schools',
    type: 'dir',
    path: '/institutions/schools',
    children: [
      { id: 'lincoln', name: 'Lincoln Academic Consortium', type: 'dir', path: '/institutions/schools/lincoln', marketType: 'school', metrics: [
        { label: 'Roster', value: '1,240' },
        { label: 'Placement', value: '87%', trend: 'up' },
        { label: 'Open seats', value: '43' },
      ]},
      { id: 'tech-institute', name: 'Tech Institute', type: 'dir', path: '/institutions/schools/tech-institute', marketType: 'school', metrics: [
        { label: 'Roster', value: '890' },
        { label: 'Placement', value: '92%', trend: 'up' },
        { label: 'Open seats', value: '12' },
      ]},
      { id: 'art-academy', name: 'Art Academy', type: 'dir', path: '/institutions/schools/art-academy', marketType: 'school', metrics: [
        { label: 'Roster', value: '450' },
        { label: 'Placement', value: '78%', trend: 'neutral' },
        { label: 'Open seats', value: '8' },
      ]},
    ],
  },
  {
    id: 'supply-accreditation',
    name: 'Accreditation',
    type: 'dir',
    path: '/institutions/accreditation',
    children: [
      { id: 'standards-v2', name: 'Standards v2.1', type: 'file', path: '/institutions/accreditation/standards.md', size: 8500, marketType: 'accreditation', metrics: [
        { label: 'Adoption', value: '87%' },
        { label: 'Audit', value: 'Pass', trend: 'up' },
      ]},
      { id: 'audit-log', name: 'Audit Log', type: 'file', path: '/institutions/accreditation/audit-log.ts', size: 4200, marketType: 'accreditation', metrics: [
        { label: 'Entries', value: '2,147' },
        { label: 'Disputes', value: '3', trend: 'down' },
      ]},
      { id: 'appeals', name: 'Appeals', type: 'file', path: '/institutions/accreditation/appeals.yaml', size: 1900, marketType: 'accreditation', metrics: [
        { label: 'Pending', value: '7' },
        { label: 'Resolved', value: '94%', trend: 'up' },
      ]},
    ],
  },
  {
    id: 'supply-authorities',
    name: 'Authorities',
    type: 'dir',
    path: '/institutions/authorities',
    children: [
      { id: 'root-certs', name: 'Root Certificates', type: 'file', path: '/institutions/authorities/root-certs.pem', size: 1800, marketType: 'authority', metrics: [
        { label: 'Trust depth', value: '3' },
        { label: 'Expiry', value: '2028-Q1' },
      ]},
      { id: 'crl', name: 'CRL', type: 'file', path: '/institutions/authorities/crl.ts', size: 2600, marketType: 'authority', metrics: [
        { label: 'Revoked', value: '23' },
        { label: 'Freshness', value: '<1hr', trend: 'up' },
      ]},
      { id: 'ocsp', name: 'OCSP', type: 'file', path: '/institutions/authorities/ocsp.ts', size: 2200, marketType: 'authority', metrics: [
        { label: 'Latency', value: '47ms' },
        { label: 'Uptime', value: '99.99%', trend: 'up' },
      ]},
    ],
  },
];

// Demand-side market data (People)
const DEMAND_NODES: MarketNode[] = [
  {
    id: 'demand-learners',
    name: 'Learners',
    type: 'dir',
    path: '/people/learners',
    children: [
      { id: 'learner-1', name: 'Ama Kourouma', type: 'dir', path: '/people/learners/ama', marketType: 'learner', metrics: [
        { label: 'SBTs', value: '7' },
        { label: 'Verified', value: '3' },
        { label: 'Readiness', value: '84%', trend: 'up' },
        { label: 'Matches', value: '12' },
      ]},
      { id: 'learner-2', name: 'Kofi Asante', type: 'dir', path: '/people/learners/kofi', marketType: 'learner', metrics: [
        { label: 'SBTs', value: '5' },
        { label: 'Verified', value: '5' },
        { label: 'Readiness', value: '96%', trend: 'up' },
        { label: 'Matches', value: '8' },
      ]},
      { id: 'learner-3', name: 'Wanjiru Mwangi', type: 'dir', path: '/people/learners/wanjiru', marketType: 'learner', metrics: [
        { label: 'SBTs', value: '9' },
        { label: 'Verified', value: '6' },
        { label: 'Readiness', value: '91%', trend: 'up' },
        { label: 'Matches', value: '15' },
      ]},
    ],
  },
  {
    id: 'demand-teachers',
    name: 'Teachers',
    type: 'dir',
    path: '/people/teachers',
    children: [
      { id: 'teacher-1', name: 'Dr. Sarah Chen', type: 'dir', path: '/people/teachers/sarah', marketType: 'teacher', metrics: [
        { label: 'Reputation', value: '1,847 ⭐' },
        { label: 'Issued', value: '234' },
        { label: 'Verify rate', value: '98%', trend: 'up' },
      ]},
      { id: 'teacher-2', name: 'Prof. Marcus Webb', type: 'dir', path: '/people/teachers/marcus', marketType: 'teacher', metrics: [
        { label: 'Reputation', value: '2,103 ⭐' },
        { label: 'Issued', value: '312' },
        { label: 'Verify rate', value: '99%', trend: 'up' },
      ]},
    ],
  },
  {
    id: 'demand-anchors',
    name: 'Anchors',
    type: 'dir',
    path: '/people/anchors',
    children: [
      { id: 'anchor-1', name: 'Root Authority', type: 'dir', path: '/people/anchors/root', marketType: 'anchor', metrics: [
        { label: 'Attestations', value: '4,892' },
        { label: 'Fee earned', value: '9.2 ETH' },
        { label: 'Success rate', value: '99.8%', trend: 'up' },
      ]},
      { id: 'anchor-2', name: 'Tech Guild', type: 'dir', path: '/people/anchors/guild', marketType: 'anchor', metrics: [
        { label: 'Attestations', value: '1,234' },
        { label: 'Fee earned', value: '2.1 ETH' },
        { label: 'Success rate', value: '98.5%', trend: 'neutral' },
      ]},
    ],
  },
];

function MetricChip({ metric }: { metric: MarketMetrics }) {
  const trendColor = metric.trend === 'up' ? 'var(--success)' : metric.trend === 'down' ? 'var(--danger)' : 'var(--fg-muted)';
  const trendIcon = metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : '';

  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <span className="text-[var(--fg-faint)]">{metric.label}</span>
      <span className="text-[var(--fg)] font-medium">{metric.value}</span>
      {trendIcon && <span style={{ color: trendColor }}>{trendIcon}</span>}
    </span>
  );
}

function MarketNodeItem({
  node,
  depth,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
  view
}: {
  node: MarketNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (p: string) => void;
  onToggle: (p: string) => void;
  view: MarketView;
}) {
  const isDir = node.type === 'dir';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = isDir && node.children && node.children.length > 0;
  const indent = depth * 13;
  const color = DEPT_COLORS[node.path.split('/')[1]] || 'var(--accent)';

  return (
    <div>
      <div
        className={'flex items-center gap-1 pr-2 transition-colors cursor-pointer h-[25px] group relative ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
        style={{ paddingLeft: indent + 4 }}
        onClick={e => {
          e.stopPropagation();
          if (isDir) onToggle(node.path); else onSelect(node.path);
        }}
      >
        {isSelected && (
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />
        )}
        <span className="w-3.5 text-center text-[9px] text-[var(--fg-faint)] select-none flex-shrink-0">
          {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
        </span>
        <span className={'w-4 text-center text-[10px] select-none flex-shrink-0 ' + (isDir ? 'text-[var(--accent-hi)]' : 'text-[var(--fg-muted)]')}>
          {isDir ? '◈' : '◆'}
        </span>
        <span className={'truncate flex-1 text-[12px] ' + (isSelected ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)] group-hover:text-[var(--fg)]')}>
          {node.name}
        </span>
        {node.metrics && (
          <span className="flex items-center gap-1 flex-shrink-0">
            {node.metrics.map((m, i) => <MetricChip key={i} metric={m} />)}
          </span>
        )}
      </div>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <MarketNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketSectionHead({
  section, expandedPaths, onToggle, onSelect, selectedPath, view
}: {
  section: MarketNode;
  expandedPaths: Set<string>;
  onToggle: (p: string) => void;
  onSelect: (p: string) => void;
  selectedPath: string | null;
  view: MarketView;
}) {
  const isExpanded = expandedPaths.has(section.path);
  const isSelected = selectedPath === section.path;
  const totalChildren = section.children?.length ?? 0;
  const totalMetrics = section.children?.reduce((acc, c) => acc + (c.metrics?.length ?? 0), 0) ?? 0;
  const sectionColor = view === 'supply' ? DEPT_COLORS.institutions : DEPT_COLORS.people;

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(section.path)}
        onDoubleClick={() => onSelect(section.path)}
        className={'w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
      >
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] flex-shrink-0"
          style={{ background: sectionColor + '1a', color: sectionColor, border: `1px solid ${sectionColor}44` }}
        >
          {view === 'supply' ? '◈' : '◇'}
        </span>
        <span className={'flex-1 truncate text-[12px] font-semibold tracking-wide ' + (isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg)]')}>
          {section.name}
        </span>
        <span className="text-[9px] font-mono text-[var(--fg-faint)] flex-shrink-0">
          {totalChildren} nodes · {totalMetrics} metrics
        </span>
        <svg
          width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={'transition-transform flex-shrink-0 ' + (isExpanded ? '' : '-rotate-90')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-0.5 border-l hairline ml-5 pl-1">
          {section.children?.map(child => (
            <MarketNodeItem
              key={child.id}
              node={child}
              depth={0}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExplorerTree({ selectedPath, expandedPaths, onSelect, onToggle }: ExplorerTreeProps) {
  const [activeHead, setActiveHead] = useState<string | null>(null);
  const [view, setView] = useState<MarketView>('modules');

  const currentNodes = useMemo(() => {
    if (view === 'supply') return SUPPLY_NODES;
    if (view === 'demand') return DEMAND_NODES;
    return [] as MarketNode[];
  }, [view]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* header */}
      <div className="px-3 py-2.5 border-b hairline flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">Explorer</span>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded p-0.5">
          {(['modules', 'supply', 'demand'] as MarketView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-1 text-[9px] font-medium rounded transition-all ${
                view === v
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]'
              }`}
              title={v === 'modules' ? 'Module view' : v === 'supply' ? 'Supply (Institutions)' : 'Demand (People)'}
            >
              {v === 'modules' ? '⬡' : v === 'supply' ? '◈' : '◇'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-1.5 min-h-0">
        {view === 'modules' ? (
          // Original module view
          <>
            {DEPARTMENTS.map(dept => (
              <div key={dept.id} onClick={() => setActiveHead(dept.id)}>
                <ModuleHead
                  dept={dept}
                  expandedPaths={expandedPaths}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                />
              </div>
            ))}
          </>
        ) : (
          // Market view (supply/demand)
          <>
            {currentNodes.map(section => (
              <MarketSectionHead
                key={section.id}
                section={section}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
                onSelect={onSelect}
                selectedPath={selectedPath}
                view={view}
              />
            ))}
          </>
        )}
      </div>

      {/* footer */}
      <div className="px-3 py-2 border-t hairline flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-[var(--fg-faint)] font-mono">
          {view === 'modules' ? '6 modules' : view === 'supply' ? 'Supply side' : 'Demand side'}
        </span>
        <div className="flex items-center gap-1.5 text-[var(--fg-faint)]">
          <span className="text-[var(--success)] text-[10px]">+2</span>
          <span className="text-[var(--warn)] text-[10px]">~1</span>
        </div>
      </div>
    </div>
  );
}
