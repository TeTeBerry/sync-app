"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/index/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx":
/*!****************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx ***!
  \****************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _Users_berry_sync_sync_app_node_modules_babel_runtime_helpers_esm_interopRequireWildcard_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/interopRequireWildcard.js */ "./node_modules/@babel/runtime/helpers/esm/interopRequireWildcard.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_BottomNav__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/BottomNav */ "./src/components/BottomNav.tsx");
/* harmony import */ var _components_PageLoadingFallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/PageLoadingFallback */ "./src/components/PageLoadingFallback.tsx");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useDeferredMount */ "./src/hooks/useDeferredMount.ts");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _utils_timing__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../utils/timing */ "./src/utils/timing.ts");
/* harmony import */ var _components_HomeCountdownCard__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/HomeCountdownCard */ "./src/pages/index/components/HomeCountdownCard.tsx");
/* harmony import */ var _components_HomeFeaturedEvents__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/HomeFeaturedEvents */ "./src/pages/index/components/HomeFeaturedEvents.tsx");
/* harmony import */ var _components_HomePlazaHero__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/HomePlazaHero */ "./src/pages/index/components/HomePlazaHero.tsx");
/* harmony import */ var _hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../hooks/useNavBarInsets */ "./src/hooks/useNavBarInsets.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");


















const LazyHomeActivityFeed = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(async () => {
  const mod = await Promise.resolve().then(() => (0,_Users_berry_sync_sync_app_node_modules_babel_runtime_helpers_esm_interopRequireWildcard_js__WEBPACK_IMPORTED_MODULE_14__["default"])(__webpack_require__(/*! ./components/HomeActivityFeed */ "./src/pages/index/components/HomeActivityFeed.tsx")));
  return {
    default: mod.HomeActivityFeed
  };
});
const Home = () => {
  const belowFoldReady = (0,_hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_5__.useDeferredMount)(_utils_timing__WEBPACK_IMPORTED_MODULE_15__.DEFER_BELOW_FOLD_MS);
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_4__.useConfirmDialog)({
    cancelText: "取消"
  });
  const {
    data: summary
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.useHomeSummary)();
  const heat = summary?.heat;
  const {
    items: featuredEvents
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.useFeaturedEvents)();
  const nearestUpcoming = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.useNearestUpcomingForCountdown)({
    enabled: belowFoldReady
  });
  const {
    data: unreadCount = 0
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.useNotificationUnreadCount)();
  const {
    posts,
    refetch: refetchPosts
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.usePopularPosts)({
    enabled: belowFoldReady
  });
  const openAiAssistant = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(message => {
    if (message?.trim()) {
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goAiAssistant)({
        initialMessage: message.trim()
      });
      return;
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.go)(_utils_route__WEBPACK_IMPORTED_MODULE_8__.ROUTES.AI_ASSISTANT);
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.preloadHotRoutes)();
  }, []);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useDidShow)(() => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.preloadHotRoutes)();
  });
  const handleNotification = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goNotifications)();
  }, []);
  const openEventDetail = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(event => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goEventDetail)(event.id);
  }, []);
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
      void refetchPosts();
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "删除失败",
        icon: "none"
      });
    });
  }, [confirm, refetchPosts]);
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
    void refetchPosts();
  }, [refetchPosts]);
  const activeTeamCount = heat?.people ?? 0;
  const navInsets = (0,_hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_12__.useNavBarInsets)();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
    "data-cmp": "Home",
    className: "s-page-with-tabbar",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.ScrollView, {
      scrollY: true,
      enhanced: true,
      showScrollbar: false,
      className: "s-page-with-tabbar__scroll s-home__main s-scrollbar-none",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
        className: "s-home__scroll-inner",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_HomePlazaHero__WEBPACK_IMPORTED_MODULE_11__.HomePlazaHero, {
          capsulePaddingTop: navInsets.paddingTop,
          capsulePaddingRight: navInsets.paddingRight,
          unreadCount: unreadCount,
          onAgentClick: () => openAiAssistant(),
          onNotificationClick: handleNotification
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_HomeCountdownCard__WEBPACK_IMPORTED_MODULE_9__.HomeCountdownCard, {
          eventName: nearestUpcoming?.title,
          targetAt: nearestUpcoming?.startAt ?? null
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_HomeFeaturedEvents__WEBPACK_IMPORTED_MODULE_10__.HomeFeaturedEvents, {
          items: featuredEvents,
          onEventClick: openEventDetail,
          onJoinClick: openEventDetail
        }), belowFoldReady ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
          fallback: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_PageLoadingFallback__WEBPACK_IMPORTED_MODULE_3__["default"], {
            minHeight: 240
          }),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(LazyHomeActivityFeed, {
            items: posts,
            onSeeAll: () => (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.go)(_utils_route__WEBPACK_IMPORTED_MODULE_8__.ROUTES.ALL_POSTS),
            onDelete: handleDeletePost,
            onLike: handleLikePost,
            onCommentSubmitted: handleCommentSubmitted
          })
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_PageLoadingFallback__WEBPACK_IMPORTED_MODULE_3__["default"], {
          minHeight: 240
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
          className: "s-home__heat s-tabbar-offset",
          "aria-label": "Today heat",
          children: [activeTeamCount, " \u4EBA\u6B63\u5728\u53D1\u73B0\u6D3B\u52A8"]
        })]
      })
    }), confirmDialog, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_2__.BottomNavSlot, {})]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (Home);

