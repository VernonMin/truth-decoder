# 部署指南 - Cloudflare Pages

## 前置准备

1. **Cloudflare 账号**：https://dash.cloudflare.com/
2. **GitHub 仓库**：将代码推送到 GitHub
3. **Gemini API Key**：https://aistudio.google.com/apikey
4. **面包多账号**（可选）：https://mianbaoduo.com/

---

## 步骤 1：创建 KV Namespace 和 D1 Database

在项目目录下运行：

```bash
# 创建 KV namespace（用于支付 session）
wrangler kv:namespace create PAY_SESSIONS

# 创建 D1 database（用于日志）
wrangler d1 create truth-decoder-db
```

记录输出的 ID，更新 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "PAY_SESSIONS"
id = "YOUR_KV_ID_HERE"              # 替换为实际 ID
preview_id = "YOUR_KV_PREVIEW_ID"   # 替换为实际 preview ID

[[d1_databases]]
binding = "DB"
database_name = "truth-decoder-db"
database_id = "YOUR_D1_ID_HERE"     # 替换为实际 ID
```

---

## 步骤 2：初始化 D1 数据库

```bash
# 本地测试
npm run db:migrate:local

# 生产环境
npm run db:migrate
```

---

## 步骤 3：推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit: Next.js + Cloudflare Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/truth-decoder.git
git push -u origin main
```

---

## 步骤 4：连接 Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库
4. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| Framework preset | Next.js |
| Build command | `npx @cloudflare/next-on-pages@1` |
| Build output directory | `.vercel/output/static` |
| Root directory | `/` |

5. 点击 **Save and Deploy**

---

## 步骤 5：配置环境变量

在 Cloudflare Pages 项目设置中：

1. 进入 **Settings** → **Environment variables**
2. 添加以下变量（Production + Preview）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | Node.js 版本 |
| `GEMINI_API_KEY` | `YOUR_GEMINI_KEY` | Gemini API 密钥 |
| `MIANBAODUO_WEBHOOK_SECRET` | `YOUR_SECRET` | 面包多 Webhook 密钥（可选） |
| `MIANBAODUO_APP_ID` | `YOUR_APP_ID` | 面包多应用 ID（可选） |

---

## 步骤 6：绑定 KV 和 D1

1. 进入 **Settings** → **Functions** → **KV namespace bindings**
2. 添加绑定：

| Variable name | KV namespace |
|---------------|--------------|
| `PAY_SESSIONS` | 选择你创建的 KV namespace |

3. 进入 **Settings** → **Functions** → **D1 database bindings**
4. 添加绑定：

| Variable name | D1 database |
|---------------|-------------|
| `DB` | 选择 `truth-decoder-db` |

---

## 步骤 7：触发重新部署

绑定 KV/D1 后，需要重新部署：

1. 进入 **Deployments** 页面
2. 点击最新部署右侧的 **⋯** → **Retry deployment**

或者推送新的 commit 触发自动部署。

---

## 步骤 8：验证部署

访问你的 Cloudflare Pages URL（例如 `https://truth-decoder.pages.dev`），测试：

1. 输入职场黑话，点击"解密真相"
2. 查看翻译结果
3. 检查浏览器控制台是否有错误

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（模拟 Cloudflare 环境）
npm run dev

# 访问 http://localhost:3000
```

**注意**：本地开发需要在 `.dev.vars` 文件中配置 API Key：

```
GEMINI_API_KEY=your_gemini_api_key_here
MIANBAODUO_WEBHOOK_SECRET=your_secret_here
MIANBAODUO_APP_ID=your_app_id_here
```

---

## 常见问题

### Q: 构建失败，提示 "Module not found"
A: 确保 `NODE_VERSION=20` 已设置，并且 `package.json` 中有 `"type": "module"`

### Q: API 调用返回 502
A: 检查 `GEMINI_API_KEY` 是否正确配置，并且 KV/D1 绑定已生效

### Q: 本地开发无法访问 KV/D1
A: 确保 `wrangler.toml` 中配置了 `preview_id`，并且运行了 `npm run dev`（会自动调用 `setupDevPlatform()`）

### Q: 面包多 Webhook 验签失败
A: 当前实现使用 SHA-256，面包多实际使用 MD5。生产环境需要使用第三方 MD5 库（Web Crypto API 不支持 MD5）

---

## 下一步

- [ ] 配置自定义域名
- [ ] 接入真实广告 SDK
- [ ] 实现付费解锁功能
- [ ] 添加数据分析（Cloudflare Analytics）
- [ ] 优化 SEO（meta tags、sitemap）

---

**工作是换钱的，不是换命的。**
