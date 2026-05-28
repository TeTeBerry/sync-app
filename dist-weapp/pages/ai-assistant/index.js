"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/ai-assistant/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/ai-assistant/index!./src/pages/ai-assistant/index.tsx":
/*!******************************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/ai-assistant/index!./src/pages/ai-assistant/index.tsx ***!
  \******************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ AiAssistantRoute; }
/* harmony export */ });
/* harmony import */ var _components_AiAssistantPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../components/AiAssistantPage */ "./src/components/AiAssistantPage.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");


function AiAssistantRoute() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_AiAssistantPage__WEBPACK_IMPORTED_MODULE_0__["default"], {});
}

/***/ }),

/***/ "./src/components/AiAssistantPage.tsx":
/*!********************************************!*\
  !*** ./src/components/AiAssistantPage.tsx ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _BottomNav__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BottomNav */ "./src/components/BottomNav.tsx");
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useApiQuery */ "./src/hooks/useApiQuery.ts");
/* harmony import */ var _hooks_useAiChatStream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useAiChatStream */ "./src/hooks/useAiChatStream.ts");
/* harmony import */ var _hooks_useResolvedProfile__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hooks/useResolvedProfile */ "./src/hooks/useResolvedProfile.ts");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _stores__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../stores */ "./src/stores/index.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _ai_chat_ChatMessageList__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ai-chat/ChatMessageList */ "./src/components/ai-chat/ChatMessageList.tsx");
/* harmony import */ var _ai_chat_ChatComposer__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ai-chat/ChatComposer */ "./src/components/ai-chat/ChatComposer.tsx");
/* harmony import */ var _ai_chat_DegradedMatchBanner__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ai-chat/DegradedMatchBanner */ "./src/components/ai-chat/DegradedMatchBanner.tsx");
/* harmony import */ var _hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../hooks/useDeferredMount */ "./src/hooks/useDeferredMount.ts");
/* harmony import */ var _utils_timing__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../utils/timing */ "./src/utils/timing.ts");
/* harmony import */ var _hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../hooks/usePageRouteReady */ "./src/hooks/usePageRouteReady.ts");
/* harmony import */ var _hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../hooks/useTabPageMainHeight */ "./src/hooks/useTabPageMainHeight.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




















/** Header row below status bar (px, matches AiAssistantPage.scss). */

