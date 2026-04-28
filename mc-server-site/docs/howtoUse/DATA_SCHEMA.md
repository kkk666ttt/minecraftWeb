# 数据字段规范

本文档定义 data 目录下核心 JSON 的字段结构与约束。

## 1. 通用规范

- 文件编码：UTF-8
- 日期格式：YYYY-MM-DD
- id 必须全局唯一（在各自文件内）
- JSON 不允许注释，不允许尾逗号
- 所有详情内容通过 `path` 字段指向 `.md` 文件，不再内联存储大段 Markdown

## 2. data/activities.json

### 对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，示例 `act-001` |
| title | string | 是 | 通知标题 |
| summary | string | 否 | 列表页显示的简短摘要 |
| date | string | 是 | 日期，YYYY-MM-DD |
| type | string | 是 | 分类：`活动` / `比赛` / `公告` / `更新` |
| priority | string | 是 | 优先级：`high` / `medium` / `low` |
| pinned | boolean | 是 | 是否置顶 |
| expired | boolean | 是 | 是否过期 |
| path | string | 是 | 指向 `docs/activities/xxx.md` |
| author | string | 是 | 发布者 |

## 3. data/changelog.json

### 对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，示例 `changelog-001` |
| version | string | 是 | 版本号，示例 `1.3.2` |
| date | string | 是 | 日期，YYYY-MM-DD |
| type | string | 是 | 类型：`major` / `minor` / `patch` |
| title | string | 是 | 版本标题 |
| path | string | 是 | 指向 `docs/changelog/vX.X.X.md` |
| author | string | 是 | 作者 |

## 4. data/plugins.json

### 对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识 |
| name | string | 是 | 插件名称 |
| icon | string | 是 | emoji 图标 |
| version | string | 是 | 版本号 |
| description | string | 是 | 简短描述 |
| author | string | 是 | 作者 |
| category | string | 是 | 分类：`核心` / `管理` / `玩法` / `生存` / `经济` / `开发工具` |
| path | string | 是 | 指向 `docs/plugins/xxx.md` |
| commands | array | 是 | 指令列表 |

### commands 子项

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cmd | string | 是 | 指令，如 `/home` |
| desc | string | 是 | 指令说明 |

## 5. data/resourcepacks.json

### 对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，示例 `rp-xxx` |
| name | string | 是 | 资源包名称 |
| icon | string | 是 | emoji 图标 |
| version | string | 是 | 兼容版本 |
| description | string | 是 | 简短描述 |
| author | string | 是 | 作者/团队 |
| category | string | 是 | 分类：`美化优化` / `辅助工具` |
| path | string | 是 | 指向 `docs/resourcepacks/xxx.md` |
| features | array | 否 | 功能标签列表 |

## 6. data/gallery.json

### 对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，示例 `gallery-010` |
| src | string | 是 | 大图路径 |
| thumbnail | string | 是 | 缩略图路径 |
| title | string | 是 | 标题 |
| description | string | 是 | 描述 |
| author | string | 是 | 拍摄者/作者 |
| date | string | 是 | 日期，YYYY-MM-DD |
| tags | array | 是 | 标签列表 |
| featured | boolean | 是 | 是否精选 |

### 展示规则

- `featured=true`：进入顶部精选滚动区
- `featured=false`：进入下方网格区
- 标签按钮来自全部项的 `tags` 去重

## 7. data/config.json

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 站点名称 |
| version | string | 是 | 站点版本 |
| navigation | array | 是 | 导航菜单项列表 |
| serverIp | string | 是 | 服务器 IP |
| features | array | 否 | 服务器特色列表 |

### navigation 子项

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 页面 id，需与 router.js 中的 case 一致 |
| label | string | 是 | 导航显示文字 |
| icon | string | 是 | 图标名称（暂未使用） |

修改导航时，需确保对应 `page id` 在 `router.js` 中存在渲染逻辑。

## 8. path 字段说明

所有支持 `path` 字段的模块（activities、plugins、resourcepacks、changelog、docs）都采用以下模式：

```json
{
  "id": "xxx",
  "title": "...",
  "path": "docs/xxx/xxx.md"
}
```

- `path` 是相对于 `index.html` 所在目录的路径
- `.md` 文件将被 `fetch()` 异步加载，通过 `markdownToHtml()` 渲染
- 渲染后自动支持：图片点击放大、代码块滚动、表格样式

## 9. 数据变更建议流程

1. 先复制旧记录再改，避免漏字段
2. 保存后检查 JSON 格式
3. 如果涉及 `path`，确认对应的 `.md` 文件存在
4. 刷新页面验证展示
5. 若未生效，检查 `index.html` 中脚本的版本参数（`?v=20260427`）
