@echo off
REM 设置环境变量
set PYTHONPATH=/app
set PYTHONUNBUFFERED=1

REM 创建数据目录
if not exist "data" mkdir data

REM 启动应用
uvicorn app.main:app --host 0.0.0.0 --port 8000
