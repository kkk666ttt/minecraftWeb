# 目录与模块维护指南

本文档面向后续维护者，说明项目架构、模块职责、维护规范。

## 1. 项目结构总览

```
mc-server-site/
├── index.html              # 主页面，所有 JS/CSS 资源引用入口
├── css/
│   └── style.css           # 全局样式（~3500 行）
├── js/
│   ├── lib/
│   │   └── marked.min.js   # Markdown 解析库
│   ├── app.js              # 模块注释 + 添加功能步骤说明
│   └── modules/            # 功能模块（每个文件一个功能域）
│       ├── core.js         # 全局状态 App、工具函数、markdownToHtml()
│       ├── router.js       # 数据加载 loadData()、路由 navigateTo()/renderPage()
│       ├── init.js         # 启动入口 init()、导航初始化、主题切换
│       ├── home.js         # 首页英雄帖幻灯片
│       ├── plugins.js      # 插件列表 & 详情（异步 MD）
│       ├── resourcepacks.js # 资源包列表 & 详情（异步 MD）
│       ├── docs.js         # 文档页 & TOC 导航
│       ├── activities.js   # 活动通知侧边栏/列表/详情
│       ├── changelog.js    # 更新日志 & 详情
│       ├── gallery.js      # 游戏画廊 & 图片查看器
│       └── qq-about.js     # QQ群 & 关于页面
├── data/                   # JSON 数据文件
│   ├── config.json         # 站点配置 & 导航菜单
│   ├── plugins.json        # 插件数据
│   ├── resourcepacks.json  # 资源包数据
│   ├── docs.json           # 文档目录
│   ├── activities.json     # 活动通知
│   ├── gallery.json        # 画廊数据
│   └── changelog.json      # 更新日志
├── docs/                   # Markdown 内容 + 维护指南
│   ├── activities/         # 活动通知 MD
│   ├── changelog/          # 更新日志 MD
│   ├── plugins/            # 插件指南 MD
│   ├── resourcepacks/      # 资源包介绍 MD
│   ├── docs/               # 服务器文档 MD
│   └── howtoUse/           # 站点维护指南
└── assets/images/gallery/  # 画廊图片资源
```

## 2. 核心架构理念

### 数据流

```
data/*.json ──→ loadData() ──→ App.xxx ──→ render[Page]() ──→ HTML
                                                   │
                                        (如有 path 字段)
                                                   │
                                            fetch(.md)
                                                   │
                                      markdownToHtml()
                                                   │
                                               渲染内容
```

### JSON + MD 双源模式

- `data/*.json`：存储列表数据（标题、摘要、ID、分类等）
- `docs/*/*.md`：存储详细内容（通过 `path` 字段引用）
- 优点：JSON 保持轻量，MD 文件可直接在编辑器中预览编辑

### 渲染模式（两种）

**模式 A：纯 JSON 渲染**（首页、画廊、关于）
- 所有数据来自 JSON，直接渲染
- 适用于短内容、卡片列表

**模式 B：JSON + 异步 MD**（插件、资源包、活动详情、日志详情、文档）
- JSON 提供列表数据
- 点击详情时 `fetch(path)` → `markdownToHtml()` → 渲染
- 适用于长文、图文混排内容

## 3. 模块职责详解

### core.js

- `App` 全局对象（所有模块共享状态）
- `$()`, `$$()` — DOM 选择器简写
- `markdownToHtml()` — Markdown 渲染（基于 marked.js）
- `openImageViewer()`, `closeImageViewer()` — 通用图片查看器

### router.js

- `loadData()` — 并发加载所有 JSON，赋值到 `App`
- `navigateTo(pageId, pushState?)` — 页面切换（含浏览器历史）
- `renderPage(pageId)` — 路由分发（switch-case）
- `popstate` 监听 — 浏览器回退支持

### init.js

- `init()` — 启动入口（加载数据 → 初始化导航 → 跳转首页）
- `initNavigation()` — 生成侧边栏菜单、绑定事件
- `toggleSidebar()` — 侧边栏折叠
- `toggleTheme()` — 深色/浅色主题切换
- `showRulesIfNeeded()` — 首次访问规则弹窗

### home.js

- `renderHome()` — 首页全屏幻灯片 + 卡片堆叠 + IP 复制

### plugins.js

- `renderPluginList()` — 插件网格（分类筛选 + 搜索）
- `openPluginDetail()` — 弹窗显示插件详情（异步加载 MD）
- `loadPluginDocContent()` — fetch MD 渲染到弹窗

### resourcepacks.js

- 结构与 plugins.js 完全对称
- `renderResourcepacks()`, `openRpDetail()`, `loadRpDocContent()`

### docs.js

- `renderDocs()` — 左侧目录 + 右侧内容区
- `showDoc()` — 加载并渲染 MD 文档
- `generateTOC()` — 自动生成标题纲目
- `scrollToHeading()` — 点击纲目跳转并高亮
- `toggleDocsSidebar()` — 移动端侧边栏浮层

