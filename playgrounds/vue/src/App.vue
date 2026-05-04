<script setup lang="ts">
import { XuiFlex, XuiGrid, XuiList, XuiSwitch, XuiTree, useToggle } from '@xui/vue';

const state = useToggle(true);

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
  <main class="mx-auto min-h-screen max-w-3xl px-6 py-12">
    <header class="mb-10">
      <p class="text-xs uppercase tracking-[0.35em] text-emerald-300">xui vue playground</p>
      <h1 class="mt-3 text-4xl font-bold">Vue Headless UI Demo</h1>
      <p class="mt-3 text-slate-300">
        通过 Tailwind 自定义样式，演示 <code>@xui/vue</code> 的无样式交互逻辑。
      </p>
    </header>

    <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">Vue</p>
          <h2 class="mt-2 text-xl font-semibold">XuiSwitch</h2>
        </div>
        <span class="rounded-full border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-200">
          @xui/vue
        </span>
      </div>

      <p class="mt-4 text-sm text-slate-400">Vue 适配层复用同一套 core toggle 逻辑。</p>

      <XuiSwitch v-slot="{ checked }">
        <span
          class="mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition"
          :class="checked ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'"
        >
          {{ checked ? 'ON' : 'OFF' }}
        </span>
      </XuiSwitch>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          class="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          type="button"
          @click="state.toggle"
        >
          Toggle via useToggle
        </button>
        <span class="text-sm text-slate-300">当前: {{ state.checked ? 'ON' : 'OFF' }}</span>
      </div>
    </section>

    <XuiGrid class="mt-6" min-column-width="240px" gap="1rem">
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">List</p>
        <h2 class="mt-2 text-xl font-semibold">XuiList</h2>
        <XuiList class="mt-5 space-y-3" :items="listItems" v-slot="{ item, index }">
          <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <p class="text-sm font-medium">{{ index + 1 }}. {{ item.label }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ item.description }}</p>
          </div>
        </XuiList>
      </section>

      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">Flex</p>
        <h2 class="mt-2 text-xl font-semibold">XuiFlex</h2>
        <XuiFlex class="mt-5" wrap align="center" gap="0.75rem">
          <span class="rounded-full bg-emerald-500 px-3 py-1 text-sm text-white">Start</span>
          <span class="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-100">Middle</span>
          <span class="rounded-full bg-cyan-500 px-3 py-1 text-sm text-white">End</span>
        </XuiFlex>
      </section>

      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">Grid</p>
        <h2 class="mt-2 text-xl font-semibold">XuiGrid</h2>
        <XuiGrid class="mt-5" :columns="3" gap="0.75rem">
          <div v-for="item in ['A', 'B', 'C', 'D', 'E', 'F']" :key="item" class="rounded-lg bg-slate-800 p-4 text-center text-sm">
            {{ item }}
          </div>
        </XuiGrid>
      </section>

      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">Tree</p>
        <h2 class="mt-2 text-xl font-semibold">XuiTree</h2>
        <XuiTree class="mt-5 space-y-2 text-sm" :nodes="treeNodes" v-slot="{ node, depth }">
          <span class="inline-flex rounded-md px-2 py-1" :class="depth === 0 ? 'bg-slate-800 text-slate-100' : 'text-slate-300'">
            {{ node.label }}
          </span>
        </XuiTree>
      </section>
    </XuiGrid>
  </main>
</template>
