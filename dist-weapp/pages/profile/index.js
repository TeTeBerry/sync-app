"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/profile/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx ***!
  \********************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_BottomNav__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/BottomNav */ "./src/components/BottomNav.tsx");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _mockData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mockData */ "./src/pages/profile/mockData.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _components_ProfileActivitiesSection__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/ProfileActivitiesSection */ "./src/pages/profile/components/ProfileActivitiesSection.tsx");
/* harmony import */ var _components_ProfilePostsSection__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/ProfilePostsSection */ "./src/pages/profile/components/ProfilePostsSection.tsx");
/* harmony import */ var _utils_session__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/session */ "./src/utils/session.ts");
/* harmony import */ var _stores__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../stores */ "./src/stores/index.ts");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _constants_api__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../constants/api */ "./src/constants/api.ts");
/* harmony import */ var _hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../hooks/useConfirmDialog */ "./src/hooks/useConfirmDialog.tsx");
/* harmony import */ var _hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../hooks/useApiQuery */ "./src/hooks/useApiQuery.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");


















const STORAGE_KEYS = {
  notifications: "profile.notificationsEnabled",
  privacy: "profile.privacyLevel"
};
function readStorage(key, fallback) {
  try {
    const raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(key);
    return raw !== "" && raw != null ? raw : fallback;
  } catch {
    return fallback;
  }
}
const Profile = () => {
  const [scrollIntoView, setScrollIntoView] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const notificationsEnabled = (0,_stores__WEBPACK_IMPORTED_MODULE_9__.useProfilePageStore)(state => state.notificationsEnabled);
  const setNotificationsEnabled = (0,_stores__WEBPACK_IMPORTED_MODULE_9__.useProfilePageStore)(state => state.setNotificationsEnabled);
  const setPrivacyLevel = (0,_stores__WEBPACK_IMPORTED_MODULE_9__.useProfilePageStore)(state => state.setPrivacyLevel);
  const consumeProfileIntent = (0,_stores__WEBPACK_IMPORTED_MODULE_9__.useNavigationStore)(state => state.consumeProfileIntent);
  const {
    confirm,
    confirmDialog
  } = (0,_hooks_useConfirmDialog__WEBPACK_IMPORTED_MODULE_12__.useConfirmDialog)({
    cancelText: "取消"
  });
  const summaryQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.useProfileSummaryQuery)();
  const activitiesQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.useProfileActivitiesQuery)();
  const postsQuery = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.useProfilePostsQuery)();
  const apiEnabled = (0,_constants_api__WEBPACK_IMPORTED_MODULE_11__.isApiEnabled)();
  const profileUserData = apiEnabled && summaryQuery.data ? summaryQuery.data : _mockData__WEBPACK_IMPORTED_MODULE_4__.profileUser;
  const activities = activitiesQuery.data ?? [];
  const posts = apiEnabled && postsQuery.data ? postsQuery.data : _mockData__WEBPACK_IMPORTED_MODULE_4__.profilePosts;
  const [editingPostId, setEditingPostId] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [editDraft, setEditDraft] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const applyRouteParams = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    consumeProfileIntent();
  }, [consumeProfileIntent]);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useDidShow)(() => {
    setNotificationsEnabled(readStorage(STORAGE_KEYS.notifications, true));
    setPrivacyLevel(readStorage(STORAGE_KEYS.privacy, "public"));
    applyRouteParams();
    if (apiEnabled) {
      (0,_hooks_useApiQuery__WEBPACK_IMPORTED_MODULE_13__.invalidateCache)(["profile"]);
    }
  });
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_utils_session__WEBPACK_IMPORTED_MODULE_8__.persistUserName)(profileUserData.name);
  }, [profileUserData.name]);
  const scrollToSettings = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView("profile-settings"), 0);
  }, []);
  const handlePostAction = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((action, item) => {
    void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: `${action}: ${item.title}`,
      icon: "none"
    });
  }, []);
  const handleSelectPost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(item => {
    const activityLegacyId = item.activityLegacyId;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "无法打开该帖子所属活动",
        icon: "none"
      });
      return;
    }
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_3__.goEventDetail)(activityLegacyId, {
      postId: item.id
    });
  }, []);
  const handleCompletePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async item => {
    if (!apiEnabled) {
      handlePostAction("标记已组队", item);
      return;
    }
    const ok = await confirm({
      title: "标记已组队",
      message: "确认将该帖子标记为已组队？",
      confirmText: "标记已组队"
    });
    if (!ok) return;
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.updatePostAndInvalidate)(item.id, {
      status: "completed"
    }).then(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "已更新",
      icon: "success"
    })).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "更新失败",
      icon: "none"
    }));
  }, [apiEnabled, confirm, handlePostAction]);
  const handleEditPost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(item => {
    if (editingPostId === item.id) {
      setEditingPostId(null);
      setEditDraft(null);
      return;
    }
    setEditingPostId(item.id);
    setEditDraft({
      body: item.content,
      status: item.status === "已组队" ? "已组队" : "招募中"
    });
  }, [editingPostId]);
  const handleCancelPostEdit = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setEditingPostId(null);
    setEditDraft(null);
  }, []);
  const handleSavePostEdit = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(item => {
    if (!editDraft) return;
    const body = editDraft.body.trim();
    if (!body) {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "帖子内容不能为空",
        icon: "none"
      });
      return;
    }
    if (!apiEnabled) {
      handlePostAction("保存修改", item);
      handleCancelPostEdit();
      return;
    }
    const status = editDraft.status === "已组队" ? "completed" : "recruiting";
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.updatePostAndInvalidate)(item.id, {
      body,
      status
    }).then(() => {
      handleCancelPostEdit();
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已保存",
        icon: "success"
      });
    }).catch(() => void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "保存失败",
      icon: "none"
    }));
  }, [apiEnabled, editDraft, handleCancelPostEdit, handlePostAction]);
  const handleDeletePost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async item => {
    const ok = await confirm({
      title: "删除",
      message: "删除后无法恢复，确定要删除这条帖子吗？",
      confirmText: "删除"
    });
    if (!ok) return;
    if (!apiEnabled) {
      handlePostAction("删除", item);
      return;
    }
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_10__.deletePostAndInvalidate)(item.id).then(() => {
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
  }, [apiEnabled, confirm, handlePostAction, postsQuery]);
  const openSettings = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(section => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_3__.go)(`${_utils_route__WEBPACK_IMPORTED_MODULE_3__.ROUTES.SETTINGS}?section=${section}`);
  }, []);
  const handleLogout = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
    const ok = await confirm({
      title: "退出登录",
      message: "确定要退出当前账号吗？",
      confirmText: "退出登录"
    });
    if (!ok) return;
    void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "已退出登录",
      icon: "success"
    });
  }, [confirm]);
  const profileSubtext = `${profileUserData.handle} · ${profileUserData.location} · ${profileUserData.bio}`;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
    "data-cmp": "Profile",
    className: "s-profile s-page-with-tabbar",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.ScrollView, {
      scrollY: true,
      enhanced: true,
      showScrollbar: false,
      scrollIntoView: scrollIntoView,
      className: "s-page-with-tabbar__scroll s-profile__main s-scrollbar-none",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
        className: "s-profile__header",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Button, {
          className: "s-profile__settings-btn",
          "aria-label": "\u8BBE\u7F6E",
          onClick: scrollToSettings,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.Settings, {
            size: 20
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
        className: "s-profile__card",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
          className: "s-profile__card-top",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__avatar-wrap",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Image, {
              className: "s-profile__avatar",
              src: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_5__.sanitizeRemoteImageUrl)(profileUserData.avatar) ?? profileUserData.avatar,
              alt: profileUserData.name
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__info",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__name",
              children: profileUserData.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__subtext",
              children: profileSubtext
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
          className: "s-profile__stats",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-value",
              children: profileUserData.stats.events
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-label",
              children: "\u53C2\u52A0\u6D3B\u52A8"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-value",
              children: profileUserData.stats.matchSuccess
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-label",
              children: "\u7EC4\u961F\u6210\u529F"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-value",
              children: profileUserData.stats.likes
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-label",
              children: "\u83B7\u8D5E\u6570"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
            className: "s-profile__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-value",
              children: profileUserData.stats.posts
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__stat-label",
              children: "\u6211\u7684\u5E16\u5B50"
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
        className: "s-profile__sections",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_ProfileActivitiesSection__WEBPACK_IMPORTED_MODULE_6__["default"], {
          items: activities
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_ProfilePostsSection__WEBPACK_IMPORTED_MODULE_7__["default"], {
          items: posts,
          editingPostId: editingPostId,
          editDraft: editDraft,
          onSelect: handleSelectPost,
          onComplete: handleCompletePost,
          onEdit: handleEditPost,
          onDelete: handleDeletePost,
          onEditDraftChange: setEditDraft,
          onSaveEdit: handleSavePostEdit,
          onCancelEdit: handleCancelPostEdit
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
        id: "profile-settings",
        className: "s-profile__settings-section s-tabbar-offset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.View, {
          className: "s-profile__settings-card",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Button, {
            className: "s-profile__settings-row",
            onClick: () => openSettings("notifications"),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-icon s-profile__settings-icon--bell",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.Bell, {
                size: 18
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-label",
              children: "\u901A\u77E5\u8BBE\u7F6E"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-value",
              children: notificationsEnabled ? "已开启" : "已关闭"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.ChevronRight, {
              size: 18,
              className: "s-profile__settings-chevron"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Button, {
            className: "s-profile__settings-row",
            onClick: () => openSettings("privacy"),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-icon s-profile__settings-icon--shield",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.Shield, {
                size: 18
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-label",
              children: "\u9690\u79C1\u4E0E\u5B89\u5168"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.ChevronRight, {
              size: 18,
              className: "s-profile__settings-chevron"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Button, {
            className: "s-profile__settings-row",
            onClick: () => openSettings("help"),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-icon s-profile__settings-icon--help",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.Info, {
                size: 18
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-label",
              children: "\u5E2E\u52A9\u4E0E\u53CD\u9988"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.ChevronRight, {
              size: 18,
              className: "s-profile__settings-chevron"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Button, {
            className: "s-profile__settings-row s-profile__settings-row--logout",
            onClick: handleLogout,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-icon s-profile__settings-icon--logout",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_16__.LogOut, {
                size: 18
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_15__.Text, {
              className: "s-profile__settings-label",
              children: "\u9000\u51FA\u767B\u5F55"
            })]
          })]
        })
      })]
    }), confirmDialog, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_14__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_2__.BottomNavSlot, {})]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (Profile);