### activities.js

- `renderSidebarActivities()` — 侧边栏最新 5 条通知
- `renderActivitiesPage()` — 活动列表页（常驻/最新/过期分类）
- `openActivityDetail()` / `renderActivityDetail()` — 详情页（异步 MD）
- `markAsRead()` / `markAllAsRead()` — 已读管理（localStorage）

### changelog.js

- `renderChangelog()` — 日志页（Hero + 时间轴历史列表）
- `openChangelogDetail()` — 弹窗查看完整版本日志（异步 MD）

### gallery.js

- `renderGallery()` — 画廊页面（精选滚动 + 网格 + 标签筛选）
- `openGalleryViewer()` — 图片查看器（缩放、拖动、触控双指）
- `gvZoomAt()`, `galleryResetZoom()` — 缩放控制

### qq-about.js

- `renderQQGroup()` — QQ 群页面
- `renderAbout()` — 关于页面

## 4. 扩展规范

### 4.1 添加新页面（标准流程）

以"投票页面"为例：

```
步骤 1: data/votes.json     — 创建数据文件
步骤 2: js/modules/votes.js — 创建模块，实现 renderVotes()
步骤 3: index.html          — 添加 <section id="page-votes"> 和 <script src>
步骤 4: router.js           — loadData() 加 fetch, renderPage() 加 case
步骤 5: config.json         — navigation 加导航项
步骤 6: core.js             — App 对象加 votes: []（可选）
```

### 4.2 添加新内容到现有模块

| 模块 | 操作 | 需同时修改 |
|------|------|-----------|
| 插件 | 在 `data/plugins.json` 添加条目 | 在 `docs/plugins/` 创建对应的 `.md` |
| 资源包 | 在 `data/resourcepacks.json` 添加条目 | 在 `docs/resourcepacks/` 创建对应的 `.md` |
| 活动通知 | 在 `data/activities.json` 添加条目 | 在 `docs/activities/` 创建对应的 `.md` |
| 更新日志 | 在 `data/changelog.json` 添加条目 | 在 `docs/changelog/` 创建对应的 `.md` |
| 画廊 | 在 `data/gallery.json` 添加条目 | 图片放入 `assets/images/gallery/` |
| 文档 | 在 `data/docs.json` 添加条目 | 在 `docs/docs/` 或对应路径创建 `.md` |

### 4.3 命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 渲染函数 | `render[Page]()` | `renderPluginList()` |
| 打开详情 | `open[Detail]()` | `openRpDetail()` |
| 关闭模态框 | `close[Modal]()` | `closeChangelogModal()` |
| 过滤器 | `filter[Items]()` | `filterPlugins()` |
| CSS 类 | `[page]-[element]` | `btn-act-read` |
| JSON id | `[prefix]-[num]` | `act-001` |

## 5. 维护规范

### 数据维护

- 所有页面数据只在 `data/*.json` 中维护
- 禁止在 JS 中硬编码业务数据
- 修改数据后检查 JSON 格式（可用 `JSON.parse()` 验证）
- 如果数据带有 `path` 字段，确认对应 `.md` 文件存在

### 样式维护

- 全局样式统一在 `css/style.css`
- 新增样式使用已有 CSS 变量（`var(--xxx)`）
- 需要适配浅色主题时，添加 `[data-theme="light"]` 覆盖
- 修改样式后更新 `index.html` 中资源版本参数

### 脚本维护

- 每个模块独立一个文件
- 模块间通过 `App` 全局对象通信
- 函数使用小驼峰命名，全局函数需避免和其他模块冲突
- 新增页面优先参考 `resourcepacks.js`（标准模板）

### 资源引用

- 所有资源路径相对于 `index.html` 所在目录
- 图片放在 `assets/images/`
- 新增资源需同步更新版本参数

## 6. 调试建议

| 现象 | 原因 | 排查方向 |
|------|------|----------|
| 白屏 | JS 语法错误或数据加载失败 | 控制台查看错误信息 |
| 某页面空白 | 对应 JSON 为空或渲染函数未调用 | 检查 `router.js` 的 case |
| 详情加载失败 | MD 文件不存在或路径错误 | 检查 `path` 字段对应的文件 |
| 样式不对 | CSS 被覆盖或变量未定义 | 检查 `var(--xxx)` 是否在 `:root` 中 |
| 主题切换无效 | 缺少 `[data-theme="light"]` 覆盖 | 添加对应的 light 覆盖规则 |
| 缓存不更新 | 浏览器缓存了旧版本 | 更新 `index.html` 中的 `?v=xxx` 参数 |

## 7. 文档同步

当架构变化时，同步更新以下文件：

- `README.md` — 项目总览
- `docs/howtoUse/DATA_SCHEMA.md` — 数据字段规范
- `docs/howtoUse/MAINTENANCE_ARCHITECTURE.md` — 本文档
- README.md