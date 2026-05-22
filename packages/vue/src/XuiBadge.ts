import { type CSSProperties, type PropType, defineComponent, h } from 'vue';

type XuiBadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

function getDisplayCount(count: string | number | undefined, overflowCount: number) {
  if (typeof count === 'number' && count > overflowCount) {
    return `${overflowCount}+`;
  }

  return count;
}

export const XuiBadge = defineComponent({
  name: 'XuiBadge',
  props: {
    color: { type: String, default: undefined },
    count: { type: [Number, String] as PropType<number | string>, default: undefined },
    dot: { type: Boolean, default: false },
    overflowCount: { type: Number, default: 99 },
    showZero: { type: Boolean, default: false },
    status: { type: String as PropType<XuiBadgeStatus>, default: undefined },
    text: { type: String, default: undefined }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const customStyle = props.color ? ({ '--xui-badge-color': props.color } as CSSProperties) : undefined;

      if (props.status) {
        return h(
          'span',
          {
            ...attrs,
            class: ['xui-badge xui-badge-status', attrs.class],
            'data-status': props.status,
            style: {
              ...customStyle,
              ...(attrs.style as CSSProperties | undefined)
            }
          },
          [h('span', { class: 'xui-badge-status__dot' }), props.text || slots.text ? h('span', { class: 'xui-badge-status__text' }, slots.text?.() ?? props.text) : null]
        );
      }

      const isZero = props.count === 0;
      const shouldShowCount = props.dot || (props.count !== undefined && (!isZero || props.showZero));

      return h(
        'span',
        {
          ...attrs,
          class: ['xui-badge', attrs.class],
          style: {
            ...customStyle,
            ...(attrs.style as CSSProperties | undefined)
          }
        },
        [
          slots.default ? h('span', { class: 'xui-badge__child' }, slots.default()) : null,
          shouldShowCount ? h('sup', { class: 'xui-badge__count', 'data-dot': props.dot || undefined }, props.dot ? undefined : getDisplayCount(props.count, props.overflowCount)) : null,
          !slots.default && (props.text || slots.text) ? h('span', { class: 'xui-badge-status__text' }, slots.text?.() ?? props.text) : null
        ]
      );
    };
  }
});