/***/ }),

/***/ "./src/components/profile/ProfileCollapsibleSection.tsx":
/*!**************************************************************!*\
  !*** ./src/components/profile/ProfileCollapsibleSection.tsx ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProfileCollapsibleSection: function() { return /* binding */ ProfileCollapsibleSection; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _hooks_useClientPagination__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../hooks/useClientPagination */ "./src/hooks/useClientPagination.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");





const SECTION_VARIANTS = {
  activities: {
    modifier: "s-profile-section--activities",
    icon: "s-profile-section__icon--pink",
    badge: "s-profile-section__badge--pink"
  },
  posts: {
    modifier: "s-profile-section--posts",
    icon: "s-profile-section__icon--cyan",
    badge: "s-profile-section__badge--cyan"
  }
};
function ProfileCollapsibleSection({
  variant,
  icon,
  title,
  items,
  pageSize = 2,
  children
}) {
  const [expanded, setExpanded] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    page,
    totalPages,
    pageItems,
    goPrev,
    goNext,
    resetPage
  } = (0,_hooks_useClientPagination__WEBPACK_IMPORTED_MODULE_1__.useClientPagination)(items, pageSize);
  const styles = SECTION_VARIANTS[variant];
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
    resetPage();
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: ["s-profile-section", styles.modifier, expanded ? " s-profile-section--expanded" : ""].join(""),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "s-profile-section__header",
      role: "button",
      tabIndex: 0,
      onClick: toggleExpanded,
      onKeyDown: event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleExpanded();
        }
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        className: "s-profile-section__header-left",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          className: `s-profile-section__icon ${styles.icon}`,
          children: icon
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          className: "s-profile-section__title",
          children: title
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          className: `s-profile-section__badge ${styles.badge}`,
          children: items.length
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
        className: "s-profile-section__header-right",
        children: [expanded ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          className: "s-profile-section__pagination",
          onClick: event => event.stopPropagation(),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            className: "s-profile-section__page-btn",
            disabled: page === 0,
            "aria-label": "\u4E0A\u4E00\u9875",
            onClick: goPrev,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.ChevronLeft, {
              size: 16
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
            className: "s-profile-section__page-label",
            children: [page + 1, "/", totalPages]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            className: "s-profile-section__page-btn",
            disabled: page >= totalPages - 1,
            "aria-label": "\u4E0B\u4E00\u9875",
            onClick: goNext,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.ChevronRight, {
              size: 16
            })
          })]
        }) : null, expanded ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.ChevronUp, {
          size: 18
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.ChevronDown, {
          size: 18
        })]
      })]
    }), expanded ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "s-profile-section__body",
      children: children(pageItems)
    }) : null]
  });
}

