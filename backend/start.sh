#!/bin/bash

# 设置环境变量
export PYTHONPATH=/app
export PYTHONUNBUFFERED=1

# 创建数据目录
mkdir -p /app/data

# 启动应用
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
