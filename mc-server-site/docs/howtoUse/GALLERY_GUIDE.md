# 游戏画廊发布图片指南

本项目画廊数据来源：data/gallery.json
渲染逻辑：js/modules/gallery.js

## 1. 发布图片流程

1. 把图片放到 assets/images/gallery/ 目录。
2. 在 data/gallery.json 新增一条记录。
3. 刷新页面，在“游戏画廊”查看展示效果。

## 2. 新增记录模板

```json
{
  "id": "gallery-010",
  "src": "assets/images/gallery/new-screenshot.jpg",
  "thumbnail": "assets/images/gallery/new-screenshot.jpg",
  "title": "🌄 新景点截图",
  "description": "玩家在新开放区域拍摄的景观图。",
  "author": "PlayerName",
  "date": "2026-04-28",
  "tags": ["建筑", "活动"],
  "featured": false
}
```

## 3. 字段说明

- id：唯一标识，建议 gallery-数字。
- src：大图路径（查看器打开的图片）。
- thumbnail：缩略图路径（列表卡片显示）。
- title：图片标题。
- description：图片描述。
- author：上传者/投稿者名称。
- date：日期，格式 YYYY-MM-DD。
- tags：标签数组，用于下方筛选按钮。
- featured：是否进入顶部“精选时刻”横向滚动区。

## 4. 推荐图片规范

- 建议比例：16:9 或接近横图比例。
- 建议尺寸：1920x1080 或 1280x720。
- 文件格式：jpg / png / webp。
- 文件命名：英文小写 + 连字符，例如 spawn-city-2.jpg。

## 5. 精选与普通展示规则

- featured=true：显示在顶部精选横向滚动区。
- featured=false：显示在下方“最新发布”网格区。
- 标签按钮来自全部数据的 tags 去重集合。

## 6. 常见问题

### 图片不显示

- 检查 src 和 thumbnail 路径是否正确。
- 确认图片文件已放到 assets/images/gallery/。

### 标签筛选没有出现

- 请先确认该标签实际写在 tags 数组里，且没有错别字。
- 如标签存在但未显示，尝试硬刷新浏览器以排除缓存影响。

### 修改后没生效

- 先硬刷新浏览器。
- 如仍未生效，检查 index.html 资源版本参数是否需要更新。
