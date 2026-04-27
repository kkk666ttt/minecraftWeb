# DreamCraft 网站项目

DreamCraft 服务器门户网站（静态站点）。

## 快速开始

1. 在项目根目录打开终端。
1. 启动本地服务：

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

1. 访问 <http://127.0.0.1:8080>

## 项目结构

```text
mc-server-site/
├── index.html
├── css/
│   └── style.css
├── data/
│   ├── config.json
│   ├── plugins.json
│   ├── docs.json
│   ├── activities.json
│   ├── gallery.json
│   └── changelog.json
├── js/
│   ├── app.js
│   └── modules/
│       ├── core.js
│       ├── router.js
│       ├── init.js
│       ├── home.js
│       ├── plugins.js
│       ├── docs.js
│       ├── activities.js
│       ├── gallery.js
│       ├── qq-about.js
│       └── changelog.js
└── assets/
```

## 模块职责

- core.js：全局状态与通用工具函数。
- router.js：数据加载与页面路由渲染。
- init.js：启动流程与导航初始化。
- home.js：首页渲染与交互逻辑。
- plugins.js：插件列表与搜索筛选。
- docs.js：文档页与备份信息渲染。
- activities.js：侧边栏通知、通知列表与详情页。
- gallery.js：画廊页面逻辑。
- changelog.js：更新日志页面渲染。

## 维护规范

- 页面数据只放在 data/*.json 中维护。
- 页面逻辑统一放在 js/modules/*.js 中维护。
- 样式统一在 css/style.css 中修改。
- 如果 JS/CSS 修改后页面无变化，请更新 index.html 中资源版本参数。

## 通知维护

完整说明请查看 docs/ACTIVITIES_GUIDE.md。

## 发布与维护指南

- 更新日志发布指南：docs/CHANGELOG_GUIDE.md
- 插件列表发布与修改指南：docs/PLUGINS_GUIDE.md
- 游戏画廊发布图片指南：docs/GALLERY_GUIDE.md
- 活动通知维护指南：docs/ACTIVITIES_GUIDE.md
- 首页内容修改指南：docs/HOME_GUIDE.md

## 部署与维护文档

- 部署与运行手册：docs/DEPLOYMENT_GUIDE.md
- 故障排查手册：docs/TROUBLESHOOTING.md
- 数据字段规范：docs/DATA_SCHEMA.md
- 发布检查清单：docs/RELEASE_CHECKLIST.md
- 版本与发布策略：docs/RELEASE_POLICY.md
- 目录与模块维护指南：docs/MAINTENANCE_ARCHITECTURE.md

## 常见安全修改项

- 新增通知：修改 data/activities.json。
- 调整通知排序/未读等逻辑：修改 js/modules/activities.js。
- 调整侧边栏通知卡片样式：修改 css/style.css。

## 备注

- 当前画廊脚本统一为 gallery.js，避免双文件并存造成维护风险。
