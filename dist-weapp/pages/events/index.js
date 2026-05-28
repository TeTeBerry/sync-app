"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/events/index"],{

/***/ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/events/index!./src/pages/events/index.tsx":
/*!******************************************************************************************************************!*\
  !*** ./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/events/index!./src/pages/events/index.tsx ***!
  \******************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _components_BottomNav__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/BottomNav */ "./src/components/BottomNav.tsx");
/* harmony import */ var _hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../hooks/useNavBarInsets */ "./src/hooks/useNavBarInsets.ts");
/* harmony import */ var _hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../hooks/useTabPageMainHeight */ "./src/hooks/useTabPageMainHeight.ts");
/* harmony import */ var _components_EventCard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/EventCard */ "./src/components/EventCard.tsx");
/* harmony import */ var _components_ListState__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/ListState */ "./src/components/ListState.tsx");
/* harmony import */ var _hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../hooks/useSyncApi */ "./src/hooks/useSyncApi.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/route */ "./src/utils/route.ts");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");














function matchesEventFilter(status, tab) {
  if (tab === "all") return true;
  if (tab === "ended") return status === "ended";
  return status !== "ended";
}

/** Fixed header + search/tabs above the event list (px, design @ 375). */
const EVENTS_CHROME_PX = 168;
/** Baseline top padding in events.scss before status-bar inset. */
const EVENTS_HEADER_TOP_PX = 14;
const Events = () => {
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.preloadHotRoutes)();
  }, []);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__.useDidShow)(() => {
    (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.preloadHotRoutes)();
  });
  const navInsets = (0,_hooks_useNavBarInsets__WEBPACK_IMPORTED_MODULE_3__.useNavBarInsets)();
  const eventsChromePx = EVENTS_CHROME_PX - EVENTS_HEADER_TOP_PX + navInsets.paddingTop;
  const listScrollHeight = (0,_hooks_useTabPageMainHeight__WEBPACK_IMPORTED_MODULE_4__.useTabPageMainHeight)(eventsChromePx);
  const headerStyle = navInsets.paddingTop > 0 || navInsets.paddingRight > 16 ? {
    ...(navInsets.paddingTop > 0 ? {
      paddingTop: `${navInsets.paddingTop}px`
    } : {}),
    ...(navInsets.paddingRight > 16 ? {
      paddingRight: `${navInsets.paddingRight}px`
    } : {})
  } : undefined;
  const {
    events,
    isLoading,
    isError,
    refetch
  } = (0,_hooks_useSyncApi__WEBPACK_IMPORTED_MODULE_7__.useEventList)();
  const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("upcoming");
  const [searchQuery, setSearchQuery] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
  const openDetail = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(legacyId => {
    const id = Number(legacyId);
    if (!Number.isNaN(id) && id > 0) {
      (0,_utils_route__WEBPACK_IMPORTED_MODULE_8__.goEventDetail)(id);
    }
  }, []);
  const filteredEvents = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter(event => {
      const status = (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_10__.getActivityStatusFromActivity)(event.date, event.title);
      if (!matchesEventFilter(status, activeTab)) return false;
      if (!q) return true;
      return event.title.toLowerCase().includes(q) || event.location.toLowerCase().includes(q) || event.date.includes(q);
    });
  }, [activeTab, events, searchQuery]);
  const filterTabs = [{
    id: "all",
    label: "全部"
  }, {
    id: "upcoming",
    label: "即将开始"
  }, {
    id: "ended",
    label: "已结束"
  }];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
    className: "s-page-shell s-page-with-tabbar",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
      className: "s-page-with-tabbar__main s-events",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-events__header",
        style: headerStyle,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-events__brand",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.AudioWaveform, {
            size: 24,
            className: "s-events__brand-icon",
            "aria-hidden": true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
            className: "s-events__brand-copy",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
              className: "s-events__brand-title",
              children: "SYNC"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
              className: "s-events__brand-subtitle",
              children: "\u7535\u97F3\u6D3B\u52A8"
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-events__count-pill",
          "aria-label": `${events.length} 场活动`,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.TrendingUp, {
            size: 14,
            "aria-hidden": true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
            children: `${events.length} 场活动`
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-events__toolbar",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-events__search",
          "aria-label": "\u641C\u7D22\u6D3B\u52A8\u3001\u57CE\u5E02...",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.Search, {
            size: 18,
            className: "s-events__search-icon",
            "aria-hidden": true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Input, {
            type: "text",
            className: "s-events__search-input",
            placeholder: "\u641C\u7D22\u6D3B\u52A8\u3001\u57CE\u5E02...",
            value: searchQuery,
            onInput: e => setSearchQuery(e.target.value)
          }), searchQuery && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Button, {
            className: "s-events__search-clear",
            onClick: () => setSearchQuery(""),
            "aria-label": "\u6E05\u7A7A",
            children: "\xD7"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-events__tabs",
          role: "tablist",
          "aria-label": "\u6D3B\u52A8\u7B5B\u9009",
          children: filterTabs.map(tab => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Button, {
            role: "tab",
            "aria-selected": activeTab === tab.id,
            className: ["s-events__tab", activeTab === tab.id ? "s-events__tab--active" : ""].filter(Boolean).join(" "),
            onClick: () => setActiveTab(tab.id),
            children: tab.label
          }, tab.id))
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.ScrollView, {
        scrollY: true,
        enhanced: true,
        showScrollbar: false,
        className: "s-events__main s-scrollbar-none",
        style: listScrollHeight != null ? {
          height: `${listScrollHeight}px`
        } : undefined,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-events__scroll-inner",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_ListState__WEBPACK_IMPORTED_MODULE_6__.ListState, {
            isLoading: isLoading,
            isError: isError,
            isEmpty: !isLoading && !isError && filteredEvents.length === 0,
            loadingText: "\u52A0\u8F7D\u6D3B\u52A8\u4E2D...",
            errorText: "\u6D3B\u52A8\u5217\u8868\u52A0\u8F7D\u5931\u8D25",
            emptyText: "\u6682\u65E0\u6D3B\u52A8",
            onRetry: () => void refetch(),
            retryText: "\u91CD\u8BD5",
            stateClassName: "s-events__state",
            retryClassName: "s-events__retry",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
              className: "s-events__list",
              children: filteredEvents.map(event => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
                className: "s-events__card-wrap",
                role: "button",
                tabIndex: 0,
                onClick: () => openDetail(event.id),
                onKeyDown: e => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  openDetail(event.id);
                },
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_EventCard__WEBPACK_IMPORTED_MODULE_5__["default"], {
                  id: event.id,
                  title: event.title,
                  date: event.date,
                  location: event.location,
                  image: event.image,
                  attendees: event.attendees,
                  hot: event.hot,
                  variant: "list",
                  onTeamUp: () => openDetail(event.id)
                })
              }, event.id))
            })
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_BottomNav__WEBPACK_IMPORTED_MODULE_2__.BottomNavSlot, {})]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (Events);

