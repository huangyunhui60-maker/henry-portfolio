# Henry · 个人网站

AI 产品经理的个人主页。纯 HTML / CSS / JavaScript 手写，**零依赖、无构建步骤**。

## 预览

由于嵌入了 Dify 聊天助手（第三方 iframe），在 `file://` 协议下无法加载，需要通过 HTTP 打开：

```bash
cd 个人网站
python3 -m http.server 8899
```

然后访问 <http://localhost:8899/index.html>

## 目录结构

```
.
├── index.html      # 页面结构（含 Dify 助手脚本）
├── css/
│   └── style.css   # 全部样式，主题色由 CSS 变量管理
├── js/
│   └── main.js     # 交互逻辑，原生 JS
└── .gitignore
```

## 功能

- **Hero 首屏** — 青紫渐变标题、打字机文案轮播、数字滚动统计
- **Canvas 粒子背景** — 粒子连线，鼠标可吸引粒子；页面切到后台自动暂停省电
- **关于我 / 技能 / 项目 / 经历 / 联系** 五大板块
- **技能进度条** — 滚动进入视口时才填充
- **项目卡片** — 点击展开详情，含关键决策与数据指标
- **滚动进场动画** — 基于 `IntersectionObserver`，同组元素错峰出现
- **Dify 智能问答助手** — 右下角气泡 + 页面按钮唤起
- **响应式** — 适配桌面 / 平板 / 手机，含移动端汉堡菜单
- **无障碍** — 支持 `prefers-reduced-motion`，键盘焦点可见

## 自定义指南

### 主题配色

改 `css/style.css` 顶部的 CSS 变量即可全局换肤：

```css
:root {
  --cyan:   #22d3ee;   /* 强调色：青 */
  --violet: #a855f7;   /* 强调色：紫 */
  --bg:     #07080f;   /* 背景底色 */
}
```

### 需要替换的占位内容

- 邮箱 `henry@example.com`（出现在 `index.html` 联系区）
- 社交链接 GitHub / 小红书 / 即刻，目前均为 `#`
- 头像：当前是渐变字母 `H`，换成照片可把 `.about__avatar-inner` 内的文字改为 `<img>`
- 项目、经历、技能百分比均为示例数据

## 技术说明

### Dify 聊天助手

组件由 Dify 注入到 `<body>` 末尾，生成两个节点：

- `IFRAME#dify-chatbot-bubble-window` — 聊天窗本体
- `DIV#dify-chatbot-bubble-button` — 右下角气泡按钮

Dify 原生把聊天窗写成 `position: absolute`，会锚定在**文档顶部** —— 页面较长时滚动后窗口会跑到视口外。`css/style.css` 中已用 `!important` 覆盖为 `position: fixed`，并复用 Dify 自身的定位变量：

```css
--dify-chatbot-bubble-button-bottom
--dify-chatbot-bubble-button-right
```

想调整位置改这两个变量即可。

## License

个人项目，保留所有权利。
