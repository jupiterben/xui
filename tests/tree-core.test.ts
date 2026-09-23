import { describe, expect, it } from 'vitest';
import {
  createTreeModel, findTreeTypeahead, getTreeBranchIds, getTreeFocusId, getTreeKeyAction,
  toggleTreeChecked, toggleTreeExpanded, toggleTreeSelected, type TreeNode
} from '../packages/core/src/tree';

const nodes: TreeNode[] = [
  { id: 'root', label: 'Root', children: [
    { id: 'a', label: 'Apple' },
    { id: 'b', label: 'Banana', children: [{ id: 'c', label: 'Cherry' }] },
    { id: 'disabled', label: 'Disabled', disabled: true, children: [{ id: 'hidden', label: 'Hidden' }] }
  ] },
  { id: 'z', label: 'Zebra', selectable: false }
];

describe('Tree core contract', () => {
  it('indexes hierarchy without mutating the input', () => {
    const before = JSON.stringify(nodes);
    const model = createTreeModel(nodes, { expandedIds: ['root', 'b', 'missing', 'root', 'a'] });
    expect(model.expandedIds).toEqual(['root', 'b']);
    expect(model.visible.map((entry) => entry.node.id)).toEqual(['root', 'a', 'b', 'c', 'disabled', 'z']);
    expect(model.entries.get('c')).toMatchObject({ parentId: 'b', depth: 2, index: 0, size: 1 });
    expect(model.entries.get('hidden')?.disabled).toBe(true);
    expect(JSON.stringify(nodes)).toBe(before);
  });
  it('rejects duplicate, empty and cyclic ids', () => {
    expect(() => createTreeModel([{ id: '', label: '' }])).toThrow(/unique/);
    expect(() => createTreeModel([{ id: 'a', label: '' }, { id: 'a', label: '' }])).toThrow(/unique/);
    const cyclic: TreeNode = { id: 'cycle', label: '' };
    cyclic.children = [cyclic];
    expect(() => createTreeModel([cyclic])).toThrow(/unique/);
  });
  it('preserves descendant expansion when an ancestor collapses', () => {
    const model = createTreeModel(nodes, { expandedIds: ['root', 'b'] });
    expect(toggleTreeExpanded(model, 'root')).toEqual(['b']);
    expect(toggleTreeExpanded(model, 'a')).toBe(model.expandedIds);
    expect(getTreeBranchIds(nodes)).toEqual(['root', 'b', 'disabled']);
  });
  it('supports single, multiple, none and non-selectable nodes', () => {
    const model = createTreeModel(nodes, { selectedIds: ['a', 'b', 'missing'] });
    expect(model.selectedIds).toEqual(['a']);
    expect(toggleTreeSelected(model, 'a')).toBe(model.selectedIds);
    expect(toggleTreeSelected(model, 'b')).toEqual(['b']);
    expect(toggleTreeSelected(model, 'z')).toBe(model.selectedIds);
    const multiple = createTreeModel(nodes, { selectionMode: 'multiple', selectedIds: ['a'] });
    expect(toggleTreeSelected(multiple, 'b')).toEqual(['a', 'b']);
    expect(toggleTreeSelected(multiple, 'a')).toEqual([]);
    expect(createTreeModel(nodes, { selectionMode: 'none', selectedIds: ['a'] }).selectedIds).toEqual([]);
  });
  it('cascades checks and derives half checks without crossing disabled subtrees', () => {
    const model = createTreeModel(nodes, { checkable: true, checkedIds: ['root'] });
    expect(model.checkedIds).toEqual(['root', 'a', 'b', 'c']);
    const checkedIds = toggleTreeChecked(model, 'c');
    const next = createTreeModel(nodes, { checkable: true, checkedIds });
    expect(next.checkedIds).toEqual(['a']);
    expect(next.halfCheckedIds).toEqual(['root']);
    expect(createTreeModel(nodes, { checkedIds: ['a', 'c'] }).checkedIds).toEqual(['root', 'a', 'b', 'c']);
    const partial = createTreeModel(nodes, { checkable: true, checkedIds: ['a'] });
    expect(createTreeModel(nodes, { checkedIds: toggleTreeChecked(partial, 'root') }).checkedIds).toEqual(['root', 'a', 'b', 'c']);
  });
  it('preserves explicit disabled checks and supports strict checking', () => {
    const model = createTreeModel(nodes, { checkable: true, checkedIds: ['root', 'disabled'] });
    expect(createTreeModel(nodes, { checkedIds: toggleTreeChecked(model, 'root') }).checkedIds).toEqual(['disabled']);
    const strict = createTreeModel(nodes, { checkable: true, checkStrictly: true, checkedIds: ['root'] });
    expect(strict.checkedIds).toEqual(['root']);
    expect(strict.halfCheckedIds).toEqual([]);
    expect(toggleTreeChecked(strict, 'a')).toEqual(['root', 'a']);
  });
  it.each([{ disabled: true }, { loading: true }])('blocks all changes when %o', (options) => {
    const model = createTreeModel(nodes, { ...options, checkable: true });
    expect(toggleTreeExpanded(model, 'root')).toBe(model.expandedIds);
    expect(toggleTreeSelected(model, 'a')).toBe(model.selectedIds);
    expect(toggleTreeChecked(model, 'a')).toBe(model.checkedIds);
    expect(getTreeKeyAction(model, 'root', 'ArrowDown')).toBeUndefined();
  });
  it('blocks node-level disabled changes', () => {
    const model = createTreeModel(nodes, { checkable: true });
    expect(toggleTreeExpanded(model, 'disabled')).toBe(model.expandedIds);
    expect(toggleTreeSelected(model, 'hidden')).toBe(model.selectedIds);
    expect(toggleTreeChecked(model, 'hidden')).toBe(model.checkedIds);
  });
  it('navigates visible nodes and separates focus, selection and checking', () => {
    const model = createTreeModel(nodes, { expandedIds: ['root', 'b'], checkable: true });
    expect(getTreeKeyAction(model, 'c', 'ArrowDown')).toEqual({ type: 'focus', id: 'z' });
    expect(getTreeKeyAction(model, 'root', 'ArrowRight')).toEqual({ type: 'focus', id: 'a' });
    expect(getTreeKeyAction(model, 'c', 'ArrowLeft')).toEqual({ type: 'focus', id: 'b' });
    expect(getTreeKeyAction(model, 'b', 'ArrowLeft')).toEqual({ type: 'expand', id: 'b' });
    expect(getTreeKeyAction(model, 'a', 'Home')).toEqual({ type: 'focus', id: 'root' });
    expect(getTreeKeyAction(model, 'a', 'End')).toEqual({ type: 'focus', id: 'z' });
    expect(getTreeKeyAction(model, 'a', ' ')).toEqual({ type: 'check', id: 'a' });
    expect(getTreeKeyAction(model, 'a', 'Enter')).toEqual({ type: 'select', id: 'a' });
    expect(getTreeKeyAction(model, 'a', 'Tab')).toBeUndefined();
  });
  it('restores focus to visible ancestors, selection or first enabled node', () => {
    expect(getTreeFocusId(createTreeModel(nodes), 'c')).toBe('root');
    expect(getTreeFocusId(createTreeModel(nodes, { selectedIds: ['z'] }), 'removed')).toBe('root');
    expect(getTreeFocusId(createTreeModel(nodes, { selectedIds: ['a'], expandedIds: ['root'] }))).toBe('a');
    expect(getTreeFocusId(createTreeModel([]))).toBeUndefined();
  });
  it('typeahead wraps and ignores hidden and disabled nodes', () => {
    const model = createTreeModel(nodes, { expandedIds: ['root', 'b'] });
    expect(findTreeTypeahead(model, 'z', 'APP')).toBe('a');
    expect(findTreeTypeahead(model, 'a', 'd')).toBeUndefined();
    expect(findTreeTypeahead(createTreeModel(nodes), 'root', 'ch')).toBeUndefined();
  });
});
