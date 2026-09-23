<script lang="ts">
  import { canActivate } from '@xui/core';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Props = Omit<HTMLButtonAttributes, 'children'> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children?: Snippet;
  };

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    class: className,
    onclick,
    children,
    ...rest
  }: Props = $props();

  let interactive = $derived(canActivate({ disabled: disabled ?? false, loading }));
</script>

<button
  {...rest}
  {type}
  class={className}
  class:xui-button={true}
  data-variant={variant}
  data-size={size}
  data-loading={loading || undefined}
  aria-busy={loading || undefined}
  disabled={!interactive}
  onclick={(event) => {
    if (interactive) onclick?.(event);
  }}
>
  {@render children?.()}
</button>