/***/ }),

/***/ "./src/components/ActivityStatusBadge.tsx":
/*!************************************************!*\
  !*** ./src/components/ActivityStatusBadge.tsx ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ActivityStatusBadge: function() { return /* binding */ ActivityStatusBadge; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const ActivityStatusBadge = ({
  date,
  title,
  status: statusProp,
  alwaysShow = false,
  className
}) => {
  const status = statusProp ?? (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_2__.getActivityStatusFromActivity)(date, title);
  if (!alwaysShow && !(0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_2__.shouldShowActivityStatusBadge)(status)) {
    return null;
  }
  const badgeClass = [(0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_2__.activityStatusBadgeClass)(status), className].filter(Boolean).join(" ");
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
    className: badgeClass,
    children: (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_2__.activityStatusText)(status)
  });
};

/***/ }),

/***/ "./src/components/PageLoadingFallback.tsx":
/*!************************************************!*\
  !*** ./src/components/PageLoadingFallback.tsx ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ PageLoadingFallback; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



function PageLoadingFallback({
  minHeight = 120
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: "s-page-loading",
    style: {
      minHeight
    },
    role: "status",
    "aria-live": "polite",
    "aria-busy": "true",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
      className: "s-page-loading__dot"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
      className: "s-page-loading__dot"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
      className: "s-page-loading__dot"
    })]
  });
}

/***/ }),

/***/ "./src/hooks/useCountdown.ts":
/*!***********************************!*\
  !*** ./src/hooks/useCountdown.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCountdown: function() { return /* binding */ useCountdown; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_countdown__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/countdown */ "./src/utils/countdown.ts");


function useCountdown(target) {
  const [parts, setParts] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => target ? (0,_utils_countdown__WEBPACK_IMPORTED_MODULE_1__.getCountdownParts)(target) : _utils_countdown__WEBPACK_IMPORTED_MODULE_1__.EMPTY_COUNTDOWN_PARTS);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!target) {
      setParts(_utils_countdown__WEBPACK_IMPORTED_MODULE_1__.EMPTY_COUNTDOWN_PARTS);
      return;
    }
    const tick = () => setParts((0,_utils_countdown__WEBPACK_IMPORTED_MODULE_1__.getCountdownParts)(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return parts;
}

/***/ }),

/***/ "./src/pages/index/components/HomeActivityFeed.tsx":
/*!*********************************************************!*\
  !*** ./src/pages/index/components/HomeActivityFeed.tsx ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeActivityFeed: function() { return /* binding */ HomeActivityFeed; }
/* harmony export */ });
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/ui */ "./src/components/ui/index.ts");
/* harmony import */ var _components_FeedPostList__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/FeedPostList */ "./src/components/FeedPostList.tsx");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");





const HomeActivityFeed = ({
  items,
  onSeeAll,
  onDelete,
  onLike,
  onCommentSubmitted
}) => {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: "s-home-feed",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "s-home-feed__head",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        className: "s-home-feed__title",
        children: "\u66F4\u591A\u70ED\u95E8\u5E16\u5B50"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_components_ui__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "s-home-feed__link",
        onClick: onSeeAll,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          className: "s-home-feed__link-text",
          children: "\u67E5\u770B\u5168\u90E8"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.ChevronRight, {
          size: 16,
          color: "#8e8e93"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_components_FeedPostList__WEBPACK_IMPORTED_MODULE_1__.FeedPostList, {
      items: items,
      onDelete: onDelete,
      onLike: onLike,
      onCommentSubmitted: onCommentSubmitted
    })]
  });
};

/***/ }),

