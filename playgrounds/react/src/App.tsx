import { useEffect, useMemo, useRef, useState } from 'react';
import { x } from '@xui/react';
import type { xThemeGeneratorOptions, xThemeInput } from '@xui/core';
import { defaultThemePresets } from '@xui/core';
import { saveThemeGenerationHistory, type xThemeGenerationOutput } from '../../theme-history';
import { CanvasFrame } from './CanvasFrame';
import { cn, s } from './studio-ui';
import {
  type EditorComponentType,
  type EditorNode,
  type EditorProject,
  canvasResolutionPresets,
  defaultCanvasResolutionId,
  getCanvasResolution,
  getNodeLabel,
  palette,
  type PaletteItem
} from './editor-shared';

type EditorTemplate = {
  id: string;
  name: string;
  summary: string;
  createNodes: () => EditorNode[];
};

const initialNodes: EditorNode[] = [
  { id: 'node-title', type: 'title', props: { text: 'Operations Dashboard', level: 2 } },
  { id: 'node-alert', type: 'alert', props: { message: 'All systems operational', description: 'Drag components from the palette to extend this screen.', type: 'success', showIcon: true } },
  { id: 'node-space', type: 'space', props: { direction: 'horizontal', size: 'middle' } },
  { id: 'node-button', type: 'button', props: { text: 'Create report', variant: 'primary', size: 'md' } },
  { id: 'node-tag', type: 'tag', props: { text: 'Live', color: 'processing' } },
  { id: 'node-badge', type: 'badge', props: { text: 'Tasks', count: 8 } }
];

const storageKey = 'xui-react-editor-project';

const defaultProject: EditorProject = {
  name: 'Untitled interface',
  nodes: initialNodes,
  theme: defaultThemePresets[0],
  resolutionId: defaultCanvasResolutionId
};

function loadEditorProject(): EditorProject {
  if (typeof window === 'undefined') {
    return defaultProject;
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) {
      return defaultProject;
    }

    const parsed = JSON.parse(value) as Partial<EditorProject>;
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : defaultProject.name,
      nodes: Array.isArray(parsed.nodes) && parsed.nodes.length ? parsed.nodes : defaultProject.nodes,
      theme: parsed.theme ? { ...defaultProject.theme, ...parsed.theme } : defaultProject.theme,
      resolutionId: typeof parsed.resolutionId === 'string' && getCanvasResolution(parsed.resolutionId).id === parsed.resolutionId
        ? parsed.resolutionId
        : defaultProject.resolutionId
    };
  } catch {
    return defaultProject;
  }
}

function saveEditorProject(project: EditorProject) {
  window.localStorage.setItem(storageKey, JSON.stringify(project));
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable);
}

async function generateThemeWithModel(prompt: string, options?: xThemeGeneratorOptions) {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image: options?.image })
  });

  if (!response.ok) {
    throw new Error('Theme API request failed');
  }

  const payload = (await response.json()) as xThemeGenerationOutput;
  saveThemeGenerationHistory('react', prompt, options?.image, payload);
  return payload.theme;
}

