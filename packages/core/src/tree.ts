export type TreeNode<Label = string> = {
  id: string;
  label: Label;
  textValue?: string;
  children?: TreeNode<Label>[];
  disabled?: boolean;
  selectable?: boolean;
};

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export type TreeOptions = {
  expandedIds?: readonly string[];
  selectedIds?: readonly string[];
  checkedIds?: readonly string[];
  selectionMode?: TreeSelectionMode;
  checkable?: boolean;
  checkStrictly?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export type TreeEntry<Label = string> = {
  node: TreeNode<Label>;
  parentId?: string;
  depth: number;
  index: number;
  size: number;
  disabled: boolean;
  branch: boolean;
  text: string;
};

export type TreeModel<Label = string> = {
  entries: Map<string, TreeEntry<Label>>;
  visible: TreeEntry<Label>[];
  expandedIds: string[];
  selectedIds: string[];
  checkedIds: string[];
  halfCheckedIds: string[];
  options: TreeOptions;
};

export type TreeChange<Label = string> = {
  node: TreeNode<Label>;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  halfCheckedIds?: string[];
};

export type TreeRenderState<Label = string> = TreeEntry<Label> & {
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  halfChecked: boolean;
  focused: boolean;
  toggleExpanded: () => void;
  toggleSelected: () => void;
  toggleChecked: () => void;
};

export function getTreeBranchIds<Label>(nodes: readonly TreeNode<Label>[]): string[] {
  return [...createTreeModel(nodes).entries.values()].filter((entry) => entry.branch).map((entry) => entry.node.id);
}

export function createTreeModel<Label>(
  nodes: readonly TreeNode<Label>[],
  options: TreeOptions = {}
): TreeModel<Label> {
  const entries = new Map<string, TreeEntry<Label>>();
  function visit(siblings: readonly TreeNode<Label>[], depth: number, parentId?: string, disabled = false) {
    siblings.forEach((node, index) => {
      if (typeof node.id !== 'string' || !node.id.trim() || entries.has(node.id)) {
        throw new Error(`xTree: node ids must be non-empty and globally unique (${node.id}).`);
      }
      const entry = {
        node, depth, parentId, index, size: siblings.length,
        disabled: disabled || Boolean(node.disabled),
        branch: Boolean(node.children?.length),
        text: node.textValue ?? (typeof node.label === 'string' || typeof node.label === 'number' ? String(node.label) : '')
      };
      entries.set(node.id, entry);
      if (node.children?.length) visit(node.children, depth + 1, node.id, entry.disabled);
    });
  }
  visit(nodes, 0);
  const normalize = (ids: readonly string[] = []) => [...new Set(ids)].filter((id) => entries.has(id));
  const expandedIds = normalize(options.expandedIds).filter((id) => entries.get(id)!.branch);
  const expanded = new Set(expandedIds);
  const visible: TreeEntry<Label>[] = [];
  const visibleIds = new Set<string>();
  for (const entry of entries.values()) {
    if (entry.parentId === undefined || (visibleIds.has(entry.parentId) && expanded.has(entry.parentId))) {
      visible.push(entry);
      visibleIds.add(entry.node.id);
    }
  }
  const mode = options.selectionMode ?? 'single';
  const selectable = normalize(options.selectedIds).filter((id) => entries.get(id)!.node.selectable !== false);
  const selectedIds = mode === 'none' ? [] : mode === 'single' ? selectable.slice(0, 1) : selectable;
  const checked = new Set(normalize(options.checkedIds));
  const halfChecked = new Set<string>();
  if (!options.checkStrictly) {
    // Disabled subtrees form a boundary: cascade and aggregation never cross it.
    for (const entry of entries.values()) {
      if (!entry.disabled && entry.parentId !== undefined && checked.has(entry.parentId)) checked.add(entry.node.id);
    }
    for (const entry of [...entries.values()].reverse()) {
      if (!entry.branch || entry.disabled) continue;
      const children = entry.node.children!.filter((child) => !entries.get(child.id)!.disabled);
      if (!children.length) continue;
      if (children.every((child) => checked.has(child.id))) checked.add(entry.node.id);
      else {
        checked.delete(entry.node.id);
        if (children.some((child) => checked.has(child.id) || halfChecked.has(child.id))) halfChecked.add(entry.node.id);
      }
    }
  }
  return {
    entries, visible, options, expandedIds, selectedIds,
    checkedIds: [...entries.keys()].filter((id) => checked.has(id)),
    halfCheckedIds: [...entries.keys()].filter((id) => halfChecked.has(id))
  };
}

export function canUseTree<Label>(model: TreeModel<Label>, id: string): boolean {
  return !model.options.disabled && !model.options.loading && !!model.entries.get(id) && !model.entries.get(id)!.disabled;
}

export function toggleTreeExpanded<Label>(model: TreeModel<Label>, id: string): string[] {
  if (!canUseTree(model, id) || !model.entries.get(id)!.branch) return model.expandedIds;
  return model.expandedIds.includes(id) ? model.expandedIds.filter((value) => value !== id) : [...model.expandedIds, id];
}

export function toggleTreeSelected<Label>(model: TreeModel<Label>, id: string): string[] {
  const mode = model.options.selectionMode ?? 'single';
  if (!canUseTree(model, id) || mode === 'none' || model.entries.get(id)!.node.selectable === false) return model.selectedIds;
  if (mode === 'single') return model.selectedIds.includes(id) ? model.selectedIds : [id];
  return model.selectedIds.includes(id) ? model.selectedIds.filter((value) => value !== id) : [...model.selectedIds, id];
}

export function toggleTreeChecked<Label>(model: TreeModel<Label>, id: string): string[] {
  if (!model.options.checkable || !canUseTree(model, id)) return model.checkedIds;
  const checked = new Set(model.checkedIds);
  const next = !checked.has(id);
  const update = (value: string) => next ? checked.add(value) : checked.delete(value);
  update(id);
  if (!model.options.checkStrictly) {
    function visit(value: string) {
      for (const child of model.entries.get(value)!.node.children ?? []) {
        if (model.entries.get(child.id)!.disabled) continue;
        update(child.id);
        visit(child.id);
      }
    }
    visit(id);
    // Derived checked ancestors must not re-check the child that was just cleared.
    let parent = model.entries.get(id)!.parentId;
    while (parent !== undefined) {
      checked.delete(parent);
      parent = model.entries.get(parent)!.parentId;
    }
  }
  return [...checked];
}

export function getTreeFocusId<Label>(model: TreeModel<Label>, focusedId?: string): string | undefined {
  const enabled = model.visible.filter((entry) => !entry.disabled);
  if (enabled.some((entry) => entry.node.id === focusedId)) return focusedId;
  let parent = focusedId === undefined ? undefined : model.entries.get(focusedId)?.parentId;
  while (parent !== undefined) {
    if (enabled.some((entry) => entry.node.id === parent)) return parent;
    parent = model.entries.get(parent)?.parentId;
  }
  return enabled.find((entry) => model.selectedIds.includes(entry.node.id))?.node.id ?? enabled[0]?.node.id;
}

export type TreeKeyAction = { type: 'focus' | 'expand' | 'select' | 'check'; id: string };

export function getTreeKeyAction<Label>(model: TreeModel<Label>, id: string, key: string): TreeKeyAction | undefined {
  if (!canUseTree(model, id)) return;
  const items = model.visible.filter((entry) => !entry.disabled);
  const index = items.findIndex((entry) => entry.node.id === id);
  if (index < 0) return;
  const entry = items[index];
  const focus = (target?: TreeEntry<Label>): TreeKeyAction | undefined => target && ({ type: 'focus', id: target.node.id });
  switch (key) {
    case 'ArrowDown': return focus(items[Math.min(items.length - 1, index + 1)]);
    case 'ArrowUp': return focus(items[Math.max(0, index - 1)]);
    case 'Home': return focus(items[0]);
    case 'End': return focus(items[items.length - 1]);
    case 'ArrowRight':
      if (entry.branch && !model.expandedIds.includes(id)) return { type: 'expand', id };
      return focus(items[index + 1]?.parentId === id ? items[index + 1] : undefined);
    case 'ArrowLeft':
      if (entry.branch && model.expandedIds.includes(id)) return { type: 'expand', id };
      return focus(entry.parentId === undefined ? undefined : model.entries.get(entry.parentId));
    case 'Enter': return { type: 'select', id };
    case ' ': return { type: model.options.checkable ? 'check' : 'select', id };
  }
}

export function findTreeTypeahead<Label>(model: TreeModel<Label>, id: string, query: string): string | undefined {
  const items = model.visible.filter((entry) => !entry.disabled);
  const start = items.findIndex((entry) => entry.node.id === id);
  const text = query.toLocaleLowerCase();
  for (let offset = 1; offset <= items.length; offset++) {
    const entry = items[(start + offset) % items.length];
    if (entry.text.toLocaleLowerCase().startsWith(text)) return entry.node.id;
  }
}
