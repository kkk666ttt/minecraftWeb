# DreamCraft 服务器网站

基于 Paper 1.21.4 的 Minecraft 服务器门户网站（纯静态站点）。

## 快速开始

### 本地开发（推荐 Python）

```bash
# 在项目根目录启动
cd mc-server-site/
python3 -m http.server 8080 --bind 127.0.0.1

# 访问 http://127.0.0.1:8080
```

> 不需要安装任何依赖，Python 自带 HTTP 服务器即可工作。
> 也可使用 VS Code Live Server 等插件。

### 生产部署（推荐 Nginx）

适用于云服务器正式上线，支持高性能并发、gzip 压缩、缓存控制。

```nginx
# /etc/nginx/sites-available/mcserver
server {
    listen 80;
    server_name mc.kkkttt1234.top;

    root /home/你的用户名/web/minecraft/mc-server-site;
    index index.html;

    gzip on;
    gzip_types text/html text/css application/javascript application/json;
    gzip_min_length 1024;

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(css|js)$ {
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(json|md)$ {
        expires -1;
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 启用站点
sudo ln -sf /etc/nginx/sites-available/mcserver /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 生产部署（Python 轻量方案）

不想装 Nginx 时可临时用 Python 跑：

```bash
cd ~/web/minecraft/mc-server-site

# 后台运行（关终端也不会停）
nohup python3 -m http.server 8080 --bind 0.0.0.0 > server.log 2>&1 &

# 查看运行状态
ps aux | grep http.server

# 停止服务
kill $(pgrep -f "http.server 8080")
```

### 通过 frp 内网穿透公网访问

如果云服务器没有公网 IP，可通过 frp（如樱花 frp）将域名流量转发到本地：

```
用户 → 你的域名 → frp 服务器 → 云服务器 frpc → localhost:80 → Nginx
```

frpc 配置示例（`frpc.toml`）：

```toml
[[proxies]]
name = "mcserver"
type = "http"
localPort = 80
localIp = "127.0.0.1"
customDomains = ["mc.kkkttt1234.top"]
```

### git 同步更新

```bash
# 本地修改后推送
git add -A && git commit -m "更新说明" && git push

# 服务器拉取
ssh 你的服务器
cd ~/web/minecraft/
git pull
# Nginx/Python 自动服务新文件，无需重启
```

> 不需要安装任何依赖，直接使用任意 HTTP 服务器托管静态文件即可。
> 推荐使用 Python 内置 HTTP 服务器、Nginx、或 VS Code Live Server 插件。

## 项目结构

```
mc-server-site/
├── index.html                 # 主入口页面（所有 JS/CSS 在此引用）
├── css/
│   └── style.css              # 全局样式表
├── data/                      # JSON 数据文件（所有内容数据）
│   ├── config.json            # 站点配置 & 导航菜单
│   ├── plugins.json           # 插件列表
│   ├── resourcepacks.json     # 资源包列表
│   ├── docs.json              # 服务器文档目录
│   ├── activities.json        # 活动通知
│   ├── gallery.json           # 游戏画廊
│   └── changelog.json         # 更新日志
├── js/
│   ├── lib/
│   │   └── marked.min.js      # Markdown 渲染库
│   ├── app.js                 # 主入口 + 添加功能步骤说明
│   └── modules/               # 功能模块（每个文件一个功能域）
│       ├── core.js            # 全局状态 App、工具函数、markdownToHtml()
│       ├── router.js          # 数据加载 loadData()、路由 navigateTo()/renderPage()
│       ├── init.js            # 启动入口 init()、导航、主题切换、规则弹窗
│       ├── home.js            # 首页英雄帖幻灯片
│       ├── plugins.js         # 插件列表 & 详情（异步 MD）
│       ├── resourcepacks.js   # 资源包列表 & 详情（异步 MD）
│       ├── docs.js            # 文档页 & TOC 导航
│       ├── activities.js      # 活动通知侧边栏/列表/详情
│       ├── changelog.js       # 更新日志 & 详情
│       ├── gallery.js         # 游戏画廊 & 图片查看器
│       └── qq-about.js        # QQ群 & 关于页面
├── docs/                      # Markdown 文档内容
│   ├── activities/            # 活动通知详细内容
│   ├── changelog/             # 更新日志详细内容
│   ├── plugins/               # 插件使用指南
│   ├── resourcepacks/         # 资源包介绍
│   ├── docs/                  # 服务器文档（非指南类）
│   └── howtoUse/              # 站点维护指南文档
│       ├── DATA_SCHEMA.md     # 数据字段规范
│       ├── ACTIVITIES_GUIDE.md # 活动通知发布指南
│       ├── PLUGINS_GUIDE.md   # 插件发布指南
│       ├── CHANGELOG_GUIDE.md # 更新日志发布指南
│       ├── GALLERY_GUIDE.md   # 画廊维护指南
│       ├── HOME_GUIDE.md      # 首页内容修改指南
│       ├── DEPLOYMENT_GUIDE.md # 部署手册
│       ├── MAINTENANCE_ARCHITECTURE.md # 架构说明与拓展规范
│       ├── RELEASE_CHECKLIST.md # 发布检查清单
│       ├── RELEASE_POLICY.md  # 发布策略
│       └── TROUBLESHOOTING.md # 故障排查
└── assets/
    └── images/
        └── gallery/
            └── selectedMoments/  # 画廊图片资源
