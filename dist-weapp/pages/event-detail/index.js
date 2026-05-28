"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/event-detail/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/event-detail/index!./src/pages/event-detail/index.tsx":
/*!******************************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/event-detail/index!./src/pages/event-detail/index.tsx ***!
  \******************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _components_BottomNav__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/BottomNav */ "./src/components/BottomNav.tsx");
/* harmony import */ var _components_ThemedPageLoader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/ThemedPageLoader */ "./src/components/ThemedPageLoader.tsx");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../hooks/usePageRouteReady */ "./src/hooks/usePageRouteReady.ts");
/* harmony import */ var _hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../hooks/useDeferredMount */ "./src/hooks/useDeferredMount.ts");
/* harmony import */ var _utils_timing__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../utils/timing */ "./src/utils/timing.ts");
/* harmony import */ var _stores_navigationStore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../stores/navigationStore */ "./src/stores/navigationStore.ts");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/aiShortcutTags */ "./src/utils/aiShortcutTags.ts");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var _utils_formatPostPublishTime__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../utils/formatPostPublishTime */ "./src/utils/formatPostPublishTime.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _components_EventPostsVirtualList__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/EventPostsVirtualList */ "./src/pages/event-detail/components/EventPostsVirtualList.tsx");
/* harmony import */ var _hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../hooks/useNavBarInsets */ "./src/hooks/useNavBarInsets.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






















