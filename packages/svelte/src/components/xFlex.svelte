<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    align?: string;
    justify?: string;
    gap?: number | string;
    wrap?: boolean;
    children?: Snippet;
  };

  let {
    direction = 'row',
    align,
    justify,
    gap,
    wrap = false,
    children,
    ...rest
  }: Props = $props();
</script>

<div
  {...rest}
  style:display="flex"
  style:flex-direction={direction}
  style:align-items={align}
  style:justify-content={justify}
  style:gap={typeof gap === 'number' ? `${gap}px` : gap}
  style:flex-wrap={wrap ? 'wrap' : 'nowrap'}
>
  {@render children?.()}
</div>
