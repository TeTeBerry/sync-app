# 小程序发版冒烟（P0）

合并 `main` 并准备上传微信后台前：

- [ ] `npm run clean:weapp && npm run build:weapp:size` 通过（含主包图片+音频 ≤200KB、lazyCodeLoading）
- [ ] 开发者工具导入仓库根目录，`miniprogramRoot` = `dist-weapp/`
- [ ] 上传包不含 `*.map`（`project.config.json` packOptions 已忽略）
- [ ] 三个 Tab 可切换：首页 / 活动 / 我的
- [ ] 进入活动详情、AI 助手 WebSocket 一轮对话无报错
- [ ] 后端 `GET /api/health` 正常（本地或目标环境）
- [ ] （可选）`cd sync-app-backend && npm run smoke:api` 全链路 REST 冒烟通过
