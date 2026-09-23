# 常用 UI 组件参考与建设优先级

核对日期：2026-09-16。

适用范围：以 Web 桌面端、管理后台、SaaS 和通用业务应用为主，兼顾响应式页面。不把移动端原生控件、图表引擎、编辑器和业务页面全部归入基础组件库。

本文分为两部分：先说明常用组件及其用途，再结合 xui 的多框架 Headless 定位给出建设建议。组件目录依据官方文档归纳；优先级与建设路线是本文建议，不是下载量排名，也不是既定项目排期。

## 一、结论速览

一个通用 UI 组件库，可以先围绕以下八类组织：

| 分类 | 优先认识的组件 |
| --- | --- |
| 基础操作 | Button、IconButton、Link、Typography |
| 布局结构 | Flex、Grid、Stack / Space、Divider、Container |
| 输入表单 | Input、Textarea、Checkbox、RadioGroup、Switch、Select、FormField |
| 导航切换 | Tabs、Breadcrumb、Pagination、NavigationMenu、DropdownMenu |
| 数据展示 | Table、List、Tree、Avatar、Badge、Tag、Card |
| 反馈状态 | Alert、Toast、Progress、Spinner、Skeleton、Empty |
| 弹层交互 | Dialog、AlertDialog、Drawer、Popover、Tooltip |
| 底层能力 | ConfigProvider、Portal、焦点管理、浮层定位、键盘导航 |

如果要先做出一套能支撑业务页面的最小集合，建议优先打通：

**按钮 + 输入框 + 表单字段 + 选择控件 + 对话框 + 页签 + 基础表格 + 分页 + 加载 / 错误 / 空状态。**

不要只按组件数量衡量完整度。能够完成“填写表单、提交、反馈、查看列表、修改数据”的完整流程，比拥有很多只有静态外观的组件更有价值。

## 二、参考哪些组件库

### 2.1 “使用最多”的统计口径

没有一份在本文中得到验证、覆盖所有框架和所有项目的真实使用率排行榜。因此这里选择高下载量的代表库，以及对 Headless 设计有参考价值的库，不宣称它们构成全行业前七名。

下面是 npm 官方下载 API 返回的同一时间窗快照，时间窗为 **2026-09-08 至 2026-09-14，包含首尾日期，共七天**。查询于 2026-09-16。[S1]

| 组件库 | npm 包 | 七天下载次数 |
| --- | --- | ---: |
| Material UI | `@mui/material` | 9,201,491 |
| Ant Design | `antd` | 3,463,489 |
| Mantine | `@mantine/core` | 2,220,730 |
| Chakra UI | `@chakra-ui/react` | 1,588,262 |
| Element Plus | `element-plus` | 604,428 |

阅读这些数字时，需要保留以下限制：

- 下载次数不是独立开发者数、生产项目数或市场份额；重复安装、CI 和依赖安装都会影响它。
- 不同框架生态、包拆分方式、组件覆盖范围不同，不能据此判断组件质量。
- 该表只是所选完整组件包之间的快照，不是对 npm 所有 UI 包的穷举。
- Radix 可通过整体包或独立组件包安装；其单组件包不与完整库放在同一排名中。[S7]
- shadcn/ui 的源码分发和 registry 使用方式，与传统整库安装不同；本文不使用 CLI 下载量作为它的使用率。[S5][S6]
- 下载量只能说明分发活动的一个侧面；具体选型仍应检查功能、适配成本、维护状态和可访问性。

### 2.2 各库的参考价值

以下“适合参考”是根据官方目录和项目定位做出的归纳，不表示每个功能都属于同一个免费基础包。

