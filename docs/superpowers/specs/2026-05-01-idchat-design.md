# IDchat Design Spec

> 对话式 AI 聊天应用，Telegram 风格手机端网页。纯前端 + GitHub Pages 部署。

## Tech Stack

| 层 | 选型 | 原因 |
|---|------|------|
| 框架 | React 18 + TypeScript | 生态最丰富，聊天应用交互复杂 |
| 构建 | Vite 5 | 极快 HMR，GitHub Pages 静态部署友好 |
| 样式 | Tailwind CSS 3 + CSS 变量主题 | 原子化 CSS，主题切换用 CSS 变量 |
| 路由 | React Router (HashRouter) | GitHub Pages 无服务端路由，HashRouter 不白屏 |
| 状态 | Zustand | 轻量，按模块拆分 store |
| 持久化 | localStorage (设置/角色) + IndexedDB (聊天记录) | 大量消息用 IndexedDB 性能更好 |
| 字体 | Anthropic Sans / Serif / Mono | 内嵌 TTF，@font-face 加载，`font-display: swap` 防闪烁 |

### 字体加载策略

- `@font-face` 声明 `font-display: swap` — 先用系统字体渲染，字体加载完后平滑切换
- `<link rel="preload">` 预加载三个 TTF，减少 FOUT
- 总计约 1.5MB，首次加载后浏览器缓存

## Route Map

```
/#/chat                  → ChatListPage      聊天列表（Telegram 主页）
/#/chat/:characterId     → ChatDetailPage    对话界面
/#/characters            → CharacterListPage 角色管理列表
/#/characters/new        → CharacterEditPage 创建角色
/#/characters/:id/edit   → CharacterEditPage 编辑角色
/#/settings              → SettingsPage      设置主页
/#/settings/api          → ApiListPage       API 配置列表
/#/settings/api/new      → ApiEditPage       添加 API
/#/settings/api/:id/edit → ApiEditPage       编辑 API
/#/settings/theme        → ThemePage         主题选择
```

底部固定 3 Tab：聊天 / 角色 / 设置。

> **设计理由**：Telegram 是单聊天列表 + 侧滑抽屉，因为其核心功能只有一个（聊天）。IDchat 有三个并列的核心入口——选择角色聊天（高频）、管理 AI 角色（中频）、配置 API 和主题（低频）。三 Tab 底部导航是 WhatsApp/微信验证过的成熟模式，适合多入口场景。角色创建按钮放在角色页右上角（而非占用主入口），避免 Telegram FAB 模式下的功能混淆。

## Data Model

```typescript
interface ApiConfig {
  id: string;
  name: string;           // "我的 DeepSeek"
  protocol: 'openai' | 'anthropic';
  endpoint: string;       // "https://api.deepseek.com/v1/chat/completions"
  key: string;            // 加密存储
}

interface Message {
  role: 'user' | 'ai';
  content: string;        // 完整 Markdown 原文
  image?: string;         // base64 图片（多模态）
  time: string;           // "HH:MM"
  quoteRef?: { idx: number; role: string } | null;
}

interface Character {
  id: string;
  name: string;
  initial: string;        // 头像首字母
  color: string;          // 头像背景色
  preview: string;        // 最后消息预览
  time: string;
  unread: number;
  model: string;          // "deepseek-chat"
  apiId: string;          // 绑定 ApiConfig.id
  persona: string;        // 系统 Prompt — 角色设定
  style: string;          // 系统 Prompt — 对话风格
  multimodal: boolean;
  pinned: boolean;
  messages: Message[];
  quoteRef: { idx: number; role: string } | null;
}

interface AppData {
  apis: ApiConfig[];
  chars: Character[];
  theme: string;          // "system" | "default" | "dark" | ...
  onboardDone: boolean;
}
```

### 系统 Prompt 拼接规则
发送给 AI 的 messages 数组：
```
[system] 你是{persona}。你的对话风格：{style}
[user]   ...（用户消息 + 引用上下文）
[assistant] ...（历史 AI 回复）
```

## Component Tree