const AI_HEADER_PX = 100;
function AiAssistantChat({
  initialMessage,
  activityLegacyId,
  onInitialMessageSent,
  onClearReady,
  onMessageCountChange,
  chatBodyHeight,
  userAvatar,
  userName
}) {
  const [input, setInput] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [pendingImages, setPendingImages] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const initialMessageSentRef = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(null);
  const initialMessageHandledRef = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(false);
  const submitLockRef = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(false);
  const mockReply = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(query => `正在为你搜索「${query}」相关内容 🔍 已找到 ${Math.floor(Math.random() * 5 + 3)} 条相关信息。`, []);
  const {
    messages,
    isStreaming,
    isLoadingHistory,
    send,
    clearChat
  } = (0,_hooks_useAiChatStream__WEBPACK_IMPORTED_MODULE_4__.useAiChatStream)({
    welcomeText: "👋 我是你的 AI 智能助手，帮你发现活动、找队友、规划行程，说出需求，我来搞定。",
    mockReply,
    streamErrorText: "抱歉，回复出错了，请稍后再试。",
    activityLegacyId,
    onPostCreated: async event => {
      await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_6__.invalidatePostQueries)();
      const scopedId = event.activityLegacyId ?? activityLegacyId;
      if (scopedId != null) {
        (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_3__.invalidateCache)(["posts", "activity", scopedId]);
      }
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default().showToast({
        title: "组队帖已发布",
        icon: "success"
      });
    },
    onExistingPost: () => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default().showToast({
        title: "你已有组队帖，请去「我的」编辑或在活动详情查看",
        icon: "none",
        duration: 2500
      });
    }
  });
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    onMessageCountChange?.(messages.length);
  }, [messages.length, onMessageCountChange]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!initialMessage) {
      return;
    }
    if (initialMessageHandledRef.current) {
      return;
    }
    const trimmed = initialMessage.trim();
    if (!trimmed || isLoadingHistory || isStreaming) return;
    initialMessageHandledRef.current = true;
    initialMessageSentRef.current = trimmed;
    void send({
      text: trimmed
    });
    onInitialMessageSent?.();
  }, [initialMessage, isLoadingHistory, isStreaming, onInitialMessageSent, send]);
  const submit = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (text, images) => {
    if (submitLockRef.current) return;
    const trimmed = text.trim();
    const hasImages = images && images.length > 0;
    if (!trimmed && !hasImages || isStreaming || isLoadingHistory) return;
    submitLockRef.current = true;
    try {
      setInput("");
      setPendingImages([]);
      await send({
        text: trimmed,
        images: images?.length ? images : undefined
      });
    } finally {
      submitLockRef.current = false;
    }
  }, [isLoadingHistory, isStreaming, send]);
  const handleClearChat = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    if (isStreaming) return;
    await clearChat();
  }, [clearChat, isStreaming]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    onClearReady?.(handleClearChat, isStreaming || isLoadingHistory);
  }, [handleClearChat, isLoadingHistory, isStreaming, onClearReady]);
  const handleSelectSuggestedReply = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async reply => {
    if (submitLockRef.current || isStreaming) return;
    submitLockRef.current = true;
    try {
      await send({
        text: reply
      });
    } finally {
      submitLockRef.current = false;
    }
  }, [isStreaming, send]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
    className: "s-ai-assistant-chat",
    style: chatBodyHeight != null ? {
      height: `${chatBodyHeight}px`
    } : undefined,
    children: [isLoadingHistory ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
      className: "s-ai-assistant__hint",
      children: "\u52A0\u8F7D\u4E2D\u2026"
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_ai_chat_DegradedMatchBanner__WEBPACK_IMPORTED_MODULE_11__.DegradedMatchBanner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_ai_chat_ChatMessageList__WEBPACK_IMPORTED_MODULE_9__.ChatMessageList, {
      messages: messages,
      isStreaming: isStreaming,
      userAvatar: userAvatar,
      userName: userName,
      onSelectSuggestedReply: handleSelectSuggestedReply
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
      className: "s-ai-assistant-chat__footer",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_ai_chat_ChatComposer__WEBPACK_IMPORTED_MODULE_10__.ChatComposer, {
        input: input,
        pendingImages: pendingImages,
        isStreaming: isStreaming,
        isLoadingHistory: isLoadingHistory,
        activityLegacyId: activityLegacyId,
        onInputChange: setInput,
        onSubmit: submit,
        onPendingImagesChange: setPendingImages
      })
    })]
  });
}
const AiAssistantPage = () => {
  const chatReady = (0,_hooks_useDeferredMount__WEBPACK_IMPORTED_MODULE_12__.useDeferredMount)(_utils_timing__WEBPACK_IMPORTED_MODULE_17__.DEFER_AI_CHAT_MS);
  const [pendingInitialMessage, setPendingInitialMessage] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [clearChatFn, setClearChatFn] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [clearBusy, setClearBusy] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [messageCount, setMessageCount] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const consumeAiAssistantIntent = (0,_stores__WEBPACK_IMPORTED_MODULE_7__.useNavigationStore)(state => state.consumeAiAssistantIntent);
  const activityLegacyId = (0,_stores__WEBPACK_IMPORTED_MODULE_7__.useNavigationStore)(state => state.activeActivityLegacyId ?? undefined);
  const setActiveActivityLegacyId = (0,_stores__WEBPACK_IMPORTED_MODULE_7__.useNavigationStore)(state => state.setActiveActivityLegacyId);
  const profileUserData = (0,_hooks_useResolvedProfile__WEBPACK_IMPORTED_MODULE_5__.useResolvedProfile)();
  const chatBodyHeight = (0,_hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_14__.useTabPageMainHeight)({
    subtractPx: AI_HEADER_PX
  });
  (0,_hooks_usePageRouteReady__WEBPACK_IMPORTED_MODULE_13__.usePageRouteReady)(true);
  const handleClearReady = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((clear, isBusy) => {
    setClearChatFn(() => clear);
    setClearBusy(isBusy);
  }, []);
  const handleInitialMessageSent = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setPendingInitialMessage(null);
  }, []);
  const applyAiAssistantIntent = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    const intent = consumeAiAssistantIntent();
    if (intent?.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      setActiveActivityLegacyId(intent.activityLegacyId);
    }
  }, [consumeAiAssistantIntent, setActiveActivityLegacyId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    applyAiAssistantIntent();
  }, [applyAiAssistantIntent]);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_2__.useDidShow)(applyAiAssistantIntent);
  const handleBack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    const pages = _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default().getCurrentPages();
    if (pages.length <= 1) {
      if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
        (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goEventDetail)(activityLegacyId);
        return;
      }
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goBack)(_utils_route__WEBPACK_IMPORTED_MODULE_8__.ROUTES.HOME);
      return;
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goBack)();
  }, [activityLegacyId]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
    "data-cmp": "AiAssistant",
    className: "s-page-with-tabbar",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
      className: "s-page-with-tabbar__main s-ai-assistant",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
        className: "s-ai-assistant__header",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Button, {
          className: "s-ai-assistant__back-btn",
          onClick: handleBack,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_18__.ChevronLeft, {
            size: 22
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
          className: "s-ai-assistant__header-main",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
            className: "s-ai-assistant__header-avatar",
            "aria-hidden": true,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_18__.Sparkles, {
              size: 18
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
              className: "s-ai-assistant__header-online"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
            className: "s-ai-assistant__header-text",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
              className: "s-ai-assistant__header-title-row",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
                className: "s-ai-assistant__header-title",
                children: "AI 智能助手"
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
                className: "s-ai-assistant__ai-badge",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_18__.Zap, {
                  size: 10,
                  "aria-hidden": true
                }), "AI"]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
              className: "s-ai-assistant__header-status",
              children: "在线 · 实时响应"
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
          className: "s-ai-assistant__header-actions",
          children: [messageCount > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Text, {
            className: "s-ai-assistant__message-count",
            "aria-hidden": true,
            children: messageCount
          }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.Button, {
            className: "s-ai-assistant__clear-btn",
            disabled: clearBusy || !clearChatFn,
            "aria-label": "\u6E05\u7A7A\u5BF9\u8BDD",
            onClick: () => void clearChatFn?.(),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_18__.Trash2, {
              size: 16
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
        className: "s-ai-assistant__body",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
          className: "s-ai-assistant__panel",
          children: chatReady ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(AiAssistantChat, {
            initialMessage: pendingInitialMessage,
            activityLegacyId: activityLegacyId,
            onInitialMessageSent: handleInitialMessageSent,
            onClearReady: handleClearReady,
            onMessageCountChange: setMessageCount,
            chatBodyHeight: chatBodyHeight,
            userAvatar: profileUserData.avatar,
            userName: profileUserData.name
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_16__.View, {
            className: "s-ai-assistant__chat-placeholder",
            "aria-hidden": true
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_BottomNav__WEBPACK_IMPORTED_MODULE_1__.BottomNavSlot, {})]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (AiAssistantPage);

/***/ }),

/***/ "./src/components/AiAssistantPostCard.tsx":
/*!************************************************!*\
  !*** ./src/components/AiAssistantPostCard.tsx ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export AiAssistantPostCard */
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_inferAuthorGender__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/inferAuthorGender */ "./src/utils/inferAuthorGender.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






const AiAssistantPostCard = ({
  post,
  highlight = false
}) => {
  const authorGender = (0,_utils_inferAuthorGender__WEBPACK_IMPORTED_MODULE_2__.inferAuthorGenderFromPost)(post);
  const nameClassName = authorGender ? `s-ai-assistant-post-card__name s-ai-assistant-post-card__name--${authorGender}` : "s-ai-assistant-post-card__name";
  const handleOpen = () => {
    const activityId = post.activityLegacyId;
    if (activityId != null && !Number.isNaN(activityId)) {
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_0__.goEventDetail)(activityId, {
        postId: post.postId
      });
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: highlight ? "s-ai-assistant-post-card s-ai-assistant-post-card--mine" : "s-ai-assistant-post-card",
    onClick: handleOpen,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "s-ai-assistant-post-card__header",
      children: [post.authorAvatar ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Image, {
        className: "s-ai-assistant-post-card__avatar",
        src: post.authorAvatar,
        decoding: "async"
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        className: "s-ai-assistant-post-card__avatar s-ai-assistant-post-card__avatar--fallback",
        children: post.authorName.slice(0, 1)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
        className: "s-ai-assistant-post-card__meta",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            fontWeight: "bold"
          },
          className: nameClassName,
          children: post.authorName
        }), post.authorHandle ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          children: post.authorHandle
        }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          children: post.eventTitle
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
      className: "s-ai-assistant-post-card__body",
      children: post.snippet
    }), post.location ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
      className: "s-ai-assistant-post-card__location",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.MapPin, {
        size: 12
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        children: post.location
      })]
    }) : null, post.tags?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "s-ai-assistant-post-card__tags",
      children: post.tags.slice(0, 3).map(tag => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        children: tag
      }, tag))
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
      className: "s-ai-assistant-post-card__cta",
      children: "\u67E5\u770B\u5E16\u5B50"
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (AiAssistantPostCard);

/***/ }),

/***/ "./src/components/ai-chat/ChatComposer.tsx":
/*!*************************************************!*\
  !*** ./src/components/ai-chat/ChatComposer.tsx ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChatComposer: function() { return /* binding */ ChatComposer; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/aiShortcutTags */ "./src/utils/aiShortcutTags.ts");
/* harmony import */ var _utils_chatImage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/chatImage */ "./src/utils/chatImage.ts");
/* harmony import */ var _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../stores/aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _utils_openImagePreview__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/openImagePreview */ "./src/utils/openImagePreview.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");










