import { useEffect, useMemo, useRef, useState } from 'react';
import type { xThemeInput } from '@xui/core';
import {
  type CanvasHostMessage,
  type EditorComponentType,
  type EditorNode,
  getCanvasResolution,
  isCanvasClientMessage,
  postCanvasMessage
} from './editor-shared';
import { s } from './studio-ui';

type CanvasFrameProps = {
  nodes: EditorNode[];
  theme: xThemeInput;
  selectedId?: string;
  resolutionId: string;
  zoom: number;
  onSelect: (id: string) => void;
  onAddComponent: (type: EditorComponentType, index: number) => void;
  onMoveNodeToIndex: (id: string, index: number) => void;
};

export function CanvasFrame({
  nodes,
  theme,
  selectedId,
  resolutionId,
  zoom,
  onSelect,
  onAddComponent,
  onMoveNodeToIndex
}: CanvasFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const resolution = useMemo(() => getCanvasResolution(resolutionId), [resolutionId]);
  const scale = zoom / 100;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow || !isCanvasClientMessage(event.data)) {
        return;
      }

      switch (event.data.type) {
        case 'READY':
          setReady(true);
          break;
        case 'SELECT':
          onSelect(event.data.id);
          break;
        case 'ADD_COMPONENT':
          onAddComponent(event.data.componentType, event.data.index);
          break;
        case 'MOVE_NODE':
          onMoveNodeToIndex(event.data.id, event.data.index);
          break;
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onAddComponent, onMoveNodeToIndex, onSelect]);

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) {
      return;
    }

    const payload: CanvasHostMessage = {
      type: 'SYNC',
      nodes,
      theme,
      selectedId,
      resolutionId,
      zoom
    };
    postCanvasMessage(iframeRef.current.contentWindow, payload);
  }, [nodes, ready, resolutionId, selectedId, theme, zoom]);

  return (
    <div
      className={s.frameShell}
      style={{
        width: Math.round(resolution.width * scale),
        height: Math.round(resolution.height * scale)
      }}
    >
      <iframe
        ref={iframeRef}
        className={s.frame}
        src="/canvas-preview.html"
        title={`Canvas preview ${resolution.width}×${resolution.height}`}
        style={{
          width: resolution.width,
          height: resolution.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      />
    </div>
  );
}
