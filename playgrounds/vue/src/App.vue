<script setup lang="ts">
import type { xThemeGeneratorOptions, xThemeInput } from '@xui/core';
import { defaultThemePresets } from '@xui/core';
import {
  xButton,
  xConfigProvider,
  xAlert,
  xBadge,
  xDivider,
  xFlex,
  xGrid,
  xList,
  xSpace,
  xSwitch,
  xTag,
  xThemeDesigner,
  xTypographyParagraph,
  xTypographyText,
  xTypographyTitle,
  xTree,
  useToggle
} from '@xui/vue';
import { computed, ref } from 'vue';
import { saveThemeGenerationHistory, type xThemeGenerationOutput } from '../../theme-history';

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
const theme = ref<xThemeInput>(defaultThemePresets[0]);
const switchState = useToggle(false);

const groupedCatalog = computed(() =>
  catalog.reduce<Record<string, CatalogItem[]>>((result, item) => {
    result[item.group] = [...(result[item.group] ?? []), item];
    return result;
  }, {})
);

const activeItem = computed(() => catalog.find((item) => item.id === activeId.value) ?? catalog[0]);

async function generateThemeWithModel(prompt: string, options?: xThemeGeneratorOptions) {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image: options?.image })
  });

  if (!response.ok) {
    throw new Error('Theme API request failed');
  }

  const payload = (await response.json()) as xThemeGenerationOutput;
  saveThemeGenerationHistory('vue', prompt, options?.image, payload);
  return payload.theme;
}
</script>

