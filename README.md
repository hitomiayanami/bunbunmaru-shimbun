# 文々。新聞｜Bunbunmaru Shimbun PWA

每日中日六城天气、时政财经科技、IVD/CDx 与摄影文化简报的 **PWA 独立阅读应用**，托管于 GitHub Pages，与 Google Drive 五页版 PDF（用于生成音频节目与归档）双轨并行。

## 特性

- **五面流式排版**：保留「第一面」至「第五面」的报刊结构与宣纸米白视觉风格，每面高度自适应，不因 A4 纸张限制删减内容。
- **深浅色自动切换**：跟随 iOS / macOS / Android 系统外观自动切换「宣纸米白」日间版与「暖调暗夜墨纸」夜间版，状态栏主题色同步适配。
- **云端 PWA 轨**：每日 18:30 JST 自动生成当期结构化 JSON 写入 Google Drive 同步目录，由 Google Apps Script 自动提交至仓库并更新索引。
- **Drive PDF 轨**：Mac 在线时同步编译 5 页 A4 PDF 上传至 Google Drive，供音频节目生成与归档。
- **原生出报推送**：集成 OneSignal 网页推送，新期数发布后自动向已订阅的手机或电脑 PWA 推送通知，点击直达最新一期。
- **双轨数据架构**：每日简报以结构化 JSON 存放在 `issues/` 目录，可随时回溯往期。
- **中日双城均衡**：覆盖上海、天津、东京、大阪、名古屋、福冈明日天气与 US EPA AQI 空气质量指数，以及中日文化、周末特展与时令季语。
- **独立应用体验**：支持安装至 iOS / macOS / Android 主屏幕，提供离线缓存与出报通知入口（`manifest.json` + `sw.js`）。

## 目录结构

```text
.
├── index.html               # 应用入口
├── style.css                # 报纸风格响应式样式
├── app.js                   # 期数加载、五面切换与通知权限逻辑
├── manifest.json            # PWA 清单配置
├── sw.js                    # Service Worker（离线缓存与推送监听）
├── icons/
│   └── icon.svg             # 应用图标
└── issues/
    ├── index.json           # 期数索引
    ├── 2026-11-26.json      # 单期报纸数据
    └── fallback-data.js     # 本地 file:// 直接双击预览兜底数据
```

## 本地预览与部署

- **GitHub Pages**：将仓库根目录发布为 GitHub Pages（`main` 分支 `/ (root)`）即可访问。
- **手机端安装**：使用 iPhone Safari 打开部署链接，点击「分享 → 添加到主屏幕」即可作为独立应用使用。
- **本地预览**：直接双击 `index.html`，或在项目目录下运行 `python3 -m http.server 8000` 后访问 `http://localhost:8000`。
