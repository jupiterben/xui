# Tree 功能契约

版本：v1。更新日期：2026-09-16。

适用实现：`@xui/core`、`@xui/react` 的 `xTree` / `x.Tree`、`@xui/vue` 的 `xTree`。
本文是本次实现的验收依据，不表示未实现能力已经承诺。Svelte Tree 不在本次范围内。

## 1. 目标与边界

Tree 展示有序层级数据，支持展开 / 折叠、独立的节点选择与复选勾选、
父子关联和半选、受控 / 非受控状态、禁用 / 加载、键盘导航、文字定位和自定义标签。

- core 负责数据索引、状态归一化、纯状态迁移和键盘动作计算，不依赖 DOM 或框架。
- React / Vue 负责状态绑定、DOM、焦点、事件和渲染扩展。
- 组件不绑定主题、图标库、行高、缩进、动画或固定 CSS。
- 当前不包含：懒加载 API、节点级 loading、搜索过滤、拖放、编辑、虚拟滚动、
  Shift 连续范围选择、Ctrl+A、星号批量展开、RTL 方向键反转、TreeSelect、TreeGrid。
- `loading` 是整体交互锁定，不会发请求；异步数据由业务请求后替换 `nodes`。

## 2. 数据契约

```ts
type TreeNode<Label = string> = {
  id: string;
  label: Label;
  textValue?: string;
  children?: TreeNode<Label>[];
  disabled?: boolean;
  selectable?: boolean;
};
```

| 字段 | 规则 |
| --- | --- |
| `id` | 整棵树内唯一、非空且不能全为空白的字符串。禁止重复、循环引用；无效数据同步抛错，不静默覆盖。 |
| `label` | React 为 ReactNode；Vue 数据字段为 string，可通过 slot 渲染富内容。 |
| `textValue` | 文字定位和辅助按钮名称所用纯文本；缺省使用 string / number 标签。React 非文本标签应提供。 |
| `children` | 顺序即显示顺序；缺省或空数组是叶子，没有展开按钮及 `aria-expanded`。 |
| `disabled` | 缺省 false；向整棵子树继承，禁止展开、选择、勾选，跳过键盘焦点导航。 |
| `selectable` | 缺省 true；false 只禁止该节点选择，不影响展开、勾选、聚焦和子节点选择。 |

数据、节点和状态数组不会被 core 原地修改。调用方不得修改回调收到的数组或节点对象。
React 更新节点时须替换 `nodes` 引用；不支持原地修改后依赖相同引用触发更新。
ID 是业务标识，不直接作为 DOM ID，包含空格、斜杠等字符时仍可使用。

## 3. 公共属性

| 属性 | 类型 | 默认值 / 含义 |
| --- | --- | --- |
| `nodes` | `TreeNode[]` | 必填，可以为 `[]`。 |
| `expandedIds` | `readonly string[]` | undefined；展开受控值。 |
| `defaultExpandedIds` | `string[]` | undefined；非受控初始展开集合，优先于 defaultExpandAll，包括显式 `[]`。 |
| `defaultExpandAll` | `boolean` | true；保留旧版静态 Tree 初始全部展示的行为。只在初始化时读取。 |
| `selectedIds` | `readonly string[]` | undefined；选择受控值。 |
| `defaultSelectedIds` | `string[]` | `[]`；初始选择。 |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | single。 |
| `checkedIds` | `readonly string[]` | undefined；勾选受控值。 |
| `defaultCheckedIds` | `string[]` | `[]`；初始勾选。 |
| `checkable` | `boolean` | false；是否显示复选框并接受勾选操作。 |
| `checkStrictly` | `boolean` | false；true 时父子勾选互不关联。 |
| `disabled` | `boolean` | false；整树禁止交互。 |
| `loading` | `boolean` | false；整树禁止交互并设置 `aria-busy`。 |

原生根节点属性（如 `id`、`style`、React `className` / Vue `class`、
`aria-label`、`aria-labelledby`）透传。内部维护的 `role`、`tabIndex`、
`aria-busy`、`aria-disabled`、`aria-multiselectable` 和 `data-part` 不允许通过透传覆盖。
调用方必须为树提供 `aria-label` 或 `aria-labelledby`。

### 3.1 受控规则

展开、选择、勾选三个维度分别受控，互不依赖。

1. 对应属性不为 undefined 即受控，`[]` 也是受控值。
2. 用户动作只报告建议的新值，不偷偷改变受控展示；父组件回传后才更新。
3. Vue 的 `v-model:expandedIds`、`v-model:selectedIds`、`v-model:checkedIds` 使用同样规则。
4. 非受控模式更新内部状态，并发送同样的 change 事件。
5. `default*` 只读取一次，之后改动默认值不重置状态。需要重置时使用受控值或重新挂载。
6. 外部属性变化和数据归一化不触发 change 事件，避免反馈循环。
7. 生命周期中不要切换同一维度的受控 / 非受控模式；不承诺自动迁移本地状态。

### 3.2 集合归一化