<template>
  <xConfigProvider class="min-h-screen" :theme="theme">
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
        <xThemeDesigner
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
            <h2>x{{ activeItem.name }}</h2>
          </div>

          <div class="xui-playground-panel__body">
            <template v-if="activeId === 'config-provider'">
              <p class="xui-playground-copy">
                This page is wrapped in <code>xConfigProvider</code>. The theme designer updates the same token aliases used by future Ant-style components.
              </p>
              <xFlex wrap gap="var(--xui-space-3)" class="mt-5">
                <span v-for="token in ['--xui-color-primary', '--xui-color-bg-container', '--xui-color-border', '--xui-control-height']" :key="token" class="xui-token-pill">
                  {{ token }}
                </span>
              </xFlex>
            </template>

            <template v-else-if="activeId === 'button'">
              <xFlex wrap align="center" gap="var(--xui-space-3)">
                <xButton variant="primary">Primary</xButton>
                <xButton variant="secondary">Secondary</xButton>
                <xButton variant="outline">Outline</xButton>
                <xButton variant="ghost">Ghost</xButton>
              </xFlex>
              <xFlex wrap align="center" gap="var(--xui-space-3)" class="mt-4">
                <xButton size="sm">Small</xButton>
                <xButton size="md">Middle</xButton>
                <xButton size="lg">Large</xButton>
                <xButton disabled>Disabled</xButton>
              </xFlex>
            </template>

            <template v-else-if="activeId === 'typography'">
              <xTypographyTitle :level="3">Build readable product surfaces</xTypographyTitle>
              <xTypographyParagraph>
                Typography primitives cover titles, paragraphs and inline text states without forcing layout decisions into the component.
              </xTypographyParagraph>
              <xSpace wrap size="middle" class="mt-4">
                <xTypographyText strong>Strong</xTypographyText>
                <xTypographyText type="secondary">Secondary</xTypographyText>
                <xTypographyText type="success">Success</xTypographyText>
                <xTypographyText type="warning">Warning</xTypographyText>
                <xTypographyText type="danger">Danger</xTypographyText>
                <xTypographyText code>code</xTypographyText>
                <xTypographyText keyboard>⌘K</xTypographyText>
                <xTypographyText mark>Marked</xTypographyText>
              </xSpace>
            </template>

            <template v-else-if="activeId === 'switch'">
              <xSwitch v-slot="{ checked }">
                <span class="xui-switch-demo" :class="{ 'xui-switch-demo--checked': checked }">{{ checked ? 'ON' : 'OFF' }}</span>
              </xSwitch>
              <xFlex align="center" gap="var(--xui-space-3)" class="mt-5">
                <xButton variant="outline" @click="switchState.toggle">Toggle hook</xButton>
                <span class="xui-playground-copy">Hook state: {{ switchState.checked ? 'ON' : 'OFF' }}</span>
              </xFlex>
            </template>

            <template v-else-if="activeId === 'list'">
              <xList class="grid gap-3" :items="listItems" v-slot="{ item, index }">
                <div class="xui-demo-row">
                  <strong>{{ index + 1 }}. {{ item.label }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </xList>
            </template>

            <template v-else-if="activeId === 'badge'">
              <xSpace wrap size="large" align="center">
                <xBadge :count="5"><span class="xui-demo-avatar">A</span></xBadge>
                <xBadge :count="128" :overflow-count="99"><span class="xui-demo-avatar">B</span></xBadge>
                <xBadge dot><span class="xui-demo-avatar">C</span></xBadge>
                <xBadge status="success" text="Available" />
                <xBadge status="processing" text="Running" />
                <xBadge status="error" text="Blocked" />
              </xSpace>
            </template>

            <template v-else-if="activeId === 'tag'">
              <xSpace wrap size="middle">
                <xTag>Default</xTag>
                <xTag color="success">Success</xTag>
                <xTag color="processing">Processing</xTag>
                <xTag color="warning">Warning</xTag>
                <xTag color="error">Error</xTag>
                <xTag color="#7c3aed" closable>Custom</xTag>
              </xSpace>
            </template>

            <template v-else-if="activeId === 'alert'">
              <div class="grid gap-3">
                <xAlert show-icon type="success" message="Deployment completed" description="All packages built and playground assets were generated." />
                <xAlert show-icon type="warning" message="Quota almost full">
                  <template #action>
                    <xButton size="sm" variant="outline">Review</xButton>
                  </template>
                </xAlert>
                <xAlert closable show-icon type="error" message="Closable alert" description="Dismiss this alert to verify local component state." />
              </div>
            </template>

            <template v-else-if="activeId === 'flex'">
              <xFlex wrap align="center" gap="var(--xui-space-3)">
                <span v-for="item in ['Start', 'Middle', 'End', 'Wrap']" :key="item" class="xui-token-pill">{{ item }}</span>
              </xFlex>
            </template>

            <template v-else-if="activeId === 'grid'">
              <xGrid :columns="3" gap="var(--xui-space-3)">
                <div v-for="item in ['A', 'B', 'C', 'D', 'E', 'F']" :key="item" class="xui-demo-tile">{{ item }}</div>
              </xGrid>
            </template>

            <template v-else-if="activeId === 'space'">
              <div class="grid gap-5">
                <xSpace wrap size="middle">
                  <xButton>Save</xButton>
                  <xButton variant="outline">Preview</xButton>
                  <xButton variant="ghost">Cancel</xButton>
                </xSpace>
                <xSpace direction="vertical" size="small" split="•">
                  <span>Account</span>
                  <span>Billing</span>
                  <span>Security</span>
                </xSpace>
              </div>
            </template>

            <template v-else-if="activeId === 'divider'">
              <div>
                <span>Section before divider</span>
                <xDivider orientation="left">Details</xDivider>
                <span>Section after divider</span>
                <xSpace class="mt-5" split="|">
                  <span>Overview</span>
                  <span>Usage</span>
                  <span>Settings</span>
                </xSpace>
              </div>
            </template>

            <template v-else-if="activeId === 'tree'">
              <xTree class="xui-tree-demo text-sm" aria-label="Project packages" checkable :nodes="treeNodes" v-slot="{ node, depth }">
                <span :class="depth === 0 ? 'xui-token-pill' : 'text-[var(--xui-muted)]'">{{ node.label }}</span>
              </xTree>
            </template>

            <p v-else class="xui-playground-copy">
              Planned component. This slot is reserved for the next implementation phase so React and Vue demos stay structurally aligned.
            </p>
          </div>
        </section>
      </section>
    </main>
  </xConfigProvider>
</template>
