"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/settings/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/settings/index!./src/pages/settings/index.tsx":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/settings/index!./src/pages/settings/index.tsx ***!
  \**********************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _components_PageNavigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/PageNavigation */ "./src/components/PageNavigation.tsx");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _utils_profileSnapshotStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/profileSnapshotStorage */ "./src/utils/profileSnapshotStorage.ts");
/* harmony import */ var _stores_profilePageStore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../stores/profilePageStore */ "./src/stores/profilePageStore.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");











const STORAGE_KEYS = {
  notifications: "profile.notificationsEnabled",
  privacy: "profile.privacyLevel"
};
const SECTION_TITLES = {
  notifications: "消息通知",
  privacy: "隐私设置",
  help: "帮助与反馈"
};
const PRIVACY_LABELS = {
  public: "公开",
  friends: "仅好友",
  private: "私密"
};
const PRIVACY_DESCS = {
  public: "所有人可见你的主页和活动记录",
  friends: "仅互相关注的用户可见",
  private: "仅自己可见"
};
const FAQ_QA = [{
  q: "如何发布组队帖？",
  a: "进入活动详情页，通过 AI 助手描述你的需求，或在「我的帖子」中管理已发布内容。"
}, {
  q: "如何找到同行伙伴？",
  a: "浏览热门帖子或在活动详情页使用 AI 精准匹配，找到志同道合的队友。"
}, {
  q: "如何提升个人影响力？",
  a: "参与活动、成功组队、发布优质帖子均可获得互动与认可。"
}];
function readBool(key, fallback) {
  try {
    const raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(key);
    if (raw === "") return fallback;
    return Boolean(raw);
  } catch {
    return fallback;
  }
}
function readPrivacy(key, fallback) {
  try {
    const raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(key);
    return raw || fallback;
  } catch {
    return fallback;
  }
}
const SettingsPage = () => {
  const router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useRouter)();
  const section = router.params.section ?? "notifications";
  const {
    data: currentUser
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__.useCurrentUserQuery)();
  const setStoreNotificationsEnabled = (0,_stores_profilePageStore__WEBPACK_IMPORTED_MODULE_6__.useProfilePageStore)(state => state.setNotificationsEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => readBool(STORAGE_KEYS.notifications, true));
  const [privacyLevel, setPrivacyLevel] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => readPrivacy(STORAGE_KEYS.privacy, "public"));
  const setStorePrivacyLevel = (0,_stores_profilePageStore__WEBPACK_IMPORTED_MODULE_6__.useProfilePageStore)(state => state.setPrivacyLevel);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (currentUser?.notificationsEnabled == null) return;
    setNotificationsEnabled(currentUser.notificationsEnabled);
    setStoreNotificationsEnabled(currentUser.notificationsEnabled);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEYS.notifications, currentUser.notificationsEnabled);
  }, [currentUser?.notificationsEnabled, setStoreNotificationsEnabled]);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!currentUser?.privacyLevel) return;
    setPrivacyLevel(currentUser.privacyLevel);
    setStorePrivacyLevel(currentUser.privacyLevel);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEYS.privacy, currentUser.privacyLevel);
  }, [currentUser?.privacyLevel, setStorePrivacyLevel]);
  const toggleNotifications = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setNotificationsEnabled(prev => {
      const next = !prev;
      _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEYS.notifications, next);
      setStoreNotificationsEnabled(next);
      void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__.updateCurrentUserAndInvalidate)({
        notificationsEnabled: next
      }).catch(() => undefined);
      void (0,_utils_profileSnapshotStorage__WEBPACK_IMPORTED_MODULE_5__.saveEncryptedProfileSnapshot)({
        notificationsEnabled: next,
        city: currentUser?.city,
        favorGenres: currentUser?.favorGenres,
        likeMate: currentUser?.likeMate,
        budgetLevel: currentUser?.budgetLevel
      });
      return next;
    });
  }, [currentUser?.budgetLevel, currentUser?.city, currentUser?.favorGenres, currentUser?.likeMate, setStoreNotificationsEnabled]);
  const selectPrivacy = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(level => {
    setPrivacyLevel(level);
    setStorePrivacyLevel(level);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEYS.privacy, level);
    void (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_4__.updateCurrentUserAndInvalidate)({
      privacyLevel: level
    }).then(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "已保存",
        icon: "success"
      });
    }).catch(() => {
      void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
        title: "请求失败，请稍后重试",
        icon: "none"
      });
    });
  }, [setStorePrivacyLevel]);
  const submitFeedback = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    void _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showToast({
      title: "反馈已提交，感谢！",
      icon: "success"
    });
  }, []);
  const privacyOptions = ["public", "friends", "private"];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
    "data-cmp": "Settings",
    className: "s-settings",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_PageNavigation__WEBPACK_IMPORTED_MODULE_2__["default"], {
      title: SECTION_TITLES[section],
      fallback: _utils_route__WEBPACK_IMPORTED_MODULE_3__.ROUTES.PROFILE
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      className: "s-settings__main",
      children: [section === "notifications" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        className: "s-settings__card",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "s-settings__row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__row-label",
              children: "\u63A8\u9001\u901A\u77E5"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__row-desc",
              children: "\u63A5\u6536\u6D3B\u52A8\u63D0\u9192\u3001\u4E92\u52A8\u6D88\u606F\u7B49"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
            role: "switch",
            "aria-checked": notificationsEnabled,
            className: `s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`,
            onClick: toggleNotifications,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "s-settings__toggle-knob"
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "s-settings__row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__row-label",
              children: "\u6D3B\u52A8\u63D0\u9192"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__row-desc",
              children: "\u6D3B\u52A8\u5F00\u59CB\u524D 24 \u5C0F\u65F6\u63D0\u9192"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
            role: "switch",
            "aria-checked": notificationsEnabled,
            className: `s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`,
            onClick: toggleNotifications,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "s-settings__toggle-knob"
            })
          })]
        })]
      }), section === "privacy" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        className: "s-settings__card",
        children: privacyOptions.map(level => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
          className: `s-settings__option${privacyLevel === level ? " s-settings__option--selected" : ""}`,
          onClick: () => selectPrivacy(level),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__option-label",
              children: PRIVACY_LABELS[level]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__option-desc",
              children: PRIVACY_DESCS[level]
            })]
          }), privacyLevel === level && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_9__.Check, {
            size: 20,
            className: "s-settings__check"
          })]
        }, level))
      }), section === "help" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "s-settings__card s-settings__faq",
          children: FAQ_QA.map((item, idx) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            className: "s-settings__faq-item",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__faq-q",
              children: item.q
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "s-settings__faq-a",
              children: item.a
            })]
          }, idx))
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
          className: "s-settings__feedback-btn",
          onClick: submitFeedback,
          children: "\u63D0\u4EA4\u53CD\u9988"
        })]
      })]
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (SettingsPage);

