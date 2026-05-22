import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import {
  XuiAlert,
  XuiBadge,
  XuiButton,
  XuiDivider,
  XuiSpace,
  XuiSwitch,
  XuiTag,
  XuiThemeDesigner,
  XuiTypographyParagraph,
  XuiTypographyText,
  XuiTypographyTitle
} from '@xui/react';
import type { XuiThemeGeneratorOptions, XuiThemeInput } from '@xui/core';
import { defaultThemePresets } from '@xui/core';
import { saveThemeGenerationHistory, type XuiThemeGenerationOutput } from '../../theme-history';

type EditorComponentType = 'button' | 'title' | 'paragraph' | 'alert' | 'tag' | 'badge' | 'switch' | 'divider' | 'space';

type EditorNode = {
  id: string;
  type: EditorComponentType;
  props: Record<string, string | boolean | number>;
};

type EditorProject = {
  name: string;
  nodes: EditorNode[];
  theme: XuiThemeInput;
};

type EditorViewport = 'desktop' | 'tablet' | 'mobile';

type PaletteItem = {
  type: EditorComponentType;
  label: string;
  group: string;
  defaults: EditorNode['props'];
};

type EditorTemplate = {
  id: string;
  name: string;
  summary: string;
  createNodes: () => EditorNode[];
};

const palette: PaletteItem[] = [
  { type: 'button', label: 'Button', group: 'General', defaults: { text: 'Save changes', variant: 'primary', size: 'md' } },
  { type: 'title', label: 'Title', group: 'General', defaults: { text: 'Dashboard overview', level: 2 } },
  { type: 'paragraph', label: 'Paragraph', group: 'General', defaults: { text: 'Compose a screen by dragging components onto the canvas.' } },
  { type: 'space', label: 'Space', group: 'Layout', defaults: { direction: 'horizontal', size: 'middle' } },
  { type: 'divider', label: 'Divider', group: 'Layout', defaults: { text: 'Details', orientation: 'left' } },
  { type: 'switch', label: 'Switch', group: 'Data Entry', defaults: { text: 'Enable notifications', checked: true } },
  { type: 'tag', label: 'Tag', group: 'Data Display', defaults: { text: 'Production', color: 'success' } },
  { type: 'badge', label: 'Badge', group: 'Data Display', defaults: { text: 'Inbox', count: 12 } },
  { type: 'alert', label: 'Alert', group: 'Feedback', defaults: { message: 'Deployment completed', description: 'The latest build is available.', type: 'success', showIcon: true } }
];

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
  theme: defaultThemePresets[0]
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
      theme: parsed.theme ? { ...defaultProject.theme, ...parsed.theme } : defaultProject.theme
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

async function generateThemeWithModel(prompt: string, options?: XuiThemeGeneratorOptions) {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image: options?.image })
  });

  if (!response.ok) {
    throw new Error('Theme API request failed');
  }

  const payload = (await response.json()) as XuiThemeGenerationOutput;
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

