# 部署与运行手册

本文档用于在 Ubuntu 20.04 / 22.04 上部署并运行 DreamCraft 静态网站。

## 1. 环境要求

- 操作系统：Ubuntu 20.04 或 22.04
- Python：3.8 及以上（建议系统自带 python3）
- 浏览器：Chrome / Edge / Firefox 新版本

## 2. 项目目录要求

启动前请确认在项目根目录（包含 index.html）：

- index.html
- css/style.css
- js/modules
- data

## 3. 本机启动（仅本机访问）

```bash
cd /home/kee/web/mc-server-site
python3 -m http.server 8080 --bind 127.0.0.1
```

访问地址：<http://127.0.0.1:8080>

## 4. 局域网启动（其他电脑可访问）

```bash
cd /home/kee/web/mc-server-site
python3 -m http.server 8080 --bind 0.0.0.0
```

客户端访问：<http://服务器内网IP:8080>

## 5. 端口占用排查

```bash
ss -lntp | grep :8080
```

若 8080 被占用，改端口启动：

```bash
python3 -m http.server 8090 --bind 0.0.0.0
```

## 6. 防火墙放行（仅局域网访问需要）

```bash
sudo ufw allow 8080/tcp
sudo ufw status
```

## 7. 常见响应码说明

- 200：正常返回
- 304：缓存命中，不是错误
- 404：文件不存在，需要检查资源路径

说明：favicon.ico 的 404 一般不影响页面功能，本项目已在根目录提供 favicon.ico。

## 8. 静态资源缓存策略

本项目通过 query version 控制缓存更新，例如：

- css/style.css?v=20260427e
- js/modules/gallery.js?v=20260427h

修改 JS/CSS 后若未生效，更新 index.html 里的版本号并硬刷新浏览器。

## 9. 验证清单

启动后建议快速检查：

1. 首页能正常显示
2. 侧边栏导航能切页
3. 数据页（插件/文档/活动/画廊/更新日志）能加载
4. 画廊查看器能打开并切图
5. 浏览器控制台无红色报错

## 10. 可选后台运行

### 使用 nohup

```bash
cd /home/kee/web/mc-server-site
nohup python3 -m http.server 8080 --bind 0.0.0.0 > server.log 2>&1 &
```

查看日志：

```bash
tail -f /home/kee/web/mc-server-site/server.log
```

停止服务：

```bash
pkill -f "python3 -m http.server 8080"
```