| 组件库 | 形态 / 生态 | 本文建议重点参考 | 对 xui 的意义 |
| --- | --- | --- | --- |
| Ant Design | React，带样式的完整组件体系 | 表单、表格、树、上传、分页、反馈、全局配置 | 借鉴业务组件覆盖范围和状态设计。[S2] |
| Material UI | React，Material 风格体系 | 基础控件、布局、导航、主题；复杂数据能力另看 MUI X | 区分基础组件与高级数据组件，避免边界过大。[S3] |
| Element Plus | Vue，带样式的完整组件体系 | 表单校验、选择器、表格、树、日期时间、上传 | 借鉴 Vue 侧使用习惯和后台场景覆盖。[S4] |
| Mantine | React，组件及配套工具生态 | 输入控件、Combobox、布局、弹层、组合方式 | 补充细分输入控件和开发体验参考。[S8] |
| Chakra UI | React，组合式组件体系 | Field、复合组件、布局、反馈、集合类控件 | 借鉴组件分部结构和可访问性接口。[S9] |
| shadcn/ui | React，源码可纳入项目的组件与组合方案 | 组件组合、Field、Sidebar、Command、Data Table 等 | 借鉴消费端组合和示例层，不当作纯 Headless 内核照搬。[S5][S6] |
| Radix Primitives | React，低层无样式交互组件 | Dialog、Popover、Select、Tabs、焦点与键盘交互 | 与 xui 的 Headless 目标接近，适合参考行为契约。[S7] |

建议的参考方式：**用 Ant Design / Element Plus 看覆盖面，用 MUI / Mantine / Chakra 看 API 与组合，用 Radix 看交互底层，用 shadcn/ui 看面向使用者的示例。**

## 三、常用组件清单

本节按语义归并各库目录中的近似组件名，不表示所有库都提供每一项；完整目录见 [S2] 至 [S9]。

优先级是针对“通用业务应用的第一版组件库”的建议：

- **P0：基础必备。** 高频，或是其他组件的基础依赖。
- **P1：常规扩展。** 常见，但可在第一条完整业务流程之后补齐。
- **P2：按需建设。** 场景性强、实现复杂或更适合扩展包。

同一行列出的一组名称可能包含多个组件，不应把表格行数直接当成组件数量。

### 3.1 基础操作与排版

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Button | 按钮，触发保存、提交、删除等操作 | 原生按钮语义、类型、禁用、加载、防重复触发 | P0 |
| IconButton | 图标按钮，关闭、搜索、更多操作 | 可访问名称、焦点可见、稳定点击区域 | P0 |
| Link | 链接，跳转页面或资源 | 原生链接语义、键盘激活、路由适配 | P0 |
| Typography / Text / Heading | 正文、标题、辅助文本 | 语义标签、层级、换行、截断策略 | P0 |
| Icon | 图标适配入口 | 尺寸、装饰性与语义性区分、外部图标库接入 | P1 |
| ButtonGroup | 按钮组，一组相关操作 | 组标签、相邻状态、溢出策略 | P1 |
| Toggle / ToggleGroup | 可保持按下状态的按钮 | 选中状态、单选 / 多选、键盘导航 | P1 |
| Toolbar | 工具栏，编辑器或操作面板 | 控件分组、方向键导航、可访问名称 | P1 |
| FloatingActionButton | 悬浮主操作按钮 | 遮挡控制、响应式位置、主操作语义 | P2 |

### 3.2 布局与页面结构

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Flex | 弹性布局 | 方向、对齐、间距、换行 | P0 |
| Grid | 栅格布局 | 列数、跨度、断点、最小内容宽度 | P0 |
| Stack / Space | 水平或垂直间距布局 | 方向、间距、换行、分隔内容 | P0 |
| Divider / Separator | 分割线 | 方向、装饰性与语义性区分 | P0 |
| Container / Box | 容器与低层布局包装 | 宽度约束、原生属性透传，避免无意义包装 | P1 |
| Layout / AppShell | 页面骨架 | 页头、侧栏、主内容、窄屏切换 | P1 |
| ScrollArea | 滚动区域 | 原生滚动优先、键盘可达、滚动条可见策略 | P1 |
| AspectRatio | 固定宽高比区域 | 图片、视频加载前预留空间 | P1 |
| Splitter / Resizable | 可调整大小的分栏 | 最小尺寸、拖拽、键盘调整、状态保存 | P2 |
| Affix / Sticky | 固定或吸附元素 | 滚动容器、偏移量、遮挡处理 | P2 |
| Masonry | 瀑布流 | 尺寸测量、重排、阅读顺序 | P2 |

