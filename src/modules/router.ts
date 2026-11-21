/**
 * APT-LABS — Vue Router (full site).
 *
 * All routes served by Vue 3. The nine workspace modules nest under
 * WorkspaceShell, which owns the frame (topbar · 64px rail · 232px nav ·
 * content · 360px agent dock). Module identity lives in src/shell/registry.ts;
 * the shell resolves the active module from the path via moduleForPath().
 */

import { createRouter, createWebHistory } from 'vue-router';
import Landing from '@/pages/Landing.vue';
import Auth from '@/pages/Auth.vue';
import WorkspaceShell from '@/shell/WorkspaceShell.vue';
import WorkspaceOverview from '@/pages/workspace/WorkspaceOverview.vue';
import Commons from '@/pages/workspace/Commons.vue';
import Coordination from '@/pages/workspace/Coordination.vue';
import Network from '@/pages/workspace/Network.vue';
import People from '@/pages/workspace/People.vue';
import Institutions from '@/pages/workspace/Institutions.vue';
import Records from '@/pages/workspace/Records.vue';
import Proof from '@/pages/workspace/Proof.vue';
import Value from '@/pages/workspace/Value.vue';
import WorkbenchHome from '@/modules/workbench/pages-vue/Home.vue';
import PilotPage from '@/modules/workbench/pages-vue/Pilot.vue';
import Intelligence from '@/modules/intelligence/pages/Intelligence.vue';
import Kemetos1App from '@/modules/kemetos1/pages/Coordinator.vue';
import DesignLab from '@/pages/DesignLab.vue';
import BenbenOS from '@/modules/benben-os/pages/Dashboard.vue';

const routes = [
  { path: '/', redirect: '/landing' },
  { path: '/landing', component: Landing },
  { path: '/sign-in', component: Auth },
  { path: '/sign-up', component: Auth },

  {
    path: '/workspace',
    component: WorkspaceShell,
    children: [
      // overview — the chain
      { path: '', component: WorkspaceOverview, name: 'workspace-overview' },
      // commons — intention
      { path: 'commons', component: Commons, name: 'workspace-commons' },
      // network — actor / capability / resource
      { path: 'network', component: Network, name: 'workspace-network' },
      { path: 'network/people', component: People, name: 'workspace-people' },
      { path: 'network/institutions', component: Institutions, name: 'workspace-institutions' },
      { path: 'network/capabilities', component: Network, name: 'workspace-capabilities' },
      // coordination — authority / commitment
      { path: 'coordination', component: Coordination, name: 'workspace-coordination' },
      // workbench — work
      { path: 'workbench', component: WorkbenchHome, name: 'workspace-workbench' },
      { path: 'workbench/:pilot', component: PilotPage, name: 'workspace-pilot' },
      // proof — evidence / verification
      { path: 'proof', component: Proof, name: 'workspace-proof' },
      // records — knowledge / memory
      { path: 'records', component: Records, name: 'workspace-records' },
      { path: 'records/canon', component: Records, name: 'workspace-records-canon' },
      { path: 'records/annals', component: Records, name: 'workspace-records-annals' },
      { path: 'records/roll', component: Records, name: 'workspace-records-roll' },
      // value — outcome / value (absorbs coin-lab)
      { path: 'value', component: Value, name: 'workspace-value' },
      { path: 'value/coin-lab', redirect: '/workspace/value' },
      // intelligence — matching / forecasting / agents
      { path: 'intelligence', component: Intelligence, name: 'workspace-intelligence' },
      { path: 'intelligence/coin-lab', redirect: '/workspace/value' },
      { path: 'kemetos1', component: Kemetos1App, name: 'workspace-kemetos1' },
      // design-lab — scratch tool, renders under the overview accent
      { path: 'design-lab', component: DesignLab, name: 'workspace-design-lab' },
    ],
  },

  { path: '/benben-os', component: BenbenOS },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
