<script setup lang="ts">
import type { XuiThemeGeneratorOptions, XuiThemeInput } from '@xui/core';
import { defaultThemePresets } from '@xui/core';
import {
  XuiButton,
  XuiConfigProvider,
  XuiAlert,
  XuiBadge,
  XuiDivider,
  XuiFlex,
  XuiGrid,
  XuiList,
  XuiSpace,
  XuiSwitch,
  XuiTag,
  XuiThemeDesigner,
  XuiTypographyParagraph,
  XuiTypographyText,
  XuiTypographyTitle,
  XuiTree,
  useToggle
} from '@xui/vue';
import { computed, ref } from 'vue';
import { saveThemeGenerationHistory, type XuiThemeGenerationOutput } from '../../theme-history';

type ComponentStatus = 'ready' | 'planned';

type CatalogItem = {
  id: string;
  name: string;
  group: string;
  status: ComponentStatus;
  summary: string;
};

const catalog: CatalogItem[] = [
  { id: 'button', name: 'Button', group: 'General', status: 'ready', summary: 'Actions with variants, sizes, disabled and loading states.' },
  { id: 'typography', name: 'Typography', group: 'General', status: 'ready', summary: 'Text, title, paragraph and common semantic text states.' },
  { id: 'config-provider', name: 'ConfigProvider', group: 'Other', status: 'ready', summary: 'Theme variables, direction, prefix and shared component size.' },
  { id: 'flex', name: 'Flex', group: 'Layout', status: 'ready', summary: 'One-dimensional layout primitive for alignment and wrapping.' },
  { id: 'grid', name: 'Grid', group: 'Layout', status: 'ready', summary: 'Responsive grid composition for dashboard and form surfaces.' },
  { id: 'space', name: 'Space', group: 'Layout', status: 'ready', summary: 'Consistent inline and vertical spacing between controls.' },
  { id: 'divider', name: 'Divider', group: 'Layout', status: 'ready', summary: 'Horizontal and vertical separators with optional labels.' },
  { id: 'switch', name: 'Switch', group: 'Data Entry', status: 'ready', summary: 'Boolean input with controlled and uncontrolled usage.' },
  { id: 'input', name: 'Input', group: 'Data Entry', status: 'planned', summary: 'Text fields, textareas, affixes, clear button and status states.' },
  { id: 'select', name: 'Select', group: 'Data Entry', status: 'planned', summary: 'Single, multiple, searchable and async option picking.' },
  { id: 'list', name: 'List', group: 'Data Display', status: 'ready', summary: 'Headless repeated item rendering with framework-native templates.' },
  { id: 'badge', name: 'Badge', group: 'Data Display', status: 'ready', summary: 'Status dots and count indicators for objects and navigation.' },
  { id: 'tag', name: 'Tag', group: 'Data Display', status: 'ready', summary: 'Compact labels with preset colors, custom colors and closing behavior.' },
  { id: 'tree', name: 'Tree', group: 'Data Display', status: 'ready', summary: 'Nested data display with custom label rendering.' },
  { id: 'table', name: 'Table', group: 'Data Display', status: 'planned', summary: 'Sorting, filtering, pagination, selection and expandable rows.' },
  { id: 'modal', name: 'Modal', group: 'Feedback', status: 'planned', summary: 'Dialog overlay with focus trap, keyboard handling and portals.' },
  { id: 'alert', name: 'Alert', group: 'Feedback', status: 'ready', summary: 'Inline feedback with semantic types, optional descriptions and actions.' },
  { id: 'tooltip', name: 'Tooltip', group: 'Feedback', status: 'planned', summary: 'Popup positioning foundation shared by popover and dropdown.' }
];

const listItems = [
  { id: 'install', label: 'Install', description: 'Import the Vue adapter package.' },
  { id: 'compose', label: 'Compose', description: 'Use slots to own the final DOM.' },
  { id: 'ship', label: 'Ship', description: 'Reuse shared behavior from @xui/core.' }
];

const treeNodes = [
  {
    id: 'packages',
    label: 'packages',
    children: [
      { id: 'core', label: '@xui/core' },
      { id: 'react', label: '@xui/react' },
      { id: 'vue', label: '@xui/vue' }
    ]
  },
  {
    id: 'playgrounds',
    label: 'playgrounds',
    children: [
      { id: 'react-playground', label: 'react' },
      { id: 'vue-playground', label: 'vue' }
    ]
  }
];

const activeId = ref('button');
const theme = ref<XuiThemeInput>(defaultThemePresets[0]);
const switchState = useToggle(false);

