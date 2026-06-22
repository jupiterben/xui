import * as React from 'react';

export type xListItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
};

type xListProps = Omit<React.HTMLAttributes<HTMLUListElement | HTMLOListElement>, 'children'> & {
  items: xListItem[];
  ordered?: boolean;
  children?: (state: { item: xListItem; index: number }) => React.ReactNode;
};

export function xList({ items, ordered = false, children, ...props }: xListProps) {
  const Component = ordered ? 'ol' : 'ul';

  return (
    <Component role="list" {...props}>
      {items.map((item, index) => (
        <li key={item.id} role="listitem">
          {children?.({ item, index }) ?? (
            <>
              <span>{item.label}</span>
              {item.description ? <span>{item.description}</span> : null}
            </>
          )}
        </li>
      ))}
    </Component>
  );
}
