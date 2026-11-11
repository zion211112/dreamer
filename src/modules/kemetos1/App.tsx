import { Switch, Route } from 'wouter';
import { Coordinator } from './pages/Coordinator';
import { WorkspaceLayout } from '../../pages/workspace/WorkspaceLayout';
import './styles/kemetos1.css';

export function Kemetos1App() {
  return (
    <WorkspaceLayout currentContext="workbench">
      <Switch>
        <Route path="/workspace/kemetos1"><Coordinator /></Route>
      </Switch>
    </WorkspaceLayout>
  );
}
