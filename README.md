# xui - Multi-framework Headless UI Library

`xui` 是一个 **Headless UI** 组件库脚手架，目标是让同一套交互逻辑可运行在多个前端框架中（如 Vue、React 等）。

## 设计目标

- **Headless**：只提供状态与可访问性逻辑，不绑定样式。
- **跨框架**：核心逻辑放在 `@xui/core`，各框架通过适配层复用。
- **可扩展**：可继续添加 `@xui/solid`、`@xui/svelte` 等包。

## Monorepo 结构

```txt
playgrounds/
  vue/            # Vue Tailwind 演示页面（Vue + Vite）
  react/          # React Tailwind 演示页面（React + Vite）
packages/
  core/           # 与框架无关的状态机/逻辑
  vue/            # Vue 适配层（composables + 组件）
  react/          # React 适配层（hooks + 组件）
```

## 快速开始

```bash
pnpm install
pnpm build
pnpm dev:playground:vue
pnpm dev:playground:react
```

## AI 主题生成

`XuiThemeDesigner` 支持传入 `themeGenerator(prompt, options)`，playground 已内置一个 Vite dev middleware：

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
- `useToggle`（Vue / React）
- `XuiSwitch`（Vue / React）
- `XuiList` / `XuiFlex` / `XuiGrid` / `XuiTree`（Vue / React）
- `XuiThemeDesigner`（Vue / React）：支持预设、用户自定义主题变量和提示词生成主题
  - 颜色：背景、表面、文字、主色、辅色、边框、focus ring
  - 排版：字体、字号比例、行高、字重 token
  - 形态：圆角、间距密度、边框粗细、阴影强度、过渡 token
- `playgrounds/vue` Tailwind 演示页面
- `playgrounds/react` Tailwind 演示页面

> 展示页使用 Tailwind 对 headless 组件进行样式定制。
