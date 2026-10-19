'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Check, ChevronDown, Compass, GraduationCap, Pin, Users } from 'lucide-react';
import { saveWorkspaceDefault } from '../../app/workspace/actions';
import { getWorkspaceHref, type WorkspaceContextOption, type WorkspaceKey } from '@/lib/workspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkspaceSwitcherProps {
  defaultWorkspace: WorkspaceKey;
  contexts: WorkspaceContextOption[];
  defaultContextKey: string;
}

function contextRoleLabel(context: WorkspaceContextOption): string {
  if (context.kind === 'network') return 'Network Member';
  if (context.kind === 'school') {
    return context.role === 'principal' ? 'School Admin' : context.role === 'tender_issuer' ? 'Tender Issuer' : 'Teacher';
  }
  return context.role.charAt(0).toUpperCase() + context.role.slice(1);
}

export function WorkspaceSwitcher({ defaultWorkspace, contexts, defaultContextKey }: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [preference, setPreference] = useState(defaultWorkspace);
  const [feedback, setFeedback] = useState('');
  const [pending, startTransition] = useTransition();
  const requestedKey = searchParams.get('context');
  const selectedContext = useMemo(
    () => contexts.find(context => context.key === requestedKey)
      ?? contexts.find(context => context.key === defaultContextKey)
      ?? contexts.find(context => context.kind === 'network'),
    [contexts, defaultContextKey, requestedKey],
  );
  const onConsole = pathname?.startsWith('/console') ?? false;
  const selectedRole = selectedContext ? contextRoleLabel(selectedContext) : 'Network Member';
  const currentLabel = onConsole ? 'School Console · Local Device' : `Workspace: ${selectedRole}`;

  function saveDefault(workspace: WorkspaceKey) {
    setFeedback('');
    startTransition(async () => {
      const result = await saveWorkspaceDefault(workspace);
      if (result.error) {
        setFeedback(result.error);
        return;
      }
      setPreference(workspace);
      setFeedback(`${workspace === 'school' ? 'School context' : 'Network context'} is your saved landing preference.`);
      router.refresh();
    });
  }

  function workspaceHref(context: WorkspaceContextOption): string {
    const params = new URLSearchParams();
    params.set('context', context.key);
    const lane = searchParams.get('view');
    if (lane) params.set('view', lane);
    return `/workspace?${params.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={`Current context: ${currentLabel}`} className="workspace-switcher" type="button">
          <span className="workspace-switcher-current">
            {onConsole ? <GraduationCap aria-hidden="true" size={14} /> : <Compass aria-hidden="true" size={14} />}
            <span className="workspace-switcher-copy">
              <strong>{currentLabel}</strong>
              {!onConsole && selectedContext?.kind !== 'network' && <small>{selectedContext?.label}</small>}
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="workspace-switcher-chevron" size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="workspace-menu" sideOffset={10}>
        <DropdownMenuLabel className="workspace-menu-label">VERIFIED WORK CONTEXTS</DropdownMenuLabel>
        {contexts.map(context => {
          const active = !onConsole && selectedContext?.key === context.key;
          const roleLabel = contextRoleLabel(context);
          const Icon = context.kind === 'crew' ? Users : Compass;
          const workspacePreference: WorkspaceKey = context.kind === 'school' ? 'school' : 'apt';
          return (
            <div className={`workspace-menu-row ${active ? 'active' : ''}`} key={context.key}>
              <DropdownMenuItem asChild className="workspace-menu-open">
                <a href={workspaceHref(context)}>
                  <Icon aria-hidden="true" size={15} />
                  <span>
                    <strong>{roleLabel}{context.kind === 'school' ? ` · ${context.label}` : ''}</strong>
                    <small>
                      {context.kind === 'network' ? 'Public work, Commons and proof' :
                        context.kind === 'school' ? `${context.role.replace('_', ' ')} · organization context` :
                          `${context.tenderStatus?.replace('_', ' ') ?? 'assigned'} · ${context.label}`}
                    </small>
                  </span>
                  {active && <Check aria-label="Current context" className="workspace-menu-check" size={14} />}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label={`Set ${roleLabel} as your default context`}
                className="workspace-menu-pin"
                disabled={pending || preference === workspacePreference}
                onSelect={event => {
                  event.preventDefault();
                  saveDefault(workspacePreference);
                }}
              >
                <Pin aria-hidden="true" size={13} />
                <span>{preference === workspacePreference ? 'Default' : 'Set default'}</span>
              </DropdownMenuItem>
            </div>
          );
        })}
        <div className={`workspace-menu-row ${onConsole ? 'active' : ''}`}>
          <DropdownMenuItem asChild className="workspace-menu-open">
            <a href={getWorkspaceHref('school')}>
              <GraduationCap aria-hidden="true" size={15} />
              <span><strong>School Console · Local Device</strong><small>School records stay in this browser</small></span>
              {onConsole && <Check aria-label="Current product" className="workspace-menu-check" size={14} />}
            </a>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="workspace-menu-note">
          Contexts are resolved from server-verified membership and assignment. Switching never grants access.
        </DropdownMenuLabel>
        {feedback && <p className={feedback.includes('could not') || feedback.startsWith('Sign in') ? 'workspace-feedback error' : 'workspace-feedback'} role={feedback.includes('could not') ? 'alert' : 'status'}>{feedback}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
