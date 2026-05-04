import { type PropType, defineComponent, h } from 'vue';

export type XuiListItem = {
  id: string;
  label: string;
  description?: string;
};

export const XuiList = defineComponent({
  name: 'XuiList',
  props: {
    items: { type: Array as PropType<XuiListItem[]>, required: true },
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
