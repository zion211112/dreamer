import { Switch, Route } from 'wouter';
import { Workbench } from './pages/Home';
import { Pilot } from './pages/Pilot';

export function WorkbenchApp() {
  return (
    <Switch>
      <Route path="/workspace/workbench/:pilot">
        <Pilot />
      </Route>
      <Route path="/workspace/workbench">
        <Workbench />
      </Route>
    </Switch>
  );
}