### 3.3 输入与表单

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Input / TextField | 单行文本输入 | 受控 / 非受控、输入法组合事件、清空、只读、错误态 | P0 |
| Textarea | 多行输入 | 自动高度、长度限制、换行、调整大小 | P0 |
| FormField / Field | 单字段结构 | 标签、说明、错误关联、必填与禁用状态 | P0 |
| Form | 表单编排 | 提交、重置、校验接入、错误定位、异步状态 | P0 |
| Checkbox / CheckboxGroup | 多选框 | 单项 / 多项、半选、全选关联 | P0 |
| Radio / RadioGroup | 单选框组 | 组内互斥、方向键移动、组标签 | P0 |
| Switch | 开关 | 开 / 关、标签、禁用、异步切换策略 | P0 |
| Select / NativeSelect | 从给定选项中选择 | 选项值、占位、分组、键盘操作；明确原生或自定义实现 | P0 |
| Combobox / Autocomplete | 输入与候选选择 | 查询值与选中值分离、筛选、异步候选、无结果 | P1 |
| NumberInput / InputNumber | 数字输入 | 步长、范围、精度、空值、格式化与解析 | P1 |
| PasswordInput | 密码输入 | 显示 / 隐藏、自动填充、按钮名称 | P1 |
| DatePicker / DateRangePicker | 日期 / 日期范围选择 | 国际化、禁选日期、范围、解析、时区边界约定 | P1 |
| TimePicker / DateTimePicker | 时间 / 日期时间选择 | 时间格式、步长、禁选时间、时区处理边界 | P1 |
| Upload / FileUpload | 文件选择与上传 | 类型和大小检查、进度、取消、重试、服务端适配 | P1 |
| Slider / RangeSlider | 连续值或区间选择 | 最小 / 最大值、步长、键盘操作、多滑块约束 | P1 |
| SegmentedControl | 少量互斥选项的分段选择 | 选中值、组语义、键盘操作 | P1 |
| TagsInput / MultiSelect | 标签输入或多项选择 | 创建规则、去重、删除、上限、键盘操作 | P1 |
| Cascader / TreeSelect | 层级数据选择 | 路径、懒加载、父子选择策略、搜索 | P2 |
| Transfer | 穿梭框，两组集合间移动 | 批量移动、搜索、禁用项、差异计算 | P2 |
| ColorPicker | 颜色选择 | 颜色格式、透明度、色板、文本输入 | P2 |
| Rating / Rate | 评分 | 最大值、半分、只读、键盘操作 | P2 |
| InputOTP / PinInput | 验证码输入 | 整段粘贴、自动填充、焦点、错误反馈 | P2 |
| Mentions | 提及用户、标签或变量 | 触发符、候选列表、异步搜索、插入范围 | P2 |

### 3.4 导航与内容切换

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Tabs | 页签，同一区域切换内容面板 | 选中与焦点分离、方向、激活策略、面板关联 | P0 |
| Breadcrumb | 面包屑，展示页面层级 | 当前页标识、链接语义、长路径折叠 | P0 |
| Pagination | 分页 | 当前页、页大小、总数、边界、变化事件 | P0 |
| NavigationMenu / Sidebar | 页面导航 / 侧栏 | 路由选中、层级、折叠、窄屏适配 | P1 |
| DropdownMenu / Menu | 操作菜单 | 菜单项、禁用、子菜单、键盘导航、关闭后焦点恢复 | P1 |
| Accordion / Collapse | 手风琴或折叠面板 | 单开 / 多开、受控展开、标题关联、键盘激活 | P1 |
| Steps / Stepper | 步骤条 | 当前、完成、失败、可返回策略 | P1 |
| Anchor / TableOfContents | 锚点导航 / 目录 | 滚动定位、当前章节、固定头部偏移 | P1 |
| ContextMenu | 上下文菜单 | 右键与键盘触发、定位、菜单行为 | P2 |
| Command / CommandPalette | 命令面板 | 搜索、分组、快捷操作、键盘选择 | P2 |
| BottomNavigation / TabBar | 移动端底部导航 | 路由状态、触控区域、安全区 | P2 |

