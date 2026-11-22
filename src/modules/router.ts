/**
 * APT-LABS — Vue Router (lean masterpiece).
 *
 * Five workspace destinations nest under WorkspaceShell, per charter B1:
 *   Home (/workspace) — personal shell context, quick acts, module selection
 *   Commons (/workspace/commons) — intentions, needs, offers
 *   Network (/workspace/network) — actors, capabilities, resources
 *   Work (/workspace/work) — proof-carrying work units
 *   Assets & Value (/workspace/assets-value) — asset registry, capacity, exchange, settled outcomes, records
 *
 * Home is the context in which the four productive destinations are entered.
 * School Console remains nested under Work, not a primary module.
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
import Value from '@/pages/workspace/Value.vue';
import Records from '@/pages/workspace/Records.vue';
import WorkbenchHome from '@/modules/workbench/pages-vue/Home.vue';
import PilotPage from '@/modules/workbench/pages-vue/Pilot.vue';
import Intelligence from '@/modules/intelligence/pages/Intelligence.vue';

const routes = [
  { path: '/', redirect: '/landing' },
  { path: '/landing', component: Landing },
  { path: '/sign-in', component: Auth },
  { path: '/sign-up', component: Auth },

  {
    path: '/workspace',
    component: WorkspaceShell,
    children: [
      // Home — personal shell context
      { path: '', component: WorkspaceOverview, name: 'workspace-home' },
      // Commons — intentions
      { path: 'commons', component: Commons, name: 'workspace-commons' },
      // Network — actors, capabilities, resources
      { path: 'network', component: Network, name: 'workspace-network' },
      { path: 'network/people', component: People, name: 'workspace-people' },
      { path: 'network/institutions', component: Institutions, name: 'workspace-institutions' },
      { path: 'network/capabilities', component: Network, name: 'workspace-capabilities' },
      // Work — workbench (pilot lanes, commitment journey)
      { path: 'workbench', component: WorkbenchHome, name: 'workspace-workbench' },
      { path: 'workbench/:pilot', component: PilotPage, name: 'workspace-pilot' },
      // Value — outcome settlement, economic records
      { path: 'value', component: Value, name: 'workspace-value' },
      // Records — canon, annals, roll lenses
      { path: 'records', component: Records, name: 'workspace-records' },
      { path: 'records/canon', component: Records, name: 'workspace-records-canon' },
      { path: 'records/annals', component: Records, name: 'workspace-records-annals' },
      { path: 'records/roll', component: Records, name: 'workspace-records-roll' },
      // Intelligence — matching, forecasting, agents
      { path: 'intelligence', component: Intelligence, name: 'workspace-intelligence' },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