/***/ "./src/pages/index/components/HomeCountdownCard.tsx":
/*!**********************************************************!*\
  !*** ./src/pages/index/components/HomeCountdownCard.tsx ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeCountdownCard: function() { return /* binding */ HomeCountdownCard; }
/* harmony export */ });
/* harmony import */ var _hooks_useCountdown__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../hooks/useCountdown */ "./src/hooks/useCountdown.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



const HomeCountdownCard = ({
  eventName,
  targetAt
}) => {
  const hasTarget = targetAt != null && eventName != null && eventName.length > 0;
  const parts = (0,_hooks_useCountdown__WEBPACK_IMPORTED_MODULE_0__.useCountdown)(hasTarget ? targetAt : null);
  const ariaLabel = hasTarget ? `${eventName} countdown` : "Upcoming activity countdown";
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
    className: "s-home-countdown",
    "aria-label": ariaLabel,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
      className: "s-home-countdown__timer",
      children: parts.map((part, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
        className: "s-home-countdown__segment",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
          className: "s-home-countdown__part",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
            className: "s-home-countdown__num-wrap",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
              className: part.accent ? "s-home-countdown__num s-home-countdown__num--accent" : "s-home-countdown__num",
              children: part.value
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
              className: "s-home-countdown__unit",
              children: part.unit
            })]
          })
        }), index < parts.length - 1 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
          className: "s-home-countdown__sep",
          children: "\xB7"
        }) : null]
      }, part.unit))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
      className: "s-home-countdown__copy",
      children: hasTarget ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, {
        children: ["\u8DDD", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
          className: "s-home-countdown__copy-event",
          children: eventName
        }), "\u5F00\u573A\u8FD8\u6709"]
      }) : "暂无即将开始的活动"
    })]
  });
};

/***/ }),

/***/ "./src/pages/index/components/HomeFeaturedEvents.tsx":
/*!***********************************************************!*\
  !*** ./src/pages/index/components/HomeFeaturedEvents.tsx ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeFeaturedEvents: function() { return /* binding */ HomeFeaturedEvents; }
/* harmony export */ });
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_ActivityStatusBadge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/ActivityStatusBadge */ "./src/components/ActivityStatusBadge.tsx");
/* harmony import */ var _components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/ImageWithFallback */ "./src/components/ImageWithFallback.tsx");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/ui */ "./src/components/ui/index.ts");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");









const HomeFeaturedEvents = ({
  items,
  onEventClick,
  onJoinClick
}) => {
  if (items.length === 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
      className: "s-home-featured",
      "aria-label": "Featured events",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
        className: "s-home-featured__empty",
        children: "\u6682\u65E0\u8FDB\u884C\u4E2D\u7684\u6D3B\u52A8"
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
    className: "s-home-featured",
    "aria-label": "Featured events",
    children: items.map((event, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(HomeFeaturedEventRow, {
      event: event,
      index: index,
      onEventClick: onEventClick,
      onJoinClick: onJoinClick
    }, event.id))
  });
};
function HomeFeaturedEventRow({
  event,
  index,
  onEventClick,
  onJoinClick
}) {
  const status = (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_7__.getActivityStatusFromActivity)(event.date, event.title);
  const isJoinNavigating = (0,_utils_route__WEBPACK_IMPORTED_MODULE_4__.useRouteTransitionActive)(event.id);
  const thumbSrc = (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_3__.thumbnailImageUrl)(event.image, 184);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
    className: ["s-home-event", (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_7__.activityStatusCardClass)(status)].filter(Boolean).join(" "),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_1__.ImageWithFallback, {
      src: thumbSrc,
      alt: event.title,
      priority: index === 0,
      wrapperClassName: "s-home-event__media",
      fallbackWrapperClassName: "s-home-event__media s-home-event__media--logo",
      fallback: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
        children: event.logo?.replace(/\n/g, " ")
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
      className: "s-home-event__content",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_components_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
        className: "s-home-event__main",
        onClick: () => onEventClick(event),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
          className: "s-home-event__title-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__title",
            children: event.title
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
            className: "s-home-event__title-badges",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_ActivityStatusBadge__WEBPACK_IMPORTED_MODULE_0__.ActivityStatusBadge, {
              date: event.date,
              title: event.title,
              status: status
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
          className: "s-home-event__date-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__date",
            children: event.date
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__at",
            children: " at "
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__venue",
            children: event.venue
          })]
        }), event.distance ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
          className: "s-home-event__distance",
          children: event.distance
        }) : null]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
        className: "s-home-event__footer",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
          className: "s-home-event__meta",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
            className: "s-home-event__team",
            "aria-hidden": true,
            children: event.guests.map((guest, guestIndex) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Image, {
              src: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_3__.thumbnailImageUrl)(guest, 48) ?? guest,
              className: "s-home-event__team-avatar",
              mode: "aspectFill",
              lazyLoad: true,
              style: {
                zIndex: event.guests.length - guestIndex
              }
            }, guest))
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__count",
            children: event.attendeeCount
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__.Users, {
            size: 14,
            color: "#ffffff",
            className: "s-home-event__count-icon"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: ["s-home-event__join", isJoinNavigating ? "s-home-event__join--loading" : ""].filter(Boolean).join(" "),
          disabled: status === "ended" || isJoinNavigating,
          onClick: () => onJoinClick(event),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Text, {
            className: "s-home-event__join-text",
            children: isJoinNavigating ? "跳转中…" : status === "ended" ? "已结束" : "加入"
          })
        })]
      })]
    })]
  });
}