### 3.5 数据展示

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Table | 表格 | 表头和单元格语义、行标识、空态；排序 / 选择按阶段加入 | P0 |
| List / Item | 列表与列表项 | 列表语义、稳定标识、自定义渲染、空态 | P0 |
| Tag / Chip | 标签、分类或可删除项 | 展示态、选中态、删除行为应明确区分 | P0 |
| Badge | 徽标，数量或状态提示 | 数量上限、状态文本、避免仅依赖颜色 | P0 |
| Avatar | 头像 | 图片失败回退、文本替代、装饰性处理 | P1 |
| Card | 单个实体的信息容器 | 标题、内容、操作；避免把所有页面区域都做成卡片 | P1 |
| Tree / TreeView | 树形数据 | 展开、选择、半选、懒加载、完整键盘导航 | P1 |
| Descriptions / DataList | 属性详情 | 标签和值的语义关联、响应式列布局 | P1 |
| Image / ImagePreview | 图片与预览 | 加载失败、替代文本、预览焦点、切换和关闭 | P1 |
| Statistic / Stat | 统计数值 | 数字格式、单位、变化方向、加载态 | P1 |
| Timeline | 时间线 | 时间语义、顺序、状态、长文本 | P1 |
| Calendar | 日历展示 | 日期网格、国际化、事件内容、日期选择边界 | P2 |
| Carousel | 轮播 | 暂停、前后切换、键盘操作、减少动效 | P2 |
| DataGrid / TreeGrid | 高级数据网格 | 虚拟化、编辑、固定列、分组、导航模型 | P2 |
| QRCode / Watermark | 二维码 / 水印 | 内容变化、下载、尺寸与遮挡；不作为安全防护保证 | P2 |

### 3.6 反馈与状态

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Alert | 页内提示或警告 | 严重程度、标题、描述、关闭、播报策略 | P0 |
| Toast / Message / Snackbar | 短暂操作反馈 | 队列、去重、时长、关闭、播报、可操作内容的停留策略 | P0 |
| Spinner / Loading | 不确定进度的加载 | 可访问说明、忙碌区域、延迟显示策略 | P0 |
| Progress | 可度量任务进度 | 确定 / 不确定模式、数值、状态、说明 | P0 |
| Skeleton | 内容加载占位 | 稳定布局、减少动效、避免重复播报 | P0 |
| Empty / EmptyState | 无数据或无搜索结果 | 区分首次使用、过滤无结果、权限限制等原因 | P0 |
| Notification | 更持久的通知 | 标题、内容、操作、多条堆叠、显式关闭 | P1 |
| Result | 提交成功、失败等结果区域 | 结果说明、下一步、重试或返回 | P1 |
| ErrorState | 错误状态组合 | 保留上下文、重试入口、区别于空数据 | P1 |
| Tour | 功能引导 | 目标定位、跳过、焦点、目标不存在时的处理 | P2 |

### 3.7 对话框与浮层

| 组件 | 中文名 / 用途 | 建议关注的能力 | 优先级 |
| --- | --- | --- | --- |
| Dialog / Modal | 模态对话框 | 标题、描述、初始焦点、焦点约束、关闭与恢复、滚动锁定 | P0 |
| AlertDialog / ConfirmDialog | 重要操作确认 | 清楚的后果、确认和取消、合适的初始焦点 | P0 |
| Popover | 锚定触发元素的内容浮层 | 定位、碰撞处理、打开方式、外部交互、焦点策略 | P0 |
| Tooltip | 简短解释提示 | 悬停及焦点触发、延迟、Escape 关闭、不能放交互表单 | P0 |
| Drawer / Sheet | 从侧边进入的面板 | 模态 / 非模态、标题、焦点、窄屏适配、滚动 | P1 |
| Popconfirm | 锚定元素的轻量确认 | 复用浮层和确认行为，明确焦点及关闭规则 | P1 |
| HoverCard | 悬停预览卡 | 延迟、指针移动容错；关键内容不能只靠悬停获得 | P2 |
| Backdrop / Overlay | 遮罩层 | 叠层、点击策略、背景交互隔离 | P0，内部能力优先 |

## 四、容易混淆的组件边界

