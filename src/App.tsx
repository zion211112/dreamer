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
import { WorkbenchCapacityFinder } from './pages/workspace/WorkbenchCapacityFinder';
import { SchoolConsoleModule } from './modules/assets/school-console';
import { Records } from './pages/workspace/Records';
import { AptCoinLab } from './pages/workspace/AptCoinLab';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/investor-memo"><InvestorMemo /></Route>
      <Route path="/sign-in"><Auth /></Route>
      <Route path="/sign-up"><Auth /></Route>

      {/* New 5-module routes */}
      <Route path="/workspace/commons"><Commons /></Route>
      <Route path="/workspace/network"><Network /></Route>
      <Route path="/workspace/network/people"><People /></Route>
      <Route path="/workspace/network/institutions"><Institutions /></Route>
      <Route path="/workspace/network/capabilities"><Network /></Route>
      <Route path="/workspace/workbench/plan"><WorkbenchCapacityFinder view="plan" /></Route>
      <Route path="/workspace/workbench/examples"><WorkbenchFinder /></Route>
      <Route path="/workspace/workbench/field-desk"><Workbench /></Route>
      <Route path="/workspace/workbench"><WorkbenchCapacityFinder view="matching" /></Route>
      <Route path="/workspace/assets/school-console"><SchoolConsoleModule /></Route>
      <Route path="/workspace/records"><Records /></Route>
      <Route path="/workspace/records/canon"><Records /></Route>
      <Route path="/workspace/records/annals"><Records /></Route>
      <Route path="/workspace/records/roll"><Records /></Route>
      <Route path="/workspace/intelligence"><AptCoinLab /></Route>
      <Route path="/workspace/intelligence/coin-lab"><AptCoinLab /></Route>

    </Switch>
  );
}