```
App
├── OnboardingOverlay       — 首次引导（条件渲染）
├── BottomTabBar            — 3 Tab 导航
│
├── ChatListPage            — /#/chat
│   ├── SearchBar
│   └── ChatRow[]           — 头像 + 名字 + 预览 + 时间 + 未读角标
│       └── LongPressMenu   — 打开/置顶/编辑/删除
│
├── ChatDetailPage          — /#/chat/:characterId
│   ├── ChatHeader          — 返回 + 头像 + 名字 + 搜索图标 + 清空图标
│   ├── ChatSearchBar       — 对话内搜索（条件显示）
│   ├── MessageList         — 消息列表
│   │   └── MessageBubble[] — 气泡（支持 Markdown 渲染）
│   │       ├── QuotedMsg   — 引用卡片（条件渲染）
│   │       ├── CodeBlock   — 代码块（语言标签 + 复制按钮 + 横向滚动条）
│   │       ├── MdTable     — 表格（横向滚动条）
│   │       └── LongPressMenu — 复制/引用/删除/转发
│   ├── TypingIndicator     — AI 思考中动画
│   ├── ScrollToBottomFab   — 回到底部浮动按钮
│   ├── QuoteBar            — 引用预览条（条件渲染）
│   ├── InputBar            — 表情/附件/输入框/发送
│   ├── EmojiPicker         — 表情面板（条件渲染）
│   └── ForwardSheet        — 转发角色选择底部面板（条件渲染）
│
├── CharacterListPage       — /#/characters
│   ├── CharacterCard[]     — 头像 + 名字 + 模型 + API + 设定摘要 + 编辑按钮
│   │   └── LongPressMenu   — 聊天/编辑/删除
│   └── EmptyState          — "还没有角色"
│
├── CharacterEditPage       — /#/characters/new | /:id/edit
│   ├── AvatarBuilder       — 头像色块选择
│   ├── NameInput
│   ├── ApiBindingSelect    — 绑定 API 配置
│   ├── ModelSelect
│   ├── PersonaTextarea     — 角色设定（带提示）
│   ├── StyleTextarea       — 对话风格（带提示）
│   ├── MultimodalToggle
│   └── DraftWarning        — 未保存离开提示
│
├── SettingsPage            — /#/settings
│   └── SettingsGroup[]     — API / 外观 / 数据 / 关于
│
├── ApiListPage             — /#/settings/api
│   ├── ApiConfigCard[]     — 名称 + 协议 + 端点 + Key 预览 + 编辑/删除
│   └── EmptyState          — "还没有 API 配置"
│
├── ApiEditPage             — /#/settings/api/new | /:id/edit
│   ├── NameInput
│   ├── ProtocolSelect      — OpenAI 兼容 / Anthropic
│   ├── EndpointInput
│   ├── ApiKeyInput         — 密码类型
│   └── DeleteButton        — 带受影响角色提示
│
├── ThemePage               — /#/settings/theme
│   └── ThemeCard[]         — 跟随系统 + 5 组主题（含迷你聊天气泡预览）
│
├── ConfirmModal            — 全局复用确认弹窗（点遮罩关闭）
├── ContextMenu             — 全局复用右键/长按菜单
└── Toast                   — 全局复用提示
```

## AI API Integration

```
POST {endpoint}
Headers: Authorization: Bearer {key}
Body (OpenAI 兼容):
{
  model: character.model,
  messages: [
    { role: "system", content: "你是{persona}。\n对话风格：{style}" },
    ...history,
    { role: "user", content: "..." }
  ],
  stream: true
}
```

- 支持 SSE streaming（逐字显示）
- 多模态：user message 的 content 改为 `[{type:"text",text:"..."},{type:"image_url",image_url:{url:"data:image/..."}}]`
- Anthropic 协议同样映射

### API Error Handling

所有 API 错误必须有用户可见的反馈，不能静默失败：

| 错误 | HTTP 码 | UI 行为 |
|------|---------|---------|
| API Key 无效 | 401 | 消息气泡变红 + 文字 "API Key 无效，请去设置更新" + 链接跳转 API 设置 |
| 限流 | 429 | toast "请求太频繁，请稍候再试（X 秒后重试）" + 自动倒计时 |
| 服务端错误 | 500/502/503 | toast "服务暂时不可用，正在重试..." + 自动重试 1 次 |
| 网络超时 | — | toast "网络连接超时，请检查网络后重试" |
| 模型不存在 | 404 | toast "模型不可用，请检查角色配置" |
| 空响应 | — | toast "AI 未返回内容，请重试" |
| 请求中止 | — | 静默处理（用户主动停止） |

**重试机制**：自动重试仅 1 次，间隔 2 秒。用户可手动点"重新生成"无限次重试。

### 上下文窗口管理

AI 模型有 token 上限。当单次请求的 messages 超过模型上下文窗口：

1. **自动裁剪**：从最早的历史消息开始裁剪，保留 system prompt + 最近 N 轮对话
2. **用户提示**：裁剪发生时在消息列表顶部插入系统提示条 "对话较长，早期内容已省略以适配模型上下文限制"
3. **手动清空**：用户可通过右上角清空按钮手动重置对话

### 停止生成

AI streaming 回复过程中：

- 发送按钮变为**红色方块停止按钮**（■）
- 点击停止 → `AbortController.abort()` → 已接收的部分内容保留在气泡中
- 停止后发送按钮恢复为蓝色发送图标

