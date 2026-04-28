# 资源包发布指南

资源包数据存储在 `data/resourcepacks.json`，详情内容通过 `path` 字段指向 `docs/resourcepacks/` 下的 Markdown 文件。

## 1. 添加新资源包

编辑 `data/resourcepacks.json`，添加新的对象：

```json
{
  "id": "rp-xxx",
  "name": "资源包名称",
  "icon": "🎨",
  "version": "1.21.4",
  "description": "简短描述（列表页显示）",
  "author": "作者名称",
  "category": "美化优化",
  "path": "docs/resourcepacks/xxx.md",
  "features": ["功能1", "功能2"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，以 `rp-` 开头 |
| name | string | 是 | 资源包名称 |
| icon | string | 是 | 一个 emoji |
| version | string | 是 | 兼容的 MC 版本 |
| description | string | 是 | 列表页显示的简介 |
| author | string | 是 | 作者 |
| category | string | 是 | 分类：`美化优化` / `辅助工具` |
| path | string | 是 | 指向 `docs/resourcepacks/xxx.md` |
| features | array | 否 | 功能标签，显示在卡片上 |

## 2. 创建详情文档

在 `docs/resourcepacks/` 下创建对应的 `.md` 文件，例如 `docs/resourcepacks/xxx.md`：

```markdown
# 资源包名称

## 简介

简要介绍资源包。

## 功能特性

- 特性 1
- 特性 2

## 安装方法

1. 下载资源包
2. 放入 resourcepacks 文件夹
3. 在游戏中启用
```

## 3. 注意事项

- `id` 必须唯一
- `category` 只能是已有分类之一，或新增后需同步添加 CSS 样式
- 支持 Markdown 语法：标题、列表、表格、代码块、图片、链接
- 详情页会自动为图片添加点击放大功能
