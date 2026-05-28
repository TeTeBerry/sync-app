module.exports = {
  presets: [
    [
      "taro",
      {
        framework: "react",
        ts: true,
        compiler: "webpack5",
      },
    ],
  ],
  plugins: [
    [
      "import",
      {
        libraryName: "@nutui/nutui-react-taro",
        libraryDirectory: "dist/es/packages",
        camel2DashComponentName: false,
        customName: (name) => {
          return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}`;
        },
        customStyleName: (name) => {
          return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}/style`;
        },
      },
      "nutui-react-taro",
    ],
  ],
};