### 重新生成

- 用户长按/右键 AI 消息 → "重新生成"
- 触发逻辑：移除该消息 → 重新发送上一条用户消息到 API
- 如果该 AI 消息之前没有用户消息（对话首条），重新用空上下文生成
- 支持连续重新生成（每次会覆盖前一次重新生成的结果）

## Interaction Spec

### 聊天列表
- 点击 → 进入对话
- 长按/右键 → 打开/置顶/编辑/删除
- 搜索 → 实时过滤角色名 + 预览文本
- 置顶项排最前 + 浅色背景 + 📌

### 对话界面
- 发送消息：Enter 发送，Shift+Enter 换行
- 消息气泡弹入动画（msgIn 250ms）
- **Streaming 体验**：
  - 用户消息发出后 → typing indicator（三点跳跃）
  - API 返回首个 token → typing indicator 消失，出现 AI 气泡
  - 后续 token 逐字追加到气泡末尾，同时自动滚到底部
  - 发送按钮变为红色停止按钮（■），点击中止 streaming
  - Streaming 完成后停止按钮恢复为蓝色发送按钮
- 连续 AI 消息不重复显示头像
- 长按/右键消息 → 复制/引用/删除/转发（Streaming 中的消息不可操作）
- 长按/右键用户消息 → 复制/引用/删除/转发

### 引用功能
- 点引用 → QuoteBar 出现在输入框上方（accent 竖线 + 名字 + 预览 + ✕）
- 点 QuoteBar → 滚到原消息 + 黄色高亮闪烁 1.5s
- 发送后气泡内嵌引用卡片（可点击跳转）

### 删除功能
- 确认 Modal → 粉碎动画（350ms 收缩淡出）→ 从数据移除
- 自动修复引用索引偏移
- **撤销机制**：删除后 toast 显示 "已删除 [撤销]"（5 秒），点击"撤销"恢复消息；超时后彻底删除

### 转发功能
- 选择目标角色 → 跳转目标对话 → 消息填入输入框 → 用户决定发送

### Markdown 渲染
- ` ```lang\ncode\n``` ` → 代码块（深色背景、语言标签、复制按钮、横向滚动条 10px 高）
- `` `code` `` → 内联代码（等宽字体、红褐色）
- `| col | col |` → 表格（accent 表头、奇偶行交替、横向滚动条）
- `**bold**` → 粗体
- `*italic*` → 斜体

### 主题
- 跟随系统（prefers-color-scheme 监听）
- 6 套手动主题：跟随系统 / 默认蓝 / 暗夜黑 / 午夜蓝 / 玫瑰粉 / 薄荷绿 / 日落橙
- 全局 CSS 变量切换，`transition: background-color .3s, color .3s` 平滑过渡
- 主题选择保存在 localStorage，下次访问自动恢复

### 草稿保护
- 编辑角色页检测表单修改
- 点返回弹出黄色提示条"有未保存的修改"

### 空状态引导
- 首次进入 → 引导弹窗（配 API → 建角色 → 开始聊天）
- 无 API → API 列表页空状态按钮 "添加配置"
- 无角色 → 角色列表页空状态按钮 "创建角色"
- 无消息 → 聊天空状态（角色设定摘要 + "发送第一条消息"）

### 边界情况处理

| 场景 | 处理 |
|------|------|
| 消息超长（>10000 字） | 气泡允许纵向撑高，不截断，不限制 |
| 快速连发消息 | 前一条 AI 未响应时用户再发 → 排队发送，先响应当前 |
| 切换角色（正在 streaming） | 自动 abort 当前请求，切换后 loading 状态重置 |
| 删除正在聊天的角色 | Modal 警告 "正在对话中，删除后聊天记录将丢失" |
| 删除所有 API 配置 | 所有角色显示"未绑定 API"，聊天界面提示"请先配置 API" |
| localStorage 满 | 写入失败时 toast "存储空间不足，请导出数据后清理" |
| 图片过大 | 压缩到 1024px 宽后再 base64 编码 |

## Storage Strategy

| 数据 | 存储 | Key |
|------|------|-----|
| API 配置 | localStorage | `idchat_apis` |
| 角色列表 | localStorage | `idchat_chars` |
| 聊天记录 | IndexedDB (Dexie.js) | `idchat_msgs` |
| 主题设置 | localStorage | `idchat_theme` |
| 引导状态 | localStorage | `idchat_onboarded` |

## Deployment

- `vite build` → `dist/` 文件夹
- GitHub Pages 部署 `dist/`
- `vite.config.ts` 设 `base: '/IDchat/'`
- HashRouter 确保 SPA 路由在静态服务器上不 404