- 未知 ID 忽略，重复 ID 去重，叶子 ID 不进入展开集合。
- 单选只取输入中首个存在且 selectable 不为 false 的 ID；none 模式展示空选择。
- 显式传入的禁用节点选择 / 勾选可以展示，但用户不能更改。
- 关联勾选模式将父节点输入展开为可操作后代，并按子节点状态推导父节点与半选。
- 勾选和半选回调按树的先序顺序输出；展开和选择保留集合原顺序，新增 ID 追加。
- 删除节点后不渲染其状态，也不发送清理事件。不主动清理调用方数组或隐藏的本地原始值；
  同 ID 节点重新加入时，尚未被后续操作替换的值可能再次生效。业务若要彻底清除应更新受控集合。
- 新增节点不会因 `defaultExpandAll` 再次自动展开；关联模式下，已勾选父节点的新可用子节点会继承勾选。

## 4. 交互规则

### 4.1 展开

- 仅分支可展开。点击展开按钮不触发节点选择或勾选。
- 折叠时卸载后代 DOM，不删除后代的展开、选择和勾选状态。
- 再展开时恢复仍有效的后代状态。
- 标签单击只处理选择，不隐式展开；不规定双击展开。

### 4.2 选择

- 焦点、选择、勾选是三个独立概念，移动焦点不会自动选择。
- single：点击 / Enter / 无复选框时 Space 选中当前节点；重复选择不取消，也不发送重复事件。
- multiple：上述操作切换当前节点，不需要 Ctrl / Meta，不清除其他选择。
- none：不发送选择事件，不设置节点 `aria-selected`。
- 点击内嵌原生按钮、输入、链接、select、textarea 或可编辑内容，不触发所在行选择。

### 4.3 勾选与半选

- 点击复选框或 checkable 模式下 Space，仅更改勾选，不更改选择或展开。
- 默认关联模式下，勾选 / 取消父节点作用于其所有可操作后代，包括当前折叠的后代。
- 所有可操作直接子节点全选，父节点全选；部分选中或存在半选子节点，父节点半选。
- 半选是派生状态，不能独立传入；`aria-checked="mixed"` 与原生 input.indeterminate 同步。
- 点击半选父节点执行全选；取消任一叶子必须清除过期的全选祖先，不能被旧父状态再次勾回。
- disabled 子树是传导边界：不被批量操作修改，也不参与可用父节点的全选 / 半选计算。
- 若分支的所有子节点均禁用，该分支按自身勾选值处理。
- checkStrictly=true：仅切换当前节点，halfCheckedIds 始终为空。
- checkable=false：不显示复选框，不响应勾选操作，但不清空传入的勾选状态。

### 4.4 禁用与加载

disabled 或 loading 为 true 时，禁止树内的内置状态迁移、键盘导航和变化回调。
内置展开按钮、复选框设置原生 disabled；树项设置 aria-disabled。
所有内置元素退出 Tab 顺序。状态仍保留并展示。

节点级 disabled 向后代继承；整体 loading 不表示节点已加载，也不自动显示 spinner。
自定义标签中额外放置的按钮或表单控件由调用方管理 disabled、tabIndex 和业务行为，
不会由 Tree 自动递归改写。

## 5. 键盘与焦点

| 按键 | 行为 |
| --- | --- |
| Tab / Shift+Tab | 进入 / 离开树，不拦截；正常状态下只保留一个内置 Tab 入口。 |
| ArrowDown / ArrowUp | 下一 / 上一可见且可用节点；边界不循环。 |
| ArrowRight | 闭合分支展开并留在原节点；已展开分支进入第一个可用子节点；叶子无动作。 |
| ArrowLeft | 已展开分支折叠；否则移到父节点；根节点无动作。 |
| Home / End | 第一个 / 最后一个可见且可用节点。 |
| Enter | 按 selectionMode 选择当前节点。 |
| Space | checkable 时切换勾选；否则按 selectionMode 选择。 |
| 可打印单字符 | 不区分大小写的前缀定位，循环搜索可见可用节点。500ms 内连续输入累积；重复同一字符循环匹配。 |

- Ctrl / Meta / Alt 组合键、输入法组合事件、内嵌控件自己的键盘事件不执行树快捷操作。
- 消费方根节点键盘处理器先运行，`preventDefault()` 可取消 Tree 内置操作。
- 初次 Tab 进入：优先可见且可用的已选节点，否则首个可见可用节点。
- 后续使用 roving tabindex 记住焦点；折叠导致当前节点隐藏时，回到最近可见祖先。
- 当前节点删除时，回到可见已选节点或首个可用节点；树为空或全部节点不可用时，
  整体未禁用 / 未加载的根节点是 Tab 入口。
- 仅当焦点原本在树内时恢复实际 DOM 焦点；树外已有焦点时不得抢焦点。
- 当前只覆盖 LTR 和基本字符前缀，不做拼音、模糊匹配或输入法搜索。

## 6. 事件契约

React：

```ts
onExpandedChange(ids, { node, expanded })
onSelectedChange(ids, { node, selected })
onCheckedChange(ids, { node, checked, halfCheckedIds })
```

Vue：

