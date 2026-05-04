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

## 已包含示例

- `toggle` 逻辑（core）
- `useToggle`（Vue / React）
- `XuiSwitch`（Vue / React）
- `playgrounds/vue` Tailwind 演示页面
- `playgrounds/react` Tailwind 演示页面

> 展示页使用 Tailwind 对 headless 组件进行样式定制。
