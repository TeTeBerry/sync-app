# 贡献流程（单人开发）

## 分支

不要直接向 `main` push。每次改动：

```bash
git checkout main && git pull
git checkout -b feat/简短描述
# 改代码…
npm run check          # typecheck + lint + format:check + test
npm run build:weapp:size # 发小程序前
git commit -m "feat: …"
git push -u origin feat/简短描述
```

在 GitHub 开 **Pull Request → base: main**，CI 通过后 **自己 Merge**（无需他人 Review）。

## GitHub 设置（一次性）

仓库 **Settings → Branches → Branch protection rule**（`main`）：

- Require a pull request before merging：**开**
- Require approvals：**关**（单人）
- Require status checks：**开**（选 CI job `check` / `build-weapp`）

## 组件与类型

新 UI / 组件放置规则见 [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md)。帖子相关类型从 `src/types/post.ts` 导入。

## 发版冒烟

见 [RELEASE-SMOKE.md](./RELEASE-SMOKE.md)。
