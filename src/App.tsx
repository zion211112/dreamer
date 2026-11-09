import { Switch, Route } from 'wouter';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { InvestorMemo } from './pages/InvestorMemo';
import { People } from './pages/workspace/People';
import { Institutions } from './pages/workspace/Institutions';
import { Network } from './pages/workspace/Network';
import { Commons } from './pages/workspace/Commons';
import { Records } from './pages/workspace/Records';
import { AptCoinLab } from './pages/workspace/AptCoinLab';
import { WorkspaceOverview } from './pages/workspace/WorkspaceOverview';
import { BenbenOS } from './modules/benben-os';
import './modules/benben-os/styles/benben.css';

export function App() {
  return (
    <Switch>
      <Route path="/"><Landing /></Route>
      <Route path="/investor-memo"><InvestorMemo /></Route>
      <Route path="/sign-in"><Auth /></Route>
      <Route path="/sign-up"><Auth /></Route>

      <Route path="/workspace"><WorkspaceOverview /></Route>

      {/* New 5-module routes */}
      <Route path="/workspace/commons"><Commons /></Route>
      <Route path="/workspace/network"><Network /></Route>
      <Route path="/workspace/network/people"><People /></Route>
      <Route path="/workspace/network/institutions"><Institutions /></Route>
      <Route path="/workspace/network/capabilities"><Network /></Route>
      <Route path="/workspace/records"><Records /></Route>
      <Route path="/workspace/records/canon"><Records /></Route>
      <Route path="/workspace/records/annals"><Records /></Route>
      <Route path="/workspace/records/roll"><Records /></Route>
      <Route path="/workspace/intelligence"><AptCoinLab /></Route>
      <Route path="/workspace/intelligence/coin-lab"><AptCoinLab /></Route>
      <Route path="/benben-os"><BenbenOS /></Route>

    </Switch>
  );
}
