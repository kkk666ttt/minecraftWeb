// DreamCraft 服务器网站 - 主入口
// 所有模块按顺序加载，每个文件独立管理一个功能域
//
// 模块列表：
//   core.js         - 全局状态 App 对象、工具函数、Markdown渲染、通用图片查看器
//   router.js       - 数据加载 loadData()、页面路由 navigateTo()/renderPage()
//   home.js         - 首页 renderHome()、IP复制、通行证验证
//   plugins.js      - 插件列表/详情 renderPluginList()/openPluginDetail()
//   resourcepacks.js - 资源包列表/详情 renderResourcepacks()/openRpDetail()
//   docs.js         - 文档 renderDocs()/showDoc()、TOC 导航、图片画廊支持
//   qq-about.js     - QQ群 renderQQGroup()、关于 renderAbout()
//   activities.js   - 活动通知侧边栏/列表/详情/已读管理
//   gallery.js      - 画廊 renderGallery()/openGalleryViewer()
//   changelog.js    - 更新日志 renderChangelog()/openChangelogDetail()
//   init.js         - 导航初始化、主题切换、规则弹窗、init() 启动入口
//
// ============================================================
// 添加新功能步骤：
//   1. 在 js/modules/ 下创建新文件（参考 resourcepacks.js）
//   2. 在 index.html 中添加对应的 <script src>
//   3. 在 router.js 的 loadData() 中 fetch 数据
//   4. 在 router.js 的 renderPage() 中添加 case 路由
//   5. 在 data/ 下创建对应的 JSON 数据文件
//   6. 在 core.js 的 App 对象中添加状态字段（初始值用 []）
//   7. 在 config.json 的 navigation 中添加导航项
// ============================================================
//
// 命名约定：
//   渲染函数: render[PageName]()    —— 列表页渲染
//   打开详情: open[DetailName]()    —— 模态框/详情页
//   关闭详情: close[DetailName]()   —— 关闭模态框
//   数据加载: load[Name]()          —— 异步 fetch 数据
//   工具函数: [verb][Target]()      —— 小驼峰命名
//   CSS 类名: [page]-[element]      —— 如: plugin-card, activities-grid
//   JSON id:  [type]-[number]       —— 如: act-001, gallery-001
//
// ============================================================
// 了解详细规范请查看:
//   docs/howtoUse/DATA_SCHEMA.md          - 数据字段规范
//   docs/howtoUse/MAINTENANCE_ARCHITECTURE.md - 架构与拓展指南
//   docs/howtoUse/ACTIVITIES_GUIDE.md     - 活动通知发布指南
//   docs/howtoUse/PLUGINS_GUIDE.md        - 插件发布指南
// ============================================================
