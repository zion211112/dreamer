/**
 * APT-LABS — Vue Router (lean masterpiece).
 *
 * Five workspace modules nest under WorkspaceShell, which owns the frame
 * (topbar · 64px rail · 232px nav · content · 360px agent dock). Module
 * identity lives in src/shell/registry.ts; the shell resolves the active
 * module from the path via moduleForPath().
 *
 * Removed: DesignLab (scratch tool), BenbenOS (separate prototype),
 * Proof (absorbed into Records), Tenders/Failed-Projects/Investment/
 * University/High School (not yet built — reserved for later gates).
 */

import { createRouter, createWebHistory } from 'vue-router';
import Landing from '@/pages/Landing.vue';
import Auth from '@/pages/Auth.vue';
import WorkspaceShell from '@/shell/WorkspaceShell.vue';
import WorkspaceOverview from '@/pages/workspace/WorkspaceOverview.vue';
import Commons from '@/pages/workspace/Commons.vue';
import Network from '@/pages/workspace/Network.vue';
import People from '@/pages/workspace/People.vue';
import Institutions from '@/pages/workspace/Institutions.vue';
import WorkbenchHome from '@/modules/workbench/pages-vue/Home.vue';
import PilotPage from '@/modules/workbench/pages-vue/Pilot.vue';
import Records from '@/pages/workspace/Records.vue';
import Intelligence from '@/modules/intelligence/pages/Intelligence.vue';
import Kemetos1App from '@/modules/kemetos1/pages/Coordinator.vue';
import Value from '@/pages/workspace/Value.vue';

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
      // commons / network — intention + actor capability resource
      { path: 'commons', component: Commons, name: 'workspace-commons' },
      { path: 'network', component: Network, name: 'workspace-network' },
      { path: 'network/people', component: People, name: 'workspace-people' },
      { path: 'network/institutions', component: Institutions, name: 'workspace-institutions' },
      { path: 'network/capabilities', component: Network, name: 'workspace-capabilities' },
      // workbench — work
      { path: 'workbench', component: WorkbenchHome, name: 'workspace-workbench' },
      { path: 'workbench/:pilot', component: PilotPage, name: 'workspace-pilot' },
      // records / intelligence — memory + matching
      { path: 'records', component: Records, name: 'workspace-records' },
      { path: 'records/canon', component: Records, name: 'workspace-records-canon' },
      { path: 'records/annals', component: Records, name: 'workspace-records-annals' },
      { path: 'records/roll', component: Records, name: 'workspace-records-roll' },
      { path: 'intelligence', component: Intelligence, name: 'workspace-intelligence' },
      { path: 'intelligence/coin-lab', redirect: '/workspace/value' },
      { path: 'kemetos1', component: Kemetos1App, name: 'workspace-kemetos1' },
      // value — outcome / value
      { path: 'value', component: Value, name: 'workspace-value' },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
