"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["common"],{

/***/ "./src/api/syncApi.ts":
/*!****************************!*\
  !*** ./src/api/syncApi.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addPostComment: function() { return /* binding */ addPostComment; },
/* harmony export */   applyToPost: function() { return /* binding */ applyToPost; },
/* harmony export */   blockUser: function() { return /* binding */ blockUser; },
/* harmony export */   cancelActivityRegistration: function() { return /* binding */ cancelActivityRegistration; },
/* harmony export */   clearAllNotifications: function() { return /* binding */ clearAllNotifications; },
/* harmony export */   clearChatSession: function() { return /* binding */ clearChatSession; },
/* harmony export */   deleteNotification: function() { return /* binding */ deleteNotification; },
/* harmony export */   deletePost: function() { return /* binding */ deletePost; },
/* harmony export */   fetchActivities: function() { return /* binding */ fetchActivities; },
/* harmony export */   fetchActivityByLegacyId: function() { return /* binding */ fetchActivityByLegacyId; },
/* harmony export */   fetchAllPosts: function() { return /* binding */ fetchAllPosts; },
/* harmony export */   fetchChatSession: function() { return /* binding */ fetchChatSession; },
/* harmony export */   fetchCurrentUser: function() { return /* binding */ fetchCurrentUser; },
/* harmony export */   fetchHomeSummary: function() { return /* binding */ fetchHomeSummary; },
/* harmony export */   fetchNotificationUnreadCount: function() { return /* binding */ fetchNotificationUnreadCount; },
/* harmony export */   fetchNotifications: function() { return /* binding */ fetchNotifications; },
/* harmony export */   fetchPopularPosts: function() { return /* binding */ fetchPopularPosts; },
/* harmony export */   fetchPostComments: function() { return /* binding */ fetchPostComments; },
/* harmony export */   fetchPostsByActivity: function() { return /* binding */ fetchPostsByActivity; },
/* harmony export */   fetchProfileActivities: function() { return /* binding */ fetchProfileActivities; },
/* harmony export */   fetchProfilePosts: function() { return /* binding */ fetchProfilePosts; },
/* harmony export */   fetchProfileSummary: function() { return /* binding */ fetchProfileSummary; },
/* harmony export */   likePost: function() { return /* binding */ likePost; },
/* harmony export */   markAllNotificationsRead: function() { return /* binding */ markAllNotificationsRead; },
/* harmony export */   markNotificationRead: function() { return /* binding */ markNotificationRead; },
/* harmony export */   registerForActivity: function() { return /* binding */ registerForActivity; },
/* harmony export */   submitReport: function() { return /* binding */ submitReport; },
/* harmony export */   updateCurrentUser: function() { return /* binding */ updateCurrentUser; },
/* harmony export */   updatePost: function() { return /* binding */ updatePost; }
/* harmony export */ });
/* unused harmony exports matchActivity, fetchBlockedUserIds, unblockUser, createPost */
/* harmony import */ var _utils_apiClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/apiClient */ "./src/utils/apiClient.ts");
/* harmony import */ var _utils_session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/session */ "./src/utils/session.ts");


function fetchActivities() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/activities");
}
function matchActivity(keyword) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/activities/match", {
    keyword
  });
}
function fetchHomeSummary() {
  // eslint-disable-next-line no-console
  console.log("[syncApi] fetchHomeSummary called");
  const result = (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/home", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
  // eslint-disable-next-line no-console
  console.log("[syncApi] fetchHomeSummary returned promise");
  return result;
}
function fetchActivityByLegacyId(legacyId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)(`/activities/${legacyId}`);
}
function registerForActivity(legacyId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)(`/activities/${legacyId}/register`, {}, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function cancelActivityRegistration(legacyId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/activities/${legacyId}/register`, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchCurrentUser() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/users/me", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function updateCurrentUser(payload) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPatch)("/users/me", payload, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchBlockedUserIds() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/users/blocks", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function blockUser(blockedUserId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)("/users/blocks", {
    blockedUserId
  }, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function unblockUser(blockedUserId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/users/blocks/${encodeURIComponent(blockedUserId)}`, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function submitReport(payload) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)("/reports", payload, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchPopularPosts(limit = 20) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/posts/popular", {
    limit: String(limit),
    ...(0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)()
  });
}
function fetchAllPosts() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/posts/all", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchPostsByActivity(activityLegacyId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/posts", {
    activityLegacyId: String(activityLegacyId),
    ...(0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)()
  });
}
function fetchProfileSummary() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/profile", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchProfileActivities() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/profile/activities", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchProfilePosts() {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/profile/posts", (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function deletePost(postId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/posts/${postId}`, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function createPost(payload) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)("/posts", payload, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function updatePost(postId, payload) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPatch)(`/posts/${postId}`, payload, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function likePost(postId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)(`/posts/${postId}/like`, {}, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function applyToPost(postId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)(`/posts/${postId}/applications`, {}, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchPostComments(postId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)(`/posts/${postId}/comments`);
}
function addPostComment(postId, body, parentCommentId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPost)(`/posts/${postId}/comments`, {
    body,
    ...(parentCommentId ? {
      parentCommentId
    } : {})
  }, (0,_utils_session__WEBPACK_IMPORTED_MODULE_1__.ownerParams)());
}
function fetchChatSession(sessionId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)(`/chat/sessions/${sessionId}`);
}
function clearChatSession(sessionId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/chat/sessions/${sessionId}`);
}
function fetchNotifications(userId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/notifications", {
    userId
  });
}
function fetchNotificationUnreadCount(userId) {
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiGet)("/notifications/unread-count", {
    userId
  });
}
function markNotificationRead(id, userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPatch)(`/notifications/${id}/read${query}`, {});
}
function markAllNotificationsRead(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiPatch)(`/notifications/read-all${query}`, {});
}
function deleteNotification(id, userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/notifications/${id}${query}`);
}
function clearAllNotifications(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return (0,_utils_apiClient__WEBPACK_IMPORTED_MODULE_0__.apiDelete)(`/notifications${query}`);
}

/***/ }),

/***/ "./src/components/ActionSheet.tsx":
/*!****************************************!*\
  !*** ./src/components/ActionSheet.tsx ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useOverlayLock__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useOverlayLock */ "./src/hooks/useOverlayLock.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/components/ui/index.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






const ActionSheet = ({
  open,
  title,
  items,
  cancelLabel,
  onCancel
}) => {
  (0,_hooks_useOverlayLock__WEBPACK_IMPORTED_MODULE_3__.useOverlayLock)(open);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-overlay s-overlay--sheet", !open && "s-overlay--off"),
    role: "presentation",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-overlay__backdrop",
      onClick: onCancel
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-overlay__panel",
      role: "menu",
      "aria-hidden": !open,
      children: [title ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "s-overlay-sheet__title",
        children: title
      }) : null, items.map(item => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
        role: "menuitem",
        className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-overlay-sheet__item", item.active && "s-overlay-sheet__item--active"),
        onClick: item.onSelect,
        children: item.label
      }, item.label)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
        className: "s-overlay-sheet__cancel",
        onClick: onCancel,
        children: cancelLabel
      })]
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (ActionSheet);

/***/ }),

/***/ "./src/components/BottomNav.tsx":
/*!**************************************!*\
  !*** ./src/components/BottomNav.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BottomNavSlot: function() { return /* binding */ BottomNavSlot; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






const BottomNav = () => {
  const activePath = (0,_utils_route__WEBPACK_IMPORTED_MODULE_1__.useActiveRoutePath)();
  const navItems = [{
    path: _utils_route__WEBPACK_IMPORTED_MODULE_1__.ROUTES.HOME,
    icon: lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.House,
    label: "首页"
  }, {
    path: _utils_route__WEBPACK_IMPORTED_MODULE_1__.ROUTES.EVENTS,
    icon: lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.CalendarDays,
    label: "活动"
  }, {
    path: _utils_route__WEBPACK_IMPORTED_MODULE_1__.ROUTES.PROFILE,
    icon: lucide_react_taro__WEBPACK_IMPORTED_MODULE_3__.User,
    label: "我的"
  }];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    "data-cmp": "BottomNav",
    className: "s-bottom-nav",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-bottom-nav__row",
      children: navItems.map(item => {
        const isActive = activePath === item.path;
        const Icon = item.icon;
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          disabled: isActive,
          onClick: () => (0,_utils_route__WEBPACK_IMPORTED_MODULE_1__.reLaunchTo)(item.path),
          className: "s-bottom-nav__item",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(Icon, {
            size: 24,
            color: isActive ? "#ffffff" : "#888888",
            strokeWidth: isActive ? 2.5 : 1.5,
            className: `s-bottom-nav__icon${isActive ? " s-bottom-nav__icon--active" : ""}`
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: `s-bottom-nav__label${isActive ? " s-bottom-nav__label--active" : ""}`,
            children: item.label
          })]
        }, item.path);
      })
    })
  });
};

/** Renders BottomNav in a viewport-fixed host (required on WeChat tab pages). */
function BottomNavSlot() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "s-tabbar-fixed-host",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(BottomNav, {})
  });
}
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (BottomNav);

/***/ }),

/***/ "./src/components/ConfirmDialog.tsx":
/*!******************************************!*\
  !*** ./src/components/ConfirmDialog.tsx ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useOverlayLock__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useOverlayLock */ "./src/hooks/useOverlayLock.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/components/ui/index.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");





const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  onConfirm,
  onCancel
}) => {
  (0,_hooks_useOverlayLock__WEBPACK_IMPORTED_MODULE_3__.useOverlayLock)(open);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: (0,_ui__WEBPACK_IMPORTED_MODULE_1__.cn)("s-overlay s-confirm-dialog", !open && "s-overlay--off"),
    style: {
      zIndex: "var(--overlay-z-dialog)"
    },
    role: "presentation",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-overlay__backdrop",
      onClick: onCancel
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-overlay__panel",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "confirm-dialog-title",
      "aria-describedby": "confirm-dialog-message",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "s-overlay__body",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "s-overlay__title-wrap",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            id: "confirm-dialog-title",
            className: "s-overlay__title",
            children: title
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "s-overlay__message-wrap",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            id: "confirm-dialog-message",
            className: "s-overlay__message",
            children: message
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "s-overlay__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          block: "s-overlay",
          element: "btn",
          modifiers: ["cancel"],
          onClick: onCancel,
          children: cancelText
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          block: "s-overlay",
          element: "btn",
          modifiers: ["confirm", danger && "danger"],
          onClick: onConfirm,
          children: confirmText
        })]
      })]
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (ConfirmDialog);

/***/ }),

/***/ "./src/components/ContentTypeBadge.tsx":
/*!*********************************************!*\
  !*** ./src/components/ContentTypeBadge.tsx ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentTypeBadge: function() { return /* binding */ ContentTypeBadge; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const TYPE_LABELS = {
  team: "组队",
  accommodation: "住宿",
  carpool: "拼车",
  other: "其他"
};
const TYPE_STYLES = {
  team: "s-content-badge--team",
  accommodation: "s-content-badge--accommodation",
  carpool: "s-content-badge--carpool",
  other: "s-content-badge--other"
};
const ContentTypeBadge = ({
  types
}) => {
  if (!types?.length) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
    className: "s-content-badges",
    children: types.map(type => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
      className: `s-content-badge ${TYPE_STYLES[type] ?? ""}`,
      children: TYPE_LABELS[type] ?? type
    }, type))
  });
};

/***/ }),

/***/ "./src/components/FeedPostList.tsx":
/*!*****************************************!*\
  !*** ./src/components/FeedPostList.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FeedPostList: function() { return /* binding */ FeedPostList; }
/* harmony export */ });
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/components/ui/index.ts");
/* harmony import */ var _MetaRow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MetaRow */ "./src/components/MetaRow.tsx");
/* harmony import */ var _PostCommentSection__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PostCommentSection */ "./src/components/PostCommentSection.tsx");
/* harmony import */ var _PostActionMenu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PostActionMenu */ "./src/components/PostActionMenu.tsx");
/* harmony import */ var _PostStatusBadge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PostStatusBadge */ "./src/components/PostStatusBadge.tsx");
/* harmony import */ var _ContentTypeBadge__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ContentTypeBadge */ "./src/components/ContentTypeBadge.tsx");
/* harmony import */ var _PostImageGrid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./PostImageGrid */ "./src/components/PostImageGrid.tsx");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _utils_postOwnership__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/postOwnership */ "./src/utils/postOwnership.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _utils_postActionColors__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../utils/postActionColors */ "./src/utils/postActionColors.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
















