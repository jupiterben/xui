import * as React from 'react';
import {
  canUseTree, createTreeModel, findTreeTypeahead, getTreeBranchIds, getTreeFocusId,
  getTreeKeyAction, toggleTreeChecked, toggleTreeExpanded, toggleTreeSelected,
  type TreeChange, type TreeNode, type TreeOptions, type TreeRenderState
} from '@xui/core';

export type xTreeNode = TreeNode<React.ReactNode>;
export type xTreeRenderState = TreeRenderState<React.ReactNode>;
export type xTreeProps = Omit<React.HTMLAttributes<HTMLUListElement>, 'children' | 'defaultChecked'> & TreeOptions & {
  nodes: xTreeNode[];
  defaultExpandedIds?: string[];
  defaultExpandAll?: boolean;
  defaultSelectedIds?: string[];
  defaultCheckedIds?: string[];
  onExpandedChange?: (ids: string[], detail: TreeChange<React.ReactNode>) => void;
  onSelectedChange?: (ids: string[], detail: TreeChange<React.ReactNode>) => void;
  onCheckedChange?: (ids: string[], detail: TreeChange<React.ReactNode>) => void;
  renderLabel?: (state: xTreeRenderState) => React.ReactNode;
  renderSwitcher?: (state: xTreeRenderState) => React.ReactNode;
  empty?: React.ReactNode;
};

