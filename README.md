# Node/Express API 模板（本地/Docker/Vercel/Cloud Run）

本仓库提供一个最小可运行的 Node.js/Express API，包含健康检查与简单的 `/notes` 示例接口（内存存储）。支持本地运行、Docker 构建，或一键部署到 Vercel；如需使用 GCP，也可推送到 Artifact Registry 并部署到 Cloud Run。数据库与前端将分阶段接入。

## 项目结构

```
.
├─ api/
│  ├─ health.js          # Vercel API 路由（/api/health）
│  └─ notes.js           # Vercel API 路由（/api/notes）
├─ Dockerfile
├─ README.md
├─ index.js
├─ package.json
└─ .dockerignore
```

## 本地运行

1) 安装依赖：

```
npm install
```

2) 启动服务：

```
npm start
```

3) 验证接口：

- 健康检查：`http://localhost:8080/health` → `{ ok: true }`
- 获取笔记：`GET http://localhost:8080/notes`
- 新建笔记：`POST http://localhost:8080/notes`，JSON Body: `{ "content": "Hello" }`

> 当前 `/notes` 使用内存存储，仅用于初期验证。接入数据库后会替换为真实持久化。

## 使用 Vercel 部署（推荐快速上线）

方式 A：命令行（需要安装 Vercel CLI）

1) 安装并登录：

```
npm i -g vercel
vercel login
```

2) 首次部署（按提示选择或输入项目名）：

```
vercel
```

3) 生产环境部署：

```
vercel --prod
```

部署完成后访问：
- 健康检查：`https://<your-project>.vercel.app/api/health`
- 笔记接口：`GET/POST https://<your-project>.vercel.app/api/notes`

方式 B：Vercel 控制台导入仓库（GitHub/GitLab/Bitbucket）
- 将本仓库推送到你的 Git 平台
- 在 Vercel 控制台 Import Project，使用默认设置即可
- 合并到 `main`（或选定分支）会自动触发部署

## Docker 构建与运行

1) 构建镜像：

```
docker build -t myapp:1.0 .
```

2) 运行容器：

```
docker run -p 8080:8080 myapp:1.0
```

3) 验证：同上访问 `http://localhost:8080/health`

## 推送到 Google Artifact Registry（可选）

准备工作：已安装并登录 gcloud，并设置项目：

```
gcloud auth login
gcloud config set project PROJECT_ID
```

启用与配置：

```
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create my-repo \
  --repository-format=docker \
  --location=asia-east1 \
  --description="Docker repo for my app"

gcloud auth configure-docker asia-east1-docker.pkg.dev
```

打标签并推送：

```
docker tag myapp:1.0 asia-east1-docker.pkg.dev/PROJECT_ID/my-repo/myapp:1.0
docker push asia-east1-docker.pkg.dev/PROJECT_ID/my-repo/myapp:1.0
```

## 部署到 Cloud Run（可选）

```
gcloud run deploy myapp \
  --image asia-east1-docker.pkg.dev/PROJECT_ID/my-repo/myapp:1.0 \
  --region=asia-east1 \
  --platform=managed \
  --allow-unauthenticated
```

部署成功后会返回公开 URL，例如：`https://myapp-xxxxx-asia-east1.run.app`

## 计划路线图

1) 最小 API 就绪（本地 + Docker）
2) Vercel 部署并验证线上接口
3) 接入数据库（推荐：Vercel Postgres / PlanetScale / Supabase；或 Cloud SQL + Prisma）
4) 前端应用托管（Vercel）并通过 `/api/**` 调用接口
5) 自定义域名与 HTTPS（Vercel 一键绑定）
6) CI/CD（Vercel 与 Git 集成自动部署）

## 常见问题

- 端口：Cloud Run 读取 `PORT` 环境变量（默认为 8080），本项目已兼容。
- ESM：本项目使用 ESM（`type: module`）。
- Prisma：后续接入时需要添加 `@prisma/client` 和 schema，并执行迁移。
