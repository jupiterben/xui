<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { xListItem } from './types.js';

  type Props = Omit<HTMLAttributes<HTMLUListElement | HTMLOListElement>, 'children'> & {
    items: xListItem[];
    ordered?: boolean;
    item?: Snippet<[{ item: xListItem; index: number }]>;
    children?: Snippet<[{ item: xListItem; index: number }]>;
  };

  let { items, ordered = false, item: renderItem, children, ...rest }: Props = $props();
</script>

<svelte:element this={ordered ? 'ol' : 'ul'} {...rest} role="list">
  {#each items as item, index (item.id)}
    <li role="listitem">
      {#if renderItem}
        {@render renderItem({ item, index })}
      {:else if children}
        {@render children({ item, index })}
      {:else}
        <span>{item.label}</span>
        {#if item.description}<span>{item.description}</span>{/if}
      {/if}
    </li>
  {/each}
</svelte:element>
