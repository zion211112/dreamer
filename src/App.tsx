import { Switch, Route } from 'wouter';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { People } from './pages/workspace/People';
import { Institutions } from './pages/workspace/Institutions';
import { Commons } from './pages/workspace/Commons';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/sign-in"><Auth mode="sign-in" /></Route>
      <Route path="/sign-up"><Auth mode="sign-up" /></Route>
      <Route path="/workspace/people"><People /></Route>
      <Route path="/workspace/institutions"><Institutions /></Route>
      <Route path="/workspace/commons"><Commons /></Route>
    </Switch>
  );
}
