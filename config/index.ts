import { defineConfig } from "@tarojs/cli";
import * as path from "path";

/** 微信小程序使用 HTML 标签映射；H5 使用原生浏览器标签 */
const plugins: (string | [string, Record<string, unknown>])[] = ["@tarojs/plugin-framework-react"];
if (process.env.TARO_ENV === "weapp") {
  plugins.push(["@tarojs/plugin-html", {}]);
}

// https://docs.taro.zone/docs/config-detail
export default defineConfig({
  projectName: "sync-app",
  date: "2026-5-24",
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2,
  },
  sourceRoot: "src",
  outputRoot: "dist",
  plugins,
  compiler: {
    type: "webpack5",
    prebundle: {
      enable: false,
    },
  },
  framework: "react",
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
    webpackChain(chain) {
      chain.resolve.alias
        .set("lucide-react", path.resolve(__dirname, "../src/utils/lucideMock.tsx"))
        .set("lucide-react-taro", path.resolve(__dirname, "../src/utils/lucideMock.tsx"));
    },
  },
  h5: {
    publicPath: "/",
    staticDirectory: "static",
    /** 根路径 `/` 即首页（hash 模式需 `#/pages/...`，否则空白） */
    router: {
      mode: "browser",
    },
    postcss: {
      autoprefixer: {
        enable: true,
      },
    },
    webpackChain(chain) {
      chain.optimization.splitChunks({
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20_000,
        cacheGroups: {
          taro: {
            name: "taro-vendor",
            test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
            priority: 20,
          },
          react: {
            name: "react-vendor",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 20,
          },
          query: {
            name: "query-vendor",
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            priority: 15,
          },
          lucide: {
            name: "lucide-vendor",
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            priority: 15,
          },
          i18n: {
            name: "i18n-vendor",
            test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            priority: 15,
          },
          common: {
            name: "common",
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      });
    },
    devServer: {
      historyApiFallback: true,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          onProxyRes: (proxyRes, req) => {
            if (req.url?.includes("/ai/chat")) {
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["x-accel-buffering"] = "no";
            }
          },
        },
      },
    },
  },
});