/***/ }),

/***/ "./src/pages/settings/index.tsx":
/*!**************************************!*\
  !*** ./src/pages/settings/index.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/settings/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/settings/index!./src/pages/settings/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/settings/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_settings_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/encryptedStorage.ts":
/*!***************************************!*\
  !*** ./src/utils/encryptedStorage.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decryptJson: function() { return /* binding */ decryptJson; },
/* harmony export */   encryptJson: function() { return /* binding */ encryptJson; }
/* harmony export */ });
const PBKDF2_ITERATIONS = 100_000;
const SALT = "sync-profile-v1";
function getSubtleCrypto() {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return crypto.subtle;
  }
  return null;
}
function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
async function deriveKey(secret) {
  const subtle = getSubtleCrypto();
  if (!subtle) return null;
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey({
    name: "PBKDF2",
    salt: encoder.encode(SALT),
    iterations: PBKDF2_ITERATIONS,
    hash: "SHA-256"
  }, keyMaterial, {
    name: "AES-GCM",
    length: 256
  }, false, ["encrypt", "decrypt"]);
}
async function encryptJson(secret, payload) {
  const subtle = getSubtleCrypto();
  const key = await deriveKey(secret);
  if (!subtle || !key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await subtle.encrypt({
    name: "AES-GCM",
    iv
  }, key, encoded);
  return JSON.stringify({
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(cipher))
  });
}
async function decryptJson(secret, encrypted) {
  const subtle = getSubtleCrypto();
  const key = await deriveKey(secret);
  if (!subtle || !key || !encrypted.trim()) return null;
  try {
    const parsed = JSON.parse(encrypted);
    if (!parsed.iv || !parsed.data) return null;
    const iv = fromBase64(parsed.iv);
    const data = fromBase64(parsed.data);
    const plain = await subtle.decrypt({
      name: "AES-GCM",
      iv: iv
    }, key, data);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch {
    return null;
  }
}

/***/ }),

/***/ "./src/utils/profileSnapshotStorage.ts":
/*!*********************************************!*\
  !*** ./src/utils/profileSnapshotStorage.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   saveEncryptedProfileSnapshot: function() { return /* binding */ saveEncryptedProfileSnapshot; }
/* harmony export */ });
/* unused harmony export loadEncryptedProfileSnapshot */
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _encryptedStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./encryptedStorage */ "./src/utils/encryptedStorage.ts");
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./session */ "./src/utils/session.ts");



const STORAGE_KEY = "profile.encryptedSnapshot";
async function saveEncryptedProfileSnapshot(snapshot) {
  const payload = {
    ...snapshot,
    updatedAt: new Date().toISOString()
  };
  const encrypted = await (0,_encryptedStorage__WEBPACK_IMPORTED_MODULE_2__.encryptJson)((0,_session__WEBPACK_IMPORTED_MODULE_1__.getClientUserId)(), payload);
  if (encrypted) {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEY, encrypted);
    return;
  }
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(STORAGE_KEY, JSON.stringify(payload));
}
async function loadEncryptedProfileSnapshot() {
  try {
    const raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(STORAGE_KEY);
    if (!raw) return null;
    if (typeof raw === "string" && raw.startsWith("{")) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
    if (typeof raw === "string") {
      return (0,_encryptedStorage__WEBPACK_IMPORTED_MODULE_2__.decryptJson)((0,_session__WEBPACK_IMPORTED_MODULE_1__.getClientUserId)(), raw);
    }
  } catch {
    return null;
  }
  return null;
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/settings/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map