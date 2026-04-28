# 更新日志发布指南

本项目更新日志数据来源：data/changelog.json
渲染逻辑：js/modules/changelog.js

## 1. 新增一条更新日志

在 data/changelog.json 数组末尾新增一个对象：

```json
{
  "id": "changelog-006",
  "version": "1.3.2",
  "date": "2026-04-28",
  "type": "patch",
  "title": "🧹 稳定性修复",
  "content": "修复若干已知问题，优化页面渲染性能。",
  "author": "DreamMaster"
}
```

保存后刷新页面即可。

## 2. 字段说明

- id：唯一标识，建议格式 changelog-数字。
- version：版本号，如 1.3.2。
- date：日期，格式必须是 YYYY-MM-DD。
- type：版本类型，支持 major / minor / patch。
- title：版本标题。
- content：更新正文，支持换行（\n）。
- author：发布人。

## 3. 展示规则

- 列表按日期从旧到新排序。
- 最新一条会显示在顶部大卡（Hero）。
- 其他条目显示在“历史版本”。

## 4. 常见修改

### 修改类型文案

在 js/modules/changelog.js 中修改 badges 映射：

- major -> 大版本
- minor -> 小版本
- patch -> 修复

### 修改排序规则

当前排序逻辑：new Date(a.date) - new Date(b.date)

## 5. 注意事项

- date 格式错误会影响排序。
- id 不可重复。
- content 中若有多段内容，用 \n 分段。
- 若修改后页面无变化，检查 index.html 的资源版本参数。
