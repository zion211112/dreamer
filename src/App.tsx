import { Switch, Route } from 'wouter';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { InvestorMemo } from './pages/InvestorMemo';
import { People } from './pages/workspace/People';
import { Institutions } from './pages/workspace/Institutions';
import { Network } from './pages/workspace/Network';
import { Commons } from './pages/workspace/Commons';
import { Workbench } from './pages/workspace/FieldDesk';
import { WorkbenchFinder } from './pages/workspace/WorkbenchFinder';
import { SchoolConsole } from './pages/workspace/SchoolConsole';
import { Roll } from './pages/workspace/Roll';
import { AptCoinLab } from './pages/workspace/AptCoinLab';
import { Annals } from './pages/workspace/Annals';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/investor-memo"><InvestorMemo /></Route>
      <Route path="/sign-in"><Auth /></Route>
      <Route path="/sign-up"><Auth /></Route>
      <Route path="/workspace/people"><People /></Route>
      <Route path="/workspace/annals"><Annals /></Route>
      <Route path="/workspace/institutions"><Institutions /></Route>
      <Route path="/workspace/institutions/network"><Network /></Route>
      <Route path="/workspace/institutions/school-console"><SchoolConsole /></Route>
      <Route path="/workspace/commons"><Commons /></Route>
      <Route path="/workspace/workbench"><WorkbenchFinder /></Route>
      <Route path="/workspace/workbench/simulate"><Workbench /></Route>
      <Route path="/workspace/field-desk"><Workbench /></Route>
      <Route path="/workspace/roll"><Roll /></Route>
      <Route path="/workspace/apt-coin-lab"><AptCoinLab /></Route>
    </Switch>
  );
}