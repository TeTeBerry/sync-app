"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/notifications/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/notifications/index!./src/pages/notifications/index.tsx":
/*!********************************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/notifications/index!./src/pages/notifications/index.tsx ***!
  \********************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_ThemedPageLoader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/ThemedPageLoader */ "./src/components/ThemedPageLoader.tsx");
/* harmony import */ var _hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../hooks/useDeferredMount */ "./src/hooks/useDeferredMount.ts");
/* harmony import */ var _hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../hooks/usePageRouteReady */ "./src/hooks/usePageRouteReady.ts");
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_PageNavigation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/PageNavigation */ "./src/components/PageNavigation.tsx");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _utils_notificationDisplay__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/notificationDisplay */ "./src/utils/notificationDisplay.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _utils_timing__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/timing */ "./src/utils/timing.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");














const CATEGORY_TABS = ["all", "comment", "like", "system"];
function NotificationIcon({
  category
}) {
  const iconProps = {
    size: 20
  };
  switch (category) {
    case "like":
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Heart, {
        ...iconProps
      });
    case "comment":
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.MessageCircle, {
        ...iconProps
      });
    case "system":
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Megaphone, {
        ...iconProps
      });
    default:
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Bell, {
        ...iconProps
      });
  }
}
const NotificationsPage = () => {
  const listReady = (0,_hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_2__.useDeferredMount)(_utils_timing__WEBPACK_IMPORTED_MODULE_10__.DEFER_NOTIFICATIONS_MS);
  const {
    data: notifications = [],
    isLoading,
    refetch
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__.useNotificationsQuery)();
  const contentReady = listReady && !isLoading;
  (0,_hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_3__.usePageRouteReady)(contentReady);
  const [activeCategory, setActiveCategory] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("all");
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_6__.useConfirmDialog)({
    cancelText: "取消"
  });
  const unreadCount = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => notifications.filter(item => !item.read).length, [notifications]);
  const filteredNotifications = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter(item => (0,_utils_notificationDisplay__WEBPACK_IMPORTED_MODULE_11__.getNotificationCategory)(item.meta) === activeCategory);
  }, [activeCategory, notifications]);
  const categoryCounts = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const counts = {
      all: notifications.length,
      comment: 0,
      like: 0,
      system: 0,
      general: 0
    };
    for (const item of notifications) {
      const category = (0,_utils_notificationDisplay__WEBPACK_IMPORTED_MODULE_11__.getNotificationCategory)(item.meta);
      counts[category] += 1;
    }
    return counts;
  }, [notifications]);
  const handleMarkAll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    if (unreadCount === 0) return;
    await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__.markAllNotificationsAsRead)();
    await refetch();
  }, [refetch, unreadCount]);
  const handleClearAll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    if (notifications.length === 0) return;
    const confirmed = await confirm({
      title: "清空全部消息",
      message: "确定要删除所有消息吗？此操作不可撤销。",
      confirmText: "清空全部"
    });
    if (!confirmed) return;
    await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__.clearAllNotificationsAndInvalidate)();
    await refetch();
  }, [confirm, notifications.length, refetch]);
  const handleDelete = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (event, item) => {
    event.stopPropagation();
    const confirmed = await confirm({
      title: "删除消息",
      message: "确定要删除这条消息吗？",
      confirmText: "删除"
    });
    if (!confirmed) return;
    await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__.deleteNotificationAndInvalidate)(item.id);
    await refetch();
  }, [confirm, refetch]);
  const handleItemClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async item => {
    if (!item.read) {
      await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_5__.markNotificationAsRead)(item.id);
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_7__.navigateFromNotification)(item.meta);
  }, []);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
    "data-cmp": "Notifications",
    className: "s-notifications",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PageNavigation__WEBPACK_IMPORTED_MODULE_4__["default"], {
      title: "\u6D88\u606F\u901A\u77E5",
      fallback: _utils_route__WEBPACK_IMPORTED_MODULE_7__.ROUTES.HOME
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
      className: "s-notifications__main",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-notifications__tabs",
        role: "tablist",
        children: CATEGORY_TABS.map(category => {
          const count = categoryCounts[category];
          const isActive = activeCategory === category;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Button, {
            role: "tab",
            "aria-selected": isActive,
            className: `s-notifications__tab${isActive ? " s-notifications__tab--active" : ""}`,
            onClick: () => setActiveCategory(category),
            children: [category === "all" ? "全部" : category === "comment" ? "评论" : category === "like" ? "点赞" : "系统", count > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
              className: "s-notifications__tab-count",
              children: count
            })]
          }, category);
        })
      }), notifications.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-notifications__toolbar",
        children: [unreadCount > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Button, {
          className: "s-notifications__toolbar-btn",
          onClick: () => void handleMarkAll(),
          children: "\u5168\u90E8\u5DF2\u8BFB"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Button, {
          className: "s-notifications__toolbar-btn",
          onClick: () => void handleClearAll(),
          children: "\u6E05\u7A7A\u5168\u90E8"
        })]
      }), isLoading || !listReady ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_ThemedPageLoader__WEBPACK_IMPORTED_MODULE_1__["default"], {
        variant: "skeleton-feed",
        minHeight: 280
      }) : filteredNotifications.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-notifications__empty",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Bell, {
          size: 40,
          className: "s-notifications__empty-icon"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
          className: "s-notifications__empty-title",
          children: "\u6682\u65E0\u6D88\u606F"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
          className: "s-notifications__empty-desc",
          children: "\u8BC4\u8BBA\u3001\u70B9\u8D5E\u548C\u6D3B\u52A8\u53D8\u66F4\u4F1A\u5728\u8FD9\u91CC\u663E\u793A\u3002"
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-notifications__list",
        children: filteredNotifications.map(item => {
          const display = (0,_utils_notificationDisplay__WEBPACK_IMPORTED_MODULE_11__.resolveNotificationText)(item);
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
            className: `s-notifications__item${item.read ? "" : " s-notifications__item--unread"}`,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Button, {
              className: "s-notifications__item-main",
              onClick: () => void handleItemClick(item),
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
                className: `s-notifications__icon s-notifications__icon--${display.category}`,
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(NotificationIcon, {
                  category: display.category
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
                className: "s-notifications__content",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
                  className: "s-notifications__title-row",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
                    className: "s-notifications__title",
                    children: display.title
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
                    className: "s-notifications__time",
                    children: (0,_utils_notificationDisplay__WEBPACK_IMPORTED_MODULE_11__.formatNotificationTimeAgo)(item.createdAt)
                  })]
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
                  className: "s-notifications__body",
                  children: display.body
                })]
              }), !item.read && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
                className: "s-notifications__dot",
                "aria-hidden": true
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Button, {
              className: "s-notifications__delete",
              "aria-label": "\u5220\u9664",
              onClick: event => void handleDelete(event, item),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Trash2, {
                size: 16
              })
            })]
          }, item.id);
        })
      })]
    }), confirmDialog]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (NotificationsPage);

/***/ }),

/***/ "./src/pages/notifications/index.tsx":
/*!*******************************************!*\
  !*** ./src/pages/notifications/index.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/notifications/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/notifications/index!./src/pages/notifications/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/notifications/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_notifications_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/notificationDisplay.ts":
/*!******************************************!*\
  !*** ./src/utils/notificationDisplay.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatNotificationTimeAgo: function() { return /* binding */ formatNotificationTimeAgo; },
/* harmony export */   getNotificationCategory: function() { return /* binding */ getNotificationCategory; },
/* harmony export */   resolveNotificationText: function() { return /* binding */ resolveNotificationText; }
/* harmony export */ });
function getNotificationCategory(meta) {
  const type = meta?.type;
  if (type === "like") return "like";
  if (type === "comment" || type === "comment_reply") return "comment";
  if (type === "activity_update" || type === "post_rejected" || type === "post_hidden" || type === "activity") {
    return "system";
  }
  return "general";
}
function resolveNotificationText(item) {
  const category = getNotificationCategory(item.meta);
  return {
    title: item.title,
    body: item.body,
    category
  };
}
function formatNotificationTimeAgo(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/notifications/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map