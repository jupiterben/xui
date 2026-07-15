<script setup lang="ts">
import { canActivate } from '@xui/core';
import { computed } from 'vue';

type xButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type xButtonSize = 'sm' | 'md' | 'lg';

const props = defineProps<{
  variant?: xButtonVariant;
  size?: xButtonSize;
  disabled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const interactive = computed(() =>
  canActivate({ disabled: props.disabled, loading: props.loading })
);

function onClick(event: MouseEvent) {
  if (!interactive.value) return;
  emit('click', event);
}
</script>

<template>
  <button
    class="xui-button"
    :class="[`xui-button--${variant ?? 'primary'}`, `xui-button--${size ?? 'md'}`]"
    :disabled="!interactive"
    :aria-busy="loading || undefined"
    :data-loading="loading || undefined"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.xui-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--xui-space-2);
  border: var(--xui-border-width) solid transparent;
  border-radius: var(--xui-radius-md);
  font-family: var(--xui-font-family);
  font-weight: var(--xui-font-weight-medium);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background var(--xui-transition-fast),
    border-color var(--xui-transition-fast),
    box-shadow var(--xui-transition-fast),
    transform 100ms ease;
}

/* Sizes */
.xui-button--sm {
  height: 30px;
  padding: 0 var(--xui-space-2);
  font-size: var(--xui-font-size-xs);
  border-radius: var(--xui-radius-sm);
}

.xui-button--md {
  height: 36px;
  padding: 0 var(--xui-space-3);
  font-size: var(--xui-font-size-sm);
}

.xui-button--lg {
  height: 44px;
  padding: 0 var(--xui-space-4);
  font-size: var(--xui-font-size-base);
}

/* Primary */
.xui-button--primary {
  background: var(--xui-accent);
  color: var(--xui-accent-contrast);
  border-color: var(--xui-accent);
}

.xui-button--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.xui-button--primary:active:not(:disabled) {
  filter: brightness(0.94);
  transform: scale(0.98);
}

/* Secondary */
.xui-button--secondary {
  background: var(--xui-secondary);
  color: var(--xui-secondary-contrast);
  border-color: var(--xui-secondary);
}

.xui-button--secondary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.xui-button--secondary:active:not(:disabled) {
  filter: brightness(0.94);
  transform: scale(0.98);
}

/* Outline */
.xui-button--outline {
  background: transparent;
  color: var(--xui-accent);
  border-color: var(--xui-border);
}

.xui-button--outline:hover:not(:disabled) {
  background: var(--xui-accent-soft);
  border-color: var(--xui-accent);
}

.xui-button--outline:active:not(:disabled) {
  filter: brightness(0.9);
  transform: scale(0.98);
}

/* Ghost */
.xui-button--ghost {
  background: transparent;
  color: var(--xui-text);
  border-color: transparent;
}

.xui-button--ghost:hover:not(:disabled) {
  background: var(--xui-surface-muted);
}

.xui-button--ghost:active:not(:disabled) {
  background: var(--xui-surface);
  transform: scale(0.98);
}

/* Disabled */
.xui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  filter: none !important;
}

/* Focus */
.xui-button:focus-visible {
  outline: none;
  box-shadow: var(--xui-focus-ring);
}
</style>
