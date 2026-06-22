import { type CSSProperties, StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { x } from '@xui/react';
import type { xThemeInput } from '@xui/core';
import { defaultThemePresets } from '@xui/core';
import {
  type CanvasClientMessage,
  type EditorComponentType,
  type EditorNode,
  defaultCanvasResolutionId,
  getCanvasResolution,
  isCanvasHostMessage,
  palette,
  postCanvasMessage,
  renderNode
} from './editor-shared';
import { s } from './studio-ui';
import './style.css';

function CanvasPreviewApp() {
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [theme, setTheme] = useState<xThemeInput>(defaultThemePresets[0]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [resolutionId, setResolutionId] = useState(defaultCanvasResolutionId);

  useEffect(() => {
    postCanvasMessage(window.parent, { type: 'READY' });

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isCanvasHostMessage(event.data)) {
        return;
      }

      setNodes(event.data.nodes);
      setTheme(event.data.theme);
      setSelectedId(event.data.selectedId);
      setResolutionId(event.data.resolutionId);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const resolution = useMemo(() => getCanvasResolution(resolutionId), [resolutionId]);

  const emit = (message: CanvasClientMessage) => {
    postCanvasMessage(window.parent, message);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>, index = nodes.length) => {
    event.preventDefault();
    const draggedNodeId = event.dataTransfer.getData('application/xui-node');
    const componentType = event.dataTransfer.getData('application/xui-component') as EditorComponentType;

    if (draggedNodeId) {
      emit({ type: 'MOVE_NODE', id: draggedNodeId, index });
      return;
    }

    if (componentType) {
      emit({ type: 'ADD_COMPONENT', componentType, index });
    }
  };

  return (
    <x.ConfigProvider theme={theme} className={s.canvasRoot}>
      <div className={s.canvasViewport}>
        <div
          className={s.canvasTheme}
          data-resolution={resolution.id}
          style={{
            width: resolution.width,
            height: resolution.height
          } as CSSProperties}
        >
          <section
            className={s.canvas}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event)}
          >
            {nodes.length ? (
              nodes.map((node, index) => (
                <article
                  key={node.id}
                  className={s.canvasNode(selectedId === node.id)}
                  data-align={node.props.layoutAlign ?? 'stretch'}
                  data-width={node.props.layoutWidth ?? 'full'}
                  draggable
                  onClick={() => emit({ type: 'SELECT', id: node.id })}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={(event) => event.dataTransfer.setData('application/xui-node', node.id)}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleDrop(event, index);
                  }}
                >
                  <div className={s.canvasNodeMeta}>
                    <span>{palette.find((item) => item.type === node.type)?.label}</span>
                  </div>
                  {renderNode(node)}
                </article>
              ))
            ) : (
              <div className={s.canvasEmpty}>Drop components here</div>
            )}
          </section>
        </div>
      </div>
    </x.ConfigProvider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <CanvasPreviewApp />
  </StrictMode>
);
