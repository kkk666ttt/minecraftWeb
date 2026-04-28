#!/bin/sh

# Python 快速部署验证脚本
# 适用场景：frp（樱花隧道）监听本地 80 端口做 http 转发
# 域名 → frp.fit.com → frpc → 127.0.0.1:80 → Python http.server

# 停止旧服务
# frp 的 frpc 不占用 80 端口，fuser -k 80 不会影响 frp
fuser -k 80/tcp 2>/dev/null
sleep 1

# 本地测试进入项目目录并启动
cd ~/web/minecraftWeb/mc-server-site
python3 -m http.server 8080 --bind 127.0.0.1

# Nginx
# 看 mc-server-site/README.md

# 更新内容
# cd ~/web/minecraftWeb/
# git pull


# sudo systemctl status nginx     # 查看 Nginx 运行状态
# sudo systemctl reload nginx     # 重载配置（不改端口时用这个）
# sudo systemctl restart nginx    # 重启 Nginx
# sudo nginx -t                   # 测试配置语法
# sudo tail -30 /var/log/nginx/error.log   # 看错误日志