function FeedPostRowInner({
  post,
  commentsExpanded,
  currentUserAvatar,
  onDelete,
  onLike,
  onCommentSubmitted,
  onToggleComments
}) {
  const isOwn = (0,_utils_postOwnership__WEBPACK_IMPORTED_MODULE_9__.isCurrentUserPostAuthor)(post.name, post.userId);
  const avatarSrc = (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_10__.thumbnailImageUrl)(post.avatar, 80) ?? post.avatar;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
    className: "s-home-post",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
      className: "s-home-post__header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Image, {
        className: "s-home-post__avatar",
        src: avatarSrc,
        mode: "aspectFill",
        lazyLoad: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-home-post__head-main",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
          className: "s-home-post__top",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
            className: "s-home-post__user-line",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
              className: "s-home-post__user-name",
              children: post.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
              children: post.handle
            }), post.images?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PostImageGrid__WEBPACK_IMPORTED_MODULE_7__.PostImageCount, {
              count: post.images.length
            }) : null]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
            className: "s-home-post__head-actions",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PostStatusBadge__WEBPACK_IMPORTED_MODULE_5__.PostStatusBadge, {
              status: post.status,
              variant: "home",
              isOwn: isOwn
            }), !isOwn ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PostActionMenu__WEBPACK_IMPORTED_MODULE_4__.PostActionMenu, {
              postId: post.id,
              authorUserId: post.userId
            }) : null]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
          className: "s-home-post__event-name",
          children: post.event
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
          className: "s-home-post__location",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_MetaRow__WEBPACK_IMPORTED_MODULE_2__.MetaRow, {
            className: "s-home-post__meta-row",
            icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__.MapPin, {
              size: 13,
              color: "#4cc9f0"
            }),
            children: post.location
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
      className: "s-home-post__text",
      children: post.body
    }), post.images?.length ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PostImageGrid__WEBPACK_IMPORTED_MODULE_7__.PostImageGrid, {
      images: post.images
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_ContentTypeBadge__WEBPACK_IMPORTED_MODULE_6__.ContentTypeBadge, {
      types: post.contentTypes
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
      className: "s-home-post__footer",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
        className: "s-home-post__time",
        children: post.time
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
        className: "s-home-post__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          className: `s-home-post__action${post.liked ? " s-home-post__action--liked" : ""}`,
          onClick: () => onLike?.(post),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__.ThumbsUp, {
            size: 16,
            filled: post.liked,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_14__.postActionIconColor)({
              liked: post.liked
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
            className: "s-home-post__action-label",
            children: post.likes
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          className: `s-home-post__action${commentsExpanded ? " s-home-post__action--active" : ""}`,
          onClick: () => onToggleComments(post.id),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__.MessageCircle, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_14__.postActionIconColor)({
              active: commentsExpanded
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
            className: "s-home-post__action-label",
            children: post.comments
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          className: "s-home-post__action",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__.Share2, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_14__.postActionIconColor)({})
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
            className: "s-home-post__action-label",
            children: "\u5206\u4EAB"
          })]
        }), isOwn && onDelete ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_ui__WEBPACK_IMPORTED_MODULE_1__.Button, {
          className: "s-home-post__action",
          onClick: () => onDelete(post),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_13__.Trash2, {
            size: 16,
            color: (0,_utils_postActionColors__WEBPACK_IMPORTED_MODULE_14__.postActionIconColor)({})
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.Text, {
            className: "s-home-post__action-label",
            children: "\u5220\u9664"
          })]
        }) : null]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PostCommentSection__WEBPACK_IMPORTED_MODULE_3__.PostCommentSection, {
      postId: post.id,
      expanded: commentsExpanded,
      onToggleExpanded: () => onToggleComments(post.id),
      currentUserAvatar: currentUserAvatar,
      onCommentSubmitted: onCommentSubmitted
    })]
  });
}
const FeedPostRow = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(FeedPostRowInner);
function FeedPostListInner({
  items,
  onDelete,
  onLike,
  onCommentSubmitted
}) {
  const {
    data: currentUser
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_8__.useCurrentUserQuery)();
  const [expandedCommentPostIds, setExpandedCommentPostIds] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => new Set());
  const togglePostComments = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(postId => {
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_12__.View, {
    className: "s-feed-post-list",
    children: items.map(post => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(FeedPostRow, {
      post: post,
      commentsExpanded: expandedCommentPostIds.has(post.id),
      currentUserAvatar: currentUser?.avatar,
      onDelete: onDelete,
      onLike: onLike,
      onCommentSubmitted: onCommentSubmitted,
      onToggleComments: togglePostComments
    }, post.id))
  });
}
const FeedPostList = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(FeedPostListInner);

/***/ }),

/***/ "./src/components/ImageWithFallback.tsx":
/*!**********************************************!*\
  !*** ./src/components/ImageWithFallback.tsx ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageWithFallback: function() { return /* binding */ ImageWithFallback; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const ImageWithFallback = ({
  src,
  alt = "",
  referrerPolicy = "no-referrer",
  imageClassName,
  placeholderClassName,
  placeholderAriaHidden = true,
  fallback,
  wrapperClassName,
  fallbackWrapperClassName,
  priority = false,
  mode = "aspectFill"
}) => {
  const [broken, setBroken] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const resolvedSrc = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(src), [src]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setBroken(false);
  }, [resolvedSrc]);
  const showImage = Boolean(resolvedSrc) && !broken;
  const imgLoading = priority ? "eager" : "lazy";
  const imgDecoding = priority ? "sync" : "async";
  const imgFetchPriority = priority ? "high" : undefined;
  const renderImg = className => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Image, {
    src: resolvedSrc,
    alt: alt,
    mode: mode,
    className: className,
    referrerPolicy: referrerPolicy,
    lazyLoad: !priority,
    loading: imgLoading,
    decoding: imgDecoding,
    ...(imgFetchPriority ? {
      fetchPriority: imgFetchPriority
    } : {}),
    onError: () => setBroken(true)
  });
  if (wrapperClassName) {
    const wrapperClass = showImage ? wrapperClassName : fallbackWrapperClassName ?? wrapperClassName;
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: wrapperClass,
      children: showImage ? renderImg(imageClassName) : fallback
    });
  }
  if (showImage) {
    return renderImg(imageClassName);
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: placeholderClassName,
    "aria-hidden": placeholderAriaHidden ? true : undefined,
    children: fallback
  });
};

/***/ }),

/***/ "./src/components/ListState.tsx":
/*!**************************************!*\
  !*** ./src/components/ListState.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ListState: function() { return /* binding */ ListState; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



const ListState = ({
  isLoading,
  isError,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  onRetry,
  retryText,
  stateClassName,
  retryClassName,
  children
}) => {
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
      className: stateClassName,
      children: loadingText
    });
  }
  if (isError) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
      className: stateClassName,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
        children: errorText
      }), onRetry ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
        className: retryClassName,
        onClick: () => void onRetry(),
        children: retryText
      }) : null]
    });
  }
  if (isEmpty) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
      className: stateClassName,
      children: emptyText
    });
  }
  return children ?? null;
};

/***/ }),

/***/ "./src/components/MetaRow.tsx":
/*!************************************!*\
  !*** ./src/components/MetaRow.tsx ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MetaRow: function() { return /* binding */ MetaRow; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const MetaRow = ({
  icon,
  className,
  children
}) => {
  const rootClass = ["s-meta-row", className].filter(Boolean).join(" ");
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
    className: rootClass,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.View, {
      className: "s-meta-row__icon",
      children: icon
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_2__.Text, {
      className: "s-meta-row__text",
      children: children
    })]
  });
};

/***/ }),

/***/ "./src/components/PageNavigation.tsx":
/*!*******************************************!*\
  !*** ./src/components/PageNavigation.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui */ "./src/components/ui/index.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");







const PageNavigation = ({
  title,
  onBack,
  fallback,
  trailing
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_1__.goBack)(fallback);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    "data-cmp": "PageNavigation",
    className: "s-page-nav",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
      block: "s-page-nav",
      element: "icon-btn",
      modifiers: [`back`],
      onClick: handleBack,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_5__.ChevronLeft, {
        size: 20
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
      className: "s-page-nav__title s-line-clamp-1",
      children: title
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-page-nav__trailing",
      children: trailing ?? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "s-page-nav__spacer"
      })
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (PageNavigation);

/***/ }),

/***/ "./src/components/PostActionMenu.tsx":
/*!*******************************************!*\
  !*** ./src/components/PostActionMenu.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostActionMenu: function() { return /* binding */ PostActionMenu; }
/* harmony export */ });
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ActionSheet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActionSheet */ "./src/components/ActionSheet.tsx");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");









const PostActionMenu = ({
  postId,
  authorUserId,
  disabled
}) => {
  const [menuOpen, setMenuOpen] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [reportOpen, setReportOpen] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_3__.useConfirmDialog)({
    cancelText: "取消"
  });
  const closeAll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setMenuOpen(false);
    setReportOpen(false);
  }, []);
  const handleBlock = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    closeAll();
    if (!authorUserId?.trim()) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "无法屏蔽该用户",
        icon: "none"
      });
      return;
    }
    const confirmed = await confirm({
      title: "屏蔽用户",
      message: "屏蔽后将不再看到该用户的内容，确定要继续吗？",
      confirmText: "屏蔽"
    });
    if (!confirmed) return;
    try {
      await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__.blockUserAndInvalidate)(authorUserId);
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "已屏蔽",
        icon: "success"
      });
    } catch {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "屏蔽失败，请稍后重试",
        icon: "none"
      });
    }
  }, [authorUserId, closeAll, confirm]);
  const handleReport = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async category => {
    closeAll();
    try {
      await (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__.submitReportAndInvalidate)({
        targetType: "post",
        targetId: postId,
        targetUserId: authorUserId,
        category
      });
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "举报已提交",
        icon: "success"
      });
    } catch {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
        title: "举报失败，请稍后重试",
        icon: "none"
      });
    }
  }, [authorUserId, closeAll, postId]);
  if (disabled) return null;
  const reportCategories = ["ads", "scalper", "vulgar"];
  const categoryLabels = {
    ads: "广告骚扰",
    scalper: "黄牛/欺诈",
    vulgar: "低俗内容"
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.View, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__.Button, {
      className: "s-post-action-menu__trigger",
      "aria-label": "\u66F4\u591A",
      onClick: () => setMenuOpen(true),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_7__.EllipsisVertical, {
        size: 18,
        color: "#8e8e93"
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_ActionSheet__WEBPACK_IMPORTED_MODULE_2__["default"], {
      open: menuOpen,
      title: "\u5E16\u5B50\u64CD\u4F5C",
      cancelLabel: "\u53D6\u6D88",
      onCancel: closeAll,
      items: [{
        label: "举报",
        onSelect: () => {
          setMenuOpen(false);
          setReportOpen(true);
        }
      }, {
        label: "屏蔽",
        onSelect: () => void handleBlock()
      }]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_ActionSheet__WEBPACK_IMPORTED_MODULE_2__["default"], {
      open: reportOpen,
      title: "\u4E3E\u62A5\u539F\u56E0",
      cancelLabel: "\u53D6\u6D88",
      onCancel: closeAll,
      items: reportCategories.map(category => ({
        label: categoryLabels[category],
        onSelect: () => void handleReport(category)
      }))
    }), confirmDialog]
  });
};

/***/ }),

/***/ "./src/components/PostCommentSection.tsx":
/*!***********************************************!*\
  !*** ./src/components/PostCommentSection.tsx ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostCommentSection: function() { return /* binding */ PostCommentSection; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _constants_remoteImages__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/remoteImages */ "./src/constants/remoteImages.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");










const DEFAULT_AVATAR = _constants_remoteImages__WEBPACK_IMPORTED_MODULE_6__.PLACEHOLDER_AVATAR;
const PostCommentSection = ({
  postId,
  expanded,
  onToggleExpanded,
  currentUserAvatar,
  onCommentSubmitted
}) => {
  const apiEnabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  const commentsQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_2__.usePostCommentsQuery)(postId, expanded);
  const [draft, setDraft] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
  const [submitting, setSubmitting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [likedCommentIds, setLikedCommentIds] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Set());
  const handleSubmit = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    const body = draft.trim();
    if (!body || submitting) return;
    if (!apiEnabled) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "请开启 API 模式",
        icon: "none"
      });
      return;
    }
    setSubmitting(true);
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_2__.commentPostAndInvalidate)(postId, body).then(() => {
      setDraft("");
      onCommentSubmitted?.();
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "评论成功",
        icon: "success"
      });
    }).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "评论失败",
      icon: "none"
    })).finally(() => setSubmitting(false));
  }, [apiEnabled, draft, onCommentSubmitted, postId, submitting]);
  const toggleCommentLike = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(commentId => {
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);
  const userAvatar = (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_4__.sanitizeRemoteImageUrl)(currentUserAvatar?.trim()) || DEFAULT_AVATAR;
  const comments = commentsQuery.data ?? [];
  if (!expanded) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
    className: "s-post-comments",
    "aria-label": "\u5E16\u5B50\u8BC4\u8BBA",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      className: "s-post-comments__list",
      children: commentsQuery.isLoading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        className: "s-post-comments__status",
        children: "\u52A0\u8F7D\u4E2D\u2026"
      }) : commentsQuery.isError ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        className: "s-post-comments__status",
        children: "\u8BC4\u8BBA\u52A0\u8F7D\u5931\u8D25"
      }) : comments.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        className: "s-post-comments__status",
        children: "\u6682\u65E0\u8BC4\u8BBA\uFF0C\u6765\u62A2\u6C99\u53D1\u5427"
      }) : comments.map(comment => {
        const liked = likedCommentIds.has(comment.id);
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
          className: "s-post-comments__item",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Image, {
            className: "s-post-comments__avatar",
            src: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_4__.sanitizeRemoteImageUrl)(comment.avatar) || DEFAULT_AVATAR
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
            className: "s-post-comments__body-wrap",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
              className: "s-post-comments__meta",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
                style: {
                  fontWeight: "bold"
                },
                children: comment.authorName
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
                children: comment.time
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
              className: "s-post-comments__bubble",
              children: comment.body
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Button, {
              className: `s-post-comments__like${liked ? " s-post-comments__like--active" : ""}`,
              onClick: () => toggleCommentLike(comment.id),
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__.Heart, {
                size: 12,
                filled: liked,
                color: liked ? "#ff0066" : "#8e8e93"
              }), "\u8D5E"]
            })]
          })]
        }, comment.id);
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      className: "s-post-comments__composer",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Image, {
        className: "s-post-comments__avatar",
        src: userAvatar
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        className: "s-post-comments__input-wrap",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Input, {
          className: "s-post-comments__input",
          value: draft,
          placeholder: "\u8BF4\u70B9\u4EC0\u4E48...",
          onInput: e => setDraft(e.target.value),
          onKeyDown: e => {
            if (e.key === "Enter" && draft.trim()) handleSubmit();
          }
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Button, {
          className: "s-post-comments__send",
          "aria-label": "\u53D1\u9001\u8BC4\u8BBA",
          disabled: !draft.trim() || submitting,
          onClick: handleSubmit,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__.Send, {
            size: 14
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Button, {
      className: "s-post-comments__toggle",
      onClick: onToggleExpanded,
      children: ["\u6536\u8D77\u8BC4\u8BBA", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_8__.ChevronUp, {
        size: 14
      })]
    })]
  });
};