const groupedCatalog = computed(() =>
  catalog.reduce<Record<string, CatalogItem[]>>((result, item) => {
    result[item.group] = [...(result[item.group] ?? []), item];
    return result;
  }, {})
);

const activeItem = computed(() => catalog.find((item) => item.id === activeId.value) ?? catalog[0]);

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
</script>

<template>
  <XuiConfigProvider class="min-h-screen" :theme="theme">
    <main class="xui-playground-shell">
      <aside class="xui-playground-sidebar">
        <div>
          <p class="xui-playground-eyebrow">xui vue playground</p>
          <h1>Ant Design Component Catalog</h1>
          <p class="xui-playground-copy">A working catalog for implementing Ant-style components across React and Vue adapters.</p>
        </div>

        <nav class="xui-playground-nav" aria-label="Components">
          <div v-for="(items, group) in groupedCatalog" :key="group">
            <p class="xui-playground-nav__group">{{ group }}</p>
            <button v-for="item in items" :key="item.id" :class="{ 'is-active': activeId === item.id }" type="button" @click="activeId = item.id">
              <span>{{ item.name }}</span>
              <span class="xui-playground-status" :class="`xui-playground-status--${item.status}`">{{ item.status }}</span>
            </button>
          </div>
        </nav>
      </aside>

      <section class="xui-playground-content">
        <XuiThemeDesigner
          class="xui-playground-panel"
          :initial-theme="theme"
          :theme-generator="generateThemeWithModel"
          @theme-change="theme = $event"
        />

        <header class="xui-playground-component-header">
          <div>
            <p class="xui-playground-eyebrow">{{ activeItem.group }}</p>
            <h2>{{ activeItem.name }}</h2>
            <p>{{ activeItem.summary }}</p>
          </div>
          <span class="xui-playground-status" :class="`xui-playground-status--${activeItem.status}`">{{ activeItem.status }}</span>
        </header>

        <section class="xui-playground-panel">
          <div class="xui-playground-panel__header">
            <p>Vue</p>
            <h2>Xui{{ activeItem.name }}</h2>
          </div>

          <div class="xui-playground-panel__body">
            <template v-if="activeId === 'config-provider'">
              <p class="xui-playground-copy">
                This page is wrapped in <code>XuiConfigProvider</code>. The theme designer updates the same token aliases used by future Ant-style components.
              </p>
              <XuiFlex wrap gap="var(--xui-space-3)" class="mt-5">
                <span v-for="token in ['--xui-color-primary', '--xui-color-bg-container', '--xui-color-border', '--xui-control-height']" :key="token" class="xui-token-pill">
                  {{ token }}
                </span>
              </XuiFlex>
            </template>

            <template v-else-if="activeId === 'button'">
              <XuiFlex wrap align="center" gap="var(--xui-space-3)">
                <XuiButton variant="primary">Primary</XuiButton>
                <XuiButton variant="secondary">Secondary</XuiButton>
                <XuiButton variant="outline">Outline</XuiButton>
                <XuiButton variant="ghost">Ghost</XuiButton>
              </XuiFlex>
              <XuiFlex wrap align="center" gap="var(--xui-space-3)" class="mt-4">
                <XuiButton size="sm">Small</XuiButton>
                <XuiButton size="md">Middle</XuiButton>
                <XuiButton size="lg">Large</XuiButton>
                <XuiButton disabled>Disabled</XuiButton>
              </XuiFlex>
            </template>

            <template v-else-if="activeId === 'typography'">
              <XuiTypographyTitle :level="3">Build readable product surfaces</XuiTypographyTitle>
              <XuiTypographyParagraph>
                Typography primitives cover titles, paragraphs and inline text states without forcing layout decisions into the component.
              </XuiTypographyParagraph>
              <XuiSpace wrap size="middle" class="mt-4">
                <XuiTypographyText strong>Strong</XuiTypographyText>
                <XuiTypographyText type="secondary">Secondary</XuiTypographyText>
                <XuiTypographyText type="success">Success</XuiTypographyText>
                <XuiTypographyText type="warning">Warning</XuiTypographyText>
                <XuiTypographyText type="danger">Danger</XuiTypographyText>
                <XuiTypographyText code>code</XuiTypographyText>
                <XuiTypographyText keyboard>⌘K</XuiTypographyText>
                <XuiTypographyText mark>Marked</XuiTypographyText>
              </XuiSpace>
            </template>

            <template v-else-if="activeId === 'switch'">
              <XuiSwitch v-slot="{ checked }">
                <span class="xui-switch-demo" :class="{ 'xui-switch-demo--checked': checked }">{{ checked ? 'ON' : 'OFF' }}</span>
              </XuiSwitch>
              <XuiFlex align="center" gap="var(--xui-space-3)" class="mt-5">
                <XuiButton variant="outline" @click="switchState.toggle">Toggle hook</XuiButton>
                <span class="xui-playground-copy">Hook state: {{ switchState.checked ? 'ON' : 'OFF' }}</span>
              </XuiFlex>
            </template>

            <template v-else-if="activeId === 'list'">
              <XuiList class="grid gap-3" :items="listItems" v-slot="{ item, index }">
                <div class="xui-demo-row">
                  <strong>{{ index + 1 }}. {{ item.label }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </XuiList>
            </template>

            <template v-else-if="activeId === 'badge'">
              <XuiSpace wrap size="large" align="center">
                <XuiBadge :count="5"><span class="xui-demo-avatar">A</span></XuiBadge>
                <XuiBadge :count="128" :overflow-count="99"><span class="xui-demo-avatar">B</span></XuiBadge>
                <XuiBadge dot><span class="xui-demo-avatar">C</span></XuiBadge>
                <XuiBadge status="success" text="Available" />
                <XuiBadge status="processing" text="Running" />
                <XuiBadge status="error" text="Blocked" />
              </XuiSpace>
            </template>

            <template v-else-if="activeId === 'tag'">
              <XuiSpace wrap size="middle">
                <XuiTag>Default</XuiTag>
                <XuiTag color="success">Success</XuiTag>
                <XuiTag color="processing">Processing</XuiTag>
                <XuiTag color="warning">Warning</XuiTag>
                <XuiTag color="error">Error</XuiTag>
                <XuiTag color="#7c3aed" closable>Custom</XuiTag>
              </XuiSpace>
            </template>

            <template v-else-if="activeId === 'alert'">
              <div class="grid gap-3">
                <XuiAlert show-icon type="success" message="Deployment completed" description="All packages built and playground assets were generated." />
                <XuiAlert show-icon type="warning" message="Quota almost full">
                  <template #action>
                    <XuiButton size="sm" variant="outline">Review</XuiButton>
                  </template>
                </XuiAlert>
                <XuiAlert closable show-icon type="error" message="Closable alert" description="Dismiss this alert to verify local component state." />
              </div>
            </template>

            <template v-else-if="activeId === 'flex'">
              <XuiFlex wrap align="center" gap="var(--xui-space-3)">
                <span v-for="item in ['Start', 'Middle', 'End', 'Wrap']" :key="item" class="xui-token-pill">{{ item }}</span>
              </XuiFlex>
            </template>

            <template v-else-if="activeId === 'grid'">
              <XuiGrid :columns="3" gap="var(--xui-space-3)">
                <div v-for="item in ['A', 'B', 'C', 'D', 'E', 'F']" :key="item" class="xui-demo-tile">{{ item }}</div>
              </XuiGrid>
            </template>

            <template v-else-if="activeId === 'space'">
              <div class="grid gap-5">
                <XuiSpace wrap size="middle">
                  <XuiButton>Save</XuiButton>
                  <XuiButton variant="outline">Preview</XuiButton>
                  <XuiButton variant="ghost">Cancel</XuiButton>
                </XuiSpace>
                <XuiSpace direction="vertical" size="small" split="•">
                  <span>Account</span>
                  <span>Billing</span>
                  <span>Security</span>
                </XuiSpace>
              </div>
            </template>

            <template v-else-if="activeId === 'divider'">
              <div>
                <span>Section before divider</span>
                <XuiDivider orientation="left">Details</XuiDivider>
                <span>Section after divider</span>
                <XuiSpace class="mt-5" split="|">
                  <span>Overview</span>
                  <span>Usage</span>
                  <span>Settings</span>
                </XuiSpace>
              </div>
            </template>

            <template v-else-if="activeId === 'tree'">
              <XuiTree class="space-y-2 text-sm" :nodes="treeNodes" v-slot="{ node, depth }">
                <span :class="depth === 0 ? 'xui-token-pill' : 'text-[var(--xui-muted)]'">{{ node.label }}</span>
              </XuiTree>
            </template>

            <p v-else class="xui-playground-copy">
              Planned component. This slot is reserved for the next implementation phase so React and Vue demos stay structurally aligned.
            </p>
          </div>
        </section>
      </section>
    </main>
  </XuiConfigProvider>
</template>
