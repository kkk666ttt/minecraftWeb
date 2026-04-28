#!/bin/sh

# python:
cd ~/web/mc-server-site
python3 -m http.server 80 --bind 127.0.0.1

# Nginx
# 看 mc-server-site/README.md