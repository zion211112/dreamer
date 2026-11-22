<script setup lang="ts">
/**
 * Avatar — Structural Emergence
 * Represents an actor (person, crew, institution). Initials fallback, no decorative frames.
 * Size scale rooted in spacing system.
 */
import { computed } from 'vue';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  class?: string;
  shape?: 'circle' | 'square';
  status?: 'online' | 'away' | 'busy' | 'offline';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const props = defineProps<AvatarProps>();

const avatarSizeMap = {
  xs: 'var(--apt-avatar-size-xs)',
  sm: 'var(--apt-avatar-size-sm)',
  md: 'var(--apt-avatar-size-md)',
  lg: 'var(--apt-avatar-size-lg)',
  xl: 'var(--apt-avatar-size-xl)',
} as const;

const size = computed(() => avatarSizeMap[props.size ?? 'md']);
const initials = computed(() => {
  if (!props.name) return '?';
  const parts = props.name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

const bgColor = computed(() => {
  // Deterministic color from name for consistency
  if (!props.name) return 'var(--apt-avatar-bg)';
  let hash = 0;
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [
    'var(--apt-family-actor)',
    'var(--apt-family-capability)',
    'var(--apt-family-resource)',
    'var(--apt-family-place)',
    'var(--apt-family-intention)',
    'var(--apt-family-commitment)',
    'var(--apt-family-work)',
    'var(--apt-family-evidence)',
  ];
  return hues[Math.abs(hash) % hues.length];
});

const textColor = computed(() => {
  // Light text on dark backgrounds, dark text on light
  return 'var(--apt-avatar-text)';
});

const fontSize = computed(() => {
  const base = parseFloat(size.value);
  return `${Math.round(base * 0.38)}px`;
});

const sizeClass = computed(() => `apt-avatar--${props.size ?? 'md'}`);
const shape = computed(() => props.shape ?? 'circle');

function onImageError() {
  // Image failed to load, initials will show via v-else
}
</script>

<template>
  <div
    class="apt-avatar"
    :class="[shape, sizeClass, status ? `apt-avatar--has-status` : '']"
    :style="{
      width: size,
      height: size,
      fontSize: fontSize,
      borderRadius: shape === 'square' ? 'var(--apt-radius-r1)' : 'var(--apt-avatar-radius)',
    }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt || (name ? `Avatar for ${name}` : 'Avatar')"
      class="apt-avatar-img"
      :style="{ borderRadius: shape === 'square' ? 'var(--apt-radius-r1)' : 'var(--apt-avatar-radius)' }"
      @error="onImageError"
    />
    <span
      v-else
      class="apt-avatar-initials"
      :style="{ background: bgColor, color: textColor }"
      aria-hidden="true"
    >
      {{ initials }}
    </span>

    <span
      v-if="status"
      class="apt-avatar-status"
      :class="`apt-avatar-status--${statusPosition ?? 'bottom-right'}`"
      :data-status="status"
      aria-label="Status: {{ status }}"
    />
  </div>
</template>

<style scoped>
.apt-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--apt-avatar-bg);
  border: var(--apt-avatar-border-width) solid var(--apt-avatar-border-color);
  font-family: var(--apt-font-sans);
  font-weight: var(--apt-avatar-font-weight);
  line-height: 1;
  vertical-align: middle;
}

.apt-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.apt-avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Status indicator */
.apt-avatar-status {
  position: absolute;
  width: 25%;
  height: 25%;
  min-width: 8px;
  min-height: 8px;
  border: var(--apt-avatar-border-width) solid var(--apt-avatar-border-color);
  border-radius: 50%;
  background: var(--apt-color-neutral-n400);
}

.apt-avatar-status[data-status="online"] { background: var(--apt-color-state-canon); }
.apt-avatar-status[data-status="away"] { background: var(--apt-color-state-caution); }
.apt-avatar-status[data-status="busy"] { background: var(--apt-color-state-alert); }
.apt-avatar-status[data-status="offline"] { background: var(--apt-color-neutral-n400); }

/* Positions */
.apt-avatar-status--bottom-right { bottom: -2px; right: -2px; }
.apt-avatar-status--bottom-left { bottom: -2px; left: -2px; }
.apt-avatar-status--top-right { top: -2px; right: -2px; }
.apt-avatar-status--top-left { top: -2px; left: -2px; }

/* Size classes for any size-specific adjustments */
.apt-avatar--xs .apt-avatar-status { width: 30%; height: 30%; }
.apt-avatar--xl .apt-avatar-status { width: 20%; height: 20%; }
</style>