```text
update:expandedIds(ids) -> expandedChange(ids, detail)
update:selectedIds(ids) -> selectedChange(ids, detail)
update:checkedIds(ids)  -> checkedChange(ids, detail)
```

每次有效用户动作仅发送当前维度的一次 change；Vue 另发送一次对应 update 事件。
`node` 是动作目标原节点，布尔值表示建议结果；勾选回调包含归一化后的完整集合与半选集合。
无效 ID、叶子展开、禁用动作、禁止选择的节点、重复单选，不发送变化事件。
Vue 模板监听示例为 `@checked-change`；JS render 监听为 `onCheckedChange`。

## 7. DOM 与 Headless 扩展

DOM 骨架：

```text
ul[role=tree][data-part=tree]
  li[role=treeitem][data-part=item]
    div[data-part=row]
      button[data-part=switcher]   // 分支
      input[data-part=checkbox]   // checkable
      span[data-part=label]
    ul[role=group][data-part=group] // 已展开分支
```

树项包含 `aria-level`（从 1 开始）、`aria-posinset`、`aria-setsize`。
禁用项仍计入同级位置和总数。叶子不带 aria-expanded。
选择与勾选同时启用时分别由 aria-selected 和 aria-checked 表示。
React 树项通过独立标签 ID 的 aria-labelledby 命名；Vue 由 textValue / label 的 aria-label 命名。
自定义 Vue 标签若改变节点含义，须同步 textValue。
默认辅助按钮名称为英文 `Expand <text>` / `Collapse <text>`，暂未提供内置国际化接口。

节点暴露 `data-node-id`、`data-expanded`、`data-selected`、`data-checked`
（true / false / mixed）、`data-disabled`。布尔数据属性通过字符串值选择，
例如 `[data-selected="true"]`，不要用 `[data-selected]` 判断选中。

| 扩展 | React | Vue |
| --- | --- | --- |
| 标签 | `renderLabel(state)` | 默认作用域 slot |
| 展开图形 | `renderSwitcher(state)` | `#switcher="state"` |
| 空内容 | `empty` | `#empty` |

state 包含 node、parentId、depth（从 0 开始）、index（从 0 开始）、size、branch、text、
disabled、expanded、selected、checked、halfChecked、focused，
以及 toggleExpanded / toggleSelected / toggleChecked。
这些动作遵守与内置控件相同的禁用和受控规则。
switcher 只替换按钮内的装饰性内容，不应再嵌套按钮。
空内容使用 `li[role=none][data-part=empty]`，不伪装为可选择节点。

旧 `nodes`、React `renderLabel({ node, depth })`、Vue 默认 slot 保持可用；
新增行、标签包装与按钮属于 DOM 变化，消费者依赖旧直接子选择器时需要调整。

## 8. 使用示例

React：

```tsx
import { useState } from 'react';
import { x } from '@xui/react';

const nodes = [{
  id: 'src', label: 'src',
  children: [{ id: 'main', label: 'main.ts' }]
}];

function Files() {
  const [expanded, setExpanded] = useState<string[]>(['src']);
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <x.Tree
      aria-label="项目文件"
      nodes={nodes}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      checkable
      checkedIds={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

Vue：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { xTree } from '@xui/vue';

const expanded = ref(['src']);
const checked = ref<string[]>([]);
const nodes = [{
  id: 'src', label: 'src',
  children: [{ id: 'main', label: 'main.ts' }]
}];
</script>

<template>
  <xTree
    aria-label="项目文件"
    :nodes="nodes"
    v-model:expandedIds="expanded"
    v-model:checkedIds="checked"
    checkable
  >
    <template #default="{ node }">{{ node.label }}</template>
    <template #empty>暂无文件</template>
  </xTree>
</template>
```

## 9. 验收与限制

执行 `pnpm test:tree`；测试位于 `tests/tree-core.test.ts`、
`tests/tree-adapters.test.tsx` 和 `tests/tree-ssr.test.tsx`。
执行 `pnpm typecheck` 与 `pnpm build` 检查跨包类型和发布构建。

必须验证：

- [x] ID 校验、层级索引、集合去重、未知节点、输入不被修改。
- [x] 默认值仅初始化，显式空数组优先，受控拒绝更新时不改变展示。
- [x] 单选 / 多选 / none、禁止选择、事件不向父节点误触发。
- [x] 父子关联、半选、半选转全选、禁用传导边界、严格勾选。
- [x] 整体 disabled / loading 与节点禁用阻断动作。
- [x] 可见节点键盘导航、文字定位、焦点与选择分离。
- [x] 外部折叠、删除、空树焦点恢复；移出树后不抢焦点。
- [x] 根属性、叶子 ARIA、单一 Tab 入口、键盘 preventDefault。
- [x] 无 DOM 环境的服务端渲染、React 多实例标签 ID 唯一、Vue 标签与空态 slot。

核心每次建模使用 O(n) 时间和空间，渲染量等于当前展开的节点量；
仍使用递归访问 / 渲染，不承诺无限深度或万级节点性能，生产大树应先实测。
自动化 DOM 测试不能替代真实屏幕阅读器测试；本次不宣称通过完整辅助技术兼容性认证。
