import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { x, type xTreeNode } from '@xui/react';
import './tree-demo.css';

const nodes: xTreeNode[] = [
  { id: 'project', label: 'xui', children: [
    { id: 'packages', label: 'packages', children: [
      { id: 'core', label: '@xui/core', children: [{ id: 'tree', label: 'tree.ts' }, { id: 'index', label: 'index.ts' }] },
      { id: 'react', label: '@xui/react', children: [{ id: 'react-tree', label: 'xTree.tsx' }] },
      { id: 'vue', label: '@xui/vue', children: [{ id: 'vue-tree', label: 'xTree.ts' }] }
    ] },
    { id: 'docs', label: 'docs', children: [{ id: 'contract', label: 'Tree contract.md' }] },
    { id: 'archive', label: 'archive', disabled: true, children: [{ id: 'legacy', label: 'legacy.ts' }] }
  ] },
  { id: 'readme', label: 'README.md' },
  { id: 'long', label: 'component-contract-and-accessibility-verification-notes.md' }
];

function TreeDemo() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [checkedIds, setCheckedIds] = React.useState<string[]>([]);
  const [disabled, setDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [strict, setStrict] = React.useState(false);
  const [multiple, setMultiple] = React.useState(false);
  return (
    <main>
      <header><span className="brand">xui / React</span><h1>Tree</h1></header>
      <div className="options">
        <label><input type="checkbox" checked={multiple} onChange={(event) => setMultiple(event.target.checked)} /> Multiple selection</label>
        <label><input type="checkbox" checked={strict} onChange={(event) => setStrict(event.target.checked)} /> Independent checks</label>
        <label><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /> Disabled</label>
        <label><input type="checkbox" checked={loading} onChange={(event) => setLoading(event.target.checked)} /> Loading</label>
      </div>
      <section className="workspace">
        <div className="files">
          <h2>Project files</h2>
          <x.Tree className="demo-tree" aria-label="Project files" nodes={nodes} checkable
            defaultExpandedIds={['project', 'packages', 'core']}
            selectionMode={multiple ? 'multiple' : 'single'} checkStrictly={strict}
            selectedIds={selectedIds} checkedIds={checkedIds} disabled={disabled} loading={loading}
            onSelectedChange={setSelectedIds} onCheckedChange={setCheckedIds}
            renderLabel={({ node, branch }) => (
              <><span className={branch ? 'file-icon folder' : 'file-icon'} aria-hidden="true" /><span>{node.label}</span></>
            )} />
        </div>
        <aside>
          <h2>Selection</h2>
          <output>{selectedIds.length ? selectedIds.join(', ') : 'None'}</output>
          <h2>Checked</h2>
          <output>{checkedIds.length ? checkedIds.join(', ') : 'None'}</output>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<TreeDemo />);
