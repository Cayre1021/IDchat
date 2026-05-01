# IDchat

对话式 AI 聊天应用，Telegram 风格移动端优先的纯前端网页。

支持接入多种 AI API（DeepSeek、OpenAI、Anthropic），自定义 AI 角色，多组 API 配置管理。

## 功能

- **聊天列表** — Telegram 风格聊天预览，搜索、置顶、长按/右键菜单
- **AI 对话** — Streaming 逐字输出、Markdown 渲染（代码块 + 横向滚动条、表格、内联代码）、引用回复、转发、删除、对话内搜索
- **角色管理** — 创建/编辑 AI 角色，头像颜色、AI 模型绑定、角色设定（System Prompt）、对话风格
- **API 配置** — 多组 API 密钥管理，支持 OpenAI 兼容协议和 Anthropic 协议
- **主题切换** — 7 套主题（跟随系统、默认蓝、暗夜黑、午夜蓝、玫瑰粉、薄荷绿、日落橙）
- **数据管理** — 导出备份、重置数据，localStorage + IndexedDB 持久化
- **移动端适配** — 触屏长按菜单、安全区域适配

## 技术栈

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Zustand · React Router 6 (HashRouter) · Dexie.js (IndexedDB)

## 本地运行

```bash
git clone https://github.com/Cayre1021/IDchat.git
cd IDchat
npm install
npm run dev
```

浏览器打开 `http://localhost:5173/IDchat/`

## 部署

```bash
npm run build    # 输出到 dist/
npm run preview  # 预览生产构建
```

静态托管到任意服务（GitHub Pages / Vercel / Netlify），无需后端。

## 字体

使用 Anthropic 官方字体（Anthropic Sans / Serif / Mono），遵循 Anthropic 品牌指南。

## 许可

本项目的源代码仅供学习、研究和个人使用。**禁止商业用途**。详见 [LICENSE](./LICENSE)。
