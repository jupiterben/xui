<script lang="ts">
  import { toggle } from '@xui/core';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Props = Omit<HTMLButtonAttributes, 'children' | 'onchange'> & {
    defaultChecked?: boolean;
    checked?: boolean;
    loading?: boolean;
    onchange?: (checked: boolean) => void;
    children?: Snippet<[{ checked: boolean; loading: boolean }]>;
  };

  let {
    defaultChecked = false,
    checked = $bindable(defaultChecked),
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    onchange,
    children,
    ...rest
  }: Props = $props();

  function activate(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (disabled || loading) return;
    onclick?.(event);
    if (event.defaultPrevented) return;
    checked = toggle({ checked, disabled: disabled ?? false, loading }).checked;
    onchange?.(checked);
  }
</script>

<button
  {...rest}
  {type}
  role="switch"
  aria-checked={checked}
  aria-busy={loading || undefined}
  disabled={disabled || loading}
  onclick={activate}
>
  {#if children}
    {@render children({ checked, loading })}
  {:else}
    {loading ? '...' : checked ? 'On' : 'Off'}
  {/if}
</button>
