# 首页内容修改指南

本文档说明如何修改首页内容，包括Hero区域、特色功能、画廊预览等。

## 1. 首页结构总览

首页采用全屏堆叠卡片设计，包含4个主要区域：

1. **Hero区域** - 服务器介绍、IP地址、统计信息
2. **特色功能** - 服务器主要特色展示
3. **画廊预览** - 最新6张画廊图片
4. **快速开始** - 导航到其他页面的快捷入口

## 2. 修改服务器基本信息

### 服务器名称和版本

位置：`data/config.json`

```json
{
  "name": "DreamCraft 服务器",
  "version": "1.0.0",
  "mcVersion": "1.21.11",
  "serverType": "Paper"
}
```

- `name`: 显示在Hero标题中的服务器名称
- `mcVersion`: 显示在统计信息中的游戏版本
- `serverType`: 显示在统计信息中的服务端类型

### 服务器IP地址

位置：`data/config.json`

```json
{
  "serverIp": "play.dreamcraft.com",
  "serverIpHidden": true,
  "accessPassword": "admin123"
}
```

- `serverIp`: 服务器IP地址
- `serverIpHidden`: 是否隐藏IP（需要通行证验证）
- `accessPassword`: 通行证密码

## 3. 修改Hero区域内容

### Hero背景图片

位置：`js/modules/home.js` 第13-15行

```javascript
<div class="stack-hero-slide" style="background-image:url(assets/images/gallery/spawn-city.jpg)"></div>
<div class="stack-hero-slide" style="background-image:url(assets/images/gallery/build-contest.jpg)"></div>
<div class="stack-hero-slide" style="background-image:url(assets/images/gallery/group-photo.jpg)"></div>
```

修改说明：
1. 替换图片路径为 `assets/images/gallery/` 下的其他图片
2. 建议使用高分辨率图片（至少1920x1080）
3. 图片会自动轮播显示

### Hero文字内容

位置：`js/modules/home.js` 第18-21行

```javascript
<div class="stack-badge">DreamCraft 服务器</div>
<h1 class="stack-title">欢迎来到<br><span class="stack-gold">${cfg.name}</span></h1>
<p class="stack-sub">一个纯净、公平、有温度的 Minecraft 社区</p>
```

修改说明：
- `stack-badge`: 服务器标识徽章
- `stack-title`: 主标题（支持HTML换行）
- `stack-sub`: 副标题描述

## 4. 修改特色功能

位置：`data/config.json`

```json
"features": [
  "纯净原版生存体验",
  "完善的商店经济",
  "领地保护系统",
  "可tpa的好友系统",
  "8~24时稳定运行"
]
```

修改说明：
1. 每个特色都会生成一个卡片
2. 卡片数量会自动适应布局
3. 文字会显示在卡片标题和描述中

## 5. 修改画廊预览

画廊预览自动显示 `data/gallery.json` 中的前6个项目：

```json
[
  {
    "id": "gallery-001",
    "title": "出生点城市",
    "author": "管理员",
    "date": "2024-01-01",
    "thumbnail": "assets/images/gallery/spawn-city.jpg",
    "tags": ["城市", "建筑"]
  }
]
```

修改说明：
- 预览显示最新的6张图片（按数组顺序）
- 点击卡片会跳转到完整画廊页面
- 确保 `thumbnail` 路径正确

## 6. 修改快速开始卡片

位置：`js/modules/home.js` 第85-102行

当前包含4个固定卡片：
- 🔌 浏览插件 → 插件列表页
- 📚 阅读文档 → 文档页
- 💬 加入Q群 → QQ群页
- 📋 更新日志 → 更新日志页

修改说明：
1. 可以修改图标、标题、描述
2. 可以更改跳转目标页面
3. 使用 `navigateTo('page-id')` 跳转

## 7. 修改统计信息

位置：`js/modules/home.js` 第29-33行

```javascript
<div class="stack-stats">
  <div class="stack-stat"><span class="stack-stat-n">${cfg.mcVersion}</span><span class="stack-stat-l">游戏版本</span></div>
  <span class="stack-stat-dot"></span>
  <div class="stack-stat"><span class="stack-stat-n">${App.plugins.length}</span><span class="stack-stat-l">功能插件</span></div>
  <span class="stack-stat-dot"></span>
  <div class="stack-stat"><span class="stack-stat-n">${cfg.serverType}</span><span class="stack-stat-l">服务端核心</span></div>
</div>
```

修改说明：
- 游戏版本：来自 `config.json` 的 `mcVersion`
- 功能插件：自动统计 `data/plugins.json` 的项目数量
- 服务端核心：来自 `config.json` 的 `serverType`

## 8. 样式调整

如果需要调整首页样式，修改 `css/style.css` 中的以下类：

- `.stack-hero`: Hero区域样式
- `.stack-section`: 内容区域样式
- `.stack-card`: 卡片样式
- `.stack-stats`: 统计信息样式

## 9. 发布检查清单

修改首页内容后，请检查：

- [ ] 所有图片路径是否存在
- [ ] JSON格式正确（无语法错误）
- [ ] 文字内容合适，无敏感信息
- [ ] 在不同设备上预览效果
- [ ] 链接跳转正常工作
- [ ] 更新 index.html 中的版本参数（如果修改了JS/CSS）

## 10. 常见问题

**Q: 修改后首页不显示新内容？**
A: 检查浏览器缓存，尝试硬刷新（Ctrl+F5）或清除缓存。

**Q: Hero背景图片不显示？**
A: 确认图片路径正确，文件存在于 `assets/images/gallery/` 目录。

**Q: 特色功能卡片显示不正常？**
A: 检查 `config.json` 中的 `features` 数组格式是否正确。

**Q: 画廊预览显示空白？**
A: 检查 `data/gallery.json` 是否有数据，`thumbnail` 路径是否正确。