以下边界结合组件目录与 WAI-ARIA APG 模式整理；不同库的产品名称可能不同，应以具体交互契约为准。[S2][S3][S4][S7][S10]

| 容易混淆的组件 | 推荐区分方式 |
| --- | --- |
| Button / Link | Button 触发动作；Link 导航到资源。不要仅按外观选择标签。 |
| Checkbox / Switch | Checkbox 表示勾选项或集合成员；Switch 表示开 / 关设置。是否即时保存由业务定义，不能只凭控件名称推断。 |
| Select / Combobox | Select 主要从给定选项选值；Combobox 还要处理输入和候选弹层，查询文本不一定等于选中值。 |
| DropdownMenu / Select | 菜单主要触发动作；Select 修改字段值，不能仅因都有下拉面板就共用语义。 |
| NavigationMenu / Menu | 页面导航通常使用链接；操作菜单使用菜单项的键盘模型，不要给所有侧栏都加 `role="menu"`。 |
| Tabs / SegmentedControl | Tabs 切换关联的内容面板；分段选择器选择一个值或模式，未必存在面板。 |
| Tooltip / Popover | Tooltip 提供简短非交互说明；Popover 可以承载交互内容，但必须定义焦点行为。 |
| Dialog / AlertDialog | Dialog 用于一般对话；AlertDialog 用于需要立即回应的重要提示或确认，不应泛用于普通表单。 |
| Toast / Notification / Alert | Toast 通常短暂；Notification 通常承载更完整通知；Alert 留在页面上下文中。具体时长仍由产品定义。 |
| Table / DataGrid | 普通表格优先使用 HTML table；可编辑网格还涉及单元格导航、选择与编辑模式。 |
| Layout Grid / ARIA Grid | CSS 栅格负责排版；ARIA grid 是交互语义，不能给普通网格布局直接套用。 |
| Calendar / DatePicker | Calendar 可展示日期和事件；DatePicker 是包含输入、日期选择与弹层流程的字段控件。 |

另外，**“相似名称”不等于“可以一对一替换”**。例如 MUI 的 Dialog、Modal 和 Popover 是不同抽象层；其 Data Grid、日期选择器、Charts 和 Tree View 在官方总览中归入 MUI X，应分别核对包和功能边界。[S3]

核对时 Ant Design 总览将 `List` 标记为 Deprecated，并列出 `Listy`。这说明通用的“列表”需求长期存在，但某一个库的具体 API 会变；xui 的命名和契约不应机械复制上游目录。[S2]

## 五、完整组件应具备什么

本节是建议的验收清单；可访问性行为应逐组件参考 WAI-ARIA APG，不能把同一套按键规则套给所有控件。[S10]

| 维度 | 建议检查项 |
| --- | --- |
| 状态 | 默认、聚焦、禁用、只读、加载、错误、空值，以及组件特有的选中 / 展开状态 |
| 数据契约 | 值类型、默认值、受控 / 非受控规则、变化事件、重复值和空值处理 |
| 键盘 | Tab 顺序、Enter / Space、方向键、Home / End、Escape，按组件模式适用 |
| 焦点 | 打开、关闭、删除、卸载及嵌套弹层时焦点是否合理 |
| 语义 | 优先原生元素；名称、描述、错误关联、role 和 ARIA 状态正确 |
| 异步 | 加载、失败、取消、重试、请求竞态与重复提交 |
| 国际化 | 长文本、不同日期和数字格式、RTL，以及输入法 |
| 响应式 | 长内容不溢出、布局不抖动、触控可用、缩放后仍能操作 |
| 样式扩展 | class / style、slot / render、状态属性、主题变量边界 |
| 工程 | TypeScript 类型、SSR / hydration、稳定 ID、清理监听器、性能 |
| 测试 | 核心状态单测、框架适配测试、键盘和焦点集成测试、可访问性检查 |

注意：`disabled`、`readonly`、`loading` 和 `aria-busy` 不是同义词。建议保留 xui 已有的交互态统一原则，同时逐组件规定具体映射；不能让父级“加载中”意外阻止用户取消、关闭、阅读内容或恢复错误。