/***/ }),

/***/ "./src/components/PostImageGrid.tsx":
/*!******************************************!*\
  !*** ./src/components/PostImageGrid.tsx ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostImageCount: function() { return /* binding */ PostImageCount; },
/* harmony export */   PostImageGrid: function() { return /* binding */ PostImageGrid; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _utils_openImagePreview__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/openImagePreview */ "./src/utils/openImagePreview.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");







const LIST_THUMB_WIDTH = 480;
const THUMB_ROW_WIDTH = 200;
function PostImageGrid({
  images,
  maxDisplay = 6
}) {
  const validImages = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => images.map(src => (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(src) ?? src).filter(Boolean).slice(0, maxDisplay), [images, maxDisplay]);
  const displayImages = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => validImages.map((src, index) => {
    const width = index === 0 && validImages.length >= 4 ? LIST_THUMB_WIDTH : THUMB_ROW_WIDTH;
    return (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_1__.thumbnailImageUrl)(src, width) ?? src;
  }), [validImages]);
  const handleOpen = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(index => {
    void (0,_utils_openImagePreview__WEBPACK_IMPORTED_MODULE_2__.openImagePreview)(validImages, index);
  }, [validImages]);
  if (!validImages.length) return null;
  const count = validImages.length;
  const renderImage = (src, className) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Image, {
    src: src,
    className: className,
    mode: "aspectFill",
    lazyLoad: true
  });

  // 1-3张：统一网格布局
  if (count <= 3) {
    const gridClass = count === 1 ? "s-post-image-grid--1" : count === 2 ? "s-post-image-grid--2" : "s-post-image-grid--3";
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: `s-post-image-grid ${gridClass}`,
      children: displayImages.map((src, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
        className: "s-post-image-grid__item",
        onClick: () => handleOpen(index),
        "aria-label": `查看图片 ${index + 1}`,
        children: renderImage(src, "s-post-image-grid__img")
      }, `${src.slice(0, 40)}-${index}`))
    });
  }

  // 4-6张：首图突出 + 缩略图行（截图样式）
  const featured = displayImages[0];
  const thumbnails = displayImages.slice(1);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "s-post-image-grid s-post-image-grid--featured",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
      className: "s-post-image-grid__featured",
      onClick: () => handleOpen(0),
      "aria-label": "\u67E5\u770B\u56FE\u7247 1",
      children: [renderImage(featured, "s-post-image-grid__img"), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "s-post-image-grid__count-badge",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_5__.Image, {
          size: 14
        }), images.length]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-post-image-grid__thumbs",
      children: thumbnails.map((src, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
        className: "s-post-image-grid__thumb",
        onClick: () => handleOpen(index + 1),
        "aria-label": `查看图片 ${index + 2}`,
        children: [renderImage(src, "s-post-image-grid__img"), index === thumbnails.length - 1 && images.length > maxDisplay ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "s-post-image-grid__more",
          children: ["+", images.length - maxDisplay]
        }) : null]
      }, `${src.slice(0, 40)}-${index + 1}`))
    })]
  });
}
function PostImageCount({
  count
}) {
  if (count <= 0) return null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
    className: "s-post-image-count",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_5__.Image, {
      size: 12
    }), count]
  });
}

/***/ }),

/***/ "./src/components/PostStatusBadge.tsx":
/*!********************************************!*\
  !*** ./src/components/PostStatusBadge.tsx ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostStatusBadge: function() { return /* binding */ PostStatusBadge; }
/* harmony export */ });
/* harmony import */ var _nutui_nutui_react_taro_dist_es_packages_tag_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nutui/nutui-react-taro/dist/es/packages/tag/style */ "./node_modules/@nutui/nutui-react-taro/dist/es/packages/tag/style/index.js");
/* harmony import */ var _nutui_nutui_react_taro_dist_es_packages_tag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @nutui/nutui-react-taro/dist/es/packages/tag */ "./node_modules/@nutui/nutui-react-taro/dist/es/packages/tag/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_postStatus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/postStatus */ "./src/utils/postStatus.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");





const PostStatusBadge = ({
  status,
  variant,
  isOwn = false
}) => {
  if (!isOwn && ((0,_utils_postStatus__WEBPACK_IMPORTED_MODULE_3__.isRecruitingPostStatus)(status) || (0,_utils_postStatus__WEBPACK_IMPORTED_MODULE_3__.isHiddenPostStatus)(status))) {
    return null;
  }
  const label = variant === "home" || (0,_utils_postStatus__WEBPACK_IMPORTED_MODULE_3__.isHiddenPostStatus)(status) ? status : (0,_utils_postStatus__WEBPACK_IMPORTED_MODULE_3__.eventPostStatusText)((0,_utils_postStatus__WEBPACK_IMPORTED_MODULE_3__.toEventPostCardStatus)(status));
  const isFull = status === "已组队";
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_nutui_nutui_react_taro_dist_es_packages_tag__WEBPACK_IMPORTED_MODULE_4__["default"], {
    className: "s-post-status-badge",
    round: true,
    color: isFull ? "var(--muted-foreground)" : "#ff3366",
    background: isFull ? "rgba(255, 255, 255, 0.1)" : "rgba(74, 14, 28, 0.85)",
    children: label
  });
};

/***/ }),

/***/ "./src/components/ThemedPageLoader.tsx":
/*!*********************************************!*\
  !*** ./src/components/ThemedPageLoader.tsx ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ThemedPageLoader; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



function SkeletonBlocks({
  rows = 3
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: "s-themed-loader__skeleton-blocks",
    "aria-hidden": true,
    children: Array.from({
      length: rows
    }, (_, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__skeleton-line",
      style: {
        width: index === rows - 1 ? "62%" : "100%"
      }
    }, index))
  });
}
function EventDetailSkeleton() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: "s-themed-loader__event",
    "aria-hidden": true,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__event-header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__chip s-themed-loader__chip--round"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__event-title-block",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--title"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--meta"
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__chip s-themed-loader__chip--round"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__event-ai",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SkeletonBlocks, {
        rows: 2
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__event-post",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__post-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--avatar"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SkeletonBlocks, {
          rows: 3
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__event-post",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__post-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--avatar"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SkeletonBlocks, {
          rows: 2
        })]
      })
    })]
  });
}
function FeedSkeleton() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: "s-themed-loader__feed",
    "aria-hidden": true,
    children: Array.from({
      length: 4
    }, (_, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__feed-row",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__chip s-themed-loader__chip--icon"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
        className: "s-themed-loader__feed-copy",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--title"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
          className: "s-themed-loader__chip s-themed-loader__chip--body"
        })]
      })]
    }, index))
  });
}
function PinkSpinner() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: "s-themed-loader__spinner-wrap",
    "aria-hidden": true,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
      className: "s-themed-loader__spinner"
    })
  });
}
function ThemedPageLoader({
  variant = "spinner",
  overlay = false,
  label,
  showBrand = false,
  className,
  minHeight = 120
}) {
  const rootClass = ["s-themed-loader", overlay ? "s-themed-loader--overlay" : "", variant !== "spinner" && variant !== "inline" ? "s-themed-loader--skeleton" : "", className ?? ""].filter(Boolean).join(" ");
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.View, {
    className: rootClass,
    style: {
      minHeight: overlay ? undefined : minHeight
    },
    role: "status",
    "aria-live": "polite",
    "aria-busy": "true",
    "aria-label": label ?? "加载中",
    children: [showBrand ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
      className: "s-themed-loader__brand",
      children: "SYNC"
    }) : null, variant === "skeleton-event" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(EventDetailSkeleton, {}) : null, variant === "skeleton-feed" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(FeedSkeleton, {}) : null, variant === "spinner" || variant === "inline" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(PinkSpinner, {}) : null, label ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_1__.Text, {
      className: "s-themed-loader__label",
      children: label
    }) : null]
  });
}

/***/ }),

/***/ "./src/components/ui/Button.tsx":
/*!**************************************!*\
  !*** ./src/components/ui/Button.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: function() { return /* binding */ Button; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _bem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bem */ "./src/components/ui/bem.ts");
/* harmony import */ var _cn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cn */ "./src/components/ui/cn.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");





/**
 * Thin wrapper around Taro `<Button>` that composes existing BEM classes.
 * Pass `className` directly, or use `block` + `element` + `modifiers`.
 * Use Taro `type` (`primary` | `default` | `warn`) for style variants, not HTML button types.
 */
const Button = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(({
  block,
  element,
  modifiers,
  className,
  ...props
}, ref) => {
  const bemClass = block && element ? (0,_bem__WEBPACK_IMPORTED_MODULE_2__.bem)(block, element, modifiers) : undefined;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    ref: ref,
    className: (0,_cn__WEBPACK_IMPORTED_MODULE_4__.cn)(bemClass, className),
    ...props
  });
});
Button.displayName = `Button`;
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (Button);

/***/ }),

/***/ "./src/components/ui/Input.tsx":
/*!*************************************!*\
  !*** ./src/components/ui/Input.tsx ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Input: function() { return /* binding */ Input; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _cn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cn */ "./src/components/ui/cn.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");




const VARIANT_STYLES = {
  "ai-assistant-chat": {
    input: `s-ai-assistant-chat__input`
  },
  chat: {
    input: `s-chat__field`
  }
};
function renderIcon(icon, iconClass) {
  if (!icon) return null;
  if (!iconClass) return icon;
  if (/*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(icon)) {
    return /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(icon, {
      className: (0,_cn__WEBPACK_IMPORTED_MODULE_2__.cn)(iconClass, icon.props.className)
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
    className: iconClass,
    children: icon
  });
}
const Input = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(({
  variant,
  icon,
  fieldModifier,
  wrapperClassName,
  className,
  ...props
}, ref) => {
  if (!variant) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Input, {
      ref: ref,
      className: className,
      ...props
    });
  }
  const styles = VARIANT_STYLES[variant];
  const inputEl = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Input, {
    ref: ref,
    className: (0,_cn__WEBPACK_IMPORTED_MODULE_2__.cn)(styles.input, className),
    ...props
  });
  if (!styles.wrapper) return inputEl;
  const Wrapper = styles.wrapperTag ?? `div`;
  const wrapperClass = (0,_cn__WEBPACK_IMPORTED_MODULE_2__.cn)(styles.wrapper, fieldModifier && `${styles.wrapper}--${fieldModifier}`, wrapperClassName);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(Wrapper, {
    className: wrapperClass,
    children: [renderIcon(icon, styles.iconClass), inputEl]
  });
});
Input.displayName = `Input`;
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (Input);

/***/ }),

/***/ "./src/components/ui/bem.ts":
/*!**********************************!*\
  !*** ./src/components/ui/bem.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bem: function() { return /* binding */ bem; }
/* harmony export */ });
/* harmony import */ var _cn__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cn */ "./src/components/ui/cn.ts");


/** Build a BEM element class: `block__element` + optional `--modifier` suffixes. */
function bem(block, element, modifiers) {
  const base = `${block}__${element}`;
  const modClasses = (modifiers ?? []).filter(Boolean).map(m => `${base}--${m}`);
  return (0,_cn__WEBPACK_IMPORTED_MODULE_0__.cn)(base, ...modClasses);
}

/***/ }),

/***/ "./src/components/ui/cn.ts":
/*!*********************************!*\
  !*** ./src/components/ui/cn.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cn: function() { return /* binding */ cn; }
/* harmony export */ });
/** Join class names, skipping falsy values. */
function cn(...parts) {
  return parts.filter(Boolean).join(` `);
}

/***/ }),

/***/ "./src/components/ui/index.ts":
/*!************************************!*\
  !*** ./src/components/ui/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: function() { return /* reexport safe */ _Button__WEBPACK_IMPORTED_MODULE_0__.Button; },
/* harmony export */   Input: function() { return /* reexport safe */ _Input__WEBPACK_IMPORTED_MODULE_1__.Input; },
/* harmony export */   cn: function() { return /* reexport safe */ _cn__WEBPACK_IMPORTED_MODULE_2__.cn; }
/* harmony export */ });
/* harmony import */ var _Button__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Button */ "./src/components/ui/Button.tsx");
/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Input */ "./src/components/ui/Input.tsx");
/* harmony import */ var _cn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cn */ "./src/components/ui/cn.ts");





/***/ }),

/***/ "./src/config/pageWindow.ts":
/*!**********************************!*\
  !*** ./src/config/pageWindow.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PAGE_WINDOW_DARK: function() { return /* binding */ PAGE_WINDOW_DARK; }
/* harmony export */ });
/** Shared WeChat page window colors — avoids white flash during native transitions. */
const PAGE_WINDOW_DARK = {
  backgroundColor: "#000000",
  backgroundColorContent: "#000000",
  backgroundTextStyle: "light"
};

/***/ }),

/***/ "./src/constants/activityGuestAvatars.ts":
/*!***********************************************!*\
  !*** ./src/constants/activityGuestAvatars.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACTIVITY_GUEST_AVATARS: function() { return /* binding */ ACTIVITY_GUEST_AVATARS; }
