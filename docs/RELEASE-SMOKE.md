# 小程序发版冒烟（P0）

合并 `main` 并准备上传微信后台前：

- [ ] `npm run clean:weapp && npm run build:weapp:size` 通过（含主包图片+音频 ≤200KB、lazyCodeLoading）
- [ ] 开发者工具导入仓库根目录，`miniprogramRoot` = `dist-weapp/`
- [ ] 上传包不含 `*.map`（`project.config.json` packOptions 已忽略）
- [ ] 四个 Tab 可切换：首页 / **准备** / 活动 / 我的
- [ ] 活动 Tab 三个子视图：列表 / 日历 / 艺人
- [ ] 进入活动详情；组队帖列表可加载（登录态）
- [ ] 准备 Tab：绑定活动后 WebSocket 一轮对话无报错；攻略/行程/组队 Sheet 可打开
- [ ] 首页「我的下一场」与 Festival Plan 进度（已选活动 + 登录态）
- [ ] 后端 `GET /api/health` 正常（本地或目标环境）
- [ ] （可选）`cd sync-app-backend && npm run smoke:api` 全链路 REST 冒烟通过

功能清单对照：[PRODUCT.md](./PRODUCT.md)
