# 数据字段规范

本文档定义 data 目录下核心 JSON 的字段结构与约束。

## 1. 通用规范

- 文件编码：UTF-8
- 日期格式：YYYY-MM-DD
- id 必须全局唯一（在各自文件内）
- JSON 不允许注释，不允许尾逗号

## 2. data/activities.json

### 对象结构

- id: string，示例 act-001
- title: string
- date: string（YYYY-MM-DD）
- type: string（活动/比赛/公告/更新）
- priority: string（high/normal/low）
- pinned: boolean
- expired: boolean
- content: string
- author: string
- images: array
- link: string|null

### images 子项

- url: string
- alt: string
- caption: string（可选）

## 3. data/changelog.json

### 对象结构

- id: string，示例 changelog-001
- version: string，示例 1.3.2
- date: string（YYYY-MM-DD）
- type: string（major/minor/patch）
- title: string
- content: string
- author: string

## 4. data/plugins.json

### 对象结构

- id: string
- name: string
- icon: string（emoji）
- version: string
- description: string
- author: string
- category: string（核心/管理/玩法/生存/经济）
- commands: array
- usage: string（Markdown）

### commands 子项

- cmd: string
- desc: string

## 5. data/gallery.json

### 对象结构

- id: string，示例 gallery-010
- src: string（大图）
- thumbnail: string（缩略图）
- title: string
- description: string
- author: string
- date: string（YYYY-MM-DD）
- tags: array<string>
- featured: boolean

### 展示规则

- featured=true：进入顶部精选滚动
- featured=false：进入下方网格
- 标签按钮来自全部项的 tags 去重

## 6. data/config.json

该文件主要用于：

- 站点基础配置
- 导航结构
- 展示文本

修改导航时，需确保对应 page id 在 router.js 中存在渲染逻辑。

## 7. 数据变更建议流程

1. 先复制旧记录再改，避免漏字段
2. 保存后检查 JSON 格式
3. 刷新页面验证展示
4. 若未生效，检查缓存版本参数