const SHORTCUT_TAG_LABELS = {
  组队队友: "组队队友",
  住宿同行: "住宿同行",
  拼车同行: "拼车同行"
};
const globalQuickChips = [{
  key: "findBuddy",
  label: "帮我dd",
  submitText: "帮我dd"
}, {
  key: "nearEvents",
  label: "查最近活动",
  submitText: "查最近活动"
}, {
  key: "findPartner",
  label: "帮我找搭子",
  submitText: "帮我找搭子"
}, {
  key: "popularEvents",
  label: "热门活动",
  submitText: "查最近活动"
}];
const activityActionChips = [{
  key: "createOwn",
  label: "自己发帖",
  submitText: "自己发帖"
}, {
  key: "searchPosts",
  label: "查组队帖",
  submitText: "看看有没有组队帖"
}];
const MAX_IMAGES = 6;
function readComposerInputValue(event) {
  return event.detail?.value ?? event.target?.value ?? "";
}
function ChatComposer({
  input,
  pendingImages,
  isStreaming,
  activityLegacyId,
  onInputChange,
  onSubmit,
  onPendingImagesChange,
  isLoadingHistory = false
}) {
  const [shortcutTags, setShortcutTags] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_3__.getTopAiShortcutTags)());
  const conversationFlow = (0,_stores_aiChatStore__WEBPACK_IMPORTED_MODULE_5__.useAiChatStore)(state => state.conversationState?.flow);
  const inputPlaceholder = conversationFlow === "collect_post_body" ? "描述你的组队需求，如出发地、人数、日期…" : "说说你想去哪、想找什么样的同行…";
  const quickChips = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      const tagChips = shortcutTags.map(tag => {
        const label = SHORTCUT_TAG_LABELS[tag] ?? tag;
        return {
          key: `tag-${tag}`,
          label,
          submitText: (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_3__.normalizeAiShortcutTag)(tag),
          isShortcutTag: true
        };
      });
      const actionChips = activityActionChips.map(chip => ({
        key: chip.key,
        label: chip.label,
        submitText: chip.submitText
      }));
      return [actionChips[0], ...tagChips, ...actionChips.slice(1)];
    }
    return globalQuickChips.map(chip => ({
      key: chip.key,
      label: chip.label,
      submitText: chip.submitText
    }));
  }, [activityLegacyId, shortcutTags]);
  const isBusy = isStreaming || isLoadingHistory;
  const handlePickImages = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    if (isBusy) return;
    const remaining = MAX_IMAGES - pendingImages.length;
    if (remaining <= 0) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: `最多上传 ${MAX_IMAGES} 张图片`,
        icon: "none"
      });
      return;
    }
    try {
      const dataUrls = await (0,_utils_chatImage__WEBPACK_IMPORTED_MODULE_4__.pickAndCompressChatImages)(remaining);
      if (dataUrls.length) {
        onPendingImagesChange([...pendingImages, ...dataUrls].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      if (error instanceof _utils_chatImage__WEBPACK_IMPORTED_MODULE_4__.ChatImageTooLargeError) {
        void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
          title: "图片过大，请压缩至 10MB 以内",
          icon: "none"
        });
        return;
      }
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "请求失败，请稍后重试",
        icon: "none"
      });
    }
  }, [isBusy, pendingImages, onPendingImagesChange]);
  const removeImage = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(index => {
    onPendingImagesChange(pendingImages.filter((_, i) => i !== index));
  }, [pendingImages, onPendingImagesChange]);
  const handleQuickChipClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(chip => {
    if (chip.isShortcutTag) {
      (0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_3__.recordAiShortcutTagUse)(chip.submitText);
      setShortcutTags((0,_utils_aiShortcutTags__WEBPACK_IMPORTED_MODULE_3__.getTopAiShortcutTags)());
    }
    onSubmit(chip.submitText, pendingImages);
  }, [onSubmit, pendingImages]);
  const canSend = Boolean(input.trim() || pendingImages.length) && !isBusy;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.ScrollView, {
      scrollX: true,
      enhanced: true,
      showScrollbar: false,
      className: "s-ai-assistant-chat__quick-scroll s-scrollbar-none",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        className: "s-ai-assistant-chat__quick-row",
        children: quickChips.map(chip => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: "s-ai-assistant-chat__quick-chip",
          disabled: isBusy,
          onClick: () => handleQuickChipClick(chip),
          children: chip.label
        }, chip.key))
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      className: "s-ai-assistant-chat__composer",
      children: [pendingImages.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.ScrollView, {
        scrollY: true,
        enhanced: true,
        showScrollbar: false,
        className: "s-ai-assistant-chat__attach-preview-list s-scrollbar-none",
        style: {
          height: "160px"
        },
        children: pendingImages.map((src, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "s-ai-assistant-chat__attach-thumb",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
            className: "s-ai-assistant-chat__attach-preview-btn",
            "aria-label": "\u67E5\u770B\u5927\u56FE",
            onClick: () => void (0,_utils_openImagePreview__WEBPACK_IMPORTED_MODULE_6__.openImagePreview)(pendingImages, index),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Image, {
              src: src,
              alt: "\u5DF2\u4E0A\u4F20\u7684\u56FE\u7247"
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
            className: "s-ai-assistant-chat__attach-remove",
            "aria-label": "\u79FB\u9664\u56FE\u7247",
            onClick: () => removeImage(index),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.X, {
              size: 14
            })
          })]
        }, `${src.slice(0, 40)}-${index}`))
      }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        className: "s-ai-assistant-chat__composer-inner",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: "s-ai-assistant-chat__attach-btn",
          disabled: isBusy || pendingImages.length >= MAX_IMAGES,
          "aria-label": "\u4E0A\u4F20\u56FE\u7247",
          onClick: () => void handlePickImages(),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.ImagePlus, {
            size: 18
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Input, {
          variant: "ai-assistant-chat",
          type: "text",
          value: input,
          disabled: isBusy,
          placeholder: inputPlaceholder,
          onInput: e => onInputChange(readComposerInputValue(e)),
          onConfirm: () => onSubmit(input, pendingImages)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: (0,_ui__WEBPACK_IMPORTED_MODULE_2__.cn)("s-ai-assistant-chat__send", canSend && "s-ai-assistant-chat__send--active"),
          disabled: !canSend,
          onClick: () => onSubmit(input, pendingImages),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Send, {
            size: 16
          })
        })]
      })]
    })]
  });
}

/***/ }),

/***/ "./src/components/ai-chat/ChatMessageList.tsx":
/*!****************************************************!*\
  !*** ./src/components/ai-chat/ChatMessageList.tsx ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChatMessageList: function() { return /* binding */ ChatMessageList; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _ChatUserAvatar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ChatUserAvatar */ "./src/components/ai-chat/ChatUserAvatar.tsx");
/* harmony import */ var _RecommendPostCards__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./RecommendPostCards */ "./src/components/ai-chat/RecommendPostCards.tsx");
/* harmony import */ var _SuggestedReplyChips__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./SuggestedReplyChips */ "./src/components/ai-chat/SuggestedReplyChips.tsx");
/* harmony import */ var _utils_openImagePreview__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/openImagePreview */ "./src/utils/openImagePreview.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");









