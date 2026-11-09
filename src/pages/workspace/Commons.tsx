import { WorkspaceLayout } from './WorkspaceLayout';
import { CommonsExchange } from './commons/CommonsExchange';
import './commons/CommonsExchange.css';

export function Commons() {
  return (
    <WorkspaceLayout currentContext="commons">
      <CommonsExchange />
    </WorkspaceLayout>
  );
}
