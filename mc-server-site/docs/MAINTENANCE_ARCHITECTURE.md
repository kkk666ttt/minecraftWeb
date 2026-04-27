# 目录与模块维护指南

本文档面向后续维护者，说明项目架构、模块职责、维护规范。

## 1. 项目结构总览

```
mc-server-site/
├── index.html          # 主页面，资源引用入口
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── app.js          # 模块注释说明
│   └── modules/        # 功能模块目录
│       ├── core.js     # 全局状态、工具函数
│       ├── router.js   # 数据加载、页面路由
│       ├── init.js     # 启动流程、导航初始化
│       ├── home.js     # 首页渲染
│       ├── plugins.js  # 插件列表与详情
│       ├── docs.js     # 文档页与备份
│       ├── activities.js # 活动通知
│       ├── gallery.js  # 画廊
│       ├── changelog.js # 更新日志
│       └── qq-about.js # QQ群与关于页
├── data/               # 数据文件目录
│   ├── config.json     # 站点配置
│   ├── plugins.json    # 插件数据
│   ├── docs.json       # 文档数据
│   ├── activities.json # 活动数据
│   ├── gallery.json    # 画廊数据
│   └── changelog.json  # 更新日志数据
├── assets/             # 静态资源
└── docs/               # 维护文档
```

## 2. 模块职责详解

### core.js

- 全局 App 对象状态管理
- 通用工具函数（formatNumber、getRankClass）
- Markdown 转 HTML 渲染
- 通用图片查看器

### router.js

- 数据加载（Promise.all 并发加载所有 JSON）
- 页面路由（navigateTo、renderPage）
- 页面渲染分发

### init.js

- 导航初始化
- 侧边栏折叠逻辑
- 键盘事件绑定
- 全局事件监听
- 启动入口 init()

### home.js

- 首页渲染（Hero、统计、特色功能）
- IP 复制功能
- 通行证验证

### plugins.js

- 插件列表渲染与筛选
- 插件详情弹窗
- 搜索逻辑

### docs.js

- 文档列表渲染
- 文档内容展示
- 数据备份功能

### activities.js

- 侧边栏通知渲染
- 活动列表页
- 活动详情页
- 已读状态管理

### gallery.js

- 画廊网格渲染
- 标签筛选
- 图片查看器（缩放/拖动/切图）

### changelog.js

- 更新日志渲染（Hero + 历史列表）

### qq-about.js

- QQ群页面
- 关于页面

## 3. 维护规范

### 数据维护

- 所有页面数据只在 data/*.json 中维护
- 禁止在 JS 中硬编码数据
- 修改数据后检查 JSON 格式

### 样式维护

- 全局样式统一在 css/style.css
- 模块特定样式在对应 JS 的 render 函数内内联
- 修改样式后更新 index.html 版本参数

### 脚本维护

- 每个模块独立一个文件
- 模块间通过全局 App 对象通信
- 新功能优先考虑复用现有模块

### 资源引用

- 所有资源路径相对项目根目录
- 图片放在 assets/images/
- 新增资源需同步更新 index.html 引用

## 4. 新增页面流程

1. 在 data/config.json 的 navigation 数组添加导航项
2. 在 js/modules/ 创建新模块文件
3. 在 index.html 添加 <script src>
4. 在 router.js 的 renderPage() 添加路由
5. 在 core.js 的 App 对象添加状态字段
6. 在 data/ 创建对应 JSON 数据文件

## 5. 禁止改动区

- 不要修改 core.js 的 App 对象结构（除非新增页面）
- 不要删除现有模块文件（可重命名但需同步引用）
- 不要改动 init.js 的启动流程（除非必要）

## 6. 调试建议

- 控制台报错优先看文件名+行号
- 白屏通常是 JS 语法错误或数据加载失败
- 功能异常先检查对应模块的 render 函数
- 样式问题先看 css/style.css 是否被覆盖

## 7. 文档同步

当架构变化时，同步更新：

- docs/MAINTENANCE_ARCHITECTURE.md
- docs/DATA_SCHEMA.md
- README.md