const EventDetailPage = () => {
  const router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useRouter)();
  const navInsets = (0,_hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_14__.useNavBarInsets)();
  const [scrollIntoView, setScrollIntoView] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const activeActivityLegacyId = (0,_stores_navigationStore__WEBPACK_IMPORTED_MODULE_8__.useNavigationStore)(state => state.activeActivityLegacyId);
  const feedReady = (0,_hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_7__.useDeferredMount)(_utils_timing__WEBPACK_IMPORTED_MODULE_16__.DEFER_EVENT_POSTS_MS);
  const composerReady = (0,_hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_7__.useDeferredMount)(0);
  const eventId = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const fromParams = Number(router.params.id);
    if (Number.isFinite(fromParams) && fromParams > 0) {
      return fromParams;
    }
    if (activeActivityLegacyId != null && activeActivityLegacyId > 0) {
      return activeActivityLegacyId;
    }
    return NaN;
  }, [activeActivityLegacyId, router.params.id]);
  const highlightPostId = router.params.postId?.trim() || "";
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      _stores_navigationStore__WEBPACK_IMPORTED_MODULE_8__.useNavigationStore.getState().setActiveActivityLegacyId(eventId);
      return;
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.endRouteTransition)();
  }, [eventId]);
  const activityQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.useActivityDetailQuery)(eventId);
  const postsQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.useEventPostsQuery)(eventId, {
    enabled: feedReady
  });
  const currentUserQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.useCurrentUserQuery)();
  const apiEnabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_10__.isApiEnabled)();
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_5__.useConfirmDialog)({
    cancelText: "取消"
  });
  const [prompt, setPrompt] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
  const [shortcutTags, setShortcutTags] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_11__.getTopAiShortcutTags)());
  const [appliedPostIds, setAppliedPostIds] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Set());
  const [expandedCommentPostIds, setExpandedCommentPostIds] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Set());
  const title = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityStatus = (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_17__.getActivityStatusFromActivity)(activityDate, title);
  const headerReady = !activityQuery.isLoading && Boolean(title) && !activityQuery.isError;
  (0,_hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_6__.usePageRouteReady)(headerReady);
  const metaLine = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!activityQuery.data) return "";
    const parts = [activityQuery.data.date, activityQuery.data.location].filter(Boolean);
    return parts.join(" · ");
  }, [activityQuery.data]);
  const postItems = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    return (postsQuery.data ?? []).map(item => {
      const post = {
        id: item.id,
        userId: item.userId,
        name: item.name,
        location: item.location,
        time: item.time,
        createdAt: item.createdAt,
        body: item.body,
        tags: item.tags,
        likes: item.likes,
        liked: item.liked,
        comments: item.comments,
        avatar: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_12__.sanitizeRemoteImageUrl)(item.avatar) ?? item.avatar,
        status: item.status,
        contentTypes: item.contentTypes,
        images: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_12__.sanitizeImageList)(item.images)
      };
      const publishTimeLabel = post.createdAt ? (0,_utils_formatPostPublishTime__WEBPACK_IMPORTED_MODULE_18__.formatPostPublishTime)(post.createdAt) : post.time;
      return {
        post,
        publishTimeLabel
      };
    });
  }, [postsQuery.data]);
  const handleApply = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(postId => {
    if (appliedPostIds.has(postId)) return;
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.applyToPostAndInvalidate)(postId).then(result => {
      setAppliedPostIds(prev => new Set(prev).add(postId));
      const toastTitle = result.alreadyApplied ? "已申请" : "申请成功";
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: toastTitle,
        icon: "success"
      });
    }).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "申请失败",
      icon: "none"
    }));
  }, [appliedPostIds]);
  const handleLikePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(postId => {
    if (!apiEnabled) return;
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.likePostAndInvalidate)(postId).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "请求失败，请稍后重试",
      icon: "none"
    }));
  }, [apiEnabled]);
  const scrollToElement = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(elementId => {
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView(elementId), 0);
  }, []);
  const togglePostComments = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(postId => {
    setExpandedCommentPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);
  const handleDeletePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async post => {
    const ok = await confirm({
      title: "确认删除",
      message: "删除后无法恢复，确定要删除这条帖子吗？",
      confirmText: "删除"
    });
    if (!ok) return;
    if (!apiEnabled) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已删除",
        icon: "success"
      });
      return;
    }
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.deletePostAndInvalidate)(post.id).then(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已删除",
        icon: "success"
      });
    }).catch(() => {
      void postsQuery.refetch();
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "删除失败",
        icon: "none"
      });
    });
  }, [apiEnabled, confirm, postsQuery]);
  const handleCommentSubmitted = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    void postsQuery.refetch();
  }, [postsQuery]);
  const handleCompletePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async postId => {
    const ok = await confirm({
      title: "确认标记为已组队",
      message: "标记后该帖子将结束招募，同类型帖子可重新发布。确定要继续吗？",
      confirmText: "确认"
    });
    if (!ok) return;
    if (!apiEnabled) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已标记为已组队",
        icon: "success"
      });
      return;
    }
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_9__.updatePostAndInvalidate)(postId, {
      status: "completed"
    }).then(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已标记为已组队",
        icon: "success"
      });
    }).catch(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "标记失败",
        icon: "none"
      });
    });
  }, [apiEnabled, confirm]);
  const bumpShortcutTagUsage = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(tag => {
    (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_11__.recordAiShortcutTagUse)(tag);
    setShortcutTags((0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_11__.getTopAiShortcutTags)());
  }, []);
  const openAi = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(message => {
    const trimmed = message?.trim();
    if (trimmed && (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_11__.isAiShortcutTag)(trimmed)) {
      bumpShortcutTagUsage(trimmed);
    }
    setPrompt("");
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.goAiAssistant)({
      ...(trimmed ? {
        initialMessage: trimmed
      } : {}),
      activityLegacyId: Number.isNaN(eventId) ? undefined : eventId
    });
  }, [bumpShortcutTagUsage, eventId]);
  const handleShortcutTag = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(tag => {
    bumpShortcutTagUsage(tag);
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.goAiAssistant)({
      initialMessage: tag,
      activityLegacyId: eventId
    });
  }, [bumpShortcutTagUsage, eventId]);
  if (Number.isNaN(eventId) || eventId <= 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
      className: "s-event-detail s-page-with-tabbar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
        className: "s-event-detail__fallback",
        children: "\u6D3B\u52A8\u4E0D\u5B58\u5728"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_3__.BottomNavSlot, {})]
    });
  }
  if (activityQuery.isError && !activityQuery.isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
      className: "s-event-detail s-page-with-tabbar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
        className: "s-event-detail__fallback",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
          children: "\u6D3B\u52A8\u4FE1\u606F\u52A0\u8F7D\u5931\u8D25"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Button, {
          className: "s-event-detail__retry",
          onClick: () => void activityQuery.refetch(),
          children: "\u91CD\u8BD5"
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_3__.BottomNavSlot, {})]
    });
  }
  if (!activityQuery.isLoading && !title) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
      className: "s-event-detail s-page-with-tabbar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
        className: "s-event-detail__fallback",
        children: "\u6D3B\u52A8\u4E0D\u5B58\u5728"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_3__.BottomNavSlot, {})]
    });
  }
  const postsLoading = !feedReady || postsQuery.isLoading;
  const showHeaderSkeleton = activityQuery.isLoading || !title;
  const headerStyle = navInsets.paddingTop > 0 || navInsets.paddingRight > 16 ? {
    ...(navInsets.paddingTop > 0 ? {
      paddingTop: `${navInsets.paddingTop}px`
    } : {}),
    ...(navInsets.paddingRight > 16 ? {
      paddingRight: `${navInsets.paddingRight}px`
    } : {})
  } : undefined;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
    "data-cmp": "EventDetail",
    className: ["s-event-detail", "s-page-with-tabbar", (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_17__.activityStatusCardClass)(activityStatus)].filter(Boolean).join(" "),
    children: [showHeaderSkeleton ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_ThemedPageLoader__WEBPACK_IMPORTED_MODULE_4__["default"], {
      variant: "skeleton-event",
      overlay: true
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.ScrollView, {
      scrollY: true,
      enhanced: true,
      showScrollbar: false,
      scrollIntoView: scrollIntoView,
      className: "s-page-with-tabbar__scroll s-event-detail__main s-scrollbar-none",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
        className: "s-event-detail__scroll-inner s-tabbar-offset",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
          className: "s-event-detail__header",
          style: headerStyle,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Button, {
            className: "s-event-detail__back",
            "aria-label": "\u8FD4\u56DE",
            onClick: () => (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.go)(_utils_route__WEBPACK_IMPORTED_MODULE_2__.ROUTES.HOME),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_20__.ChevronLeft, {
              size: 22
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
            className: "s-event-detail__head-main",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
              className: "s-event-detail__title-row",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
                className: "s-event-detail__title",
                children: title ?? ""
              })
            }), metaLine ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
              className: "s-event-detail__meta",
              children: metaLine
            }) : null]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Button, {
            className: "s-event-detail__map-btn",
            "aria-label": "\u5730\u56FE",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_20__.Map, {
              size: 18
            })
          })]
        }), composerReady ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
          className: "s-event-detail__ai",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
            className: "s-event-detail__ai-head",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_20__.Sparkles, {
              size: 14
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
              children: "\u544A\u8BC9\u6211\u4F60\u7684\u9700\u6C42 ai\u7CBE\u51C6\u5339\u914D"
            })]
          }), shortcutTags.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
            className: "s-event-detail__ai-tags",
            children: shortcutTags.map(tag => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Button, {
              className: "s-event-detail__ai-tag",
              onClick: () => handleShortcutTag(tag),
              children: tag
            }, tag))
          }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
            className: "s-event-detail__ai-input",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Input, {
              className: "s-event-detail__ai-input__field",
              value: prompt,
              placeholder: "\u544A\u8BC9\u6211\u4F60\u7684\u9700\u6C42...",
              onInput: e => setPrompt(e.target.value),
              onKeyDown: e => {
                if (e.key === "Enter" && prompt.trim()) openAi(prompt);
              }
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Button, {
              className: "s-event-detail__ai-send",
              "aria-label": "\u53D1\u9001",
              onClick: () => openAi(prompt),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_20__.Send, {
                size: 20
              })
            })]
          })]
        }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.View, {
          className: "s-event-detail__posts",
          children: postsLoading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_ThemedPageLoader__WEBPACK_IMPORTED_MODULE_4__["default"], {
            variant: "inline",
            label: "\u52A0\u8F7D\u7EC4\u961F\u5E16\u2026",
            minHeight: 80
          }) : postItems.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
            className: "s-event-detail__empty",
            children: "\u6682\u65E0\u7EC4\u961F\u5E16\uFF0C\u6765\u53D1\u5E03\u7B2C\u4E00\u6761\u5427"
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_EventPostsVirtualList__WEBPACK_IMPORTED_MODULE_13__.EventPostsVirtualList, {
            onScrollToPostId: scrollToElement,
            items: postItems,
            highlightPostId: highlightPostId,
            expandedCommentPostIds: expandedCommentPostIds,
            appliedPostIds: appliedPostIds,
            apiEnabled: apiEnabled,
            currentUserAvatar: currentUserQuery.data?.avatar,
            onLike: handleLikePost,
            onToggleComments: togglePostComments,
            onDelete: handleDeletePost,
            onApply: handleApply,
            onComplete: handleCompletePost,
            onCommentSubmitted: handleCommentSubmitted
          })
        }), postItems.length > 0 && !postsLoading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_19__.Text, {
          className: "s-event-detail__end",
          children: "\u5DF2\u7ECF\u5230\u5E95\u5566 ~"
        }) : null]
      })
    }), confirmDialog, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_3__.BottomNavSlot, {})]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (EventDetailPage);