/***/ }),

/***/ "./src/components/AvatarGroup.tsx":
/*!****************************************!*\
  !*** ./src/components/AvatarGroup.tsx ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/activityGuestAvatars */ "./src/constants/activityGuestAvatars.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");






const AvatarGroup = ({
  avatars = _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_1__.ACTIVITY_GUEST_AVATARS,
  max = 3,
  total = 70
}) => {
  const displayAvatars = avatars.slice(0, max);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    "data-cmp": "AvatarGroup",
    className: "s-avatar-group",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "s-avatar-group__pile",
      children: displayAvatars.map((url, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Image, {
        src: (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_2__.thumbnailImageUrl)(url, 80) ?? url,
        className: "s-avatar-group__avatar"
      }, url + i))
    }), total > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
      className: "s-avatar-group__count",
      children: [total.toLocaleString(), " \u53C2\u4E0E"]
    }) : null]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (AvatarGroup);

/***/ }),

/***/ "./src/components/EventCard.tsx":
/*!**************************************!*\
  !*** ./src/components/EventCard.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _AvatarGroup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AvatarGroup */ "./src/components/AvatarGroup.tsx");
/* harmony import */ var _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/activityGuestAvatars */ "./src/constants/activityGuestAvatars.ts");
/* harmony import */ var _ImageWithFallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ImageWithFallback */ "./src/components/ImageWithFallback.tsx");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ui */ "./src/components/ui/index.ts");
/* harmony import */ var lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! lucide-react-taro */ "./node_modules/lucide-react-taro/dist/esm/index.js");
/* harmony import */ var _utils_activityStatus__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/activityStatus */ "./src/utils/activityStatus.ts");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _utils_eventCardDisplay__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/eventCardDisplay */ "./src/utils/eventCardDisplay.ts");
/* harmony import */ var _constants_remoteImages__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/remoteImages */ "./src/constants/remoteImages.ts");
/* harmony import */ var _utils_imageUrl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/imageUrl */ "./src/utils/imageUrl.ts");
/* harmony import */ var _utils_route__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/route */ "./src/utils/route.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");














