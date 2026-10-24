'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type WorkspaceMode = 'studio' | 'commons' | 'console';

const MODES: { key: WorkspaceMode; label: string; short: string }[] = [
  { key: 'studio', label: 'Studio', short: 'STUDIO' },
  { key: 'commons', label: 'Commons', short: 'COMMONS' },
  { key: 'console', label: 'Console', short: 'CONSOLE' },
];

interface WorkspaceModeSwitcherProps {
  currentMode: WorkspaceMode;
  onSelect: (mode: WorkspaceMode) => void;
}

export function WorkspaceModeSwitcher({ currentMode, onSelect }: WorkspaceModeSwitcherProps) {
  const current = MODES.find(mode => mode.key === currentMode) ?? MODES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Current mode: ${current.label}`}
          className="atlas-mode-trigger"
          title="Change work mode"
          type="button"
        >
          <span>{current.short}</span>
          <ChevronDown aria-hidden="true" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="atlas-mode-menu" sideOffset={8}>
        <div className="atlas-mode-stops" role="group" aria-label="Workspace modes">
          {MODES.map(mode => {
            const isCurrent = currentMode === mode.key;
            return (
              <DropdownMenuItem
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={mode.label}
                className={`atlas-mode-stop${isCurrent ? ' is-current' : ''}`}
                key={mode.key}
                onSelect={() => onSelect(mode.key)}
              >
                <span aria-hidden="true" className="atlas-mode-stop-marker">
                  {isCurrent && <Check size={10} strokeWidth={2.5} />}
                </span>
                <span>{mode.short}</span>
                {isCurrent && <span className="atlas-mode-current">HERE</span>}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