function formatMessageTime(id) {
  const ts = Number(id.split("-")[0]);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
function ChatMessageList({
  messages,
  isStreaming,
  userAvatar,
  userName,
  onSelectSuggestedReply
}) {
  const [scrollIntoView, setScrollIntoView] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const scrollToBottom = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    const targetId = `chat-msg-${last.id}`;
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView(targetId), 0);
  }, [messages]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);
  const showTimestampForIndex = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(index => {
    if (index === 0) return true;
    const current = messages[index];
    const previous = messages[index - 1];
    return current.from !== previous.from;
  }, [messages]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.ScrollView, {
    scrollY: true,
    enhanced: true,
    showScrollbar: false,
    scrollIntoView: scrollIntoView,
    scrollWithAnimation: true,
    className: "s-ai-assistant-chat__scroll s-scrollbar-none",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      className: "s-ai-assistant-chat__scroll-inner",
      children: messages.map((msg, index) => {
        const isUser = msg.from === "user";
        const timestamp = formatMessageTime(msg.id);
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), {
          children: [showTimestampForIndex(index) && timestamp ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            className: "s-ai-assistant-chat__timestamp",
            children: timestamp
          }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
            id: `chat-msg-${msg.id}`,
            className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-ai-assistant-chat__row", isUser && "s-ai-assistant-chat__row--from-user"),
            children: [!isUser ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
              className: "s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__.Sparkles, {
                size: 14
              })
            }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
              className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-ai-assistant-chat__content", isUser && "s-ai-assistant-chat__content--from-user"),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
                className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-ai-assistant-chat__bubble", isUser ? "s-ai-assistant-chat__bubble--from-user" : "s-ai-assistant-chat__bubble--from-ai", msg.streaming && "s-ai-assistant-chat__bubble--streaming", msg.streaming && !msg.text && "s-ai-assistant-chat__bubble--waiting"),
                children: msg.streaming && !msg.text ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
                  className: "s-ai-assistant-chat__typing",
                  "aria-label": "AI \u6B63\u5728\u601D\u8003",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
                    className: "s-ai-assistant-chat__typing-dot"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
                    className: "s-ai-assistant-chat__typing-dot"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
                    className: "s-ai-assistant-chat__typing-dot"
                  })]
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
                  children: [msg.imagePreview ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Button, {
                    className: "s-ai-assistant-chat__bubble-image-btn",
                    "aria-label": "\u67E5\u770B\u5927\u56FE",
                    onClick: () => (0,_utils_openImagePreview__WEBPACK_IMPORTED_MODULE_5__.openSingleImagePreview)(msg.imagePreview),
                    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Image, {
                      className: "s-ai-assistant-chat__bubble-image",
                      src: msg.imagePreview,
                      alt: "\u5DF2\u4E0A\u4F20\u7684\u56FE\u7247"
                    })
                  }) : null, msg.text ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
                    children: msg.text
                  }) : null, msg.createdPost ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_RecommendPostCards__WEBPACK_IMPORTED_MODULE_3__.RecommendPostCards, {
                    posts: [msg.createdPost],
                    variant: "created"
                  }) : null, msg.recommendedPosts?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_RecommendPostCards__WEBPACK_IMPORTED_MODULE_3__.RecommendPostCards, {
                    posts: msg.recommendedPosts
                  }) : null, msg.suggestedReplies?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_SuggestedReplyChips__WEBPACK_IMPORTED_MODULE_4__.SuggestedReplyChips, {
                    replies: msg.suggestedReplies,
                    disabled: isStreaming,
                    onSelect: onSelectSuggestedReply
                  }) : null]
                })
              })
            }), isUser ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_ChatUserAvatar__WEBPACK_IMPORTED_MODULE_2__.ChatUserAvatar, {
              avatar: userAvatar,
              name: userName
            }) : null]
          })]
        }, msg.id);
      })
    })
  });
}

/***/ }),

/***/ "./src/components/ai-chat/ChatUserAvatar.tsx":
/*!***************************************************!*\
  !*** ./src/components/ai-chat/ChatUserAvatar.tsx ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChatUserAvatar: function() { return /* binding */ ChatUserAvatar; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");


function ChatUserAvatar({
  avatar,
  name
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "我";
  if (avatar?.trim()) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Image, {
      className: "s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user",
      src: avatar,
      alt: name
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
    className: "s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user s-ai-assistant-chat__avatar--fallback",
    "aria-hidden": true,
    children: initial
  });
}

/***/ }),

/***/ "./src/components/ai-chat/DegradedMatchBanner.tsx":
/*!********************************************************!*\
  !*** ./src/components/ai-chat/DegradedMatchBanner.tsx ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DegradedMatchBanner: function() { return /* binding */ DegradedMatchBanner; }
/* harmony export */ });
/* harmony import */ var _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../stores/aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



function DegradedMatchBanner() {
  const degraded = (0,_stores_aiChatStore__WEBPACK_IMPORTED_MODULE_0__.useAiChatStore)(state => state.degraded);
  if (!degraded) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
    className: "s-ai-assistant-chat__degraded-banner",
    role: "status",
    children: "\u5339\u914D\u7ED3\u679C\u53EF\u80FD\u4E0D\u5B8C\u6574\uFF0C\u5DF2\u5C55\u793A\u53EF\u7528\u63A8\u8350"
  });
}

/***/ }),

/***/ "./src/components/ai-chat/RecommendPostCards.tsx":
/*!*******************************************************!*\
  !*** ./src/components/ai-chat/RecommendPostCards.tsx ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RecommendPostCards: function() { return /* binding */ RecommendPostCards; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _AiAssistantPostCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../AiAssistantPostCard */ "./src/components/AiAssistantPostCard.tsx");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const RecommendPostCards = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(function RecommendPostCards({
  posts,
  variant = "recommend"
}) {
  if (!posts.length) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: "s-ai-assistant-chat__post-cards",
    children: posts.map(post => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_AiAssistantPostCard__WEBPACK_IMPORTED_MODULE_1__["default"], {
      post: post,
      highlight: variant === "created"
    }, post.postId))
  });
});

/***/ }),

/***/ "./src/components/ai-chat/SuggestedReplyChips.tsx":
/*!********************************************************!*\
  !*** ./src/components/ai-chat/SuggestedReplyChips.tsx ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SuggestedReplyChips: function() { return /* binding */ SuggestedReplyChips; }
/* harmony export */ });
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../stores/aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const PUBLISH_CONFIRM_REPLY = "确认发布";
function SuggestedReplyChips({
  replies: repliesProp,
  disabled,
  onSelect
}) {
  const storeReplies = (0,_stores_aiChatStore__WEBPACK_IMPORTED_MODULE_1__.useAiChatStore)(state => state.suggestedReplies);
  const replies = repliesProp?.length ? repliesProp : storeReplies;
  if (!replies.length) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: "s-ai-assistant-chat__copy-row",
    children: replies.map(reply => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_0__.Button, {
      className: (0,_ui__WEBPACK_IMPORTED_MODULE_0__.cn)("s-ai-assistant-chat__copy-chip", reply === PUBLISH_CONFIRM_REPLY && "s-ai-assistant-chat__copy-chip--primary"),
      disabled: disabled,
      onClick: () => onSelect(reply),
      children: reply
    }, reply))
  });
}

/***/ }),

/***/ "./src/hooks/ai-chat/createMessageId.ts":
/*!**********************************************!*\
  !*** ./src/hooks/ai-chat/createMessageId.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createMessageId: function() { return /* binding */ createMessageId; }
/* harmony export */ });
function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/***/ }),

/***/ "./src/hooks/ai-chat/useAiChatStream.ts":
/*!**********************************************!*\
  !*** ./src/hooks/ai-chat/useAiChatStream.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAiChatStream: function() { return /* binding */ useAiChatStream; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../stores/aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _utils_session__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/session */ "./src/utils/session.ts");
/* harmony import */ var _createMessageId__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./createMessageId */ "./src/hooks/ai-chat/createMessageId.ts");
/* harmony import */ var _useChatSession__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./useChatSession */ "./src/hooks/ai-chat/useChatSession.ts");
/* harmony import */ var _useSseChatStream__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./useSseChatStream */ "./src/hooks/ai-chat/useSseChatStream.ts");
/* harmony import */ var _useTypewriterReply__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./useTypewriterReply */ "./src/hooks/ai-chat/useTypewriterReply.ts");









