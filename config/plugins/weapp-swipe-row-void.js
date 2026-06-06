/** @param {import('@tarojs/service').IPluginContext} ctx */
module.exports = function weappSwipeRowVoid(ctx) {
  ctx.onCompilerMake(async ({ plugin }) => {
    plugin?.options?.template?.voidElements?.add('swipe-delete-row');
  });
};
