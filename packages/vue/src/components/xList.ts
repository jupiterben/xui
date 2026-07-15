import { type PropType, defineComponent, h } from 'vue';

export type xListItem = {
  id: string;
  label: string;
  description?: string;
};

export const xList = defineComponent({
  name: 'xList',
  props: {
    items: { type: Array as PropType<xListItem[]>, required: true },
    ordered: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    return () =>
      h(
        props.ordered ? 'ol' : 'ul',
        { role: 'list' },
        props.items.map((item, index) =>
          h(
            'li',
            { key: item.id, role: 'listitem' },
            slots.item?.({ item, index }) ??
              slots.default?.({ item, index }) ?? [
                h('span', item.label),
                item.description ? h('span', item.description) : null
              ]
          )
        )
      );
  }
});
