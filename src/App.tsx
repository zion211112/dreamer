import { Switch, Route } from 'wouter';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { People } from './pages/workspace/People';
import { Institutions } from './pages/workspace/Institutions';
import { Commons } from './pages/workspace/Commons';
import { Workbench } from './pages/workspace/FieldDesk';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/sign-in"><Auth /></Route>
      <Route path="/sign-up"><Auth /></Route>
      <Route path="/workspace/people"><People /></Route>
      <Route path="/workspace/institutions"><Institutions /></Route>
      <Route path="/workspace/commons"><Commons /></Route>
      <Route path="/workspace/workbench"><Workbench /></Route>
      <Route path="/workspace/field-desk"><Workbench /></Route>
    </Switch>
  );
}