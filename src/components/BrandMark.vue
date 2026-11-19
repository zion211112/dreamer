<script setup lang="ts">
import { computed } from 'vue';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  href?: string;
}

const props = defineProps<BrandMarkProps>();

const sizes = {
  sm: '14px',
  md: '16px',
  lg: '24px',
};

const textSize = computed(() => sizes[props.size ?? 'md']);
</script>

<template>
  <a :href="href" class="apt-brandmark" :class="class" aria-label="APT-LABS">
    <span class="apt-brandmark-symbol" aria-hidden="true">A</span>
    <span class="apt-brandmark-dash" aria-hidden="true">—</span>
    <span class="apt-brandmark-label" :style="{ fontSize: textSize }">Apt Labs</span>
  </a>
</template>

<style scoped>
.apt-brandmark {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  text-decoration: none;
  color: inherit;
}

.apt-brandmark-symbol {
  font-family: var(--apt-font-serif);
  font-weight: var(--apt-font-weight-semibold);
  font-size: 24px;
  color: var(--apt-color-brand-primary);
  line-height: 1;
}

.apt-brandmark-dash {
  color: var(--apt-color-brand-accent);
  font-weight: var(--apt-font-weight-semibold);
  font-size: 14px;
  line-height: 1;
}

.apt-brandmark-label {
  font-family: var(--apt-font-serif);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
}
</style>