function useAiChatStream(options) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl = _constants_api__WEBPACK_IMPORTED_MODULE_2__.AI_CHAT_STREAM_URL,
    sessionId: sessionIdOption,
    userId: userIdOption,
    userName: userNameOption,
    userPhone: userPhoneOption,
    activityLegacyId,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    typewriterCharDelayMs = 22
  } = options;
  const activityLegacyIdRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(activityLegacyId);
  const [isStreaming, setIsStreaming] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const abortRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const {
    messages,
    setMessages,
    messagesRef,
    isLoadingHistory,
    loadSessionHistory,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    setIsStreamingRef,
    isStreamingRef
  } = (0,_useChatSession__WEBPACK_IMPORTED_MODULE_5__.useChatSession)({
    welcomeText,
    apiUrl,
    sessionId: sessionIdOption,
    activityLegacyId,
    userId: userIdOption ?? (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)(),
    userName: userNameOption ?? (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserName)(),
    userPhone: userPhoneOption ?? (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserPhone)()
  });
  const {
    createTypewriter
  } = (0,_useTypewriterReply__WEBPACK_IMPORTED_MODULE_7__.useTypewriterReply)();
  const {
    runStream
  } = (0,_useSseChatStream__WEBPACK_IMPORTED_MODULE_6__.useSseChatStream)({
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl,
    activityLegacyIdRef,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    persistSessionFromStream,
    createTypewriter,
    typewriterCharDelayMs
  });
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setIsStreamingRef(isStreaming);
  }, [isStreaming, setIsStreamingRef]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => abortRef.current?.abort();
  }, []);
  const abort = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    abortRef.current?.abort();
  }, []);
  const send = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async payload => {
    const sendOptions = typeof payload === "string" ? {
      text: payload
    } : payload;
    const {
      text,
      image,
      images
    } = sendOptions;
    const trimmed = text.trim();
    const hasImages = Boolean(image) || images && images.length > 0;
    if (!trimmed && !hasImages) return;
    if (isStreamingRef.current) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "请等待上一条回复",
        icon: "none"
      });
      return;
    }
    const userMsg = {
      id: (0,_createMessageId__WEBPACK_IMPORTED_MODULE_8__.createMessageId)(),
      from: "user",
      text: trimmed,
      imagePreview: image ?? images?.[0],
      ocrText: hasImages ? trimmed : undefined
    };
    const aiMsgId = (0,_createMessageId__WEBPACK_IMPORTED_MODULE_8__.createMessageId)();
    const baseMessages = messagesRef.current;
    const nextMessages = [...baseMessages, userMsg, {
      id: aiMsgId,
      from: "ai",
      text: "",
      streaming: true
    }];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await runStream(sendOptions, aiMsgId, controller.signal);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: streamErrorText,
        icon: "none"
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreamingRef, messagesRef, runStream, setMessages, streamErrorText]);
  const clearChat = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    abortRef.current?.abort();
    _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_3__.useAiChatStore.getState().resetOnClearSession();
    await resetSession();
    setIsStreaming(false);
  }, [resetSession]);
  return {
    messages,
    isStreaming,
    isLoadingHistory,
    send,
    abort,
    reloadHistory: loadSessionHistory,
    clearChat,
    sessionId: sessionIdRef.current
  };
}

/***/ }),

/***/ "./src/hooks/ai-chat/useChatSession.ts":
/*!*********************************************!*\
  !*** ./src/hooks/ai-chat/useChatSession.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useChatSession: function() { return /* binding */ useChatSession; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api_syncApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../api/syncApi */ "./src/api/syncApi.ts");
/* harmony import */ var _utils_aiChatHistory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/aiChatHistory */ "./src/utils/aiChatHistory.ts");
/* harmony import */ var _utils_session__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/session */ "./src/utils/session.ts");
/* harmony import */ var _createMessageId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./createMessageId */ "./src/hooks/ai-chat/createMessageId.ts");






function resolveSessionId(sessionIdOption, activityLegacyId) {
  if (sessionIdOption?.trim()) return sessionIdOption.trim();
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.getOrCreateActivitySessionId)(activityLegacyId);
  }
  return (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.getOrCreateSessionId)();
}
function createFreshSessionIdForScope(activityLegacyId) {
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.createFreshActivitySessionId)(activityLegacyId);
  }
  return (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.createFreshSessionId)();
}
function useChatSession(options) {
  const {
    welcomeText,
    apiUrl,
    activityLegacyId
  } = options;
  const activityLegacyIdRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(activityLegacyId);
  const sessionIdRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(resolveSessionId(options.sessionId, activityLegacyId));
  const userIdRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(options.userId);
  const userNameRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(options.userName);
  const userPhoneRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(options.userPhone);
  const historyLoadSeqRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);
  const hasLoadedHistoryRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const [messages, setMessages] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => [{
    id: (0,_createMessageId__WEBPACK_IMPORTED_MODULE_4__.createMessageId)(),
    from: "ai",
    text: welcomeText
  }]);
  const [isLoadingHistory, setIsLoadingHistory] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const messagesRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(messages);
  const isStreamingRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    messagesRef.current = messages;
  }, [messages]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);
  const setIsStreamingRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(value => {
    isStreamingRef.current = value;
  }, []);
  const showWelcome = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setMessages([{
      id: (0,_createMessageId__WEBPACK_IMPORTED_MODULE_4__.createMessageId)(),
      from: "ai",
      text: welcomeText
    }]);
  }, [welcomeText]);
  const loadSessionHistory = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    if (isStreamingRef.current) return;
    if (hasLoadedHistoryRef.current) return;
    if (!apiUrl) {
      showWelcome();
      hasLoadedHistoryRef.current = true;
      return;
    }
    const requestSessionId = sessionIdRef.current;
    const loadSeq = ++historyLoadSeqRef.current;
    setIsLoadingHistory(true);
    try {
      const session = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchChatSession)(requestSessionId);
      if (loadSeq !== historyLoadSeqRef.current || requestSessionId !== sessionIdRef.current || isStreamingRef.current) {
        return;
      }
      const uiMessages = session.history?.length ? (0,_utils_aiChatHistory__WEBPACK_IMPORTED_MODULE_5__.mapHistoryToUiMessages)(session.history, requestSessionId) : [];
      if (uiMessages.length > 0) {
        setMessages(uiMessages);
      } else {
        showWelcome();
      }
      hasLoadedHistoryRef.current = true;
    } catch {
      if (loadSeq === historyLoadSeqRef.current && requestSessionId === sessionIdRef.current && !isStreamingRef.current) {
        showWelcome();
      }
      hasLoadedHistoryRef.current = true;
    } finally {
      if (loadSeq === historyLoadSeqRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }, [apiUrl, showWelcome]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const nextSessionId = resolveSessionId(options.sessionId, activityLegacyId);
    if (sessionIdRef.current === nextSessionId) return;
    historyLoadSeqRef.current += 1;
    hasLoadedHistoryRef.current = false;
    sessionIdRef.current = nextSessionId;
    showWelcome();
    void loadSessionHistory();
  }, [activityLegacyId, loadSessionHistory, options.sessionId, showWelcome]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    void loadSessionHistory();
  }, [loadSessionHistory]);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__.useDidShow)(() => {
    void loadSessionHistory();
  });
  const resetSession = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    historyLoadSeqRef.current += 1;
    hasLoadedHistoryRef.current = false;
    const previousSessionId = sessionIdRef.current;
    try {
      await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.clearChatSession)(previousSessionId);
    } catch {
      // ignore network errors; still reset local state
    }
    const nextSessionId = createFreshSessionIdForScope(activityLegacyIdRef.current);
    sessionIdRef.current = nextSessionId;
    (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.persistSessionId)(nextSessionId, activityLegacyIdRef.current);
    messagesRef.current = [];
    setMessages([]);
    showWelcome();
    return nextSessionId;
  }, [showWelcome]);
  const persistSessionFromStream = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(sessionId => {
    sessionIdRef.current = sessionId;
    (0,_utils_session__WEBPACK_IMPORTED_MODULE_3__.persistSessionId)(sessionId, activityLegacyIdRef.current);
  }, []);
  return {
    messages,
    setMessages,
    messagesRef,
    isLoadingHistory,
    loadSessionHistory,
    showWelcome,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    setIsStreamingRef,
    isStreamingRef
  };
}