function createNode(type: EditorComponentType): EditorNode {
  const item = palette.find((entry) => entry.type === type) ?? palette[0];
  return {
    id: `node-${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type,
    props: { layoutAlign: 'stretch', layoutWidth: 'full', ...item.defaults }
  };
}

function createNodeWithProps(type: EditorComponentType, props: EditorNode['props']): EditorNode {
  return {
    ...createNode(type),
    props: { layoutAlign: 'stretch', layoutWidth: 'full', ...props }
  };
}

const templates: EditorTemplate[] = [
  {
    id: 'status-summary',
    name: 'Status Summary',
    summary: 'Title, alert, and action row',
    createNodes: () => [
      createNodeWithProps('title', { text: 'Service health', level: 2 }),
      createNodeWithProps('alert', { message: 'All services are healthy', description: 'No incidents detected in the last 24 hours.', type: 'success', showIcon: true }),
      createNodeWithProps('button', { text: 'View incident history', variant: 'outline', size: 'md', layoutWidth: 'auto' })
    ]
  },
  {
    id: 'approval-flow',
    name: 'Approval Flow',
    summary: 'Copy, switch, and primary action',
    createNodes: () => [
      createNodeWithProps('paragraph', { text: 'Review the generated report before publishing it to the customer workspace.' }),
      createNodeWithProps('switch', { text: 'Require approval before publishing', checked: true }),
      createNodeWithProps('button', { text: 'Publish report', variant: 'primary', size: 'md', layoutWidth: 'auto' })
    ]
  },
  {
    id: 'metadata-row',
    name: 'Metadata Row',
    summary: 'Tags and badge for operational screens',
    createNodes: () => [
      createNodeWithProps('tag', { text: 'Production', color: 'processing', layoutWidth: 'auto' }),
      createNodeWithProps('badge', { text: 'Open tasks', count: 12, layoutWidth: 'auto' }),
      createNodeWithProps('divider', { text: 'Details', orientation: 'left' })
    ]
  }
];

function FieldEditor({
  label,
  node,
  name,
  onChange,
  options,
  type = 'text'
}: {
  label: string;
  node: EditorNode;
  name: string;
  onChange: (id: string, name: string, value: string | boolean | number) => void;
  options?: string[];
  type?: 'text' | 'number' | 'checkbox';
}) {
  const value = node.props[name];

  if (type === 'checkbox') {
    return (
      <label className={s.fieldCheckbox}>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(node.id, name, event.target.checked)} />
        <span>{label}</span>
      </label>
    );
  }

  if (options) {
    return (
      <label className={s.field}>
        <span>{label}</span>
        <select className={s.select} value={String(value)} onChange={(event) => onChange(node.id, name, event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className={s.field}>
      <span>{label}</span>
      <input
        className={s.input}
        type={type}
        value={String(value ?? '')}
        onChange={(event) => onChange(node.id, name, type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </label>
  );
}

function LayersTree({
  filter,
  nodes,
  selectedId,
  onDelete,
  onMove,
  onMoveToIndex,
  onSearch,
  onSelect
}: {
  filter: string;
  nodes: EditorNode[];
  selectedId?: string;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onMoveToIndex: (id: string, index: number) => void;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  const normalizedFilter = filter.trim().toLowerCase();
  const visibleNodes = normalizedFilter
    ? nodes.filter((node) => {
      const nodeLabel = getNodeLabel(node);
      return [node.type, nodeLabel.label, nodeLabel.detail, nodeLabel.group].some((value) => value.toLowerCase().includes(normalizedFilter));
    })
    : nodes;

  return (
    <aside className={cn(s.sidebar, s.sidebarLayers)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={s.eyebrow}>Structure</p>
          <h2 className={s.heading}>Layers</h2>
        </div>
        <span className={s.countBadge}>{nodes.length}</span>
      </div>

      <label className={s.layerSearch}>
        <span>Search layers</span>
        <input className={s.input} value={filter} placeholder="Button, alert, title..." onChange={(event) => onSearch(event.target.value)} />
      </label>

      <div className={s.tree} role="tree" aria-label="Component structure">
        <div className={s.treeRoot} role="treeitem" aria-expanded="true">
          <span className={s.treeRootIcon} aria-hidden="true" />
          <span className="grid min-w-0 gap-px">
            <strong className="truncate text-[11px] font-medium">Canvas</strong>
            <span className="truncate text-[10px] text-[var(--xui-color-text-secondary)]">Application Screen</span>
          </span>
          <span className={s.countBadge}>{nodes.length}</span>
        </div>
        <div className={s.treeChildren} role="group">
          {visibleNodes.length ? (
            visibleNodes.map((node) => {
              const index = nodes.findIndex((entry) => entry.id === node.id);
              const nodeLabel = getNodeLabel(node);
              const selected = selectedId === node.id;

              return (
                <div
                  key={node.id}
                  className={s.treeItem(selected)}
                  draggable
                  role="treeitem"
                  tabIndex={0}
                  aria-level={2}
                  aria-posinset={index + 1}
                  aria-selected={selected}
                  aria-setsize={nodes.length}
                  onClick={() => onSelect(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(node.id);
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={(event) => event.dataTransfer.setData('application/xui-node', node.id)}
                  onDrop={(event) => {
                    event.preventDefault();
                    const draggedNodeId = event.dataTransfer.getData('application/xui-node');
                    if (draggedNodeId) {
                      onMoveToIndex(draggedNodeId, index);
                    }
                  }}
                >
                  <span className={s.treeConnector} aria-hidden="true" />
                  <span className={s.treeDrag} aria-hidden="true">⋮⋮</span>
                  <button className={s.treeSelect} type="button" onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}>
                    <span className={s.treeBadge}>{node.type}</span>
                    <span className={s.treeMain}>
                      <strong>{nodeLabel.label}</strong>
                      <span>{nodeLabel.detail}</span>
                    </span>
                  </button>
                  <span className={s.treeGroup}>{nodeLabel.group}</span>
                  <div className={s.treeActions(selected)}>
                    <button className={s.treeActionButton} type="button" aria-label="Move layer up" onClick={(event) => { event.stopPropagation(); onMove(node.id, -1); }}>↑</button>
                    <button className={s.treeActionButton} type="button" aria-label="Move layer down" onClick={(event) => { event.stopPropagation(); onMove(node.id, 1); }}>↓</button>
                    <button className={s.treeActionButton} type="button" aria-label="Delete layer" onClick={(event) => { event.stopPropagation(); onDelete(node.id); }}>×</button>
                  </div>
                  <span className={s.treeIndex}>{String(index + 1).padStart(2, '0')}</span>
                </div>
              );
            })
          ) : (
            <div className={s.treeEmpty}>{nodes.length ? 'No matching layers' : 'No components yet'}</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Inspector({
  node,
  onChange,
  onDelete,
  onDuplicate,
  onMove
}: {
  node?: EditorNode;
  onChange: (id: string, name: string, value: string | boolean | number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  if (!node) {
    return (
      <aside className={cn(s.sidebar, s.sidebarInspector)}>
        <p className={s.eyebrow}>Inspector</p>
        <h2 className={s.heading}>Select a layer</h2>
        <p className={s.copy}>Click a component on the canvas to edit its properties.</p>
      </aside>
    );
  }

  return (
    <aside className={cn(s.sidebar, s.sidebarInspector)}>
      <p className={s.eyebrow}>Inspector</p>
      <h2 className={s.heading}>{palette.find((item) => item.type === node.type)?.label}</h2>

      {['button', 'tag', 'title', 'paragraph', 'divider', 'switch', 'badge'].includes(node.type) ? <FieldEditor label="Text" node={node} name="text" onChange={onChange} /> : null}
      {node.type === 'button' ? <FieldEditor label="Variant" node={node} name="variant" options={['primary', 'secondary', 'outline', 'ghost']} onChange={onChange} /> : null}
      {node.type === 'button' ? <FieldEditor label="Size" node={node} name="size" options={['sm', 'md', 'lg']} onChange={onChange} /> : null}
      {node.type === 'button' ? <FieldEditor label="Disabled" node={node} name="disabled" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'title' ? <FieldEditor label="Level" node={node} name="level" type="number" onChange={onChange} /> : null}
      {node.type === 'paragraph' ? <FieldEditor label="Ellipsis" node={node} name="ellipsis" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'alert' ? <FieldEditor label="Message" node={node} name="message" onChange={onChange} /> : null}
      {node.type === 'alert' ? <FieldEditor label="Description" node={node} name="description" onChange={onChange} /> : null}
      {node.type === 'alert' ? <FieldEditor label="Type" node={node} name="type" options={['success', 'info', 'warning', 'error']} onChange={onChange} /> : null}
      {node.type === 'alert' ? <FieldEditor label="Show icon" node={node} name="showIcon" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'alert' ? <FieldEditor label="Closable" node={node} name="closable" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'tag' ? <FieldEditor label="Color" node={node} name="color" options={['default', 'success', 'processing', 'warning', 'error', '#7c3aed']} onChange={onChange} /> : null}
      {node.type === 'tag' ? <FieldEditor label="Closable" node={node} name="closable" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'badge' ? <FieldEditor label="Count" node={node} name="count" type="number" onChange={onChange} /> : null}
      {node.type === 'badge' ? <FieldEditor label="Dot" node={node} name="dot" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'switch' ? <FieldEditor label="Checked" node={node} name="checked" type="checkbox" onChange={onChange} /> : null}
      {node.type === 'divider' ? <FieldEditor label="Orientation" node={node} name="orientation" options={['left', 'center', 'right']} onChange={onChange} /> : null}
      {node.type === 'space' ? <FieldEditor label="Direction" node={node} name="direction" options={['horizontal', 'vertical']} onChange={onChange} /> : null}
      {node.type === 'space' ? <FieldEditor label="Size" node={node} name="size" options={['small', 'middle', 'large']} onChange={onChange} /> : null}
      <div className={s.inspectorSection}>
        <p className={s.eyebrow}>Layout</p>
        <FieldEditor label="Width" node={node} name="layoutWidth" options={['full', 'auto', 'half']} onChange={onChange} />
        <FieldEditor label="Align" node={node} name="layoutAlign" options={['stretch', 'left', 'center', 'right']} onChange={onChange} />
      </div>

      <div className={s.inspectorActions}>
        <x.Button variant="outline" size="sm" onClick={() => onMove(node.id, -1)}>Up</x.Button>
        <x.Button variant="outline" size="sm" onClick={() => onMove(node.id, 1)}>Down</x.Button>
        <x.Button variant="outline" size="sm" onClick={() => onDuplicate(node.id)}>Duplicate</x.Button>
        <x.Button variant="ghost" size="sm" onClick={() => onDelete(node.id)}>Delete</x.Button>
      </div>
    </aside>
  );
}

export default function App() {
  const initialProject = useMemo(() => loadEditorProject(), []);
  const [projectName, setProjectName] = useState(initialProject.name);
  const [theme, setTheme] = useState<xThemeInput>(initialProject.theme);
  const [nodes, setNodes] = useState<EditorNode[]>(initialProject.nodes);
  const [pastNodes, setPastNodes] = useState<EditorNode[][]>([]);
  const [futureNodes, setFutureNodes] = useState<EditorNode[][]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialProject.nodes[0]?.id);
  const [layerFilter, setLayerFilter] = useState('');
  const [resolutionId, setResolutionId] = useState(initialProject.resolutionId ?? defaultCanvasResolutionId);
  const [zoom, setZoom] = useState(100);
  const [saveStatus, setSaveStatus] = useState('Saved locally');
  const [paletteFilter, setPaletteFilter] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const resolution = useMemo(() => getCanvasResolution(resolutionId), [resolutionId]);
  const resolutionGroups = useMemo(
    () => ['Desktop', 'Tablet', 'Mobile'] as const,
    []
  );
  const groupedPalette = useMemo(
    () => palette
      .filter((item) => {
        const query = paletteFilter.trim().toLowerCase();
        return !query || [item.type, item.label, item.group].some((value) => value.toLowerCase().includes(query));
      })
      .reduce<Record<string, PaletteItem[]>>((result, item) => {
      result[item.group] = [...(result[item.group] ?? []), item];
      return result;
    }, {}),
    [paletteFilter]
  );
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveEditorProject({ name: projectName, nodes, theme, resolutionId });
      setSaveStatus('Saved locally');
    }, 250);

    setSaveStatus('Saving...');
    return () => window.clearTimeout(timeout);
  }, [nodes, projectName, resolutionId, theme]);

  const commitNodes = (updater: (current: EditorNode[]) => EditorNode[]) => {
    setNodes((current) => {
      const next = updater(current);
      if (next === current || JSON.stringify(next) === JSON.stringify(current)) {
        return current;
      }

      setPastNodes((history) => [...history.slice(-39), current]);
      setFutureNodes([]);
      return next;
    });
  };

  const addNode = (type: EditorComponentType, index = nodes.length) => {
    const next = createNode(type);
    commitNodes((current) => [...current.slice(0, index), next, ...current.slice(index)]);
    setSelectedId(next.id);
  };

  const addTemplate = (template: EditorTemplate) => {
    const nextNodes = template.createNodes();
    commitNodes((current) => [...current, ...nextNodes]);
    setSelectedId(nextNodes[0]?.id);
  };

  const updateNode = (id: string, name: string, value: string | boolean | number) => {
    commitNodes((current) => current.map((node) => node.id === id ? { ...node, props: { ...node.props, [name]: value } } : node));
  };

  const deleteNode = (id: string) => {
    commitNodes((current) => current.filter((node) => node.id !== id));
    setSelectedId((current) => current === id ? undefined : current);
  };

  const duplicateNode = (id: string) => {
    const node = nodes.find((entry) => entry.id === id);
    if (!node) {
      return;
    }

    const index = nodes.findIndex((entry) => entry.id === id);
    const next = { ...node, id: `node-${node.type}-${Date.now()}` };
    commitNodes((current) => [...current.slice(0, index + 1), next, ...current.slice(index + 1)]);
    setSelectedId(next.id);
  };

  const moveNode = (id: string, direction: -1 | 1) => {
    commitNodes((current) => {
      const index = current.findIndex((node) => node.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [node] = next.splice(index, 1);
      next.splice(nextIndex, 0, node);
      return next;
    });
  };

  const moveNodeToIndex = (id: string, nextIndex: number) => {
    commitNodes((current) => {
      const index = current.findIndex((node) => node.id === id);

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length || index === nextIndex) {
        return current;
      }

      const next = [...current];
      const [node] = next.splice(index, 1);
      next.splice(nextIndex, 0, node);
      return next;
    });
  };

  const undo = () => {
    setPastNodes((history) => {
      const previous = history[history.length - 1];
      if (!previous) {
        return history;
      }

      setFutureNodes((future) => [nodes, ...future]);
      setNodes(previous);
      setSelectedId(previous[0]?.id);
      return history.slice(0, -1);
    });
  };

  const redo = () => {
    setFutureNodes((future) => {
      const next = future[0];
      if (!next) {
        return future;
      }

      setPastNodes((history) => [...history, nodes]);
      setNodes(next);
      setSelectedId(next[0]?.id);
      return future.slice(1);
    });
  };

  const resetProject = () => {
    commitNodes(() => initialNodes);
    setProjectName(defaultProject.name);
    setTheme(defaultProject.theme);
    setResolutionId(defaultProject.resolutionId ?? defaultCanvasResolutionId);
    setSelectedId(initialNodes[0]?.id);
  };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify({ name: projectName, nodes, theme, resolutionId }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'xui-project'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applyImportedProject = (value: string) => {
    try {
      const parsed = JSON.parse(value) as Partial<EditorProject>;
      if (!Array.isArray(parsed.nodes)) {
        throw new Error('Project JSON must include nodes');
      }

      setProjectName(typeof parsed.name === 'string' ? parsed.name : defaultProject.name);
      setTheme(parsed.theme ? { ...defaultProject.theme, ...parsed.theme } : defaultProject.theme);
      setResolutionId(typeof parsed.resolutionId === 'string' && getCanvasResolution(parsed.resolutionId).id === parsed.resolutionId
        ? parsed.resolutionId
        : defaultProject.resolutionId ?? defaultCanvasResolutionId);
      commitNodes(() => parsed.nodes as EditorNode[]);
      setSelectedId(parsed.nodes[0]?.id);
    } catch {
      window.alert('Invalid project JSON');
    }
  };

  const importProjectFile = (file?: File) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        applyImportedProject(reader.result);
      }
    });
    reader.readAsText(file);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault();
        deleteNode(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [futureNodes, nodes, pastNodes, selectedId]);

  return (
    <main className={s.shell}>
        <header className={s.productBar}>
          <div className={s.brand}>
            <span className={s.brandMark}>X</span>
            <div>
              <p className={s.eyebrow}>XUI Studio</p>
              <input
                aria-label="Project name"
                className={s.projectName}
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
              />
            </div>
          </div>
          <div className={s.status}>{saveStatus}</div>
          <x.Space size="small">
            <x.Button variant="outline" size="sm" disabled={!pastNodes.length} onClick={undo}>Undo</x.Button>
            <x.Button variant="outline" size="sm" disabled={!futureNodes.length} onClick={redo}>Redo</x.Button>
            <x.Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>Import</x.Button>
            <x.Button variant="outline" size="sm" onClick={exportProject}>Export</x.Button>
          </x.Space>
          <input
            ref={importInputRef}
            hidden
            accept="application/json,.json"
            type="file"
            onChange={(event) => {
              importProjectFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </header>

        <aside className={cn(s.sidebar, s.sidebarPalette)}>
          <div>
            <p className={s.eyebrow}>xui builder</p>
            <h1 className={s.heading}>Drag Drop UI Editor</h1>
            <p className={s.copy}>Drag components onto the canvas, select a layer, and edit props in the inspector.</p>
          </div>

          <label className={s.paletteSearch}>
            <span>Search components</span>
            <input className={s.input} value={paletteFilter} placeholder="Button, alert, badge..." onChange={(event) => setPaletteFilter(event.target.value)} />
          </label>

          <nav className={s.paletteGroups} aria-label="Component palette">
            {Object.entries(groupedPalette).map(([group, items]) => (
              <section key={group}>
                <p className={s.groupLabel}>{group}</p>
                <div className={s.paletteItems}>
                  {items.map((item) => (
                    <button
                      key={item.type}
                      className={s.paletteButton}
                      draggable
                      type="button"
                      onClick={() => addNode(item.type)}
                      onDragStart={(event) => event.dataTransfer.setData('application/xui-component', item.type)}
                    >
                      <span>{item.label}</span>
                      <small className="text-[10px] text-[var(--xui-color-text-secondary)]">{item.type}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <section className={s.templateSection}>
            <p className={s.groupLabel}>Templates</p>
            <div className={s.templateList}>
              {templates.map((template) => (
                <button key={template.id} className={s.templateButton} type="button" onClick={() => addTemplate(template)}>
                  <strong className="text-[11px] font-medium">{template.name}</strong>
                  <span className="text-[10px] text-[var(--xui-color-text-secondary)]">{template.summary}</span>
                </button>
              ))}
            </div>
          </section>

          <x.ThemeDesigner
            className={s.themePanel}
            initialTheme={theme}
            onThemeChange={setTheme}
            themeGenerator={generateThemeWithModel}
          />
        </aside>

        <LayersTree
          nodes={nodes}
          filter={layerFilter}
          selectedId={selectedId}
          onDelete={deleteNode}
          onMove={moveNode}
          onMoveToIndex={moveNodeToIndex}
          onSearch={setLayerFilter}
          onSelect={setSelectedId}
        />

        <section className={s.stage}>
          <header className={s.toolbar}>
            <div>
              <p className={s.eyebrow}>Canvas</p>
              <h2 className={s.heading}>Application Screen</h2>
            </div>
            <x.Space>
              <select className={s.toolbarSelect} aria-label="Resolution" value={resolutionId} onChange={(event) => setResolutionId(event.target.value)}>
                  {resolutionGroups.map((group) => (
                    <optgroup key={group} label={group}>
                      {canvasResolutionPresets.filter((preset) => preset.group === group).map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label} ({preset.width}×{preset.height})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              <span className={s.resolutionMeta}>{resolution.width}×{resolution.height}</span>
              <select className={s.toolbarSelect} aria-label="Zoom" value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
              </select>
              <x.Button variant="outline" size="sm" onClick={resetProject}>Reset</x.Button>
              <x.Button size="sm" onClick={() => addNode('button')}>Add Button</x.Button>
            </x.Space>
          </header>

          <div className={s.canvasViewport}>
            <CanvasFrame
              nodes={nodes}
              resolutionId={resolutionId}
              selectedId={selectedId}
              theme={theme}
              zoom={zoom}
              onAddComponent={addNode}
              onMoveNodeToIndex={moveNodeToIndex}
              onSelect={setSelectedId}
            />
          </div>

        </section>

      <Inspector node={selectedNode} onChange={updateNode} onDelete={deleteNode} onDuplicate={duplicateNode} onMove={moveNode} />
    </main>
  );
}
