'use client';

import { Building2, Check, ChevronDown, ChevronRight, LockKeyhole } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type WorkspaceFloor = 'basement' | 'ground' | 'first' | 'second';

export interface FloorAccess {
  allowed: boolean;
  reason: string;
}

type FloorMapNode =
  | { kind: 'branch'; label: string; detail: string; children: FloorMapNode[] }
  | { kind: 'floor'; floor: WorkspaceFloor };

const FLOOR_LABELS: Record<WorkspaceFloor, { label: string; menuLabel: string; short: string; detail: string }> = {
  basement: { label: 'Basement', menuLabel: 'Basement · Radar', short: 'B', detail: 'Field signals and local notes' },
  ground: { label: 'Ground', menuLabel: 'Ground · Workbench', short: 'G', detail: 'Assets, work and shared records' },
  first: { label: 'First', menuLabel: 'First · Governance', short: '1', detail: 'Decision rights and oversight' },
  second: { label: 'Second · School', menuLabel: 'Second · School', short: '2', detail: 'Device-local school tools' },
};

const FLOOR_MAP: FloorMapNode[] = [
  {
    kind: 'branch',
    label: 'Commons',
    detail: 'Network floors',
    children: [
      {
        kind: 'branch',
        label: 'Below ground',
        detail: 'Observe',
        children: [{ kind: 'floor', floor: 'basement' }],
      },
      {
        kind: 'branch',
        label: 'Street level',
        detail: 'Make and verify',
        children: [{ kind: 'floor', floor: 'ground' }],
      },
    ],
  },
  {
    kind: 'branch',
    label: 'Membership',
    detail: 'Verified access',
    children: [
      {
        kind: 'branch',
        label: 'Governance',
        detail: 'Role-gated',
        children: [{ kind: 'floor', floor: 'first' }],
      },
      {
        kind: 'branch',
        label: 'School',
        detail: 'School membership',
        children: [{ kind: 'floor', floor: 'second' }],
      },
    ],
  },
];

interface FloorMapItemProps {
  node: FloorMapNode;
  currentFloor: WorkspaceFloor;
  access: Record<WorkspaceFloor, FloorAccess>;
  onSelect: (floor: WorkspaceFloor) => void;
}

function FloorMapItem({ node, currentFloor, access, onSelect }: FloorMapItemProps) {
  if (node.kind === 'branch') {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="atlas-floor-branch">
          <Building2 aria-hidden="true" size={14} />
          <span>{node.label}</span>
          <small>{node.detail}</small>
          <ChevronRight aria-hidden="true" className="atlas-floor-branch-chevron" size={13} />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="atlas-floor-menu atlas-floor-submenu" sideOffset={7}>
          {node.children.map((child, index) => (
            <FloorMapItem
              access={access}
              currentFloor={currentFloor}
              key={child.kind === 'floor' ? child.floor : `${child.label}-${index}`}
              node={child}
              onSelect={onSelect}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  const floorInfo = FLOOR_LABELS[node.floor];
  const floorAccess = access[node.floor];
  const isCurrent = currentFloor === node.floor;

  return (
    <DropdownMenuItem
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={`${floorInfo.label}, ${floorAccess.allowed ? 'available' : `locked: ${floorAccess.reason}`}${isCurrent ? ', current floor' : ''}`}
      className={`atlas-floor-menu-item${isCurrent ? ' is-active' : ''}${floorAccess.allowed ? '' : ' is-locked'}`}
      disabled={!floorAccess.allowed}
      onSelect={() => onSelect(node.floor)}
      title={floorAccess.allowed ? floorInfo.detail : floorAccess.reason}
    >
      <span className="atlas-floor-short">{floorInfo.short}</span>
      <span className="atlas-floor-option-copy">
        <span>{floorInfo.menuLabel}</span>
        <small>{floorAccess.allowed ? floorInfo.detail : floorAccess.reason}</small>
      </span>
      {isCurrent
        ? <span className="atlas-floor-current"><Check aria-hidden="true" size={12} /> HERE</span>
        : floorAccess.allowed
          ? <span className="atlas-floor-current">OPEN</span>
          : <LockKeyhole aria-label="Locked" className="atlas-floor-lock" size={13} />}
    </DropdownMenuItem>
  );
}

interface WorkspaceFloorSwitcherProps {
  currentFloor: WorkspaceFloor;
  access: Record<WorkspaceFloor, FloorAccess>;
  onSelect: (floor: WorkspaceFloor) => void;
}

export function WorkspaceFloorSwitcher({ currentFloor, access, onSelect }: WorkspaceFloorSwitcherProps) {
  const current = FLOOR_LABELS[currentFloor];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Current floor: ${current.label}`}
          className="atlas-floor-trigger"
          title="Choose a workspace floor"
          type="button"
        >
          <span className="atlas-floor-short">{current.short}</span>
          <span>{current.label}</span>
          <ChevronDown aria-hidden="true" size={13} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="atlas-floor-menu" sideOffset={9}>
        <DropdownMenuLabel className="atlas-floor-menu-label">BUILDING MAP</DropdownMenuLabel>
        {FLOOR_MAP.map(node => (
          <FloorMapItem
            access={access}
            currentFloor={currentFloor}
            key={node.kind === 'branch' ? node.label : node.floor}
            node={node}
            onSelect={onSelect}
          />
        ))}
        <DropdownMenuLabel className="atlas-floor-menu-foot">
          Access follows verified workspace membership.
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
