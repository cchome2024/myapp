# FastAPI Backend

这是 AI 学习助手的后端服务，使用 FastAPI 构建。

## 部署到 Railway

### 方法 1: 使用 Railway CLI

1. 安装 Railway CLI:
```bash
npm install -g @railway/cli
```

2. 登录 Railway:
```bash
railway login
```

3. 在 `my-app/backend` 目录下初始化项目:
```bash
cd my-app/backend
railway init
```

4. 部署:
```bash
railway up
```

### 方法 2: 通过 Railway 网站

1. 访问 [Railway](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. **重要**: 在 "Root Directory" 中设置为 `my-app/backend`
6. Railway 会自动检测到 `Dockerfile` 并构建

### 环境变量设置

在 Railway 项目设置中添加以下环境变量:

```bash
PORT=8000
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
DATA_ROOT=data
```

### 验证部署

部署完成后，访问:
- 健康检查: `https://your-project.railway.app/health`
- API 文档: `https://your-project.railway.app/docs`

## 本地开发

```bash
cd my-app/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API 端点

- `GET /health` - 健康检查
- `GET /docs` - API 文档
- `POST /projects/{project_id}/start` - 开始项目处理
- `GET /projects/{project_id}/status` - 获取项目状态
- `GET /api/projects` - 获取所有项目
- `PUT /api/projects/{project_id}` - 更新项目