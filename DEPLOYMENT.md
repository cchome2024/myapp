# Railway + Vercel 部署指南

## 问题：线上部署还在访问 /mock/projects

### 原因分析
1. 前端没有设置 `NEXT_PUBLIC_API_BASE` 环境变量
2. 前端代码回退到 `http://localhost:8000`
3. 本地后端没有运行，导致请求失败

### 解决方案

#### 1. 获取 Railway 后端 URL

1. 登录 [Railway](https://railway.app)
2. 选择你的后端项目
3. 在项目页面找到 **Public URL** 或 **Domain**
4. 复制完整的 URL，例如：`https://your-project-name.railway.app`

#### 2. 在 Vercel 设置环境变量

1. 登录 [Vercel](https://vercel.com)
2. 选择你的前端项目
3. 进入 **Settings** → **Environment Variables**
4. 添加变量：
   - **Name**: `NEXT_PUBLIC_API_BASE`
   - **Value**: `https://your-project-name.railway.app`（替换为你的实际 Railway URL）
   - **Environment**: 选择 Production, Preview, Development

#### 3. 重新部署前端

设置环境变量后，重新部署：

```bash
# 触发重新部署
git commit --allow-empty -m "trigger redeploy with railway backend"
git push
```

#### 4. 验证部署

部署完成后验证：

1. 访问你的 Vercel 前端 URL
2. 打开浏览器开发者工具 → **Network** 标签
3. 刷新页面，检查请求：
   - ✅ 应该看到请求指向 `https://your-project-name.railway.app`
   - ❌ 不应该看到 `localhost:8000` 或 `/mock/projects`

#### 5. 本地开发设置

创建 `.env.local` 文件：

```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Railway 后端部署检查

确保后端在 Railway 上正常运行：

1. **检查 Railway 项目状态**
   - 项目应该显示 "Deployed" 状态
   - 检查日志确保没有错误

2. **测试后端 API**
   ```bash
   curl https://your-project-name.railway.app/health
   ```
   应该返回：`{"ok":true}`

3. **检查环境变量**
   - Railway 项目 → **Variables** 标签
   - 确保设置了必要的环境变量

### 常见问题

#### Q: 为什么还是访问 localhost:8000？
A: Vercel 环境变量没有正确设置，检查：
- 变量名是否正确：`NEXT_PUBLIC_API_BASE`
- 是否选择了正确的环境（Production/Preview/Development）
- 是否重新部署了项目

#### Q: 如何确认环境变量已生效？
A: 在浏览器控制台执行：
```javascript
console.log(process.env.NEXT_PUBLIC_API_BASE)
```

#### Q: Railway 后端无法访问？
A: 检查：
- Railway 项目是否部署成功
- 是否有正确的环境变量
- 网络连接是否正常

#### Q: CORS 错误？
A: 在 Railway 后端设置环境变量：
```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 完整部署流程

1. **部署后端到 Railway**
   ```bash
   # 1. 连接 GitHub 仓库到 Railway
   # 2. 选择 my-app/backend 目录
   # 3. 设置环境变量：
   #    - PORT=8000
   #    - ALLOWED_ORIGINS=https://your-frontend.vercel.app
   # 4. 等待部署完成
   # 5. 获取 Public URL
   ```

2. **部署前端到 Vercel**
   ```bash
   # 1. 连接 GitHub 仓库到 Vercel
   # 2. 选择 my-app 目录
   # 3. 设置环境变量：
   #    - NEXT_PUBLIC_API_BASE=https://your-backend.railway.app
   # 4. 部署
   ```

3. **测试完整流程**
   - 访问前端 URL
   - 检查网络请求
   - 测试项目创建、生成等功能

### 调试技巧

1. **检查网络请求**
   - 开发者工具 → Network
   - 查看请求 URL 和状态码

2. **检查控制台错误**
   - 开发者工具 → Console
   - 查看 JavaScript 错误

3. **检查环境变量**
   - 在浏览器控制台打印环境变量值

4. **检查后端日志**
   - Railway 项目 → Deployments → 查看日志
