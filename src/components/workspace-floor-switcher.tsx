'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type WorkspaceFloor = 'basement' | 'ground' | 'first' | 'second';

const FLOORS: { key: WorkspaceFloor; label: string; short: string; name: string }[] = [
  { key: 'basement', label: 'Basement', short: 'BASEMENT', name: 'Basement' },
  { key: 'ground', label: 'Ground floor', short: 'GRND FLR', name: 'Ground' },
  { key: 'first', label: 'Floor 1 · Governance', short: 'FLR 1', name: 'First' },
  { key: 'second', label: 'Floor 2 · School Console', short: 'FLR 2', name: 'Second · School' },
];

interface WorkspaceFloorSwitcherProps {
  currentFloor: WorkspaceFloor;
  onSelect: (floor: WorkspaceFloor) => void;
}

export function WorkspaceFloorSwitcher({ currentFloor, onSelect }: WorkspaceFloorSwitcherProps) {
  const current = FLOORS.find(floor => floor.key === currentFloor) ?? FLOORS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Current floor: ${current.name}`}
          className="atlas-floor-trigger"
          title="Change floor"
          type="button"
        >
          <span>{current.short}</span>
          <ChevronDown aria-hidden="true" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="atlas-floor-menu" sideOffset={8}>
        <DropdownMenuLabel className="atlas-floor-menu-label">APT—LABS / FLOORS</DropdownMenuLabel>
        <div className="atlas-floor-stops" role="group" aria-label="Workspace floors">
          {FLOORS.map(floor => {
            const isCurrent = currentFloor === floor.key;
            return (
              <DropdownMenuItem
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={floor.label}
                className={`atlas-floor-stop${isCurrent ? ' is-current' : ''}`}
                key={floor.key}
                onSelect={() => onSelect(floor.key)}
              >
                <span aria-hidden="true" className="atlas-floor-stop-marker">
                  {isCurrent && <Check size={10} strokeWidth={2.5} />}
                </span>
                <span>{floor.short}</span>
                {isCurrent && <span className="atlas-floor-current">HERE</span>}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
