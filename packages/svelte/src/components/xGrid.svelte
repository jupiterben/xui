<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    columns?: number | string;
    gap?: number | string;
    minColumnWidth?: number | string;
    children?: Snippet;
  };

  let { columns = 2, gap, minColumnWidth, children, ...rest }: Props = $props();

  let template = $derived(
    minColumnWidth !== undefined
      ? `repeat(auto-fit, minmax(${typeof minColumnWidth === 'number' ? `${minColumnWidth}px` : minColumnWidth}, 1fr))`
      : typeof columns === 'number'
        ? `repeat(${columns}, minmax(0, 1fr))`
        : columns
  );
</script>

<div
  {...rest}
  style:display="grid"
  style:grid-template-columns={template}
  style:gap={typeof gap === 'number' ? `${gap}px` : gap}
>
  {@render children?.()}
</div>
