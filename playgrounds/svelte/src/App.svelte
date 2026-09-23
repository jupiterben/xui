<script lang="ts">
  import { onMount } from 'svelte';
  import { Box, Columns3, Grid2X2, List, MousePointer2, Plus, Radio, RotateCcw, ToggleLeft } from 'lucide-svelte';
  import {
    xButton as Button,
    xSwitch as Switch,
    xList as ItemList,
    xFlex as Flex,
    xGrid as Grid,
    useToggle
  } from '@xui/svelte';

  const catalog = [
    { id: 'button', name: 'Button', group: 'General', icon: MousePointer2 },
    { id: 'switch', name: 'Switch', group: 'Data entry', icon: ToggleLeft },
    { id: 'list', name: 'List', group: 'Data display', icon: List },
    { id: 'flex', name: 'Flex', group: 'Layout', icon: Columns3 },
    { id: 'grid', name: 'Grid', group: 'Layout', icon: Grid2X2 },
    { id: 'store', name: 'useToggle', group: 'Stores', icon: Radio }
  ];
  const groups = [...new Set(catalog.map((item) => item.group))];
  const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
  const sizes = ['sm', 'md', 'lg'] as const;
  const initialItems = [
    { id: 'tokens', label: 'Design tokens', description: 'Foundation / Colors and spacing' },
    { id: 'components', label: 'Component library', description: 'Development / Svelte adapter' },
    { id: 'accessibility', label: 'Accessibility review', description: 'Quality / Keyboard and focus' },
    { id: 'release', label: 'Release checklist', description: 'Delivery / Version 0.1.0' },
    { id: 'docs', label: 'Documentation', description: 'Content / API reference' },
    { id: 'tests', label: 'Integration tests', description: 'Quality / Component coverage' }
  ];

  let activeId = $state('button');
  let active = $derived(catalog.find((item) => item.id === activeId) ?? catalog[0]);
  let variant = $state<(typeof variants)[number]>('primary');
  let size = $state<(typeof sizes)[number]>('md');
  let disabled = $state(false);
  let loading = $state(false);
  let checked = $state(false);
  let clicks = $state(0);
  let lastEvent = $state('No events yet');
  let ordered = $state(false);
  let reversed = $state(false);
  let count = $state(3);
  let gap = $state(16);
  let direction = $state<'row' | 'column'>('row');
  let justify = $state('flex-start');
  let wrap = $state(true);
  let columns = $state(3);
  let autoFit = $state(false);
  let items = $derived(reversed ? initialItems.slice(0, count).reverse() : initialItems.slice(0, count));
  const model = useToggle();
  const { checked: storeChecked, disabled: storeDisabled, loading: storeLoading, interactive } = model;

  onMount(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      activeId = catalog.some((item) => item.id === id) ? id : 'button';
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  });

  function record(event: string) {
    clicks += 1;
    lastEvent = event;
  }

  function reset() {
    variant = 'primary';
    size = 'md';
    disabled = false;
    loading = false;
    checked = false;
    ordered = false;
    reversed = false;
    count = 3;
    gap = 16;
    direction = 'row';
    justify = 'flex-start';
    wrap = true;
    columns = 3;
    autoFit = false;
    model.setDisabled(false);
    model.setLoading(false);
    if ($storeChecked) model.toggle();
    clicks = 0;
    lastEvent = 'No events yet';
  }
</script>