/* harmony export */ });
/* harmony import */ var _remoteImages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./remoteImages */ "./src/constants/remoteImages.ts");


/** Shared participant avatar pile for activity cards (design mock). */
const ACTIVITY_GUEST_AVATARS = [..._remoteImages__WEBPACK_IMPORTED_MODULE_0__.ACTIVITY_GUEST_AVATAR_URLS];

/***/ }),

/***/ "./src/constants/api.ts":
/*!******************************!*\
  !*** ./src/constants/api.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AI_CHAT_STREAM_URL: function() { return /* binding */ AI_CHAT_STREAM_URL; },
/* harmony export */   API_BASE_URL: function() { return /* binding */ API_BASE_URL; },
/* harmony export */   isApiEnabled: function() { return /* binding */ isApiEnabled; }
/* harmony export */ });
/** Taro injects `process.env.TARO_*` at compile time; avoid `typeof process` guards. */
const rawBase = "http://192.168.1.7:3000/api" || (0);

/** REST API root, e.g. `https://api.example.com` (weapp) or `/api` (unmaintained H5 dev). */
const API_BASE_URL = rawBase.replace(/\/$/, "");

/** SSE 流式对话；未单独配置时由 API_BASE_URL 推导 */
const AI_CHAT_STREAM_URL = "http://192.168.1.7:3000/api/ai/chat" || (0);
function isApiEnabled() {
  return Boolean(API_BASE_URL);
}

/***/ }),

/***/ "./src/constants/remoteImages.ts":
/*!***************************************!*\
  !*** ./src/constants/remoteImages.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACTIVITY_GUEST_AVATAR_URLS: function() { return /* binding */ ACTIVITY_GUEST_AVATAR_URLS; },
/* harmony export */   PLACEHOLDER_AVATAR: function() { return /* binding */ PLACEHOLDER_AVATAR; },
/* harmony export */   PLACEHOLDER_EVENT_HERO: function() { return /* binding */ PLACEHOLDER_EVENT_HERO; }
/* harmony export */ });
/** Stable remote placeholders (WeChat-safe; no Unsplash). */
const PLACEHOLDER_AVATAR = "https://picsum.photos/seed/sync-avatar-default/200/200";
const PLACEHOLDER_EVENT_HERO = "https://picsum.photos/seed/sync-event-hero/800/600";
const ACTIVITY_GUEST_AVATAR_URLS = ["https://picsum.photos/seed/sync-guest-1/80/80", "https://picsum.photos/seed/sync-guest-2/80/80", "https://picsum.photos/seed/sync-guest-3/80/80"];

/***/ }),

/***/ "./src/hooks/useApiQuery.ts":
/*!**********************************!*\
  !*** ./src/hooks/useApiQuery.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   invalidateCache: function() { return /* binding */ invalidateCache; },
/* harmony export */   setCacheData: function() { return /* binding */ setCacheData; },
/* harmony export */   useApiQuery: function() { return /* binding */ useApiQuery; }
/* harmony export */ });
/* unused harmony exports getCacheKey, getCacheData */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const globalCache = new Map();
function getCacheKey(queryKey) {
  return queryKey.map(String).join("|");
}
function invalidateCache(queryKey) {
  const prefix = getCacheKey(queryKey);
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  }
}
function setCacheData(queryKey, updater) {
  const key = getCacheKey(queryKey);
  const existing = globalCache.get(key);
  const newData = updater(existing?.data);
  if (newData !== undefined) {
    globalCache.set(key, {
      data: newData,
      timestamp: Date.now()
    });
  }
}
function getCacheData(queryKey) {
  const key = getCacheKey(queryKey);
  return globalCache.get(key)?.data;
}
function useApiQuery(options) {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 0
  } = options;
  const cacheKey = getCacheKey(queryKey);
  const cached = globalCache.get(cacheKey);
  const [data, setData] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(cached?.data);
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isError, setIsError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const lastFetchRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(cached?.timestamp ?? 0);
  const fetch = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < staleTime && data !== undefined) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
      globalCache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      lastFetchRef.current = now;
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, staleTime, cacheKey, data]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (enabled) {
      void fetch();
    }
  }, [enabled, fetch]);
  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetch
  };
}

/***/ }),

/***/ "./src/hooks/useConfirmDialog.tsx":
/*!****************************************!*\
  !*** ./src/hooks/useConfirmDialog.tsx ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useConfirmDialog: function() { return /* binding */ useConfirmDialog; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_ConfirmDialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/ConfirmDialog */ "./src/components/ConfirmDialog.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");



/**
 * Themed confirm dialog hook. Prefer this over `Taro.showModal` for user-facing
 * confirmations so copy and styling stay consistent with the app shell.
 */
function useConfirmDialog(defaults) {
  const [active, setActive] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const confirm = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(options => new Promise(resolve => {
    setActive({
      ...options,
      resolve
    });
  }), []);
  const close = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(confirmed => {
    setActive(current => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);
  const dialogProps = active ? {
    open: true,
    title: active.title,
    message: active.message,
    confirmText: active.confirmText ?? defaults?.confirmText ?? "确认",
    cancelText: active.cancelText ?? defaults?.cancelText ?? "取消",
    danger: active.danger,
    onConfirm: () => close(true),
    onCancel: () => close(false)
  } : null;
  const confirmDialog = dialogProps ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_components_ConfirmDialog__WEBPACK_IMPORTED_MODULE_1__["default"], {
    ...dialogProps
  }) : null;
  return {
    confirm,
    confirmDialog
  };
}

/***/ }),

/***/ "./src/hooks/useDeferredMount.ts":
/*!***************************************!*\
  !*** ./src/hooks/useDeferredMount.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDeferredMount: function() { return /* binding */ useDeferredMount; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_timing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/timing */ "./src/utils/timing.ts");



/**
 * Defers below-the-fold work until after first paint.
 */
function useDeferredMount(timeoutMs = _utils_timing__WEBPACK_IMPORTED_MODULE_1__.DEFER_BELOW_FOLD_MS) {
  const [ready, setReady] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const timer = setTimeout(() => setReady(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);
  return ready;
}

/***/ }),

/***/ "./src/hooks/useNavBarInsets.ts":
/*!**************************************!*\
  !*** ./src/hooks/useNavBarInsets.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useNavBarInsets: function() { return /* binding */ useNavBarInsets; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


const TOP_GAP = 8;
const DEFAULT = {
  paddingTop: 52,
  paddingRight: 16
};

/** 右侧避开微信胶囊（仅用于顶栏 Hero，勿用于整页） */
function useNavBarInsets() {
  return (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    try {
      const windowInfo = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getWindowInfo();
      const statusBarHeight = windowInfo.statusBarHeight ?? 44;
      const windowWidth = windowInfo.windowWidth ?? 375;
      const menuRect = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getMenuButtonBoundingClientRect();
      if (menuRect && menuRect.width > 0 && menuRect.top > 0) {
        const capsuleReserve = windowWidth - menuRect.left + 8;
        // Align hero row with capsule top — do not pad to menu bottom (causes huge gap).
        const paddingTop = Math.max(statusBarHeight + TOP_GAP, menuRect.top);
        return {
          paddingTop,
          paddingRight: Math.max(16, capsuleReserve)
        };
      }
      return {
        paddingTop: statusBarHeight + TOP_GAP,
        paddingRight: 16
      };
    } catch {
      return DEFAULT;
    }
  }, []);
}

/***/ }),

/***/ "./src/hooks/useOverlayLock.ts":
/*!*************************************!*\
  !*** ./src/hooks/useOverlayLock.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useOverlayLock: function() { return /* binding */ useOverlayLock; }
/* harmony export */ });
/** Overlay scroll lock is a no-op on mini programs (no document.body). */
function useOverlayLock(_open) {}

/***/ }),

/***/ "./src/hooks/usePageRouteReady.ts":
/*!****************************************!*\
  !*** ./src/hooks/usePageRouteReady.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   usePageRouteReady: function() { return /* binding */ usePageRouteReady; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");




/** Clears global route-transition UI once page content is ready. */
function usePageRouteReady(isContentReady) {
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isContentReady) {
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.endRouteTransition)();
    }
  }, [isContentReady]);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useDidShow)(() => {
    if (isContentReady) {
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_2__.endRouteTransition)();
    }
  });
}

/***/ }),

/***/ "./src/hooks/useSyncApi.ts":
/*!*********************************!*\
  !*** ./src/hooks/useSyncApi.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyToPostAndInvalidate: function() { return /* binding */ applyToPostAndInvalidate; },
/* harmony export */   blockUserAndInvalidate: function() { return /* binding */ blockUserAndInvalidate; },
/* harmony export */   clearAllNotificationsAndInvalidate: function() { return /* binding */ clearAllNotificationsAndInvalidate; },
/* harmony export */   commentPostAndInvalidate: function() { return /* binding */ commentPostAndInvalidate; },
/* harmony export */   deleteNotificationAndInvalidate: function() { return /* binding */ deleteNotificationAndInvalidate; },
/* harmony export */   deletePostAndInvalidate: function() { return /* binding */ deletePostAndInvalidate; },
/* harmony export */   invalidatePostQueries: function() { return /* binding */ invalidatePostQueries; },
/* harmony export */   likePostAndInvalidate: function() { return /* binding */ likePostAndInvalidate; },
/* harmony export */   markAllNotificationsAsRead: function() { return /* binding */ markAllNotificationsAsRead; },
/* harmony export */   markNotificationAsRead: function() { return /* binding */ markNotificationAsRead; },
/* harmony export */   submitReportAndInvalidate: function() { return /* binding */ submitReportAndInvalidate; },
/* harmony export */   updateCurrentUserAndInvalidate: function() { return /* binding */ updateCurrentUserAndInvalidate; },
/* harmony export */   updatePostAndInvalidate: function() { return /* binding */ updatePostAndInvalidate; },
/* harmony export */   useActivityDetailQuery: function() { return /* binding */ useActivityDetailQuery; },
/* harmony export */   useAllPostsQuery: function() { return /* binding */ useAllPostsQuery; },
/* harmony export */   useCurrentUserQuery: function() { return /* binding */ useCurrentUserQuery; },
/* harmony export */   useEventList: function() { return /* binding */ useEventList; },
/* harmony export */   useEventPostsQuery: function() { return /* binding */ useEventPostsQuery; },
/* harmony export */   useFeaturedEvents: function() { return /* binding */ useFeaturedEvents; },
/* harmony export */   useHomeSummary: function() { return /* binding */ useHomeSummary; },
/* harmony export */   useNearestUpcomingForCountdown: function() { return /* binding */ useNearestUpcomingForCountdown; },
/* harmony export */   useNotificationUnreadCount: function() { return /* binding */ useNotificationUnreadCount; },
/* harmony export */   useNotificationsQuery: function() { return /* binding */ useNotificationsQuery; },
/* harmony export */   usePopularPosts: function() { return /* binding */ usePopularPosts; },
/* harmony export */   usePostCommentsQuery: function() { return /* binding */ usePostCommentsQuery; },
/* harmony export */   useProfileActivitiesQuery: function() { return /* binding */ useProfileActivitiesQuery; },
/* harmony export */   useProfilePostsQuery: function() { return /* binding */ useProfilePostsQuery; },
/* harmony export */   useProfileSummaryQuery: function() { return /* binding */ useProfileSummaryQuery; }
/* harmony export */ });
/* unused harmony exports invalidateNotificationQueries, useActivitiesQuery, usePopularPostsQuery, invalidateRegistrationQueries, registerForActivityAndInvalidate, cancelActivityRegistrationAndInvalidate */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _useApiQuery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useApiQuery */ "./src/hooks/useApiQuery.ts");
/* harmony import */ var _api_syncApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api/syncApi */ "./src/api/syncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _utils_session__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/session */ "./src/utils/session.ts");
/* harmony import */ var _utils_apiMappers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/apiMappers */ "./src/utils/apiMappers.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var _utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/queryInvalidation */ "./src/utils/queryInvalidation.ts");









