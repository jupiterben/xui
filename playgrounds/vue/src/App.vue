<script setup lang="ts">
import type { XuiThemeGeneratorOptions } from '@xui/core';
import { XuiButton, XuiFlex, XuiGrid, XuiList, XuiSwitch, XuiThemeDesigner, XuiTree, useToggle } from '@xui/vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT,
  readThemeGenerationHistory,
  saveThemeGenerationHistory,
  type XuiThemeGenerationHistoryItem,
  type XuiThemeGenerationOutput
} from '../../theme-history';

const state = useToggle(true);
const history = ref<XuiThemeGenerationHistoryItem[]>(readThemeGenerationHistory());
const appliedHistory = ref<XuiThemeGenerationHistoryItem | undefined>();

function refreshHistory() {
  history.value = readThemeGenerationHistory();
}

function formatHistoryTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

onMounted(() => {
  window.addEventListener(XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT, refreshHistory);
  window.addEventListener('storage', refreshHistory);
});

onBeforeUnmount(() => {
  window.removeEventListener(XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT, refreshHistory);
  window.removeEventListener('storage', refreshHistory);
});

async function generateThemeWithModel(prompt: string, options?: XuiThemeGeneratorOptions) {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image: options?.image })
  });

  if (!response.ok) {
    throw new Error('Theme API request failed');
  }

  const payload = (await response.json()) as XuiThemeGenerationOutput;
  saveThemeGenerationHistory('vue', prompt, options?.image, payload);
  return payload.theme;
}

const listItems = [
  { id: 'install', label: 'Install', description: '引入对应框架适配包' },
  { id: 'compose', label: 'Compose', description: '用 slot 自定义结构和样式' },
  { id: 'ship', label: 'Ship', description: '复用 core 中的交互逻辑' }
];

const treeNodes = [
  {
    id: 'packages',
    label: 'packages',
    children: [
      { id: 'core', label: '@xui/core' },
      { id: 'vue', label: '@xui/vue' },
      { id: 'react', label: '@xui/react' }
    ]
  },
  {
    id: 'playgrounds',
    label: 'playgrounds',
    children: [
      { id: 'vue-playground', label: 'vue' },
      { id: 'react-playground', label: 'react' }
    ]
  }
];
</script>

