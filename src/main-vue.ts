/**
 * APT-LABS — Vue 3 Foundation Entry Point (full site)
 *
 * Single-stack entry: all routes served by Vue 3 + Pinia + Vue Router.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from '@/modules/router';
import AppShell from '@/components/AppShell.vue';
import '@/assets/css/apt-tokens.css';

const pinia = createPinia();
const app = createApp(AppShell);
app.use(pinia);
app.use(router);
app.mount('#app-vue');

export { app, pinia, router };