async function invalidateNotificationQueries() {
  return (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidateNotifications)();
}
function useNotificationsQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["notifications", "list", userId],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchNotifications)(userId),
    enabled,
    staleTime: 30_000
  });
}
function useNotificationUnreadCount() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["notifications", "unread", userId],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchNotificationUnreadCount)(userId),
    enabled,
    staleTime: 30_000
  });
}
async function markNotificationAsRead(id) {
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.markNotificationRead)(id, userId);
  await invalidateNotificationQueries();
}
async function markAllNotificationsAsRead() {
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.markAllNotificationsRead)(userId);
  await invalidateNotificationQueries();
}
async function deleteNotificationAndInvalidate(id) {
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.deleteNotification)(id, userId);
  await invalidateNotificationQueries();
}
async function clearAllNotificationsAndInvalidate() {
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.clearAllNotifications)(userId);
  await invalidateNotificationQueries();
}
function useActivitiesQuery(options) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)() && tabEnabled;
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["activities"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchActivities,
    enabled,
    staleTime: 60_000
  });
}
function useEventList(options) {
  const tabEnabled = options?.enabled ?? true;
  const query = useActivitiesQuery({
    enabled: tabEnabled
  });
  const events = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!query.data) return [];
    return (0,_utils_apiMappers__WEBPACK_IMPORTED_MODULE_5__.mapActivitiesToEvents)(query.data);
  }, [query.data]);
  return {
    events,
    isLoading: tabEnabled && query.isLoading,
    isError: tabEnabled && query.isError,
    refetch: query.refetch
  };
}
function useHomeSummary() {
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["home", "summary"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchHomeSummary,
    enabled: (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)(),
    staleTime: 60_000
  });
}
function useFeaturedEvents() {
  const {
    data: summary,
    isLoading
  } = useHomeSummary();
  const items = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const signupEvents = summary?.signupEvents ?? [];
    const inProgress = signupEvents.filter(item => (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_8__.getActivityStatusFromActivity)(item.date, item.title) === "in_progress");
    return (0,_utils_apiMappers__WEBPACK_IMPORTED_MODULE_5__.pickHomeFeaturedEvents)(inProgress);
  }, [summary]);
  return {
    items,
    isLoading
  };
}
function mergeHomeCountdownCandidates(signupEvents, activities) {
  const seen = new Set();
  const candidates = [];
  const add = (title, date) => {
    const key = `${title}|${date ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({
      title,
      date
    });
  };
  for (const event of signupEvents) {
    add(event.title, event.date);
  }
  for (const activity of activities ?? []) {
    add(activity.name, activity.date);
  }
  return candidates;
}
function useNearestUpcomingForCountdown(options) {
  const {
    data: summary
  } = useHomeSummary();
  const tabEnabled = options?.enabled ?? true;
  const activitiesQuery = useActivitiesQuery({
    enabled: tabEnabled
  });
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const signupEvents = summary?.signupEvents ?? [];
    const candidates = mergeHomeCountdownCandidates(signupEvents, activitiesQuery.data);
    const nearest = (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_8__.findNearestUpcomingActivity)(candidates);
    if (!nearest) return null;
    const title = nearest.title ?? nearest.name;
    if (!title) return null;
    return {
      title,
      startAt: nearest.startAt
    };
  }, [summary, activitiesQuery.data]);
}
function useActivityDetailQuery(legacyId) {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)() && legacyId != null && !Number.isNaN(legacyId) && legacyId > 0;
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["activities", "detail", legacyId],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchActivityByLegacyId)(legacyId),
    enabled,
    staleTime: 60_000
  });
}
function usePopularPostsQuery(options) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)() && tabEnabled;
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["posts", "popular", userId],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchPopularPosts)(),
    enabled,
    staleTime: 30_000
  });
}
function usePopularPosts(options) {
  const query = usePopularPostsQuery(options);
  const posts = (query.data ?? []).map(mapHomeFeedPost);
  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
function mapHomeFeedPost(item) {
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    handle: item.handle,
    event: item.event,
    location: item.location,
    body: item.body,
    time: item.time,
    likes: item.likes,
    liked: item.liked,
    comments: item.comments ?? 0,
    avatar: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_6__.sanitizeRemoteImageUrl)(item.avatar) ?? item.avatar,
    status: item.status,
    contentTypes: item.contentTypes,
    images: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_6__.sanitizeImageList)(item.images)
  };
}
function useAllPostsQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  const query = (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["posts", "all", userId],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchAllPosts,
    enabled,
    staleTime: 30_000
  });
  const posts = (query.data ?? []).map(mapHomeFeedPost);
  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
function useEventPostsQuery(activityLegacyId, options) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)() && activityLegacyId != null && !Number.isNaN(activityLegacyId) && tabEnabled;
  const userId = (0,_utils_session__WEBPACK_IMPORTED_MODULE_4__.getClientUserId)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["posts", "activity", activityLegacyId, userId],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchPostsByActivity)(activityLegacyId),
    enabled,
    staleTime: 30_000
  });
}
function usePostCommentsQuery(postId, enabled) {
  const apiEnabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["posts", postId, "comments"],
    queryFn: () => (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchPostComments)(postId),
    enabled: apiEnabled && enabled && Boolean(postId),
    staleTime: 10_000
  });
}
function useCurrentUserQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["users", "me"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchCurrentUser,
    enabled,
    staleTime: 60_000
  });
}
async function invalidateRegistrationQueries() {
  await (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidateRegistration)();
}
async function registerForActivityAndInvalidate(legacyId) {
  const result = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.registerForActivity)(legacyId);
  try {
    await invalidateRegistrationQueries();
  } catch {
    // Registration succeeded; cache refresh is best-effort.
  }
  return result;
}
async function cancelActivityRegistrationAndInvalidate(legacyId) {
  const result = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.cancelActivityRegistration)(legacyId);
  await invalidateRegistrationQueries();
  return result;
}
async function updateCurrentUserAndInvalidate(payload) {
  const user = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.updateCurrentUser)(payload);
  await Promise.all([(0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidateUser)(), (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidateProfile)()]);
  return user;
}
async function blockUserAndInvalidate(blockedUserId) {
  const result = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.blockUser)(blockedUserId);
  await (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidatePostFeeds)();
  return result;
}
async function submitReportAndInvalidate(payload) {
  return (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.submitReport)(payload);
}
function useProfileSummaryQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["profile", "summary"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchProfileSummary,
    enabled,
    staleTime: 60_000
  });
}
function useProfileActivitiesQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["profile", "activities"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchProfileActivities,
    enabled,
    staleTime: 60_000
  });
}
function useProfilePostsQuery() {
  const enabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_3__.isApiEnabled)();
  return (0,_useApiQuery__WEBPACK_IMPORTED_MODULE_1__.useApiQuery)({
    queryKey: ["profile", "posts"],
    queryFn: _api_syncApi__WEBPACK_IMPORTED_MODULE_2__.fetchProfilePosts,
    enabled,
    staleTime: 30_000
  });
}
async function invalidatePostQueries() {
  await (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidateAllPosts)();
}
async function deletePostAndInvalidate(postId) {
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.deletePost)(postId);
  await invalidatePostQueries();
}
async function likePostAndInvalidate(postId) {
  const updated = await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.likePost)(postId);
  (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.patchLikedPostInCaches)(updated);
  await Promise.all([invalidatePostQueries(), invalidateNotificationQueries()]);
  return updated;
}
async function commentPostAndInvalidate(postId, body, parentCommentId) {
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.addPostComment)(postId, body, parentCommentId);
  await Promise.all([invalidatePostQueries(), invalidateNotificationQueries(), (0,_utils_queryInvalidation__WEBPACK_IMPORTED_MODULE_7__.invalidatePostComments)(postId)]);
}
async function applyToPostAndInvalidate(postId) {
  return (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.applyToPost)(postId);
}
async function updatePostAndInvalidate(postId, payload) {
  await (0,_api_syncApi__WEBPACK_IMPORTED_MODULE_2__.updatePost)(postId, payload);
  await invalidatePostQueries();
}

/***/ }),

/***/ "./src/hooks/useTabPageMainHeight.ts":
/*!*******************************************!*\
  !*** ./src/hooks/useTabPageMainHeight.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useStackPageMainHeight: function() { return /* binding */ useStackPageMainHeight; },
/* harmony export */   useTabPageMainHeight: function() { return /* binding */ useTabPageMainHeight; }
/* harmony export */ });
/* unused harmony export STACK_PAGE_NAV_PX */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);



/** Matches BottomNav.scss: row + top padding (px, design @ 375). */
const TABBAR_ROW_PX = 56;
const TABBAR_PADDING_TOP_PX = 10;

/** Matches PageNavigation.scss top + bottom padding + control row. */
const STACK_PAGE_NAV_PX = 100;
/**
 * Explicit main-area height for tab pages on WeChat: `scroll-view` does not
 * honor flex `height: 0` and will grow with content, pushing BottomNav off-screen
 * when the page has `disableScroll: true`.
 */
function useTabPageMainHeight(options) {
  const subtractPx = typeof options === "number" ? options : options?.subtractPx ?? 0;
  return (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    try {
      const win = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getWindowInfo();
      const windowHeight = win.windowHeight ?? win.screenHeight ?? 667;
      const screenHeight = win.screenHeight ?? windowHeight;
      const safeBottom = win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
      const tabBarPx = TABBAR_ROW_PX + TABBAR_PADDING_TOP_PX + safeBottom;
      return Math.max(200, Math.floor(windowHeight - tabBarPx - subtractPx));
    } catch {
      return undefined;
    }
  }, [subtractPx]);
}

/** Stack pages without BottomNav (PageNavigation + internal ScrollView). */
function useStackPageMainHeight(options) {
  const extraSubtract = typeof options === "number" ? options : options?.subtractPx ?? 0;
  return (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    try {
      const win = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getWindowInfo();
      const windowHeight = win.windowHeight ?? win.screenHeight ?? 667;
      return Math.max(200, Math.floor(windowHeight - STACK_PAGE_NAV_PX - extraSubtract));
    } catch {
      return undefined;
    }
  }, [extraSubtract]);
}

/***/ }),

/***/ "./src/pages/profile/mockData.ts":
/*!***************************************!*\
  !*** ./src/pages/profile/mockData.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   profilePosts: function() { return /* binding */ profilePosts; },
/* harmony export */   profileUser: function() { return /* binding */ profileUser; }
/* harmony export */ });
const profileUser = {
  name: "Zara Chen",
  handle: "@zara",
  location: "上海",
  bio: "电音爱好者",
  avatar: "https://picsum.photos/seed/sync-avatar-zara/200/200",
  stats: {
    events: 12,
    matchSuccess: 8,
    likes: 156,
    posts: 3
  }
};
const profilePosts = [{
  id: "post-1",
  title: "Tomorrowland Thailand 2026",
  content: "12月芭提雅场求组队！想拼 Wisdom Valley 附近酒店，已有2人，还差1个女生～",
  status: "招募中",
  likes: 24,
  comments: 8,
  date: "2026-05-20",
  activityLegacyId: 1
}, {
  id: "post-3",
  title: "风暴电音节 深圳站",
  content: "6月深圳 STORM 室内场，3男1女，求最后一个小哥哥！",
  status: "招募中",
  likes: 31,
  comments: 6,
  date: "2026-05-18",
  activityLegacyId: 4
}, {
  id: "post-4",
  title: "2026横琴VAC电音节",
  content: "4月横琴 VAC 已组队，还可以一起现场集合，想认识同频朋友的可以来。",
  status: "已组队",
  likes: 18,
  comments: 3,
  date: "2026-04-20",
  activityLegacyId: 6
}];

/***/ }),

/***/ "./src/stores/aiChatStore.ts":
/*!***********************************!*\
  !*** ./src/stores/aiChatStore.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAiChatStore: function() { return /* binding */ useAiChatStore; }
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ "./node_modules/zustand/esm/react.mjs");

const initialState = {
  conversationState: null,
  suggestedReplies: [],
  degraded: false
};
const useAiChatStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)(set => ({
  ...initialState,
  applyConversationPatch: state => set({
    conversationState: state
  }),
  setSuggestedReplies: replies => set({
    suggestedReplies: replies
  }),
  setPostRecommendationsMeta: degraded => set({
    degraded: degraded === true
  }),
  resetOnClearSession: () => set(initialState)
}));

/***/ }),

/***/ "./src/stores/index.ts":
/*!*****************************!*\
  !*** ./src/stores/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useNavigationStore: function() { return /* reexport safe */ _navigationStore__WEBPACK_IMPORTED_MODULE_0__.useNavigationStore; },
/* harmony export */   useProfilePageStore: function() { return /* reexport safe */ _profilePageStore__WEBPACK_IMPORTED_MODULE_2__.useProfilePageStore; }
/* harmony export */ });
/* harmony import */ var _navigationStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./navigationStore */ "./src/stores/navigationStore.ts");
/* harmony import */ var _aiChatStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aiChatStore */ "./src/stores/aiChatStore.ts");
/* harmony import */ var _profilePageStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./profilePageStore */ "./src/stores/profilePageStore.ts");





/***/ }),

/***/ "./src/stores/navigationStore.ts":
/*!***************************************!*\
  !*** ./src/stores/navigationStore.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useNavigationStore: function() { return /* binding */ useNavigationStore; }
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ "./node_modules/zustand/esm/react.mjs");

const useNavigationStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)((set, get) => ({
  profileIntent: null,
  aiAssistantIntent: null,
  activeActivityLegacyId: null,
  routeTransition: {
    active: false
  },
  setProfileIntent: intent => set({
    profileIntent: intent
  }),
  consumeProfileIntent: () => {
    const intent = get().profileIntent;
    if (intent) set({
      profileIntent: null
    });
    return intent;
  },
  setAiAssistantIntent: intent => set({
    aiAssistantIntent: intent
  }),
  consumeAiAssistantIntent: () => {
    const intent = get().aiAssistantIntent;
    if (intent) set({
      aiAssistantIntent: null
    });
    return intent;
  },
  setActiveActivityLegacyId: legacyId => set({
    activeActivityLegacyId: legacyId
  }),
  beginRouteTransition: options => set({
    routeTransition: {
      active: true,
      ...(options?.eventId != null ? {
        eventId: options.eventId
      } : {})
    }
  }),
  endRouteTransition: () => set({
    routeTransition: {
      active: false
    }
  })
}));

/***/ }),

/***/ "./src/stores/profilePageStore.ts":
/*!****************************************!*\
  !*** ./src/stores/profilePageStore.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useProfilePageStore: function() { return /* binding */ useProfilePageStore; }
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ "./node_modules/zustand/esm/react.mjs");

const useProfilePageStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)(set => ({
  notificationsEnabled: true,
  privacyLevel: "public",
  setNotificationsEnabled: enabled => set({
    notificationsEnabled: enabled
  }),
  setPrivacyLevel: level => set({
    privacyLevel: level
  })
}));

/***/ }),

/***/ "./src/utils/activityStatus.ts":
/*!*************************************!*\
  !*** ./src/utils/activityStatus.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activityStatusBadgeClass: function() { return /* binding */ activityStatusBadgeClass; },
/* harmony export */   activityStatusCardClass: function() { return /* binding */ activityStatusCardClass; },
/* harmony export */   activityStatusText: function() { return /* binding */ activityStatusText; },
/* harmony export */   compareActivityDateDesc: function() { return /* binding */ compareActivityDateDesc; },
/* harmony export */   extractYearFromText: function() { return /* binding */ extractYearFromText; },
/* harmony export */   findNearestUpcomingActivity: function() { return /* binding */ findNearestUpcomingActivity; },
/* harmony export */   getActivityStatusFromActivity: function() { return /* binding */ getActivityStatusFromActivity; },
/* harmony export */   shouldShowActivityStatusBadge: function() { return /* binding */ shouldShowActivityStatusBadge; }
/* harmony export */ });
/* unused harmony exports parseActivityDateRange, getActivityStatus, getActivitySortTimestamp, compareActivityDateAsc */
function toStartOfDay(year, month, day) {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}
function toEndOfDay(year, month, day) {
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
function extractYearFromText(text) {
  if (!text) return undefined;
  const match = text.match(/\b(20\d{2})\b/);
  return match?.[1];
}

/** Parse catalog-style activity date strings (e.g. 06/13-14, 12/11-13, 2025-07-12). */
function parseActivityDateRange(dateStr, yearHint) {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    return {
      start: toStartOfDay(year, month, day),
      end: toEndOfDay(year, month, day)
    };
  }
  const year = Number(yearHint ?? new Date().getFullYear());
  const sameMonthRange = trimmed.match(/(\d{1,2})\/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (sameMonthRange) {
    const month = Number(sameMonthRange[1]);
    const startDay = Number(sameMonthRange[2]);
    const endDay = Number(sameMonthRange[3]);
    return {
      start: toStartOfDay(year, month, startDay),
      end: toEndOfDay(year, month, endDay)
    };
  }
  const slashDate = trimmed.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDate) {
    const month = Number(slashDate[1]);
    const day = Number(slashDate[2]);
    return {
      start: toStartOfDay(year, month, day),
      end: toEndOfDay(year, month, day)
    };
  }
  const cnDate = trimmed.match(/(20\d{2})?[年.\-/]?(\d{1,2})[月.\-/](\d{1,2})/);
  if (cnDate) {
    const resolvedYear = cnDate[1] ? Number(cnDate[1]) : year;
    const month = Number(cnDate[2]);
    const day = Number(cnDate[3]);
    return {
      start: toStartOfDay(resolvedYear, month, day),
      end: toEndOfDay(resolvedYear, month, day)
    };
  }
  return null;
}

/** 开场前 1.5 个月（45 天）起视为进行中，便于组队/预热 */
const PRE_EVENT_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;
function getActivityStatus(dateStr, options) {
  if (!dateStr?.trim()) return "not_started";
  const parsed = parseActivityDateRange(dateStr, options?.yearHint);
  if (!parsed) return "not_started";
  const now = options?.now ?? new Date();
  if (now > parsed.end) return "ended";
  const preStart = new Date(parsed.start.getTime() - PRE_EVENT_WINDOW_MS);
  if (now < preStart) return "not_started";
  return "in_progress";
}
function getActivityStatusFromActivity(date, title, now) {
  const yearHint = extractYearFromText(title) ?? extractYearFromText(date);
  return getActivityStatus(date, {
    yearHint,
    now
  });
}
function shouldShowActivityStatusBadge(status) {
  return status !== "in_progress";
}
function activityStatusBadgeClass(status) {
  return `s-activity-status s-activity-status--${status.replace("_", "-")}`;
}
function activityStatusCardClass(status) {
  return status === "ended" ? "s-activity-card--ended" : "";
}
function activityStatusText(status) {
  switch (status) {
    case "in_progress":
      return "进行中";
    case "ended":
      return "已结束";
    default:
      return "未开始";
  }
}
function getActivitySortTimestamp(date, title) {
  const yearHint = extractYearFromText(title) ?? extractYearFromText(date);
  const parsed = date?.trim() ? parseActivityDateRange(date, yearHint) : null;
  return parsed?.start.getTime() ?? 0;
}
function compareActivityDateDesc(a, b) {
  return getActivitySortTimestamp(b.date, b.title) - getActivitySortTimestamp(a.date, a.title);
}
function compareActivityDateAsc(a, b) {
  return getActivitySortTimestamp(a.date, a.title) - getActivitySortTimestamp(b.date, b.title);
}
function activityTitleFromFields(item) {
  return item.title ?? item.name;
}

/** Nearest activity that has not ended and whose start is still in the future. */
function findNearestUpcomingActivity(activities, now = new Date()) {
  const nowMs = now.getTime();
  let nearest = null;
  for (const item of activities) {
    const title = activityTitleFromFields(item);
    if (getActivityStatusFromActivity(item.date, title, now) === "ended") continue;
    const startMs = getActivitySortTimestamp(item.date, title);
    if (startMs <= 0 || startMs <= nowMs) continue;
    if (!nearest || startMs < nearest.startMs) {
      nearest = {
        item,
        startAt: new Date(startMs),
        startMs
      };
    }
  }
  return nearest ? {
    ...nearest.item,
    startAt: nearest.startAt
  } : null;
}

/***/ }),

/***/ "./src/utils/aiShortcutTags.ts":
/*!*************************************!*\
  !*** ./src/utils/aiShortcutTags.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTopAiShortcutTags: function() { return /* binding */ getTopAiShortcutTags; },
/* harmony export */   isAiShortcutTag: function() { return /* binding */ isAiShortcutTag; },
/* harmony export */   normalizeAiShortcutTag: function() { return /* binding */ normalizeAiShortcutTag; },
/* harmony export */   recordAiShortcutTagUse: function() { return /* binding */ recordAiShortcutTagUse; }
/* harmony export */ });
/* unused harmony exports AI_SHORTCUT_TAG_POOL, AI_SHORTCUT_TAG_ALIASES */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);

const STORAGE_KEY = "sync_ai_shortcut_tag_usage";
const DISPLAY_COUNT = 6;

/** 可选快捷标签池（含默认展示项） */
const AI_SHORTCUT_TAG_POOL = ["组队队友", "住宿同行", "拼车同行"];
/** 展示文案别名 → 标准快捷标签 */
const AI_SHORTCUT_TAG_ALIASES = {
  帮我dd: "组队队友"
};
const LEGACY_TAG_ALIASES = {
  拼房同行: "住宿同行"
};
function normalizeAiShortcutTag(tag) {
  const trimmed = tag.trim();
  return AI_SHORTCUT_TAG_ALIASES[trimmed] ?? LEGACY_TAG_ALIASES[trimmed] ?? trimmed;
}
function readUsage() {
  try {
    const raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(STORAGE_KEY);
    if (!raw || typeof raw !== "object") return {};
    const usage = raw;
    const migrated = {};
    for (const [key, count] of Object.entries(usage)) {
      const nextKey = LEGACY_TAG_ALIASES[key] ?? key;
      migrated[nextKey] = (migrated[nextKey] ?? 0) + count;
    }
    return migrated;
  } catch {
    return {};
  }
}
function writeUsage(usage) {
  try {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEY, usage);
  } catch {
    // ignore quota / private mode
  }
}
function isAiShortcutTag(tag) {
  const canonical = normalizeAiShortcutTag(tag);
  if (!canonical) return false;
  if (AI_SHORTCUT_TAG_POOL.includes(canonical)) return true;
  return canonical in readUsage();
}

/** 记录一次快捷标签使用 */
function recordAiShortcutTagUse(tag) {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const usage = readUsage();
  usage[trimmed] = (usage[trimmed] ?? 0) + 1;
  writeUsage(usage);
}

/** 按使用次数取前 N 个标签；无使用记录时返回默认顺序 */
function getTopAiShortcutTags(limit = DISPLAY_COUNT) {
  const usage = readUsage();
  const pool = [...AI_SHORTCUT_TAG_POOL];
  const extras = Object.keys(usage).filter(k => !pool.includes(k));
  const candidates = [...pool, ...extras];
  const sorted = [...candidates].sort((a, b) => {
    const diff = (usage[b] ?? 0) - (usage[a] ?? 0);
    if (diff !== 0) return diff;
    const ai = pool.indexOf(a);
    const bi = pool.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const hasUsage = sorted.some(tag => (usage[tag] ?? 0) > 0);
  if (!hasUsage) {
    return pool.slice(0, limit);
  }
  const picked = [];
  for (const tag of sorted) {
    if ((usage[tag] ?? 0) <= 0) continue;
    if (picked.includes(tag)) continue;
    picked.push(tag);
    if (picked.length >= limit) break;
  }
  for (const tag of pool) {
    if (picked.length >= limit) break;
    if (!picked.includes(tag)) picked.push(tag);
  }
  return picked.slice(0, limit);
}

/***/ }),

/***/ "./src/utils/apiClient.ts":
/*!********************************!*\
  !*** ./src/utils/apiClient.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   apiDelete: function() { return /* binding */ apiDelete; },
/* harmony export */   apiGet: function() { return /* binding */ apiGet; },
/* harmony export */   apiPatch: function() { return /* binding */ apiPatch; },
/* harmony export */   apiPost: function() { return /* binding */ apiPost; }
/* harmony export */ });
/* unused harmony export ApiError */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/api */ "./src/constants/api.ts");


class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;
function buildUrl(path, params) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = _constants_api__WEBPACK_IMPORTED_MODULE_1__.API_BASE_URL.replace(/\/$/, "");
  let url = `${base}${normalizedPath}`;
  if (params) {
    const pairs = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    if (pairs.length > 0) {
      url += `${url.includes("?") ? "&" : "?"}${pairs.join("&")}`;
    }
  }
  return url;
}
async function requestWithTimeout(url, init, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().request({
      url,
      method: init.method || "GET",
      header: init.headers,
      data: init.body,
      timeout: timeoutMs,
      success: res => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => res.data
        });
      },
      fail: err => {
        reject(new Error(err.errMsg || "请求失败"));
      }
    });
  });
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function retryFetch(url, init, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[API] ${init.method ?? "GET"} ${url}`);
      const response = await requestWithTimeout(url, init);
      // eslint-disable-next-line no-console
      console.log(`[API] ${init.method ?? "GET"} ${url} -> ${response.status}`);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // eslint-disable-next-line no-console
      console.error(`[API] ${init.method ?? "GET"} ${url} error:`, lastError.message);
      if (lastError.message?.includes("timeout")) {
        throw new ApiError("请求超时，请检查网络后重试");
      }
      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }
  throw new ApiError(lastError?.message || "网络请求失败，请稍后重试");
}
async function parseResponse(response) {
  if (!response.ok) {
    throw new ApiError(`请求失败 (${response.status})`, response.status);
  }
  const json = await response.json();
  if (json.code !== 200) {
    throw new ApiError(json.message || "请求失败", json.code);
  }
  return json.data;
}
async function apiGet(path, params, init) {
  const response = await retryFetch(buildUrl(path, params), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...init?.headers
    },
    ...init
  });
  return parseResponse(response);
}
async function apiPost(path, body, params, init) {
  const response = await retryFetch(buildUrl(path, params), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers
    },
    body: JSON.stringify(body),
    ...init
  });
  return parseResponse(response);
}
async function apiPatch(path, body, params, init) {
  const response = await retryFetch(buildUrl(path, params), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers
    },
    body: JSON.stringify(body),
    ...init
  });
  return parseResponse(response);
}
async function apiDelete(path, params, init) {
  const response = await retryFetch(buildUrl(path, params), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...init?.headers
    },
    ...init
  });
  return parseResponse(response);
}

