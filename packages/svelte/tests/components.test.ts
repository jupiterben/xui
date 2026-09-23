import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { xButton, xFlex, xGrid, xList, xSwitch } from '@xui/svelte';
import Fixture from './Fixture.svelte';

const instances: ReturnType<typeof mount>[] = [];

afterEach(async () => {
  for (const instance of instances.splice(0)) await unmount(instance);
  document.body.replaceChildren();
});

function button(selector = 'button') {
  const element = document.querySelector<HTMLButtonElement>(selector);
  if (!element) throw new Error(`Missing button: ${selector}`);
  return element;
}

function clickLabel(label: string) {
  const element = Array.from(document.querySelectorAll('button'))
    .find((item) => item.textContent?.trim() === label);
  if (!element) throw new Error(`Missing button: ${label}`);
  element.click();
  flushSync();
}

describe('packaged components', () => {
  it('toggles a switch and forwards native attributes and callbacks', () => {
    const onchange = vi.fn();
    const onclick = vi.fn();
    instances.push(mount(xSwitch, {
      target: document.body,
      props: { defaultChecked: true, onchange, onclick, 'aria-label': 'Notifications', class: 'switch' }
    }));
    flushSync();
    expect(button().type).toBe('button');
    expect(button().getAttribute('role')).toBe('switch');
    expect(button().getAttribute('aria-checked')).toBe('true');
    expect(button().getAttribute('aria-label')).toBe('Notifications');
    expect(button().className).toBe('switch');
    button().click();
    flushSync();
    expect(button().getAttribute('aria-checked')).toBe('false');
    expect(onclick).toHaveBeenCalledOnce();
    expect(onchange).toHaveBeenCalledWith(false);
  });

  it.each([{ disabled: true }, { loading: true }])('blocks switch interaction with %o', (props) => {
    const onchange = vi.fn();
    instances.push(mount(xSwitch, { target: document.body, props: { ...props, onchange } }));
    flushSync();
    expect(button().disabled).toBe(true);
    button().click();
    flushSync();
    expect(button().getAttribute('aria-checked')).toBe('false');
    expect(onchange).not.toHaveBeenCalled();
    if ('loading' in props) expect(button().getAttribute('aria-busy')).toBe('true');
  });

  it('allows a click handler to cancel toggling', () => {
    instances.push(mount(xSwitch, {
      target: document.body,
      props: { onclick: (event) => event.preventDefault() }
    }));
    flushSync();
    button().click();
    flushSync();
    expect(button().getAttribute('aria-checked')).toBe('false');
  });

  it('renders button variants and forwards native events', () => {
    const onclick = vi.fn();
    instances.push(mount(xButton, {
      target: document.body,
      props: { variant: 'outline', size: 'sm', class: 'custom', type: 'submit', onclick }
    }));
    flushSync();
    expect(button().type).toBe('submit');
    expect(button().classList.contains('xui-button')).toBe(true);
    expect(button().classList.contains('custom')).toBe(true);
    expect(button().dataset.variant).toBe('outline');
    expect(button().dataset.size).toBe('sm');
    button().click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it('accepts null native disabled attributes', () => {
    instances.push(mount(xSwitch, { target: document.body, props: { disabled: null } }));
    instances.push(mount(xButton, { target: document.body, props: { disabled: null } }));
    flushSync();
    expect(Array.from(document.querySelectorAll('button')).every((item) => !item.disabled)).toBe(true);
    button('[role="switch"]').click();
    flushSync();
    expect(button('[role="switch"]').getAttribute('aria-checked')).toBe('true');
  });

  it.each([{ disabled: true }, { loading: true }])('blocks button interaction with %o', (props) => {
    const onclick = vi.fn();
    instances.push(mount(xButton, { target: document.body, props: { ...props, onclick } }));
    flushSync();
    expect(button().disabled).toBe(true);
    button().click();
    expect(onclick).not.toHaveBeenCalled();
    if ('loading' in props) {
      expect(button().getAttribute('aria-busy')).toBe('true');
      expect(button().dataset.loading).toBe('true');
    }
  });

  it('supports two-way binding, reactive props, and snippets from a consumer', () => {
    instances.push(mount(Fixture, { target: document.body }));
    flushSync();
    const toggle = button('[role="switch"]');
    toggle.click();
    flushSync();
    expect(document.querySelector('output')?.textContent).toBe('true');
    expect(toggle.textContent?.trim()).toBe('Enabled');
    clickLabel('Set checked');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    clickLabel('Set loading');
    expect(toggle.disabled).toBe(true);
    toggle.click();
    flushSync();
    expect(document.querySelector('output')?.textContent).toBe('false');
    clickLabel('Set loading');
    expect(toggle.disabled).toBe(false);

    expect(document.querySelector('ol li strong')?.textContent).toBe('0: Alpha');
    clickLabel('Reverse');
    expect(document.querySelector('ol li strong')?.textContent).toBe('0: Beta');
    const flex = document.querySelector<HTMLDivElement>('.layout')!;
    expect(flex.style.display).toBe('flex');
    expect(flex.style.flexDirection).toBe('column');
    expect(flex.style.flexWrap).toBe('wrap');
    expect(flex.style.gap).toBe('8px');
    expect(flex.style.color).toBe('red');
    expect(flex.textContent).toContain('Flex content');
    const grid = flex.nextElementSibling as HTMLDivElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(120px, 1fr))');
    expect(grid.style.gap).toBe('1rem');
    expect(grid.textContent).toContain('Grid content');
  });

  it('renders default list items with optional descriptions', () => {
    instances.push(mount(xList, {
      target: document.body,
      props: { items: [{ id: 'a', label: 'Alpha', description: 'First' }, { id: 'b', label: 'Beta' }] }
    }));
    flushSync();
    expect(document.querySelectorAll('ul li')).toHaveLength(2);
    expect(document.querySelector('li')?.textContent).toContain('First');
  });

  it('renders an empty list', () => {
    instances.push(mount(xList, { target: document.body, props: { items: [] } }));
    flushSync();
    expect(document.querySelector('ul')).not.toBeNull();
    expect(document.querySelectorAll('li')).toHaveLength(0);
  });

  it('applies layout defaults', () => {
    instances.push(mount(xFlex, { target: document.body }));
    instances.push(mount(xGrid, { target: document.body }));
    flushSync();
    const [flex, grid] = document.querySelectorAll('div');
    expect(flex.style.flexDirection).toBe('row');
    expect(flex.style.flexWrap).toBe('nowrap');
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
  });

  it('supports explicit grid tracks and numeric gaps', () => {
    instances.push(mount(xGrid, {
      target: document.body,
      props: { columns: '100px 1fr', gap: 12 }
    }));
    flushSync();
    const grid = document.querySelector('div')!;
    expect(grid.style.gridTemplateColumns).toBe('100px 1fr');
    expect(grid.style.gap).toBe('12px');
  });
});
