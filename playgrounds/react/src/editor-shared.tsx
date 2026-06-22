import { x } from '@xui/react';
import type { xThemeInput } from '@xui/core';

export type EditorComponentType = 'button' | 'title' | 'paragraph' | 'alert' | 'tag' | 'badge' | 'switch' | 'divider' | 'space';

export type EditorNode = {
  id: string;
  type: EditorComponentType;
  props: Record<string, string | boolean | number>;
};

export type EditorProject = {
  name: string;
  nodes: EditorNode[];
  theme: xThemeInput;
  resolutionId?: string;
};

export type CanvasResolutionPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: 'Desktop' | 'Tablet' | 'Mobile';
};

export const canvasResolutionPresets: CanvasResolutionPreset[] = [
  { id: 'desktop-fhd', label: 'Desktop FHD', width: 1920, height: 1080, group: 'Desktop' },
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900, group: 'Desktop' },
  { id: 'laptop', label: 'Laptop', width: 1280, height: 800, group: 'Desktop' },
  { id: 'tablet-portrait', label: 'iPad Portrait', width: 768, height: 1024, group: 'Tablet' },
  { id: 'tablet-landscape', label: 'iPad Landscape', width: 1024, height: 768, group: 'Tablet' },
  { id: 'mobile', label: 'iPhone 14', width: 390, height: 844, group: 'Mobile' },
  { id: 'mobile-se', label: 'iPhone SE', width: 375, height: 667, group: 'Mobile' },
  { id: 'android', label: 'Android', width: 360, height: 800, group: 'Mobile' }
];

export const defaultCanvasResolutionId = canvasResolutionPresets[1].id;

export function getCanvasResolution(resolutionId = defaultCanvasResolutionId) {
  return canvasResolutionPresets.find((preset) => preset.id === resolutionId) ?? canvasResolutionPresets[1];
}

export type PaletteItem = {
  type: EditorComponentType;
  label: string;
  group: string;
  defaults: EditorNode['props'];
};

export type CanvasHostMessage = {
  type: 'SYNC';
  nodes: EditorNode[];
  theme: xThemeInput;
  selectedId?: string;
  resolutionId: string;
  zoom: number;
};

export type CanvasClientMessage =
  | { type: 'READY' }
  | { type: 'SELECT'; id: string }
  | { type: 'ADD_COMPONENT'; componentType: EditorComponentType; index: number }
  | { type: 'MOVE_NODE'; id: string; index: number };

export const palette: PaletteItem[] = [
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

export function renderNode(node: EditorNode) {
  const p = node.props;

  if (node.type === 'button') {
    return <x.Button disabled={Boolean(p.disabled)} variant={String(p.variant) as 'primary'} size={String(p.size) as 'md'}>{String(p.text)}</x.Button>;
  }

  if (node.type === 'title') {
    return <x.TypographyTitle level={Number(p.level) as 1 | 2 | 3 | 4 | 5}>{String(p.text)}</x.TypographyTitle>;
  }

  if (node.type === 'paragraph') {
    return <x.TypographyParagraph ellipsis={Boolean(p.ellipsis)}>{String(p.text)}</x.TypographyParagraph>;
  }

  if (node.type === 'alert') {
    return <x.Alert closable={Boolean(p.closable)} type={String(p.type) as 'success'} message={String(p.message)} description={String(p.description)} showIcon={Boolean(p.showIcon)} />;
  }

  if (node.type === 'tag') {
    return <x.Tag closable={Boolean(p.closable)} color={String(p.color)}>{String(p.text)}</x.Tag>;
  }

  if (node.type === 'badge') {
    return <x.Badge count={Number(p.count) || 0} dot={Boolean(p.dot)} text={String(p.text)} />;
  }

  if (node.type === 'switch') {
    return (
      <x.Space align="center" size="middle">
        <x.Switch defaultChecked={Boolean(p.checked)}>{({ checked }) => <span className={`xui-switch-demo ${checked ? 'xui-switch-demo--checked' : ''}`}>{checked ? 'ON' : 'OFF'}</span>}</x.Switch>
        <x.TypographyText type="secondary">{String(p.text)}</x.TypographyText>
      </x.Space>
    );
  }

  if (node.type === 'divider') {
    return <x.Divider orientation={String(p.orientation) as 'left'}>{String(p.text)}</x.Divider>;
  }

  return (
    <x.Space direction={String(p.direction) as 'horizontal'} size={String(p.size) as 'middle'} wrap>
      <x.Button>Action</x.Button>
      <x.Tag>Tag</x.Tag>
      <x.Badge count={3}><span className="xui-demo-avatar">A</span></x.Badge>
    </x.Space>
  );
}

export function getNodeLabel(node: EditorNode) {
  const item = palette.find((entry) => entry.type === node.type);
  const label = item?.label ?? node.type;
  const text = node.type === 'alert' ? node.props.message : node.props.text;
  return {
    group: item?.group ?? 'Component',
    label,
    detail: typeof text === 'string' && text.trim() ? text : node.id
  };
}

export function isCanvasHostMessage(value: unknown): value is CanvasHostMessage {
  return typeof value === 'object' && value !== null && (value as CanvasHostMessage).type === 'SYNC';
}

export function isCanvasClientMessage(value: unknown): value is CanvasClientMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  const type = (value as { type: string }).type;
  return type === 'READY' || type === 'SELECT' || type === 'ADD_COMPONENT' || type === 'MOVE_NODE';
}

export function postCanvasMessage(target: Window, message: CanvasHostMessage | CanvasClientMessage) {
  target.postMessage(message, window.location.origin);
}