<a class="skip-link" href="#preview" onclick={(event) => {
  event.preventDefault();
  document.getElementById('preview')?.focus();
}}>Skip to preview</a>
<div class="playground-shell">
  <aside class="sidebar">
    <div class="brand"><Box size={24} strokeWidth={1.8} /><span>xui<span class="brand-dot">.</span></span></div>
    <div class="framework"><span class="framework-mark" aria-hidden="true">S</span><span>Svelte playground</span><span class="version">5</span></div>
    <nav aria-label="Components">
      {#each groups as group}
        <div class="nav-group">
          <p>{group}</p>
          {#each catalog.filter((item) => item.group === group) as item}
            <a href={`#${item.id}`} class:active={activeId === item.id} aria-current={activeId === item.id ? 'page' : undefined}>
              <item.icon size={17} strokeWidth={1.6} />
              <span>{item.name}</span>
              {#if activeId === item.id}<span class="active-dot" aria-hidden="true"></span>{/if}
            </a>
          {/each}
        </div>
      {/each}
    </nav>
    <div class="sidebar-footer"><span class="status-dot"></span>@xui/svelte <span>0.1.0</span></div>
  </aside>

  <main>
    <header class="topbar"><span>Playground <span class="separator">/</span> {active.group}</span><span class="adapter-label">Svelte 5</span></header>
    <div class="workspace">
      <header class="component-header">
        <div><p class="eyebrow">{active.group}</p><h1>{active.name}</h1></div>
        <button class="icon-button" type="button" title="Reset examples" aria-label="Reset examples" onclick={reset}><RotateCcw size={18} /></button>
      </header>
      <div class="workspace-label"><span>Preview</span><code>{activeId === 'store' ? 'useToggle()' : `x${active.name}`}</code></div>
      <div class="example-workspace">
        <section id="preview" class="preview" class:layout-preview={activeId === 'flex' || activeId === 'grid'} tabindex="-1" aria-label={`${active.name} preview`}>
          {#if activeId === 'button'}
            <Button {variant} {size} {disabled} {loading} onclick={() => record('Button clicked')}>
              {#if loading}<span class="spinner" aria-hidden="true"></span>{:else}<Plus size={16} />{/if}
              {loading ? 'Creating project' : 'Create project'}
            </Button>
          {:else if activeId === 'switch'}
            <div class="switch-example">
              <div><h2>Notifications</h2><p>{checked ? 'Enabled' : 'Disabled'}</p></div>
              <Switch bind:checked {disabled} {loading} aria-label="Notifications" class="switch" onchange={(value) => record(`checked: ${value}`)}>
                {#snippet children(state)}<span class="switch-thumb">{#if state.loading}<span class="spinner" aria-hidden="true"></span>{/if}</span>{/snippet}
              </Switch>
            </div>
          {:else if activeId === 'list'}
            <div class="list-example">
              <div class="list-heading"><h2>Workspace</h2><span>{items.length} items</span></div>
              <ItemList {items} {ordered} class="demo-list">
                {#snippet item({ item, index })}
                  <span class="item-index">{ordered ? `${index + 1}.` : String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{item.label}</strong><p>{item.description}</p></div>
                {/snippet}
              </ItemList>
              {#if items.length === 0}<p class="empty-state">No items</p>{/if}
            </div>
          {:else if activeId === 'flex'}
            <Flex {direction} {gap} {wrap} {justify} align="center" class="demo-flex">
              {#each ['Alpha', 'Beta', 'Gamma', 'Delta'] as label, index}<div class="layout-item" class:alternate={index % 2 === 1}>{label}</div>{/each}
            </Flex>
          {:else if activeId === 'grid'}
            <Grid {columns} {gap} minColumnWidth={autoFit ? 120 : undefined} class="demo-grid">
              {#each Array.from({ length: 6 }, (_, i) => i + 1) as number}<div class="layout-item" class:alternate={number % 2 === 0}>{String(number).padStart(2, '0')}</div>{/each}
            </Grid>
          {:else}
            <div class="store-example">
              <span class="store-indicator" class:on={$storeChecked}><Radio size={24} /></span>
              <h2>{$storeChecked ? 'On' : 'Off'}</h2>
              <Button disabled={!$interactive} onclick={() => { model.toggle(); record(`store.checked: ${$storeChecked}`); }}>Toggle value</Button>
            </div>
          {/if}
        </section>

        <aside class="controls" aria-label="Properties">
          <h2>Properties</h2>
          {#if activeId === 'button'}
            <label class="field"><span>Variant</span><select bind:value={variant}>{#each variants as option}<option value={option}>{option}</option>{/each}</select></label>
            <fieldset><legend>Size</legend><div class="segments">{#each sizes as option}<label><input type="radio" name="size" value={option} bind:group={size} /><span>{option}</span></label>{/each}</div></fieldset>
          {/if}
          {#if activeId === 'button' || activeId === 'switch'}
            <label class="check-field"><span>Disabled</span><input type="checkbox" bind:checked={disabled} /></label>
            <label class="check-field"><span>Loading</span><input type="checkbox" bind:checked={loading} /></label>
            {#if activeId === 'switch'}<label class="check-field"><span>Checked</span><input type="checkbox" bind:checked /></label>{/if}
          {:else if activeId === 'list'}
            <label class="field"><span>Items <output>{count}</output></span><input type="range" min="0" max="6" step="1" bind:value={count} /></label>
            <label class="check-field"><span>Ordered</span><input type="checkbox" bind:checked={ordered} /></label>
            <label class="check-field"><span>Reverse order</span><input type="checkbox" bind:checked={reversed} /></label>
          {:else if activeId === 'flex'}
            <label class="field"><span>Direction</span><select bind:value={direction}><option value="row">Row</option><option value="column">Column</option></select></label>
            <label class="field"><span>Justify</span><select bind:value={justify}><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option><option value="space-between">Space between</option></select></label>
            <label class="check-field"><span>Wrap</span><input type="checkbox" bind:checked={wrap} /></label>
          {:else if activeId === 'grid'}
            <label class="field"><span>Columns <output>{columns}</output></span><input type="range" min="1" max="4" step="1" bind:value={columns} disabled={autoFit} /></label>
            <label class="check-field"><span>Auto-fit</span><input type="checkbox" bind:checked={autoFit} /></label>
          {:else if activeId === 'store'}
            <label class="check-field"><span>Disabled</span><input type="checkbox" checked={$storeDisabled} onchange={(event) => model.setDisabled(event.currentTarget.checked)} /></label>
            <label class="check-field"><span>Loading</span><input type="checkbox" checked={$storeLoading} onchange={(event) => model.setLoading(event.currentTarget.checked)} /></label>
          {/if}
          {#if activeId === 'flex' || activeId === 'grid'}
            <label class="field"><span>Gap <output>{gap}px</output></span><input type="range" min="0" max="40" step="4" bind:value={gap} /></label>
          {/if}
          <div class="property-footer"><span class="status-dot"></span>Live</div>
        </aside>
      </div>

      {#if activeId === 'button'}
        <section class="variants-section" aria-label="Button variants">
          <h2>Variants</h2>
          <Flex wrap gap={12}>
            {#each variants as option}<Button variant={option} onclick={() => record(`${option} clicked`)}>{option[0].toUpperCase() + option.slice(1)}</Button>{/each}
          </Flex>
        </section>
      {/if}

      <section class="state-section" aria-label="State">
        <h2>State</h2>
        <dl>
          {#if activeId === 'switch'}<div><dt>checked</dt><dd>{String(checked)}</dd></div>{/if}
          {#if activeId === 'button' || activeId === 'switch'}
            <div><dt>disabled</dt><dd>{String(disabled)}</dd></div><div><dt>loading</dt><dd>{String(loading)}</dd></div>
          {:else if activeId === 'store'}
            <div><dt>checked</dt><dd>{String($storeChecked)}</dd></div><div><dt>interactive</dt><dd>{String($interactive)}</dd></div>
            <div><dt>disabled</dt><dd>{String($storeDisabled)}</dd></div><div><dt>loading</dt><dd>{String($storeLoading)}</dd></div>
          {:else if activeId === 'list'}
            <div><dt>items.length</dt><dd>{items.length}</dd></div><div><dt>ordered</dt><dd>{String(ordered)}</dd></div>
          {:else}
            <div><dt>{activeId === 'flex' ? 'direction' : 'columns'}</dt><dd>{activeId === 'flex' ? direction : autoFit ? 'auto-fit' : columns}</dd></div>
            <div><dt>gap</dt><dd>{gap}px</dd></div>
          {/if}
        </dl>
      </section>
      <footer class="event-footer"><span><Radio size={14} /> Events <span class="event-count">{clicks}</span></span><output aria-live="polite">{lastEvent}</output></footer>
    </div>
  </main>
</div>
