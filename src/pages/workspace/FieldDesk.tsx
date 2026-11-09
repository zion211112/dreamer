import { WorkspaceLayout } from './WorkspaceLayout';
import { WorkbenchBlockFlow } from '../../components/workbench/WorkbenchBlockFlow';

export function Workbench() {
  return (
    <WorkspaceLayout currentContext="workbench:field-desk">
      <div className="workbench-page">
        <div className="workbench-head">
          <div className="workbench-heading">
            <span className="eyebrow">Workbench</span>
            <h1>Field Desk</h1>
            <p className="workbench-intro">Scope, assemble, coordinate, and manage productive work across the network.</p>
          </div>
        </div>
        <WorkbenchBlockFlow currentContext="workbench:field-desk" />
      </div>
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