/***/ }),

/***/ "./src/pages/event-detail/components/EventPostCard.tsx":
/*!*************************************************************!*\
  !*** ./src/pages/event-detail/components/EventPostCard.tsx ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventPostCard: function() { return /* binding */ EventPostCard; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_PostActionMenu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/PostActionMenu */ "./src/components/PostActionMenu.tsx");
/* harmony import */ var _components_PostCommentSection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/PostCommentSection */ "./src/components/PostCommentSection.tsx");
/* harmony import */ var _components_PostStatusBadge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../components/PostStatusBadge */ "./src/components/PostStatusBadge.tsx");
/* harmony import */ var _components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../components/ImageWithFallback */ "./src/components/ImageWithFallback.tsx");
/* harmony import */ var _components_ContentTypeBadge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../components/ContentTypeBadge */ "./src/components/ContentTypeBadge.tsx");
/* harmony import */ var _components_PostImageGrid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../components/PostImageGrid */ "./src/components/PostImageGrid.tsx");
/* harmony import */ var _utils_postOwnership__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../utils/postOwnership */ "./src/utils/postOwnership.ts");
/* harmony import */ var _utils_postActionColors__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../utils/postActionColors */ "./src/utils/postActionColors.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");












function EventPostCardInner({
  post,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  applied,
  apiEnabled,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onApply,
  onComplete,
  onCommentSubmitted
}) {
  const isOwn = (0,_utils_postOwnership__WEBPACK_IMPORTED_MODULE_7__.isCurrentUserPostAuthor)(post.name, post.userId);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
    className: `s-event-post${highlighted ? " s-event-post--highlight" : ""}`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
      className: "s-event-post__header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_4__.ImageWithFallback, {
        src: post.avatar,
        alt: post.name,
        imageClassName: "s-event-post__avatar",
        placeholderClassName: "s-event-post__avatar s-event-post__avatar--placeholder",
        fallback: post.name.slice(0, 1)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
        className: "s-event-post__head-main",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
          className: "s-event-post__top",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Text, {
            className: "s-event-post__user-line",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Text, {
              className: "s-event-post__user-name",
              children: post.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Text, {
              className: "s-event-post__user-meta",
              children: [post.location, " \xB7 ", publishTimeLabel, post.images?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PostImageGrid__WEBPACK_IMPORTED_MODULE_6__.PostImageCount, {
                count: post.images.length
              }) : null]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
            className: "s-event-post__head-actions",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PostStatusBadge__WEBPACK_IMPORTED_MODULE_3__.PostStatusBadge, {
              status: post.status,
              variant: "event",
              isOwn: isOwn
            }), !isOwn ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PostActionMenu__WEBPACK_IMPORTED_MODULE_1__.PostActionMenu, {
              postId: post.id,
              authorUserId: post.userId
            }) : null]
          })]
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Text, {
      className: "s-event-post__text",
      children: post.body
    }), post.images?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PostImageGrid__WEBPACK_IMPORTED_MODULE_6__.PostImageGrid, {
      images: post.images
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_ContentTypeBadge__WEBPACK_IMPORTED_MODULE_5__.ContentTypeBadge, {
      types: post.contentTypes
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
      className: "s-event-post__tags",
      children: post.tags.map(tag => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Text, {
        className: "s-event-post__tag",
        children: tag
      }, tag))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
      className: "s-event-post__footer",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.View, {
        className: "s-event-post__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
          className: `s-event-post__action${post.liked ? " s-event-post__action--liked" : ""}`,
          onClick: () => onLike(post.id),
          disabled: !apiEnabled,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.Heart, {
            size: 16,
            filled: post.liked,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_11__.postActionIconColor)({
              liked: post.liked
            })
          }), post.likes]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
          className: `s-event-post__action${commentsExpanded ? " s-event-post__action--active" : ""}`,
          onClick: () => onToggleComments(post.id),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.MessageCircle, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_11__.postActionIconColor)({
              active: commentsExpanded
            })
          }), post.comments]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
          className: "s-event-post__action",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.Share2, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_11__.postActionIconColor)({})
          })
        }), isOwn && post.status === "招募中" && onComplete ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
          className: "s-event-post__action s-event-post__action--complete",
          "aria-label": "\u6807\u8BB0\u4E3A\u5DF2\u7EC4\u961F",
          title: "\u6807\u8BB0\u4E3A\u5DF2\u7EC4\u961F",
          onClick: () => onComplete(post.id),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.CircleCheck, {
            size: 16,
            color: "#34c759"
          }), "\u62DB\u52DF\u4E2D"]
        }) : null, isOwn ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
          className: "s-event-post__action",
          "aria-label": "\u5220\u9664",
          onClick: () => onDelete(post),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.Trash2, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_11__.postActionIconColor)({})
          })
        }) : null]
      }), !isOwn && post.status === "招募中" ? applied ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
        className: "s-event-post__apply s-event-post__apply--done",
        disabled: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.Check, {
          size: 14
        }), "\u5DF2\u7533\u8BF7"]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
        className: "s-event-post__apply",
        onClick: () => onApply(post.id),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_10__.UserPlus, {
          size: 14
        }), "\u7533\u8BF7\u7EC4\u961F"]
      }) : null]
    }), commentsExpanded ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_components_PostCommentSection__WEBPACK_IMPORTED_MODULE_2__.PostCommentSection, {
      postId: post.id,
      expanded: true,
      onToggleExpanded: () => onToggleComments(post.id),
      currentUserAvatar: currentUserAvatar,
      onCommentSubmitted: onCommentSubmitted
    }) : null]
  });
}
const EventPostCard = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(EventPostCardInner);

