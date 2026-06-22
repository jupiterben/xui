import * as React from 'react';

export type xTreeNode = {
  id: string;
  label: React.ReactNode;
  children?: xTreeNode[];
};

type xTreeProps = React.HTMLAttributes<HTMLUListElement> & {
  nodes: xTreeNode[];
  renderLabel?: (state: { node: xTreeNode; depth: number }) => React.ReactNode;
};

function TreeNode({
  depth,
  node,
  renderLabel
}: {
  depth: number;
  node: xTreeNode;
  renderLabel?: xTreeProps['renderLabel'];
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

export function xTree({ nodes, renderLabel, ...props }: xTreeProps) {
  return (
    <ul role="tree" {...props}>
      {nodes.map((node) => (
        <TreeNode key={node.id} depth={0} node={node} renderLabel={renderLabel} />
      ))}
    </ul>
  );
}