function propString(value: unknown) {
  if (typeof value === 'boolean') {
    return value ? '{true}' : '{false}';
  }

  if (typeof value === 'number') {
    return `{${value}}`;
  }

  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function generateNodeJsx(node: EditorNode) {
  const p = node.props;

  if (node.type === 'button') {
    return `<XuiButton variant=${propString(p.variant)} size=${propString(p.size)} disabled={${Boolean(p.disabled)}}>${p.text}</XuiButton>`;
  }

  if (node.type === 'title') {
    return `<XuiTypographyTitle level={${p.level}}>${p.text}</XuiTypographyTitle>`;
  }

  if (node.type === 'paragraph') {
    return `<XuiTypographyParagraph ellipsis={${Boolean(p.ellipsis)}}>${p.text}</XuiTypographyParagraph>`;
  }

  if (node.type === 'alert') {
    return `<XuiAlert type=${propString(p.type)} message=${propString(p.message)} description=${propString(p.description)} showIcon={${Boolean(p.showIcon)}} closable={${Boolean(p.closable)}} />`;
  }

  if (node.type === 'tag') {
    return `<XuiTag color=${propString(p.color)} closable={${Boolean(p.closable)}}>${p.text}</XuiTag>`;
  }

  if (node.type === 'badge') {
    return `<XuiBadge count={${Number(p.count) || 0}} text=${propString(p.text)} dot={${Boolean(p.dot)}} />`;
  }

  if (node.type === 'switch') {
    return `<XuiSwitch defaultChecked={${Boolean(p.checked)}}>{({ checked }) => <span>{checked ? 'ON' : 'OFF'}</span>}</XuiSwitch>`;
  }

  if (node.type === 'divider') {
    return `<XuiDivider orientation=${propString(p.orientation)}>${p.text}</XuiDivider>`;
  }

  return `<XuiSpace direction=${propString(p.direction)} size=${propString(p.size)}><XuiButton>Action</XuiButton><XuiTag>Tag</XuiTag></XuiSpace>`;
}

function renderNode(node: EditorNode) {
  const p = node.props;

  if (node.type === 'button') {
    return <XuiButton disabled={Boolean(p.disabled)} variant={String(p.variant) as 'primary'} size={String(p.size) as 'md'}>{String(p.text)}</XuiButton>;
  }

  if (node.type === 'title') {
    return <XuiTypographyTitle level={Number(p.level) as 1 | 2 | 3 | 4 | 5}>{String(p.text)}</XuiTypographyTitle>;
  }

  if (node.type === 'paragraph') {
    return <XuiTypographyParagraph ellipsis={Boolean(p.ellipsis)}>{String(p.text)}</XuiTypographyParagraph>;
  }

  if (node.type === 'alert') {
    return <XuiAlert closable={Boolean(p.closable)} type={String(p.type) as 'success'} message={String(p.message)} description={String(p.description)} showIcon={Boolean(p.showIcon)} />;
  }

  if (node.type === 'tag') {
    return <XuiTag closable={Boolean(p.closable)} color={String(p.color)}>{String(p.text)}</XuiTag>;
  }

  if (node.type === 'badge') {
    return <XuiBadge count={Number(p.count) || 0} dot={Boolean(p.dot)} text={String(p.text)} />;
  }

  if (node.type === 'switch') {
    return (
      <XuiSpace align="center" size="middle">
        <XuiSwitch defaultChecked={Boolean(p.checked)}>{({ checked }) => <span className={`xui-switch-demo ${checked ? 'xui-switch-demo--checked' : ''}`}>{checked ? 'ON' : 'OFF'}</span>}</XuiSwitch>
        <XuiTypographyText type="secondary">{String(p.text)}</XuiTypographyText>
      </XuiSpace>
    );
  }

  if (node.type === 'divider') {
    return <XuiDivider orientation={String(p.orientation) as 'left'}>{String(p.text)}</XuiDivider>;
  }

  return (
    <XuiSpace direction={String(p.direction) as 'horizontal'} size={String(p.size) as 'middle'} wrap>
      <XuiButton>Action</XuiButton>
      <XuiTag>Tag</XuiTag>
      <XuiBadge count={3}><span className="xui-demo-avatar">A</span></XuiBadge>
    </XuiSpace>
  );
}

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
      <label className="xui-editor-field xui-editor-field--checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(node.id, name, event.target.checked)} />
        <span>{label}</span>
      </label>
    );
  }

  if (options) {
    return (
      <label className="xui-editor-field">
        <span>{label}</span>
        <select value={String(value)} onChange={(event) => onChange(node.id, name, event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="xui-editor-field">
      <span>{label}</span>
      <input
        type={type}
        value={String(value ?? '')}
        onChange={(event) => onChange(node.id, name, type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </label>
  );
}

function getNodeLabel(node: EditorNode) {
  const item = palette.find((entry) => entry.type === node.type);
  const label = item?.label ?? node.type;
  const text = node.type === 'alert' ? node.props.message : node.props.text;
  return {
    group: item?.group ?? 'Component',
    label,
    detail: typeof text === 'string' && text.trim() ? text : node.id
  };
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
    <aside className="xui-editor-layers">
      <div className="xui-editor-layers__header">
        <div>
          <p className="xui-playground-eyebrow">Structure</p>
          <h2>Layers</h2>
        </div>
        <span className="xui-editor-layers__count">{nodes.length}</span>
      </div>

      <label className="xui-editor-layer-search">
        <span>Search layers</span>
        <input value={filter} placeholder="Button, alert, title..." onChange={(event) => onSearch(event.target.value)} />
      </label>

      <div className="xui-editor-tree" role="tree" aria-label="Component structure">
        <div className="xui-editor-tree__root" role="treeitem" aria-expanded="true">
          <span className="xui-editor-tree__root-icon" aria-hidden="true" />
          <span className="xui-editor-tree__root-main">
            <strong>Canvas</strong>
            <span>Application Screen</span>
          </span>
          <span className="xui-editor-tree__root-count">{nodes.length}</span>
        </div>
        <div className="xui-editor-tree__children" role="group">
          {visibleNodes.length ? (
            visibleNodes.map((node) => {
              const index = nodes.findIndex((entry) => entry.id === node.id);
              const nodeLabel = getNodeLabel(node);
              const selected = selectedId === node.id;

              return (
                <div
                  key={node.id}
                  className={['xui-editor-tree__item', selected ? 'is-selected' : undefined].filter(Boolean).join(' ')}
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
                  <span className="xui-editor-tree__connector" aria-hidden="true" />
                  <span className="xui-editor-tree__drag" aria-hidden="true">⋮⋮</span>
                  <button className="xui-editor-tree__select" type="button" onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}>
                    <span className="xui-editor-tree__badge">{node.type}</span>
                    <span className="xui-editor-tree__main">
                      <strong>{nodeLabel.label}</strong>
                      <span>{nodeLabel.detail}</span>
                    </span>
                  </button>
                  <span className="xui-editor-tree__group">{nodeLabel.group}</span>
                  <div className="xui-editor-tree__actions">
                    <button type="button" aria-label="Move layer up" onClick={(event) => { event.stopPropagation(); onMove(node.id, -1); }}>↑</button>
                    <button type="button" aria-label="Move layer down" onClick={(event) => { event.stopPropagation(); onMove(node.id, 1); }}>↓</button>
                    <button type="button" aria-label="Delete layer" onClick={(event) => { event.stopPropagation(); onDelete(node.id); }}>×</button>
                  </div>
                  <span className="xui-editor-tree__index">{String(index + 1).padStart(2, '0')}</span>
                </div>
              );
            })
          ) : (
            <div className="xui-editor-tree__empty">{nodes.length ? 'No matching layers' : 'No components yet'}</div>
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
      <aside className="xui-editor-inspector">
        <p className="xui-playground-eyebrow">Inspector</p>
        <h2>Select a layer</h2>
        <p className="xui-playground-copy">Click a component on the canvas to edit its properties.</p>
      </aside>
    );
  }

  return (
    <aside className="xui-editor-inspector">
      <p className="xui-playground-eyebrow">Inspector</p>
      <h2>{palette.find((item) => item.type === node.type)?.label}</h2>

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
      <div className="xui-editor-inspector__section">
        <p className="xui-playground-eyebrow">Layout</p>
        <FieldEditor label="Width" node={node} name="layoutWidth" options={['full', 'auto', 'half']} onChange={onChange} />
        <FieldEditor label="Align" node={node} name="layoutAlign" options={['stretch', 'left', 'center', 'right']} onChange={onChange} />
      </div>

      <div className="xui-editor-inspector__actions">
        <XuiButton variant="outline" size="sm" onClick={() => onMove(node.id, -1)}>Up</XuiButton>
        <XuiButton variant="outline" size="sm" onClick={() => onMove(node.id, 1)}>Down</XuiButton>
        <XuiButton variant="outline" size="sm" onClick={() => onDuplicate(node.id)}>Duplicate</XuiButton>
        <XuiButton variant="ghost" size="sm" onClick={() => onDelete(node.id)}>Delete</XuiButton>
      </div>
    </aside>
  );
}

export default function App() {
  const initialProject = useMemo(() => loadEditorProject(), []);
  const [projectName, setProjectName] = useState(initialProject.name);
  const [theme, setTheme] = useState<XuiThemeInput>(initialProject.theme);
  const [canvasTarget, setCanvasTarget] = useState<HTMLElement | undefined>();
  const [nodes, setNodes] = useState<EditorNode[]>(initialProject.nodes);
  const [pastNodes, setPastNodes] = useState<EditorNode[][]>([]);
  const [futureNodes, setFutureNodes] = useState<EditorNode[][]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialProject.nodes[0]?.id);
  const [layerFilter, setLayerFilter] = useState('');
  const [viewport, setViewport] = useState<EditorViewport>('desktop');
  const [zoom, setZoom] = useState(100);
  const [saveStatus, setSaveStatus] = useState('Saved locally');
  const [paletteFilter, setPaletteFilter] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);
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
  const generatedJsx = useMemo(() => ['<XuiSpace direction="vertical" size="middle">', ...nodes.map((node) => `  ${generateNodeJsx(node)}`), '</XuiSpace>'].join('\n'), [nodes]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveEditorProject({ name: projectName, nodes, theme });
      setSaveStatus('Saved locally');
    }, 250);

    setSaveStatus('Saving...');
    return () => window.clearTimeout(timeout);
  }, [nodes, projectName, theme]);

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

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/xui-component') as EditorComponentType;
    if (type) {
      addNode(type);
    }
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
    setSelectedId(initialNodes[0]?.id);
  };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify({ name: projectName, nodes, theme }, null, 2)], { type: 'application/json' });
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
      <main className="xui-editor-shell">
        <header className="xui-editor-productbar">
          <div className="xui-editor-brand">
            <span className="xui-editor-brand__mark">X</span>
            <div>
              <p className="xui-playground-eyebrow">XUI Studio</p>
              <input
                aria-label="Project name"
                className="xui-editor-project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
              />
            </div>
          </div>
          <div className="xui-editor-productbar__status">{saveStatus}</div>
          <XuiSpace size="small">
            <XuiButton variant="outline" size="sm" disabled={!pastNodes.length} onClick={undo}>Undo</XuiButton>
            <XuiButton variant="outline" size="sm" disabled={!futureNodes.length} onClick={redo}>Redo</XuiButton>
            <XuiButton variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>Import</XuiButton>
            <XuiButton variant="outline" size="sm" onClick={exportProject}>Export</XuiButton>
          </XuiSpace>
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

        <aside className="xui-editor-palette">
          <div>
            <p className="xui-playground-eyebrow">xui builder</p>
            <h1>Drag Drop UI Editor</h1>
            <p className="xui-playground-copy">Drag components into the canvas, select a layer, edit props, and copy the generated JSX.</p>
          </div>

          <label className="xui-editor-palette-search">
            <span>Search components</span>
            <input value={paletteFilter} placeholder="Button, alert, badge..." onChange={(event) => setPaletteFilter(event.target.value)} />
          </label>

          <nav className="xui-editor-palette__groups" aria-label="Component palette">
            {Object.entries(groupedPalette).map(([group, items]) => (
              <section key={group}>
                <p className="xui-playground-nav__group">{group}</p>
                <div className="xui-editor-palette__items">
                  {items.map((item) => (
                    <button
                      key={item.type}
                      draggable
                      type="button"
                      onClick={() => addNode(item.type)}
                      onDragStart={(event) => event.dataTransfer.setData('application/xui-component', item.type)}
                    >
                      <span>{item.label}</span>
                      <small>{item.type}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <section className="xui-editor-templates">
            <p className="xui-playground-nav__group">Templates</p>
            <div className="xui-editor-template-list">
              {templates.map((template) => (
                <button key={template.id} type="button" onClick={() => addTemplate(template)}>
                  <strong>{template.name}</strong>
                  <span>{template.summary}</span>
                </button>
              ))}
            </div>
          </section>

          {canvasTarget ? (
            <XuiThemeDesigner
              className="xui-editor-theme"
              initialTheme={theme}
              onThemeChange={setTheme}
              target={canvasTarget}
              themeGenerator={generateThemeWithModel}
            />
          ) : null}
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

        <section className="xui-editor-stage">
          <header className="xui-editor-toolbar">
            <div>
              <p className="xui-playground-eyebrow">Canvas</p>
              <h2>Application Screen</h2>
            </div>
            <XuiSpace>
              <div className="xui-editor-segmented" role="group" aria-label="Viewport">
                {(['desktop', 'tablet', 'mobile'] as EditorViewport[]).map((item) => (
                  <button key={item} className={viewport === item ? 'is-active' : ''} type="button" onClick={() => setViewport(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <select className="xui-editor-zoom" aria-label="Zoom" value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
              </select>
              <XuiButton variant="outline" size="sm" onClick={resetProject}>Reset</XuiButton>
              <XuiButton size="sm" onClick={() => addNode('button')}>Add Button</XuiButton>
            </XuiSpace>
          </header>

          <div className="xui-editor-canvas-viewport" data-viewport={viewport}>
            <div
              ref={(element) => {
                if (element && element !== canvasTarget) {
                  setCanvasTarget(element);
                }
              }}
              className="xui-editor-canvas-theme"
              style={{ '--xui-editor-zoom': zoom / 100 } as CSSProperties}
            >
            <section className="xui-editor-canvas" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              {nodes.length ? (
                nodes.map((node) => (
                  <article
                    key={node.id}
                    className={['xui-editor-node', selectedId === node.id ? 'is-selected' : undefined].filter(Boolean).join(' ')}
                    data-align={node.props.layoutAlign ?? 'stretch'}
                    data-width={node.props.layoutWidth ?? 'full'}
                    draggable
                    onClick={() => setSelectedId(node.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => event.dataTransfer.setData('application/xui-node', node.id)}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const draggedNodeId = event.dataTransfer.getData('application/xui-node');
                      const componentType = event.dataTransfer.getData('application/xui-component') as EditorComponentType;
                      const targetIndex = nodes.findIndex((entry) => entry.id === node.id);

                      if (draggedNodeId) {
                        moveNodeToIndex(draggedNodeId, targetIndex);
                        return;
                      }

                      if (componentType) {
                        addNode(componentType, targetIndex);
                      }
                    }}
                  >
                    <div className="xui-editor-node__meta">
                      <span>{palette.find((item) => item.type === node.type)?.label}</span>
                    </div>
                    {renderNode(node)}
                  </article>
                ))
              ) : (
                <div className="xui-editor-empty">Drop components here</div>
              )}
            </section>
            </div>
          </div>

          <section className="xui-editor-code">
            <div className="xui-editor-code__header">
              <p className="xui-playground-eyebrow">Generated JSX</p>
              <XuiButton variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(generatedJsx)}>Copy</XuiButton>
            </div>
            <pre><code>{generatedJsx}</code></pre>
          </section>
        </section>

        <Inspector node={selectedNode} onChange={updateNode} onDelete={deleteNode} onDuplicate={duplicateNode} onMove={moveNode} />
      </main>
  );
}