/***/ }),

/***/ "./src/pages/index/components/HomePlazaHero.tsx":
/*!******************************************************!*\
  !*** ./src/pages/index/components/HomePlazaHero.tsx ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomePlazaHero: function() { return /* binding */ HomePlazaHero; }
/* harmony export */ });
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/ui */ "./src/components/ui/index.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const HomePlazaHero = ({
  unreadCount,
  capsulePaddingTop = 0,
  capsulePaddingRight = 0,
  onAgentClick,
  onNotificationClick
}) => {
  const heroStyle = capsulePaddingTop > 0 || capsulePaddingRight > 16 ? {
    ...(capsulePaddingTop > 0 ? {
      paddingTop: `${capsulePaddingTop}px`
    } : {}),
    ...(capsulePaddingRight > 16 ? {
      paddingRight: `${capsulePaddingRight - 16}px`
    } : {})
  } : undefined;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
    className: "s-home-hero",
    style: heroStyle,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
      className: "s-home-hero__brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.AudioWaveform, {
        size: 24,
        color: "#4cc9f0",
        className: "s-home-hero__icon"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
        className: "s-home-hero__logo",
        children: "SYNC"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
      className: "s-home-hero__actions",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_ui__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "s-home-icon-btn s-home-icon-btn--primary",
        onClick: onAgentClick,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.Sparkles, {
          size: 18,
          color: "#ffffff"
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components_ui__WEBPACK_IMPORTED_MODULE_0__.Button, {
        className: "s-home-icon-btn",
        "aria-label": "Notifications",
        onClick: onNotificationClick,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.Bell, {
          size: 18,
          color: "#ffffff"
        }), unreadCount > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
          className: "s-home-icon-btn__dot"
        })]
      })]
    })]
  });
};

/***/ }),

/***/ "./src/pages/index/index.tsx":
/*!***********************************!*\
  !*** ./src/pages/index/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","disableScroll":true,"backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/index/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/countdown.ts":
/*!********************************!*\
  !*** ./src/utils/countdown.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EMPTY_COUNTDOWN_PARTS: function() { return /* binding */ EMPTY_COUNTDOWN_PARTS; },
/* harmony export */   getCountdownParts: function() { return /* binding */ getCountdownParts; }
/* harmony export */ });
function pad2(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}
const EMPTY_COUNTDOWN_PARTS = [{
  value: "--",
  unit: "d"
}, {
  value: "--",
  unit: "h"
}, {
  value: "--",
  unit: "m"
}, {
  value: "--",
  unit: "s",
  accent: true
}];
function getCountdownParts(target, now = new Date()) {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  return [{
    value: pad2(days),
    unit: "d"
  }, {
    value: pad2(hours),
    unit: "h"
  }, {
    value: pad2(minutes),
    unit: "m"
  }, {
    value: pad2(seconds),
    unit: "s",
    accent: true
  }];
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/interopRequireWildcard.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/interopRequireWildcard.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _interopRequireWildcard; }
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");

function _interopRequireWildcard(e, t) {
  if ("function" == typeof WeakMap) var r = new WeakMap(),
    n = new WeakMap();
  return (_interopRequireWildcard = function _interopRequireWildcard(e, t) {
    if (!t && e && e.__esModule) return e;
    var o,
      i,
      f = {
        __proto__: null,
        "default": e
      };
    if (null === e || "object" != (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(e) && "function" != typeof e) return f;
    if (o = t ? n : r) {
      if (o.has(e)) return o.get(e);
      o.set(e, f);
    }
    for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]);
    return f;
  })(e, t);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _typeof; }
/* harmony export */ });
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/index/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map