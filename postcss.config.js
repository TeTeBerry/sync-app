const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "test" ||
  process.env.npm_lifecycle_event === "build:h5" ||
  process.env.npm_lifecycle_event === "build:weapp";

module.exports = {
  plugins: {
    autoprefixer: {},
    ...(isProd
      ? {
          cssnano: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }
      : {}),
  },
};
