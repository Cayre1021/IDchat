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

## 更新历程

### v1.0.6 (2026-05-01) — 视口锁定 & 搜索触控优化
- 聊天界面上下栏固定于视口，仅消息区域可滚动
- 搜索栏上下箭头按钮扩大至 42×42px，防误触
- 消息区域独立滚动，不再整体页面滚动

### v1.0.5 — 关键 Bug 修复
- 修复 AI 重复回复两条消息（filter+push → 原地更新最后一条消息）
- 修复删除消息使用闭包旧数据导致不更新（→ 函数式 setState）
- 修复长按短消息触发浏览器文字选中而非菜单（preventDefault + user-select:none）
- 修复 API 编辑保存后退回旧数据（setTimeout 等 React 提交状态后再跳转）
- 修复 PageShell 返回动画不触发（模块级变量追踪导航方向）

### v1.0.4 — 导航历史 & 页面过渡
- 所有保存/删除导航改用 `replace: true`，不再堆叠历史记录
- 新增 PageShell 组件：220ms cubic-bezier 页面滑入/滑出动画
- chatStore 新增 msgCache + preloadAll，进入聊天零延迟显示消息
- 消息气泡新增弹入动画（200ms 缩放入场）

### v1.0.3 — 模型名称字段
- API 配置新增"默认模型"输入字段
- 角色编辑新增"自定义模型名称"选项（预设下拉 + 自由输入）
- 选择绑定的 API 时自动填入其默认模型

### v1.0.2 — Bug 修复第一轮
- 抽取 MessageBubble 组件（修复 React hooks 在 .map() 中的违规）
- 抽取 ChatRow useLongPress 到组件级别
- 搜索导航改为容器内 scrollTo（不再滚动整个视口）
- 转发预填改用 URL query param（修复 window 全局变量失效）
- Emoji 插入改用 forwardRef（修复 window 全局变量失效）
- 重置数据同步清除 Dexie IndexedDB

### v1.0.1 — 界面适配
- 去除手机外壳（phone-frame 假边框/圆角/阴影）
- 页面适配全宽视口（100dvh）
- 统一各子页面 flex 布局尺寸
- 新增首次使用引导遮罩（配 API → 建角色 → 开始聊天）

### v1.0.0 — 首次发布
- React 18 + TypeScript + Vite 5 + Tailwind CSS 3
- Zustand 状态管理（theme / api / char / chat 四个 store）
- Dexie.js IndexedDB 聊天记录持久化
- HashRouter 路由（9 条路由），免白屏部署 GitHub Pages
- Anthropic 官方字体（Sans / Serif / Mono）
- 聊天列表：搜索、置顶、长按/右键菜单
- AI 对话：SSE Streaming、Markdown 渲染（代码块+横向滚动条、表格、内联代码）
- 消息操作：复制、引用回复（跳转定位+高亮动画）、删除、转发
- 角色管理：头像颜色、API 绑定、角色设定（System Prompt）、对话风格
- API 配置：多组管理、OpenAI/Anthropic 协议、删除时列受影响角色
- 7 套主题（跟随系统、默认蓝、暗夜黑、午夜蓝、玫瑰粉、薄荷绿、日落橙）
- 数据导出/重置、Emoji 面板、对话内搜索、typing indicator
- GitHub Actions 自动构建部署

## 许可

本项目的源代码仅供学习、研究和个人使用。**禁止商业用途**。详见 [LICENSE](./LICENSE)。
