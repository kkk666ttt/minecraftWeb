# 插件列表发布与修改指南

本项目插件数据来源：data/plugins.json
渲染逻辑：js/modules/plugins.js

## 1. 新增一个插件

在 data/plugins.json 数组末尾新增对象：

```json
{
  "id": "placeholderapi",
  "name": "PlaceholderAPI",
  "icon": "🧩",
  "version": "2.11.6",
  "description": "变量占位符扩展插件",
  "author": "PlaceholderAPI Team",
  "category": "核心",
  "commands": [
    { "cmd": "/papi ecloud list", "desc": "查看扩展列表" }
  ],
  "usage": "### PlaceholderAPI 使用指南\n\n用于给其他插件提供变量支持。"
}
```

保存后刷新页面即可。

## 2. 字段说明

- id：唯一标识，建议使用英文小写。
- name：插件名称。
- icon：显示在卡片左上角的 emoji。
- version：插件版本号。
- description：插件简介。
- author：作者。
- category：分类。建议使用 核心 / 管理 / 玩法 / 生存 / 经济。
- commands：指令数组。每项包含 cmd 和 desc。
- usage：详情页使用说明，支持 Markdown。

## 3. 搜索与筛选规则

- 分类筛选来自 category 去重结果。
- 搜索匹配 name、description、author。
- 分类 + 搜索会叠加生效。

## 4. 常见修改

### 修改分类颜色映射

在 js/modules/plugins.js 中 catMap 修改分类到 CSS 类映射。

### 增加详情页信息字段

在 data/plugins.json 新增字段后，需要同步修改：

- js/modules/plugins.js 的 renderPluginCards
- js/modules/plugins.js 的 renderPluginDetail

## 5. 注意事项

- id 不能重复，否则详情弹窗定位会出错。
- commands 建议至少保留 1 条，避免空表格体验不佳。
- usage 建议使用 Markdown 标题和列表，阅读体验更好。
- category 如果使用新值，可能需要补对应样式类。
