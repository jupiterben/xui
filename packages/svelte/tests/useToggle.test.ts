import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { useToggle } from '@xui/svelte';

describe('useToggle', () => {
  it('exposes reactive, read-only state and toggles independently', () => {
    const model = useToggle(true);
    const other = useToggle();
    const values: boolean[] = [];
    const unsubscribe = model.checked.subscribe((value) => values.push(value));

    expect(get(model.checked)).toBe(true);
    expect(get(model.disabled)).toBe(false);
    expect(get(model.loading)).toBe(false);
    expect(get(model.interactive)).toBe(true);
    expect(model.checked).not.toHaveProperty('set');
    model.toggle();
    model.toggle();
    unsubscribe();

    expect(values).toEqual([true, false, true]);
    expect(get(other.checked)).toBe(false);
  });

  it('blocks toggles while disabled or loading, then resumes', () => {
    const model = useToggle();
    model.setDisabled(true);
    model.toggle();
    expect(get(model.disabled)).toBe(true);
    expect(get(model.interactive)).toBe(false);
    expect(get(model.checked)).toBe(false);

    model.setLoading(true);
    model.setDisabled(false);
    model.toggle();
    expect(get(model.loading)).toBe(true);
    expect(get(model.interactive)).toBe(false);
    expect(get(model.checked)).toBe(false);

    model.setLoading(false);
    model.toggle();
    expect(get(model.interactive)).toBe(true);
    expect(get(model.checked)).toBe(true);
  });
});
