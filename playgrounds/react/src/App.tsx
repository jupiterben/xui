import { XuiFlex, XuiGrid, XuiList, XuiSwitch, XuiTree, type XuiTreeNode, useToggle } from '@xui/react';

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

export default function App() {
  const state = useToggle(false);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-300">xui react playground</p>
        <h1 className="mt-3 text-4xl font-bold">React Headless UI Demo</h1>
        <p className="mt-3 text-slate-300">
          通过 Tailwind 自定义样式，演示 <code>@xui/react</code> 的无样式交互逻辑。
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">React</p>
            <h2 className="mt-2 text-xl font-semibold">XuiSwitch</h2>
          </div>
          <span className="rounded-full border border-sky-500/40 px-2.5 py-1 text-xs text-sky-200">
            @xui/react
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-400">React 适配层复用同一套 core toggle 逻辑。</p>

        <XuiSwitch defaultChecked>
          {({ checked }) => (
            <span
              className={[
                'mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition',
                checked ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-200'
              ].join(' ')}
            >
              {checked ? 'ON' : 'OFF'}
            </span>
          )}
        </XuiSwitch>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            type="button"
            onClick={state.toggle}
          >
            Toggle via useToggle
          </button>
          <span className="text-sm text-slate-300">当前: {state.checked ? 'ON' : 'OFF'}</span>
        </div>
      </section>

      <XuiGrid className="mt-6" minColumnWidth="240px" gap="1rem">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">List</p>
          <h2 className="mt-2 text-xl font-semibold">XuiList</h2>
          <XuiList className="mt-5 space-y-3" items={listItems}>
            {({ item, index }) => (
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-sm font-medium">
                  {index + 1}. {item.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{item.description}</p>
              </div>
            )}
          </XuiList>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">Flex</p>
          <h2 className="mt-2 text-xl font-semibold">XuiFlex</h2>
          <XuiFlex className="mt-5" wrap align="center" gap="0.75rem">
            <span className="rounded-full bg-sky-500 px-3 py-1 text-sm text-white">Start</span>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-100">Middle</span>
            <span className="rounded-full bg-cyan-500 px-3 py-1 text-sm text-white">End</span>
          </XuiFlex>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">Grid</p>
          <h2 className="mt-2 text-xl font-semibold">XuiGrid</h2>
          <XuiGrid className="mt-5" columns={3} gap="0.75rem">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((item) => (
              <div key={item} className="rounded-lg bg-slate-800 p-4 text-center text-sm">
                {item}
              </div>
            ))}
          </XuiGrid>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">Tree</p>
          <h2 className="mt-2 text-xl font-semibold">XuiTree</h2>
          <XuiTree
            className="mt-5 space-y-2 text-sm"
            nodes={treeNodes}
            renderLabel={({ node, depth }) => (
              <span className={['inline-flex rounded-md px-2 py-1', depth === 0 ? 'bg-slate-800 text-slate-100' : 'text-slate-300'].join(' ')}>
                {node.label}
              </span>
            )}
          />
        </section>
      </XuiGrid>
    </main>
  );
}