/***/ }),

/***/ "./src/utils/apiMappers.ts":
/*!*********************************!*\
  !*** ./src/utils/apiMappers.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapActivitiesToEvents: function() { return /* binding */ mapActivitiesToEvents; },
/* harmony export */   pickHomeFeaturedEvents: function() { return /* binding */ pickHomeFeaturedEvents; }
/* harmony export */ });
/* unused harmony exports buildActivityNameMap, findBackendActivityByLegacyId, mapSignupEventToFeaturedEvent, mapBackendActivityToFeaturedEvent */
/* harmony import */ var _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/activityGuestAvatars */ "./src/constants/activityGuestAvatars.ts");
/* harmony import */ var _imageUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./imageUrl */ "./src/utils/imageUrl.ts");


function buildActivityNameMap(activities) {
  return new Map(activities.map(item => [item.code, item.name]));
}
function findBackendActivityByLegacyId(activities, legacyId) {
  return activities.find(activity => activity.legacyId === legacyId);
}
function mapActivitiesToEvents(activities) {
  return activities.map(activity => ({
    id: String(activity.legacyId ?? activity._id),
    title: activity.name,
    going: false,
    date: activity.date ?? "",
    location: activity.location ?? "",
    image: (0,_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(activity.image) ?? activity.image ?? "",
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    distance: activity.hot ? "热门" : "",
    category: activity.hot ? "户外电音" : "EDM节"
  }));
}
function mapSignupEventToFeaturedEvent(item) {
  const isHot = Boolean(item.hot);
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    venue: item.location,
    isHot,
    distance: item.category,
    attendeeCount: `${item.attendees}+`,
    remaining: "",
    guests: _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_0__.ACTIVITY_GUEST_AVATARS,
    image: (0,_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(item.image) || undefined,
    going: item.going
  };
}
function mapBackendActivityToFeaturedEvent(activity) {
  return mapSignupEventToFeaturedEvent({
    id: activity.legacyId,
    title: activity.name,
    date: activity.date ?? "",
    location: activity.location ?? "",
    image: (0,_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(activity.image) ?? activity.image ?? "",
    category: activity.hot ? "户外电音" : "EDM节",
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    going: false
  });
}

/** 首页精选：优先 hot，最多 2 条 */
function pickHomeFeaturedEvents(signupEvents) {
  const hot = signupEvents.filter(item => item.hot);
  const rest = signupEvents.filter(item => !item.hot);
  return [...hot, ...rest].slice(0, 2).map(item => mapSignupEventToFeaturedEvent(item));
}

/***/ }),