/***/ }),

/***/ "./src/hooks/useClientPagination.ts":
/*!******************************************!*\
  !*** ./src/hooks/useClientPagination.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useClientPagination: function() { return /* binding */ useClientPagination; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function useClientPagination(items, pageSize) {
  const [page, setPage] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => items.slice(page * pageSize, page * pageSize + pageSize), [items, page, pageSize]);
  const goPrev = () => setPage(prev => Math.max(0, prev - 1));
  const goNext = () => setPage(prev => Math.min(totalPages - 1, prev + 1));
  const resetPage = () => setPage(0);
  return {
    page,
    totalPages,
    pageItems,
    goPrev,
    goNext,
    resetPage
  };
}

/***/ }),

/***/ "./src/pages/profile/components/ProfileActivitiesSection.tsx":
/*!*******************************************************************!*\
  !*** ./src/pages/profile/components/ProfileActivitiesSection.tsx ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/ImageWithFallback */ "./src/components/ImageWithFallback.tsx");
/* harmony import */ var _components_MetaRow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/MetaRow */ "./src/components/MetaRow.tsx");
/* harmony import */ var _components_profile_ProfileCollapsibleSection__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../components/profile/ProfileCollapsibleSection */ "./src/components/profile/ProfileCollapsibleSection.tsx");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");








