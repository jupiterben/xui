import * as React from 'react';

export type XuiTreeNode = {
  id: string;
  label: React.ReactNode;
  children?: XuiTreeNode[];
};

type XuiTreeProps = React.HTMLAttributes<HTMLUListElement> & {
  nodes: XuiTreeNode[];
  renderLabel?: (state: { node: XuiTreeNode; depth: number }) => React.ReactNode;
};

function TreeNode({
  depth,
  node,
  renderLabel
}: {
  depth: number;
  node: XuiTreeNode;
  renderLabel?: XuiTreeProps['renderLabel'];
}) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <li role="treeitem" aria-expanded={hasChildren ? true : undefined}>
      {renderLabel?.({ node, depth }) ?? node.label}
      {hasChildren ? (
        <ul role="group">
          {node.children?.map((child) => (
            <TreeNode key={child.id} depth={depth + 1} node={child} renderLabel={renderLabel} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function XuiTree({ nodes, renderLabel, ...props }: XuiTreeProps) {
  return (
    <ul role="tree" {...props}>
      {nodes.map((node) => (
        <TreeNode key={node.id} depth={0} node={node} renderLabel={renderLabel} />
      ))}
    </ul>
  );
}
