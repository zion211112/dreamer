import { Switch, Route } from 'wouter';
import { Workbench } from './pages/Home';
import { Pilot } from './pages/Pilot';
import { WorkspaceLayout } from '../../pages/workspace/WorkspaceLayout';

export function WorkbenchApp() {
  return (
    <WorkspaceLayout currentContext="workbench">
      <Switch>
        <Route path="/workspace/workbench/:pilot">
          <Pilot />
        </Route>
        <Route path="/workspace/workbench">
          <Workbench />
        </Route>
      </Switch>
    </WorkspaceLayout>
  );
}