只读属性只用于有对应语义的控件；`aria-busy` 表示忙碌状态，本身不会阻止点击或键盘操作。禁用行为需要由原生属性或事件逻辑实际落实。[S11][S12]

## 六、结合 xui 的建设建议

### 6.1 当前可见状态

以下根据本地组件导出入口核对，不是生产就绪度或测试覆盖率认证。工作区存在未提交改动，因此这份快照描述的是 **2026-09-16 当前工作区**，不是某个已发布版本。

核对文件：

- `packages/react/src/components/index.ts`
- `packages/vue/src/components/index.ts`
- `packages/svelte/src/components/index.ts`
- `packages/core/src/index.ts`
- `doc/项目蓝图.md`

| 组件组 | React | Vue | Svelte |
| --- | --- | --- | --- |
| Button、Switch、List、Flex、Grid | 已导出 | 已导出 | 已导出 |
| Tree | 已导出 | 已导出 | 未在入口导出 |
| Typography、Space、Divider | 已导出 | 已导出 | 未在入口导出 |
| Alert、Tag、Badge | 已导出 | 已导出 | 未在入口导出 |
| ConfigProvider、ThemeDesigner | 已导出 | 已导出 | 未在入口导出 |
| PromptInput | 已导出 | 未在入口导出 | 未在入口导出 |

核心入口目前导出交互态、toggle、button 和 theme 相关能力。不能因为某个适配层导出了组件，就推断其行为已经完整下沉到 core，或三端行为已经完全一致。

### 6.2 推荐分层

| 层次 | 内容 | 建议职责 |
| --- | --- | --- |
| 核心契约与纯逻辑 | 值模型、选择集合、展开集合、状态迁移、事件契约 | 不依赖 React / Vue / Svelte，不直接绑定浏览器生命周期 |
| 共享 DOM 能力 | 浮层定位、焦点、滚动锁定、外部点击、键盘集合导航 | 如确有复用需求，可独立成框架无关的 DOM 模块，保持 SSR 边界清晰 |
| 框架适配 | hooks、composables、stores、组件、refs、slots | 负责响应式绑定、DOM 生命周期、事件映射和渲染 |
| 样式与示例 | 主题变量、Tailwind 示例、组件组合 | 不把固定皮肤绑定到交互核心 |
| 高阶场景 | 高级表格、复杂表单、文件管理器、PromptInput、ThemeDesigner | 消费基础组件；按需求决定是否拆为扩展层 |

不要为“所有逻辑都要下沉”而把简单的排版包装做成状态机。Button、Checkbox、Dialog 等需要明确行为契约；Flex、Divider、Typography 等更需要一致的语义与属性透传约定。

### 6.3 建设顺序

表格中的阶段表示依赖和交付顺序，不是时间承诺。P0 组件也可能因依赖关系安排在后续阶段。

| 阶段 | 建议交付 | 验收目标 |
| --- | --- | --- |
| 阶段 0：统一已有能力 | 三端 API 差异表、已有组件状态规范、关键行为测试、必要的 Svelte 对齐 | 清楚知道哪些能力支持哪些框架，不把“已导出”当成“已完成” |
| 阶段 1：表单闭环 | Input、Textarea、Field、Checkbox、RadioGroup、基础 Select、表单集成示例 | 一个设置表单可填写、校验、提交、重置，并正确反馈失败 |
| 阶段 2：弹层底座 | Portal、定位、焦点、叠层、Dialog、AlertDialog、Popover、Tooltip | 打开 / 关闭 / 嵌套 / 键盘操作 / 卸载均正确，焦点不会丢失 |
| 阶段 3：页面交互 | Tabs、Accordion、Breadcrumb、Pagination、DropdownMenu、Toast、加载与空态 | 一个列表页可筛选、翻页、切换视图、确认操作并展示结果 |
| 阶段 4：数据与复杂输入 | 基础 Table 的排序和选择、Tree 完善、Combobox、DatePicker、Upload、Drawer | 支持真实数据规模及异步流程，明确服务端数据接口 |
| 阶段 5：扩展场景 | 虚拟化 / DataGrid、TreeSelect、Cascader、Command、Splitter、业务组合 | 根据真实项目需求加入，不为追求数量提前扩张 |