/***/ "./src/utils/imageUrl.ts":
/*!*******************************!*\
  !*** ./src/utils/imageUrl.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sanitizeImageList: function() { return /* binding */ sanitizeImageList; },
/* harmony export */   sanitizeRemoteImageUrl: function() { return /* binding */ sanitizeRemoteImageUrl; },
/* harmony export */   thumbnailImageUrl: function() { return /* binding */ thumbnailImageUrl; }
/* harmony export */ });
/* unused harmony export picsumUrl */
/* provided dependency */ var URL = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/index.js")["URL"];
/** Unsplash IDs that 404 or fail in WeChat mini-program. */
const BROKEN_UNSPLASH_PHOTO_IDS = new Set(["1459749411177-0479bf78d6f2", "1459749411177"]);
const UNSPLASH_PHOTO_RE = /photo-([a-zA-Z0-9-]+)/;
function picsumUrl(seed, width, height) {
  const h = height ?? Math.round(width * 0.75);
  const safeSeed = seed.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 48) || "sync";
  return `https://picsum.photos/seed/${safeSeed}/${width}/${h}`;
}
function extractUnsplashPhotoId(url) {
  const match = url.pathname.match(UNSPLASH_PHOTO_RE);
  return match?.[1] ?? null;
}
function unsplashDimensions(url) {
  const w = Number(url.searchParams.get("w")) || 800;
  const isSquareCrop = url.searchParams.get("fit") === "crop" && url.searchParams.get("crop") === "face";
  return {
    width: w,
    height: isSquareCrop ? w : Math.round(w * 0.75)
  };
}

/** Map legacy Unsplash URLs to stable picsum.photos (WeChat-safe). */
function sanitizeRemoteImageUrl(src) {
  if (!src?.trim()) return undefined;
  const trimmed = src.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("unsplash.com")) {
      return trimmed;
    }
    const photoId = extractUnsplashPhotoId(url);
    if (photoId && BROKEN_UNSPLASH_PHOTO_IDS.has(photoId)) {
      return picsumUrl("edc-festival", 800, 600);
    }
    const {
      width,
      height
    } = unsplashDimensions(url);
    const seed = photoId ? `unsplash-${photoId}` : "sync-image";
    return picsumUrl(seed, width, height);
  } catch {
    return trimmed;
  }
}
function sanitizeImageList(images) {
  if (!images?.length) return images;
  const next = images.map(url => sanitizeRemoteImageUrl(url) ?? url).filter(url => Boolean(url));
  return next.length ? next : undefined;
}

/** Resize remote list thumbnails when the CDN supports path or query params. */
function thumbnailImageUrl(src, width = 240) {
  const sanitized = sanitizeRemoteImageUrl(src);
  if (!sanitized?.trim()) return undefined;
  const trimmed = sanitized.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("picsum.photos")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "seed" && parts[1]) {
        const height = Math.round(width * 0.75);
        return picsumUrl(parts[1], width, height);
      }
    }
    if (url.searchParams.has("w")) {
      return trimmed;
    }
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return trimmed;
  }
}

/***/ }),

/***/ "./src/utils/openImagePreview.ts":
/*!***************************************!*\
  !*** ./src/utils/openImagePreview.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   openImagePreview: function() { return /* binding */ openImagePreview; },
/* harmony export */   openSingleImagePreview: function() { return /* binding */ openSingleImagePreview; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _imageUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./imageUrl */ "./src/utils/imageUrl.ts");


function isDataUrl(url) {
  return /^data:image\//i.test(url);
}
function dataUrlToTempPath(dataUrl) {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const ext = /image\/png/i.test(dataUrl) ? "png" : "jpg";
  const filePath = `${(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().env).USER_DATA_PATH}/preview_${Date.now()}.${ext}`;
  const fs = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getFileSystemManager();
  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data: base64,
      encoding: "base64",
      success: () => resolve(filePath),
      fail: err => reject(new Error(err.errMsg || "WRITE_FAILED"))
    });
  });
}
async function resolvePreviewUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isDataUrl(trimmed)) {
    if (true) {
      return dataUrlToTempPath(trimmed);
    }
    return trimmed;
  }
  return (0,_imageUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeRemoteImageUrl)(trimmed) ?? trimmed;
}

/** Open native full-screen image preview (WeChat `previewImage` on weapp). */
async function openImagePreview(urls, currentIndex = 0) {
  if (!urls.length) return;
  const resolved = (await Promise.all(urls.map(url => resolvePreviewUrl(url).catch(() => null)))).filter(url => Boolean(url));
  if (!resolved.length) return;
  const idx = Math.min(Math.max(0, currentIndex), resolved.length - 1);
  await _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().previewImage({
    urls: resolved,
    current: resolved[idx]
  });
}
function openSingleImagePreview(src, allUrls) {
  const list = allUrls?.length ? allUrls : [src];
  const index = list.indexOf(src);
  void openImagePreview(list, index >= 0 ? index : 0);
}

/***/ }),

/***/ "./src/utils/postActionColors.ts":
/*!***************************************!*\
  !*** ./src/utils/postActionColors.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   postActionIconColor: function() { return /* binding */ postActionIconColor; }
/* harmony export */ });
/* unused harmony exports POST_ACTION_ICON_COLOR, POST_ACTION_ACTIVE_COLOR, POST_ACTION_LIKED_COLOR */
/** Muted icon/text for post action row (like, comment, share). */
const POST_ACTION_ICON_COLOR = "#8e8e93";

/** Comment action when expanded / active. */
const POST_ACTION_ACTIVE_COLOR = "#64d2ff";

/** Like action when liked. */
const POST_ACTION_LIKED_COLOR = "#ff0066";
function postActionIconColor(options) {
  if (options.liked) return POST_ACTION_LIKED_COLOR;
  if (options.active) return POST_ACTION_ACTIVE_COLOR;
  return POST_ACTION_ICON_COLOR;
}

/***/ }),

/***/ "./src/utils/postOwnership.ts":
/*!************************************!*\
  !*** ./src/utils/postOwnership.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isCurrentUserPostAuthor: function() { return /* binding */ isCurrentUserPostAuthor; }
/* harmony export */ });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session */ "./src/utils/session.ts");


/** Matches backend DEFAULT_PROFILE_EXTERNAL_ID (demo owner). */
const DEMO_OWNER_USER_ID = "demo-zara";
function authorNameMatches(stored, client) {
  const author = stored.trim();
  const name = client?.trim();
  if (!name || !author) return false;
  if (author === name) return true;
  const clientFirst = name.split(/\s+/)[0] ?? "";
  const authorFirst = author.split(/\s+/)[0] ?? "";
  return clientFirst === authorFirst || name.startsWith(`${authorFirst} `) || author.startsWith(`${clientFirst} `);
}
function isDemoOwnerClient(userId) {
  return userId?.trim() === DEMO_OWNER_USER_ID;
}

/** Whether a feed/event post was authored by the current client user. */
function isCurrentUserPostAuthor(authorName, authorUserId) {
  const clientUserId = (0,_session__WEBPACK_IMPORTED_MODULE_0__.getClientUserId)().trim();
  const clientUserName = (0,_session__WEBPACK_IMPORTED_MODULE_0__.getClientUserName)().trim();
  const postUserId = authorUserId?.trim();
  if (clientUserId && postUserId && postUserId === clientUserId) {
    return true;
  }
  if (clientUserName && authorName.trim() && authorNameMatches(authorName, clientUserName)) {
    return true;
  }
  if (isDemoOwnerClient(clientUserId) && postUserId === DEMO_OWNER_USER_ID) {
    return true;
  }
  return false;
}

/***/ }),

/***/ "./src/utils/postStatus.ts":
/*!*********************************!*\
  !*** ./src/utils/postStatus.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventPostStatusText: function() { return /* binding */ eventPostStatusText; },
/* harmony export */   isHiddenPostStatus: function() { return /* binding */ isHiddenPostStatus; },
/* harmony export */   isRecruitingPostStatus: function() { return /* binding */ isRecruitingPostStatus; },
/* harmony export */   toEventPostCardStatus: function() { return /* binding */ toEventPostCardStatus; }
/* harmony export */ });
/* unused harmony export postStatusBadgeClass */
/** Backend/API post status labels (Chinese from post.mapper). */

function isRecruitingPostStatus(status) {
  return status === "招募中";
}
function isHiddenPostStatus(status) {
  return status === "已隐藏";
}

/** Activity page post card shows only recruiting vs full. */

function toEventPostCardStatus(status) {
  return status === "已组队" ? "full" : "recruiting";
}
function postStatusBadgeClass(status) {
  return status === "full" ? "s-post-status-badge s-post-status-badge--full" : "s-post-status-badge s-post-status-badge--recruiting";
}
function eventPostStatusText(status) {
  return status === "full" ? "已组队" : "招募中";
}

/***/ }),

/***/ "./src/utils/queryInvalidation.ts":
/*!****************************************!*\
  !*** ./src/utils/queryInvalidation.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   invalidateAllPosts: function() { return /* binding */ invalidateAllPosts; },
/* harmony export */   invalidateNotifications: function() { return /* binding */ invalidateNotifications; },
/* harmony export */   invalidatePostComments: function() { return /* binding */ invalidatePostComments; },
/* harmony export */   invalidatePostFeeds: function() { return /* binding */ invalidatePostFeeds; },
/* harmony export */   invalidateProfile: function() { return /* binding */ invalidateProfile; },
/* harmony export */   invalidateRegistration: function() { return /* binding */ invalidateRegistration; },
/* harmony export */   invalidateUser: function() { return /* binding */ invalidateUser; },
/* harmony export */   patchLikedPostInCaches: function() { return /* binding */ patchLikedPostInCaches; }
/* harmony export */ });
/* unused harmony export invalidateHome */
/* harmony import */ var _hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../hooks/useApiQuery */ "./src/hooks/useApiQuery.ts");

/** 失效通知相关查询 */
function invalidateNotifications() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["notifications"]);
}

/** 失效用户个人资料查询 */
function invalidateProfile() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["profile", "activities"]);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["profile", "summary"]);
}

/** 失效当前用户查询 */
function invalidateUser() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["users", "me"]);
}

/** 失效首页查询 */
function invalidateHome() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["home"]);
}

/** 失效帖子 Feed 查询 */
function invalidatePostFeeds() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["posts", "popular"]);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["posts", "all"]);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["posts", "activity"]);
}

/** 失效所有帖子及关联查询 */
function invalidateAllPosts() {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["posts"]);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["profile", "posts"]);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["profile", "summary"]);
}

/** 失效注册/活动相关查询 */
function invalidateRegistration() {
  invalidateProfile();
  invalidateUser();
  invalidateHome();
}

/** 失效指定帖子的评论查询 */
function invalidatePostComments(postId) {
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.invalidateCache)(["posts", postId, "comments"]);
}
function patchLikedPostInCaches(updated) {
  const patchFeedPosts = posts => posts?.map(post => post.id === updated.id ? {
    ...post,
    likes: updated.likes,
    liked: updated.liked ?? false,
    comments: updated.comments ?? post.comments
  } : post);
  const patchEventPosts = posts => posts?.map(post => post.id === updated.id ? {
    ...post,
    likes: updated.likes,
    liked: updated.liked ?? false,
    comments: updated.comments ?? post.comments
  } : post);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.setCacheData)(["posts", "popular"], patchFeedPosts);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.setCacheData)(["posts", "all"], patchFeedPosts);
  (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_0__.setCacheData)(["posts", "activity"], patchEventPosts);
}

/***/ }),

/***/ "./src/utils/route.ts":
/*!****************************!*\
  !*** ./src/utils/route.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ROUTES: function() { return /* binding */ ROUTES; },
/* harmony export */   endRouteTransition: function() { return /* binding */ endRouteTransition; },
/* harmony export */   go: function() { return /* binding */ go; },
/* harmony export */   goAiAssistant: function() { return /* binding */ goAiAssistant; },
/* harmony export */   goBack: function() { return /* binding */ goBack; },
/* harmony export */   goEventDetail: function() { return /* binding */ goEventDetail; },
/* harmony export */   goNotifications: function() { return /* binding */ goNotifications; },
/* harmony export */   navigateFromNotification: function() { return /* binding */ navigateFromNotification; },
/* harmony export */   preloadHotRoutes: function() { return /* binding */ preloadHotRoutes; },
/* harmony export */   reLaunchTo: function() { return /* binding */ reLaunchTo; },
/* harmony export */   useActiveRoutePath: function() { return /* binding */ useActiveRoutePath; },
/* harmony export */   useRouteTransitionActive: function() { return /* binding */ useRouteTransitionActive; }
/* harmony export */ });
/* unused harmony exports preloadPageSafe, selectRouteTransitionActive, beginRouteTransition, goProfile */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../stores/navigationStore */ "./src/stores/navigationStore.ts");
/* harmony import */ var _timing__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./timing */ "./src/utils/timing.ts");
/* provided dependency */ var URLSearchParams = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/index.js")["URLSearchParams"];




const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  PROFILE: "/pages/profile/index",
  SETTINGS: "/pages/settings/index",
  AI_ASSISTANT: "/pages/ai-assistant/index",
  EVENT_DETAIL: "/pages/event-detail/index",
  NOTIFICATIONS: "/pages/notifications/index",
  ALL_POSTS: "/pages/posts/index"
};
const PRELOAD_HOT_ROUTES = [ROUTES.EVENT_DETAIL, ROUTES.AI_ASSISTANT, ROUTES.NOTIFICATIONS];