<template>
  <main class="mx-auto min-h-screen max-w-7xl px-[var(--xui-space-6)] py-12">
    <header class="mb-[var(--xui-space-6)]">
      <p class="text-xs uppercase tracking-[0.35em] text-[var(--xui-accent)]">xui vue playground</p>
      <h1 class="mt-3 text-4xl font-bold">Vue Headless UI Demo</h1>
      <p class="mt-3 text-[var(--xui-muted)]">
        通过 Tailwind 自定义样式，演示 <code>@xui/vue</code> 的无样式交互逻辑。
      </p>
    </header>

    <div class="grid gap-[var(--xui-space-6)] lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] lg:items-start">
      <aside class="min-w-0 space-y-[var(--xui-space-6)]">
        <XuiThemeDesigner
          :key="appliedHistory?.id ?? 'default-theme-designer'"
          class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-5)] shadow-[var(--xui-shadow-md)]"
          :initial-prompt="appliedHistory?.input.prompt"
          :initial-theme="appliedHistory?.output.theme"
          :theme-generator="generateThemeWithModel"
        />

        <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-5)] shadow-[var(--xui-shadow-md)]">
          <div class="flex flex-wrap items-start justify-between gap-[var(--xui-space-3)]">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">History</p>
              <h2 class="mt-2 text-xl font-semibold">生成历史</h2>
            </div>
            <span class="rounded-full border border-[var(--xui-border)] px-2.5 py-1 text-xs text-[var(--xui-muted)]">
              {{ history.length }} 条
            </span>
          </div>

          <div v-if="history.length" class="mt-[var(--xui-space-4)] grid gap-[var(--xui-space-3)]">
            <article
              v-for="item in history"
              :key="item.id"
              class="rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] bg-[var(--xui-bg)] p-[var(--xui-space-3)] transition"
              :class="appliedHistory?.id === item.id ? 'border-[var(--xui-accent)] shadow-[var(--xui-focus-ring)]' : 'border-[var(--xui-border)]'"
            >
              <div class="flex flex-wrap items-start justify-between gap-[var(--xui-space-3)]">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--xui-muted)]">
                    <span>{{ formatHistoryTime(item.createdAt) }}</span>
                    <span class="rounded-full bg-[var(--xui-surface-muted)] px-2 py-0.5">{{ item.playground }}</span>
                    <span v-if="item.output.source">{{ item.output.source }}</span>
                  </div>
                  <p class="mt-2 truncate text-sm font-medium">{{ item.output.theme.name }}</p>
                  <p class="mt-1 line-clamp-2 text-xs text-[var(--xui-muted)]">{{ item.input.prompt }}</p>
                </div>
                <button
                  class="shrink-0 rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)] focus:shadow-[var(--xui-focus-ring)]"
                  type="button"
                  @click="appliedHistory = item"
                >
                  应用
                </button>
              </div>
              <div class="mt-[var(--xui-space-3)] flex gap-2">
                <span
                  v-for="color in [item.output.theme.accent, item.output.theme.secondary, item.output.theme.background]"
                  :key="color"
                  class="h-5 w-10 rounded-[var(--xui-radius-sm)] border border-[var(--xui-border)]"
                  :style="{ backgroundColor: color }"
                  :title="color"
                />
              </div>
            </article>
          </div>
          <p v-else class="mt-[var(--xui-space-4)] text-sm text-[var(--xui-muted)]">暂无生成历史。</p>
        </section>
      </aside>

      <div class="min-w-0 space-y-[var(--xui-space-6)]">
        <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Vue</p>
              <h2 class="mt-2 text-xl font-semibold">XuiButton</h2>
            </div>
            <span class="rounded-full border border-[var(--xui-border)] px-2.5 py-1 text-xs text-[var(--xui-accent)]">
              @xui/vue
            </span>
          </div>

          <p class="mt-4 text-sm text-[var(--xui-muted)]">支持 Hover、Active 状态切换。</p>

          <div class="mt-[var(--xui-space-5)] flex flex-wrap items-center gap-[var(--xui-space-3)]">
            <XuiButton variant="primary">Primary</XuiButton>
            <XuiButton variant="secondary">Secondary</XuiButton>
            <XuiButton variant="outline">Outline</XuiButton>
            <XuiButton variant="ghost">Ghost</XuiButton>
          </div>

          <div class="mt-[var(--xui-space-4)] flex flex-wrap items-center gap-[var(--xui-space-3)]">
            <XuiButton size="sm">Small</XuiButton>
            <XuiButton size="md">Medium</XuiButton>
            <XuiButton size="lg">Large</XuiButton>
          </div>

          <div class="mt-[var(--xui-space-4)] flex flex-wrap items-center gap-[var(--xui-space-3)]">
            <XuiButton disabled>Disabled</XuiButton>
            <XuiButton variant="outline" disabled>Disabled</XuiButton>
          </div>
        </section>

        <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Vue</p>
              <h2 class="mt-2 text-xl font-semibold">XuiSwitch</h2>
            </div>
            <span class="rounded-full border border-[var(--xui-border)] px-2.5 py-1 text-xs text-[var(--xui-accent)]">
              @xui/vue
            </span>
          </div>

          <p class="mt-4 text-sm text-[var(--xui-muted)]">Vue 适配层复用同一套 core toggle 逻辑。</p>

          <XuiSwitch v-slot="{ checked }">
            <span
              class="mt-[var(--xui-space-5)] inline-flex items-center rounded-[var(--xui-radius-full)] px-[var(--xui-space-4)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] font-medium transition"
              :class="checked ? 'bg-[var(--xui-accent)] text-[var(--xui-accent-contrast)]' : 'bg-[var(--xui-surface-muted)] text-[var(--xui-text)]'"
            >
              {{ checked ? 'ON' : 'OFF' }}
            </span>
          </XuiSwitch>

          <div class="mt-[var(--xui-space-6)] flex flex-wrap items-center gap-[var(--xui-space-3)]">
            <button
              class="rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)] focus:shadow-[var(--xui-focus-ring)]"
              type="button"
              @click="state.toggle"
            >
              Toggle via useToggle
            </button>
            <span class="text-sm text-[var(--xui-muted)]">当前: {{ state.checked ? 'ON' : 'OFF' }}</span>
          </div>
        </section>

        <XuiGrid min-column-width="240px" gap="var(--xui-space-4)">
          <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">List</p>
            <h2 class="mt-2 text-xl font-semibold">XuiList</h2>
            <XuiList class="mt-5 space-y-3" :items="listItems" v-slot="{ item, index }">
              <div class="rounded-lg border border-[var(--xui-border)] bg-[var(--xui-bg)] p-3">
                <p class="text-sm font-medium">{{ index + 1 }}. {{ item.label }}</p>
                <p class="mt-1 text-xs text-[var(--xui-muted)]">{{ item.description }}</p>
              </div>
            </XuiList>
          </section>

          <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Flex</p>
            <h2 class="mt-2 text-xl font-semibold">XuiFlex</h2>
            <XuiFlex class="mt-5" wrap align="center" gap="0.75rem">
              <span class="rounded-full bg-[var(--xui-accent)] px-3 py-1 text-sm text-[var(--xui-accent-contrast)]">Start</span>
              <span class="rounded-full bg-[var(--xui-surface-muted)] px-3 py-1 text-sm text-[var(--xui-text)]">Middle</span>
              <span class="rounded-full bg-[var(--xui-secondary)] px-3 py-1 text-sm text-[var(--xui-secondary-contrast)]">End</span>
            </XuiFlex>
          </section>

          <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Grid</p>
            <h2 class="mt-2 text-xl font-semibold">XuiGrid</h2>
            <XuiGrid class="mt-5" :columns="3" gap="0.75rem">
              <div v-for="item in ['A', 'B', 'C', 'D', 'E', 'F']" :key="item" class="rounded-lg bg-[var(--xui-surface-muted)] p-4 text-center text-sm">
                {{ item }}
              </div>
            </XuiGrid>
          </section>

          <section class="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Tree</p>
            <h2 class="mt-2 text-xl font-semibold">XuiTree</h2>
            <XuiTree class="mt-5 space-y-2 text-sm" :nodes="treeNodes" v-slot="{ node, depth }">
              <span class="inline-flex rounded-md px-2 py-1" :class="depth === 0 ? 'bg-[var(--xui-surface-muted)] text-[var(--xui-text)]' : 'text-[var(--xui-muted)]'">
                {{ node.label }}
              </span>
            </XuiTree>
          </section>
        </XuiGrid>
      </div>
    </div>
  </main>
</template>