这里“基础 Select”可以先以原生选择控件完成业务闭环；若第一版就要求自定义弹层 Select，应先完成阶段 2 中对应的定位、焦点和集合导航能力。

建议复用关系：

```text
字段标签 / 描述 / 错误关联 -> Input / Textarea / Checkbox / RadioGroup
定位 + 弹层生命周期 -> Popover / Tooltip / Select 弹层
焦点管理 + 背景交互隔离 -> Dialog / AlertDialog / 模态 Drawer
选项集合 + 键盘导航 -> Select / Combobox / Menu 的共享基础
列模型 + 行标识 + 排序 / 选择 -> Table 的进阶能力
```

共享基础不等于复用整套交互语义。例如 Menu 和 Select 可以共享集合工具，但键盘行为、ARIA 角色、值变化和关闭策略仍需分别定义。

### 6.4 第一版不宜自行包办的能力

以下是复杂度控制建议，并不是对前述组件库功能缺失的判断：

- 富文本编辑器：基础库提供容器、工具栏和表单接入，编辑模型交给专用引擎。
- 图表：提供主题、布局和反馈适配，不把图表计算与渲染内核塞进通用 core。
- 高级表格：先明确列、行和选择契约，再按需求接入成熟的数据及虚拟化方案。
- 日期时间：提前约定值格式、国际化、时区和序列化边界。
- 文件上传：UI 管理选中文件和任务状态，鉴权、存储、病毒检查等属于服务端职责。
- Form：优先稳定 Field 与校验接入协议，再决定是否自建完整表单状态引擎。
- AI 对话组件：PromptInput、消息列表、工具结果等作为高阶组合，不代替通用输入、列表和反馈基础。

## 七、参考来源与复查方式

以下均为官方来源，核对日期为 2026-09-16。组件目录会变化，下载统计也只代表指定时间窗；后续立项应重新核对。

| 编号 | 来源 | 地址或查询方式 | 用于 |
| --- | --- | --- | --- |
| S1 | npm 官方 downloads API | `https://api.npmjs.org/downloads/point/2026-09-08:2026-09-14/{package}` | 同一七天窗口的包下载次数；`{package}` 替换为统计表中的包名 |
| S2 | Ant Design 组件总览 | `https://ant.design/components/overview/` | 分类、组件覆盖、List / Listy 状态 |
| S3 | Material UI 组件总览 | `https://mui.com/material-ui/all-components/` | 基础控件、工具能力及 MUI X 边界 |
| S4 | Element Plus 组件总览 | `https://element-plus.org/en-US/component/overview.html` | Vue 组件及后台场景覆盖 |
| S5 | shadcn/ui 组件目录 | `https://ui.shadcn.com/docs/components` | 组件与高阶组合 |
| S6 | shadcn/ui 介绍 | `https://ui.shadcn.com/docs` | 开放源码分发及组件组合定位 |
| S7 | Radix Primitives 介绍与目录 | `https://www.radix-ui.com/primitives/docs/overview/introduction` | 无样式交互、受控模式、可访问性、包安装方式 |
| S8 | Mantine Core 目录 | `https://mantine.dev/core/package/` | 输入、布局、弹层与组件组织 |
| S9 | Chakra UI 组件总览 | `https://chakra-ui.com/docs/components/concepts/overview` | 复合组件、Field、集合与反馈 |
| S10 | WAI-ARIA APG 模式目录 | `https://www.w3.org/WAI/ARIA/apg/patterns/` | 组件语义、键盘和焦点模式 |
| S11 | WAI-ARIA `aria-busy` | `https://www.w3.org/TR/wai-aria-1.2/#aria-busy` | 忙碌状态的语义 |
| S12 | HTML disabled / readonly | `https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute`；`https://html.spec.whatwg.org/multipage/input.html#the-readonly-attribute` | 原生禁用和只读语义 |

后续维护建议：更新时记录核对日期，重新查询同窗下载数据，检查上游废弃组件，并同步 xui 各框架导出状态。不要把这份清单直接当作“全部必须实现”的待办列表。
