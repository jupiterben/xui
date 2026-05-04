import { XuiFlex, XuiGrid, XuiList, XuiSwitch, XuiThemeDesigner, XuiTree, type XuiTreeNode, useToggle } from '@xui/react';

const listItems = [
  { id: 'install', label: 'Install', description: '引入对应框架适配包' },
  { id: 'compose', label: 'Compose', description: '用 children render function 自定义结构和样式' },
  { id: 'ship', label: 'Ship', description: '复用 core 中的交互逻辑' }
];

const treeNodes: XuiTreeNode[] = [
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

async function generateThemeWithModel(prompt: string) {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Theme API request failed');
  }

  const payload = await response.json();
  return payload.theme;
}

export default function App() {
  const state = useToggle(false);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-[var(--xui-space-6)] py-12">
      <header className="mb-[var(--xui-space-6)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--xui-accent)]">xui react playground</p>
        <h1 className="mt-3 text-4xl font-bold">React Headless UI Demo</h1>
        <p className="mt-3 text-[var(--xui-muted)]">
          通过 Tailwind 自定义样式，演示 <code>@xui/react</code> 的无样式交互逻辑。
        </p>
      </header>

      <XuiThemeDesigner
        className="mb-8 rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-5)] shadow-[var(--xui-shadow-md)]"
        themeGenerator={generateThemeWithModel}
      />

      <section className="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">React</p>
            <h2 className="mt-2 text-xl font-semibold">XuiSwitch</h2>
          </div>
          <span className="rounded-full border border-[var(--xui-border)] px-2.5 py-1 text-xs text-[var(--xui-accent)]">
            @xui/react
          </span>
        </div>

        <p className="mt-4 text-sm text-[var(--xui-muted)]">React 适配层复用同一套 core toggle 逻辑。</p>

        <XuiSwitch defaultChecked>
          {({ checked }) => (
            <span
              className={[
                'mt-[var(--xui-space-5)] inline-flex items-center rounded-[var(--xui-radius-full)] px-[var(--xui-space-4)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] font-medium transition',
                checked ? 'bg-[var(--xui-accent)] text-[var(--xui-accent-contrast)]' : 'bg-[var(--xui-surface-muted)] text-[var(--xui-text)]'
              ].join(' ')}
            >
              {checked ? 'ON' : 'OFF'}
            </span>
          )}
        </XuiSwitch>

        <div className="mt-[var(--xui-space-6)] flex flex-wrap items-center gap-[var(--xui-space-3)]">
          <button
            className="rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)] focus:shadow-[var(--xui-focus-ring)]"
            type="button"
            onClick={state.toggle}
          >
            Toggle via useToggle
          </button>
          <span className="text-sm text-[var(--xui-muted)]">当前: {state.checked ? 'ON' : 'OFF'}</span>
        </div>
      </section>

      <XuiGrid className="mt-[var(--xui-space-6)]" minColumnWidth="240px" gap="var(--xui-space-4)">
        <section className="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">List</p>
          <h2 className="mt-2 text-xl font-semibold">XuiList</h2>
          <XuiList className="mt-5 space-y-3" items={listItems}>
            {({ item, index }) => (
              <div className="rounded-lg border border-[var(--xui-border)] bg-[var(--xui-bg)] p-3">
                <p className="text-sm font-medium">
                  {index + 1}. {item.label}
                </p>
                <p className="mt-1 text-xs text-[var(--xui-muted)]">{item.description}</p>
              </div>
            )}
          </XuiList>
        </section>

        <section className="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Flex</p>
          <h2 className="mt-2 text-xl font-semibold">XuiFlex</h2>
          <XuiFlex className="mt-5" wrap align="center" gap="0.75rem">
            <span className="rounded-full bg-[var(--xui-accent)] px-3 py-1 text-sm text-[var(--xui-accent-contrast)]">Start</span>
            <span className="rounded-full bg-[var(--xui-surface-muted)] px-3 py-1 text-sm text-[var(--xui-text)]">Middle</span>
            <span className="rounded-full bg-[var(--xui-secondary)] px-3 py-1 text-sm text-[var(--xui-secondary-contrast)]">End</span>
          </XuiFlex>
        </section>

        <section className="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Grid</p>
          <h2 className="mt-2 text-xl font-semibold">XuiGrid</h2>
          <XuiGrid className="mt-5" columns={3} gap="0.75rem">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((item) => (
              <div key={item} className="rounded-lg bg-[var(--xui-surface-muted)] p-4 text-center text-sm">
                {item}
              </div>
            ))}
          </XuiGrid>
        </section>

        <section className="rounded-[var(--xui-radius-2xl)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-surface)] p-[var(--xui-space-6)] shadow-[var(--xui-shadow-md)]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">Tree</p>
          <h2 className="mt-2 text-xl font-semibold">XuiTree</h2>
          <XuiTree
            className="mt-5 space-y-2 text-sm"
            nodes={treeNodes}
            renderLabel={({ node, depth }) => (
              <span className={['inline-flex rounded-md px-2 py-1', depth === 0 ? 'bg-[var(--xui-surface-muted)] text-[var(--xui-text)]' : 'text-[var(--xui-muted)]'].join(' ')}>
                {node.label}
              </span>
            )}
          />
        </section>
      </XuiGrid>
    </main>
  );
}