const EVENT_STATUS_TEXT = {
  upcoming: "即将参加",
  registered: "已报名",
  attended: "已参加",
  completed: "已结束"
};
const ProfileActivitiesSection = ({
  items
}) => {
  const sortedItems = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [...items].sort(_utils_activityStatus__WEBPACK_IMPORTED_MODULE_5__.compareActivityDateDesc), [items]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_components_profile_ProfileCollapsibleSection__WEBPACK_IMPORTED_MODULE_3__.ProfileCollapsibleSection, {
    variant: "activities",
    icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_6__.Ticket, {
      size: 14
    }),
    title: "\u6211\u7684\u6D3B\u52A8",
    items: sortedItems,
    children: pageItems => pageItems.map(item => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      className: "s-profile-activity",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_components_ImageWithFallback__WEBPACK_IMPORTED_MODULE_1__.ImageWithFallback, {
        src: item.image,
        alt: "",
        imageClassName: "s-profile-activity__thumb",
        placeholderClassName: "s-profile-activity__thumb s-profile-activity__thumb--placeholder",
        fallback: item.title.slice(0, 2)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        className: "s-profile-activity__content",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
          className: "s-profile-activity__top",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            className: "s-profile-activity__title",
            children: item.title
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            className: "s-profile-activity__status",
            children: EVENT_STATUS_TEXT[item.status] ?? item.status
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
          className: "s-profile-activity__meta",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_components_MetaRow__WEBPACK_IMPORTED_MODULE_2__.MetaRow, {
            className: "s-profile-activity__meta-item",
            icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_6__.Calendar, {
              size: 12
            }),
            children: item.date
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_components_MetaRow__WEBPACK_IMPORTED_MODULE_2__.MetaRow, {
            className: "s-profile-activity__meta-item",
            icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_6__.MapPin, {
              size: 12
            }),
            children: item.location
          })]
        })]
      })]
    }, item.id))
  });
};
/* harmony default export */ __webpack_exports__["default"] = (ProfileActivitiesSection);

