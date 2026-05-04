import { XuiSwitch, useToggle } from '@xui/react';

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
    </main>
  );
}