/** Blocks duplicate taps only; first navigation is never delayed. */
const NAV_DEBOUNCE_MS = 120;
let navigationChain = Promise.resolve();
let isNavigating = false;
let lastNavAt = 0;
let lastNavUrl = "";
let preloadTimer = null;
function normalizePath(path) {
  const base = path.split("?")[0] ?? path;
  return base.startsWith("/") ? base : `/${base}`;
}
function pathsEqual(a, b) {
  return normalizePath(a) === normalizePath(b);
}
function currentRoutePath() {
  const pages = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getCurrentPages();
  const route = pages[pages.length - 1]?.route;
  return route ? `/${route}` : "";
}
function resolveFallback(fallback) {
  return typeof fallback === `string` ? fallback : ROUTES.HOME;
}
function buildPageUrl(path, query) {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }
  const params = new URLSearchParams(query);
  return `${path}?${params.toString()}`;
}
function shouldSkipNavigation(url) {
  const path = normalizePath(url);
  if (pathsEqual(currentRoutePath(), path)) {
    return true;
  }
  const now = Date.now();
  if (lastNavUrl === url && now - lastNavAt < NAV_DEBOUNCE_MS) {
    return true;
  }
  return false;
}
function markNavigationStart(url) {
  isNavigating = true;
  lastNavAt = Date.now();
  lastNavUrl = url;
}
function markNavigationEnd() {
  isNavigating = false;
}
function runSerializedNavigation(task) {
  const run = navigationChain.then(task);
  navigationChain = run.then(() => undefined, () => undefined);
  void run;
}

/** WeChat preloadPage — warms page JS/WXML; never call immediately before navigateTo. */
function preloadPageSafe(path, query) {
  if ( false || isNavigating) {
    return;
  }
  const preload = (_tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().preloadPage);
  if (typeof preload !== "function") {
    return;
  }
  const url = buildPageUrl(path, query);
  void preload({
    url
  }).catch(() => {});
}

/** Preload common stack targets after tab pages settle (deferred to avoid webview races). */
function preloadHotRoutes() {
  if (false) {}
  if (preloadTimer != null) {
    clearTimeout(preloadTimer);
  }
  preloadTimer = setTimeout(() => {
    preloadTimer = null;
    if (isNavigating) {
      return;
    }
    for (const route of PRELOAD_HOT_ROUTES) {
      preloadPageSafe(route);
    }
  }, _timing__WEBPACK_IMPORTED_MODULE_3__.PRELOAD_HOT_ROUTES_MS);
}

/** Zustand selector: only the target event card should re-render on transition. */
function selectRouteTransitionActive(state, eventId) {
  const {
    active,
    eventId: transitionEventId
  } = state.routeTransition;
  if (!active) {
    return false;
  }
  if (eventId == null) {
    return true;
  }
  return transitionEventId === eventId;
}
function beginRouteTransition(options) {
  _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore.getState().beginRouteTransition(options);
}
function endRouteTransition() {
  _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore.getState().endRouteTransition();
}
function navigateToSafe(url, options) {
  if (shouldSkipNavigation(url)) {
    return;
  }
  beginRouteTransition(options?.eventId != null ? {
    eventId: options.eventId
  } : undefined);
  markNavigationStart(url);
  runSerializedNavigation(() => new Promise(resolve => {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().navigateTo({
      url,
      success: () => resolve(),
      fail: () => {
        endRouteTransition();
        resolve();
      },
      complete: () => {
        markNavigationEnd();
      }
    });
  }));
}

/** Bottom tabs: replace route without stacking history like the old SPA Router. */
function reLaunchTo(url) {
  if (shouldSkipNavigation(url)) {
    return;
  }
  markNavigationStart(url);
  runSerializedNavigation(() => new Promise(resolve => {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().reLaunch({
      url,
      success: () => resolve(),
      fail: () => resolve(),
      complete: () => {
        markNavigationEnd();
      }
    });
  }));
}
function go(url) {
  navigateToSafe(url);
}
function goEventDetail(eventId, options) {
  _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore.getState().setActiveActivityLegacyId(eventId);
  const query = {
    id: String(eventId)
  };
  const postId = options?.postId?.trim();
  if (postId) {
    query.postId = postId;
  }
  navigateToSafe(buildPageUrl(ROUTES.EVENT_DETAIL, query), {
    eventId
  });
}
function resolveActivityLegacyId(meta) {
  if (meta?.activityLegacyId != null && !Number.isNaN(meta.activityLegacyId)) {
    return meta.activityLegacyId;
  }
  const legacy = Number(meta?.activityId);
  return Number.isFinite(legacy) && legacy > 0 ? legacy : null;
}

/** Navigate from notification meta; returns true when a route was opened. */
function navigateFromNotification(meta) {
  if (meta?.type === "post_hidden") {
    goProfile();
    return true;
  }
  const legacyId = resolveActivityLegacyId(meta);
  if (legacyId == null) {
    return false;
  }
  if (meta?.type === "match_recommendation") {
    goEventDetail(legacyId, meta?.postId ? {
      postId: meta.postId
    } : undefined);
    return true;
  }
  if (meta?.type === "post_rejected") {
    goAiAssistant({
      activityLegacyId: legacyId
    });
    return true;
  }
  goEventDetail(legacyId, meta?.postId ? {
    postId: meta.postId
  } : undefined);
  return true;
}
function goProfile() {
  reLaunchTo(ROUTES.PROFILE);
}
function goAiAssistant(options) {
  const intent = {};
  if (options?.initialMessage?.trim()) {
    intent.initialMessage = options.initialMessage.trim();
  }
  if (options?.activityLegacyId != null && !Number.isNaN(options.activityLegacyId)) {
    intent.activityLegacyId = options.activityLegacyId;
    _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore.getState().setActiveActivityLegacyId(options.activityLegacyId);
  }
  if (intent.initialMessage || intent.activityLegacyId != null) {
    _stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore.getState().setAiAssistantIntent(intent);
  }
  navigateToSafe(ROUTES.AI_ASSISTANT);
}
function goNotifications() {
  navigateToSafe(ROUTES.NOTIFICATIONS);
}
function goBack(fallback = ROUTES.HOME) {
  endRouteTransition();
  const target = resolveFallback(fallback);
  const pages = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getCurrentPages();
  if (pages.length <= 1) {
    reLaunchTo(target);
    return;
  }
  markNavigationStart("__back__");
  runSerializedNavigation(() => new Promise(resolve => {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().navigateBack({
      delta: 1,
      success: () => resolve(),
      fail: () => {
        reLaunchTo(target);
        resolve();
      },
      complete: () => {
        markNavigationEnd();
      }
    });
  }));
}
function useActiveRoutePath() {
  const [path, setPath] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => currentRoutePath());
  const bump = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => setPath(currentRoutePath()), []);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useDidShow)(() => bump());
  return path;
}
function useRouteTransitionActive(eventId) {
  return (0,_stores_navigationStore__WEBPACK_IMPORTED_MODULE_2__.useNavigationStore)(state => selectRouteTransitionActive(state, eventId));
}

/***/ }),

/***/ "./src/utils/session.ts":
/*!******************************!*\
  !*** ./src/utils/session.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createFreshActivitySessionId: function() { return /* binding */ createFreshActivitySessionId; },
/* harmony export */   createFreshSessionId: function() { return /* binding */ createFreshSessionId; },
/* harmony export */   getClientUserId: function() { return /* binding */ getClientUserId; },
/* harmony export */   getClientUserName: function() { return /* binding */ getClientUserName; },
/* harmony export */   getClientUserPhone: function() { return /* binding */ getClientUserPhone; },
/* harmony export */   getOrCreateActivitySessionId: function() { return /* binding */ getOrCreateActivitySessionId; },
/* harmony export */   getOrCreateSessionId: function() { return /* binding */ getOrCreateSessionId; },
/* harmony export */   ownerParams: function() { return /* binding */ ownerParams; },
/* harmony export */   persistSessionId: function() { return /* binding */ persistSessionId; },
/* harmony export */   persistUserName: function() { return /* binding */ persistUserName; }
/* harmony export */ });
/* unused harmony exports clearClientUserCache, persistUserPhone, clearClientSessionId */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);

const SESSION_KEY = "sync_ai_session";
const ACTIVITY_SESSION_KEY_PREFIX = "sync_ai_session_activity_";
const USER_NAME_KEY = "sync_user_name";
const USER_PHONE_KEY = "sync_user_phone";
const DEFAULT_USER_NAME = "Zara";
const DEFAULT_USER_PHONE = "17610941208";
let cachedUserId;
let cachedUserName;
let cachedUserPhone;
function createSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function activitySessionStorageKey(activityLegacyId) {
  return `${ACTIVITY_SESSION_KEY_PREFIX}${activityLegacyId}`;
}
function readStoredSessionId(key) {
  try {
    const value = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(key);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}
function writeStoredSessionId(key, sessionId) {
  if (!sessionId.trim()) return;
  try {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(key, sessionId.trim());
  } catch {
    // storage full or unavailable
  }
}
function getOrCreateStoredSessionId(key) {
  const existing = readStoredSessionId(key);
  if (existing) return existing;
  const id = createSessionId();
  writeStoredSessionId(key, id);
  return id;
}
function createFreshStoredSessionId(key) {
  const id = createSessionId();
  writeStoredSessionId(key, id);
  return id;
}
function createFreshSessionId() {
  return createFreshStoredSessionId(SESSION_KEY);
}
function getOrCreateSessionId() {
  return getOrCreateStoredSessionId(SESSION_KEY);
}
function getOrCreateActivitySessionId(activityLegacyId) {
  return getOrCreateStoredSessionId(activitySessionStorageKey(activityLegacyId));
}
function createFreshActivitySessionId(activityLegacyId) {
  return createFreshStoredSessionId(activitySessionStorageKey(activityLegacyId));
}

/** 客户端用户标识（带缓存） */
function getClientUserId() {
  if (cachedUserId) return cachedUserId;
  cachedUserId = getOrCreateSessionId();
  return cachedUserId;
}

/** 客户端展示名称（带缓存） */
function getClientUserName() {
  if (cachedUserName) return cachedUserName;
  try {
    const stored = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(USER_NAME_KEY);
    if (typeof stored === "string" && stored.trim()) {
      cachedUserName = stored.trim();
      return cachedUserName;
    }
  } catch {
    // ignore
  }
  cachedUserName = DEFAULT_USER_NAME;
  return cachedUserName;
}

/** 客户端绑定手机号，出票时回复「手机」自动填入（带缓存） */
function getClientUserPhone() {
  if (cachedUserPhone) return cachedUserPhone;
  try {
    const stored = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(USER_PHONE_KEY);
    if (typeof stored === "string" && stored.trim()) {
      cachedUserPhone = stored.trim();
      return cachedUserPhone;
    }
  } catch {
    // ignore
  }
  cachedUserPhone = DEFAULT_USER_PHONE;
  return cachedUserPhone;
}

/** 清除用户信息缓存（在修改名称/手机/session 后调用） */
function clearClientUserCache() {
  cachedUserId = undefined;
  cachedUserName = undefined;
  cachedUserPhone = undefined;
}

/** API 请求通用的 owner 参数 */
function ownerParams() {
  return {
    userId: getClientUserId(),
    authorName: getClientUserName()
  };
}
function persistUserPhone(phone) {
  if (!phone.trim()) return;
  try {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(USER_PHONE_KEY, phone.trim());
  } catch {
    // ignore
  }
  cachedUserPhone = undefined;
}
function persistUserName(name) {
  if (!name.trim()) return;
  try {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(USER_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
  cachedUserName = undefined;
}
function persistSessionId(sessionId, activityLegacyId) {
  const key = activityLegacyId != null && !Number.isNaN(activityLegacyId) ? activitySessionStorageKey(activityLegacyId) : SESSION_KEY;
  writeStoredSessionId(key, sessionId);
  cachedUserId = undefined;
}

/** 清除本地 AI session，配合后端 db:reset 重新开始测试 */
function clearClientSessionId() {
  try {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(SESSION_KEY);
  } catch {
    // ignore
  }
}

/***/ }),

/***/ "./src/utils/timing.ts":
/*!*****************************!*\
  !*** ./src/utils/timing.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFER_AI_CHAT_MS: function() { return /* binding */ DEFER_AI_CHAT_MS; },
/* harmony export */   DEFER_BELOW_FOLD_MS: function() { return /* binding */ DEFER_BELOW_FOLD_MS; },
/* harmony export */   DEFER_EVENT_POSTS_MS: function() { return /* binding */ DEFER_EVENT_POSTS_MS; },
/* harmony export */   DEFER_NOTIFICATIONS_MS: function() { return /* binding */ DEFER_NOTIFICATIONS_MS; },
/* harmony export */   PRELOAD_HOT_ROUTES_MS: function() { return /* binding */ PRELOAD_HOT_ROUTES_MS; }
/* harmony export */ });
/** Below-fold UI mount defer (first paint). */
const DEFER_BELOW_FOLD_MS = 120;

/** Event detail posts feed defer (0 = fetch on first paint; skeleton covers gap). */
const DEFER_EVENT_POSTS_MS = 0;

/** Notifications list defer. */
const DEFER_NOTIFICATIONS_MS = 0;

/** AI chat panel defer. */
const DEFER_AI_CHAT_MS = 0;

/** Hot-route preload after tab settle (see route.ts). */
const PRELOAD_HOT_ROUTES_MS = 900;

/***/ })

}]);
//# sourceMappingURL=common.js.map