/***/ }),

/***/ "./src/hooks/ai-chat/useSseChatStream.ts":
/*!***********************************************!*\
  !*** ./src/hooks/ai-chat/useSseChatStream.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useSseChatStream: function() { return /* binding */ useSseChatStream; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../stores/aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _utils_aiChatHistory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/aiChatHistory */ "./src/utils/aiChatHistory.ts");
/* harmony import */ var _utils_aiChatStream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/aiChatStream */ "./src/utils/aiChatStream.ts");






function applyStreamEventToStore(event) {
  const store = _stores_aiChatStore__WEBPACK_IMPORTED_MODULE_3__.useAiChatStore.getState();
  if (event.type === "conversation_patch") {
    store.applyConversationPatch(event.state);
    return;
  }
  if (event.type === "suggested_replies") {
    store.setSuggestedReplies(event.replies);
    return;
  }
  if (event.type === "post_recommendations") {
    store.setPostRecommendationsMeta(event.degraded);
  }
}
function useSseChatStream(options) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl = _constants_api__WEBPACK_IMPORTED_MODULE_2__.AI_CHAT_STREAM_URL,
    activityLegacyIdRef,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    persistSessionFromStream,
    createTypewriter,
    typewriterCharDelayMs = 22
  } = options;
  const processStreamEvents = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (stream, aiMsgId, typewriter) => {
    const finishAiMessage = updater => {
      setMessages(prev => prev.map(message => message.id === aiMsgId ? updater(message) : message));
    };
    for await (const event of stream) {
      applyStreamEventToStore(event);
      if (event.type === "delta") {
        typewriter.append(event.content);
        continue;
      }
      if (event.type === "message_complete") {
        if (!typewriter.getTarget()) {
          typewriter.append(event.content);
        } else {
          typewriter.ensureTarget(event.content);
        }
        continue;
      }
      if (event.type === "post_created") {
        onPostCreated?.(event);
        if (event.post) {
          finishAiMessage(message => ({
            ...message,
            createdPost: event.post
          }));
        }
        continue;
      }
      if (event.type === "existing_post") {
        onExistingPost?.(event);
        continue;
      }
      if (event.type === "post_recommendations") {
        finishAiMessage(message => ({
          ...message,
          recommendedPosts: event.posts
        }));
        continue;
      }
      if (event.type === "suggested_replies") {
        finishAiMessage(message => ({
          ...message,
          suggestedReplies: event.replies
        }));
        continue;
      }
      if (event.type === "conversation_patch") {
        continue;
      }
      if (event.type === "error") {
        typewriter.flush();
        finishAiMessage(message => ({
          ...message,
          text: message.text || event.message,
          streaming: false
        }));
        break;
      }
      if (event.type === "done") {
        finishAiMessage(message => ({
          ...message,
          streaming: false
        }));
        await typewriter.waitUntilComplete();
        finishAiMessage(message => ({
          ...message,
          text: typewriter.getTarget() || message.text,
          streaming: false
        }));
        if (event.sessionId) {
          persistSessionFromStream(event.sessionId);
        }
        break;
      }
    }
  }, [onExistingPost, onPostCreated, persistSessionFromStream, setMessages]);
  const runStream = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (payload, aiMsgId, abortSignal) => {
    const {
      text,
      image,
      images
    } = payload;
    const trimmed = text.trim();
    const activityId = activityLegacyIdRef.current;
    const activityHeaders = activityId != null ? {
      "X-Activity-Id": String(activityId)
    } : undefined;
    const pendingImage = image ?? images?.[0];
    const history = (0,_utils_aiChatHistory__WEBPACK_IMPORTED_MODULE_5__.buildApiChatHistory)(messagesRef.current, welcomeText, trimmed, pendingImage);
    const finishAiMessage = updater => {
      setMessages(prev => prev.map(message => message.id === aiMsgId ? updater(message) : message));
    };
    const typewriter = createTypewriter({
      charDelayMs: typewriterCharDelayMs,
      onUpdate: visible => {
        finishAiMessage(message => ({
          ...message,
          text: visible
        }));
      }
    });
    try {
      const useLiveApi = Boolean(apiUrl?.trim()) && (0,_constants_api__WEBPACK_IMPORTED_MODULE_2__.isApiEnabled)();
      const stream = useLiveApi ? (0,_utils_aiChatStream__WEBPACK_IMPORTED_MODULE_4__.streamAiChatRequest)({
        url: apiUrl,
        messages: history,
        sessionId: sessionIdRef.current,
        userId: userIdRef.current,
        userName: userNameRef.current,
        userPhone: userPhoneRef.current,
        activityLegacyId: activityId,
        image: pendingImage,
        images,
        signal: abortSignal,
        headers: {
          ...activityHeaders,
          ...getAuthHeaders?.()
        }
      }) : (0,_utils_aiChatStream__WEBPACK_IMPORTED_MODULE_4__.mockAiChatStream)(mockReply(trimmed));
      await processStreamEvents(stream, aiMsgId, typewriter);
    } catch (error) {
      if (error.name === "AbortError") {
        typewriter.stop();
        throw error;
      }
      typewriter.flush();
      finishAiMessage(message => ({
        ...message,
        text: message.text || streamErrorText,
        streaming: false
      }));
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: error instanceof Error && error.message ? error.message : streamErrorText,
        icon: "none"
      });
    } finally {
      finishAiMessage(message => ({
        ...message,
        streaming: false
      }));
    }
  }, [activityLegacyIdRef, apiUrl, createTypewriter, getAuthHeaders, messagesRef, mockReply, processStreamEvents, sessionIdRef, streamErrorText, typewriterCharDelayMs, userIdRef, userNameRef, userPhoneRef, welcomeText]);
  return {
    runStream
  };
}

/***/ }),

/***/ "./src/hooks/ai-chat/useTypewriterReply.ts":
/*!*************************************************!*\
  !*** ./src/hooks/ai-chat/useTypewriterReply.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTypewriterReply: function() { return /* binding */ useTypewriterReply; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_typewriterReveal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/typewriterReveal */ "./src/utils/typewriterReveal.ts");