const EventCardInner = ({
  id = "1",
  title = "Audien",
  date = "Sat 12/20 at 10:00 PM",
  location = "The Ave Live",
  image = _constants_remoteImages__WEBPACK_IMPORTED_MODULE_8__.PLACEHOLDER_EVENT_HERO,
  attendees = 70,
  hot = false,
  variant = "list",
  onTeamUp
}) => {
  const legacyId = Number(id);
  const isNavigating = (0,_utils_route__WEBPACK_IMPORTED_MODULE_6__.useRouteTransitionActive)(Number.isFinite(legacyId) && legacyId > 0 ? legacyId : undefined);
  const thumbSrc = (0,_utils_imageUrl__WEBPACK_IMPORTED_MODULE_5__.thumbnailImageUrl)(image, 400);
  const status = (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_9__.getActivityStatusFromActivity)(date, title);
  const dateBadge = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_eventCardDisplay__WEBPACK_IMPORTED_MODULE_10__.formatEventDateBadge)(date), [date]);
  const fullDate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_eventCardDisplay__WEBPACK_IMPORTED_MODULE_10__.formatEventFullDate)(date, title), [date, title]);
  const heroSubtitle = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_eventCardDisplay__WEBPACK_IMPORTED_MODULE_10__.formatEventHeroSubtitle)(title, location), [title, location]);
  const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_eventCardDisplay__WEBPACK_IMPORTED_MODULE_10__.deriveEventCardStats)(attendees), [attendees]);
  if (variant !== "list") {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
      "data-cmp": "EventCard",
      className: ["s-event-card", (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_9__.activityStatusCardClass)(status)].filter(Boolean).join(" "),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ImageWithFallback__WEBPACK_IMPORTED_MODULE_3__.ImageWithFallback, {
        src: thumbSrc,
        alt: title,
        imageClassName: "s-event-card__img",
        placeholderClassName: "s-event-card__img s-event-card__img--placeholder",
        fallback: title.slice(0, 2)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__body",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__title",
          children: title
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__date s-line-clamp-1",
          children: date
        })]
      })]
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
    "data-cmp": "EventCard",
    className: ["s-event-card", "s-event-card--list", (0,_utils_activityStatus__WEBPACK_IMPORTED_MODULE_9__.activityStatusCardClass)(status)].filter(Boolean).join(" "),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
      className: "s-event-card__hero",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ImageWithFallback__WEBPACK_IMPORTED_MODULE_3__.ImageWithFallback, {
        src: thumbSrc,
        alt: title,
        imageClassName: "s-event-card__hero-img",
        placeholderClassName: "s-event-card__hero-img s-event-card__hero-img--placeholder",
        fallback: title.slice(0, 2)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__hero-scrim",
        "aria-hidden": true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__date-badge",
        "aria-hidden": true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__date-primary",
          children: dateBadge.primary
        }), dateBadge.secondary ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__date-secondary",
          children: dateBadge.secondary
        }) : null]
      }), hot ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
        className: "s-event-card__hot-tag",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.Flame, {
          size: 12,
          "aria-hidden": true
        }), "\u70ED\u95E8"]
      }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__hero-copy",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__hero-title",
          children: title
        }), heroSubtitle ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__hero-subtitle",
          children: heroSubtitle
        }) : null]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
      className: "s-event-card__info-row",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__info-item",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.MapPin, {
          size: 14,
          className: "s-event-card__info-icon",
          "aria-hidden": true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__info-text",
          children: location
        })]
      }), fullDate ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__info-item s-event-card__info-item--date",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.Calendar, {
          size: 14,
          className: "s-event-card__info-icon",
          "aria-hidden": true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
          className: "s-event-card__info-text",
          children: fullDate
        })]
      }) : null]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
      className: "s-event-card__footer",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__social",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_AvatarGroup__WEBPACK_IMPORTED_MODULE_1__["default"], {
          avatars: _constants_activityGuestAvatars__WEBPACK_IMPORTED_MODULE_2__.ACTIVITY_GUEST_AVATARS,
          total: attendees
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
          className: "s-event-card__team-posts",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.Users, {
            size: 13,
            "aria-hidden": true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.Text, {
            children: `${stats.teamPostCount} 条组队帖`
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_11__.View, {
        className: "s-event-card__cta",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: ["s-event-card__team-btn", isNavigating ? "s-event-card__team-btn--loading" : ""].filter(Boolean).join(" "),
          disabled: isNavigating,
          onClick: event => {
            event.stopPropagation();
            onTeamUp?.();
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(lucide_react_taro__WEBPACK_IMPORTED_MODULE_12__.Sparkles, {
            size: 15,
            "aria-hidden": true
          }), isNavigating ? "跳转中…" : "加入"]
        })
      })]
    })]
  });
};
const EventCard = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(EventCardInner);
/* harmony default export */ __webpack_exports__["default"] = (EventCard);