export function xTree({
  nodes, expandedIds, selectedIds, checkedIds,
  defaultExpandedIds, defaultExpandAll = true, defaultSelectedIds = [], defaultCheckedIds = [],
  selectionMode = 'single', checkable = false, checkStrictly = false, disabled = false, loading = false,
  onExpandedChange, onSelectedChange, onCheckedChange, renderLabel, renderSwitcher, empty,
  onKeyDown, onBlur, ...props
}: xTreeProps) {
  const [localExpanded, setExpanded] = React.useState(() => defaultExpandedIds ?? (defaultExpandAll ? getTreeBranchIds(nodes) : []));
  const [localSelected, setSelected] = React.useState(defaultSelectedIds);
  const [localChecked, setChecked] = React.useState(defaultCheckedIds);
  const [focused, setFocused] = React.useState<string>();
  const root = React.useRef<HTMLUListElement>(null);
  const elements = React.useRef(new Map<string, HTMLLIElement>());
  const ownsFocus = React.useRef(false);
  const search = React.useRef({ text: '', time: 0 });
  const model = React.useMemo(() => createTreeModel(nodes, {
    expandedIds: expandedIds ?? localExpanded, selectedIds: selectedIds ?? localSelected,
    checkedIds: checkedIds ?? localChecked, selectionMode, checkable, checkStrictly, disabled, loading
  }), [nodes, expandedIds, localExpanded, selectedIds, localSelected, checkedIds, localChecked, selectionMode, checkable, checkStrictly, disabled, loading]);
  const focusId = getTreeFocusId(model, focused);
  const prefix = React.useId();
  const expanded = new Set(model.expandedIds);
  const selected = new Set(model.selectedIds);
  const checked = new Set(model.checkedIds);
  const halfChecked = new Set(model.halfCheckedIds);

  React.useEffect(() => {
    if (!ownsFocus.current || disabled || loading) return;
    if (focused !== focusId || !root.current?.contains(document.activeElement)) {
      (focusId === undefined ? root.current : elements.current.get(focusId))?.focus();
    }
  }, [focusId, focused, model, disabled, loading]);

  function focus(id: string) {
    setFocused(id);
    elements.current.get(id)?.focus();
  }
  function change(type: 'expand' | 'select' | 'check', id: string) {
    if (!canUseTree(model, id)) return;
    const node = model.entries.get(id)!.node;
    if (type === 'expand') {
      const ids = toggleTreeExpanded(model, id);
      if (ids === model.expandedIds) return;
      if (expandedIds === undefined) setExpanded(ids);
      onExpandedChange?.(ids, { node, expanded: ids.includes(id) });
    } else if (type === 'select') {
      const ids = toggleTreeSelected(model, id);
      if (ids === model.selectedIds) return;
      if (selectedIds === undefined) setSelected(ids);
      onSelectedChange?.(ids, { node, selected: ids.includes(id) });
    } else {
      const ids = toggleTreeChecked(model, id);
      if (ids === model.checkedIds) return;
      const next = createTreeModel(nodes, { ...model.options, checkedIds: ids });
      if (checkedIds === undefined) setChecked(next.checkedIds);
      onCheckedChange?.(next.checkedIds, { node, checked: next.checkedIds.includes(id), halfCheckedIds: next.halfCheckedIds });
    }
  }
  function keydown(event: React.KeyboardEvent<HTMLUListElement>, id: string) {
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || !canUseTree(model, id)) return;
    const action = getTreeKeyAction(model, id, event.key);
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      if (action.type === 'focus') focus(action.id);
      else change(action.type, action.id);
    } else if (event.key.length === 1 && event.key !== ' ') {
      const now = Date.now();
      search.current.text = now - search.current.time > 500 ? event.key : search.current.text + event.key;
      search.current.time = now;
      const query = [...search.current.text].every((char) => char === event.key) ? event.key : search.current.text;
      const match = findTreeTypeahead(model, id, query);
      if (match !== undefined) focus(match);
      event.preventDefault();
      event.stopPropagation();
    }
  }
  function renderNode(node: xTreeNode): React.ReactNode {
    const id = node.id;
    const entry = model.entries.get(id)!;
    const blocked = disabled || loading || entry.disabled;
    const state: xTreeRenderState = {
      ...entry, disabled: blocked, expanded: expanded.has(id), selected: selected.has(id),
      checked: checked.has(id), halfChecked: halfChecked.has(id), focused: focusId === id,
      toggleExpanded: () => change('expand', id), toggleSelected: () => change('select', id),
      toggleChecked: () => change('check', id)
    };
    const labelId = `${prefix}-${encodeURIComponent(id)}`;
    return (
      <li key={id} ref={(element) => { if (element) elements.current.set(id, element); else elements.current.delete(id); }}
        role="treeitem" tabIndex={!disabled && !loading && focusId === id ? 0 : -1}
        aria-labelledby={labelId} aria-level={entry.depth + 1} aria-posinset={entry.index + 1} aria-setsize={entry.size}
        aria-expanded={entry.branch ? state.expanded : undefined}
        aria-selected={selectionMode !== 'none' && node.selectable !== false ? state.selected : undefined}
        aria-checked={checkable ? state.halfChecked ? 'mixed' : state.checked : undefined}
        aria-disabled={blocked || undefined} data-part="item" data-node-id={id}
        data-expanded={entry.branch ? state.expanded : undefined} data-selected={state.selected}
        data-checked={state.halfChecked ? 'mixed' : state.checked} data-disabled={blocked || undefined}
        onFocus={(event) => { if (event.target === event.currentTarget) { ownsFocus.current = true; setFocused(id); } }}>
        <div data-part="row" onClick={(event) => {
          if (event.defaultPrevented || blocked) return;
          const target = event.target as HTMLElement;
          if (target.closest('button,input,a,select,textarea,[contenteditable="true"]')) return;
          focus(id);
          change('select', id);
        }}>
          {entry.branch ? (
            <button type="button" tabIndex={-1} data-part="switcher" disabled={blocked}
              aria-label={`${state.expanded ? 'Collapse' : 'Expand'} ${entry.text}`}
              onClick={(event) => { event.stopPropagation(); focus(id); change('expand', id); }}>
              <span aria-hidden="true">{renderSwitcher?.(state) ?? (state.expanded ? '-' : '+')}</span>
            </button>
          ) : null}
          {checkable ? (
            <input type="checkbox" data-part="checkbox" tabIndex={-1} disabled={blocked}
              aria-label={entry.text || id} checked={state.checked}
              ref={(element) => { if (element) element.indeterminate = state.halfChecked; }}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.currentTarget.indeterminate = state.halfChecked;
                focus(id);
                change('check', id);
              }} />
          ) : null}
          <span id={labelId} data-part="label">{renderLabel?.(state) ?? node.label}</span>
        </div>
        {entry.branch && state.expanded ? <ul role="group" data-part="group">{node.children!.map(renderNode)}</ul> : null}
      </li>
    );
  }
  return (
    <ul {...props} ref={root} role="tree" data-part="tree" aria-busy={loading || undefined}
      aria-disabled={disabled || undefined} aria-multiselectable={selectionMode === 'multiple' || undefined}
      tabIndex={focusId === undefined && !disabled && !loading ? 0 : -1}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        const target = event.target as HTMLElement;
        const id = target.dataset.nodeId;
        if (id !== undefined && target.closest('[role="tree"]') === event.currentTarget) keydown(event, id);
      }}
      onBlur={(event) => {
        if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) ownsFocus.current = false;
        onBlur?.(event);
      }}>
      {nodes.length ? nodes.map(renderNode) : empty != null ? <li role="none" data-part="empty">{empty}</li> : null}
    </ul>
  );
}
