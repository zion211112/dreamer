import { WorkspaceShell } from '../../components/WorkspaceShell';
import type { StudioContext } from '../../lib/studio-navigation';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: StudioContext;
}

export function WorkspaceLayout({ children, currentContext }: WorkspaceLayoutProps) {
  return (
    <WorkspaceShell currentContext={currentContext}>{children}</WorkspaceShell>
  );
}
