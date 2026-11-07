import { WorkspaceLayout } from './WorkspaceLayout';
import { WorkbenchBlockFlow } from '../../components/workbench/WorkbenchBlockFlow';

export function Workbench() {
  return (
    <WorkspaceLayout currentContext="workbench:field-desk">
      <WorkbenchBlockFlow currentContext="workbench:field-desk" />
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