/***/ }),

/***/ "./src/pages/events/index.tsx":
/*!************************************!*\
  !*** ./src/pages/events/index.tsx ***!
  \************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !!../../../node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/events/index!./index.tsx */ "./node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/events/index!./src/pages/events/index.tsx");


var config = {"navigationBarTitleText":"","navigationStyle":"custom","disableScroll":true,"backgroundColor":"#000000","backgroundColorContent":"#000000","backgroundTextStyle":"light"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.createPageConfig)(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"], 'pages/events/index', {root:{cn:[]}}, config || {})
if (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"] && _node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_events_index_index_tsx__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./src/utils/eventCardDisplay.ts":
/*!***************************************!*\
  !*** ./src/utils/eventCardDisplay.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deriveEventCardStats: function() { return /* binding */ deriveEventCardStats; },
/* harmony export */   formatEventDateBadge: function() { return /* binding */ formatEventDateBadge; },
/* harmony export */   formatEventFullDate: function() { return /* binding */ formatEventFullDate; },
/* harmony export */   formatEventHeroSubtitle: function() { return /* binding */ formatEventHeroSubtitle; }
/* harmony export */ });
/* harmony import */ var _activityStatus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./activityStatus */ "./src/utils/activityStatus.ts");

function formatEventDateBadge(date) {
  const trimmed = date?.trim() ?? "";
  if (!trimmed) {
    return {
      primary: "--",
      secondary: ""
    };
  }
  const sameMonthRange = trimmed.match(/(\d{1,2})\/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (sameMonthRange) {
    return {
      primary: sameMonthRange[1],
      secondary: `/${sameMonthRange[2]}-${sameMonthRange[3]}`
    };
  }
  const slashDate = trimmed.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDate) {
    return {
      primary: slashDate[1],
      secondary: `/${slashDate[2]}`
    };
  }
  return {
    primary: trimmed.slice(0, 2),
    secondary: ""
  };
}
function formatEventFullDate(date, title) {
  const trimmed = date?.trim() ?? "";
  if (!trimmed) return "";
  const year = (0,_activityStatus__WEBPACK_IMPORTED_MODULE_0__.extractYearFromText)(title) ?? (0,_activityStatus__WEBPACK_IMPORTED_MODULE_0__.extractYearFromText)(trimmed) ?? new Date().getFullYear();
  const badge = formatEventDateBadge(trimmed);
  if (badge.secondary.includes("-")) {
    const days = badge.secondary.slice(1);
    return `${year}年${badge.primary}月${days}日`;
  }
  if (badge.secondary) {
    const day = badge.secondary.slice(1);
    return `${year}年${badge.primary}月${day}日`;
  }
  return `${year}年${trimmed}`;
}
function formatEventHeroSubtitle(title, location) {
  const year = (0,_activityStatus__WEBPACK_IMPORTED_MODULE_0__.extractYearFromText)(title);
  const locationPart = location?.split(/[·,，]/)[0]?.trim();
  if (locationPart && year) {
    return `${locationPart} ${year}`;
  }
  if (year) return String(year);
  return locationPart ?? "";
}

/** Display-only stats derived from existing card fields (no API change). */
function deriveEventCardStats(attendees) {
  const teamPostCount = Math.max(12, Math.round(attendees * 0.26));
  return {
    teamPostCount
  };
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/events/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map