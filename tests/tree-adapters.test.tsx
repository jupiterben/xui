import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, shallowRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { xTree as ReactTree, type xTreeProps } from '../packages/react/src/components/xTree';
import { xTree as VueTree } from '../packages/vue/src/components/xTree';

const nodes = [
  { id: 'root', label: 'Root', children: [
    { id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' },
    { id: 'd', label: 'Disabled', disabled: true }
  ] },
  { id: 'z', label: 'Zebra' }
];

type Props = Omit<xTreeProps, 'nodes'> & { nodes?: typeof nodes };
let cleanup: (() => Promise<void>) | undefined;
afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

async function mount(framework: string, initial: Props = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  let update: (props: Props) => Promise<void>;
  let run: (action: () => void) => Promise<void>;
  if (framework === 'React') {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const root = createRoot(host);
    let props = initial;
    run = async (action) => { await React.act(action); };
    update = async (next) => {
      props = { ...props, ...next };
      await React.act(() => { root.render(<ReactTree nodes={nodes} {...props} />); });
    };
    cleanup = async () => { await React.act(() => root.unmount()); };
  } else {
    const props = shallowRef(initial);
    const app = createApp({
      setup: () => () => {
        const { onKeyDown, ...rest } = props.value;
        return h(VueTree, { nodes, ...rest, onKeydown: onKeyDown });
      }
    });
    run = async (action) => { action(); await nextTick(); };
    update = async (next) => { props.value = { ...props.value, ...next }; await nextTick(); };
    app.mount(host);
    cleanup = async () => { app.unmount(); };
  }
  await update(initial);
  const item = (id: string) => host.querySelector<HTMLLIElement>(`[data-node-id="${id}"]`)!;
  const row = (id: string) => item(id).querySelector<HTMLElement>('[data-part="row"]')!;
  const checkbox = (id: string) => row(id).querySelector<HTMLInputElement>('input')!;
  const click = (element: HTMLElement) => run(() => element.click());
  const key = (id: string, key: string) => run(() => {
    item(id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
  return { host, item, row, checkbox, click, key, update, run };
}

describe.each(['React', 'Vue'])('%s Tree adapter contract', (framework) => {
  it('renders hierarchy, attributes and one tab stop; switcher does not select', async () => {
    const onSelectedChange = vi.fn();
    const onExpandedChange = vi.fn();
    const tree = await mount(framework, { onSelectedChange, onExpandedChange, 'aria-label': 'Files', className: 'custom' });
    expect(tree.host.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('Files');
    expect(tree.host.querySelectorAll('[role="treeitem"]')).toHaveLength(5);
    expect(tree.host.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(tree.item('a').hasAttribute('aria-expanded')).toBe(false);
    expect(tree.item('a').getAttribute('aria-level')).toBe('2');
    await tree.click(tree.row('root').querySelector('button')!);
    expect(tree.item('a')).toBeNull();
    expect(onExpandedChange).toHaveBeenCalledOnce();
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(tree.item('root'));
  });
  it('selects only the clicked descendant and supports multiple toggling', async () => {
    const onSelectedChange = vi.fn();
    const tree = await mount(framework, { selectionMode: 'multiple', onSelectedChange });
    await tree.click(tree.row('a'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['a'], expect.objectContaining({ selected: true }));
    expect(tree.item('root').getAttribute('aria-selected')).toBe('false');
    await tree.click(tree.row('b'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['a', 'b'], expect.anything());
    await tree.click(tree.row('a'));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['b'], expect.anything());
  });
  it('does not optimistically mutate controlled expansion, selection or checks', async () => {
    const onExpandedChange = vi.fn();
    const onSelectedChange = vi.fn();
    const onCheckedChange = vi.fn();
    const tree = await mount(framework, {
      expandedIds: ['root'], selectedIds: [], checkedIds: [], checkable: true,
      onExpandedChange, onSelectedChange, onCheckedChange
    });
    await tree.click(tree.row('root').querySelector('button')!);
    expect(tree.item('a')).not.toBeNull();
    await tree.click(tree.row('a'));
    expect(tree.item('a').getAttribute('aria-selected')).toBe('false');
    await tree.click(tree.checkbox('a'));
    expect(tree.checkbox('a').checked).toBe(false);
    expect(tree.item('a').getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange).toHaveBeenCalledOnce();
    await tree.update({ selectedIds: ['a'], checkedIds: ['a'], expandedIds: ['root'] });
    expect(tree.item('a').getAttribute('aria-selected')).toBe('true');
    expect(tree.checkbox('a').checked).toBe(true);
    expect(tree.checkbox('root').indeterminate).toBe(true);
  });
  it('derives half checking, isolates selection and excludes disabled descendants', async () => {
    const onSelectedChange = vi.fn();
    const tree = await mount(framework, { checkable: true, onSelectedChange });
    await tree.click(tree.checkbox('a'));
    expect(tree.item('root').getAttribute('aria-checked')).toBe('mixed');
    expect(tree.checkbox('root').indeterminate).toBe(true);
    await tree.click(tree.checkbox('root'));
    expect(tree.item('root').getAttribute('aria-checked')).toBe('true');
    expect(tree.checkbox('b').checked).toBe(true);
    expect(tree.checkbox('d').checked).toBe(false);
    await tree.click(tree.checkbox('b'));
    expect(tree.item('root').getAttribute('aria-checked')).toBe('mixed');
    expect(onSelectedChange).not.toHaveBeenCalled();
  });
  it('restores a controlled mixed checkbox after repeated rejected clicks', async () => {
    const tree = await mount(framework, { checkedIds: ['a'], checkable: true });
    await tree.run(() => tree.item('root').focus());
    await tree.click(tree.checkbox('root'));
    await tree.click(tree.checkbox('root'));
    expect(tree.checkbox('root').checked).toBe(false);
    expect(tree.checkbox('root').indeterminate).toBe(true);
    expect(tree.item('root').getAttribute('aria-checked')).toBe('mixed');
  });
  it('supports keyboard focus, typeahead, expansion, selection and check', async () => {
    const tree = await mount(framework, { checkable: true, defaultExpandAll: false });
    await tree.run(() => tree.item('root').focus());
    await tree.key('root', 'ArrowRight');
    expect(tree.item('root').getAttribute('aria-expanded')).toBe('true');
    await tree.key('root', 'ArrowRight');
    expect(document.activeElement).toBe(tree.item('a'));
    await tree.key('a', 'ArrowDown');
    expect(document.activeElement).toBe(tree.item('b'));
    await tree.key('b', 'ArrowDown');
    expect(document.activeElement).toBe(tree.item('z'));
    await tree.key('z', 'a');
    expect(document.activeElement).toBe(tree.item('a'));
    await tree.key('a', 'Enter');
    expect(tree.item('a').getAttribute('aria-selected')).toBe('true');
    await tree.key('a', ' ');
    expect(tree.checkbox('a').checked).toBe(true);
    await tree.key('a', 'ArrowLeft');
    expect(document.activeElement).toBe(tree.item('root'));
    await tree.key('root', 'ArrowLeft');
    expect(tree.item('a')).toBeNull();
    expect(tree.host.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });
  it('restores focused descendants after external collapse and deletion', async () => {
    const tree = await mount(framework, { expandedIds: ['root'] });
    await tree.run(() => tree.item('a').focus());
    await tree.update({ expandedIds: [] });
    expect(document.activeElement).toBe(tree.item('root'));
    await tree.update({ nodes: [{ id: 'z', label: 'Zebra' }] });
    expect(document.activeElement).toBe(tree.item('z'));
    await tree.update({ nodes: [] });
    expect(document.activeElement).toBe(tree.host.querySelector('[role="tree"]'));
  });
  it('does not steal focus after leaving the tree', async () => {
    const tree = await mount(framework);
    const outside = document.createElement('button');
    document.body.append(outside);
    await tree.run(() => tree.item('a').focus());
    await tree.run(() => outside.focus());
    await tree.update({ expandedIds: [] });
    expect(document.activeElement).toBe(outside);
  });
  it('does not steal focus after explicitly blurring to the document', async () => {
    const tree = await mount(framework);
    await tree.run(() => tree.item('a').focus());
    await tree.run(() => tree.item('a').blur());
    await tree.update({ expandedIds: [] });
    expect(document.activeElement).toBe(document.body);
  });
  it.each(['disabled', 'loading'] as const)('blocks pointer and keyboard while %s', async (state) => {
    const onSelectedChange = vi.fn();
    const onCheckedChange = vi.fn();
    const onExpandedChange = vi.fn();
    const tree = await mount(framework, {
      [state]: true, checkable: true, onSelectedChange, onCheckedChange, onExpandedChange
    });
    await tree.click(tree.row('a'));
    await tree.click(tree.checkbox('a'));
    await tree.key('root', 'ArrowLeft');
    await tree.key('a', 'Enter');
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(tree.host.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
    expect(tree.checkbox('a').disabled).toBe(true);
    if (state === 'loading') expect(tree.host.querySelector('[role="tree"]')?.getAttribute('aria-busy')).toBe('true');
  });
  it('honors preventDefault from consumer keyboard handlers exactly once', async () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    const tree = await mount(framework, { onKeyDown });
    await tree.run(() => tree.item('a').focus());
    await tree.key('a', 'ArrowDown');
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(tree.item('a'));
  });
  it('default props are initialization-only and empty arrays override defaults', async () => {
    const tree = await mount(framework, { defaultExpandedIds: [], defaultSelectedIds: ['z'] });
    expect(tree.item('a')).toBeNull();
    await tree.update({ defaultExpandedIds: ['root'], defaultSelectedIds: ['root'] });
    expect(tree.item('a')).toBeNull();
    expect(tree.item('z').getAttribute('aria-selected')).toBe('true');
  });
});