/***/ }),

/***/ "./src/pages/event-detail/components/EventPostsVirtualList.tsx":
/*!*********************************************************************!*\
  !*** ./src/pages/event-detail/components/EventPostsVirtualList.tsx ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventPostsVirtualList: function() { return /* binding */ EventPostsVirtualList; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _EventPostCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EventPostCard */ "./src/pages/event-detail/components/EventPostCard.tsx");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




function EventPostsVirtualList({
  onScrollToPostId,
  items,
  highlightPostId,
  expandedCommentPostIds,
  appliedPostIds,
  apiEnabled,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onApply,
  onComplete,
  onCommentSubmitted
}) {
  const highlightScrolledRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!highlightPostId || items.length === 0) return;
    if (highlightScrolledRef.current === highlightPostId) return;
    const index = items.findIndex(item => item.post.id === highlightPostId);
    if (index < 0) return;
    highlightScrolledRef.current = highlightPostId;
    const elId = `post-${highlightPostId}`;
    setTimeout(() => onScrollToPostId?.(elId), 100);
  }, [highlightPostId, items, onScrollToPostId]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: "s-event-posts-list",
    children: items.map(item => {
      const highlighted = item.post.id === highlightPostId;
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
        id: `post-${item.post.id}`,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_EventPostCard__WEBPACK_IMPORTED_MODULE_1__.EventPostCard, {
          post: item.post,
          publishTimeLabel: item.publishTimeLabel,
          highlighted: highlighted,
          commentsExpanded: expandedCommentPostIds.has(item.post.id),
          applied: appliedPostIds.has(item.post.id),
          apiEnabled: apiEnabled,
          currentUserAvatar: currentUserAvatar,
          onLike: onLike,
          onToggleComments: onToggleComments,
          onDelete: onDelete,
          onApply: onApply,
          onComplete: onComplete,
          onCommentSubmitted: onCommentSubmitted
        })
      }, item.post.id);
    })
  });
}

/***/ }),

/***/ "./src/pages/event-detail/index.tsx":
/*!******************************************!*\
  !*** ./src/pages/event-detail/index.tsx ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/event-detail/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/event-detail/index!./src/pages/event-detail/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","disableScroll":true,"backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/event-detail/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_event_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/formatPostPublishTime.ts":
/*!********************************************!*\
  !*** ./src/utils/formatPostPublishTime.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatPostPublishTime: function() { return /* binding */ formatPostPublishTime; }
/* harmony export */ });
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
function formatAbsoluteDateTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

/** Event-detail post publish time: relative within 24h, absolute datetime after. */
function formatPostPublishTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < TWENTY_FOUR_HOURS_MS) {
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小时前`;
  }
  return formatAbsoluteDateTime(date);
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/event-detail/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map