function useTypewriterReply() {
  const typewriterRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const createTypewriter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(options => {
    const typewriter = (0,_utils_typewriterReveal__WEBPACK_IMPORTED_MODULE_1__.createTypewriterReveal)({
      charDelayMs: options.charDelayMs,
      onUpdate: options.onUpdate
    });
    typewriterRef.current = typewriter;
    return typewriter;
  }, []);
  const getActiveTypewriter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => typewriterRef.current, []);
  return {
    createTypewriter,
    getActiveTypewriter
  };
}

/***/ }),

/***/ "./src/hooks/useAiChatStream.ts":
/*!**************************************!*\
  !*** ./src/hooks/useAiChatStream.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAiChatStream: function() { return /* reexport safe */ _ai_chat_useAiChatStream__WEBPACK_IMPORTED_MODULE_0__.useAiChatStream; }
/* harmony export */ });
/* harmony import */ var _ai_chat_useAiChatStream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ai-chat/useAiChatStream */ "./src/hooks/ai-chat/useAiChatStream.ts");


/***/ }),

/***/ "./src/hooks/useResolvedProfile.ts":
/*!*****************************************!*\
  !*** ./src/hooks/useResolvedProfile.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useResolvedProfile: function() { return /* binding */ useResolvedProfile; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _pages_profile_mockData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../pages/profile/mockData */ "./src/pages/profile/mockData.ts");
/* harmony import */ var _useSyncApi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./useSyncApi */ "./src/hooks/useSyncApi.ts");





/** Profile summary from API with mock fallback (same as profile page). */
function useResolvedProfile() {
  const summaryQuery = (0,_useSyncApi__WEBPACK_IMPORTED_MODULE_3__.useProfileSummaryQuery)();
  const apiEnabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_1__.isApiEnabled)();
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => apiEnabled && summaryQuery.data ? summaryQuery.data : _pages_profile_mockData__WEBPACK_IMPORTED_MODULE_2__.profileUser, [apiEnabled, summaryQuery.data]);
}

/***/ }),

/***/ "./src/pages/ai-assistant/index.tsx":
/*!******************************************!*\
  !*** ./src/pages/ai-assistant/index.tsx ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/ai-assistant/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/ai-assistant/index!./src/pages/ai-assistant/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","disableScroll":true,"backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/ai-assistant/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_ai_assistant_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/aiChatHistory.ts":
/*!************************************!*\
  !*** ./src/utils/aiChatHistory.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildApiChatHistory: function() { return /* binding */ buildApiChatHistory; },
/* harmony export */   mapHistoryToUiMessages: function() { return /* binding */ mapHistoryToUiMessages; }
/* harmony export */ });
function resolveImageContext(message, pendingImage) {
  const source = message.imagePreview || pendingImage;
  if (!source && !message.ocrText) return undefined;
  return {
    source,
    ocrText: message.ocrText
  };
}

/** 将 MongoDB 完整历史映射为 UI 消息（不做截断） */
function mapHistoryToUiMessages(history, sessionId) {
  return history.filter(message => message.role === "user" || message.role === "assistant").map((message, index) => ({
    id: `${sessionId}-${index}`,
    from: message.role === "user" ? "user" : "ai",
    text: message.content,
    imagePreview: message.imageContext?.source,
    ocrText: message.imageContext?.ocrText,
    recommendedPosts: message.recommendedPosts,
    createdPost: message.createdPost,
    suggestedReplies: message.suggestedReplies
  }));
}

/** 构建发给后端的完整对话（排除 UI 欢迎语；后端自行截断 LLM 上下文） */
function buildApiChatHistory(uiMessages, welcomeText, pendingUserText, pendingImage) {
  const settled = uiMessages.filter(message => !message.streaming && (message.text || message.imagePreview || message.ocrText || message.recommendedPosts?.length || message.createdPost || message.suggestedReplies?.length));
  const apiMessages = [];
  for (let index = 0; index < settled.length; index += 1) {
    const message = settled[index];
    if (index === 0 && message.from === "ai" && message.text === welcomeText) {
      continue;
    }
    apiMessages.push({
      role: message.from === "user" ? "user" : "assistant",
      content: message.text || message.ocrText || "",
      imageContext: resolveImageContext(message),
      recommendedPosts: message.recommendedPosts,
      createdPost: message.createdPost,
      suggestedReplies: message.suggestedReplies
    });
  }
  if (pendingUserText || pendingImage) {
    apiMessages.push({
      role: "user",
      content: pendingUserText?.trim() || "",
      imageContext: pendingImage ? {
        source: pendingImage
      } : undefined
    });
  }
  return apiMessages;
}

/***/ }),

/***/ "./src/utils/aiChatStream.ts":
/*!***********************************!*\
  !*** ./src/utils/aiChatStream.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mockAiChatStream: function() { return /* binding */ mockAiChatStream; },
/* harmony export */   streamAiChatRequest: function() { return /* binding */ streamAiChatRequest; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);

function taroRequest(options) {
  return new Promise((resolve, reject) => {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().request({
      ...options,
      success: resolve,
      fail: err => {
        reject(new Error(err.errMsg || "网络请求失败"));
      }
    });
  });
}
function parseSseDataLine(line) {
  if (!line.startsWith("data:")) return null;
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return {
    type: "done"
  };
  try {
    const json = JSON.parse(payload);
    if (json.type === "error") {
      return {
        type: "error",
        message: String(json.message ?? "Unknown error")
      };
    }
    if (json.type === "delta" && typeof json.content === "string") {
      return {
        type: "delta",
        content: json.content
      };
    }
    if (json.type === "message_complete" && typeof json.content === "string") {
      return {
        type: "message_complete",
        content: json.content,
        requestId: typeof json.requestId === "string" ? json.requestId : undefined
      };
    }
    if (json.type === "done") {
      return {
        type: "done",
        messageId: json.messageId,
        sessionId: json.sessionId
      };
    }
    if (json.type === "post_created" && typeof json.postId === "string") {
      const post = json.post && typeof json.post === "object" ? json.post : undefined;
      return {
        type: "post_created",
        postId: json.postId,
        activityLegacyId: typeof json.activityLegacyId === "number" ? json.activityLegacyId : undefined,
        post: post && typeof post.postId === "string" && typeof post.snippet === "string" ? post : undefined
      };
    }
    if (json.type === "existing_post" && typeof json.postId === "string") {
      return {
        type: "existing_post",
        postId: json.postId,
        activityLegacyId: typeof json.activityLegacyId === "number" ? json.activityLegacyId : undefined
      };
    }
    if (json.type === "post_recommendations" && Array.isArray(json.posts)) {
      return {
        type: "post_recommendations",
        posts: json.posts,
        degraded: typeof json.degraded === "boolean" ? json.degraded : undefined
      };
    }
    if (json.type === "suggested_replies" && Array.isArray(json.replies)) {
      return {
        type: "suggested_replies",
        replies: json.replies.filter(item => typeof item === "string")
      };
    }
    if (json.type === "conversation_patch" && json.state && typeof json.state === "object") {
      return {
        type: "conversation_patch",
        state: json.state
      };
    }
    if (typeof json.content === "string") {
      return {
        type: "delta",
        content: json.content
      };
    }
    if (typeof json.delta === "string") {
      return {
        type: "delta",
        content: json.delta
      };
    }
  } catch {
    return {
      type: "delta",
      content: payload
    };
  }
  return null;
}
async function* parseSseText(text) {
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith(":")) continue;
    const event = parseSseDataLine(line);
    if (event) yield event;
  }
}
async function* streamAiChatRequest(options) {
  if (!options.url?.trim()) {
    throw new Error("AI chat URL is not configured");
  }
  if ( true && options.url.startsWith("/")) {
    throw new Error("小程序需配置完整 API 地址（TARO_APP_API_BASE_URL）");
  }
  const res = await taroRequest({
    url: options.url,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...options.headers
    },
    data: {
      messages: options.messages,
      sessionId: options.sessionId,
      userId: options.userId,
      userName: options.userName,
      userPhone: options.userPhone,
      activityLegacyId: options.activityLegacyId,
      image: options.image,
      images: options.images
    },
    timeout: 60_000,
    responseType: "text",
    enableChunked: true
  });
  if (res.statusCode !== 200) {
    throw new Error(`AI chat failed (${res.statusCode})`);
  }
  const text = typeof res.data === "string" ? res.data : res.data == null ? "" : JSON.stringify(res.data);
  if (!text.trim()) {
    throw new Error("AI chat returned an empty response");
  }
  let sawTerminal = false;
  for await (const event of parseSseText(text)) {
    if (event.type === "done" || event.type === "error") {
      sawTerminal = true;
    }
    yield event;
  }
  if (!sawTerminal) {
    yield {
      type: "done"
    };
  }
}
async function* mockAiChatStream(fullText) {
  if (fullText) {
    yield {
      type: "delta",
      content: fullText
    };
  }
  yield {
    type: "done"
  };
}

