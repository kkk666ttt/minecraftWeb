# 活动通知维护指南

本项目的通知数据来源于 data/activities.json，页面渲染逻辑在 js/modules/activities.js。

## 1. 如何新增一条通知

在 data/activities.json 数组末尾新增一个对象，字段建议如下：

```json
{
  "id": "act-007",
  "title": "🎁 端午签到活动开启",
  "date": "2026-06-08",
  "type": "活动",
  "priority": "high",
  "pinned": false,
  "expired": false,
  "content": "活动期间每日签到可领取限定奖励，连续签到7天可获得纪念称号。",
  "author": "DreamMaster",
  "images": [
    {
      "url": "assets/images/act-dragonboat.png",
      "alt": "端午活动海报",
      "caption": "端午限时签到活动"
    }
  ],
  "link": null
}
```

保存后刷新页面即可。

## 2. 字段说明

- id: 唯一 ID，不能重复，建议 act-数字。
- title: 通知标题，支持 emoji。
- date: 日期，格式必须是 YYYY-MM-DD，用于排序。
- type: 分类标签，推荐用 活动 / 比赛 / 公告 / 更新。
- priority: 优先级，支持 high / normal / low。
- pinned: 是否常驻置顶（true 会排在最前）。
- expired: 是否过期（true 会进入“已过期”分组）。
- content: 正文内容。
- author: 发布人。
- images: 图片数组，可为空 []。
- link: 预留字段，不用可写 null。

## 3. 常见修改场景

### 修改侧边栏显示数量

默认显示前 5 条，可在 js/modules/activities.js 中搜索 slice(0, 5) 并修改。

### 修改排序规则

当前按 date 倒序显示，可在 js/modules/activities.js 中找到：

- new Date(b.date) - new Date(a.date)

改为升序或其他规则。

### 修改未读逻辑

已读状态保存在浏览器 localStorage 的 readActivities 键中。

- 想重置未读：清空浏览器 localStorage（或删除 readActivities）。
- 代码位置：js/modules/activities.js 的 markAsRead 和 markAllAsRead。

## 4. 注意事项

- JSON 不能有注释，最后一项后面不能多逗号。
- id 不能重复，否则已读状态和详情跳转会异常。
- date 请保持标准格式，否则排序可能不准确。
- 图片路径建议放在 assets/images 下。

## 5. 推荐发布流程

1. 先复制一条旧通知并修改字段。
2. 检查 JSON 格式是否正确。
3. 刷新页面查看侧边栏和活动详情页。
4. 如未生效，检查 index.html 的 JS/CSS 版本参数是否需要更新。
