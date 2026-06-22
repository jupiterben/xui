export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const border = 'border-[color-mix(in_srgb,var(--xui-color-border)_72%,transparent)]';
const control = 'h-[26px] rounded border bg-transparent px-2 text-[11px] text-[var(--xui-color-text)] outline-none';

export const s = {
  shell: cn(
    'grid min-h-screen grid-rows-[auto_minmax(0,1fr)]',
    'grid-cols-[minmax(228px,240px)_minmax(228px,240px)_minmax(0,1fr)_minmax(228px,240px)]',
    'bg-[var(--xui-color-bg-layout)] text-xs leading-snug text-[var(--xui-color-text)]',
    'max-[1180px]:grid-cols-1'
  ),
  productBar: cn(
    'sticky top-0 z-30 col-span-full grid items-center gap-1.5 min-h-9 px-2.5',
    'grid-cols-[minmax(220px,1fr)_auto_auto] border-b backdrop-blur-sm',
    border,
    'bg-[color-mix(in_srgb,var(--xui-color-bg-container)_96%,transparent)]',
    'max-[1180px]:grid-cols-1'
  ),
  brand: 'flex min-w-0 items-center gap-1.5',
  brandMark: cn(
    'inline-flex h-[22px] w-[22px] items-center justify-center rounded',
    'bg-[var(--xui-color-primary)] text-[11px] font-medium text-[var(--xui-accent-contrast)]'
  ),
  projectName: cn(
    'w-[min(360px,60vw)] border-0 bg-transparent p-0 text-sm font-medium',
    'text-[var(--xui-color-text)] outline-none focus:text-[var(--xui-color-primary)]'
  ),
  status: 'whitespace-nowrap text-[11px] text-[var(--xui-color-text-secondary)]',
  sidebar: cn(
    'sticky top-9 h-[calc(100vh-36px)] overflow-auto bg-[var(--xui-color-bg-container)] p-2.5',
    'max-[1180px]:static max-[1180px]:h-auto'
  ),
  sidebarPalette: cn('border-r', border),
  sidebarLayers: cn('border-r', border),
  sidebarInspector: cn('border-l', border),
  eyebrow: 'm-0 text-[10px] font-normal uppercase tracking-wider text-[var(--xui-color-primary)]',
  heading: 'my-0.5 text-sm font-medium text-[var(--xui-color-text)]',
  copy: 'm-0 text-[11px] leading-snug text-[var(--xui-color-text-secondary)]',
  groupLabel: 'mb-1 text-[10px] font-normal uppercase tracking-wider text-[var(--xui-color-primary)]',
  field: 'mt-2 grid gap-0.5 text-[11px] text-[var(--xui-color-text-secondary)]',
  fieldCheckbox: 'mt-2 flex items-center gap-2 text-[11px] text-[var(--xui-color-text-secondary)]',
  input: cn(
    control, border,
    'w-full min-w-0 bg-[var(--xui-color-bg-layout)]',
    'focus:border-[var(--xui-color-primary)] focus:shadow-[var(--xui-focus-ring)]'
  ),
  select: cn(
    control, border,
    'bg-[var(--xui-color-bg-layout)]',
    'focus:border-[var(--xui-color-primary)] focus:shadow-[var(--xui-focus-ring)]'
  ),
  paletteSearch: 'mt-3 grid gap-0.5 text-[11px] text-[var(--xui-color-text-secondary)]',
  paletteGroups: 'mt-3 grid gap-3',
  paletteItems: 'grid gap-0.5',
  paletteButton: cn(
    'flex min-h-[26px] cursor-grab items-center justify-between gap-1.5 rounded border px-2 text-left active:cursor-grabbing',
    border,
    'text-[var(--xui-color-text)] hover:border-[var(--xui-color-primary)] hover:bg-[var(--xui-color-primary-bg)]'
  ),
  templateSection: 'mt-3',
  templateList: 'mt-1 grid gap-0.5',
  templateButton: cn(
    'grid min-h-[26px] gap-px rounded border px-2 py-1 text-left',
    border,
    'text-[var(--xui-color-text)] hover:border-[var(--xui-color-primary)] hover:bg-[var(--xui-color-primary-bg)]'
  ),
  themePanel: cn('mt-3 rounded border p-2 [&_h2]:mt-1 [&_h2]:text-sm [&_h2]:font-medium', border),
  stage: 'min-w-0 p-2.5',
  toolbar: cn(
    'mb-2 flex min-h-[26px] items-center justify-between gap-2 rounded border px-2 py-1.5',
    border,
    'bg-[var(--xui-color-bg-container)] max-[1180px]:flex-col max-[1180px]:items-start'
  ),
  toolbarSelect: cn(control, border, 'max-w-[220px] bg-[var(--xui-color-bg-layout)]'),
  resolutionMeta: 'font-mono text-[10px] whitespace-nowrap text-[var(--xui-color-text-secondary)]',
  canvasViewport: 'grid justify-center overflow-auto p-1',
  frameShell: cn('relative overflow-hidden rounded border bg-[var(--xui-color-bg-layout)] shadow-sm', border),
  frame: 'block border-0 bg-transparent',
  countBadge: cn(
    'inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full border text-[10px]',
    border,
    'text-[var(--xui-color-text-secondary)]'
  ),
  layerSearch: 'mt-3 grid gap-0.5 text-[11px] text-[var(--xui-color-text-secondary)]',
  tree: 'mt-3 grid gap-1',
  treeRoot: cn(
    'grid min-h-8 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-1.5 rounded border px-2 py-1',
    border
  ),
  treeRootIcon: 'studio-root-icon relative inline-flex h-5 w-5 rounded bg-[var(--xui-color-primary-bg)]',
  treeChildren: 'studio-tree-children relative ml-2.5 grid gap-0.5 pl-2.5',
  treeItem: (selected: boolean) => cn(
    'group relative grid min-w-0 cursor-pointer rounded border border-transparent px-1.5 py-1',
    'grid-cols-[12px_minmax(0,1fr)_auto] [grid-template-areas:"drag_main_index"_"drag_group_actions"]',
    'gap-x-1 gap-y-0.5 transition-colors hover:border-[color-mix(in_srgb,var(--xui-color-primary)_50%,var(--xui-color-border))] hover:bg-[var(--xui-color-fill-secondary)]',
    'focus-visible:outline-none focus-visible:border-[var(--xui-color-primary)] focus-visible:shadow-[var(--xui-focus-ring)]',
    selected && 'border-[var(--xui-color-primary)] bg-[color-mix(in_srgb,var(--xui-color-primary-bg)_55%,transparent)] shadow-[inset_2px_0_0_var(--xui-color-primary)]'
  ),
  treeConnector: 'studio-tree-connector pointer-events-none absolute top-[22px] right-full w-4',
  treeDrag: '[grid-area:drag] flex items-center justify-center self-stretch cursor-grab text-[13px] tracking-[-0.2em] text-[var(--xui-color-text-disabled)] [writing-mode:vertical-rl] group-active:cursor-grabbing',
  treeSelect: '[grid-area:main] grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-1 border-0 bg-transparent p-0 text-left text-[var(--xui-color-text)]',
  treeBadge: cn(
    'inline-flex h-4 min-w-[26px] items-center justify-center rounded-sm border font-mono text-[9px] uppercase',
    border,
    'text-[var(--xui-color-primary)]'
  ),
  treeMain: 'grid min-w-0 gap-px [&_strong]:truncate [&_strong]:text-[11px] [&_span]:truncate [&_span]:text-[10px] [&_span]:text-[var(--xui-color-text-secondary)]',
  treeGroup: '[grid-area:group] min-w-0 truncate pl-[30px] text-[10px] text-[var(--xui-color-text-secondary)]',
  treeIndex: '[grid-area:index] font-mono text-[10px] text-[var(--xui-color-text-disabled)]',
  treeActions: (selected: boolean) => cn(
    '[grid-area:actions] flex justify-end gap-0.5 opacity-0 pointer-events-none transition-opacity',
    'group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
    selected && 'opacity-100 pointer-events-auto'
  ),
  treeActionButton: cn(
    'inline-flex h-[18px] w-5 items-center justify-center rounded-sm border border-transparent',
    'text-[11px] text-[var(--xui-color-text-secondary)] hover:border-[var(--xui-color-border)] hover:bg-[var(--xui-color-bg-container)] hover:text-[var(--xui-color-text)]'
  ),
  treeEmpty: cn('rounded border border-dashed p-3 text-center text-[11px] text-[var(--xui-color-text-secondary)]', border),
  inspectorSection: cn('mt-3 border-t pt-2', border),
  inspectorActions: 'mt-3 flex flex-wrap gap-1',
  canvasRoot: 'min-h-full bg-[var(--xui-color-bg-layout)]',
  canvasTheme: 'box-border overflow-auto bg-[var(--xui-color-bg-layout)]',
  canvas: 'grid min-h-full grid-cols-1 content-start gap-2 p-3',
  canvasNode: (selected: boolean) => cn(
    'relative cursor-pointer rounded border border-transparent bg-[var(--xui-color-bg-container)] p-2',
    'hover:border-[var(--xui-color-primary)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--xui-color-primary)_35%,transparent)]',
    selected && 'border-[var(--xui-color-primary)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--xui-color-primary)_35%,transparent)]',
    '[&[data-width=auto]]:w-fit [&[data-width=half]]:w-[min(50%,520px)] [&[data-width=full]]:w-full',
    '[&[data-align=left]]:justify-self-start [&[data-align=center]]:justify-self-center [&[data-align=right]]:justify-self-end [&[data-align=stretch]]:justify-self-stretch'
  ),
  canvasNodeMeta: cn(
    'absolute top-0 right-1.5 -translate-y-1/2 rounded-full border bg-[var(--xui-color-bg-container)] px-1.5 py-px text-[10px] text-[var(--xui-color-text-secondary)]',
    border
  ),
  canvasEmpty: cn(
    'grid min-h-[240px] place-items-center rounded border border-dashed text-[11px] text-[var(--xui-color-text-secondary)]',
    border
  )
};
