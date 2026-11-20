/**
 * APT-LABS — Vue Router (full site).
 *
 * All routes served by Vue 3.
 */

import { createRouter, createWebHistory } from 'vue-router';
import Landing from '@/pages/Landing.vue';
import Auth from '@/pages/Auth.vue';
import WorkspaceOverview from '@/pages/workspace/WorkspaceOverview.vue';
import WorkbenchHome from '@/modules/workbench/pages-vue/Home.vue';
import PilotPage from '@/modules/workbench/pages-vue/Pilot.vue';
import Kemetos1App from '@/modules/kemetos1/pages/Coordinator.vue';
import Commons from '@/pages/workspace/Commons.vue';
import Coordination from '@/pages/workspace/Coordination.vue';
import Network from '@/pages/workspace/Network.vue';
import People from '@/pages/workspace/People.vue';
import Institutions from '@/pages/workspace/Institutions.vue';
import Records from '@/pages/workspace/Records.vue';
import Intelligence from '@/modules/intelligence/pages/Intelligence.vue';
import AptCoinLab from '@/pages/workspace/AptCoinLab.vue';
import DesignLab from '@/pages/DesignLab.vue';
import BenbenOS from '@/modules/benben-os/pages/Dashboard.vue';

const routes = [
  { path: '/', redirect: '/landing' },
  { path: '/landing', component: Landing },
  { path: '/sign-in', component: Auth },
  { path: '/sign-up', component: Auth },

  { path: '/workspace', component: WorkspaceOverview },
  { path: '/workspace/workbench', component: WorkbenchHome },
  { path: '/workspace/workbench/:pilot', component: PilotPage },
  { path: '/workspace/kemetos1', component: Kemetos1App },
  { path: '/workspace/coordination', component: Coordination },
  { path: '/workspace/commons', component: Commons },
  { path: '/workspace/network', component: Network },
  { path: '/workspace/network/people', component: People },
  { path: '/workspace/network/institutions', component: Institutions },
  { path: '/workspace/network/capabilities', component: Network },
  { path: '/workspace/records', component: Records },
  { path: '/workspace/records/canon', component: Records },
  { path: '/workspace/records/annals', component: Records },
  { path: '/workspace/records/roll', component: Records },
  { path: '/workspace/intelligence', component: Intelligence },
  { path: '/workspace/intelligence/coin-lab', component: AptCoinLab },
  { path: '/workspace/design-lab', component: DesignLab },

  { path: '/benben-os', component: BenbenOS },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
