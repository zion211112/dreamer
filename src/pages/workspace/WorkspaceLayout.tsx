import { WorkspaceShell } from '../../components/WorkspaceShell';
import type { StudioContext } from '../../lib/studio-navigation';
import { getStudioModuleForContext } from '../../lib/studio-navigation';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: StudioContext;
}

export function WorkspaceLayout({ children, currentContext }: WorkspaceLayoutProps) {
  const moduleId = getStudioModuleForContext(currentContext);
  const moduleTheme = moduleId ? `data-module="${moduleId}"` : '';
  return (
    <WorkspaceShell currentContext={currentContext} moduleTheme={moduleTheme}>{children}</WorkspaceShell>
  );
}
