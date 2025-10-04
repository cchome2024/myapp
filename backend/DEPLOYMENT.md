# Railway 部署指南

## 快速部署步骤

### 1. 通过 Railway 网站部署

1. 访问 [Railway](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. **重要**: 在 "Root Directory" 中设置为 `my-app/backend`
6. Railway 会自动检测到 `Dockerfile` 并构建

### 2. 环境变量设置

在 Railway 项目设置中添加以下环境变量:

```bash
PORT=8000
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
DATA_ROOT=data
```

### 3. 验证部署

部署完成后，访问:
- 健康检查: `https://your-project.railway.app/health`
- API 文档: `https://your-project.railway.app/docs`

## 使用 Railway CLI 部署

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 在 my-app/backend 目录下初始化
cd my-app/backend
railway init

# 部署
railway up
```

## 项目结构

```
my-app/backend/
├── app/                    # FastAPI 应用代码
│   ├── __init__.py
│   ├── main.py            # 主应用文件
│   ├── models.py          # 数据模型
│   ├── storage.py         # 存储工具
│   └── pipeline.py        # 处理管道
├── data/                  # 数据目录
│   └── projects/          # 项目数据
├── Dockerfile            # Docker 配置
├── requirements.txt      # Python 依赖
├── railway.json         # Railway 配置
├── Procfile            # 进程配置
└── README.md           # 说明文档
```

## 配置说明

### Dockerfile
- 基于 Python 3.11-slim
- 安装系统依赖 (gcc)
- 复制应用代码和数据
- 设置环境变量
- 暴露端口 8000

### Railway 配置
- 使用 Dockerfile 构建
- 健康检查路径: `/health`
- 自动重启策略
- 端口使用环境变量 `$PORT`

### 环境变量
- `PORT`: 服务端口 (默认 8000)
- `ALLOWED_ORIGINS`: 允许的 CORS 源
- `DATA_ROOT`: 数据根目录 (默认 data)

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Dockerfile 语法
   - 确认 requirements.txt 中的依赖版本

2. **启动失败**
   - 检查环境变量设置
   - 查看 Railway 日志

3. **CORS 错误**
   - 确认 `ALLOWED_ORIGINS` 设置正确
   - 包含前端域名

4. **数据访问错误**
   - 确认 `DATA_ROOT` 路径正确
   - 检查文件权限

### 日志查看

在 Railway 项目页面点击 "Logs" 标签查看实时日志。

## 更新部署

每次推送代码到 GitHub 后，Railway 会自动重新部署。

手动触发部署：
```bash
railway up
```
