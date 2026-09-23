# xui - Multi-framework Headless UI Library

`xui` 是一个 **Headless UI** 组件库脚手架，目标是让同一套交互逻辑可运行在多个前端框架中（如 Vue、React、Svelte 等）。

## 设计目标

- **Headless**：只提供状态与可访问性逻辑，不绑定样式。
- **跨框架**：核心逻辑放在 `@xui/core`，各框架通过适配层复用。
- **可扩展**：可继续添加 `@xui/solid` 等包。

## Monorepo 结构

```txt
playgrounds/
  vue/            # Vue Tailwind 演示页面（Vue + Vite）
  react/          # React Tailwind 演示页面（React + Vite）
  svelte/         # Svelte Tailwind 演示页面（Svelte 5 + Vite）
packages/
  core/           # 与框架无关的状态机/逻辑
  vue/            # Vue 适配层（composables + components）
  react/          # React 适配层（hooks + components）
  svelte/         # Svelte 5 适配层（stores + components）
```

## 快速开始

```bash
pnpm install
pnpm build
pnpm dev:vue
pnpm dev:react
pnpm dev:svelte
```

## AI 主题生成

`xThemeDesigner` 支持传入 `themeGenerator(prompt, options)`，playground 已内置一个 Vite dev middleware：

```bash
OPENAI_API_KEY=sk-... pnpm dev:playground:react
OPENAI_API_KEY=sk-... pnpm dev:playground:vue
```

可选环境变量：

- `XUI_THEME_API_KEY`：覆盖 `OPENAI_API_KEY`
- `XUI_THEME_MODEL`：默认 `gpt-5.4-mini`
- `XUI_THEME_API_BASE_URL`：默认 `https://api.openai.com/v1`，可指向 OpenAI 兼容服务

没有配置 key 或模型请求失败时，playground 会自动回退到本地提示词生成。
上传参考图片后，playground 会把图片作为 base64 data URL 传给 `/api/theme`；也可以在图片 URL 输入框或提示词输入框中直接粘贴 `https://...` 图片地址。
服务端会把图片转成模型的图片输入，URL 必须是模型服务可访问的公网地址。

## 已包含示例

- `toggle` 逻辑（core）
- `useToggle`（Vue / React / Svelte）
- `xSwitch` / `xButton`（Vue / React / Svelte）
- `xList` / `xFlex` / `xGrid`（Svelte）
- `xList` / `xFlex` / `xGrid` / `xTree`（Vue / React）
- `xThemeDesigner`（Vue / React）：支持预设、用户自定义主题变量和提示词生成主题
  - 颜色：背景、表面、文字、主色、辅色、边框、focus ring
  - 排版：字体、字号比例、行高、字重 token
  - 形态：圆角、间距密度、边框粗细、阴影强度、过渡 token
- `playgrounds/vue` Tailwind 演示页面
- `playgrounds/react` Tailwind 演示页面
- `playgrounds/svelte` Tailwind 演示页面

> 展示页使用 Tailwind 对 headless 组件进行样式定制。

## Tree 组件

React / Vue Tree 复用 `@xui/core`，支持展开折叠、单选 / 多选、
关联勾选与半选、受控状态、禁用 / 加载、键盘导航和自定义标签。
完整 API、行为边界和验收规则见 [Tree 功能契约](doc/Tree功能契约.md)。

```bash
pnpm test:tree
pnpm dev:react
```

React 独立示例位于开发服务的 `/tree.html`，Vue 示例在 playground 的 Tree 分类中。
异步加载、拖放、虚拟滚动和 Svelte Tree 尚未纳入本次实现。

## Svelte 包

`@xui/svelte` 面向 Svelte 5，当前提供 `useToggle`、`xSwitch`、
`xButton`、`xList`、`xFlex`、`xGrid`，尚未包含 Tree 或主题设计器。
在 workspace 消费项目的 dependencies 中添加 `"@xui/svelte": "workspace:*"`，
并安装 Svelte 5。

```bash
pnpm --filter @xui/svelte... build
pnpm --filter @xui/svelte typecheck
pnpm --filter @xui/svelte test
pnpm dev:svelte
pnpm build:playground:svelte
```

```svelte
<script lang="ts">
  import { xSwitch as Switch, xButton as Button, useToggle } from '@xui/svelte';

  let enabled = $state(false);
  const model = useToggle();
  const { checked } = model;
</script>

<Switch bind:checked={enabled} aria-label="Enable notifications" />
<Button onclick={model.toggle}>{$checked ? 'On' : 'Off'}</Button>
```

`useToggle` 返回 `checked`、`disabled`、`loading`、`interactive` 只读 store，
以及 `toggle`、`setDisabled`、`setLoading` 方法。
组件使用 snippets 自定义内容，透传原生 HTML 属性，不附带主题样式。

Svelte playground 默认运行在 `http://localhost:5175`，提供组件导航、
Button 变体与尺寸、Switch 双向绑定、List 排序、Flex / Grid 布局参数、
`useToggle` 状态演示和重置操作。修改 Svelte 包源码后可直接热更新。
