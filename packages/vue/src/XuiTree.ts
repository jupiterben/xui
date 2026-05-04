import { type PropType, type VNodeChild, defineComponent, h } from 'vue';

export type XuiTreeNode = {
  id: string;
  label: string;
  children?: XuiTreeNode[];
};

function renderNode(
  node: XuiTreeNode,
  depth: number,
  renderLabel?: (state: { node: XuiTreeNode; depth: number }) => VNodeChild
): VNodeChild {
  const hasChildren = Boolean(node.children?.length);

  return h(
    'li',
    {
      key: node.id,
      role: 'treeitem',
      'aria-expanded': hasChildren ? true : undefined
    },
    [
      renderLabel?.({ node, depth }) ?? node.label,
      hasChildren ? h('ul', { role: 'group' }, node.children?.map((child) => renderNode(child, depth + 1, renderLabel))) : null
    ]
  );
}

export const XuiTree = defineComponent({
  name: 'XuiTree',
  props: {
    nodes: { type: Array as PropType<XuiTreeNode[]>, required: true }
  },
  setup(props, { slots }) {
    return () =>
      h(
        'ul',
        { role: 'tree' },
        props.nodes.map((node) => renderNode(node, 0, slots.default))
      );
  }
});
