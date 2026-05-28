"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/posts/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/posts/index!./src/pages/posts/index.tsx":
/*!****************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/posts/index!./src/pages/posts/index.tsx ***!
  \****************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_PageNavigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/PageNavigation */ "./src/components/PageNavigation.tsx");
/* harmony import */ var _components_FeedPostList__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/FeedPostList */ "./src/components/FeedPostList.tsx");
/* harmony import */ var _components_ListState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/ListState */ "./src/components/ListState.tsx");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../hooks/useTabPageMainHeight */ "./src/hooks/useTabPageMainHeight.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");













const AllPostsPage = () => {
  const mainScrollHeight = (0,_hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_9__.useStackPageMainHeight)();
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_5__.useConfirmDialog)({
    cancelText: "取消"
  });
  const {
    posts,
    isLoading,
    isError,
    refetch
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.useAllPostsQuery)();
  const handleDeletePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async post => {
    const ok = await confirm({
      title: "确认删除",
      message: "删除后无法恢复，确定要删除这条帖子吗？",
      confirmText: "删除"
    });
    if (!ok) return;
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.deletePostAndInvalidate)(post.id).then(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已删除",
        icon: "success"
      });
    }).catch(() => {
      void refetch();
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "删除失败",
        icon: "none"
      });
    });
  }, [confirm, refetch]);
  const handleLikePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(post => {
    if (!(0,_constants_api__WEBPACK_IMPORTED_MODULE_7__.isApiEnabled)()) {
      return;
    }
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.likePostAndInvalidate)(post.id).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "请求失败，请稍后重试",
      icon: "none"
    }));
  }, []);
  const handleCommentSubmitted = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    void refetch();
  }, [refetch]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
    "data-cmp": "AllPosts",
    className: "s-posts-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_PageNavigation__WEBPACK_IMPORTED_MODULE_2__["default"], {
      title: "\u6240\u6709\u5E16\u5B50",
      fallback: _utils_route__WEBPACK_IMPORTED_MODULE_8__.ROUTES.HOME
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.ScrollView, {
      scrollY: true,
      enhanced: true,
      showScrollbar: false,
      className: "s-posts-page__main s-scrollbar-none",
      style: mainScrollHeight != null ? {
        height: `${mainScrollHeight}px`
      } : undefined,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_ListState__WEBPACK_IMPORTED_MODULE_4__.ListState, {
        isLoading: isLoading,
        isError: isError,
        isEmpty: !isLoading && !isError && posts.length === 0,
        loadingText: "\u52A0\u8F7D\u4E2D\u2026",
        errorText: "\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
        emptyText: "\u6682\u65E0\u5E16\u5B50",
        onRetry: () => void refetch(),
        retryText: "\u91CD\u8BD5",
        stateClassName: "s-posts-page__state",
        retryClassName: "s-posts-page__retry",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_components_FeedPostList__WEBPACK_IMPORTED_MODULE_3__.FeedPostList, {
          items: posts,
          onDelete: handleDeletePost,
          onLike: handleLikePost,
          onCommentSubmitted: handleCommentSubmitted
        })
      })
    }), confirmDialog]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (AllPostsPage);

/***/ }),

/***/ "./src/pages/posts/index.tsx":
/*!***********************************!*\
  !*** ./src/pages/posts/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/posts/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/posts/index!./src/pages/posts/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/posts/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_posts_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/posts/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map