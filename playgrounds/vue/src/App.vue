<script setup lang="ts">
import { XuiSwitch, useToggle } from '@xui/vue';

const state = useToggle(true);
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
  </main>
</template>
