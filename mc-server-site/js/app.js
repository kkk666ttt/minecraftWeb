// DreamCraft 服务器网站 - 主入口
// 所有模块按顺序加载，每个文件独立管理一个功能域
//
// 模块列表：
//   core.js       - 全局状态 App 对象、工具函数、Markdown渲染、通用图片查看器
//   router.js     - 数据加载 loadData()、页面路由 navigateTo()/renderPage()
//   home.js       - 首页 renderHome()、IP复制、通行证验证
//   leaderboard.js - 排行榜 renderLeaderboard()/filterLeaderboard()
//   plugins.js    - 插件列表/详情 renderPluginList()/openPluginDetail()
//   docs.js       - 文档 renderDocs()/showDoc()、数据备份 backupData()
//   qq-about.js   - QQ群 renderQQGroup()、关于 renderAbout()
//   activities.js - 活动通知侧边栏/列表/详情/已读管理
//   gallery.js    - 画廊 renderGallery()/openGalleryViewer()
//   init.js       - 导航初始化、折叠、键盘事件、init() 启动入口
//
// 添加新功能步骤：
//   1. 在 js/modules/ 下创建新文件
//   2. 在 index.html 中添加对应的 <script src>
//   3. 在 router.js 的 renderPage() 中添加路由
//   4. 在 data/ 下创建对应的 JSON 数据文件
//   5. 在 core.js 的 App 对象中添加状态字段
//   6. 在 config.json 的 navigation 中添加导航项
