# SYNC · Taro (React)

原 Vite 多端移动 UI 已迁移至 **Taro 4 + React**。样式使用 **`sass`**：全局设计令牌与工具类在 `src/styles/`，页面/组件旁的 **局部 `.scss`** 通过 `import "./xxx.scss"` 引入（H5 与小程序共用语义化 class，多端表现以各端运行时能力为准）。

## 相关文档

- API 契约：`docs/API.md`
- 贡献 / 分支流程：`docs/CONTRIBUTING.md`
- 包体基线：`docs/BUNDLE-SIZE.md`
- 发版冒烟：`docs/RELEASE-SMOKE.md`
- 改造清单：`docs/FRONTEND-REFACTOR-CHECKLIST.md`
- 组件分层：`docs/COMPONENT-ARCHITECTURE.md`
- 后端架构：`../sync-app-backend/docs/ARCHITECTURE.md`

## 环境

- **Node.js ≥ 18.18**（见 `package.json` `engines`）

## 命令

**主发布端为微信小程序**（`dev:weapp` / `build:weapp`）。性能与包体优化（列表窗口化、预加载、缓存分层等）**仅针对 weapp 验收**；H5 脚本保留供本地调试，**不作为发布目标，也不保证性能与功能 parity**。

```bash
npm install
npm run dev:weapp        # 微信小程序开发（会先写入 .env.local 局域网 IP，勿用 localhost）
npm run build:weapp      # 微信小程序生产构建
npm run build:weapp:size # 构建 + 包体阈值检查
npm run check            # typecheck + lint + format:check + test
npm run dev:h5           # H5 开发（未维护）
npm run build:h5
```

### 微信小程序（WeChat DevTools）

1. **先编译**（监听模式推荐）：
   ```bash
   npm run dev:weapp
   ```
   产物输出到 **`dist-weapp/`**，其中应包含 `app.json`、`app.js` 等。

2. **用微信开发者工具导入项目**：
   - 选择目录：**`sync-app`（仓库根，含 `project.config.json` 的目录）**
   - **不要**只打开空的 `dist-weapp` 文件夹；若该目录尚未编译，会报 `app.json is not found`。
   - `project.config.json` 中 `miniprogramRoot` 已指向 `dist-weapp/`。

3. 若仍报错，确认 `dist-weapp/app.json` 存在后再点「编译」；没有则重新运行 `npm run dev:weapp`。

## 重要说明

### 配置文件不要 `import @tarojs/taro`

在 **`app.config.ts`、`pages/**/index.config.ts`** 中不要编写：

```ts
import { defineAppConfig } from "@tarojs/taro";
```

`@tarojs/taro` 入口会连带加载运行时，Webpack 编译配置片段时可能在 Node 环境触发浏览器 API（典型报错：`window is not defined`）。本项目改为 **直接导出纯对象配置**。

页面与业务代码仍可正常使用 `import ... from "@tarojs/taro"`（如 `navigateTo`）。

### H5 必须把 `dist` 当网站根目录，且需要 `src/index.html`

Taro Webpack **仅在存在 `src/index.html`** 时才注入 **html-webpack-plugin**。若缺少该文件，构建只会产出 `js/`、`css/` 等资源，没有 **`dist/index.html`**；用任意静态服务打开目录时就会出现类似「只剩 `~/` + 搜索框」的目录列表页，而不会加载 SPA。

本地预览生产包：

```bash
npm run build:h5
# 任选其一：把工作目录设为 dist/
npx --yes serve dist -p 10087 --single
# 或直接在仓库根目录用 http-server 等方法，将 `-o`/`--cwd` 指到 ./dist（不要指向项目根目录）
```

脚本与样式使用 **`h5.publicPath`（默认为 `/`，见 `config/index.ts`）**；站点若挂在子路径，需改成对应前缀并重编。

### H5 路由（根路径即为首页）

本仓库 H5 已配置 **`h5.router.mode: "browser"`**，因此 **`http://主机:端口/`**（pathname 为 `/`）会由 Taro 解析为 **`app.config.ts` 中第一个页面**（`pages/index/index`），不再需要 `#/`。

生产环境静态托管需 **SPA 回退**：所有路径应返回 `index.html`（否则刷新子路径会 404），例如：

```bash
npx --yes serve dist -p 10087 --single
```

若站点挂在子路径，请同步设置 **`h5.publicPath`、`h5.router.basename`** 并重编。

### SCSS / PostCSS

- **`src/styles/_variables.scss`**：CSS 变量（配色、阴影、语义色）。
- **`src/styles/globals.scss`**：全局复位、`page`，以及前缀为 **`s-`** 的小型工具样式（例如 `s-inner-glow`、`s-scrollbar-none`、`s-pb-safe`、`s-pulse`、`s-line-clamp-*` 等）。
- **`src/app.scss`**：应用外层黑底 + **`max-width: 375px`** 手机栅（`s-app-shell` / `s-app-shell__viewport`）。
- **`src/styles/pages-shared.scss`**：占位页的 **`s-page-shell`** / **`s-page-shell__muted-center`**。
- **BEM**：全站 UI class 推荐使用 **`s-` 前缀**；块与元素单层双下划线 `block__elem`，语义变体一律双连字符修饰符 **`--modifier`**（避免再混用裸露的 `.is-active` / `.sell` 等）。
- 各 **`src/pages/**`、`src/components/*.scss`**：页面/组件 BEM 风格 class，命名以可读为主。
- **PostCSS** 仅 **`autoprefixer`**（生产可加 **cssnano**），见 `postcss.config.js`。
- 微信小程序为保留 **`div/button/img`** 等 DOM 写法，仅在 **`TARO_ENV === "weapp"`** 时启用 **`@tarojs/plugin-html`**（见 `config/index.ts`）。

### 字体（Barlow）

原 `@font-face` 指向的文件在仓库中不存在会导致构建解析失败，已移除该段。若需完全一致：

1. 将 `Barlow-Regular_2.ttf` 放到 `src/static/fonts/`；
2. 新建样式文件或在 **`src/styles/globals.scss`** 中补充 `@font-face`，使用可被 Webpack/`static` 正确解析的路径（不要将字体放在未参与打包的路径下）。

```css
@font-face {
  font-family: "Barlow-Regular_2";
  src: url("./static/fonts/Barlow-Regular_2.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

并使用 `font-family: Barlow-Regular_2` 的 class 或内联样式按需应用。

## 目录结构（摘录）

- `config/index.ts` — Taro 工程配置
- `src/index.html` — H5 页面壳（挂载 `#app`，无此文件则无 `dist/index.html`）
- `src/app.tsx` / `src/app.config.ts` — 应用入口与全局配置（无 taro 运行时 import）
- `src/app.scss`、`src/styles/*` — 全局 SCSS（变量、复位、占位页共用类）
- `src/pages/*` — 各页面（`index.tsx`、`index.config.ts`、`*.scss` 按需）
- `src/components/*` — 组件与邻近 `*.scss`
- `src/utils/route.ts` — 路由封装（`reLaunch` / `navigateTo` 等）

## 样式依赖

编译 **`sass`（Dart Sass）**；Taro/webpack5 通过 **`sass-loader`** 处理 **`import "./x.scss"`**。

## Babel

已显式安装 **`@babel/preset-react`**，满足 `babel-preset-taro` _peer_ 要求。

## 参考

- [Taro 文档](https://docs.taro.zone/)
# sync-app
