<script lang="ts">
  import {
    xSwitch as Switch,
    xButton as Button,
    xList as List,
    xFlex as Flex,
    xGrid as Grid
  } from '@xui/svelte';

  let checked = $state(false);
  let loading = $state(false);
  let items = $state([{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]);
</script>

<Switch bind:checked {loading} aria-label="Bound switch">
  {#snippet children(state)}
    {state.checked ? 'Enabled' : 'Disabled'}
  {/snippet}
</Switch>
<output>{String(checked)}</output>
<Button onclick={() => checked = !checked}>Set checked</Button>
<Button onclick={() => loading = !loading}>Set loading</Button>
<Button onclick={() => items = [...items].reverse()}>Reverse</Button>
<List {items} ordered>
  {#snippet item({ item, index })}
    <strong>{index}: {item.label}</strong>
  {/snippet}
</List>
<Flex gap={8} direction="column" wrap class="layout" style="color: red">
  <span>Flex content</span>
</Flex>
<Grid columns={3} minColumnWidth={120} gap="1rem">
  <span>Grid content</span>
</Grid>
