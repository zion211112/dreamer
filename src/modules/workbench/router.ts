/**
 * APT-LABS — Vue Router for the Vue 3 workbench entry point.
 *
 * Isolated from the Preach/wouter router (separate HTML entry point per mandate B9).
 * Routes mirror the Preact workbench routes so both entry points share the same URL shape.
 */

import { createRouter, createWebHistory } from 'vue-router';
import WorkbenchHome from './pages-vue/Home';
import PilotPage from './pages-vue/Pilot';

const routes = [
  { path: '/', redirect: '/workbench' },
  { path: '/workbench', component: WorkbenchHome },
  { path: '/workbench/:pilot', component: PilotPage, props: true },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