/***/ }),

/***/ "./src/pages/profile/components/ProfilePostsSection.tsx":
/*!**************************************************************!*\
  !*** ./src/pages/profile/components/ProfilePostsSection.tsx ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_ContentTypeBadge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/ContentTypeBadge */ "./src/components/ContentTypeBadge.tsx");
/* harmony import */ var _components_profile_ProfileCollapsibleSection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/profile/ProfileCollapsibleSection */ "./src/components/profile/ProfileCollapsibleSection.tsx");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






const POST_BODY_MAX = 200;
function isPostEditDirty(item, draft) {
  const statusMatches = draft.status === "已组队" ? item.status === "已组队" : item.status === "招募中";
  return draft.body !== item.content || !statusMatches;
}
const ProfilePostsSection = ({
  items,
  editingPostId = null,
  editDraft = null,
  onSelect,
  onComplete,
  onEdit,
  onDelete,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit
}) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_components_profile_ProfileCollapsibleSection__WEBPACK_IMPORTED_MODULE_2__.ProfileCollapsibleSection, {
  variant: "posts",
  icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.MessageSquare, {
    size: 14
  }),
  title: "\u6211\u7684\u5E16\u5B50",
  items: items,
  children: pageItems => pageItems.map(item => {
    const isEditing = editingPostId === item.id;
    const draft = isEditing ? editDraft : null;
    const charCount = draft?.body.length ?? 0;
    const charProgress = Math.min(charCount / POST_BODY_MAX, 1);
    const isDirty = isEditing && draft ? isPostEditDirty(item, draft) : false;
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: `s-profile-post s-profile-post--clickable${isEditing ? " s-profile-post--editing" : ""}`,
      role: "button",
      onClick: () => onSelect?.(item),
      onKeyDown: event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect?.(item);
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "s-profile-post__head",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "s-profile-post__title",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post__title-dot"
          }), item.title]
        }), item.status === "招募中" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "s-profile-post__status s-profile-post__status--recruiting",
          children: "\u62DB\u52DF\u4E2D"
        }) : item.status === "已组队" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "s-profile-post__status s-profile-post__status--grouped",
          children: "\u5DF2\u7EC4\u961F"
        }) : null]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "s-profile-post__content",
        children: item.content
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_components_ContentTypeBadge__WEBPACK_IMPORTED_MODULE_1__.ContentTypeBadge, {
        types: item.contentTypes
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "s-profile-post__footer",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post__stats",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Heart, {
              size: 13
            }), item.likes]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.MessageCircle, {
              size: 13
            }), item.comments]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post__stat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Clock, {
              size: 13
            }), item.date]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post__actions",
          children: [item.status === "招募中" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: "s-profile-post__action s-profile-post__action--complete",
            "aria-label": "\u6807\u8BB0\u5DF2\u7EC4\u961F",
            onClick: event => {
              event.stopPropagation();
              onComplete?.(item);
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.CircleCheck, {
              size: 14
            })
          }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: "s-profile-post__action s-profile-post__action--edit",
            "aria-label": "\u7F16\u8F91",
            onClick: event => {
              event.stopPropagation();
              onEdit?.(item);
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Pencil, {
              size: 14
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: "s-profile-post__action s-profile-post__action--delete",
            "aria-label": "\u5220\u9664",
            onClick: event => {
              event.stopPropagation();
              onDelete?.(item);
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Trash2, {
              size: 14
            })
          })]
        })]
      }), isEditing && draft ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "s-profile-post-edit",
        onClick: event => event.stopPropagation(),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post-edit__header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post-edit__label",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "s-profile-post-edit__label-icon",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Pencil, {
                size: 14
              })
            }), "\u7F16\u8F91\u5E16\u5B50"]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post-edit__event",
            children: item.title
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post-edit__field",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
            className: "s-profile-post-edit__textarea-wrap",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Textarea, {
              className: "s-profile-post-edit__textarea",
              value: draft.body,
              maxlength: POST_BODY_MAX,
              onInput: event => {
                onEditDraftChange?.({
                  ...draft,
                  body: event.detail.value.slice(0, POST_BODY_MAX)
                });
              }
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "s-profile-post-edit__counter",
              children: `${charCount} / ${POST_BODY_MAX}`
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
            className: "s-profile-post-edit__progress",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "s-profile-post-edit__progress-fill",
              style: {
                width: `${charProgress * 100}%`
              }
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "s-profile-post-edit__status-label",
          children: "\u5E16\u5B50\u72B6\u6001"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post-edit__status-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: `s-profile-post-edit__status-btn${draft.status === "招募中" ? " s-profile-post-edit__status-btn--active-recruiting" : ""}`,
            onClick: () => onEditDraftChange?.({
              ...draft,
              status: "招募中"
            }),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Flame, {
              size: 16
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              children: "\u62DB\u52DF\u4E2D"
            }), draft.status === "招募中" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "s-profile-post-edit__status-dot"
            }) : null]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: `s-profile-post-edit__status-btn${draft.status === "已组队" ? " s-profile-post-edit__status-btn--active-grouped" : ""}`,
            onClick: () => onEditDraftChange?.({
              ...draft,
              status: "已组队"
            }),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.CircleCheck, {
              size: 16
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              children: "\u5DF2\u7EC4\u961F"
            }), draft.status === "已组队" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Sparkles, {
              size: 14,
              className: "s-profile-post-edit__status-sparkle"
            }) : null]
          })]
        }), isDirty ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "s-profile-post-edit__dirty",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "s-profile-post-edit__dirty-dot"
          }), "\u5185\u5BB9\u5DF2\u4FEE\u6539\uFF0C\u8BB0\u5F97\u4FDD\u5B58"]
        }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "s-profile-post-edit__actions",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: "s-profile-post-edit__save",
            onClick: () => onSaveEdit?.(item),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.Check, {
              size: 16
            }), "\u4FDD\u5B58\u4FEE\u6539"]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            className: "s-profile-post-edit__cancel",
            onClick: () => onCancelEdit?.(),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_4__.X, {
              size: 14
            }), "\u53D6\u6D88"]
          })]
        })]
      }) : null]
    }, item.id);
  })
});
/* harmony default export */ __webpack_exports__["default"] = (ProfilePostsSection);

/***/ }),

/***/ "./src/pages/profile/index.tsx":
/*!*************************************!*\
  !*** ./src/pages/profile/index.tsx ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","disableScroll":true,"backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/profile/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/profile/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map