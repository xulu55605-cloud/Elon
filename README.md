# Elon Musk 社交动态每日简报系统 (Elon Musk Daily Digest)

每日自动抓取 Elon Musk 最新社交媒体动态（𝕏 / Tesla / SpaceX / xAI 等），汇总提炼核心要点与专业中文翻译解读，自动生成独立的 HTML 简报并发送至目标邮箱 `xu.lu@cn.bosch.com` 和 `lxsury@163.com`。

---

## 快速开始 (本地运行指南)

### 1. 环境准备
确保电脑已安装 [Node.js](https://nodejs.org) (v18 或 v20 及以上版本)。

### 2. 安装依赖
在项目根目录下打开终端执行：
```bash
npm install
```

### 3. 配置环境变量
复制根目录的 `.env.example` 并重命名为 `.env`：
```bash
cp .env.example .env
```
在 `.env` 中配置：
- `GEMINI_API_KEY`: 前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取免费的 Gemini API Key 填入即可。
- `DEFAULT_RECIPIENT`: 目标接收邮箱（已默认预设为 `xu.lu@cn.bosch.com`）。
- `SMTP_*`: （可选）邮件发送服务器配置。如暂不配置，也可在启动后的网页“推送设置”中图形化填写。

### 4. 启动项目
```bash
npm run dev
```
打开浏览器访问：
👉 **http://localhost:3000**

---

## 核心功能

1. **自动化定时调度**：
   - 默认每日 08:00 (北京时间) 自动触发联网抓取、智能提炼、编译 HTML 报告并推送到指定邮箱。
2. **立即抓取与生成**：
   - 支持一键手动触发立即抓取最新动态并生成最新一期简报。
3. **HTML 报告在线预览与一键下载**：
   - 支持桌面端与手机端排版双视图实时渲染预览。
   - 支持单文件 HTML 简报离线下载（双击任何浏览器均可直接阅读）。
4. **邮件推送与 SMTP 配置**：
   - 邮件正文直接呈现精美 HTML 排版，同时将 `.html` 文件作为附件打包随信附送。
   - 提供 Bosch 企业邮、Office 365、Gmail 等快捷预设与一键连通性测试。
5. **历史归档**：
   - 完整记录往期简报，支持随时回溯、再次下载与重新发送。

---

## 后台常驻运行 (生产环境部署)

如果需要作为后台服务 7x24 小时运行：
```bash
# 1. 编译
npm run build

# 2. 安装 pm2 (如未安装)
npm install -g pm2

# 3. 启动后台守护进程
pm2 start dist/server.cjs --name elon-digest

# 查看状态与运行日志
pm2 status
pm2 logs elon-digest
```