/***/ }),

/***/ "./src/utils/chatImage.ts":
/*!********************************!*\
  !*** ./src/utils/chatImage.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChatImageTooLargeError: function() { return /* binding */ ChatImageTooLargeError; },
/* harmony export */   pickAndCompressChatImages: function() { return /* binding */ pickAndCompressChatImages; }
/* harmony export */ });
/* unused harmony exports MAX_IMAGE_BASE64_BYTES, pickAndCompressChatImage, validateChatImageDataUrl */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);


/** 与后端一致：Base64 解码后不超过 10MB */
const MAX_IMAGE_BASE64_BYTES = 10 * 1024 * 1024;
class ChatImageTooLargeError extends Error {
  constructor() {
    super("IMAGE_TOO_LARGE");
    this.name = "ChatImageTooLargeError";
  }
}
function base64ByteSize(dataUrl) {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return Math.ceil(base64.length * 3 / 4);
}
function readFileAsJpegDataUrl(filePath) {
  const fs = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getFileSystemManager();
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      encoding: "base64",
      success: res => {
        const base64 = typeof res.data === "string" ? res.data : "";
        resolve(`data:image/jpeg;base64,${base64}`);
      },
      fail: err => reject(new Error(err.errMsg || "FILE_READ_FAILED"))
    });
  });
}
async function compressToJpegDataUrl(filePath) {
  let path = filePath;
  let quality = 80;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const compressed = await _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().compressImage({
      src: path,
      quality
    }).catch(() => null);
    if (compressed?.tempFilePath) {
      path = compressed.tempFilePath;
    }
    const dataUrl = await readFileAsJpegDataUrl(path);
    if (base64ByteSize(dataUrl) <= MAX_IMAGE_BASE64_BYTES) {
      return dataUrl;
    }
    quality = Math.max(35, quality - 10);
  }
  const finalDataUrl = await readFileAsJpegDataUrl(path);
  if (base64ByteSize(finalDataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }
  return finalDataUrl;
}

/** 选择并压缩聊天图片，返回 JPEG data URL */
async function pickAndCompressChatImage() {
  const images = await pickAndCompressChatImages(1);
  return images[0] ?? null;
}

/** 选择并压缩多张聊天图片，返回 JPEG data URL 数组 */
async function pickAndCompressChatImages(maxCount = 6) {
  const result = await _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().chooseImage({
    count: maxCount,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"]
  }).catch(() => null);
  const paths = result?.tempFilePaths ?? [];
  if (!paths.length) return [];
  const compressed = [];
  for (const path of paths) {
    try {
      const dataUrl = await compressToJpegDataUrl(path);
      compressed.push(dataUrl);
    } catch {
      // skip failed images
    }
  }
  return compressed;
}
function validateChatImageDataUrl(dataUrl) {
  if (base64ByteSize(dataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }
}

/***/ }),

/***/ "./src/utils/inferAuthorGender.ts":
/*!****************************************!*\
  !*** ./src/utils/inferAuthorGender.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inferAuthorGenderFromPost: function() { return /* binding */ inferAuthorGenderFromPost; }
/* harmony export */ });
function inferAuthorGenderFromPost(post) {
  if (post.authorGender === "female" || post.authorGender === "male") {
    return post.authorGender;
  }
  const haystack = [...(post.tags ?? []), post.snippet ?? ""].join(" ");
  if (/(\d+)人女生|女生同行|我们女生|女生一起/i.test(haystack) && !/男生女生都可|男女都可/i.test(haystack)) {
    return "female";
  }
  if (/(\d+)缺\d*男生|缺\d*男生|(\d+)人男生|男生拼车/i.test(haystack) && !/男生女生都可|男女都可/i.test(haystack)) {
    return "male";
  }
  if (/女生优先|限女生|只要女生|女孩子更好/i.test(haystack)) {
    return "female";
  }
  const name = post.authorName?.trim().toLowerCase() ?? "";
  const first = name.split(/\s+/)[0] ?? name;
  if (["luna", "zara", "mia", "jade", "nova", "chen"].some(h => first.includes(h))) {
    return "female";
  }
  if (["ryan", "sam", "leo", "kai", "alex"].some(h => first.includes(h))) {
    return "male";
  }
  return undefined;
}

/***/ }),

/***/ "./src/utils/typewriterReveal.ts":
/*!***************************************!*\
  !*** ./src/utils/typewriterReveal.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTypewriterReveal: function() { return /* binding */ createTypewriterReveal; }
/* harmony export */ });
function createTypewriterReveal(options) {
  const charDelayMs = options.charDelayMs ?? 22;
  let target = "";
  let visible = "";
  let timer = null;
  let resolveWait = null;
  const notifyWaiters = () => {
    if (visible.length >= target.length && !timer && resolveWait) {
      const resolve = resolveWait;
      resolveWait = null;
      resolve();
    }
  };
  const tick = () => {
    if (visible.length >= target.length) {
      timer = null;
      notifyWaiters();
      return;
    }
    visible = target.slice(0, visible.length + 1);
    options.onUpdate(visible);
    timer = setTimeout(tick, charDelayMs);
  };
  const ensureRunning = () => {
    if (timer == null && visible.length < target.length) {
      tick();
    }
  };
  const flushNow = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    visible = target;
    options.onUpdate(visible);
    notifyWaiters();
  };
  return {
    append(chunk) {
      if (!chunk) return;
      target += chunk;
      ensureRunning();
    },
    ensureTarget(text) {
      if (!text) return;
      if (text.length <= target.length) return;
      target = text;
      ensureRunning();
    },
    setFullText(text) {
      target = text;
      flushNow();
    },
    flush: flushNow,
    stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    waitUntilComplete() {
      if (visible.length >= target.length && !timer) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        resolveWait = resolve;
        ensureRunning();
      });
    },
    getTarget: () => target
  };
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/ai-assistant/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map