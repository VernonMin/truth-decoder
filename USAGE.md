# 职场黑话翻译站 - 使用指南

## 🎉 项目已成功创建！

开发服务器正在运行：http://localhost:5173/

## 📋 已完成的功能

### ✅ 核心功能
- [x] 黑客帝国风格界面（黑黄配色）
- [x] 输入框（带字符计数）
- [x] 解密按钮（带加载动画）
- [x] 扫描线动画效果
- [x] 结果展示区域
  - 原文黑话显示
  - 人话翻译
  - PUA 等级（1-5星）
  - 老板心机拆解
  - 神回怼（高情商 + 发疯版）
- [x] 发疯回复解锁功能（模拟广告）
- [x] 海报生成功能
- [x] 移动端适配
- [x] 震动反馈（支持的设备）

### ✅ 视觉效果
- [x] 霓虹发光效果
- [x] 扫描线动画
- [x] 淡入/滑入动画
- [x] 脉冲效果
- [x] 震动动画
- [x] 响应式设计

### ✅ AI 配置
- [x] System Prompt 配置
- [x] Few-shot 示例
- [x] API 调用函数
- [x] 模拟数据生成

## 🚀 快速开始

### 1. 查看效果

打开浏览器访问：http://localhost:5173/

### 2. 测试功能

尝试输入以下职场黑话：
- "我们需要赋能业务，打造闭环"
- "这个项目的颗粒度要再细一点"
- "我们要对齐一下"
- "需要沉淀一下方法论"
- "打造生态闭环，提升颗粒度"

### 3. 体验流程

1. 在输入框中粘贴职场黑话
2. 点击"解密真相"按钮
3. 观看扫描动画（约2.5秒）
4. 查看翻译结果和 PUA 等级
5. 阅读老板心机分析
6. 查看高情商回复
7. 点击"观看广告解锁"查看发疯回复
8. 点击"生成爆火海报"下载分享图片
9. 点击"再来一个"继续测试

## 🔧 接入真实 AI

目前使用的是模拟数据。要接入真实 AI：

### 方法 1：使用 Anthropic Claude API

1. 获取 API Key：https://console.anthropic.com/

2. 在 `src/App.jsx` 中导入 AI 配置：

```javascript
import { callAI } from './config/aiPrompts';
```

3. 替换 `decodeJargon` 函数中的模拟调用：

```javascript
const decodeJargon = async (text) => {
  if (!text.trim()) return;

  setIsDecoding(true);
  setResult(null);

  try {
    // 使用真实 API
    const apiKey = 'YOUR_API_KEY_HERE'; // 或从环境变量读取
    const result = await callAI(text, apiKey);

    setResult({
      ...result,
      original: text,
      quote: VIRAL_QUOTES[Math.floor(Math.random() * VIRAL_QUOTES.length)]
    });
  } catch (error) {
    console.error('AI 调用失败:', error);
    alert('翻译失败，请重试');
  } finally {
    setIsDecoding(false);
    setShowUnlock(true);
  }
};
```

### 方法 2：使用环境变量

1. 创建 `.env` 文件：

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

2. 在代码中使用：

```javascript
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

## 📱 移动端测试

### 方法 1：使用手机访问

1. 确保手机和电脑在同一网络
2. 运行 `npm run dev -- --host`
3. 访问显示的 Network 地址

### 方法 2：使用浏览器开发者工具

1. 打开 Chrome DevTools (F12)
2. 点击设备模拟按钮
3. 选择移动设备型号

## 🎨 自定义配置

### 修改配色

编辑 `tailwind.config.js`：

```javascript
colors: {
  'neon-yellow': '#CCFF00',  // 主色
  'alert-red': '#FF3B30',    // 警示色
  'dark-bg': '#000000',      // 背景色
}
```

### 修改动画速度

编辑 `src/index.css` 中的动画时长。

### 修改 AI 提示词

编辑 `src/config/aiPrompts.js` 中的 `SYSTEM_PROMPT`。

### 添加更多金句

编辑 `src/App.jsx` 中的 `VIRAL_QUOTES` 数组。

## 🐛 常见问题

### Q: 海报生成失败？
A: 确保 `html-to-image` 已正确安装。某些浏览器可能有跨域限制。

### Q: 震动效果不工作？
A: 震动 API 仅在支持的移动设备上工作，且需要 HTTPS 或 localhost。

### Q: 样式没有生效？
A: 确保 Tailwind CSS 已正确配置，检查 `tailwind.config.js` 中的 content 路径。

### Q: 开发服务器启动失败？
A: 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`。

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录。

### 部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 部署到 Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 🎯 下一步优化

### 功能增强
- [ ] 接入真实 AI API
- [ ] 添加用户登录
- [ ] 实现每日黑话榜
- [ ] 添加点赞功能
- [ ] 历史记录保存
- [ ] 分享到社交媒体
- [ ] 添加音效

### 商业化
- [ ] 接入广告平台
- [ ] 实现付费解锁
- [ ] 会员订阅系统
- [ ] 数据统计分析

### 性能优化
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] CDN 加速
- [ ] PWA 支持

## 📞 技术支持

如有问题，请查看：
- 项目 README.md
- AI 配置文档：`src/config/aiPrompts.js`
- Tailwind 文档：https://tailwindcss.com/
- React 文档：https://react.dev/

---

**祝你使用愉快！工作是换钱的，不是换命的。**
