import * as React from 'react';

export type XuiListItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
};

type XuiListProps = Omit<React.HTMLAttributes<HTMLUListElement | HTMLOListElement>, 'children'> & {
  items: XuiListItem[];
  ordered?: boolean;
  children?: (state: { item: XuiListItem; index: number }) => React.ReactNode;
};

export function XuiList({ items, ordered = false, children, ...props }: XuiListProps) {
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
