<script setup lang="ts">
import { XuiSwitch, useToggle } from '@xui/vue';

const state = useToggle(true);
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl px-6 py-12">
    <header class="mb-10">
      <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">xui showcase</p>
      <h1 class="mt-3 text-4xl font-bold">Tailwind + Headless UI Demo</h1>
      <p class="mt-3 text-slate-300">
        通过 Tailwind 自定义样式，复用 <code>@xui/vue</code> 的无样式交互逻辑。
      </p>
    </header>

    <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 class="text-xl font-semibold">XuiSwitch</h2>
      <p class="mt-2 text-sm text-slate-400">点击下面按钮切换状态：</p>

      <XuiSwitch v-slot="{ checked }">
        <span
          class="mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition"
          :class="checked ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'"
        >
          {{ checked ? 'ON' : 'OFF' }}
        </span>
      </XuiSwitch>

      <div class="mt-6 flex items-center gap-3">
        <button
          class="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          @click="state.toggle"
        >
          Toggle via useToggle
        </button>
        <span class="text-sm text-slate-300">当前: {{ state.checked ? 'ON' : 'OFF' }}</span>
      </div>
    </section>
  </main>
</template>
