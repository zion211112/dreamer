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
import { Records } from './pages/workspace/Records';
import { AptCoinLab } from './pages/workspace/AptCoinLab';
import { Annals } from './pages/workspace/Annals';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/investor-memo"><InvestorMemo /></Route>
      <Route path="/sign-in"><Auth /></Route>
      <Route path="/sign-up"><Auth /></Route>

      {/* Workspace root -> People (default landing) */}
      <Route path="/workspace"><People /></Route>
      
      {/* New 5-module routes */}
      <Route path="/workspace/commons"><Commons /></Route>
      <Route path="/workspace/network"><Network /></Route>
      <Route path="/workspace/network/people"><People /></Route>
      <Route path="/workspace/network/institutions"><Institutions /></Route>
      <Route path="/workspace/network/capabilities"><Network /></Route>
      <Route path="/workspace/workbench"><WorkbenchFinder /></Route>
      <Route path="/workspace/workbench/field-desk"><Workbench /></Route>
      <Route path="/workspace/workbench/school-console"><SchoolConsole /></Route>
      <Route path="/workspace/records"><Records /></Route>
      <Route path="/workspace/records/canon"><Records /></Route>
      <Route path="/workspace/records/annals"><Records /></Route>
      <Route path="/workspace/records/roll"><Records /></Route>
      <Route path="/workspace/intelligence"><AptCoinLab /></Route>
      <Route path="/workspace/intelligence/coin-lab"><AptCoinLab /></Route>

      {/* Old routes as aliases (wouter has no redirect) */}
      <Route path="/workspace/people"><People /></Route>
      <Route path="/workspace/annals"><Annals /></Route>
      <Route path="/workspace/institutions"><Institutions /></Route>
      <Route path="/workspace/institutions/network"><Network /></Route>
      <Route path="/workspace/institutions/school-console"><SchoolConsole /></Route>
      <Route path="/workspace/workbench/simulate"><Workbench /></Route>
      <Route path="/workspace/field-desk"><Workbench /></Route>
      <Route path="/workspace/apt-coin-lab"><AptCoinLab /></Route>
    </Switch>
  );
}
