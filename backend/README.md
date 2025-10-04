# VibeCodingTest Backend

FastAPI 后端服务，用于 AI 学习助手项目。

## 本地开发

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 启动服务：
```bash
uvicorn app.main:app --reload --port 8000
```

## Railway 部署

### 1. 准备部署

确保以下文件存在：
- `Dockerfile` - Docker 配置
- `railway.json` - Railway 配置
- `Procfile` - 进程配置
- `requirements.txt` - Python 依赖

### 2. 环境变量

在 Railway 控制台设置以下环境变量：

```bash
PORT=8000
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
DATA_ROOT=data
```

### 3. 部署步骤

1. 连接 GitHub 仓库到 Railway
2. 选择 `my-app/backend` 目录作为根目录
3. 设置环境变量
4. 部署

### 4. 数据持久化

**重要**：Railway 的文件系统是临时的，重启后数据会丢失。

建议的解决方案：

1. **使用 Railway PostgreSQL**：
   - 添加 PostgreSQL 服务
   - 修改代码使用数据库存储

2. **使用外部存储**：
   - AWS S3
   - Google Cloud Storage
   - Railway Volumes（实验性）

3. **临时方案**：
   - 使用内存存储（重启后丢失）
   - 定期备份到外部服务

### 5. 健康检查

Railway 会自动检查 `/health` 端点。

### 6. 日志

在 Railway 控制台查看应用日志。

## API 端点

- `GET /health` - 健康检查
- `POST /projects/{project_id}/start` - 开始项目生成
- `GET /projects/{project_id}/status` - 获取项目状态
- `POST /projects/{project_id}/upload` - 上传文件
- `GET /projects/{project_id}/files/{path}` - 获取文件
- `GET /api/projects` - 获取项目列表
- `PUT /api/projects/{project_id}` - 更新项目

## 注意事项

1. **CORS 配置**：生产环境请设置正确的 `ALLOWED_ORIGINS`
2. **数据持久化**：Railway 文件系统是临时的
3. **资源限制**：注意 Railway 的 CPU 和内存限制
4. **日志监控**：定期检查应用日志
