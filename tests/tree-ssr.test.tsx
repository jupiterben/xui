// @vitest-environment node
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString as renderVue } from 'vue/server-renderer';
import { expect, it } from 'vitest';
import { xTree as ReactTree } from '../packages/react/src/components/xTree';
import { xTree as VueTree } from '../packages/vue/src/components/xTree';

const nodes = [{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }];

it('React renders on the server with unique labels across tree instances', () => {
  const html = renderToString(<><ReactTree nodes={nodes} /><ReactTree nodes={nodes} /></>);
  expect(html).toContain('role="tree"');
  const ids = [...html.matchAll(/<span id="([^"]+)"/g)].map((match) => match[1]);
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(4);
});

it('Vue renders slots and initial state without DOM globals', async () => {
  const html = await renderVue(createSSRApp({
    render: () => h(VueTree, { nodes, checkable: true, defaultCheckedIds: ['child'] }, {
      default: ({ node, depth }: { node: { label: string }; depth: number }) => `${depth}: ${node.label}`
    })
  }));
  expect(html).toContain('role="tree"');
  expect(html).toContain('aria-checked="true"');
  expect(html).toContain('1: Child');
});

it('Vue empty slot does not create a fake treeitem', async () => {
  const html = await renderVue(createSSRApp({
    render: () => h(VueTree, { nodes: [] }, { empty: () => 'No files' })
  }));
  expect(html).toContain('No files');
  expect(html).not.toContain('role="treeitem"');
});
