import { type PropType, type VNodeChild, computed, defineComponent, h, ref, watchPostEffect } from 'vue';
import {
  canUseTree, createTreeModel, findTreeTypeahead, getTreeBranchIds, getTreeFocusId,
  getTreeKeyAction, toggleTreeChecked, toggleTreeExpanded, toggleTreeSelected,
  type TreeChange, type TreeNode, type TreeRenderState, type TreeSelectionMode
} from '@xui/core';

export type xTreeNode = TreeNode;
export type xTreeRenderState = TreeRenderState;

export const xTree = defineComponent({
  name: 'xTree',
  inheritAttrs: false,
  props: {
    nodes: { type: Array as PropType<xTreeNode[]>, required: true },
    expandedIds: { type: Array as PropType<readonly string[]>, default: undefined },
    selectedIds: { type: Array as PropType<readonly string[]>, default: undefined },
    checkedIds: { type: Array as PropType<readonly string[]>, default: undefined },
    defaultExpandedIds: { type: Array as PropType<string[]>, default: undefined },
    defaultSelectedIds: { type: Array as PropType<string[]>, default: () => [] },
    defaultCheckedIds: { type: Array as PropType<string[]>, default: () => [] },
    defaultExpandAll: { type: Boolean, default: true },
    selectionMode: { type: String as PropType<TreeSelectionMode>, default: 'single' },
    checkable: { type: Boolean, default: false },
    checkStrictly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: {
    'update:expandedIds': (_ids: string[]) => true,
    'update:selectedIds': (_ids: string[]) => true,
    'update:checkedIds': (_ids: string[]) => true,
    expandedChange: (_ids: string[], _detail: TreeChange) => true,
    selectedChange: (_ids: string[], _detail: TreeChange) => true,
    checkedChange: (_ids: string[], _detail: TreeChange) => true
  },
  setup(props, { slots, attrs, emit }) {
    const localExpanded = ref(props.defaultExpandedIds ?? (props.defaultExpandAll ? getTreeBranchIds(props.nodes) : []));
    const localSelected = ref(props.defaultSelectedIds);
    const localChecked = ref(props.defaultCheckedIds);
    const focused = ref<string>();
    const root = ref<HTMLUListElement>();
    const elements = new Map<string, HTMLLIElement>();
    let ownsFocus = false;
    const search = { text: '', time: 0 };
    const model = computed(() => createTreeModel(props.nodes, {
      expandedIds: props.expandedIds ?? localExpanded.value,
      selectedIds: props.selectedIds ?? localSelected.value,
      checkedIds: props.checkedIds ?? localChecked.value,
      selectionMode: props.selectionMode, checkable: props.checkable,
      checkStrictly: props.checkStrictly, disabled: props.disabled, loading: props.loading
    }));
    const focusId = computed(() => getTreeFocusId(model.value, focused.value));
    watchPostEffect(() => {
      const target = focusId.value;
      if (!ownsFocus || props.disabled || props.loading) return;
      if (focused.value !== target || !root.value?.contains(document.activeElement)) {
        (target === undefined ? root.value : elements.get(target))?.focus();
      }
    });
    function focus(id: string) {
      focused.value = id;
      elements.get(id)?.focus();
    }
    function change(type: 'expand' | 'select' | 'check', id: string) {
      const current = model.value;
      if (!canUseTree(current, id)) return;
      const node = current.entries.get(id)!.node;
      if (type === 'expand') {
        const ids = toggleTreeExpanded(current, id);
        if (ids === current.expandedIds) return;
        if (props.expandedIds === undefined) localExpanded.value = ids;
        emit('update:expandedIds', ids);
        emit('expandedChange', ids, { node, expanded: ids.includes(id) });
      } else if (type === 'select') {
        const ids = toggleTreeSelected(current, id);
        if (ids === current.selectedIds) return;
        if (props.selectedIds === undefined) localSelected.value = ids;
        emit('update:selectedIds', ids);
        emit('selectedChange', ids, { node, selected: ids.includes(id) });
      } else {
        const ids = toggleTreeChecked(current, id);
        if (ids === current.checkedIds) return;
        const next = createTreeModel(props.nodes, { ...current.options, checkedIds: ids });
        if (props.checkedIds === undefined) localChecked.value = next.checkedIds;
        emit('update:checkedIds', next.checkedIds);
        emit('checkedChange', next.checkedIds, { node, checked: next.checkedIds.includes(id), halfCheckedIds: next.halfCheckedIds });
      }
    }
    function callAttribute(name: string, event: Event) {
      const handler = attrs[name];
      if (Array.isArray(handler)) handler.forEach((callback) => callback(event));
      else if (typeof handler === 'function') handler(event);
    }
    function keydown(event: KeyboardEvent, id: string) {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || !canUseTree(model.value, id)) return;
      const action = getTreeKeyAction(model.value, id, event.key);
      if (action) {
        event.preventDefault();
        event.stopPropagation();
        if (action.type === 'focus') focus(action.id);
        else change(action.type, action.id);
      } else if (event.key.length === 1 && event.key !== ' ') {
        const now = Date.now();
        search.text = now - search.time > 500 ? event.key : search.text + event.key;
        search.time = now;
        const query = [...search.text].every((char) => char === event.key) ? event.key : search.text;
        const match = findTreeTypeahead(model.value, id, query);
        if (match !== undefined) focus(match);
        event.preventDefault();
        event.stopPropagation();
      }
    }
    return () => {
      const current = model.value;
      const expanded = new Set(current.expandedIds);
      const selected = new Set(current.selectedIds);
      const checked = new Set(current.checkedIds);
      const halfChecked = new Set(current.halfCheckedIds);
      function renderNode(node: xTreeNode): VNodeChild {
        const id = node.id;
        const entry = current.entries.get(id)!;
        const blocked = props.disabled || props.loading || entry.disabled;
        const state: xTreeRenderState = {
          ...entry, disabled: blocked, expanded: expanded.has(id), selected: selected.has(id),
          checked: checked.has(id), halfChecked: halfChecked.has(id), focused: focusId.value === id,
          toggleExpanded: () => change('expand', id), toggleSelected: () => change('select', id),
          toggleChecked: () => change('check', id)
        };
        return h('li', {
          key: id,
          ref: (element) => { if (element) elements.set(id, element as HTMLLIElement); else elements.delete(id); },
          role: 'treeitem', tabindex: !props.disabled && !props.loading && focusId.value === id ? 0 : -1,
          'aria-label': entry.text, 'aria-level': entry.depth + 1,
          'aria-posinset': entry.index + 1, 'aria-setsize': entry.size,
          'aria-expanded': entry.branch ? state.expanded : undefined,
          'aria-selected': props.selectionMode !== 'none' && node.selectable !== false ? state.selected : undefined,
          'aria-checked': props.checkable ? state.halfChecked ? 'mixed' : state.checked : undefined,
          'aria-disabled': blocked || undefined, 'data-part': 'item', 'data-node-id': id,
          'data-expanded': entry.branch ? state.expanded : undefined, 'data-selected': state.selected,
          'data-checked': state.halfChecked ? 'mixed' : state.checked, 'data-disabled': blocked || undefined,
          onFocus: (event: FocusEvent) => { if (event.target === event.currentTarget) { ownsFocus = true; focused.value = id; } }
        }, [
          h('div', {
            'data-part': 'row',
            onClick: (event: MouseEvent) => {
              if (event.defaultPrevented || blocked) return;
              if ((event.target as HTMLElement).closest('button,input,a,select,textarea,[contenteditable="true"]')) return;
              focus(id);
              change('select', id);
            }
          }, [
            entry.branch ? h('button', {
              type: 'button', tabindex: -1, 'data-part': 'switcher', disabled: blocked,
              'aria-label': `${state.expanded ? 'Collapse' : 'Expand'} ${entry.text}`,
              onClick: (event: MouseEvent) => { event.stopPropagation(); focus(id); change('expand', id); }
            }, h('span', { 'aria-hidden': 'true' }, slots.switcher?.(state) ?? (state.expanded ? '-' : '+'))) : null,
            props.checkable ? h('input', {
              type: 'checkbox', 'data-part': 'checkbox', tabindex: -1, disabled: blocked,
              'aria-label': entry.text || id, checked: state.checked, indeterminate: state.halfChecked,
              onClick: (event: MouseEvent) => event.stopPropagation(),
              onChange: (event: Event) => {
                const input = event.target as HTMLInputElement;
                // Restore controlled DOM even when the parent declines the proposed change.
                input.checked = state.checked;
                input.indeterminate = state.halfChecked;
                focus(id);
                change('check', id);
              }
            }) : null,
            h('span', { 'data-part': 'label' }, slots.default?.(state) ?? node.label)
          ]),
          entry.branch && state.expanded ? h('ul', { role: 'group', 'data-part': 'group' }, node.children!.map(renderNode)) : null
        ]);
      }
      return h('ul', {
        ...attrs, ref: root, role: 'tree', 'data-part': 'tree',
        'aria-busy': props.loading || undefined, 'aria-disabled': props.disabled || undefined,
        'aria-multiselectable': props.selectionMode === 'multiple' || undefined,
        tabindex: focusId.value === undefined && !props.disabled && !props.loading ? 0 : -1,
        onKeydown: (event: KeyboardEvent) => {
          callAttribute('onKeydown', event);
          const target = event.target as HTMLElement;
          const id = target.dataset.nodeId;
          if (id !== undefined && target.closest('[role="tree"]') === event.currentTarget) keydown(event, id);
        },
        onFocusout: (event: FocusEvent) => {
          if (!event.relatedTarget || !root.value?.contains(event.relatedTarget as Node)) ownsFocus = false;
          callAttribute('onFocusout', event);
        }
      }, props.nodes.length ? props.nodes.map(renderNode) : slots.empty ? [h('li', { role: 'none', 'data-part': 'empty' }, slots.empty())] : []);
    };
  }
});