```

## 核心架构

### 数据流

```
data/*.json  ──→  loadData()  ──→  App.xxx  ──→  render[Page]()  ──→ HTML
                                                           |
                                               (如有 path 字段)
                                                           |
                                                    fetch(.md)
                                                           |
                                              markdownToHtml()
                                                           |
                                                   渲染内容区
```

### 页面渲染流程

1. `init()` → `loadData()` → 所有 JSON 数据加载到 `App` 对象
2. `initNavigation()` → 生成侧边栏导航菜单
3. `navigateTo('home')` → 显示首页
4. 用户点击导航 → `navigateTo(pageId)` → `renderPage(pageId)`
5. 每个 `render[Page]()` 负责渲染对应页面

### JSON + MD 双源模式

列表数据存在 `data/*.json` 中，详情内容通过 `path` 字段指向 `.md` 文件。

## 模块职责

| 模块 | 文件 | 核心函数 | 数据源 |
|------|------|----------|--------|
| 核心 | core.js | markdownToHtml(), $(), $$() | — |
| 路由 | router.js | loadData(), navigateTo(), renderPage() | 全部 JSON |
| 启动 | init.js | init(), initNavigation(), toggleTheme() | config.json |
| 首页 | home.js | renderHome() | config, gallery |
| 插件 | plugins.js | renderPluginList(), openPluginDetail() | plugins.json + MD |
| 资源包 | resourcepacks.js | renderResourcepacks(), openRpDetail() | resourcepacks.json + MD |
| 文档 | docs.js | renderDocs(), showDoc(), scrollToHeading() | docs.json + MD |
| 活动 | activities.js | renderSidebarActivities(), renderActivitiesPage() | activities.json + MD |
| 日志 | changelog.js | renderChangelog(), openChangelogDetail() | changelog.json + MD |
| 画廊 | gallery.js | renderGallery(), openGalleryViewer() | gallery.json |
| 关于 | qq-about.js | renderQQGroup(), renderAbout() | config.json |

## 添加新功能

### 快速添加一个新页面

以添加"投票"页面为例：

**1. 创建数据文件 `data/votes.json`**

```json
[
  { "id": "vote-001", "title": "每周投票", "status": "进行中" }
]
```

**2. 创建 JS 模块 `js/modules/votes.js`**

```javascript
function renderVotes() {
  var container = document.getElementById('votes-content');
  if (!container) return;
  // 渲染逻辑...
}
```

**3. 注册路由** — 修改 `js/modules/router.js`

- 在 `loadData()` 中添加 `fetch('data/votes.json')` 和 `App.votes = ...`
- 在 `renderPage()` 中添加 `case 'votes': renderVotes(); break;`

**4. 添加 HTML 容器** — 在 `index.html` 中添加：

```html
<section class="page" id="page-votes">
  <div id="votes-content"></div>
</section>
```

**5. 添加脚本引用** — 在 `index.html` 末尾：

```html
<script src="js/modules/votes.js?v=20260427"></script>
```

**6. 添加导航项** — 在 `data/config.json` 的 `navigation` 中：

```json
{ "id": "votes", "label": "🗳️ 投票", "icon": "vote" }
```

**7. 添加 App 状态**（可选）— 在 `core.js` 的 `App` 对象中：

```javascript
const App = { /* ... */ votes: [] };
```

## 命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 渲染函数 | `render[Page]()` | `renderPluginList()`, `renderGallery()` |
| 打开详情 | `open[Detail]()` | `openPluginDetail()`, `openRpDetail()` |
| 关闭详情 | `close[Modal]()` | `closePluginModal()`, `closeRpModal()` |
| 过滤器 | `filter[Items]()` | `filterPlugins()`, `filterGallery_()` |
| 工具函数 | `[verb][Target]()` | `markAsRead()`, `scrollToHeading()` |
| CSS 类名 | `[page]-[element]` | `plugin-card`, `activities-grid` |
| JSON id | `[prefix]-[number]` | `act-001`, `gallery-002` |

## 维护指南

详细指南参见 `docs/howtoUse/` 目录。
