(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["taro"],{

/***/ "./node_modules/@tarojs/api/dist/env.js":
/*!**********************************************!*\
  !*** ./node_modules/@tarojs/api/dist/env.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ENV_TYPE: function() { return /* binding */ ENV_TYPE; },
/* harmony export */   getEnv: function() { return /* binding */ getEnv; }
/* harmony export */ });
const ENV_TYPE = {
  ASCF: 'ASCF',
  WEAPP: 'WEAPP',
  SWAN: 'SWAN',
  ALIPAY: 'ALIPAY',
  TT: 'TT',
  QQ: 'QQ',
  JD: 'JD',
  WEB: 'WEB',
  RN: 'RN',
  HARMONY: 'HARMONY',
  QUICKAPP: 'QUICKAPP',
  HARMONYHYBRID: 'HARMONYHYBRID'
};
function getEnv() {
  if (true) {
    return ENV_TYPE.WEAPP;
  } else {}
}


/***/ }),

/***/ "./node_modules/@tarojs/api/dist/index.js":
/*!************************************************!*\
  !*** ./node_modules/@tarojs/api/dist/index.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Taro; }
/* harmony export */ });
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/next-tick.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/emitter/emitter.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env.js */ "./node_modules/@tarojs/api/dist/env.js");
/* harmony import */ var _interceptor_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interceptor/index.js */ "./node_modules/@tarojs/api/dist/interceptor/index.js");
/* harmony import */ var _interceptor_interceptors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./interceptor/interceptors.js */ "./node_modules/@tarojs/api/dist/interceptor/interceptors.js");
/* harmony import */ var _tools_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tools.js */ "./node_modules/@tarojs/api/dist/tools.js");






/* eslint-disable camelcase */
const Taro = {
  Behavior: _tools_js__WEBPACK_IMPORTED_MODULE_0__.Behavior,
  getEnv: _env_js__WEBPACK_IMPORTED_MODULE_1__.getEnv,
  ENV_TYPE: _env_js__WEBPACK_IMPORTED_MODULE_1__.ENV_TYPE,
  Link: _interceptor_index_js__WEBPACK_IMPORTED_MODULE_2__["default"],
  interceptors: _interceptor_interceptors_js__WEBPACK_IMPORTED_MODULE_3__,
  Current: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__.Current,
  getCurrentInstance: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__.getCurrentInstance,
  options: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_5__.options,
  nextTick: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.nextTick,
  eventCenter: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.eventCenter,
  Events: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__.Events,
  getInitPxTransform: _tools_js__WEBPACK_IMPORTED_MODULE_0__.getInitPxTransform,
  interceptorify: _interceptor_index_js__WEBPACK_IMPORTED_MODULE_2__.interceptorify
};
Taro.initPxTransform = (0,_tools_js__WEBPACK_IMPORTED_MODULE_0__.getInitPxTransform)(Taro);
Taro.preload = (0,_tools_js__WEBPACK_IMPORTED_MODULE_0__.getPreload)(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__.Current);
Taro.pxTransform = (0,_tools_js__WEBPACK_IMPORTED_MODULE_0__.getPxTransform)(Taro);


/***/ }),

/***/ "./node_modules/@tarojs/api/dist/interceptor/chain.js":
/*!************************************************************!*\
  !*** ./node_modules/@tarojs/api/dist/interceptor/chain.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Chain; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");

class Chain {
  constructor(requestParams, interceptors, index) {
    this.index = index || 0;
    this.requestParams = requestParams || {};
    this.interceptors = interceptors || [];
  }
  proceed(requestParams = {}) {
    this.requestParams = requestParams;
    if (this.index >= this.interceptors.length) {
      throw new Error('chain 参数错误, 请勿直接修改 request.chain');
    }
    const nextInterceptor = this._getNextInterceptor();
    const nextChain = this._getNextChain();
    const p = nextInterceptor(nextChain);
    const res = p.catch(err => Promise.reject(err));
    Object.keys(p).forEach(k => (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(p[k]) && (res[k] = p[k]));
    return res;
  }
  _getNextInterceptor() {
    return this.interceptors[this.index];
  }
  _getNextChain() {
    return new Chain(this.requestParams, this.interceptors, this.index + 1);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/api/dist/interceptor/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@tarojs/api/dist/interceptor/index.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Link; },
/* harmony export */   interceptorify: function() { return /* binding */ interceptorify; }
/* harmony export */ });
/* harmony import */ var _chain_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chain.js */ "./node_modules/@tarojs/api/dist/interceptor/chain.js");

class Link {
  constructor(interceptor) {
    this.taroInterceptor = interceptor;
    this.chain = new _chain_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
  request(requestParams) {
    const chain = this.chain;
    const taroInterceptor = this.taroInterceptor;
    chain.interceptors = chain.interceptors.filter(interceptor => interceptor !== taroInterceptor).concat(taroInterceptor);
    return chain.proceed(Object.assign({}, requestParams));
  }
  addInterceptor(interceptor) {
    this.chain.interceptors.push(interceptor);
  }
  cleanInterceptors() {
    this.chain = new _chain_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
}
function interceptorify(promisifyApi) {
  return new Link(function (chain) {
    return promisifyApi(chain.requestParams);
  });
}


/***/ }),

/***/ "./node_modules/@tarojs/api/dist/interceptor/interceptors.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@tarojs/api/dist/interceptor/interceptors.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   logInterceptor: function() { return /* binding */ logInterceptor; },
/* harmony export */   timeoutInterceptor: function() { return /* binding */ timeoutInterceptor; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");

function timeoutInterceptor(chain) {
  const requestParams = chain.requestParams;
  let p;
  const res = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      reject(new Error('网络链接超时,请稍后再试！'));
    }, requestParams && requestParams.timeout || 60000);
    p = chain.proceed(requestParams);
    p.then(res => {
      if (!timeout) return;
      clearTimeout(timeout);
      resolve(res);
    }).catch(err => {
      timeout && clearTimeout(timeout);
      reject(err);
    });
  });
  // @ts-ignore
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(p) && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(p.abort)) res.abort = p.abort;
  return res;
}
function logInterceptor(chain) {
  const requestParams = chain.requestParams;
  const {
    method,
    data,
    url
  } = requestParams;
  // eslint-disable-next-line no-console
  console.log(`http ${method || 'GET'} --> ${url} data: `, data);
  const p = chain.proceed(requestParams);
  const res = p.then(res => {
    // eslint-disable-next-line no-console
    console.log(`http <-- ${url} result:`, res);
    return res;
  });
  // @ts-ignore
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(p.abort)) res.abort = p.abort;
  return res;
}


/***/ }),

/***/ "./node_modules/@tarojs/api/dist/tools.js":
/*!************************************************!*\
  !*** ./node_modules/@tarojs/api/dist/tools.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Behavior: function() { return /* binding */ Behavior; },
/* harmony export */   getInitPxTransform: function() { return /* binding */ getInitPxTransform; },
/* harmony export */   getPreload: function() { return /* binding */ getPreload; },
/* harmony export */   getPxTransform: function() { return /* binding */ getPxTransform; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");

function Behavior(options) {
  return options;
}
function getPreload(current) {
  return function (key, val) {
    current.preloadData = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(key) ? key : {
      [key]: val
    };
  };
}
const defaultDesignWidth = 750;
const defaultDesignRatio = {
  640: 2.34 / 2,
  750: 1,
  828: 1.81 / 2
};
const defaultBaseFontSize = 20;
const defaultUnitPrecision = 5;
const defaultTargetUnit = 'rpx';
function getInitPxTransform(taro) {
  return function (config) {
    const {
      designWidth = defaultDesignWidth,
      deviceRatio = defaultDesignRatio,
      baseFontSize = defaultBaseFontSize,
      targetUnit = defaultTargetUnit,
      unitPrecision = defaultUnitPrecision
    } = config;
    taro.config = taro.config || {};
    taro.config.designWidth = designWidth;
    taro.config.deviceRatio = deviceRatio;
    taro.config.baseFontSize = baseFontSize;
    taro.config.targetUnit = targetUnit;
    taro.config.unitPrecision = unitPrecision;
  };
}
function getPxTransform(taro) {
  return function (size) {
    const config = taro.config || {};
    const baseFontSize = config.baseFontSize;
    const deviceRatio = config.deviceRatio || defaultDesignRatio;
    const designWidth = ((input = 0) => (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(config.designWidth) ? config.designWidth(input) : config.designWidth || defaultDesignWidth)(size);
    if (!(designWidth in deviceRatio)) {
      throw new Error(`deviceRatio 配置中不存在 ${designWidth} 的设置！`);
    }
    const targetUnit = config.targetUnit || defaultTargetUnit;
    const unitPrecision = config.unitPrecision || defaultUnitPrecision;
    const formatSize = ~~size;
    let rootValue = 1 / deviceRatio[designWidth];
    switch (targetUnit) {
      case 'rem':
        rootValue *= baseFontSize * 2;
        break;
      case 'px':
        rootValue *= 2;
        break;
    }
    let val = formatSize / rootValue;
    if (unitPrecision >= 0 && unitPrecision <= 100) {
      val = Number(val.toFixed(unitPrecision));
    }
    return val + targetUnit;
  };
}


/***/ }),

/***/ "./node_modules/@tarojs/plugin-framework-react/dist/runtime.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@tarojs/plugin-framework-react/dist/runtime.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createReactApp: function() { return /* binding */ createReactApp; }
/* harmony export */ });
/* unused harmony exports connectReactPage, createH5NativeComponentConfig, createNativeComponentConfig, createNativePageConfig, setReconciler, useAddToFavorites, useDidHide, useDidShow, useError, useKeyboardHeight, useLaunch, useLoad, useOptionMenuClick, usePageNotFound, usePageScroll, usePullDownRefresh, usePullIntercept, useReachBottom, useReady, useResize, useRouter, useSaveExitState, useScope, useShareAppMessage, useShareTimeline, useTabItemTap, useTitleClick, useUnhandledRejection, useUnload */
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/bom/document.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/perf.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/utils/router.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/bom/window.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/bom/raf.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/emitter/emitter.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dom/event.js");


const reactMeta = {
  PageContext: _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ,
  R: _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ
};
const HOOKS_APP_ID = 'taro-app';
function isClassComponent(R, component) {
  var _a;
  const prototype = component.prototype;
  // For React Redux
  if ((_a = component.displayName) === null || _a === void 0 ? void 0 : _a.includes('Connect')) return false;
  return (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(component.render) || !!(prototype === null || prototype === void 0 ? void 0 : prototype.isReactComponent) || prototype instanceof R.Component // compat for some others react-like library
;
}
function ensureIsArray(item) {
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(item)) {
    return item;
  } else {
    return item ? [item] : [];
  }
}
/**
 * set writable, enumerable to true
 */
function setDefaultDescriptor(obj) {
  obj.writable = true;
  obj.enumerable = true;
  return obj;
}
/**
 * 设置入口的路由参数
 * @param options 小程序传入的参数
 */
function setRouterParams(options) {
  _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = Object.assign({
    params: options === null || options === void 0 ? void 0 : options.query
  }, options);
}
const createTaroHook = lifecycle => {
  return fn => {
    const {
      R: React,
      PageContext
    } = reactMeta;
    const id = React.useContext(PageContext) || HOOKS_APP_ID;
    const instRef = React.useRef();
    // hold fn ref and keep up to date
    const fnRef = React.useRef(fn);
    if (fnRef.current !== fn) fnRef.current = fn;
    React.useLayoutEffect(() => {
      let inst = instRef.current = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getPageInstance)(id);
      let first = false;
      if (!inst) {
        first = true;
        instRef.current = Object.create(null);
        inst = instRef.current;
      }
      // callback is immutable but inner function is up to date
      const callback = (...args) => fnRef.current(...args);
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(inst[lifecycle])) {
        inst[lifecycle] = [inst[lifecycle], callback];
      } else {
        inst[lifecycle] = [...(inst[lifecycle] || []), callback];
      }
      if (first) {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.injectPageInstance)(inst, id);
      }
      return () => {
        const inst = instRef.current;
        if (!inst) return;
        const list = inst[lifecycle];
        if (list === callback) {
          inst[lifecycle] = undefined;
        } else if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(list)) {
          inst[lifecycle] = list.filter(item => item !== callback);
        }
        instRef.current = undefined;
      };
    }, []);
  };
};
/** LifeCycle */
const useDidHide = createTaroHook('componentDidHide');
const useDidShow = createTaroHook('componentDidShow');
/** App */
const useError = createTaroHook('onError');
const useUnhandledRejection = createTaroHook('onUnhandledRejection');
const useLaunch = createTaroHook('onLaunch');
const usePageNotFound = createTaroHook('onPageNotFound');
/** Page */
const useLoad = createTaroHook('onLoad');
const usePageScroll = createTaroHook('onPageScroll');
const usePullDownRefresh = createTaroHook('onPullDownRefresh');
const usePullIntercept = createTaroHook('onPullIntercept');
const useReachBottom = createTaroHook('onReachBottom');
const useResize = createTaroHook('onResize');
const useUnload = createTaroHook('onUnload');
/** Mini-Program */
const useAddToFavorites = createTaroHook('onAddToFavorites');
const useOptionMenuClick = createTaroHook('onOptionMenuClick');
const useKeyboardHeight = createTaroHook('onKeyboardHeight');
const useSaveExitState = createTaroHook('onSaveExitState');
const useShareAppMessage = createTaroHook('onShareAppMessage');
const useShareTimeline = createTaroHook('onShareTimeline');
const useTitleClick = createTaroHook('onTitleClick');
/** Router */
const useReady = createTaroHook('onReady');
const useRouter = (dynamic = false) => {
  const React = reactMeta.R;
  return dynamic ? _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router : React.useMemo(() => _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router, []);
};
const useTabItemTap = createTaroHook('onTabItemTap');
const useScope = () => undefined;
var taroHooks = /*#__PURE__*/Object.freeze({
  __proto__: null,
  useAddToFavorites: useAddToFavorites,
  useDidHide: useDidHide,
  useDidShow: useDidShow,
  useError: useError,
  useKeyboardHeight: useKeyboardHeight,
  useLaunch: useLaunch,
  useLoad: useLoad,
  useOptionMenuClick: useOptionMenuClick,
  usePageNotFound: usePageNotFound,
  usePageScroll: usePageScroll,
  usePullDownRefresh: usePullDownRefresh,
  usePullIntercept: usePullIntercept,
  useReachBottom: useReachBottom,
  useReady: useReady,
  useResize: useResize,
  useRouter: useRouter,
  useSaveExitState: useSaveExitState,
  useScope: useScope,
  useShareAppMessage: useShareAppMessage,
  useShareTimeline: useShareTimeline,
  useTabItemTap: useTabItemTap,
  useTitleClick: useTitleClick,
  useUnhandledRejection: useUnhandledRejection,
  useUnload: useUnload
});
let h$1;
let ReactDOM$1;
let Fragment;
const pageKeyId = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__.incrementId)();
function setReconciler(ReactDOM) {
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('getLifecycle', function (instance, lifecycle) {
    lifecycle = lifecycle.replace(/^on(Show|Hide)$/, 'componentDid$1');
    return instance[lifecycle];
  });
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('modifyMpEvent', function (event) {
    // Note: ohos 上事件没有设置 type 类型 setter 方法导致报错
    Object.defineProperty(event, 'type', {
      value: event.type.replace(/-/g, '')
    });
  });
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('batchedEventUpdates', function (cb) {
    ReactDOM === null || ReactDOM === void 0 ? void 0 : ReactDOM.unstable_batchedUpdates(cb);
  });
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('mergePageInstance', function (prev, next) {
    if (!prev || !next) return;
    // 子组件使用 lifecycle hooks 注册了生命周期后，会存在 prev，里面是注册的生命周期回调。
    // prev 使用 Object.create(null) 创建，H5 的 fast-refresh 可能也会导致存在 prev，要排除这些意外产生的 prev
    if ('constructor' in prev) return;
    Object.keys(prev).forEach(item => {
      const prevList = prev[item];
      const nextList = ensureIsArray(next[item]);
      next[item] = nextList.concat(prevList);
    });
  });
  if (false) {}
}
function connectReactPage(R, id) {
  return Page => {
    // eslint-disable-next-line dot-notation
    const isReactComponent = isClassComponent(R, Page);
    const inject = node => node && (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.injectPageInstance)(node, id);
    const refs = isReactComponent ? {
      ref: inject
    } : {
      forwardedRef: inject,
      // 兼容 react-redux 7.20.1+
      reactReduxForwardedRef: inject
    };
    if (reactMeta.PageContext === _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ) {
      reactMeta.PageContext = R.createContext('');
    }
    return class PageWrapper extends R.Component {
      constructor() {
        super(...arguments);
        this.state = {
          hasError: false
        };
      }
      static getDerivedStateFromError(error) {
        var _a, _b;
        (_b = (_a = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app) === null || _a === void 0 ? void 0 : _a.onError) === null || _b === void 0 ? void 0 : _b.call(_a, error.message + error.stack);
        return {
          hasError: true
        };
      }
      // React 16 uncaught error 会导致整个应用 crash，
      // 目前把错误缩小到页面
      componentDidCatch(error, info) {
        if (true) {
          console.warn(error);
          console.error(info.componentStack);
        }
      }
      render() {
        const children = this.state.hasError ? [] : h$1(reactMeta.PageContext.Provider, {
          value: id
        }, h$1(Page, Object.assign(Object.assign({}, this.props), refs)));
        if (false) {} else {
          return h$1('root', {
            id
          }, children);
        }
      }
    };
  };
}
/**
 * 桥接小程序 App 构造器和 React 渲染流程
 * @param App 用户编写的入口组件
 * @param react 框架
 * @param dom 框架渲染器
 * @param config 入口组件配置 app.config.js 的内容
 * @returns 传递给 App 构造器的对象 obj ：App(obj)
 */
function createReactApp(App, react, dom, config) {
  if (true) {
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.ensure)(!!dom, '构建 React/Preact 项目请把 process.env.FRAMEWORK 设置为 \'react\'/\'preact\' ');
  }
  reactMeta.R = react;
  h$1 = react.createElement;
  ReactDOM$1 = dom;
  Fragment = react.Fragment;
  const appInstanceRef = react.createRef();
  const isReactComponent = isClassComponent(react, App);
  let appWrapper;
  let appWrapperResolver;
  const appWrapperPromise = new Promise(resolve => appWrapperResolver = resolve);
  setReconciler(ReactDOM$1);
  function getAppInstance() {
    return appInstanceRef.current;
  }
  function waitAppWrapper(cb) {
    /**
     * 当同个事件触发多次时，waitAppWrapper 会出现同步和异步任务的执行顺序问题，
     * 导致某些场景下 onShow 会优于 onLaunch 执行
     */
    appWrapperPromise.then(() => cb());
    // appWrapper ? cb() : appWrapperPromise.then(() => cb())
  }
  function renderReactRoot() {
    var _a, _b;
    const appId = (config === null || config === void 0 ? void 0 : config.appId) || 'app';
    let container = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById(appId);
    if (container == null) {
      const appContainer = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.CONTAINER);
      container = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.createElement(appId);
      container.id = appId;
      appContainer === null || appContainer === void 0 ? void 0 : appContainer.appendChild(container);
    }
    if ((react.version || '').startsWith('18')) {
      const root = ReactDOM$1.createRoot(container);
      (_a = root.render) === null || _a === void 0 ? void 0 : _a.call(root, h$1(AppWrapper));
    } else {
      // eslint-disable-next-line react/no-deprecated
      (_b = ReactDOM$1.render) === null || _b === void 0 ? void 0 : _b.call(ReactDOM$1, h$1(AppWrapper), container);
    }
  }
  class AppWrapper extends react.Component {
    constructor(props) {
      super(props);
      // run createElement() inside the render function to make sure that owner is right
      this.pages = [];
      this.elements = [];
      appWrapper = this;
      appWrapperResolver(this);
    }
    mount(pageComponent, id, cb) {
      const pageWrapper = connectReactPage(react, id)(pageComponent);
      const key = id + pageKeyId();
      const page = () => h$1(pageWrapper, {
        key,
        tid: id
      });
      this.pages.push(page);
      this.forceUpdate((...args) => {
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__.perf.stop(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.PAGE_INIT);
        return cb(...args);
      });
    }
    unmount(id, cb) {
      const elements = this.elements;
      const idx = elements.findIndex(item => item.props.tid === id);
      elements.splice(idx, 1);
      this.forceUpdate(cb);
    }
    render() {
      const {
        pages,
        elements
      } = this;
      while (pages.length > 0) {
        const page = pages.pop();
        elements.push(page());
      }
      let props = null;
      if (isReactComponent) {
        props = {
          ref: appInstanceRef
        };
      }
      return h$1(App, props,  false ? 0 : elements.slice());
    }
  }
  if (true) {
    renderReactRoot();
  }
  const [ONLAUNCH, ONSHOW, ONHIDE] = _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.call('getMiniLifecycleImpl').app;
  const appObj = Object.create({
    render(cb) {
      appWrapper.forceUpdate(cb);
    },
    mount(component, id, cb) {
      if (appWrapper) {
        appWrapper.mount(component, id, cb);
      } else {
        appWrapperPromise.then(appWrapper => appWrapper.mount(component, id, cb));
      }
    },
    unmount(id, cb) {
      if (appWrapper) {
        appWrapper.unmount(id, cb);
      } else {
        appWrapperPromise.then(appWrapper => appWrapper.unmount(id, cb));
      }
    }
  }, {
    config: setDefaultDescriptor({
      configurable: true,
      value: config
    }),
    [ONLAUNCH]: setDefaultDescriptor({
      value(options) {
        setRouterParams(options);
        if (false) {}
        const onLaunch = () => {
          var _a;
          // 用户编写的入口组件实例
          const app = getAppInstance();
          this.$app = app;
          if (app) {
            // 把 App Class 上挂载的额外属性同步到全局 app 对象中
            if (app.taroGlobalData) {
              const globalData = app.taroGlobalData;
              const keys = Object.keys(globalData);
              const descriptors = Object.getOwnPropertyDescriptors(globalData);
              keys.forEach(key => {
                Object.defineProperty(this, key, {
                  configurable: true,
                  enumerable: true,
                  get() {
                    return globalData[key];
                  },
                  set(value) {
                    globalData[key] = value;
                  }
                });
              });
              Object.defineProperties(this, descriptors);
            }
            (_a = app.onLaunch) === null || _a === void 0 ? void 0 : _a.call(app, options);
          }
          triggerAppHook('onLaunch', options);
        };
        waitAppWrapper(onLaunch);
      }
    }),
    [ONSHOW]: setDefaultDescriptor({
      value(options) {
        setRouterParams(options);
        const onShow = () => {
          var _a;
          /**
          * trigger lifecycle
          */
          const app = getAppInstance();
          // class component, componentDidShow
          (_a = app === null || app === void 0 ? void 0 : app.componentDidShow) === null || _a === void 0 ? void 0 : _a.call(app, options);
          // functional component, useDidShow
          triggerAppHook('onShow', options);
        };
        waitAppWrapper(onShow);
      }
    }),
    [ONHIDE]: setDefaultDescriptor({
      value() {
        const onHide = () => {
          var _a;
          /**
           * trigger lifecycle
           */
          const app = getAppInstance();
          // class component, componentDidHide
          (_a = app === null || app === void 0 ? void 0 : app.componentDidHide) === null || _a === void 0 ? void 0 : _a.call(app);
          // functional component, useDidHide
          triggerAppHook('onHide');
        };
        waitAppWrapper(onHide);
      }
    }),
    onError: setDefaultDescriptor({
      value(error) {
        const onError = () => {
          var _a;
          const app = getAppInstance();
          (_a = app === null || app === void 0 ? void 0 : app.onError) === null || _a === void 0 ? void 0 : _a.call(app, error);
          triggerAppHook('onError', error);
          if ( true && (error === null || error === void 0 ? void 0 : error.includes('Minified React error'))) {
            console.warn('React 出现报错，请打开编译配置 mini.debugReact 查看报错详情：https://docs.taro.zone/docs/config-detail#minidebugreact');
          }
        };
        waitAppWrapper(onError);
      }
    }),
    onUnhandledRejection: setDefaultDescriptor({
      value(res) {
        const onUnhandledRejection = () => {
          var _a;
          const app = getAppInstance();
          (_a = app === null || app === void 0 ? void 0 : app.onUnhandledRejection) === null || _a === void 0 ? void 0 : _a.call(app, res);
          triggerAppHook('onUnhandledRejection', res);
        };
        waitAppWrapper(onUnhandledRejection);
      }
    }),
    onPageNotFound: setDefaultDescriptor({
      value(res) {
        const onPageNotFound = () => {
          var _a;
          const app = getAppInstance();
          (_a = app === null || app === void 0 ? void 0 : app.onPageNotFound) === null || _a === void 0 ? void 0 : _a.call(app, res);
          triggerAppHook('onPageNotFound', res);
        };
        waitAppWrapper(onPageNotFound);
      }
    })
  });
  function triggerAppHook(lifecycle, ...option) {
    const instance = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getPageInstance)(HOOKS_APP_ID);
    if (instance) {
      const app = getAppInstance();
      const func = _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.call('getLifecycle', instance, lifecycle);
      if (Array.isArray(func)) {
        func.forEach(cb => cb.apply(app, option));
      }
    }
  }
  _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app = appObj;
  return appObj;
}
const getNativeCompId = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_4__.incrementId)();
let h;
let ReactDOM;
let nativeComponentApp;
function initNativeComponentEntry(params) {
  var _a;
  const {
    R,
    ReactDOM,
    cb,
    isDefaultEntryDom = true
  } = params;
  class NativeComponentWrapper extends R.Component {
    constructor() {
      super(...arguments);
      this.root = R.createRef();
      this.ctx = this.props.getCtx();
    }
    componentDidMount() {
      this.ctx.component = this;
      const rootElement = this.root.current;
      rootElement.ctx = this.ctx;
      rootElement.performUpdate(true);
    }
    render() {
      return h('root', {
        ref: this.root,
        id: this.props.compId
      }, this.props.renderComponent(this.ctx));
    }
  }
  class Entry extends R.Component {
    constructor() {
      super(...arguments);
      this.state = {
        components: []
      };
    }
    componentDidMount() {
      if (isDefaultEntryDom) {
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app = this;
      } else {
        nativeComponentApp = this;
      }
      cb && cb();
    }
    mount(Component, compId, getCtx, cb) {
      const isReactComponent = isClassComponent(R, Component);
      const inject = node => node && (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.injectPageInstance)(node, compId);
      const refs = isReactComponent ? {
        ref: inject
      } : {
        forwardedRef: inject,
        reactReduxForwardedRef: inject
      };
      if (reactMeta.PageContext === _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ) {
        reactMeta.PageContext = R.createContext('');
      }
      const item = {
        compId,
        element: h(NativeComponentWrapper, {
          key: compId,
          compId,
          getCtx,
          renderComponent(ctx) {
            return h(reactMeta.PageContext.Provider, {
              value: compId
            }, h(Component, Object.assign(Object.assign(Object.assign({}, (ctx.data || (ctx.data = {})).props), refs), {
              $scope: ctx
            })));
          }
        })
      };
      this.setState({
        components: [...this.state.components, item]
      }, () => cb && cb());
    }
    unmount(compId, cb) {
      const components = this.state.components;
      const index = components.findIndex(item => item.compId === compId);
      const next = [...components.slice(0, index), ...components.slice(index + 1)];
      this.setState({
        components: next
      }, () => {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.removePageInstance)(compId);
        cb && cb();
      });
    }
    render() {
      const components = this.state.components;
      return components.map(({
        element
      }) => element);
    }
  }
  setReconciler(ReactDOM);
  let app = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById('app');
  if (!isDefaultEntryDom && !nativeComponentApp) {
    // create
    const nativeApp = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.createElement('nativeComponent');
    // insert
    (_a = app === null || app === void 0 ? void 0 : app.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(nativeApp);
    app = nativeApp;
  }
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(h(Entry, {}), app);
}
function createNativePageConfig(Component, pageName, data, react, reactDOM, pageConfig) {
  reactMeta.R = react;
  h = react.createElement;
  ReactDOM = reactDOM;
  setReconciler(ReactDOM);
  const [ONLOAD, ONUNLOAD, ONREADY, ONSHOW, ONHIDE, LIFECYCLES, SIDE_EFFECT_LIFECYCLES] = _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.call('getMiniLifecycleImpl').page;
  let unmounting = false;
  let prepareMountList = [];
  let pageElement = null;
  let loadResolver;
  let hasLoaded;
  const id = pageName !== null && pageName !== void 0 ? pageName : `taro_page_${getNativeCompId()}`;
  function setCurrentRouter(page) {
    const router = page.route || page.__route__ || page.$taroPath;
    _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = {
      params: page.$taroParams,
      path: (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_9__.addLeadingSlash)(router),
      $taroPath: page.$taroPath,
      onReady: (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnReadyEventKey)(id),
      onShow: (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnShowEventKey)(id),
      onHide: (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnHideEventKey)(id)
    };
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isUndefined)(page.exitState)) {
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router.exitState = page.exitState;
    }
  }
  const pageObj = {
    options: pageConfig,
    [ONLOAD](options = {}, cb) {
      hasLoaded = new Promise(resolve => {
        loadResolver = resolve;
      });
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = this;
      this.config = pageConfig || {};
      // this.$taroPath 是页面唯一标识
      const uniqueOptions = Object.assign({}, options, {
        $taroTimestamp: Date.now()
      });
      const $taroPath = this.$taroPath = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getPath)(id, uniqueOptions);
      // this.$taroParams 作为暴露给开发者的页面参数对象，可以被随意修改
      if (this.$taroParams == null) {
        this.$taroParams = uniqueOptions;
      }
      setCurrentRouter(this);
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_10__.taroWindowProvider.trigger(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.CONTEXT_ACTIONS.INIT, $taroPath);
      const mountCallback = () => {
        pageElement = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById($taroPath);
        (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.ensure)(pageElement !== null, '没有找到页面实例。');
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)($taroPath, ONLOAD, this.$taroParams);
        loadResolver();
        pageElement.ctx = this;
        pageElement.performUpdate(true, cb);
      };
      const mount = () => {
        if (!_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app) {
          initNativeComponentEntry({
            R: react,
            ReactDOM,
            cb: () => {
              _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app.mount(Component, $taroPath, () => this, mountCallback);
            }
          });
        } else {
          _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app.mount(Component, $taroPath, () => this, mountCallback);
        }
      };
      if (unmounting) {
        prepareMountList.push(mount);
      } else {
        mount();
      }
    },
    [ONUNLOAD]() {
      const $taroPath = this.$taroPath;
      // 销毁当前页面的上下文信息
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_10__.taroWindowProvider.trigger(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.CONTEXT_ACTIONS.DESTROY, $taroPath);
      // 触发onUnload生命周期
      (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)($taroPath, ONUNLOAD);
      resetCurrent();
      unmounting = true;
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app.unmount($taroPath, () => {
        unmounting = false;
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.removePageInstance)($taroPath);
        if (pageElement) {
          pageElement.ctx = null;
          pageElement = null;
        }
        if (prepareMountList.length) {
          prepareMountList.forEach(fn => fn());
          prepareMountList = [];
        }
      });
    },
    [ONREADY]() {
      hasLoaded.then(() => {
        // 触发生命周期
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.$taroPath, _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.ON_READY);
        // 通过事件触发子组件的生命周期
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_11__.raf)(() => _tarojs_runtime__WEBPACK_IMPORTED_MODULE_12__.eventCenter.trigger((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnReadyEventKey)(id)));
        this.onReady.called = true;
      });
    },
    [ONSHOW](options = {}) {
      hasLoaded.then(() => {
        // 设置 Current 的 page 和 router
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = this;
        setCurrentRouter(this);
        // 恢复上下文信息
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_10__.taroWindowProvider.trigger(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.CONTEXT_ACTIONS.RECOVER, this.$taroPath);
        // 触发生命周期
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.$taroPath, _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.ON_SHOW, options);
        // 通过事件触发子组件的生命周期
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_11__.raf)(() => _tarojs_runtime__WEBPACK_IMPORTED_MODULE_12__.eventCenter.trigger((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnShowEventKey)(id)));
      });
    },
    [ONHIDE]() {
      // 缓存当前页面上下文信息
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_10__.taroWindowProvider.trigger(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.CONTEXT_ACTIONS.RESTORE, this.$taroPath);
      // 设置 Current 的 page 和 router
      if (_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page === this) {
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = null;
        _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = null;
      }
      // 触发生命周期
      (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.$taroPath, _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.ON_HIDE);
      // 通过事件触发子组件的生命周期
      _tarojs_runtime__WEBPACK_IMPORTED_MODULE_12__.eventCenter.trigger((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getOnHideEventKey)(id));
    }
  };
  function resetCurrent() {
    // 小程序插件页面卸载之后返回到宿主页面时，需重置Current页面和路由。否则引发插件组件二次加载异常 fix:#11991
    _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = null;
    _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = null;
  }
  LIFECYCLES.forEach(lifecycle => {
    pageObj[lifecycle] = function () {
      return (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.$taroPath, lifecycle, ...arguments);
    };
  });
  // onShareAppMessage 和 onShareTimeline 一样，会影响小程序右上方按钮的选项，因此不能默认注册。
  SIDE_EFFECT_LIFECYCLES.forEach(lifecycle => {
    var _a;
    if (Component[lifecycle] || ((_a = Component.prototype) === null || _a === void 0 ? void 0 : _a[lifecycle]) || Component[lifecycle.replace(/^on/, 'enable')]) {
      pageObj[lifecycle] = function (...args) {
        var _a;
        const target = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.target;
        if (target === null || target === void 0 ? void 0 : target.id) {
          const id = target.id;
          const element = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById(id);
          if (element) {
            target.dataset = element.dataset;
          }
        }
        return (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.$taroPath, lifecycle, ...args);
      };
    }
  });
  pageObj.eh = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_13__.eventHandler;
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isUndefined)(data)) {
    pageObj.data = data;
  }
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.call('modifyPageObject', pageObj);
  return pageObj;
}
function createH5NativeComponentConfig(Component, react, reactDOM) {
  reactMeta.R = react;
  h = react.createElement;
  ReactDOM = reactDOM;
  setReconciler(ReactDOM);
  return Component;
}
function createNativeComponentConfig(Component, react, reactDOM, componentConfig) {
  var _a, _b;
  reactMeta.R = react;
  h = react.createElement;
  ReactDOM = reactDOM;
  setReconciler(ReactDOM);
  const {
    isNewBlended
  } = componentConfig;
  const componentObj = {
    options: componentConfig,
    properties: {
      props: {
        type: null,
        value: null,
        observer(_newVal, oldVal) {
          var _a, _b, _c, _d;
          if (false) {}
          oldVal && ((_d = this.component) === null || _d === void 0 ? void 0 : _d.forceUpdate());
        }
      }
    },
    created() {
      var _a, _b;
      if (false) {}
      const app = isNewBlended ? nativeComponentApp : _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app;
      if (!app) {
        initNativeComponentEntry({
          R: react,
          ReactDOM,
          isDefaultEntryDom: !isNewBlended
        });
      }
    },
    attached() {
      const compId = this.compId = getNativeCompId();
      setCurrent(compId);
      this.config = componentConfig;
      const app = isNewBlended ? nativeComponentApp : _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app;
      app.mount(Component, compId, () => this, () => {
        const instance = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.getPageInstance)(compId);
        if (instance && instance.node) {
          const el = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById(instance.node.uid);
          if (el) {
            el.ctx = this;
          }
        }
      });
    },
    ready() {
      (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onReady');
    },
    detached() {
      resetCurrent();
      const app = isNewBlended ? nativeComponentApp : _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.app;
      app.unmount(this.compId);
    },
    pageLifetimes: {
      show(options) {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onShow', options);
      },
      hide() {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onHide');
      }
    },
    methods: {
      eh: _tarojs_runtime__WEBPACK_IMPORTED_MODULE_13__.eventHandler,
      onLoad(options) {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onLoad', options);
      },
      onUnload() {
        (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onUnload');
      }
    }
  };
  function resetCurrent() {
    // 小程序插件页面卸载之后返回到宿主页面时，需重置Current页面和路由。否则引发插件组件二次加载异常 fix:#11991
    _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = null;
    _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = null;
  }
  // onShareAppMessage 和 onShareTimeline 一样，会影响小程序右上方按钮的选项，因此不能默认注册。
  if (Component.onShareAppMessage || ((_a = Component.prototype) === null || _a === void 0 ? void 0 : _a.onShareAppMessage) || Component.enableShareAppMessage) {
    componentObj.methods.onShareAppMessage = function (options) {
      const target = options === null || options === void 0 ? void 0 : options.target;
      if (target) {
        const id = target.id;
        const element = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_6__.taroDocumentProvider.getElementById(id);
        if (element) {
          target.dataset = element.dataset;
        }
      }
      return (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onShareAppMessage', options);
    };
  }
  if (Component.onShareTimeline || ((_b = Component.prototype) === null || _b === void 0 ? void 0 : _b.onShareTimeline) || Component.enableShareTimeline) {
    componentObj.methods.onShareTimeline = function () {
      return (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.safeExecute)(this.compId, 'onShareTimeline');
    };
  }
  if (false) {}
  return componentObj;
}
function setCurrent(compId) {
  if (!getCurrentPages || typeof getCurrentPages !== 'function') return;
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page === currentPage) return;
  _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.page = currentPage;
  const route = currentPage.route || currentPage.__route__;
  const router = {
    params: currentPage.options || {},
    path: (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_9__.addLeadingSlash)(route),
    $taroPath: compId,
    onReady: '',
    onHide: '',
    onShow: ''
  };
  _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.Current.router = router;
  if (!currentPage.options) {
    // 例如在微信小程序中，页面 options 的设置时机比组件 attached 慢
    Object.defineProperty(currentPage, 'options', {
      enumerable: true,
      configurable: true,
      get() {
        return this._optionsValue;
      },
      set(value) {
        router.params = value;
        this._optionsValue = value;
      }
    });
  }
}
_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('initNativeApi', function (taro) {
  for (const hook in taroHooks) {
    taro[hook] = taroHooks[hook];
  }
});
if (false) {}


/***/ }),

/***/ "./node_modules/@tarojs/plugin-html/dist/runtime.js":
/*!**********************************************************!*\
  !*** ./node_modules/@tarojs/plugin-html/dist/runtime.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");


function genAttrMapFnFromDir(dir) {
  const fn = function (key, value) {
    const lowerKey = key.toLowerCase();
    if (lowerKey in dir) {
      const res = dir[lowerKey];
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(res)) {
        key = res;
      } else {
        key = res[0];
        value = res[1][value] || value;
      }
    }
    return [key, value];
  };
  return fn;
}
const inlineElements = new Set(["i", "abbr", "select", "acronym", "small", "bdi", "kbd", "strong", "big", "sub", "sup", "br", "mark", "meter", "template", "cite", "object", "time", "code", "output", "u", "data", "picture", "tt", "datalist", "var", "dfn", "del", "q", "em", "s", "embed", "samp", "b"]);
const blockElements = new Set(["body", "svg", "address", "fieldset", "li", "span", "article", "figcaption", "main", "aside", "figure", "nav", "blockquote", "footer", "ol", "details", "p", "dialog", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "dd", "header", "section", "div", "hgroup", "table", "dl", "hr", "ul", "dt", "view", "view-block"]);
const specialElements = new Map([['slot', 'slot'], ['form', 'form'], ['iframe', 'web-view'], ['img', 'image'], ['audio', 'audio'], ['video', 'video'], ['canvas', 'canvas'], ['a', {
  mapName(props) {
    if (props.as && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(props.as)) return props.as.toLowerCase();
    return !props.href || /^javascript/.test(props.href) ? 'view' : 'navigator';
  },
  mapNameCondition: ['href'],
  mapAttr: genAttrMapFnFromDir({
    href: 'url',
    target: ['openType', {
      _blank: 'navigate',
      _self: 'redirect'
    }]
  })
}], ['input', {
  mapName(props) {
    if (props.type === 'checkbox') {
      return 'checkbox';
    } else if (props.type === 'radio') {
      return 'radio';
    }
    return 'input';
  },
  mapNameCondition: ['type'],
  mapAttr(key, value, props) {
    const htmlKey = key.toLowerCase();
    if (htmlKey === 'autofocus') {
      key = 'focus';
    } else if (htmlKey === 'readonly') {
      if (props.disabled === true) {
        value = true;
      }
      key = 'disabled';
    } else if (htmlKey === 'type') {
      if (value === 'password') {
        key = 'password';
        value = true;
      } else if (value === 'tel') {
        value = 'number';
      }
    } else if (htmlKey === 'maxlength') {
      key = 'maxlength';
    }
    return [key, value];
  }
}], ['label', {
  mapName: 'label',
  mapAttr: genAttrMapFnFromDir({
    htmlfor: 'for'
  })
}], ['textarea', {
  mapName: 'textarea',
  mapAttr: genAttrMapFnFromDir({
    autofocus: 'focus',
    readonly: 'disabled',
    maxlength: 'maxlength'
  })
}], ['progress', {
  mapName: 'progress',
  mapAttr(key, value, props) {
    if (key === 'value') {
      const max = props.max || 1;
      key = 'percent';
      value = Math.round(value / max * 100);
    }
    return [key, value];
  }
}], ['button', {
  mapName: 'button',
  mapAttr(key, value) {
    if (key === 'type' && (value === 'submit' || value === 'reset')) {
      key = 'formType';
    }
    return [key, value];
  }
}]]);
function isHtmlTags(nodeName) {
  if (inlineElements.has(nodeName) || blockElements.has(nodeName) || specialElements.has(nodeName)) {
    return true;
  }
  return false;
}
function getMappedType(nodeName, rawProps, node) {
  if (inlineElements.has(nodeName)) {
    return 'text';
  } else if (specialElements.has(nodeName)) {
    const mapping = specialElements.get(nodeName);
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(mapping)) {
      return mapping;
    }
    const {
      mapName
    } = mapping;
    return (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(mapName) ? mapName(rawProps) : mapName;
  } else {
    // fix #15326
    if (false) {}
    if (node) {
      const {
        props
      } = node;
      for (const prop in props) {
        const propInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(prop);
        if (propInCamelCase === 'catchMove' && props[prop] !== false) {
          return 'catch-view';
        }
      }
    }
    if (!node) {
      return 'view';
    }
    if (node.isOnlyClickBinded() && !(0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(node)) {
      return 'click-view';
    } else if (node.isAnyEventBinded()) {
      return 'view';
    } else if ((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(node)) {
      return 'static-view';
    } else {
      return 'pure-view';
    }
  }
}
function getAttrMapFn(nodeName) {
  const mapping = specialElements.get(nodeName);
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(mapping)) {
    return mapping === null || mapping === void 0 ? void 0 : mapping.mapAttr;
  }
}
function getMapNameByCondition(nodeName, attr, props) {
  const mapping = specialElements.get(nodeName);
  if (!mapping || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(mapping)) return;
  const {
    mapName,
    mapNameCondition
  } = mapping;
  if (!mapNameCondition) return;
  if (mapNameCondition.indexOf(attr) > -1 && !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(mapName)) {
    return mapName(props);
  }
}
function mapNameByContion(nodeName, key, element, componentsAlias) {
  const mapName = getMapNameByCondition(nodeName, key, element.props);
  if (mapName) {
    const mapNameAlias = componentsAlias[mapName]._num;
    element.enqueueUpdate({
      path: `${element._path}.${"nn" /* Shortcuts.NodeName */}`,
      value: mapNameAlias
    });
  }
}
function ensureHtmlClass(tagName, className = '') {
  const classList = className.split(' ');
  const htmlClass = `h5-${tagName}`;
  if (classList.indexOf(htmlClass) === -1) {
    classList.unshift(htmlClass);
  }
  return classList.join(' ');
}
function ensureRect(props, style = '') {
  let cssText = style;
  const {
    width,
    height
  } = props;
  if (width) {
    cssText = `width: ${width};${cssText}`;
  }
  if (height) {
    cssText = `height: ${height};${cssText}`;
  }
  return cssText;
}
function defineMappedProp(obj, propName, mapName) {
  Object.defineProperty(obj, propName, {
    enumerable: true,
    configurable: true,
    get() {
      return obj[mapName];
    },
    set(val) {
      obj[mapName] = val;
    }
  });
}
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifyHydrateData', (data, node) => {
  const nodeName = data["nn" /* Shortcuts.NodeName */];
  if (!isHtmlTags(nodeName)) return;
   true && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.warn)(data["nn" /* Shortcuts.NodeName */] === 'select', '请使用 Picker 组件代替 <select>');
  // map nodeName
  data["nn" /* Shortcuts.NodeName */] = getMappedType(nodeName, data, node);
  // map attr Key/Value
  const attrMapFn = getAttrMapFn(nodeName);
  if (attrMapFn) {
    for (const key in data) {
      const value = data[key];
      const [mapKey, mapValue] = attrMapFn(key, value, data);
      if (key !== mapKey) {
        delete data[key];
        data[mapKey] = mapValue;
      } else if (value !== mapValue) {
        data[key] = mapValue;
      }
    }
  }
  if (nodeName === 'br') {
    data["cn" /* Shortcuts.Childnodes */] = [{
      ["nn" /* Shortcuts.NodeName */]: '#text',
      v: '\n'
    }];
  }
  data["cl" /* Shortcuts.Class */] = ensureHtmlClass(nodeName, data["cl" /* Shortcuts.Class */]);
  data["st" /* Shortcuts.Style */] = ensureRect(data, data["st" /* Shortcuts.Style */]);
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifySetAttrPayload', (element, key, payload, componentsAlias) => {
  const {
    nodeName,
    _path,
    props
  } = element;
  if (!isHtmlTags(nodeName)) return;
  // map nodeName
  mapNameByContion(nodeName, key, element, componentsAlias);
  const mapName = getMappedType(nodeName, props);
  const alias = componentsAlias[mapName];
  // map attr Key/Value
  const attrMapFn = getAttrMapFn(nodeName);
  if (attrMapFn) {
    const value = payload.value;
    const [mapKey, mapValue] = attrMapFn(key, value, props);
    payload.path = `${_path}.${alias[mapKey] || mapKey}`;
    payload.value = mapValue;
  } else if (alias[key] && alias[key] !== key) {
    payload.path = `${_path}.${(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(alias[key])}`;
  }
  if (key === "cl" /* Shortcuts.Class */) {
    payload.value = ensureHtmlClass(nodeName, payload.value);
  } else if (key === "st" /* Shortcuts.Style */ || key === 'width' || key === 'height') {
    payload.path = `${_path}.${"st" /* Shortcuts.Style */}`;
    payload.value = ensureRect(props, element.style.cssText);
  }
  if (blockElements.has(element.nodeName) && "weapp" !== 'swan') {
    const viewAlias = componentsAlias.view._num;
    const staticViewAlias = componentsAlias['static-view']._num;
    const catchViewAlias = componentsAlias['catch-view']._num;
    const clickViewAlias = componentsAlias['click-view']._num;
    const qualifiedNameInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(key);
    const dataPath = `${_path}.${"nn" /* Shortcuts.NodeName */}`;
    if (qualifiedNameInCamelCase === 'catchMove') {
      // catchMove = true: catch-view
      // catchMove = false: view or click-view or static-view
      element.enqueueUpdate({
        path: dataPath,
        value: payload.value ? catchViewAlias : element.isOnlyClickBinded() && !(0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element) ? clickViewAlias : element.isAnyEventBinded() ? viewAlias : staticViewAlias
      });
    } else if ((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element) && !element.isAnyEventBinded()) {
      // pure-view => static-view
      // static-view => static-view 因为没有办法分辨之前是不是 pure，所以就算之前是 static 也需要 setData
      element.enqueueUpdate({
        path: dataPath,
        value: staticViewAlias
      });
    }
  }
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifyRmAttrPayload', (element, key, payload, componentsAlias) => {
  const {
    nodeName,
    _path,
    props
  } = element;
  if (!isHtmlTags(nodeName)) return;
  // map nodeName
  mapNameByContion(nodeName, key, element, componentsAlias);
  const mapName = getMappedType(nodeName, props);
  const alias = componentsAlias[mapName];
  // map attr Key/Value
  const attrMapFn = getAttrMapFn(nodeName);
  if (attrMapFn) {
    const value = payload[key];
    const [mapKey] = attrMapFn(key, value, props);
    payload.path = `${_path}.${alias[mapKey] || mapKey}`;
  } else if (alias[key] && alias[key] !== key) {
    payload.path = `${_path}.${(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(alias[key])}`;
  }
  if (key === "cl" /* Shortcuts.Class */) {
    payload.value = ensureHtmlClass(nodeName, payload.value);
  } else if (key === "st" /* Shortcuts.Style */ || key === 'width' || key === 'height') {
    payload.path = `${_path}.${"st" /* Shortcuts.Style */}`;
    payload.value = ensureRect(props, element.style.cssText);
  }
  if (blockElements.has(element.nodeName) && "weapp" !== 'swan') {
    const viewAlias = componentsAlias.view._num;
    const staticViewAlias = componentsAlias['static-view']._num;
    const pureViewAlias = componentsAlias['pure-view']._num;
    const clickViewAlias = componentsAlias['click-view']._num;
    const qualifiedNameInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(key);
    const dataPath = `${_path}.${"nn" /* Shortcuts.NodeName */}`;
    if (qualifiedNameInCamelCase === 'catchMove') {
      // catch-view => view or click-view or static-view or pure-view
      element.enqueueUpdate({
        path: dataPath,
        value: element.isOnlyClickBinded() && !(0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element) ? clickViewAlias : element.isAnyEventBinded() ? viewAlias : (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element) ? staticViewAlias : pureViewAlias
      });
    } else if (!(0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element)) {
      // static-view => pure-view
      // pure-view => pure-view 因为没有办法分辨之前是不是 pure，所以就算之前是 pure 也需要 setData
      element.enqueueUpdate({
        path: dataPath,
        value: pureViewAlias
      });
    }
  }
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('onAddEvent', (type, _handler, _options, node) => {
  node = node;
  if (!isHtmlTags(node.nodeName)) return;
  if (type === 'click') {
    defineMappedProp(node.__handlers, type, 'tap');
  } else if (node.nodeName === 'input') {
    if (type === 'change') {
      if (node.props.type === 'checkbox' || node.props.type === 'radio') {
        defineMappedProp(node.__handlers, type, 'tap');
      } else {
        defineMappedProp(node.__handlers, type, 'input');
      }
    } else if (type === 'keypress') {
      defineMappedProp(node.__handlers, type, 'confirm');
    }
  }
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifyTaroEvent', (event, element) => {
  const {
    nodeName,
    props
  } = element;
  if (nodeName === 'input' && event.type === 'tap') {
    if (props.type === 'checkbox') {
      props.checked = !props.checked;
    } else if (props.type === 'radio' && !props.checked) {
      props.checked = true;
    }
    if (event.mpEvent) {
      const {
        currentTarget,
        target
      } = event.mpEvent;
      currentTarget.checked = props.checked;
      if (target.id === currentTarget.id) {
        target.checked = props.checked;
      }
    }
  }
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifyAddEventListener', (element, sideEffect, getComponentsAlias) => {
  // 如果是从没有事件绑定到有事件绑定，且是 block 元素，则转换为 view
  if (blockElements.has(element.nodeName) && sideEffect !== false && !element.isAnyEventBinded()) {
    const componentsAlias = getComponentsAlias();
    const alias = componentsAlias.view._num;
    element.enqueueUpdate({
      path: `${element._path}.${"nn" /* Shortcuts.NodeName */}`,
      value: alias
    });
  }
});
_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.tap('modifyRemoveEventListener', (element, sideEffect, getComponentsAlias) => {
  // 如果已没有绑定事件，且是 block 元素，则转换为 static-view 或 pure-view
  if ( true && blockElements.has(element.nodeName) && sideEffect !== false && !element.isAnyEventBinded()) {
    const componentsAlias = getComponentsAlias();
    const value = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_2__.isHasExtractProp)(element) ? 'static-view' : 'pure-view';
    const valueAlias = componentsAlias[value]._num;
    element.enqueueUpdate({
      path: `${element._path}.${"nn" /* Shortcuts.NodeName */}`,
      value: valueAlias
    });
  }
});

/***/ }),

/***/ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: function() { return /* binding */ Button; },
/* harmony export */   Image: function() { return /* binding */ Image; },
/* harmony export */   Input: function() { return /* binding */ Input; },
/* harmony export */   ScrollView: function() { return /* binding */ ScrollView; },
/* harmony export */   Text: function() { return /* binding */ Text; },
/* harmony export */   Textarea: function() { return /* binding */ Textarea; },
/* harmony export */   View: function() { return /* binding */ View; }
/* harmony export */ });
/* unused harmony exports Ad, AdCustom, Audio, Block, Camera, Canvas, ChannelLive, ChannelVideo, Checkbox, CheckboxGroup, CoverImage, CoverView, CustomWrapper, DoubleTapGestureHandler, DraggableSheet, Editor, ForcePressGestureHandler, Form, FunctionalPageNavigator, GridBuilder, GridView, HorizontalDragGestureHandler, Icon, KeyboardAccessory, Label, ListBuilder, ListView, LivePlayer, LivePusher, LongPressGestureHandler, Map, MatchMedia, MovableArea, MovableView, NativeSlot, NavigationBar, Navigator, NestedScrollBody, NestedScrollHeader, OfficialAccount, OpenContainer, OpenData, PageContainer, PageMeta, PanGestureHandler, Picker, PickerView, PickerViewColumn, Progress, Radio, RadioGroup, RichText, RootPortal, ScaleGestureHandler, ShareElement, Slider, Slot, Snapshot, Span, StickyHeader, StickySection, Swiper, SwiperItem, Switch, TapGestureHandler, VerticalDragGestureHandler, Video, VoipRoom, WebView */
const View = 'view';
const Icon = 'icon';
const Progress = 'progress';
const RichText = 'rich-text';
const Text = 'text';
const Button = 'button';
const Checkbox = 'checkbox';
const CheckboxGroup = 'checkbox-group';
const Form = 'form';
const Input = 'input';
const Label = 'label';
const Picker = 'picker';
const PickerView = 'picker-view';
const PickerViewColumn = 'picker-view-column';
const Radio = 'radio';
const RadioGroup = 'radio-group';
const Slider = 'slider';
const Switch = 'switch';
const CoverImage = 'cover-image';
const Textarea = 'textarea';
const CoverView = 'cover-view';
const MovableArea = 'movable-area';
const MovableView = 'movable-view';
const ScrollView = 'scroll-view';
const Swiper = 'swiper';
const SwiperItem = 'swiper-item';
const Navigator = 'navigator';
const Audio = 'audio';
const Camera = 'camera';
const Image = 'image';
const LivePlayer = 'live-player';
const Video = 'video';
const Canvas = 'canvas';
const Ad = 'ad';
const WebView = 'web-view';
const Block = 'block';
const Map = 'map';
const Slot = 'slot';
const NativeSlot = 'native-slot';
const CustomWrapper = 'custom-wrapper';

// For React.createElement's type
const Editor = 'editor';
const MatchMedia = 'match-media';
const FunctionalPageNavigator = 'functional-page-navigator';
const LivePusher = 'live-pusher';
const OfficialAccount = 'official-account';
const OpenData = 'open-data';
const NavigationBar = 'navigation-bar';
const PageMeta = 'page-meta';
const VoipRoom = 'voip-room';
const AdCustom = 'ad-custom';
const PageContainer = 'page-container';
const ShareElement = 'share-element';
const KeyboardAccessory = 'keyboard-accessory';
const RootPortal = 'root-portal';
const ChannelLive = 'channel-live';
const ChannelVideo = 'channel-video';
const ListView = 'list-view';
const ListBuilder = 'list-builder';
const GridView = 'grid-view';
const GridBuilder = 'grid-builder';
const StickyHeader = 'sticky-header';
const StickySection = 'sticky-section';
const Snapshot = 'snapshot';
const Span = 'span';
const OpenContainer = 'open-container';
const DraggableSheet = 'draggable-sheet';
const NestedScrollHeader = 'nested-scroll-header';
const NestedScrollBody = 'nested-scroll-body';
const DoubleTapGestureHandler = 'double-tap-gesture-handler';
const ForcePressGestureHandler = 'force-press-gesture-handler';
const HorizontalDragGestureHandler = 'horizontal-drag-gesture-handler';
const LongPressGestureHandler = 'long-press-gesture-handler';
const PanGestureHandler = 'pan-gesture-handler';
const ScaleGestureHandler = 'scale-gesture-handler';
const TapGestureHandler = 'tap-gesture-handler';
const VerticalDragGestureHandler = 'vertical-drag-gesture-handler';


/***/ }),

/***/ "./node_modules/@tarojs/plugin-platform-weapp/dist/runtime.js":
/*!********************************************************************!*\
  !*** ./node_modules/@tarojs/plugin-platform-weapp/dist/runtime.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/native-apis.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");

const needPromiseApis = new Set(['addFileToFavorites', 'addVideoToFavorites', 'authPrivateMessage', 'checkIsAddedToMyMiniProgram', 'chooseContact', 'cropImage', 'disableAlertBeforeUnload', 'editImage', 'enableAlertBeforeUnload', 'getBackgroundFetchData', 'getChannelsLiveInfo', 'getChannelsLiveNoticeInfo', 'getFuzzyLocation', 'getGroupEnterInfo', 'getLocalIPAddress', 'getShareInfo', 'getUserProfile', 'getWeRunData', 'join1v1Chat', 'openChannelsActivity', 'openChannelsEvent', 'openChannelsLive', 'openChannelsUserProfile', 'openCustomerServiceChat', 'openVideoEditor', 'saveFileToDisk', 'scanItem', 'setEnable1v1Chat', 'setWindowSize', 'sendBizRedPacket', 'startFacialRecognitionVerify']);
function initNativeApi(taro) {
  (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.processApis)(taro, wx, {
    needPromiseApis,
    modifyApis(apis) {
      // fix https://github.com/NervJS/taro/issues/9899
      apis.delete('lanDebug');
    },
    transformMeta(api, options) {
      var _a;
      if (api === 'showShareMenu') {
        options.menus = (_a = options.showShareItems) === null || _a === void 0 ? void 0 : _a.map(item => item === 'wechatFriends' ? 'shareAppMessage' : item === 'wechatMoment' ? 'shareTimeline' : item);
      }
      return {
        key: api,
        options
      };
    }
  });
  taro.cloud = wx.cloud;
  taro.getTabBar = function (pageCtx) {
    var _a;
    if (typeof (pageCtx === null || pageCtx === void 0 ? void 0 : pageCtx.getTabBar) === 'function') {
      return (_a = pageCtx.getTabBar()) === null || _a === void 0 ? void 0 : _a.$taroInstances;
    }
  };
  taro.getRenderer = function () {
    var _a, _b, _c;
    return (_c = (_b = (_a = taro.getCurrentInstance()) === null || _a === void 0 ? void 0 : _a.page) === null || _b === void 0 ? void 0 : _b.renderer) !== null && _c !== void 0 ? _c : 'webview';
  };
}
const _true = 'true';
const _false = 'false';
const _empty = '';
const _zero = '0';
const _object = '{}';
const components = {
  // ======== 调整属性 ========
  Progress: {
    'border-radius': _zero,
    'font-size': '16',
    duration: '30',
    bindActiveEnd: _empty
  },
  RichText: {
    space: _empty,
    'user-select': _false,
    mode: "'default'"
  },
  Text: {
    'user-select': _false,
    overflow: 'visible',
    'max-lines': ''
  },
  Map: {
    polygons: '[]',
    subkey: _empty,
    rotate: _zero,
    skew: _zero,
    'max-scale': '20',
    'min-scale': '3',
    'enable-3D': _false,
    'show-compass': _false,
    'show-scale': _false,
    'enable-overlooking': _false,
    'enable-auto-max-overlooking': _false,
    'enable-zoom': _true,
    'enable-scroll': _true,
    'enable-rotate': _false,
    'enable-satellite': _false,
    'enable-traffic': _false,
    'enable-poi': _true,
    'enable-building': _true,
    setting: _object,
    bindLabelTap: _empty,
    bindRegionChange: _empty,
    bindPoiTap: _empty,
    bindPolylineTap: _empty,
    bindAbilitySuccess: _empty,
    bindAbilityFailed: _empty,
    bindAuthSuccess: _empty,
    bindInterpolatePoint: _empty,
    bindError: _empty,
    bindAnchorPointTap: _empty
  },
  Button: {
    lang: 'en',
    'session-from': _empty,
    'send-message-title': _empty,
    'send-message-path': _empty,
    'send-message-img': _empty,
    'app-parameter': _empty,
    'show-message-card': _false,
    'business-id': _empty,
    bindGetUserInfo: _empty,
    bindContact: _empty,
    bindGetPhoneNumber: _empty,
    bindGetRealTimePhoneNumber: _empty,
    bindChooseAvatar: _empty,
    bindError: _empty,
    bindOpenSetting: _empty,
    bindLaunchApp: _empty,
    bindAgreePrivacyAuthorization: _empty
  },
  Form: {
    'report-submit-timeout': _zero
  },
  Input: {
    'always-embed': _false,
    'adjust-position': _true,
    'hold-keyboard': _false,
    'safe-password-cert-path': '',
    'safe-password-length': '',
    'safe-password-time-stamp': '',
    'safe-password-nonce': '',
    'safe-password-salt': '',
    'safe-password-custom-hash': '',
    'auto-fill': _empty,
    'cursor-color': '',
    bindKeyboardHeightChange: _empty,
    bindNicknameReview: _empty,
    bindSelectionChange: _empty,
    bindKeyboardCompositionStart: _empty,
    bindKeyboardCompositionUpdate: _empty,
    bindKeyboardCompositionEnd: _empty
  },
  Picker: {
    'header-text': _empty,
    level: 'region'
  },
  PickerView: {
    'immediate-change': _false,
    bindPickStart: _empty,
    bindPickEnd: _empty
  },
  Slider: {
    color: "'#e9e9e9'",
    'selected-color': "'#1aad19'"
  },
  Textarea: {
    'show-confirm-bar': _true,
    'adjust-position': _true,
    'hold-keyboard': _false,
    'disable-default-padding': _false,
    'confirm-type': "'return'",
    'confirm-hold': _false,
    'adjust-keyboard-to': "'cursor'",
    bindKeyboardHeightChange: _empty,
    bindSelectionChange: _empty,
    bindKeyboardCompositionStart: _empty,
    bindKeyboardCompositionUpdate: _empty,
    bindKeyboardCompositionEnd: _empty
  },
  ScrollView: {
    'enable-flex': _false,
    'scroll-anchoring': _false,
    enhanced: _false,
    'using-sticky': _false,
    'paging-enabled': _false,
    'enable-passive': _false,
    'refresher-enabled': _false,
    'refresher-threshold': '45',
    'refresher-default-style': "'black'",
    'refresher-background': "'#FFF'",
    'refresher-triggered': _false,
    bounces: _true,
    'show-scrollbar': _true,
    'fast-deceleration': _false,
    type: "'list'",
    'associative-container': "''",
    reverse: _false,
    clip: _true,
    'enable-back-to-top': _false,
    'cache-extent': _empty,
    'min-drag-distance': '18',
    'scroll-into-view-within-extent': _false,
    'scroll-into-view-alignment': "'start'",
    padding: '[0,0,0,0]',
    'refresher-two-level-enabled': _false,
    'refresher-two-level-triggered': _false,
    'refresher-two-level-threshold': '150',
    'refresher-two-level-close-threshold': '80',
    'refresher-two-level-scroll-enabled': _false,
    'refresher-ballistic-refresh-enabled': _false,
    'refresher-two-level-pinned': _false,
    bindDragStart: _empty,
    bindDragging: _empty,
    bindDragEnd: _empty,
    bindRefresherPulling: _empty,
    bindRefresherRefresh: _empty,
    bindRefresherRestore: _empty,
    bindRefresherAbort: _empty,
    bindScrollStart: _empty,
    bindScrollEnd: _empty,
    bindRefresherWillRefresh: _empty,
    bindRefresherStatusChange: _empty
  },
  StickySection: {
    'push-pinned-header': _true,
    padding: '[0, 0, 0, 0]'
  },
  GridView: {
    type: "'aligned'",
    'cross-axis-count': '2',
    'max-cross-axis-extent': _zero,
    'main-axis-gap': _zero,
    'cross-axis-gap': _zero,
    padding: '[0, 0, 0, 0]'
  },
  GridBuilder: {
    type: "'aligned'",
    list: '[]',
    'cross-axis-count': '2',
    'max-cross-axis-extent': _zero,
    'main-axis-gap': _zero,
    'cross-axis-gap': _zero,
    padding: '[0, 0, 0, 0]',
    bindItemBuild: _empty,
    bindItemDispose: _empty
  },
  ListView: {
    padding: '[0, 0, 0, 0]'
  },
  ListBuilder: {
    list: '[]',
    type: 'static',
    padding: '[0, 0, 0, 0]',
    'child-count': _empty,
    'child-height': _empty,
    bindItemBuild: _empty,
    bindItemDispose: _empty
  },
  StickyHeader: {
    'offset-top': '0',
    padding: '[0, 0, 0, 0]'
  },
  Swiper: {
    'snap-to-edge': _false,
    'easing-function': "'default'",
    'layout-type': "'normal'",
    'transformer-type': "'scaleAndFade'",
    'indicator-type': "'normal'",
    'indicator-margin': '10',
    'indicator-spacing': '4',
    'indicator-radius': '4',
    'indicator-width': '8',
    'indicator-height': '8',
    'indicator-alignment': "'auto'",
    'indicator-offset': '[0, 0]',
    'scroll-with-animation': _true,
    'cache-extent': '0'
  },
  SwiperItem: {
    'skip-hidden-item-layout': _false
  },
  Navigator: {
    target: "'self'",
    'app-id': _empty,
    path: _empty,
    'extra-data': _empty,
    version: "'version'"
  },
  Camera: {
    mode: "'normal'",
    resolution: "'medium'",
    'frame-size': "'medium'",
    bindInitDone: _empty,
    bindScanCode: _empty
  },
  Image: {
    webp: _false,
    'show-menu-by-longpress': _false,
    'fade-in': _false
  },
  LivePlayer: {
    mode: "'live'",
    'sound-mode': "'speaker'",
    'auto-pause-if-navigate': _true,
    'auto-pause-if-open-native': _true,
    'picture-in-picture-mode': '[]',
    'enable-auto-rotation': _false,
    'referrer-policy': "'no-referrer'",
    'enable-casting': _false,
    bindstatechange: _empty,
    bindfullscreenchange: _empty,
    bindnetstatus: _empty,
    bindAudioVolumeNotify: _empty,
    bindEnterPictureInPicture: _empty,
    bindLeavePictureInPicture: _empty,
    bindCastingUserSelect: _empty,
    bindCastingStateChange: _empty,
    bindCastingInterrupt: _empty
  },
  Video: {
    title: _empty,
    'play-btn-position': "'bottom'",
    'enable-play-gesture': _false,
    'auto-pause-if-navigate': _true,
    'auto-pause-if-open-native': _true,
    'vslide-gesture': _false,
    'vslide-gesture-in-fullscreen': _true,
    'show-bottom-progress': _true,
    'ad-unit-id': _empty,
    'poster-for-crawler': _empty,
    'show-casting-button': _false,
    'picture-in-picture-mode': '[]',
    // picture-in-picture-show-progress 属性先注释掉的原因如下：
    // 该属性超过了 wxml 属性的长度限制，实际无法使用且导致编译报错。可等微信官方修复后再放开。
    // 参考1：https://developers.weixin.qq.com/community/develop/doc/000a429beb87f0eac07acc0fc5b400
    // 参考2: https://developers.weixin.qq.com/community/develop/doc/0006883619c48054286a4308258c00?_at=vyxqpllafi
    // 'picture-in-picture-show-progress': 'false',
    'enable-auto-rotation': _false,
    'show-screen-lock-button': _false,
    'show-snapshot-button': _false,
    'show-background-playback-button': _false,
    'background-poster': _empty,
    'referrer-policy': "'no-referrer'",
    'is-drm': _false,
    'is-live': _false,
    'provision-url': _empty,
    'certificate-url': _empty,
    'license-url': _empty,
    'preferred-peak-bit-rate': _empty,
    bindProgress: _empty,
    bindLoadedMetadata: _empty,
    bindControlsToggle: _empty,
    bindEnterPictureInPicture: _empty,
    bindLeavePictureInPicture: _empty,
    bindSeekComplete: _empty,
    bindCastingUserSelect: _empty,
    bindCastingStateChange: _empty,
    bindCastingInterrupt: _empty,
    bindAdLoad: _empty,
    bindAdError: _empty,
    bindAdClose: _empty,
    bindAdPlay: _empty
  },
  Canvas: {
    type: _empty
  },
  Ad: {
    'ad-type': "'banner'",
    'ad-theme': "'white'"
  },
  CoverView: {
    'marker-id': _empty,
    slot: _empty
  },
  // ======== 额外组件 ========
  Editor: {
    'read-only': _false,
    placeholder: _empty,
    'show-img-size': _false,
    'show-img-toolbar': _false,
    'show-img-resize': _false,
    focus: _false,
    bindReady: _empty,
    bindFocus: _empty,
    bindBlur: _empty,
    bindInput: _empty,
    bindStatusChange: _empty,
    name: _empty
  },
  MatchMedia: {
    'min-width': _empty,
    'max-width': _empty,
    width: _empty,
    'min-height': _empty,
    'max-height': _empty,
    height: _empty,
    orientation: _empty
  },
  FunctionalPageNavigator: {
    version: "'release'",
    name: _empty,
    args: _empty,
    bindSuccess: _empty,
    bindFail: _empty,
    bindCancel: _empty
  },
  LivePusher: {
    url: _empty,
    mode: "'RTC'",
    autopush: _false,
    muted: _false,
    'enable-camera': _true,
    'auto-focus': _true,
    orientation: "'vertical'",
    beauty: _zero,
    whiteness: _zero,
    aspect: "'9:16'",
    'min-bitrate': '200',
    'max-bitrate': '1000',
    'audio-quality': "'high'",
    'waiting-image': _empty,
    'waiting-image-hash': _empty,
    zoom: _false,
    'device-position': "'front'",
    'background-mute': _false,
    mirror: _false,
    'remote-mirror': _false,
    'local-mirror': _false,
    'audio-reverb-type': _zero,
    'enable-mic': _true,
    'enable-agc': _false,
    'enable-ans': _false,
    'audio-volume-type': "'voicecall'",
    'video-width': '360',
    'video-height': '640',
    'beauty-style': "'smooth'",
    filter: "'standard'",
    'picture-in-picture-mode': '[]',
    animation: _empty,
    bindStateChange: _empty,
    bindNetStatus: _empty,
    bindBgmStart: _empty,
    bindBgmProgress: _empty,
    bindBgmComplete: _empty,
    bindAudioVolumeNotify: _empty
  },
  OfficialAccount: {
    bindLoad: _empty,
    bindError: _empty
  },
  OpenData: {
    type: _empty,
    'open-gid': _empty,
    lang: "'en'",
    'default-text': _empty,
    'default-avatar': _empty,
    bindError: _empty
  },
  NavigationBar: {
    title: _empty,
    loading: _false,
    'front-color': "'#000000'",
    'background-color': _empty,
    'color-animation-duration': _zero,
    'color-animation-timing-func': "'linear'"
  },
  PageMeta: {
    'background-text-style': _empty,
    'background-color': _empty,
    'background-color-top': _empty,
    'background-color-bottom': _empty,
    'root-background-color': _empty,
    'scroll-top': "''",
    'scroll-duration': '300',
    'page-style': "''",
    'root-font-size': "''",
    'page-orientation': "''",
    bindResize: _empty,
    bindScroll: _empty,
    bindScrollDone: _empty
  },
  VoipRoom: {
    openid: _empty,
    mode: "'camera'",
    'device-position': "'front'",
    bindError: _empty
  },
  AdCustom: {
    'unit-id': _empty,
    'ad-intervals': _empty,
    bindLoad: _empty,
    bindError: _empty
  },
  PageContainer: {
    show: _false,
    duration: '300',
    'z-index': '100',
    overlay: _true,
    position: "'bottom'",
    round: _false,
    'close-on-slide-down': _false,
    'overlay-style': _empty,
    'custom-style': _empty,
    bindBeforeEnter: _empty,
    bindEnter: _empty,
    bindAfterEnter: _empty,
    bindBeforeLeave: _empty,
    bindLeave: _empty,
    bindAfterLeave: _empty,
    bindClickOverlay: _empty
  },
  ShareElement: {
    mapkey: _empty,
    transform: _false,
    duration: '300',
    'easing-function': "'ease-out'",
    'transition-on-gesture': _false,
    'shuttle-on-push': "'to'",
    'shuttle-on-pop': "'to'",
    'rect-tween-type': "'materialRectArc'"
  },
  KeyboardAccessory: {},
  RootPortal: {
    enable: _true
  },
  ChannelLive: {
    'feed-id': _empty,
    'finder-user-name': _empty
  },
  ChannelVideo: {
    'feed-id': _empty,
    'finder-user-name': _empty,
    'feed-token': _empty,
    autoplay: _false,
    loop: _false,
    muted: _false,
    'object-fit': "'contain'",
    bindError: _empty
  },
  Snapshot: {
    mode: "'view'"
  },
  Span: {},
  OpenContainer: {
    transitionType: "'fade'",
    transitionDuration: '300',
    closedColor: "'white'",
    closedElevation: _zero,
    closeBorderRadius: _zero,
    middleColor: _empty,
    openColor: "'white'",
    openElevation: _zero,
    openBorderRadius: _zero
  },
  DraggableSheet: {
    initialChildSize: '0.5',
    minChildSize: '0.25',
    maxChildSize: '1.0',
    snap: _false,
    snapSizes: '[]'
  },
  NestedScrollHeader: {},
  NestedScrollBody: {},
  // skyline手势组件
  DoubleTapGestureHandler: {},
  ForcePressGestureHandler: {},
  HorizontalDragGestureHandler: {},
  LongPressGestureHandler: {},
  PanGestureHandler: {},
  ScaleGestureHandler: {},
  TapGestureHandler: {},
  VerticalDragGestureHandler: {}
};
const hostConfig = {
  initNativeApi,
  getMiniLifecycle(config) {
    const methods = config.page[5];
    if (methods.indexOf('onSaveExitState') === -1) {
      methods.push('onSaveExitState');
    }
    return config;
  },
  transferHydrateData(data, element, componentsAlias) {
    var _a;
    if (element.isTransferElement) {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      data["nn" /* Shortcuts.NodeName */] = element.dataName;
      page.setData({
        [(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(data.nn)]: data
      });
      return {
        sid: element.sid,
        ["v" /* Shortcuts.Text */]: '',
        ["nn" /* Shortcuts.NodeName */]: ((_a = componentsAlias['#text']) === null || _a === void 0 ? void 0 : _a._num) || '8'
      };
    }
  }
};
(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.mergeReconciler)(hostConfig);
(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.mergeInternalComponents)(components);

/***/ }),

/***/ "./node_modules/@tarojs/react/dist/react.esm.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/react/dist/react.esm.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ index; }
/* harmony export */ });
/* unused harmony exports createPortal, createRoot, findDOMNode, flushSync, internalInstanceKey, render, unmountComponentAtNode, unstable_batchedUpdates */
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/constants.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/components.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dom/form.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/bom/document.js");
/* harmony import */ var react_reconciler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-reconciler */ "./node_modules/react-reconciler/cjs/react-reconciler.production.min.js");
/* harmony import */ var react_reconciler__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_reconciler__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_reconciler_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-reconciler/constants */ "./node_modules/react-reconciler/constants.js");




const supportedInputTypes = {
  color: true,
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true
};
const SyncLane = 1;
const InputContinuousLane = 4;
const DefaultLane = 16;
const DiscreteEventPriority = SyncLane;
const ContinuousEventPriority = InputContinuousLane;
const DefaultEventPriority = DefaultLane;
function getEventPriority(domEventName) {
  switch (domEventName) {
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'input':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'reset':
    case 'resize':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'change':
    case 'blur':
    case 'focus':
    case 'select':
    case 'selectstart':
      return DiscreteEventPriority;
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'pointerenter':
    case 'pointerleave':
      return ContinuousEventPriority;
    default:
      return DefaultEventPriority;
  }
}
const randomKey = Math.random().toString(36).slice(2);
const internalPropsKey = '__reactProps$' + randomKey;
const internalInstanceKey = '__reactFiber$' + randomKey;
const internalContainerInstanceKey = '__reactContainer$' + randomKey;
// const internalEventHandlersKey = '__reactEvents$' + randomKey
// const internalEventHandlerListenersKey = '__reactListeners$' + randomKey
// const internalEventHandlesSetKey = '__reactHandles$' + randomKey

const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
const HostComponent = 5;
const HostText = 6;
const SuspenseComponent = 13;

/**
 * 给 TaroElement 绑定 react fiber、react props 等属性
 * 提供 fiber -> element、element -> fiber、element -> props 的方法
*/
function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}
function markContainerAsRoot(hostRoot, node) {
  node[internalContainerInstanceKey] = hostRoot;
}
/**
 * Given a DOM node, return the ReactDOMComponent or ReactDOMTextComponent
 * instance, or null if the node was not rendered by this React.
 */
function getInstanceFromNode(node) {
  const inst = node[internalInstanceKey] || node[internalContainerInstanceKey];
  if (inst) {
    if (inst.tag === HostComponent || inst.tag === HostText || inst.tag === SuspenseComponent || inst.tag === HostRoot) {
      return inst;
    } else {
      return null;
    }
  }
  return null;
}
/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */
function getNodeFromInstance(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber this, is just the state node right now. We assume it will be
    // a host component or host text.
    return inst.stateNode;
  }
}
function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}
function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
  if (false) {}
}

// 从 props 中，更新 input 组件的 value 值
function updateInputWrapper(element, oldValue, props) {
  const node = element;
  const checked = props.checked;
  if (checked != null) {
    console.warn('updateCheck 未实现', node);
    return;
  }
  updateWrapper(element, oldValue, props);
  updateNamedCousins(element, props);
}
// react 中原本处理 type=radio 的逻辑，这里留个空，暂时不处理
function updateNamedCousins(rootNode, props) {
  const name = props.name;
  if (props.type === 'radio' && name != null) {
    console.warn('radio updateNamedCousins 未实现', rootNode, props);
  }
}
function getToStringValue(value) {
  const isEmptyType = typeof value === 'function' || typeof value === 'symbol';
  return isEmptyType ? '' : value;
}
function toString(value) {
  return '' + value;
}
function updateWrapper(element, oldValue, props) {
  const node = element;
  const value = getToStringValue(props.value);
  const type = props.type;
  setNodeValue(node, oldValue, value, type);
}
// oldValue 为 event.detail.value，value 为 fiber.props.value
// 如果 oldValue 和 value 不相等，代表受控组件需要更新
// 更新的原则为，fiber.props.value 永远为用户所需要的值，因此 node.value = toString(value)
function setNodeValue(node, oldValue, value, type = 'string') {
  if (value != null) {
    if (type === 'number') {
      if (value === 0 && node.value === ''
      // We explicitly want to coerce to number here if possible.
      // eslint-disable-next-line
      || oldValue != value) {
        node.value = toString(value);
      }
    } else if (oldValue !== toString(value)) {
      node.value = toString(value);
    }
  } else if (type === 'submit' || type === 'reset') {
    // Submit/reset inputs need the attribute removed completely to avoid
    // blank-text buttons.
    node.removeAttribute('value');
  }
}
// 判断当前 TaroElement 是否为 supportedInputTypes input 或 textarea
function isTextInputElement(elem) {
  const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  if (nodeName === 'input') {
    const type = elem.type;
    return !type || !!supportedInputTypes[type];
  }
  if (nodeName === 'textarea') {
    return true;
  }
  return false;
}
const ReactDOMTextareaRestoreControlledState = updateWrapper;
const ReactDOMInputRestoreControlledState = updateInputWrapper;
function isCheckable(elem) {
  const type = elem.type;
  const nodeName = elem.nodeName;
  return nodeName && nodeName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
}
function getTracker(node) {
  return node._valueTracker;
}
function detachTracker(node) {
  node._valueTracker = null;
}
// 之所以单独创建一个 tacker，是为了统一监听不同 type 的 input 值
// 比如 type=checkbox 或者 type=radio，就需要监听 checked，而不是 value
// 虽然目前还未实现 checkbox 和 radio 的 finishEventHandle，但后续不好说，所以先统一和 react 一样的写法
// 需要特别注意的是，tracker 初始化时的值为 node 的初始值，但后续会变更为事件的 detail.value 值
function trackValueOnNode(node) {
  const valueField = isCheckable(node) ? 'checked' : 'value';
  const descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
  let currentValue = '' + node[valueField];
  if (node.hasOwnProperty(valueField) || typeof descriptor === 'undefined' || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
    return;
  }
  const {
    get,
    set
  } = descriptor;
  Object.defineProperty(node, valueField, {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: function () {
      return get.call(this);
    },
    set: function (value) {
      currentValue = '' + value;
      set.call(this, value);
    }
  });
  const tracker = {
    getValue() {
      return currentValue;
    },
    setValue(value) {
      currentValue = '' + value;
    },
    stopTracking() {
      detachTracker(node);
      delete node[valueField];
    }
  };
  return tracker;
}
function track(node) {
  if (getTracker(node)) {
    return;
  }
  node._valueTracker = trackValueOnNode(node);
}
function updateValueIfChanged(node, nextValue) {
  if (!node) {
    return false;
  }
  const tracker = getTracker(node);
  if (!tracker) {
    return true;
  }
  const lastValue = tracker.getValue();
  if (nextValue !== lastValue) {
    tracker.setValue(nextValue);
    return true;
  }
  return false;
}
const IS_NON_DIMENSIONAL = /aspect|acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
const IS_DATASET_OR_ARIA = /^(data|aria)-/;
function isEventName(s) {
  return s[0] === 'o' && s[1] === 'n';
}
function isEqual(obj1, obj2) {
  // 首先检查引用是否相同
  if (obj1 === obj2) {
    return true;
  }
  // 如果两者中有一个不是对象，或者为 null，直接返回 false
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  // 获取两个对象键的数组
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  // 如果键的数量不相同，对象显然不相等
  if (keys1.length !== keys2.length) {
    return false;
  }
  // 遍历对象的每个键，比较两个对象同一键的值
  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i];
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  // 如果所有键的值都相等，返回 true
  return true;
}
function updateProps(dom, oldProps, newProps) {
  const updatePayload = getUpdatePayload(dom, oldProps, newProps);
  if (updatePayload) {
    updatePropsByPayload(dom, oldProps, updatePayload);
  }
}
function updatePropsByPayload(dom, oldProps, updatePayload) {
  const handlers = [];
  let fixedHandler = null;
  for (let i = 0; i < updatePayload.length; i += 2) {
    // key, value 成对出现
    const key = updatePayload[i];
    const newProp = updatePayload[i + 1];
    const oldProp = oldProps[key];
    if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY) {
      if (key === '__fixed') {
        // hack: __fixed最先识别
        fixedHandler = () => setProperty(dom, key, newProp, oldProp);
        continue;
      }
      // 鸿蒙样式前置插入，防止覆盖style
      if (key === '__hmStyle') {
        handlers.splice(0, 0, () => setHarmonyStyle(dom, newProp, oldProp));
      } else {
        handlers.push(() => setProperty(dom, key, newProp, oldProp));
      }
    } else {
      setProperty(dom, key, newProp, oldProp);
    }
  }
  if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY) {
    fixedHandler && fixedHandler();
    for (let i = 0; i < handlers.length; i++) {
      handlers[i]();
    }
  }
}
function getUpdatePayload(dom, oldProps, newProps) {
  let i;
  let updatePayload = null;
  for (i in oldProps) {
    if (!(i in newProps)) {
      (updatePayload = updatePayload || []).push(i, null);
    }
  }
  const isFormElement = dom instanceof _tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.FormElement;
  for (i in newProps) {
    if (oldProps[i] !== newProps[i] || isFormElement && i === 'value') {
      // 如果都是 style，且 style 里面的值相等，则无需记录到 payload 中
      if (i === 'style' && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(oldProps[i]) && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(newProps[i]) && isEqual(oldProps[i], newProps[i])) continue;
      (updatePayload = updatePayload || []).push(i, newProps[i]);
    }
  }
  return updatePayload;
}
// function eventProxy (e: CommonEvent) {
//   const el = document.getElementById(e.currentTarget.id)
//   const handlers = el!.__handlers[e.type]
//   handlers[0](e)
// }
function setEvent(dom, name, value, oldValue) {
  const isCapture = name.endsWith('Capture');
  let eventName = name.toLowerCase().slice(2);
  if (isCapture) {
    eventName = eventName.slice(0, -7);
  }
  const compName = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.capitalize)((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.toCamelCase)(dom.tagName.toLowerCase()));
  if (eventName === 'click' && "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY && compName in _tarojs_shared__WEBPACK_IMPORTED_MODULE_6__.internalComponents) {
    eventName = 'tap';
  }
  if (false) {}
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isFunction)(value)) {
    if (oldValue) {
      dom.removeEventListener(eventName, oldValue, "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY ? false : undefined);
      dom.addEventListener(eventName, value, "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY ? {
        isCapture,
        sideEffect: false
      } : undefined);
    } else {
      dom.addEventListener(eventName, value, "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY ? isCapture : undefined);
    }
  } else {
    dom.removeEventListener(eventName, oldValue);
  }
}
function setStyle(style, key, value) {
  if (key[0] === '-' && "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY) {
    // css variables need not further judgment
    style.setProperty(key, value.toString());
    return;
  }
  style[key] = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isNumber)(value) && IS_NON_DIMENSIONAL.test(key) === false ? "mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY ? value + 'px' : (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_7__.convertNumber2PX)(value) : value === null ? '' : value;
}
// 鸿蒙样式特殊处理，需要在插入顺序中前置插入，防止覆盖了style
function setHarmonyStyle(dom, value, oldValue) {
  // @ts-ignore
  const style = dom._st.hmStyle; // __hmStyle是已经被处理过的鸿蒙样式，可以直接塞进hmStyle对象内
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(oldValue)) {
    for (const i in oldValue) {
      if (!(value && i in value)) {
        // 鸿蒙伪类特殊处理
        if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY) {
          if (i === '::after' || i === '::before') {
            setPseudo(dom, i, null);
          } else if (['::first-child', '::last-child', '::empty'].includes(i) || `${i}`.indexOf('::nth-child') === 0) {
            // @ts-ignore
            dom.set_pseudo_class(i, null);
          } else {
            if (i === 'position' && oldValue[i] === 'fixed') {
              // @ts-ignore
              dom.setLayer(0);
            } else if (i === 'animationName') {
              // @ts-ignore
              dom.setAnimation(false);
            }
            style[i] = '';
          }
        } else {
          style[i] = '';
        }
      }
    }
  }
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(value)) {
    for (const i in value) {
      if (!oldValue || !isEqual(value[i], oldValue[i])) {
        // 鸿蒙伪类特殊处理
        if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY) {
          if (i === '::after' || i === '::before') {
            setPseudo(dom, i, value[i]);
          } else if (['::first-child', '::last-child', '::empty'].includes(i) || i.startsWith('::nth-child')) {
            // @ts-ignore
            dom.set_pseudo_class(i, value[i]);
          } else {
            if (i === 'position') {
              if (value[i] === 'fixed' || value[i] !== 'fixed' && (oldValue === null || oldValue === void 0 ? void 0 : oldValue[i])) {
                // @ts-ignore
                dom.setLayer(value[i] === 'fixed' ? 1 : 0);
              }
            } else if (i === 'animationName') {
              // @ts-ignore
              dom.setAnimation(true);
            }
            style[i] = value[i];
          }
        } else {
          style[i] = value[i];
        }
      }
    }
  }
  dom.setAttribute('__hmStyle', value);
}
function setProperty(dom, name, value, oldValue) {
  var _a, _b;
  name = name === 'className' ? 'class' : name;
  if (name === 'key' || name === 'children' || name === 'ref') ;else if (name === 'style') {
    if (false) {} else {
      if (/harmony.*cpp/.test("weapp" || 0)) {
        return dom.setAttribute('_style4cpp', value);
      }
      const style = dom.style;
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isString)(value)) {
        style.cssText = value;
      } else {
        if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isString)(oldValue)) {
          style.cssText = '';
          oldValue = null;
        }
        if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(oldValue)) {
          for (const i in oldValue) {
            if (!(value && i in value)) {
              // Harmony特殊处理
              if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY && i === 'position' && oldValue[i] === 'fixed') {
                // @ts-ignore
                dom.setLayer(0);
              }
              setStyle(style, i, '');
            }
          }
        }
        if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(value)) {
          for (const i in value) {
            if (!oldValue || !isEqual(value[i], oldValue[i])) {
              // Harmony特殊处理
              if ("mini" === _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_TYPE.HARMONY && i === 'position') {
                if (value[i] === 'fixed' || value[i] !== 'fixed' && (oldValue === null || oldValue === void 0 ? void 0 : oldValue[i])) {
                  // @ts-ignore
                  dom.setLayer(value[i] === 'fixed' ? 1 : 0);
                }
              }
              setStyle(style, i, value[i]);
            }
          }
        }
      }
    }
  } else if (isEventName(name)) {
    setEvent(dom, name, value, oldValue);
  } else if (name === 'dangerouslySetInnerHTML') {
    const newHtml = (_a = value === null || value === void 0 ? void 0 : value.__html) !== null && _a !== void 0 ? _a : '';
    const oldHtml = (_b = oldValue === null || oldValue === void 0 ? void 0 : oldValue.__html) !== null && _b !== void 0 ? _b : '';
    if (newHtml || oldHtml) {
      if (oldHtml !== newHtml) {
        if (false) {} else {
          dom.innerHTML = newHtml;
        }
      }
    }
  } else if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isFunction)(value)) {
    if (false) {}
    if (value == null) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, value);
    }
  }
}
// 设置鸿蒙伪类属性(特殊设置)
function setPseudo(dom, name, value) {
  if (name === '::after') {
    // @ts-ignore
    dom.set_pseudo_after(value);
  } else if (name === '::before') {
    // @ts-ignore
    dom.set_pseudo_before(value);
  }
}
function styleObjectToCss(style) {
  return Object.entries(style).map(([key, value]) => {
    const kebabCaseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const cssValue = typeof value === 'number' && !_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.UNITLESS_PROPERTIES_SET.has(kebabCaseKey) ? `${value}px` : value === null ? '' : value;
    return `${kebabCaseKey}: ${cssValue};`;
  }).join(' ');
}

/* eslint-disable @typescript-eslint/indent */
const hostConfig = {
  // below keys order by {React ReactFiberHostConfig.custom.js}, convenient for comparing each other.
  // -------------------
  // required by @types/react-reconciler
  // -------------------
  getPublicInstance(inst) {
    return inst;
  },
  getRootHostContext() {
    return {};
  },
  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },
  prepareForCommit(..._) {
    return null;
  },
  resetAfterCommit: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  createInstance(type, props, _rootContainerInstance, _hostContext, internalInstanceHandle) {
    const element = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__.taroDocumentProvider.createElement(type);
    precacheFiberNode(internalInstanceHandle, element);
    updateFiberProps(element, props);
    return element;
  },
  appendInitialChild(parent, child) {
    parent.appendChild(child);
  },
  finalizeInitialChildren(dom, type, props) {
    let newProps = props;
    if (dom instanceof _tarojs_runtime__WEBPACK_IMPORTED_MODULE_3__.FormElement) {
      const [defaultName, defaultKey] = ['switch', 'checkbox', 'radio'].includes(type) ? ['checked', 'defaultChecked'] : ['value', 'defaultValue'];
      if (props.hasOwnProperty(defaultKey)) {
        newProps = Object.assign(Object.assign({}, newProps), {
          [defaultName]: props[defaultKey]
        });
        delete newProps[defaultKey];
      }
    }
    updateProps(dom, {}, newProps); // 提前执行更新属性操作，Taro 在 Page 初始化后会立即从 dom 读取必要信息
    if (type === 'input' || type === 'textarea') {
      track(dom);
    }
    return false;
  },
  prepareUpdate(instance, _, oldProps, newProps) {
    return getUpdatePayload(instance, oldProps, newProps);
  },
  shouldSetTextContent() {
    return false;
  },
  createTextInstance(text, _rootContainerInstance, _hostContext, internalInstanceHandle) {
    const textNode = _tarojs_runtime__WEBPACK_IMPORTED_MODULE_8__.taroDocumentProvider.createTextNode(text);
    precacheFiberNode(internalInstanceHandle, textNode);
    return textNode;
  },
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  afterActiveInstanceBlur: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  preparePortalMount: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  prepareScopeUpdate: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  getInstanceFromScope: () => null,
  getCurrentEventPriority() {
    return react_reconciler_constants__WEBPACK_IMPORTED_MODULE_1__.DefaultEventPriority;
  },
  detachDeletedInstance: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  // -------------------
  //      Microtasks
  //     (optional)
  // -------------------
  supportsMicrotasks: true,
  scheduleMicrotask: (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isUndefined)(Promise) ? setTimeout : callback => Promise.resolve(null).then(callback).catch(function (error) {
    setTimeout(() => {
      throw error;
    });
  }),
  // -------------------
  //      Mutation
  //     (required if supportsMutation is true)
  // -------------------
  appendChild(parent, child) {
    parent.appendChild(child);
  },
  appendChildToContainer(parent, child) {
    parent.appendChild(child);
  },
  commitTextUpdate(textInst, _, newText) {
    textInst.nodeValue = newText;
  },
  commitMount: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  commitUpdate(dom, updatePayload, _, oldProps, newProps) {
    if (!updatePayload) return;
    // payload 只包含 children 的时候，不应该再继续触发后续的属性比较和更新的逻辑了
    if (updatePayload.length === 2 && updatePayload.includes('children')) return;
    updatePropsByPayload(dom, oldProps, updatePayload);
    updateFiberProps(dom, newProps);
  },
  insertBefore(parent, child, refChild) {
    parent.insertBefore(child, refChild);
  },
  insertInContainerBefore(parent, child, refChild) {
    parent.insertBefore(child, refChild);
  },
  removeChild(parent, child) {
    parent.removeChild(child);
  },
  removeChildFromContainer(parent, child) {
    parent.removeChild(child);
  },
  resetTextContent: _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.noop,
  hideInstance(instance) {
    const style = instance.style;
    style.setProperty('display', 'none');
  },
  hideTextInstance(textInstance) {
    textInstance.nodeValue = '';
  },
  unhideInstance(instance, props) {
    const styleProp = props.style;
    let display = (styleProp === null || styleProp === void 0 ? void 0 : styleProp.hasOwnProperty('display')) ? styleProp.display : null;
    display = display == null || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isBoolean)(display) || display === '' ? '' : ('' + display).trim();
    // eslint-disable-next-line dot-notation
    instance.style['display'] = display;
  },
  unhideTextInstance(textInstance, text) {
    textInstance.nodeValue = text;
  },
  clearContainer(element) {
    if (element.childNodes.length > 0) {
      element.textContent = '';
    }
  }
};
const TaroReconciler = react_reconciler__WEBPACK_IMPORTED_MODULE_0___default()(hostConfig);
if (true) {
  const foundDevTools = TaroReconciler.injectIntoDevTools({
    bundleType: 1,
    version: '18.0.0',
    rendererPackageName: 'taro-react'
  });
  if (!foundDevTools) {
    // eslint-disable-next-line no-console
    console.info('%cDownload the React DevTools ' + 'for a better development experience: ' + 'https://reactjs.org/link/react-devtools', 'font-weight:bold');
  }
}
let restoreQueue = null;
// 对比 TaroElement tracker 下的 value 和事件下的 value，判断 element 的值是否存在更改
function getTargetInstForInputOrChangeEvent(e, node) {
  var _a, _b;
  const targetInst = getInstanceFromNode(node);
  const domEventName = e.type;
  if (!targetInst || !isTextInputElement(node)) return;
  if (domEventName === 'input' || domEventName === 'change') {
    const nextValue = toString((_b = (_a = e.mpEvent) === null || _a === void 0 ? void 0 : _a.detail) === null || _b === void 0 ? void 0 : _b.value);
    return getInstIfValueChanged(targetInst, nextValue);
  }
}
function getInstIfValueChanged(targetInst, nextValue) {
  const targetNode = getNodeFromInstance(targetInst);
  if (!targetNode) return false;
  if (updateValueIfChanged(targetNode, nextValue)) {
    return targetInst;
  }
}
// 把 target 塞入更新队列中
function enqueueStateRestore(target) {
  if (restoreQueue) {
    restoreQueue.push(target);
  } else {
    restoreQueue = [target];
  }
}
// 判断是否需要恢复 target（input、textarea） 的状态
function needsStateRestore() {
  return restoreQueue !== null;
}
function finishEventHandler() {
  const controlledComponentsHavePendingUpdates = needsStateRestore();
  if (controlledComponentsHavePendingUpdates) {
    TaroReconciler.flushSync();
    restoreStateIfNeeded();
  }
}
// 遍历 restoreQueue、restoreTarget，恢复其状态
function restoreStateIfNeeded() {
  if (!restoreQueue) {
    return;
  }
  const queuedTargets = restoreQueue;
  restoreQueue = null;
  for (let i = 0; i < queuedTargets.length; i++) {
    restoreStateOfTarget(queuedTargets[i]);
  }
}
function restoreImpl(domElement, tag, oldValue, props) {
  switch (tag) {
    case 'input':
      ReactDOMInputRestoreControlledState(domElement, oldValue, props);
      break;
    case 'textarea':
      ReactDOMTextareaRestoreControlledState(domElement, oldValue, props);
      break;
  }
}
function restoreStateOfTarget(item) {
  const internalInstance = getInstanceFromNode(item.target);
  if (!internalInstance) return;
  const {
    stateNode,
    type
  } = internalInstance;
  if (stateNode) {
    const props = getFiberCurrentPropsFromNode(stateNode);
    restoreImpl(stateNode, type, item.value, props);
  }
}
const ContainerMap = new WeakMap();
class Root {
  constructor(renderer, domContainer, options) {
    this.renderer = renderer;
    this.initInternalRoot(renderer, domContainer, options);
  }
  initInternalRoot(renderer, domContainer, options) {
    // Since react-reconciler v0.27, createContainer need more parameters
    // @see:https://github.com/facebook/react/blob/0b974418c9a56f6c560298560265dcf4b65784bc/packages/react-reconciler/src/ReactFiberReconciler.js#L248
    const containerInfo = domContainer;
    if (options) {
      const tag = 1; // ConcurrentRoot
      const concurrentUpdatesByDefaultOverride = false;
      let isStrictMode = false;
      let identifierPrefix = '';
      let onRecoverableError = error => console.error(error);
      let transitionCallbacks = null;
      if (options.unstable_strictMode === true) {
        isStrictMode = true;
      }
      if (options.identifierPrefix !== undefined) {
        identifierPrefix = options.identifierPrefix;
      }
      if (options.onRecoverableError !== undefined) {
        onRecoverableError = options.onRecoverableError;
      }
      if (options.unstable_transitionCallbacks !== undefined) {
        transitionCallbacks = options.unstable_transitionCallbacks;
      }
      this.internalRoot = renderer.createContainer(containerInfo, tag, null,
      // hydrationCallbacks
      isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError, transitionCallbacks);
    } else {
      const tag = 0; // LegacyRoot
      this.internalRoot = renderer.createContainer(containerInfo, tag, null,
      // hydrationCallbacks
      false,
      // isStrictMode
      false,
      // concurrentUpdatesByDefaultOverride,
      '',
      // identifierPrefix
      () => {},
      // onRecoverableError, this isn't reachable because onRecoverableError isn't called in the legacy API.
      null // transitionCallbacks
      );
    }
  }
  render(children, cb) {
    const {
      renderer,
      internalRoot
    } = this;
    renderer.updateContainer(children, internalRoot, null, cb);
    return renderer.getPublicRootInstance(internalRoot);
  }
  unmount(cb) {
    this.renderer.updateContainer(null, this.internalRoot, null, cb);
  }
}
function render(element, domContainer, cb) {
  const oldRoot = ContainerMap.get(domContainer);
  if (oldRoot != null) {
    return oldRoot.render(element, cb);
  }
  const root = new Root(TaroReconciler, domContainer);
  ContainerMap.set(domContainer, root);
  return root.render(element, cb);
}
function createRoot(domContainer, options = {}) {
  var _a;
  const oldRoot = ContainerMap.get(domContainer);
  if (oldRoot != null) {
    return oldRoot;
  }
  // options should be an object
  const root = new Root(TaroReconciler, domContainer, options);
  ContainerMap.set(domContainer, root);
  markContainerAsRoot((_a = root === null || root === void 0 ? void 0 : root.internalRoot) === null || _a === void 0 ? void 0 : _a.current, domContainer);
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.hooks.tap('dispatchTaroEvent', (e, node) => {
    const eventPriority = getEventPriority(e.type);
    TaroReconciler.runWithPriority(eventPriority, () => {
      node.dispatchEvent(e);
    });
  });
  // 对比 event.detail.value 和 node.tracker.value，判断 value 值是否有变动，存在变动则塞入队列中
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.hooks.tap('modifyTaroEvent', (e, node) => {
    var _a, _b;
    const inst = getTargetInstForInputOrChangeEvent(e, node);
    if (!inst) return;
    // 这里塞入的是 event.detail.value，也就是事件的值，在受控组件中，你可以理解为需要被变更的值
    // 后续会在 finishEventHandler 中，使用最新的 fiber.props.value 来与其比较
    // 如果不一致，则表示需要更新，会执行 node.value = fiber.props.value 的更新操作
    const nextValue = (_b = (_a = e.mpEvent) === null || _a === void 0 ? void 0 : _a.detail) === null || _b === void 0 ? void 0 : _b.value;
    enqueueStateRestore({
      target: node,
      value: nextValue
    });
  });
  return root;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
let isInsideEventHandler = false;
// 重新包裹 batchedUpdates，使其可以在触发事件后执行 finishEventHandler
const unstable_batchedUpdates = (fn, a) => {
  if (isInsideEventHandler) {
    return fn(a);
  }
  isInsideEventHandler = true;
  try {
    return TaroReconciler.batchedUpdates(fn, a);
  } finally {
    isInsideEventHandler = false;
    finishEventHandler();
  }
};
function unmountComponentAtNode(dom) {
  (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.ensure)(dom && [1, 8, 9, 11].includes(dom.nodeType), 'unmountComponentAtNode(...): Target container is not a DOM element.');
  const root = ContainerMap.get(dom);
  if (!root) return false;
  unstable_batchedUpdates(() => {
    root.unmount(() => {
      ContainerMap.delete(dom);
    });
  }, null);
  return true;
}
function findDOMNode(comp) {
  if (comp == null) {
    return null;
  }
  const nodeType = comp.nodeType;
  if (nodeType === 1 || nodeType === 3) {
    return comp;
  }
  return TaroReconciler.findHostInstance(comp);
}
const portalType = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isFunction)(Symbol) && Symbol.for ? Symbol.for('react.portal') : 0xeaca;
function createPortal(children, containerInfo, key) {
  return {
    $$typeof: portalType,
    key: key == null ? null : String(key),
    children,
    containerInfo,
    implementation: null
  };
}
const flushSync = TaroReconciler.flushSync;
var index = {
  render,
  flushSync,
  createRoot,
  unstable_batchedUpdates,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  internalInstanceKey
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/URL.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/URL.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroURLProvider: function() { return /* binding */ TaroURLProvider; },
/* harmony export */   parseUrl: function() { return /* binding */ parseUrl; }
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _URLSearchParams_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./URLSearchParams.js */ "./node_modules/@tarojs/runtime/dist/bom/URLSearchParams.js");




var _TaroURL_hash, _TaroURL_hostname, _TaroURL_pathname, _TaroURL_port, _TaroURL_protocol, _TaroURL_search;
class TaroURL {
  static createObjectURL() {
    throw new Error('Oops, not support URL.createObjectURL() in miniprogram.');
  }
  static revokeObjectURL() {
    throw new Error('Oops, not support URL.revokeObjectURL() in miniprogram.');
  }
  constructor(url, base) {
    /* private property */
    _TaroURL_hash.set(this, '');
    _TaroURL_hostname.set(this, '');
    _TaroURL_pathname.set(this, '');
    _TaroURL_port.set(this, '');
    _TaroURL_protocol.set(this, '');
    _TaroURL_search.set(this, void 0);
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(url)) url = String(url);
    const parseResult = parseUrlBase(url, base);
    const {
      hash,
      hostname,
      pathname,
      port,
      protocol,
      search
    } = parseResult;
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_hash, hash, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_hostname, hostname, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_pathname, pathname || '/', "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_port, port, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_protocol, protocol, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_search, new _URLSearchParams_js__WEBPACK_IMPORTED_MODULE_2__.URLSearchParams(search), "f");
  }
  /* public property */
  get protocol() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_protocol, "f");
  }
  set protocol(val) {
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val) && (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_protocol, val.trim(), "f");
  }
  get host() {
    return this.hostname + (this.port ? ':' + this.port : '');
  }
  set host(val) {
    if (val && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      const {
        hostname,
        port
      } = parseUrl(`//${val}`);
      this.hostname = hostname;
      this.port = port;
    }
  }
  get hostname() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_hostname, "f");
  }
  set hostname(val) {
    val && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val) && (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_hostname, val.trim(), "f");
  }
  get port() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_port, "f");
  }
  set port(val) {
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val) && (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_port, val.trim(), "f");
  }
  get pathname() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_pathname, "f");
  }
  set pathname(val) {
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      const HEAD_REG = /^(\/|\.\/|\.\.\/)/;
      let temp = val;
      while (HEAD_REG.test(temp)) {
        temp = temp.replace(HEAD_REG, '');
      }
      if (temp) (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_pathname, '/' + temp, "f");else (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_pathname, '/', "f");
    }
  }
  get search() {
    const val = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_search, "f").toString();
    return val.length === 0 || val.startsWith('?') ? val : `?${val}`;
  }
  set search(val) {
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_search, new _URLSearchParams_js__WEBPACK_IMPORTED_MODULE_2__.URLSearchParams(val), "f");
    }
  }
  get hash() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_hash, "f");
  }
  set hash(val) {
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      if (val) (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_hash, val.startsWith('#') ? val : `#${val}`, "f");else (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldSet)(this, _TaroURL_hash, '', "f");
    }
  }
  get href() {
    return `${this.protocol}//${this.host}${this.pathname}${this.search}${this.hash}`;
  }
  set href(val) {
    if (val && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      const {
        protocol,
        hostname,
        port,
        hash,
        search,
        pathname
      } = parseUrl(val);
      this.protocol = protocol;
      this.hostname = hostname;
      this.pathname = pathname;
      this.port = port;
      this.hash = hash;
      this.search = search;
    }
  }
  get origin() {
    return `${this.protocol}//${this.host}`;
  }
  set origin(val) {
    if (val && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(val)) {
      val = val.trim();
      const {
        protocol,
        hostname,
        port
      } = parseUrl(val);
      this.protocol = protocol;
      this.hostname = hostname;
      this.port = port;
    }
  }
  get searchParams() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _TaroURL_search, "f");
  }
  // public method
  toString() {
    return this.href;
  }
  toJSON() {
    return this.toString();
  }
  // convenient for deconstructor
  _toRaw() {
    return {
      protocol: this.protocol,
      port: this.port,
      host: this.host,
      hostname: this.hostname,
      pathname: this.pathname,
      hash: this.hash,
      search: this.search,
      origin: this.origin,
      href: this.href
    };
  }
}
_TaroURL_hash = new WeakMap(), _TaroURL_hostname = new WeakMap(), _TaroURL_pathname = new WeakMap(), _TaroURL_port = new WeakMap(), _TaroURL_protocol = new WeakMap(), _TaroURL_search = new WeakMap();
// Note: 小程序端 vite 打包成 commonjs，const URL = xxx 会报错，所以把 URL 改为 TaroURLProvider
const TaroURLProvider =  false ? 0 : TaroURL;
function parseUrl(url = '') {
  const result = {
    href: '',
    origin: '',
    protocol: '',
    hostname: '',
    host: '',
    port: '',
    pathname: '',
    search: '',
    hash: ''
  };
  if (!url || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isString)(url)) return result;
  url = url.trim();
  const PATTERN = /^(([^:/?#]+):)?\/\/(([^/?#]+):(.+)@)?([^/?#:]*)(:(\d+))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  const matches = url.match(PATTERN);
  if (!matches) return result;
  // TODO: username & password ?
  result.protocol = matches[1] || 'https:';
  result.hostname = matches[6] || 'taro.com';
  result.port = matches[8] || '';
  result.pathname = matches[9] || '/';
  result.search = matches[10] || '';
  result.hash = matches[12] || '';
  result.href = url;
  result.origin = result.protocol + '//' + result.hostname + (result.port ? `:${result.port}` : '');
  result.host = result.hostname + (result.port ? `:${result.port}` : '');
  return result;
}
function parseUrlBase(url, base) {
  const VALID_URL = /^(https?:)\/\//i;
  let fullUrl = '';
  let parsedBase = null;
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(base)) {
    base = String(base).trim();
    if (!VALID_URL.test(base)) throw new TypeError(`Failed to construct 'URL': Invalid base URL`);
    parsedBase = parseUrl(base);
  }
  url = String(url).trim();
  if (VALID_URL.test(url)) {
    fullUrl = url;
  } else if (parsedBase) {
    if (url) {
      if (url.startsWith('//')) {
        fullUrl = parsedBase.protocol + url;
      } else {
        fullUrl = parsedBase.origin + (url.startsWith('/') ? url : `/${url}`);
      }
    } else {
      fullUrl = parsedBase.href;
    }
  } else {
    throw new TypeError(`Failed to construct 'URL': Invalid URL`);
  }
  return parseUrl(fullUrl);
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/URLSearchParams.js":
/*!******************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/URLSearchParams.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   URLSearchParams: function() { return /* binding */ URLSearchParams; }
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");



var _dict, _a;
const findReg = /[!'()~]|%20|%00/g;
const plusReg = /\+/g;
const replaceCharMap = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+',
  '%00': '\x00'
};
function replacer(match) {
  return replaceCharMap[match];
}
function appendTo(dict, name, value) {
  const res = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(value) ? value.join(',') : value;
  if (name in dict) dict[name].push(res);else dict[name] = [res];
}
function addEach(value, key) {
  appendTo(this, key, value);
}
function decode(str) {
  return decodeURIComponent(str.replace(plusReg, ' '));
}
function encode(str) {
  return encodeURIComponent(str).replace(findReg, replacer);
}
const URLSearchParams =  false ? 0 : (_a = class {
  constructor(query) {
    _dict.set(this, Object.create(null));
    query !== null && query !== void 0 ? query : query = '';
    const dict = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
    if (typeof query === 'string') {
      if (query.charAt(0) === '?') {
        query = query.slice(1);
      }
      for (let pairs = query.split('&'), i = 0, length = pairs.length; i < length; i++) {
        const value = pairs[i];
        const index = value.indexOf('=');
        // 针对不规范的 url 参数做容错处理，如：word=你%好
        try {
          if (index > -1) {
            appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));
          } else if (value.length) {
            appendTo(dict, decode(value), '');
          }
        } catch (err) {
          if (true) {
            console.warn(`[Taro warn] URL 参数 ${value} decode 异常`);
          }
        }
      }
    } else {
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(query)) {
        for (let i = 0, length = query.length; i < length; i++) {
          const value = query[i];
          appendTo(dict, value[0], value[1]);
        }
      } else if (query.forEach) {
        query.forEach(addEach, dict);
      } else {
        for (const key in query) {
          appendTo(dict, key, query[key]);
        }
      }
    }
  }
  append(name, value) {
    appendTo((0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f"), name, value);
  }
  delete(name) {
    delete (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f")[name];
  }
  get(name) {
    const dict = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
    return name in dict ? dict[name][0] : null;
  }
  getAll(name) {
    const dict = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
    return name in dict ? dict[name].slice(0) : [];
  }
  has(name) {
    return name in (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
  }
  keys() {
    return Object.keys((0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f"));
  }
  set(name, value) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f")[name] = ['' + value];
  }
  forEach(callback, thisArg) {
    const dict = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
    Object.getOwnPropertyNames(dict).forEach(function (name) {
      dict[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  }
  toJSON() {
    return {};
  }
  toString() {
    const dict = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _dict, "f");
    const query = [];
    for (const key in dict) {
      const name = encode(key);
      for (let i = 0, value = dict[key]; i < value.length; i++) {
        query.push(name + '=' + encode(value[i]));
      }
    }
    return query.join('&');
  }
}, _dict = new WeakMap(), _a);


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/document.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/document.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   taroDocumentProvider: function() { return /* binding */ taroDocumentProvider; }
/* harmony export */ });
/* unused harmony export createTTDomDocument */
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/constants.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _dom_document_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dom/document.js */ "./node_modules/@tarojs/runtime/dist/dom/document.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");




function createDocument() {
  /**
     * <document>
     *   <html>
     *     <head></head>
     *     <body>
     *       <container>
     *         <app id="app" />
     *       </container>
     *     </body>
     *   </html>
     * </document>
     */
  const doc = new _dom_document_js__WEBPACK_IMPORTED_MODULE_0__.TaroDocument();
  const documentCreateElement = doc.createElement.bind(doc);
  const html = documentCreateElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.HTML);
  const head = documentCreateElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.HEAD);
  const body = documentCreateElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.BODY);
  const app = documentCreateElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.APP);
  app.id = _constants_index_js__WEBPACK_IMPORTED_MODULE_1__.APP;
  const container = documentCreateElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.CONTAINER); // 多包一层主要为了兼容 vue
  doc.appendChild(html);
  html.appendChild(head);
  html.appendChild(body);
  body.appendChild(container);
  container.appendChild(app);
  doc.documentElement = html;
  doc.head = head;
  doc.body = body;
  return doc;
}
function createTTDomDocument() {
  var _a;
  const document = tt === null || tt === void 0 ? void 0 : tt.appDocument;
  if (!document) {
    throw new Error('tt.appDocument is not found');
  }
  const html = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.HTML);
  const head = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.HEAD);
  const body = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.BODY);
  const app = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.APP);
  app.id = _constants_index_js__WEBPACK_IMPORTED_MODULE_1__.APP;
  const container = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.CONTAINER);
  const emptyFunction = () => {};
  document.childNodes.push(html);
  html.childNodes.push(head, body);
  body.childNodes.push(container);
  container.childNodes.push(app);
  document.documentElement = html;
  document.head = head;
  document.body = body;
  document.appElement = app;
  let builtInComponents = (_a = tt === null || tt === void 0 ? void 0 : tt.getBuiltInComponents) === null || _a === void 0 ? void 0 : _a.call(tt);
  if (Array.isArray(builtInComponents)) {
    builtInComponents = new Set(builtInComponents);
  } else if (!(builtInComponents instanceof Set)) {
    builtInComponents = new Set([..._tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_COMPONENTS, ..._tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.TT_SPECIFIC_COMPONENTS]);
  }
  document.getElementById = function getElementById(id) {
    if (id === 'app') {
      return app;
    } else {
      return Object.getPrototypeOf(this).getElementById.call(this, id);
    }
  };
  document.getLastPage = function getLastPage() {
    let last;
    for (const v of this._pageDocumentMap.values()) last = v;
    return last;
  };
  document.createElement = function (type, ...args) {
    if (type === 'root') {
      return this.getLastPage();
    } else {
      const el = builtInComponents.has(type) ? Object.getPrototypeOf(this).createElement.call(this, type, ...args) : Object.getPrototypeOf(this).createNativeComponent.call(this, type, {
        __tt__inner__options__: {
          name: type
        }
      });
      // 给元素加上 scopeId
      el.setAttribute('class', '');
      // 保存原始的 setAttribute 和 removeAttribute
      const originalSetAttribute = el.setAttribute.bind(el);
      const originalRemoveAttribute = el.removeAttribute.bind(el);
      // 拦截 setAttribute 来处理 catchMove
      el.setAttribute = function (name, value) {
        const result = originalSetAttribute(name, value);
        // 处理 catchMove 属性
        if (name === 'catchMove' && value) {
          el.addEventListener('catchtouchmove', emptyFunction);
        }
        return result;
      };
      // 拦截 removeAttribute 来处理 catchMove
      el.removeAttribute = function (name) {
        const oldValue = el.getAttribute(name);
        // 处理 catchMove 属性
        if (name === 'catchMove' && oldValue) {
          el.removeEventListener('catchtouchmove', emptyFunction);
        }
        return originalRemoveAttribute(name);
      };
      if (false) {}
      return el;
    }
  };
  return document;
}
// Note: 小程序端 vite 打包成 commonjs，const document = xxx 会报错，所以把 document 改为 taroDocumentProvider
const taroDocumentProvider =  false ? 0 : _env_js__WEBPACK_IMPORTED_MODULE_3__["default"].document = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isEnableTTDom)() ? createTTDomDocument() : createDocument();


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/getComputedStyle.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/getComputedStyle.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   taroGetComputedStyleProvider: function() { return /* binding */ taroGetComputedStyleProvider; }
/* harmony export */ });


// Note: 小程序端 vite 打包成 commonjs，const getComputedStyle = xxx 会报错，所以把 GetComputedStyle 改为 taroGetComputedStyleProvider
const taroGetComputedStyleProvider =  false ? 0 : function (element) {
  return element.style;
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/history.js":
/*!**********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/history.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   History: function() { return /* binding */ History; }
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _utils_cache_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/cache.js */ "./node_modules/@tarojs/runtime/dist/utils/cache.js");






var _TaroHistory_instances, _TaroHistory_location, _TaroHistory_stack, _TaroHistory_cur, _TaroHistory_window, _TaroHistory_reset;
const cache = new _utils_cache_js__WEBPACK_IMPORTED_MODULE_0__.RuntimeCache('history');
class TaroHistory extends _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.Events {
  constructor(location, options) {
    super();
    _TaroHistory_instances.add(this);
    /* private property */
    _TaroHistory_location.set(this, void 0);
    _TaroHistory_stack.set(this, []);
    _TaroHistory_cur.set(this, 0);
    _TaroHistory_window.set(this, void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_window, options.window, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_location, location, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").on('__record_history__', href => {
      var _a;
      (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_cur, (_a = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f"), _a++, _a), "f");
      (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_stack, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").slice(0, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")), "f");
      (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").push({
        state: null,
        title: '',
        url: href
      });
    }, null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").on('__reset_history__', href => {
      (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_instances, "m", _TaroHistory_reset).call(this, href);
    }, null);
    // 切换上下文行为
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.INIT, () => {
      (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_instances, "m", _TaroHistory_reset).call(this);
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.RESTORE, pageId => {
      cache.set(pageId, {
        location: (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f"),
        stack: (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").slice(),
        cur: (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")
      });
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.RECOVER, pageId => {
      if (cache.has(pageId)) {
        const ctx = cache.get(pageId);
        (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_location, ctx.location, "f");
        (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_stack, ctx.stack, "f");
        (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_cur, ctx.cur, "f");
      }
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.DESTROY, pageId => {
      cache.delete(pageId);
    }, null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_instances, "m", _TaroHistory_reset).call(this);
  }
  /* public property */
  get length() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").length;
  }
  get state() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f")[(0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")].state;
  }
  /* public method */
  go(delta) {
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isNumber)(delta) || isNaN(delta)) return;
    let targetIdx = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f") + delta;
    targetIdx = Math.min(Math.max(targetIdx, 0), this.length - 1);
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_cur, targetIdx, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").trigger('__set_href_without_history__', (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f")[(0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")].url);
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_window, "f").trigger('popstate', (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f")[(0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")]);
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  pushState(state, title, url) {
    if (!url || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isString)(url)) return;
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_stack, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").slice(0, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f") + 1), "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f").push({
      state,
      title,
      url
    });
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_cur, this.length - 1, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").trigger('__set_href_without_history__', url);
  }
  replaceState(state, title, url) {
    if (!url || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isString)(url)) return;
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_stack, "f")[(0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_cur, "f")] = {
      state,
      title,
      url
    };
    (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").trigger('__set_href_without_history__', url);
  }
  // For debug
  get cache() {
    return cache;
  }
}
_TaroHistory_location = new WeakMap(), _TaroHistory_stack = new WeakMap(), _TaroHistory_cur = new WeakMap(), _TaroHistory_window = new WeakMap(), _TaroHistory_instances = new WeakSet(), _TaroHistory_reset = function _TaroHistory_reset(href = '') {
  (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_stack, [{
    state: null,
    title: '',
    url: href || (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldGet)(this, _TaroHistory_location, "f").href
  }], "f");
  (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__classPrivateFieldSet)(this, _TaroHistory_cur, 0, "f");
};
const History =  false ? 0 : TaroHistory;


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/location.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/location.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Location: function() { return /* binding */ Location; }
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _current_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../current.js */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _utils_cache_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/cache.js */ "./node_modules/@tarojs/runtime/dist/utils/cache.js");
/* harmony import */ var _URL_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./URL.js */ "./node_modules/@tarojs/runtime/dist/bom/URL.js");








var _TaroLocation_instances, _TaroLocation_url, _TaroLocation_noCheckUrl, _TaroLocation_window, _TaroLocation_reset, _TaroLocation_getPreValue, _TaroLocation_rollBack, _TaroLocation_recordHistory, _TaroLocation_checkUrlChange;
const INIT_URL = 'https://taro.com';
const cache = new _utils_cache_js__WEBPACK_IMPORTED_MODULE_0__.RuntimeCache('location');
class TaroLocation extends _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.Events {
  constructor(options) {
    super();
    _TaroLocation_instances.add(this);
    /* private property */
    _TaroLocation_url.set(this, new _URL_js__WEBPACK_IMPORTED_MODULE_2__.TaroURLProvider(INIT_URL));
    _TaroLocation_noCheckUrl.set(this, false);
    _TaroLocation_window.set(this, void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_window, options.window, "f");
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_reset).call(this);
    this.on('__set_href_without_history__', href => {
      (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_noCheckUrl, true, "f");
      const lastHash = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hash;
      (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").href = generateFullUrl(href);
      if (lastHash !== (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hash) {
        (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_window, "f").trigger('hashchange');
      }
      (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_noCheckUrl, false, "f");
    }, null);
    // 切换上下文行为
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_4__.CONTEXT_ACTIONS.INIT, () => {
      (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_reset).call(this);
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_4__.CONTEXT_ACTIONS.RESTORE, pageId => {
      cache.set(pageId, {
        lastHref: this.href
      });
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_4__.CONTEXT_ACTIONS.RECOVER, pageId => {
      // 数据恢复时，不需要执行跳转
      if (cache.has(pageId)) {
        const ctx = cache.get(pageId);
        (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_noCheckUrl, true, "f");
        (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").href = ctx.lastHref;
        (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_noCheckUrl, false, "f");
      }
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_4__.CONTEXT_ACTIONS.DESTROY, pageId => {
      cache.delete(pageId);
    }, null);
  }
  /* public property */
  get protocol() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").protocol;
  }
  set protocol(val) {
    const REG = /^(http|https):$/i;
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val) || !REG.test(val.trim())) return;
    val = val.trim();
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").protocol = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get host() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").host;
  }
  set host(val) {
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val)) return;
    val = val.trim();
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").host = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get hostname() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hostname;
  }
  set hostname(val) {
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val)) return;
    val = val.trim();
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hostname = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get port() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").port;
  }
  set port(val) {
    const xVal = Number(val = val.trim());
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isNumber)(xVal) || xVal <= 0) return;
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").port = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get pathname() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").pathname;
  }
  set pathname(val) {
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val)) return;
    val = val.trim();
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").pathname = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get search() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").search;
  }
  set search(val) {
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val)) return;
    val = val.trim();
    val = val.startsWith('?') ? val : `?${val}`;
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").search = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get hash() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hash;
  }
  // 小程序的navigateTo存在截断hash字符串的问题
  set hash(val) {
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val)) return;
    val = val.trim();
    val = val.startsWith('#') ? val : `#${val}`;
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").hash = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get href() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").href;
  }
  set href(val) {
    const REG = /^(http:|https:)?\/\/.+/;
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val) || !REG.test(val = val.trim())) return;
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").href = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  get origin() {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").origin;
  }
  set origin(val) {
    const REG = /^(http:|https:)?\/\/.+/;
    if (!val || !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.isString)(val) || !REG.test(val = val.trim())) return;
    const preValue = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_getPreValue).call(this);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").origin = val;
    if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_checkUrlChange).call(this, preValue)) (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_recordHistory).call(this);
  }
  /* public method */
  assign() {
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_6__.warn)(true, '小程序环境中调用location.assign()无效.');
  }
  reload() {
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_6__.warn)(true, '小程序环境中调用location.reload()无效.');
  }
  replace(url) {
    this.trigger('__set_href_without_history__', url);
  }
  toString() {
    return this.href;
  }
  // For debug
  get cache() {
    return cache;
  }
}
_TaroLocation_url = new WeakMap(), _TaroLocation_noCheckUrl = new WeakMap(), _TaroLocation_window = new WeakMap(), _TaroLocation_instances = new WeakSet(), _TaroLocation_reset = function _TaroLocation_reset() {
  const Current = (0,_current_js__WEBPACK_IMPORTED_MODULE_7__.getCurrentInstance)();
  const router = Current.router;
  if (router) {
    const {
      path,
      params
    } = router;
    const searchArr = Object.keys(params).map(key => {
      return `${key}=${params[key]}`;
    });
    const searchStr = searchArr.length > 0 ? '?' + searchArr.join('&') : '';
    const url = `${INIT_URL}${path.startsWith('/') ? path : '/' + path}${searchStr}`;
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldSet)(this, _TaroLocation_url, new _URL_js__WEBPACK_IMPORTED_MODULE_2__.TaroURLProvider(url), "f");
    this.trigger('__reset_history__', this.href);
  }
}, _TaroLocation_getPreValue = function _TaroLocation_getPreValue() {
  return (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f")._toRaw();
}, _TaroLocation_rollBack = function _TaroLocation_rollBack(href) {
  (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f").href = href;
}, _TaroLocation_recordHistory = function _TaroLocation_recordHistory() {
  this.trigger('__record_history__', this.href);
}, _TaroLocation_checkUrlChange = function _TaroLocation_checkUrlChange(preValue) {
  if ((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_noCheckUrl, "f")) {
    return false;
  }
  const {
    protocol,
    hostname,
    port,
    pathname,
    search,
    hash
  } = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_url, "f")._toRaw();
  // 跨域三要素不允许修改
  if (protocol !== preValue.protocol || hostname !== preValue.hostname || port !== preValue.port) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_rollBack).call(this, preValue.href);
    return false;
  }
  // pathname
  if (pathname !== preValue.pathname) {
    return true;
  }
  // search
  if (search !== preValue.search) {
    return true;
  }
  // hashchange
  if (hash !== preValue.hash) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_window, "f").trigger('hashchange');
    return true;
  }
  (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__classPrivateFieldGet)(this, _TaroLocation_instances, "m", _TaroLocation_rollBack).call(this, preValue.href);
  return false;
};
const Location =  false ? 0 : TaroLocation;
function generateFullUrl(val = '') {
  const origin = INIT_URL;
  if (/^[/?#]/.test(val)) {
    return origin + val;
  }
  return val;
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/navigator.js":
/*!************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/navigator.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nav: function() { return /* binding */ nav; }
/* harmony export */ });

const machine = 'Macintosh';
const arch = 'Intel Mac OS X 10_14_5';
const engine = 'AppleWebKit/534.36 (KHTML, like Gecko) NodeJS/v4.1.0 Chrome/76.0.3809.132 Safari/534.36';
const msg = '(' + machine + '; ' + arch + ') ' + engine;
const nav =  false ? 0 : {
  appCodeName: 'Mozilla',
  appName: 'Netscape',
  appVersion: '5.0 ' + msg,
  cookieEnabled: true,
  mimeTypes: [],
  onLine: true,
  platform: 'MacIntel',
  plugins: [],
  product: 'Taro',
  productSub: '20030107',
  userAgent: 'Mozilla/5.0 ' + msg,
  vendor: 'Joyent',
  vendorSub: ''
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/raf.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/raf.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   caf: function() { return /* binding */ _caf; },
/* harmony export */   now: function() { return /* binding */ now; },
/* harmony export */   raf: function() { return /* binding */ _raf; }
/* harmony export */ });
// https://github.com/myrne/performance-now
let now;
(function () {
  let loadTime;
  if (typeof performance !== 'undefined' && performance !== null && performance.now) {
    now = () => performance.now();
  } else if (Date.now) {
    loadTime = Date.now();
    now = () => Date.now() - loadTime;
  } else {
    loadTime = new Date().getTime();
    now = () => new Date().getTime() - loadTime;
  }
})();
let lastTime = 0;
// https://gist.github.com/paulirish/1579671
// https://gist.github.com/jalbam/5fe05443270fa6d8136238ec72accbc0
const _raf =  false ? 0 : function (callback) {
  const _now = now();
  const nextTime = Math.max(lastTime + 16, _now); // First time will execute it immediately but barely noticeable and performance is gained.
  return setTimeout(function () {
    callback(lastTime = nextTime);
  }, nextTime - _now);
};
const _caf =  false ? 0 : function (seed) {
  // fix https://github.com/NervJS/taro/issues/7749
  clearTimeout(seed);
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/bom/window.js":
/*!*********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/bom/window.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   taroHistoryProvider: function() { return /* binding */ taroHistoryProvider; },
/* harmony export */   taroLocationProvider: function() { return /* binding */ taroLocationProvider; },
/* harmony export */   taroWindowProvider: function() { return /* binding */ taroWindowProvider; }
/* harmony export */ });
/* unused harmony export TaroWindow */
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _getComputedStyle_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./getComputedStyle.js */ "./node_modules/@tarojs/runtime/dist/bom/getComputedStyle.js");
/* harmony import */ var _history_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./history.js */ "./node_modules/@tarojs/runtime/dist/bom/history.js");
/* harmony import */ var _location_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./location.js */ "./node_modules/@tarojs/runtime/dist/bom/location.js");
/* harmony import */ var _navigator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./navigator.js */ "./node_modules/@tarojs/runtime/dist/bom/navigator.js");
/* harmony import */ var _raf_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./raf.js */ "./node_modules/@tarojs/runtime/dist/bom/raf.js");









class TaroWindow extends _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.Events {
  constructor() {
    super();
    this.navigator = _navigator_js__WEBPACK_IMPORTED_MODULE_1__.nav;
    this.requestAnimationFrame = _raf_js__WEBPACK_IMPORTED_MODULE_2__.raf;
    this.cancelAnimationFrame = _raf_js__WEBPACK_IMPORTED_MODULE_2__.caf;
    this.getComputedStyle = _getComputedStyle_js__WEBPACK_IMPORTED_MODULE_3__.taroGetComputedStyleProvider;
    const globalProperties = [...Object.getOwnPropertyNames(__webpack_require__.g || {}), ...Object.getOwnPropertySymbols(__webpack_require__.g || {})];
    globalProperties.forEach(property => {
      if (property === 'atob' || property === 'document') return;
      if (!Object.prototype.hasOwnProperty.call(this, property)) {
        // 防止小程序环境下，window 上的某些 get 属性在赋值时报错
        try {
          this[property] = __webpack_require__.g[property];
        } catch (e) {
          if (true) {
            console.warn(`[Taro warn] window.${String(property)} 在赋值到 window 时报错`);
          }
        }
      }
    });
    this.Date || (this.Date = Date);
    // 应用启动时，提供给需要读取历史信息的库使用
    this.location = new _location_js__WEBPACK_IMPORTED_MODULE_4__.Location({
      window: this
    });
    // @ts-ignore
    this.history = new _history_js__WEBPACK_IMPORTED_MODULE_5__.History(this.location, {
      window: this
    });
    this.initEvent();
  }
  initEvent() {
    const _location = this.location;
    const _history = this.history;
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.INIT, pageId => {
      // 页面 onload，为该页面建立新的上下文信息
      _location.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.INIT, pageId);
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RECOVER, pageId => {
      // 页面 onshow，恢复当前页面的上下文信息
      _location.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RECOVER, pageId);
      _history.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RECOVER, pageId);
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RESTORE, pageId => {
      // 页面 onhide，缓存当前页面的上下文信息
      _location.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RESTORE, pageId);
      _history.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.RESTORE, pageId);
    }, null);
    this.on(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.DESTROY, pageId => {
      // 页面 onunload，清除当前页面的上下文信息
      _location.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.DESTROY, pageId);
      _history.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_6__.CONTEXT_ACTIONS.DESTROY, pageId);
    }, null);
  }
  get document() {
    return _env_js__WEBPACK_IMPORTED_MODULE_7__["default"].document;
  }
  addEventListener(event, callback) {
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_8__.isString)(event)) return;
    this.on(event, callback, null);
  }
  removeEventListener(event, callback) {
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_8__.isString)(event)) return;
    this.off(event, callback, null);
  }
  setTimeout(...args) {
    return setTimeout(...args);
  }
  clearTimeout(...args) {
    return clearTimeout(...args);
  }
}
// Note: 小程序端 vite 打包成 commonjs，const window = xxx 会报错，所以把 window 改为 taroWindowProvider，location 和 history 同理
const taroWindowProvider =  false ? 0 : _env_js__WEBPACK_IMPORTED_MODULE_7__["default"].window = new TaroWindow();
const taroLocationProvider = taroWindowProvider.location;
const taroHistoryProvider = taroWindowProvider.history;


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/constants/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/constants/index.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: function() { return /* binding */ A; },
/* harmony export */   APP: function() { return /* binding */ APP; },
/* harmony export */   BEHAVIORS: function() { return /* binding */ BEHAVIORS; },
/* harmony export */   BODY: function() { return /* binding */ BODY; },
/* harmony export */   CATCHMOVE: function() { return /* binding */ CATCHMOVE; },
/* harmony export */   CATCH_VIEW: function() { return /* binding */ CATCH_VIEW; },
/* harmony export */   CHANGE: function() { return /* binding */ CHANGE; },
/* harmony export */   CLASS: function() { return /* binding */ CLASS; },
/* harmony export */   CLICK_VIEW: function() { return /* binding */ CLICK_VIEW; },
/* harmony export */   COMMENT: function() { return /* binding */ COMMENT; },
/* harmony export */   COMPILE_MODE: function() { return /* binding */ COMPILE_MODE; },
/* harmony export */   CONFIRM: function() { return /* binding */ CONFIRM; },
/* harmony export */   CONTAINER: function() { return /* binding */ CONTAINER; },
/* harmony export */   CONTEXT_ACTIONS: function() { return /* binding */ CONTEXT_ACTIONS; },
/* harmony export */   CURRENT_TARGET: function() { return /* binding */ CURRENT_TARGET; },
/* harmony export */   CUSTOM_WRAPPER: function() { return /* binding */ CUSTOM_WRAPPER; },
/* harmony export */   DATASET: function() { return /* binding */ DATASET; },
/* harmony export */   DATE: function() { return /* binding */ DATE; },
/* harmony export */   DOCUMENT_ELEMENT_NAME: function() { return /* binding */ DOCUMENT_ELEMENT_NAME; },
/* harmony export */   DOCUMENT_FRAGMENT: function() { return /* binding */ DOCUMENT_FRAGMENT; },
/* harmony export */   EVENT_CALLBACK_RESULT: function() { return /* binding */ EVENT_CALLBACK_RESULT; },
/* harmony export */   EXTERNAL_CLASSES: function() { return /* binding */ EXTERNAL_CLASSES; },
/* harmony export */   FOCUS: function() { return /* binding */ FOCUS; },
/* harmony export */   HEAD: function() { return /* binding */ HEAD; },
/* harmony export */   HOOKS_APP_ID: function() { return /* binding */ HOOKS_APP_ID; },
/* harmony export */   HTML: function() { return /* binding */ HTML; },
/* harmony export */   ID: function() { return /* binding */ ID; },
/* harmony export */   INPUT: function() { return /* binding */ INPUT; },
/* harmony export */   KEY_CODE: function() { return /* binding */ KEY_CODE; },
/* harmony export */   OBJECT: function() { return /* binding */ OBJECT; },
/* harmony export */   ON_HIDE: function() { return /* binding */ ON_HIDE; },
/* harmony export */   ON_LOAD: function() { return /* binding */ ON_LOAD; },
/* harmony export */   ON_READY: function() { return /* binding */ ON_READY; },
/* harmony export */   ON_SHOW: function() { return /* binding */ ON_SHOW; },
/* harmony export */   OPTIONS: function() { return /* binding */ OPTIONS; },
/* harmony export */   PAGE_INIT: function() { return /* binding */ PAGE_INIT; },
/* harmony export */   PROPERTY_THRESHOLD: function() { return /* binding */ PROPERTY_THRESHOLD; },
/* harmony export */   PROPS: function() { return /* binding */ PROPS; },
/* harmony export */   PURE_VIEW: function() { return /* binding */ PURE_VIEW; },
/* harmony export */   ROOT_STR: function() { return /* binding */ ROOT_STR; },
/* harmony export */   SET_DATA: function() { return /* binding */ SET_DATA; },
/* harmony export */   SET_TIMEOUT: function() { return /* binding */ SET_TIMEOUT; },
/* harmony export */   STATIC_VIEW: function() { return /* binding */ STATIC_VIEW; },
/* harmony export */   STYLE: function() { return /* binding */ STYLE; },
/* harmony export */   TARGET: function() { return /* binding */ TARGET; },
/* harmony export */   TARO_RUNTIME: function() { return /* binding */ TARO_RUNTIME; },
/* harmony export */   TIME_STAMP: function() { return /* binding */ TIME_STAMP; },
/* harmony export */   TOUCHMOVE: function() { return /* binding */ TOUCHMOVE; },
/* harmony export */   TYPE: function() { return /* binding */ TYPE; },
/* harmony export */   UID: function() { return /* binding */ UID; },
/* harmony export */   VALUE: function() { return /* binding */ VALUE; },
/* harmony export */   VIEW: function() { return /* binding */ VIEW; }
/* harmony export */ });
const PROPERTY_THRESHOLD = 2046;
const TARO_RUNTIME = 'Taro runtime';
const HOOKS_APP_ID = 'taro-app';
const SET_DATA = '小程序 setData';
const PAGE_INIT = '页面初始化';
const ROOT_STR = 'root';
const HTML = 'html';
const HEAD = 'head';
const BODY = 'body';
const APP = 'app';
const CONTAINER = 'container';
const DOCUMENT_ELEMENT_NAME = '#document';
const DOCUMENT_FRAGMENT = 'document-fragment';
const ID = 'id';
const UID = 'uid';
const CLASS = 'class';
const STYLE = 'style';
const FOCUS = 'focus';
const VIEW = 'view';
const STATIC_VIEW = 'static-view';
const PURE_VIEW = 'pure-view';
const CLICK_VIEW = 'click-view';
const PROPS = 'props';
const DATASET = 'dataset';
const OBJECT = 'object';
const VALUE = 'value';
const INPUT = 'input';
const CHANGE = 'change';
const CUSTOM_WRAPPER = 'custom-wrapper';
const TARGET = 'target';
const CURRENT_TARGET = 'currentTarget';
const TYPE = 'type';
const CONFIRM = 'confirm';
const TIME_STAMP = 'timeStamp';
const KEY_CODE = 'keyCode';
const TOUCHMOVE = 'touchmove';
const DATE = 'Date';
const SET_TIMEOUT = 'setTimeout';
const COMPILE_MODE = 'compileMode';
const CATCHMOVE = 'catchMove';
const CATCH_VIEW = 'catch-view';
const COMMENT = 'comment';
const ON_LOAD = 'onLoad';
const ON_READY = 'onReady';
const ON_SHOW = 'onShow';
const ON_HIDE = 'onHide';
const OPTIONS = 'options';
const EXTERNAL_CLASSES = 'externalClasses';
const EVENT_CALLBACK_RESULT = 'e_result';
const BEHAVIORS = 'behaviors';
const A = 'a';
// 页面上下文切换时的行为
var CONTEXT_ACTIONS;
(function (CONTEXT_ACTIONS) {
  CONTEXT_ACTIONS["INIT"] = "0";
  CONTEXT_ACTIONS["RESTORE"] = "1";
  CONTEXT_ACTIONS["RECOVER"] = "2";
  CONTEXT_ACTIONS["DESTROY"] = "3";
})(CONTEXT_ACTIONS || (CONTEXT_ACTIONS = {}));


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/current.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/current.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Current: function() { return /* binding */ Current; },
/* harmony export */   getCurrentInstance: function() { return /* binding */ getCurrentInstance; }
/* harmony export */ });
const Current = {
  app: null,
  router: null,
  page: null
};
const getCurrentInstance = () => Current;


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/element.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/element.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getBoundingClientRectImpl: function() { return /* binding */ getBoundingClientRectImpl; }
/* harmony export */ });
/* unused harmony export getTemplateContent */
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../options.js */ "./node_modules/@tarojs/runtime/dist/options.js");


function getBoundingClientRectImpl() {
  if (!_options_js__WEBPACK_IMPORTED_MODULE_0__.options.miniGlobal) return Promise.resolve(null);
  return new Promise(resolve => {
    const query = _options_js__WEBPACK_IMPORTED_MODULE_0__.options.miniGlobal.createSelectorQuery();
    // ref: https://opendocs.alipay.com/mini/api/na4yun
    if (false) {}
    query.select(`#${this.uid}`).boundingClientRect(res => {
      resolve(res);
    }).exec();
  });
}
function getTemplateContent(ctx) {
  if (ctx.nodeName === 'template') {
    const document = ctx.ownerDocument;
    const content = document.createElement(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.DOCUMENT_FRAGMENT);
    content.childNodes = ctx.childNodes;
    ctx.childNodes = [content];
    content.parentNode = ctx;
    content.childNodes.forEach(nodes => {
      nodes.parentNode = content;
    });
    return content;
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/index.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/constants.js");
/* harmony import */ var _dom_element_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");
/* harmony import */ var _dom_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dom/node.js */ "./node_modules/@tarojs/runtime/dist/dom/node.js");
/* harmony import */ var _inner_html_html_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./inner-html/html.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/html.js");
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom-external/element.js");






if ("mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_TYPE.WEB && "mini" !== _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_TYPE.HARMONY) {
  if (true) {
    _dom_node_js__WEBPACK_IMPORTED_MODULE_1__.TaroNode.extend('innerHTML', {
      set(html) {
        _inner_html_html_js__WEBPACK_IMPORTED_MODULE_2__.setInnerHTML.call(this, this, html);
      },
      get() {
        return '';
      }
    });
    if (false) {}
  }
  if (false) {}
  if (false) {}
  if (true) {
    _dom_element_js__WEBPACK_IMPORTED_MODULE_3__.TaroElement.extend('getBoundingClientRect', _element_js__WEBPACK_IMPORTED_MODULE_4__.getBoundingClientRectImpl);
  }
  if (false) {}
}

/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/html.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/html.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setInnerHTML: function() { return /* binding */ setInnerHTML; }
/* harmony export */ });
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../options.js */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _parser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parser.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/parser.js");



_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html = {
  skipElements: new Set(['style', 'script']),
  voidElements: new Set(['!doctype', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']),
  closingElements: new Set(['html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option', 'thead', 'th', 'tbody', 'tr', 'td', 'tfoot', 'colgroup']),
  renderHTMLTag: false
};
function setInnerHTML(element, html) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  let {
    ownerDocument
  } = element;
  if (false) {}
  const children = (0,_parser_js__WEBPACK_IMPORTED_MODULE_1__.parser)(html, ownerDocument);
  for (let i = 0; i < children.length; i++) {
    element.appendChild(children[i]);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/parser.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/parser.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parser: function() { return /* binding */ parser; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../options.js */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _scanner_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./scanner.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/scanner.js");
/* harmony import */ var _style_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./style.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/style.js");
/* harmony import */ var _tags_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tags.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/tags.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/utils.js");






const closingTagAncestorBreakers = {
  li: ['ul', 'ol', 'menu'],
  dt: ['dl'],
  dd: ['dl'],
  tbody: ['table'],
  thead: ['table'],
  tfoot: ['table'],
  tr: ['table'],
  td: ['table']
};
function hasTerminalParent(tagName, stack) {
  const tagParents = closingTagAncestorBreakers[tagName];
  if (tagParents) {
    let currentIndex = stack.length - 1;
    while (currentIndex >= 0) {
      const parentTagName = stack[currentIndex].tagName;
      if (parentTagName === tagName) {
        break;
      }
      if (tagParents && tagParents.includes(parentTagName)) {
        return true;
      }
      currentIndex--;
    }
  }
  return false;
}
function getTagName(tag) {
  if (_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.renderHTMLTag) {
    return tag;
  }
  if (_tags_js__WEBPACK_IMPORTED_MODULE_1__.specialMiniElements[tag]) {
    return _tags_js__WEBPACK_IMPORTED_MODULE_1__.specialMiniElements[tag];
  } else if ((0,_tags_js__WEBPACK_IMPORTED_MODULE_1__.isMiniElements)(tag)) {
    return tag;
  } else if ((0,_tags_js__WEBPACK_IMPORTED_MODULE_1__.isBlockElements)(tag)) {
    return 'view';
  } else if ((0,_tags_js__WEBPACK_IMPORTED_MODULE_1__.isInlineElements)(tag)) {
    return 'text';
  }
  return 'view';
}
function splitEqual(str) {
  const sep = '=';
  const idx = str.indexOf(sep);
  if (idx === -1) return [str];
  const key = str.slice(0, idx).trim();
  const value = str.slice(idx + sep.length).trim();
  return [key, value];
}
function format(children, document, styleOptions, parent) {
  return children.filter(child => {
    // 过滤注释和空文本节点
    if (child.type === 'comment') {
      return false;
    } else if (child.type === 'text') {
      return child.content !== '';
    }
    return true;
  }).map(child => {
    // 文本节点
    if (child.type === 'text') {
      let text = document.createTextNode(child.content);
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isFunction)(_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.transformText)) {
        text = _options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.transformText(text, child);
      }
      parent === null || parent === void 0 ? void 0 : parent.appendChild(text);
      return text;
    }
    const el = document.createElement(getTagName(child.tagName));
    el.h5tagName = child.tagName;
    parent === null || parent === void 0 ? void 0 : parent.appendChild(el);
    if (!_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.renderHTMLTag) {
      el.className = `h5-${child.tagName}`;
    }
    for (let i = 0; i < child.attributes.length; i++) {
      const attr = child.attributes[i];
      const [key, value] = splitEqual(attr);
      if (key === 'class') {
        el.className += ' ' + (0,_utils_js__WEBPACK_IMPORTED_MODULE_3__.unquote)(value);
      } else if (key[0] === 'o' && key[1] === 'n') {
        continue;
      } else {
        el.setAttribute(key, value == null ? true : (0,_utils_js__WEBPACK_IMPORTED_MODULE_3__.unquote)(value));
      }
    }
    const {
      styleTagParser,
      descendantList
    } = styleOptions;
    const list = descendantList.slice();
    const style = styleTagParser.matchStyle(child.tagName, el, list);
    el.setAttribute('style', style + el.style.cssText);
    // console.log('style, ', style)
    format(child.children, document, {
      styleTagParser,
      descendantList: list
    }, el);
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isFunction)(_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.transformElement)) {
      return _options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.transformElement(el, child);
    }
    return el;
  });
}
function parser(html, document) {
  const styleTagParser = new _style_js__WEBPACK_IMPORTED_MODULE_4__["default"]();
  html = styleTagParser.extractStyle(html);
  const tokens = new _scanner_js__WEBPACK_IMPORTED_MODULE_5__.Scanner(html).scan();
  const root = {
    tagName: '',
    children: [],
    type: 'element',
    attributes: []
  };
  const state = {
    tokens,
    cursor: 0,
    stack: [root]
  };
  parse(state);
  return format(root.children, document, {
    styleTagParser,
    descendantList: Array(styleTagParser.styles.length).fill(0)
  });
}
function parse(state) {
  const {
    tokens,
    stack
  } = state;
  let {
    cursor
  } = state;
  const len = tokens.length;
  let nodes = stack[stack.length - 1].children;
  while (cursor < len) {
    const token = tokens[cursor];
    if (token.type !== 'tag-start') {
      // comment or text
      nodes.push(token);
      cursor++;
      continue;
    }
    const tagToken = tokens[++cursor];
    cursor++;
    const tagName = tagToken.content.toLowerCase();
    if (token.close) {
      let index = stack.length;
      let shouldRewind = false;
      while (--index > -1) {
        if (stack[index].tagName === tagName) {
          shouldRewind = true;
          break;
        }
      }
      while (cursor < len) {
        const endToken = tokens[cursor];
        if (endToken.type !== 'tag-end') break;
        cursor++;
      }
      if (shouldRewind) {
        stack.splice(index);
        break;
      } else {
        continue;
      }
    }
    const isClosingTag = _options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.closingElements.has(tagName);
    let shouldRewindToAutoClose = isClosingTag;
    if (shouldRewindToAutoClose) {
      shouldRewindToAutoClose = !hasTerminalParent(tagName, stack);
    }
    if (shouldRewindToAutoClose) {
      let currentIndex = stack.length - 1;
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          stack.splice(currentIndex);
          const previousIndex = currentIndex - 1;
          nodes = stack[previousIndex].children;
          break;
        }
        currentIndex = currentIndex - 1;
      }
    }
    const attributes = [];
    let attrToken;
    while (cursor < len) {
      attrToken = tokens[cursor];
      if (attrToken.type === 'tag-end') break;
      attributes.push(attrToken.content);
      cursor++;
    }
    cursor++;
    const children = [];
    const element = {
      type: 'element',
      tagName: tagToken.content,
      attributes,
      children
    };
    nodes.push(element);
    const hasChildren = !(attrToken.close || _options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.voidElements.has(tagName));
    if (hasChildren) {
      stack.push({
        tagName,
        children
      });
      const innerState = {
        tokens,
        cursor,
        stack
      };
      parse(innerState);
      cursor = innerState.cursor;
    }
  }
  state.cursor = cursor;
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/scanner.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/scanner.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scanner: function() { return /* binding */ Scanner; }
/* harmony export */ });
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../options.js */ "./node_modules/@tarojs/runtime/dist/options.js");

function initPosition() {
  return {
    index: 0,
    column: 0,
    line: 0
  };
}
function feedPosition(position, str, len) {
  const start = position.index;
  const end = position.index = start + len;
  for (let i = start; i < end; i++) {
    const char = str.charAt(i);
    if (char === '\n') {
      position.line++;
      position.column = 0;
    } else {
      position.column++;
    }
  }
}
function jumpPosition(position, str, end) {
  const len = end - position.index;
  return feedPosition(position, str, len);
}
function copyPosition(position) {
  return {
    index: position.index,
    line: position.line,
    column: position.column
  };
}
const whitespace = /\s/;
function isWhitespaceChar(char) {
  return whitespace.test(char);
}
const equalSign = /=/;
function isEqualSignChar(char) {
  return equalSign.test(char);
}
function shouldBeIgnore(tagName) {
  const name = tagName.toLowerCase();
  if (_options_js__WEBPACK_IMPORTED_MODULE_0__.options.html.skipElements.has(name)) {
    return true;
  }
  return false;
}
const alphanumeric = /[A-Za-z0-9]/;
function findTextEnd(str, index) {
  while (true) {
    const textEnd = str.indexOf('<', index);
    if (textEnd === -1) {
      return textEnd;
    }
    const char = str.charAt(textEnd + 1);
    if (char === '/' || char === '!' || alphanumeric.test(char)) {
      return textEnd;
    }
    index = textEnd + 1;
  }
}
function isWordEnd(cursor, wordBegin, html) {
  if (!isWhitespaceChar(html.charAt(cursor))) return false;
  const len = html.length;
  // backward
  for (let i = cursor - 1; i > wordBegin; i--) {
    const char = html.charAt(i);
    if (!isWhitespaceChar(char)) {
      if (isEqualSignChar(char)) return false;
      break;
    }
  }
  // forward
  for (let i = cursor + 1; i < len; i++) {
    const char = html.charAt(i);
    if (!isWhitespaceChar(char)) {
      if (isEqualSignChar(char)) return false;
      return true;
    }
  }
}
class Scanner {
  constructor(html) {
    this.tokens = [];
    this.position = initPosition();
    this.html = html;
  }
  scan() {
    const {
      html,
      position
    } = this;
    const len = html.length;
    while (position.index < len) {
      const start = position.index;
      this.scanText();
      if (position.index === start) {
        const isComment = html.startsWith('!--', start + 1);
        if (isComment) {
          this.scanComment();
        } else {
          const tagName = this.scanTag();
          if (shouldBeIgnore(tagName)) {
            this.scanSkipTag(tagName);
          }
        }
      }
    }
    return this.tokens;
  }
  scanText() {
    const type = 'text';
    const {
      html,
      position
    } = this;
    let textEnd = findTextEnd(html, position.index);
    if (textEnd === position.index) {
      return;
    }
    if (textEnd === -1) {
      textEnd = html.length;
    }
    const start = copyPosition(position);
    const content = html.slice(position.index, textEnd);
    jumpPosition(position, html, textEnd);
    const end = copyPosition(position);
    this.tokens.push({
      type,
      content,
      position: {
        start,
        end
      }
    });
  }
  scanComment() {
    const type = 'comment';
    const {
      html,
      position
    } = this;
    const start = copyPosition(position);
    feedPosition(position, html, 4); // "<!--".length
    let contentEnd = html.indexOf('-->', position.index);
    let commentEnd = contentEnd + 3; // "-->".length
    if (contentEnd === -1) {
      contentEnd = commentEnd = html.length;
    }
    const content = html.slice(position.index, contentEnd);
    jumpPosition(position, html, commentEnd);
    this.tokens.push({
      type,
      content,
      position: {
        start,
        end: copyPosition(position)
      }
    });
  }
  scanTag() {
    this.scanTagStart();
    const tagName = this.scanTagName();
    this.scanAttrs();
    this.scanTagEnd();
    return tagName;
  }
  scanTagStart() {
    const type = 'tag-start';
    const {
      html,
      position
    } = this;
    const secondChar = html.charAt(position.index + 1);
    const close = secondChar === '/';
    const start = copyPosition(position);
    feedPosition(position, html, close ? 2 : 1);
    this.tokens.push({
      type,
      close,
      position: {
        start
      }
    });
  }
  scanTagEnd() {
    const type = 'tag-end';
    const {
      html,
      position
    } = this;
    const firstChar = html.charAt(position.index);
    const close = firstChar === '/';
    feedPosition(position, html, close ? 2 : 1);
    const end = copyPosition(position);
    this.tokens.push({
      type,
      close,
      position: {
        end
      }
    });
  }
  scanTagName() {
    const type = 'tag';
    const {
      html,
      position
    } = this;
    const len = html.length;
    let start = position.index;
    while (start < len) {
      const char = html.charAt(start);
      const isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>');
      if (isTagChar) break;
      start++;
    }
    let end = start + 1;
    while (end < len) {
      const char = html.charAt(end);
      const isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>');
      if (!isTagChar) break;
      end++;
    }
    jumpPosition(position, html, end);
    const tagName = html.slice(start, end);
    this.tokens.push({
      type,
      content: tagName
    });
    return tagName;
  }
  scanAttrs() {
    const {
      html,
      position,
      tokens
    } = this;
    let cursor = position.index;
    let quote = null; // null, single-, or double-quote
    let wordBegin = cursor; // index of word start
    const words = []; // "key", "key=value", "key='value'", etc
    const len = html.length;
    while (cursor < len) {
      const char = html.charAt(cursor);
      if (quote) {
        const isQuoteEnd = char === quote;
        if (isQuoteEnd) {
          quote = null;
        }
        cursor++;
        continue;
      }
      const isTagEnd = char === '/' || char === '>';
      if (isTagEnd) {
        if (cursor !== wordBegin) {
          words.push(html.slice(wordBegin, cursor));
        }
        break;
      }
      if (isWordEnd(cursor, wordBegin, html)) {
        if (cursor !== wordBegin) {
          words.push(html.slice(wordBegin, cursor));
        }
        wordBegin = cursor + 1;
        cursor++;
        continue;
      }
      const isQuoteStart = char === '\'' || char === '"';
      if (isQuoteStart) {
        quote = char;
        cursor++;
        continue;
      }
      cursor++;
    }
    jumpPosition(position, html, cursor);
    const wLen = words.length;
    const type = 'attribute';
    for (let i = 0; i < wLen; i++) {
      const word = words[i];
      const isNotPair = word.includes('=');
      if (isNotPair) {
        const secondWord = words[i + 1];
        if (secondWord && secondWord.startsWith('=')) {
          if (secondWord.length > 1) {
            const newWord = word + secondWord;
            tokens.push({
              type,
              content: newWord
            });
            i += 1;
            continue;
          }
          const thirdWord = words[i + 2];
          i += 1;
          if (thirdWord) {
            const newWord = word + '=' + thirdWord;
            tokens.push({
              type,
              content: newWord
            });
            i += 1;
            continue;
          }
        }
      }
      if (word.endsWith('=')) {
        const secondWord = words[i + 1];
        if (secondWord && !secondWord.includes('=')) {
          const newWord = word + secondWord;
          tokens.push({
            type,
            content: newWord
          });
          i += 1;
          continue;
        }
        const newWord = word.slice(0, -1);
        tokens.push({
          type,
          content: newWord
        });
        continue;
      }
      tokens.push({
        type,
        content: word
      });
    }
  }
  scanSkipTag(tagName) {
    const {
      html,
      position
    } = this;
    const safeTagName = tagName.toLowerCase();
    const len = html.length;
    while (position.index < len) {
      const nextTag = html.indexOf('</', position.index);
      if (nextTag === -1) {
        this.scanText();
        break;
      }
      jumpPosition(position, html, nextTag);
      const name = this.scanTag();
      if (safeTagName === name.toLowerCase()) {
        break;
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/style.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/style.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ StyleTagParser; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/utils.js");

const LEFT_BRACKET = '{';
const RIGHT_BRACKET = '}';
const CLASS_SELECTOR = '.';
const ID_SELECTOR = '#';
const CHILD_COMBINATOR = '>';
const GENERAL_SIBLING_COMBINATOR = '~';
const ADJACENT_SIBLING_COMBINATOR = '+';
class StyleTagParser {
  constructor() {
    this.styles = [];
  }
  extractStyle(src) {
    const REG_STYLE = /<style\s?[^>]*>((.|\n|\s)+?)<\/style>/g;
    let html = src;
    // let html = src.replace(/\n/g, '')
    html = html.replace(REG_STYLE, (_, $1) => {
      const style = $1.trim();
      this.stringToSelector(style);
      return '';
    });
    return html.trim();
  }
  stringToSelector(style) {
    let lb = style.indexOf(LEFT_BRACKET);
    while (lb > -1) {
      const rb = style.indexOf(RIGHT_BRACKET);
      const selectors = style.slice(0, lb).trim();
      let content = style.slice(lb + 1, rb);
      content = content.replace(/:(.*);/g, function (_, $1) {
        const t = $1.trim().replace(/ +/g, '+++');
        return `:${t};`;
      });
      content = content.replace(/ /g, '');
      content = content.replace(/\+\+\+/g, ' ');
      if (!/;$/.test(content)) {
        content += ';';
      }
      selectors.split(',').forEach(src => {
        const selectorList = this.parseSelector(src);
        this.styles.push({
          content,
          selectorList
        });
      });
      style = style.slice(rb + 1);
      lb = style.indexOf(LEFT_BRACKET);
    }
    // console.log('res this.styles: ', this.styles)
  }
  parseSelector(src) {
    const list = src.trim().replace(/ *([>~+]) */g, ' $1').replace(/ +/g, ' ').replace(/\[\s*([^[\]=\s]+)\s*=\s*([^[\]=\s]+)\s*\]/g, '[$1=$2]').split(' ');
    const selectors = list.map(item => {
      const firstChar = item.charAt(0);
      const selector = {
        isChild: firstChar === CHILD_COMBINATOR,
        isGeneralSibling: firstChar === GENERAL_SIBLING_COMBINATOR,
        isAdjacentSibling: firstChar === ADJACENT_SIBLING_COMBINATOR,
        tag: null,
        id: null,
        class: [],
        attrs: []
      };
      item = item.replace(/^[>~+]/, '');
      // 属性选择器
      item = item.replace(/\[(.+?)\]/g, function (_, $1) {
        const [key, value] = $1.split('=');
        const all = $1.indexOf('=') === -1;
        const attr = {
          all,
          key,
          value: all ? null : value
        };
        selector.attrs.push(attr);
        return '';
      });
      item = item.replace(/([.#][A-Za-z0-9-_]+)/g, function (_, $1) {
        if ($1[0] === ID_SELECTOR) {
          // id 选择器
          selector.id = $1.substr(1);
        } else if ($1[0] === CLASS_SELECTOR) {
          // class 选择器
          selector.class.push($1.substr(1));
        }
        return '';
      });
      // 标签选择器
      if (item !== '') {
        selector.tag = item;
      }
      return selector;
    });
    return selectors;
  }
  matchStyle(tagName, el, list) {
    const res = sortStyles(this.styles).reduce((str, {
      content,
      selectorList
    }, i) => {
      let idx = list[i];
      let selector = selectorList[idx];
      const nextSelector = selectorList[idx + 1];
      if ((nextSelector === null || nextSelector === void 0 ? void 0 : nextSelector.isGeneralSibling) || (nextSelector === null || nextSelector === void 0 ? void 0 : nextSelector.isAdjacentSibling)) {
        selector = nextSelector;
        idx += 1;
        list[i] += 1;
      }
      let isMatch = this.matchCurrent(tagName, el, selector);
      if (isMatch && selector.isGeneralSibling) {
        let prev = getPreviousElement(el);
        while (prev) {
          if (prev.h5tagName && this.matchCurrent(prev.h5tagName, prev, selectorList[idx - 1])) {
            isMatch = true;
            break;
          }
          prev = getPreviousElement(prev);
          isMatch = false;
        }
      }
      if (isMatch && selector.isAdjacentSibling) {
        const prev = getPreviousElement(el);
        if (!prev || !prev.h5tagName) {
          isMatch = false;
        } else {
          const isSiblingMatch = this.matchCurrent(prev.h5tagName, prev, selectorList[idx - 1]);
          if (!isSiblingMatch) {
            isMatch = false;
          }
        }
      }
      if (isMatch) {
        if (idx === selectorList.length - 1) {
          return str + content;
        } else if (idx < selectorList.length - 1) {
          list[i] += 1;
        }
      } else {
        // 直接子代组合器: >
        if (selector.isChild && idx > 0) {
          list[i] -= 1;
          if (this.matchCurrent(tagName, el, selectorList[list[i]])) {
            list[i] += 1;
          }
        }
      }
      return str;
    }, '');
    return res;
  }
  matchCurrent(tagName, el, selector) {
    // 标签选择器
    if (selector.tag && selector.tag !== tagName) return false;
    // id 选择器
    if (selector.id && selector.id !== el.id) return false;
    // class 选择器
    if (selector.class.length) {
      const classList = el.className.split(' ');
      for (let i = 0; i < selector.class.length; i++) {
        const cls = selector.class[i];
        if (classList.indexOf(cls) === -1) {
          return false;
        }
      }
    }
    // 属性选择器
    if (selector.attrs.length) {
      for (let i = 0; i < selector.attrs.length; i++) {
        const {
          all,
          key,
          value
        } = selector.attrs[i];
        if (all && !el.hasAttribute(key)) {
          return false;
        } else {
          const attr = el.getAttribute(key);
          if (attr !== (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.unquote)(value || '')) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
function getPreviousElement(el) {
  const parent = el.parentElement;
  if (!parent) return null;
  const prev = el.previousSibling;
  if (!prev) return null;
  if (prev.nodeType === 1 /* NodeType.ELEMENT_NODE */) {
    return prev;
  } else {
    return getPreviousElement(prev);
  }
}
// 根据 css selector 权重排序: 权重大的靠后
// @WARN 不考虑伪类
// https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance#specificity_2
function sortStyles(styles) {
  return styles.sort((s1, s2) => {
    const hundreds1 = getHundredsWeight(s1.selectorList);
    const hundreds2 = getHundredsWeight(s2.selectorList);
    if (hundreds1 !== hundreds2) return hundreds1 - hundreds2;
    const tens1 = getTensWeight(s1.selectorList);
    const tens2 = getTensWeight(s2.selectorList);
    if (tens1 !== tens2) return tens1 - tens2;
    const ones1 = getOnesWeight(s1.selectorList);
    const ones2 = getOnesWeight(s2.selectorList);
    return ones1 - ones2;
  });
}
function getHundredsWeight(selectors) {
  return selectors.reduce((pre, cur) => pre + (cur.id ? 1 : 0), 0);
}
function getTensWeight(selectors) {
  return selectors.reduce((pre, cur) => pre + cur.class.length + cur.attrs.length, 0);
}
function getOnesWeight(selectors) {
  return selectors.reduce((pre, cur) => pre + (cur.tag ? 1 : 0), 0);
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/tags.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/tags.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isBlockElements: function() { return /* binding */ isBlockElements; },
/* harmony export */   isInlineElements: function() { return /* binding */ isInlineElements; },
/* harmony export */   isMiniElements: function() { return /* binding */ isMiniElements; },
/* harmony export */   specialMiniElements: function() { return /* binding */ specialMiniElements; }
/* harmony export */ });
/* unused harmony export makeMap */
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/components.js");

function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return val => !!map[val.toLowerCase()];
}
const specialMiniElements = {
  img: 'image',
  iframe: 'web-view'
};
const internalCompsList = Object.keys(_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.internalComponents).map(i => i.toLowerCase()).join(',');
// https://developers.weixin.qq.com/miniprogram/dev/component
const isMiniElements = makeMap(internalCompsList);
// https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
const isInlineElements = makeMap('a,i,abbr,iframe,select,acronym,slot,small,span,bdi,kbd,strong,big,map,sub,sup,br,mark,mark,meter,template,canvas,textarea,cite,object,time,code,output,u,data,picture,tt,datalist,var,dfn,del,q,em,s,embed,samp,b');
// https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
const isBlockElements = makeMap('address,fieldset,li,article,figcaption,main,aside,figure,nav,blockquote,footer,ol,details,form,p,dialog,h1,h2,h3,h4,h5,h6,pre,dd,header,section,div,hgroup,table,dl,hr,ul,dt');


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/utils.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/inner-html/utils.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unquote: function() { return /* binding */ unquote; }
/* harmony export */ });
function unquote(str) {
  const car = str.charAt(0);
  const end = str.length - 1;
  const isQuoteStart = car === '"' || car === "'";
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end);
  }
  return str;
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/implements.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/implements.js ***!
  \****************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   recordMutation: function() { return /* binding */ recordMutation; }
/* harmony export */ });
/* unused harmony export MutationObserverImpl */
const observers = [];
/**
 * The MutationObserver provides the ability
 * to watch for changes being made to the DOM tree.
 * It will invoke a specified callback function
 * when DOM changes occur.
 * @see https://dom.spec.whatwg.org/#mutationobserver
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
class MutationObserverImpl {
  constructor(callback) {
    this.records = [];
    this.callback = callback;
  }
  /**
   * Configures the MutationObserver
   * to begin receiving notifications
   * through its callback function
   * when DOM changes matching the given options occur.
   *
   * Options matching is to be implemented.
   */
  observe(target, options) {
    this.disconnect();
    this.target = target;
    this.options = options || {};
    observers.push(this);
  }
  /**
   * Stop the MutationObserver instance
   * from receiving further notifications
   * until and unless observe() is called again.
   */
  disconnect() {
    this.target = null;
    const index = observers.indexOf(this);
    if (index >= 0) {
      observers.splice(index, 1);
    }
  }
  /**
   * Removes all pending notifications
   * from the MutationObserver's notification queue
   * and returns them in a new Array of MutationRecord objects.
   */
  takeRecords() {
    return this.records.splice(0, this.records.length);
  }
}
/** Match two TaroNodes by sid. */
const sidMatches = (observerTarget, target) => {
  return !!observerTarget && observerTarget.sid === (target === null || target === void 0 ? void 0 : target.sid);
};
const isConcerned = (record, options) => {
  const {
    characterData,
    characterDataOldValue,
    attributes,
    attributeOldValue,
    childList
  } = options;
  switch (record.type) {
    case "characterData" /* MutationRecordType.CHARACTER_DATA */:
      if (characterData) {
        if (!characterDataOldValue) record.oldValue = null;
        return true;
      }
      return false;
    case "attributes" /* MutationRecordType.ATTRIBUTES */:
      if (attributes) {
        if (!attributeOldValue) record.oldValue = null;
        return true;
      }
      return false;
    case "childList" /* MutationRecordType.CHILD_LIST */:
      if (childList) {
        return true;
      }
      return false;
  }
};
let pendingMuatations = false;
function logMutation(observer, record) {
  observer.records.push(record);
  if (!pendingMuatations) {
    pendingMuatations = true;
    Promise.resolve().then(() => {
      pendingMuatations = false;
      observers.forEach(observer => {
        return observer.callback(observer.takeRecords());
      });
    });
  }
}
function recordMutation(record) {
  observers.forEach(observer => {
    const {
      options
    } = observer;
    for (let t = record.target; t; t = t.parentNode) {
      if (sidMatches(observer.target, t) && isConcerned(record, options)) {
        logMutation(observer, record);
        break;
      }
      if (!options.subtree) break;
    }
  });
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MutationObserver: function() { return /* binding */ MutationObserver; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _implements_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./implements.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/implements.js");


class MutationObserver {
  constructor(callback) {
    if (false) {} else {
      if (true) {
        console.warn('[Taro Warning] 若要使用 MutationObserver，请在 Taro 编译配置中设置 \'mini.runtime.enableMutationObserver: true\'');
      }
      this.core = {
        observe: _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.noop,
        disconnect: _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.noop,
        takeRecords: _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.noop
      };
    }
  }
  observe(...args) {
    this.core.observe(...args);
  }
  disconnect() {
    this.core.disconnect();
  }
  takeRecords() {
    return this.core.takeRecords();
  }
  static record(record) {
    (0,_implements_js__WEBPACK_IMPORTED_MODULE_1__.recordMutation)(record);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/anchor-element.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/anchor-element.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnchorElement: function() { return /* binding */ AnchorElement; }
/* harmony export */ });
/* harmony import */ var _bom_URL_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../bom/URL.js */ "./node_modules/@tarojs/runtime/dist/bom/URL.js");
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");


class AnchorElement extends _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement {
  get href() {
    var _a;
    return (_a = this.props["href" /* AnchorElementAttrs.HREF */]) !== null && _a !== void 0 ? _a : '';
  }
  set href(val) {
    this.setAttribute("href" /* AnchorElementAttrs.HREF */, val);
  }
  get protocol() {
    var _a;
    return (_a = this.props["protocol" /* AnchorElementAttrs.PROTOCOL */]) !== null && _a !== void 0 ? _a : '';
  }
  get host() {
    var _a;
    return (_a = this.props["host" /* AnchorElementAttrs.HOST */]) !== null && _a !== void 0 ? _a : '';
  }
  get search() {
    var _a;
    return (_a = this.props["search" /* AnchorElementAttrs.SEARCH */]) !== null && _a !== void 0 ? _a : '';
  }
  get hash() {
    var _a;
    return (_a = this.props["hash" /* AnchorElementAttrs.HASH */]) !== null && _a !== void 0 ? _a : '';
  }
  get hostname() {
    var _a;
    return (_a = this.props["hostname" /* AnchorElementAttrs.HOSTNAME */]) !== null && _a !== void 0 ? _a : '';
  }
  get port() {
    var _a;
    return (_a = this.props["port" /* AnchorElementAttrs.PORT */]) !== null && _a !== void 0 ? _a : '';
  }
  get pathname() {
    var _a;
    return (_a = this.props["pathname" /* AnchorElementAttrs.PATHNAME */]) !== null && _a !== void 0 ? _a : '';
  }
  setAttribute(qualifiedName, value) {
    if (qualifiedName === "href" /* AnchorElementAttrs.HREF */) {
      const willSetAttr = (0,_bom_URL_js__WEBPACK_IMPORTED_MODULE_1__.parseUrl)(value);
      for (const k in willSetAttr) {
        super.setAttribute(k, willSetAttr[k]);
      }
    } else {
      super.setAttribute(qualifiedName, value);
    }
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/class-list.js":
/*!*************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/class-list.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClassList: function() { return /* binding */ ClassList; }
/* harmony export */ });
class ClassList {
  constructor(className, el) {
    this.tokenList = [];
    this.el = el;
    className.trim().split(/\s+/).forEach(token => this.tokenList.push(token));
  }
  get value() {
    return this.toString();
  }
  get length() {
    return this.tokenList.length;
  }
  add() {
    let index = 0;
    let updated = false;
    const tokens = arguments;
    const length = tokens.length;
    const tokenList = this.tokenList;
    do {
      const token = tokens[index];
      if (this.checkTokenIsValid(token) && !~tokenList.indexOf(token)) {
        tokenList.push(token);
        updated = true;
      }
    } while (++index < length);
    if (updated) {
      this._update();
    }
  }
  remove() {
    let i = 0;
    let updated = false;
    const tokens = arguments;
    const length = tokens.length;
    const tokenList = this.tokenList;
    do {
      const token = tokens[i] + '';
      if (!this.checkTokenIsValid(token)) continue;
      const index = tokenList.indexOf(token);
      if (~tokenList.indexOf(token)) {
        tokenList.splice(index, 1);
        updated = true;
      }
    } while (++i < length);
    if (updated) {
      this._update();
    }
  }
  contains(token) {
    if (!this.checkTokenIsValid(token)) return false;
    return !!~this.tokenList.indexOf(token);
  }
  toggle(token, force) {
    const result = this.contains(token);
    const method = result ? force !== true && 'remove' : force !== false && 'add';
    if (method) {
      // @ts-ignore
      this[method](token);
    }
    if (force === true || force === false) {
      return force;
    } else {
      return !result;
    }
  }
  replace(token, replacement_token) {
    if (!this.checkTokenIsValid(token) || !this.checkTokenIsValid(replacement_token)) return;
    const index = this.tokenList.indexOf(token);
    if (~index) {
      this.tokenList.splice(index, 1, replacement_token);
      this._update();
    }
  }
  toString() {
    return this.tokenList.filter(v => v !== '').join(' ');
  }
  checkTokenIsValid(token) {
    if (token === '' || /\s/.test(token)) return false;
    return true;
  }
  _update() {
    this.el.className = this.value;
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/document.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/document.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroDocument: function() { return /* binding */ TaroDocument; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/components.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");
/* harmony import */ var _event_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event.js */ "./node_modules/@tarojs/runtime/dist/dom/event.js");
/* harmony import */ var _event_source_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./event-source.js */ "./node_modules/@tarojs/runtime/dist/dom/event-source.js");
/* harmony import */ var _form_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./form.js */ "./node_modules/@tarojs/runtime/dist/dom/form.js");
/* harmony import */ var _root_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./root.js */ "./node_modules/@tarojs/runtime/dist/dom/root.js");
/* harmony import */ var _text_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./text.js */ "./node_modules/@tarojs/runtime/dist/dom/text.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _anchor_element_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./anchor-element.js */ "./node_modules/@tarojs/runtime/dist/dom/anchor-element.js");
/* harmony import */ var _transfer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./transfer.js */ "./node_modules/@tarojs/runtime/dist/dom/transfer.js");











class TaroDocument extends _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement {
  constructor() {
    super();
    this.createEvent = _event_js__WEBPACK_IMPORTED_MODULE_1__.createEvent;
    this.nodeType = 9 /* NodeType.DOCUMENT_NODE */;
    this.nodeName = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT_ELEMENT_NAME;
  }
  createElement(type) {
    const nodeName = type.toLowerCase();
    let element;
    switch (true) {
      case nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.ROOT_STR:
        element = new _root_js__WEBPACK_IMPORTED_MODULE_3__.TaroRootElement();
        return element;
      case _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.controlledComponent.has(nodeName):
        element = new _form_js__WEBPACK_IMPORTED_MODULE_5__.FormElement();
        break;
      case nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.A:
        element = new _anchor_element_js__WEBPACK_IMPORTED_MODULE_6__.AnchorElement();
        break;
      case nodeName === 'page-meta':
      case nodeName === 'navigation-bar':
        element = new _transfer_js__WEBPACK_IMPORTED_MODULE_7__.TransferElement((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_8__.toCamelCase)(nodeName));
        break;
      default:
        element = new _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement();
        break;
    }
    element.nodeName = nodeName;
    element.tagName = type.toUpperCase();
    return element;
  }
  // an ugly fake createElementNS to deal with @vue/runtime-dom's
  // support mounting app to svg container since vue@3.0.8
  createElementNS(_svgNS, type) {
    return this.createElement(type);
  }
  createTextNode(text) {
    return new _text_js__WEBPACK_IMPORTED_MODULE_9__.TaroText(text);
  }
  getElementById(id) {
    const el = _event_source_js__WEBPACK_IMPORTED_MODULE_10__.eventSource.get(id);
    return (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_11__.isUndefined)(el) ? null : el;
  }
  querySelector(query) {
    // 为了 Vue3 的乞丐版实现
    if (/^#/.test(query)) {
      return this.getElementById(query.slice(1));
    }
    return null;
  }
  querySelectorAll() {
    // fake hack
    return [];
  }
  // @TODO: @PERF: 在 hydrate 移除掉空的 node
  createComment() {
    const textnode = new _text_js__WEBPACK_IMPORTED_MODULE_9__.TaroText('');
    textnode.nodeName = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.COMMENT;
    return textnode;
  }
  get defaultView() {
    return _env_js__WEBPACK_IMPORTED_MODULE_12__["default"].window;
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/element.js":
/*!**********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/element.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroElement: function() { return /* binding */ TaroElement; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../dom-external/mutation-observer/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _class_list_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./class-list.js */ "./node_modules/@tarojs/runtime/dist/dom/class-list.js");
/* harmony import */ var _event_source_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./event-source.js */ "./node_modules/@tarojs/runtime/dist/dom/event-source.js");
/* harmony import */ var _node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node.js */ "./node_modules/@tarojs/runtime/dist/dom/node.js");
/* harmony import */ var _style_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.js */ "./node_modules/@tarojs/runtime/dist/dom/style.js");
/* harmony import */ var _tree_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./tree.js */ "./node_modules/@tarojs/runtime/dist/dom/tree.js");









class TaroElement extends _node_js__WEBPACK_IMPORTED_MODULE_0__.TaroNode {
  constructor() {
    super();
    this.props = {};
    this.dataset = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    this.nodeType = 1 /* NodeType.ELEMENT_NODE */;
    this.style = new _style_js__WEBPACK_IMPORTED_MODULE_2__.Style(this);
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('patchElement', this);
  }
  _stopPropagation(event) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let target = this;
    // eslint-disable-next-line no-cond-assign
    while (target = target.parentNode) {
      const listeners = target.__handlers[event.type];
      if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isArray)(listeners)) {
        continue;
      }
      for (let i = listeners.length; i--;) {
        const l = listeners[i];
        l._stop = true;
      }
    }
  }
  get id() {
    return this.getAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.ID);
  }
  set id(val) {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.ID, val);
  }
  get className() {
    return this.getAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CLASS) || '';
  }
  set className(val) {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CLASS, val);
  }
  get cssText() {
    return this.getAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE) || '';
  }
  get classList() {
    return new _class_list_js__WEBPACK_IMPORTED_MODULE_6__.ClassList(this.className, this);
  }
  get children() {
    return this.childNodes.filter(_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isElement);
  }
  get attributes() {
    const props = this.props;
    const propKeys = Object.keys(props);
    const style = this.style.cssText;
    const attrs = propKeys.map(key => ({
      name: key,
      value: props[key]
    }));
    return attrs.concat(style ? {
      name: _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE,
      value: style
    } : []);
  }
  get textContent() {
    let text = '';
    const childNodes = this.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      text += childNodes[i].textContent;
    }
    return text;
  }
  set textContent(text) {
    super.textContent = text;
  }
  hasAttribute(qualifiedName) {
    return !(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isUndefined)(this.props[qualifiedName]);
  }
  hasAttributes() {
    return this.attributes.length > 0;
  }
  get focus() {
    return function () {
      this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.FOCUS, true);
    };
  }
  // 兼容 Vue3，详情请见：https://github.com/NervJS/taro/issues/10579
  set focus(value) {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.FOCUS, value);
  }
  blur() {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.FOCUS, false);
  }
  setAttribute(qualifiedName, value) {
     true && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.warn)((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isString)(value) && value.length > _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.PROPERTY_THRESHOLD, `元素 ${this.nodeName} 的 ${qualifiedName} 属性值数据量过大，可能会影响渲染性能。考虑降低图片转为 base64 的阈值或在 CSS 中使用 base64。`);
    const isPureView = this.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) && !this.isAnyEventBinded();
    if (qualifiedName !== _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE) {
      _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_8__.MutationObserver.record({
        target: this,
        type: "attributes" /* MutationRecordType.ATTRIBUTES */,
        attributeName: qualifiedName,
        oldValue: this.getAttribute(qualifiedName)
      });
    }
    switch (qualifiedName) {
      case _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE:
        this.style.cssText = value;
        break;
      case _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.ID:
        if (this.uid !== this.sid) {
          // eventSource[sid] 永远保留，直到组件卸载
          // eventSource[uid] 可变
          _event_source_js__WEBPACK_IMPORTED_MODULE_9__.eventSource.delete(this.uid);
        }
        value = String(value);
        this.props[qualifiedName] = this.uid = value;
        _event_source_js__WEBPACK_IMPORTED_MODULE_9__.eventSource.set(value, this);
        break;
      default:
        this.props[qualifiedName] = value;
        if (qualifiedName.startsWith('data-')) {
          if (this.dataset === _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
            this.dataset = Object.create(null);
          }
          this.dataset[(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(qualifiedName.replace(/^data-/, ''))] = value;
        }
        break;
    }
    // Serialization
    if (!this._root) return;
    const componentsAlias = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias)();
    const _alias = componentsAlias[this.nodeName];
    const viewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW]._num;
    const clickViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CLICK_VIEW]._num;
    const staticViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STATIC_VIEW]._num;
    const catchViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CATCH_VIEW]._num;
    const _path = this._path;
    qualifiedName = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.shortcutAttr)(qualifiedName);
    const qualifiedNameInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(qualifiedName);
    const payload = {
      path: `${_path}.${qualifiedNameInCamelCase}`,
      value: (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isFunction)(value) ? () => value : value
    };
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifySetAttrPayload', this, qualifiedName, payload, componentsAlias);
    if (_alias) {
      const qualifiedNameAlias = _alias[qualifiedNameInCamelCase] || qualifiedName;
      payload.path = `${_path}.${(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(qualifiedNameAlias)}`;
    }
    this.enqueueUpdate(payload);
    if (this.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW) {
      if (qualifiedNameInCamelCase === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CATCHMOVE) {
        // catchMove = true: catch-view
        // catchMove = false: view or click-view or static-view
        this.enqueueUpdate({
          path: `${_path}.${"nn" /* Shortcuts.NodeName */}`,
          value: value ? catchViewAlias : this.isOnlyClickBinded() && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) ? clickViewAlias : this.isAnyEventBinded() ? viewAlias : staticViewAlias
        });
      } else if (isPureView && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this)) {
        // pure-view => static-view
        this.enqueueUpdate({
          path: `${_path}.${"nn" /* Shortcuts.NodeName */}`,
          value: staticViewAlias
        });
      }
    }
  }
  removeAttribute(qualifiedName) {
    const isStaticView = this.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW && (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) && !this.isAnyEventBinded();
    _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_8__.MutationObserver.record({
      target: this,
      type: "attributes" /* MutationRecordType.ATTRIBUTES */,
      attributeName: qualifiedName,
      oldValue: this.getAttribute(qualifiedName)
    });
    if (qualifiedName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE) {
      this.style.cssText = '';
    } else {
      const isInterrupt = _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('onRemoveAttribute', this, qualifiedName);
      if (isInterrupt) {
        return;
      }
      if (!this.props.hasOwnProperty(qualifiedName)) {
        return;
      }
      delete this.props[qualifiedName];
    }
    // Serialization
    if (!this._root) return;
    const componentsAlias = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias)();
    const _alias = componentsAlias[this.nodeName];
    const viewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW]._num;
    const staticViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STATIC_VIEW]._num;
    const pureViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.PURE_VIEW]._num;
    const clickViewAlias = componentsAlias[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CLICK_VIEW]._num;
    const _path = this._path;
    qualifiedName = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.shortcutAttr)(qualifiedName);
    const qualifiedNameInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(qualifiedName);
    const payload = {
      path: `${_path}.${qualifiedNameInCamelCase}`,
      value: ''
    };
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifyRmAttrPayload', this, qualifiedName, payload, componentsAlias);
    if (_alias) {
      const qualifiedNameAlias = _alias[qualifiedNameInCamelCase] || qualifiedName;
      payload.path = `${_path}.${(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(qualifiedNameAlias)}`;
    }
    this.enqueueUpdate(payload);
    if (this.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.VIEW) {
      if (qualifiedNameInCamelCase === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.CATCHMOVE) {
        // catch-view => view or click-view or static-view or pure-view
        this.enqueueUpdate({
          path: `${_path}.${"nn" /* Shortcuts.NodeName */}`,
          value: this.isOnlyClickBinded() && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) ? clickViewAlias : this.isAnyEventBinded() ? viewAlias : (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) ? staticViewAlias : pureViewAlias
        });
      } else if (isStaticView && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this)) {
        // static-view => pure-view
        this.enqueueUpdate({
          path: `${_path}.${"nn" /* Shortcuts.NodeName */}`,
          value: pureViewAlias
        });
      }
    }
  }
  getAttribute(qualifiedName) {
    const attr = qualifiedName === _constants_index_js__WEBPACK_IMPORTED_MODULE_5__.STYLE ? this.style.cssText : this.props[qualifiedName];
    return attr !== null && attr !== void 0 ? attr : '';
  }
  getElementsByTagName(tagName) {
    return (0,_tree_js__WEBPACK_IMPORTED_MODULE_10__.treeToArray)(this, el => {
      return el.nodeName === tagName || tagName === '*' && this !== el;
    });
  }
  getElementsByClassName(className) {
    const classNames = className.trim().split(/\s+/);
    return (0,_tree_js__WEBPACK_IMPORTED_MODULE_10__.treeToArray)(this, el => {
      const classList = el.classList;
      return classNames.every(c => classList.contains(c));
    });
  }
  dispatchEvent(event) {
    const cancelable = event.cancelable;
    const listeners = this.__handlers[event.type];
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isArray)(listeners)) {
      return false;
    }
    for (let i = listeners.length; i--;) {
      const listener = listeners[i];
      let result;
      if (listener._stop) {
        listener._stop = false;
      } else {
        _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifyDispatchEvent', event, this);
        result = listener.call(this, event);
      }
      if ((result === false || event._end) && cancelable) {
        event.defaultPrevented = true;
      }
      if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isUndefined)(result) && event.mpEvent) {
        const res = _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifyTaroEventReturn', this, event, result);
        if (res) {
          event.mpEvent[_constants_index_js__WEBPACK_IMPORTED_MODULE_5__.EVENT_CALLBACK_RESULT] = result;
        }
      }
      if (event._end && event._stop) {
        break;
      }
    }
    if (event._stop) {
      this._stopPropagation(event);
    }
    return listeners != null;
  }
  addEventListener(type, handler, options) {
    const name = this.nodeName;
    const SPECIAL_NODES = _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('getSpecialNodes');
    let sideEffect = true;
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.isObject)(options) && options.sideEffect === false) {
      sideEffect = false;
      delete options.sideEffect;
    }
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifyAddEventListener', this, sideEffect, _utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias);
    if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES.indexOf(name) > -1) {
      const componentsAlias = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias)();
      const alias = componentsAlias[name]._num;
      this.enqueueUpdate({
        path: `${this._path}.${"nn" /* Shortcuts.NodeName */}`,
        value: alias
      });
    }
    super.addEventListener(type, handler, options);
  }
  removeEventListener(type, handler, sideEffect = true) {
    super.removeEventListener(type, handler);
    const name = this.nodeName;
    const SPECIAL_NODES = _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('getSpecialNodes');
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks.call('modifyRemoveEventListener', this, sideEffect, _utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias);
    if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES.indexOf(name) > -1) {
      const componentsAlias = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.getComponentsAlias)();
      const value = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.isHasExtractProp)(this) ? `static-${name}` : `pure-${name}`;
      const valueAlias = componentsAlias[value]._num;
      this.enqueueUpdate({
        path: `${this._path}.${"nn" /* Shortcuts.NodeName */}`,
        value: valueAlias
      });
    }
  }
  static extend(methodName, options) {
    (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_7__.extend)(TaroElement, methodName, options);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/event-source.js":
/*!***************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/event-source.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventSource: function() { return /* binding */ eventSource; }
/* harmony export */ });
class EventSource extends Map {
  removeNode(child) {
    const {
      sid,
      uid
    } = child;
    this.delete(sid);
    if (uid !== sid && uid) this.delete(uid);
  }
  removeNodeTree(child) {
    this.removeNode(child);
    const {
      childNodes
    } = child;
    childNodes.forEach(node => this.removeNodeTree(node));
  }
}
const eventSource = new EventSource();


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/event-target.js":
/*!***************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/event-target.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroEventTarget: function() { return /* binding */ TaroEventTarget; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");

class TaroEventTarget {
  constructor() {
    this.__handlers = {};
  }
  addEventListener(type, handler, options) {
    type = type.toLowerCase();
    _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.hooks.call('onAddEvent', type, handler, options, this);
    if (type === 'regionchange') {
      // map 组件的 regionchange 事件非常特殊，详情：https://github.com/NervJS/taro/issues/5766
      this.addEventListener('begin', handler, options);
      this.addEventListener('end', handler, options);
      return;
    }
    let isCapture = Boolean(options);
    let isOnce = false;
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(options)) {
      isCapture = Boolean(options.capture);
      isOnce = Boolean(options.once);
    }
    if (isOnce) {
      const wrapper = function () {
        handler.apply(this, arguments); // this 指向 Element
        this.removeEventListener(type, wrapper);
      };
      this.addEventListener(type, wrapper, Object.assign(Object.assign({}, options), {
        once: false
      }));
      return;
    }
     true && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.warn)(isCapture, 'Taro 暂未实现 event 的 capture 特性。');
    // 某些框架，如 PReact 有委托的机制，handler 始终是同一个函数
    // 这会导致多层停止冒泡失败：view -> view(handler.stop = false) -> view(handler.stop = true)
    // 这样解决：view -> view(handlerA.stop = false) -> view(handlerB.stop = false)
    // 因此每次绑定事件都新建一个函数，如果带来了性能问题，可以把这段逻辑抽取到 PReact 插件中。
    const oldHandler = handler;
    handler = function () {
      return oldHandler.apply(this, arguments); // this 指向 Element
    };
    handler.oldHandler = oldHandler;
    const handlers = this.__handlers[type];
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(handlers)) {
      handlers.push(handler);
    } else {
      this.__handlers[type] = [handler];
    }
  }
  removeEventListener(type, handler) {
    type = type.toLowerCase();
    if (type === 'regionchange') {
      // map 组件的 regionchange 事件非常特殊，详情：https://github.com/NervJS/taro/issues/5766
      this.removeEventListener('begin', handler);
      this.removeEventListener('end', handler);
      return;
    }
    if (!handler) {
      return;
    }
    const handlers = this.__handlers[type];
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(handlers)) {
      return;
    }
    const index = handlers.findIndex(item => {
      if (item === handler || item.oldHandler === handler) return true;
    });
     true && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.warn)(index === -1, `事件: '${type}' 没有注册在 DOM 中，因此不会被移除。`);
    handlers.splice(index, 1);
  }
  isAnyEventBinded() {
    const handlers = this.__handlers;
    const isAnyEventBinded = Object.keys(handlers).find(key => handlers[key].length);
    return Boolean(isAnyEventBinded);
  }
  isOnlyClickBinded() {
    const handlers = this.__handlers;
    const isOnlyClickBinded = handlers.tap && Object.keys(handlers).length === 1;
    return Boolean(isOnlyClickBinded);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/event.js":
/*!********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/event.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroEvent: function() { return /* binding */ TaroEvent; },
/* harmony export */   createEvent: function() { return /* binding */ createEvent; },
/* harmony export */   eventHandler: function() { return /* binding */ eventHandler; },
/* harmony export */   eventHandlerTTDom: function() { return /* binding */ eventHandlerTTDom; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");





// Taro 事件对象。以 Web 标准的事件对象为基础，加入小程序事件对象中携带的部分信息，并模拟实现事件冒泡。
class TaroEvent {
  constructor(type, opts, event) {
    this._stop = false;
    this._end = false;
    this.defaultPrevented = false;
    // Mouse Event botton property, it's used in 3rd lib, like react-router. default 0 in general
    this.button = 0;
    // timestamp can either be hi-res ( relative to page load) or low-res (relative to UNIX epoch)
    // here use hi-res timestamp
    this.timeStamp = Date.now();
    this.type = type.toLowerCase();
    this.mpEvent = event;
    this.bubbles = Boolean(opts && opts.bubbles);
    this.cancelable = Boolean(opts && opts.cancelable);
  }
  stopPropagation() {
    this._stop = true;
  }
  stopImmediatePropagation() {
    this._end = this._stop = true;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  get target() {
    var _a, _b, _c, _d, _e;
    const cacheTarget = this.cacheTarget;
    if (!cacheTarget) {
      const target = Object.create(((_a = this.mpEvent) === null || _a === void 0 ? void 0 : _a.target) || null);
      const currentEle = _env_js__WEBPACK_IMPORTED_MODULE_0__["default"].document.getElementById(((_b = target.dataset) === null || _b === void 0 ? void 0 : _b.sid) || target.id || null);
      // Note：优先判断冒泡场景alipay的targetDataset的sid, 不然冒泡场景target属性吐出不对，其余拿取当前绑定id
      const element = _env_js__WEBPACK_IMPORTED_MODULE_0__["default"].document.getElementById(((_c = target.targetDataset) === null || _c === void 0 ? void 0 : _c.sid) || ((_d = target.dataset) === null || _d === void 0 ? void 0 : _d.sid) || target.id || null);
      target.dataset = Object.assign(Object.assign({}, currentEle !== null ? currentEle.dataset : _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ), element !== null ? element.dataset : _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ);
      for (const key in (_e = this.mpEvent) === null || _e === void 0 ? void 0 : _e.detail) {
        target[key] = this.mpEvent.detail[key];
      }
      this.cacheTarget = target;
      return target;
    } else {
      return cacheTarget;
    }
  }
  get currentTarget() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const cacheCurrentTarget = this.cacheCurrentTarget;
    if (!cacheCurrentTarget) {
      const doc = _env_js__WEBPACK_IMPORTED_MODULE_0__["default"].document;
      const currentTarget = Object.create(((_a = this.mpEvent) === null || _a === void 0 ? void 0 : _a.currentTarget) || null);
      const element = doc.getElementById(((_b = currentTarget.dataset) === null || _b === void 0 ? void 0 : _b.sid) || currentTarget.id || null);
      const targetElement = doc.getElementById(((_e = (_d = (_c = this.mpEvent) === null || _c === void 0 ? void 0 : _c.target) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.sid) || ((_g = (_f = this.mpEvent) === null || _f === void 0 ? void 0 : _f.target) === null || _g === void 0 ? void 0 : _g.id) || null);
      if (element === null || element && element === targetElement) {
        this.cacheCurrentTarget = this.target;
        return this.target;
      }
      currentTarget.dataset = element.dataset;
      for (const key in (_h = this.mpEvent) === null || _h === void 0 ? void 0 : _h.detail) {
        currentTarget[key] = this.mpEvent.detail[key];
      }
      this.cacheCurrentTarget = currentTarget;
      return currentTarget;
    } else {
      return cacheCurrentTarget;
    }
  }
}
function createEvent(event, node) {
  if (typeof event === 'string') {
    // For Vue3 using document.createEvent
    return new TaroEvent(event, {
      bubbles: true,
      cancelable: true
    });
  }
  const domEv = new TaroEvent(event.type, {
    bubbles: true,
    cancelable: true
  }, event);
  for (const key in event) {
    if (key === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CURRENT_TARGET || key === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.TARGET || key === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.TYPE || key === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.TIME_STAMP) {
      continue;
    } else {
      domEv[key] = event[key];
    }
  }
  if (domEv.type === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CONFIRM && (node === null || node === void 0 ? void 0 : node.nodeName) === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.INPUT) {
    // eslint-disable-next-line dot-notation
    domEv[_constants_index_js__WEBPACK_IMPORTED_MODULE_2__.KEY_CODE] = 13;
  }
  return domEv;
}
const eventsBatch = {};
function getEventCBResult(event) {
  const result = event[_constants_index_js__WEBPACK_IMPORTED_MODULE_2__.EVENT_CALLBACK_RESULT];
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.isUndefined)(result)) {
    delete event[_constants_index_js__WEBPACK_IMPORTED_MODULE_2__.EVENT_CALLBACK_RESULT];
  }
  return result;
}
// 小程序的事件代理回调函数
function eventHandler(event) {
  var _a, _b;
  // Note: ohos 上事件没有设置 type、detail 类型 setter 方法，且部分事件（例如 load 等）缺失 target 导致事件错误
  event.type === undefined && Object.defineProperty(event, 'type', {
    value: event._type // ohos only
  });
  event.detail === undefined && Object.defineProperty(event, 'detail', {
    value: event._detail || Object.assign({}, event) // ohos only
  });
  event.currentTarget = event.currentTarget || event.target || Object.assign({}, event);
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('modifyMpEventImpl', event);
  const currentTarget = event.currentTarget;
  const id = ((_a = currentTarget.dataset) === null || _a === void 0 ? void 0 : _a.sid /** sid */) || currentTarget.id /** uid */ || ((_b = event.detail) === null || _b === void 0 ? void 0 : _b.id) || '';
  const node = _env_js__WEBPACK_IMPORTED_MODULE_0__["default"].document.getElementById(id);
  if (node) {
    const dispatch = () => {
      const e = createEvent(event, node);
      _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('modifyTaroEvent', e, node);
      _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('dispatchTaroEvent', e, node);
      _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('dispatchTaroEventFinish', e, node);
    };
    if (_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.isExist('batchedEventUpdates')) {
      const type = event.type;
      if (!_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('isBubbleEvents', type) || !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_5__.isParentBound)(node, type) || type === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.TOUCHMOVE && !!node.props.catchMove) {
        // 最上层组件统一 batchUpdate
        _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('batchedEventUpdates', () => {
          if (eventsBatch[type]) {
            eventsBatch[type].forEach(fn => fn());
            delete eventsBatch[type];
          }
          dispatch();
        });
        return getEventCBResult(event);
      } else {
        // 如果上层组件也有绑定同类型的组件，委托给上层组件调用事件回调
        (eventsBatch[type] || (eventsBatch[type] = [])).push(dispatch);
      }
    } else {
      dispatch();
      return getEventCBResult(event);
    }
  }
}
function eventHandlerTTDom(ele, listener, event) {
  Object.assign(event, {
    mpEvent: event,
    bubbles: true,
    cancelable: true
  });
  listener(event, ele);
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/form.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/form.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FormElement: function() { return /* binding */ FormElement; }
/* harmony export */ });
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");


class FormElement extends _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement {
  get type() {
    var _a;
    return (_a = this.props[_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.TYPE]) !== null && _a !== void 0 ? _a : '';
  }
  set type(val) {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.TYPE, val);
  }
  get value() {
    // eslint-disable-next-line dot-notation
    const val = this.props[_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.VALUE];
    return val == null ? '' : val;
  }
  set value(val) {
    this.setAttribute(_constants_index_js__WEBPACK_IMPORTED_MODULE_1__.VALUE, val);
  }
  dispatchEvent(event) {
    if (event.mpEvent) {
      const val = event.mpEvent.detail.value;
      if (event.type === _constants_index_js__WEBPACK_IMPORTED_MODULE_1__.CHANGE) {
        this.props.value = val;
      } else if (event.type === _constants_index_js__WEBPACK_IMPORTED_MODULE_1__.INPUT) {
        // Web 规范中表单组件的 value 应该跟着输入改变
        // 只是改 this.props.value 的话不会进行 setData，因此这里修改 this.value。
        // 只测试了 React、Vue3 input 组件的 onInput 事件，onChange 事件不确定有没有副作用，所以暂不修改。
        this.value = val;
      }
    }
    return super.dispatchEvent(event);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/node.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/node.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroNode: function() { return /* binding */ TaroNode; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../dom-external/mutation-observer/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _hydrate_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hydrate.js */ "./node_modules/@tarojs/runtime/dist/hydrate.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _event_source_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./event-source.js */ "./node_modules/@tarojs/runtime/dist/dom/event-source.js");
/* harmony import */ var _event_target_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-target.js */ "./node_modules/@tarojs/runtime/dist/dom/event-target.js");








const CHILDNODES = "cn" /* Shortcuts.Childnodes */;
const nodeId = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.incrementId)();
class TaroNode extends _event_target_js__WEBPACK_IMPORTED_MODULE_1__.TaroEventTarget {
  constructor() {
    super();
    this.parentNode = null;
    this.childNodes = [];
    this.hydrate = node => () => (0,_hydrate_js__WEBPACK_IMPORTED_MODULE_2__.hydrate)(node);
    this.uid = '_' + nodeId(); // dom 节点 id，开发者可修改
    this.sid = this.uid; // dom 节点全局唯一 id，不可被修改
    _event_source_js__WEBPACK_IMPORTED_MODULE_3__.eventSource.set(this.sid, this);
  }
  updateChildNodes(isClean) {
    const cleanChildNodes = () => [];
    const rerenderChildNodes = () => {
      const childNodes = this.childNodes.filter(node => !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isComment)(node));
      return childNodes.map(_hydrate_js__WEBPACK_IMPORTED_MODULE_2__.hydrate);
    };
    this.enqueueUpdate({
      path: `${this._path}.${CHILDNODES}`,
      value: isClean ? cleanChildNodes : rerenderChildNodes
    });
  }
  updateSingleChild(index) {
    this.childNodes.forEach((child, childIndex) => {
      if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isComment)(child)) return;
      if (index && childIndex < index) return;
      this.enqueueUpdate({
        path: child._path,
        value: this.hydrate(child)
      });
    });
  }
  get _root() {
    var _a;
    return ((_a = this.parentNode) === null || _a === void 0 ? void 0 : _a._root) || null;
  }
  findIndex(refChild) {
    const index = this.childNodes.indexOf(refChild);
    (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.ensure)(index !== -1, 'The node to be replaced is not a child of this node.');
    return index;
  }
  get _path() {
    const parentNode = this.parentNode;
    if (parentNode) {
      // 计算路径时，先过滤掉 comment 节点
      const list = parentNode.childNodes.filter(node => !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isComment)(node));
      const indexOfNode = list.indexOf(this);
      const index = _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.call('getPathIndex', indexOfNode);
      return `${parentNode._path}.${CHILDNODES}.${index}`;
    }
    return '';
  }
  get nextSibling() {
    const parentNode = this.parentNode;
    return (parentNode === null || parentNode === void 0 ? void 0 : parentNode.childNodes[parentNode.findIndex(this) + 1]) || null;
  }
  get previousSibling() {
    const parentNode = this.parentNode;
    return (parentNode === null || parentNode === void 0 ? void 0 : parentNode.childNodes[parentNode.findIndex(this) - 1]) || null;
  }
  get parentElement() {
    const parentNode = this.parentNode;
    if ((parentNode === null || parentNode === void 0 ? void 0 : parentNode.nodeType) === 1 /* NodeType.ELEMENT_NODE */) {
      return parentNode;
    }
    return null;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  get lastChild() {
    const childNodes = this.childNodes;
    return childNodes[childNodes.length - 1] || null;
  }
  /**
   * @textContent 目前只能置空子元素
   * @TODO 等待完整 innerHTML 实现
   */
  // eslint-disable-next-line accessor-pairs
  set textContent(text) {
    const removedNodes = this.childNodes.slice();
    const addedNodes = [];
    // Handle old children' data structure & ref
    while (this.firstChild) {
      this.removeChild(this.firstChild, {
        doUpdate: false
      });
    }
    if (text === '') {
      this.updateChildNodes(true);
    } else {
      const newText = _env_js__WEBPACK_IMPORTED_MODULE_6__["default"].document.createTextNode(text);
      addedNodes.push(newText);
      this.appendChild(newText);
      this.updateChildNodes();
    }
    // @Todo: appendChild 会多触发一次
    _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_7__.MutationObserver.record({
      type: "childList" /* MutationRecordType.CHILD_LIST */,
      target: this,
      removedNodes,
      addedNodes
    });
  }
  /**
   * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
   * @scenario
   * [A,B,C]
   *   1. insert D before C, D has no parent
   *   2. insert D before C, D has the same parent of C
   *   3. insert D before C, D has the different parent of C
   */
  insertBefore(newChild, refChild, isReplace) {
    if (newChild.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_8__.DOCUMENT_FRAGMENT) {
      newChild.childNodes.reduceRight((previousValue, currentValue) => {
        this.insertBefore(currentValue, previousValue);
        return currentValue;
      }, refChild);
      return newChild;
    }
    // Parent release newChild
    //   - cleanRef: false (No need to clean eventSource, because newChild is about to be inserted)
    //   - update: true (Need to update parent.childNodes, because parent.childNodes is reordered)
    newChild.remove({
      cleanRef: false
    });
    let index = 0;
    // Data structure
    newChild.parentNode = this;
    if (refChild) {
      // insertBefore & replaceChild
      index = this.findIndex(refChild);
      this.childNodes.splice(index, 0, newChild);
    } else {
      // appendChild
      this.childNodes.push(newChild);
    }
    const childNodesLength = this.childNodes.length;
    // Serialization
    if (this._root) {
      if (!refChild) {
        // appendChild
        const isOnlyChild = childNodesLength === 1;
        if (isOnlyChild) {
          this.updateChildNodes();
        } else {
          this.enqueueUpdate({
            path: newChild._path,
            value: this.hydrate(newChild)
          });
        }
      } else if (isReplace) {
        // replaceChild
        this.enqueueUpdate({
          path: newChild._path,
          value: this.hydrate(newChild)
        });
      } else {
        // insertBefore 有两种更新模式
        // 比方说有 A B C 三个节点，现在要在 C 前插入 D
        // 1. 插入 D，然后更新整个父节点的 childNodes 数组
        // setData({ cn: [A, B, D, C] })
        // 2. 插入 D，然后更新 D 以及 D 之后每个节点的数据
        // setData ({
        //   cn.[2]: D,
        //   cn.[3]: C,
        // })
        // 由于微信解析 ’cn.[2]‘ 这些路径的时候也需要消耗时间，
        // 所以根据 insertBefore 插入的位置来做不同的处理
        const mark = childNodesLength * 2 / 3;
        if (mark > index) {
          // 如果 insertBefore 的位置在 childNodes 的 2/3 前，则为了避免解析路径消耗过多的时间，采用第一种方式
          this.updateChildNodes();
        } else {
          // 如果 insertBefore 的位置在 childNodes 的 2/3 之后，则采用第二种方式，避免 childNodes 的全量更新
          this.updateSingleChild(index);
        }
      }
    }
    _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_7__.MutationObserver.record({
      type: "childList" /* MutationRecordType.CHILD_LIST */,
      target: this,
      addedNodes: [newChild],
      removedNodes: isReplace ? [refChild] /** replaceChild */ : [],
      nextSibling: isReplace ? refChild.nextSibling /** replaceChild */ : refChild || null,
      /** insertBefore & appendChild */
      previousSibling: newChild.previousSibling
    });
    return newChild;
  }
  /**
   * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
   * @scenario
   * [A,B,C]
   *   1. append C, C has no parent
   *   2. append C, C has the same parent of B
   *   3. append C, C has the different parent of B
   */
  appendChild(newChild) {
    return this.insertBefore(newChild);
  }
  /**
   * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
   * @scenario
   * [A,B,C]
   *   1. replace B with C, C has no parent
   *   2. replace B with C, C has no parent, C has the same parent of B
   *   3. replace B with C, C has no parent, C has the different parent of B
   */
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode !== this) return;
    // Insert the newChild
    this.insertBefore(newChild, oldChild, true);
    // Destroy the oldChild
    //   - cleanRef: true (Need to clean eventSource, because the oldChild was detached from the DOM tree)
    //   - update: false (No need to update parent.childNodes, because replace will not cause the parent.childNodes being reordered)
    oldChild.remove({
      doUpdate: false
    });
    return oldChild;
  }
  /**
   * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
   * @scenario
   * [A,B,C]
   *   1. remove A or B
   *   2. remove C
   */
  removeChild(child, options = {}) {
    const {
      cleanRef,
      doUpdate
    } = options;
    if (cleanRef !== false && doUpdate !== false) {
      // appendChild/replaceChild/insertBefore 不应该触发
      // @Todo: 但其实如果 newChild 的父节点是另一颗子树的节点，应该是要触发的
      _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_7__.MutationObserver.record({
        type: "childList" /* MutationRecordType.CHILD_LIST */,
        target: this,
        removedNodes: [child],
        nextSibling: child.nextSibling,
        previousSibling: child.previousSibling
      });
    }
    // Data Structure
    const index = this.findIndex(child);
    this.childNodes.splice(index, 1);
    child.parentNode = null;
    // Set eventSource
    if (cleanRef !== false) {
      _event_source_js__WEBPACK_IMPORTED_MODULE_3__.eventSource.removeNodeTree(child);
    }
    // Serialization
    if (this._root && doUpdate !== false) {
      this.updateChildNodes();
    }
    return child;
  }
  remove(options) {
    var _a;
    (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this, options);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  enqueueUpdate(payload) {
    var _a;
    (_a = this._root) === null || _a === void 0 ? void 0 : _a.enqueueUpdate(payload);
  }
  get ownerDocument() {
    return _env_js__WEBPACK_IMPORTED_MODULE_6__["default"].document;
  }
  static extend(methodName, options) {
    (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.extend)(TaroNode, methodName, options);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/root.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/root.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroRootElement: function() { return /* binding */ TaroRootElement; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../options.js */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _perf_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../perf.js */ "./node_modules/@tarojs/runtime/dist/perf.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");






function findCustomWrapper(root, dataPathArr) {
  // ['root', 'cn', '[0]'] remove 'root' => ['cn', '[0]']
  const list = dataPathArr.slice(1);
  let currentData = root;
  let customWrapper;
  let splitedPath = '';
  list.some((item, i) => {
    const key = item
    // '[0]' => '0'
    .replace(/^\[(.+)\]$/, '$1')
    // 'cn' => 'childNodes'
    .replace(/\bcn\b/g, 'childNodes');
    currentData = currentData[key];
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(currentData)) {
      currentData = currentData.filter(el => !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.isComment)(el));
    }
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(currentData)) return true;
    if (currentData.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CUSTOM_WRAPPER) {
      const res = _utils_index_js__WEBPACK_IMPORTED_MODULE_1__.customWrapperCache.get(currentData.sid);
      if (res) {
        customWrapper = res;
        splitedPath = dataPathArr.slice(i + 2).join('.');
      }
    }
  });
  if (customWrapper) {
    return {
      customWrapper,
      splitedPath
    };
  }
}
class TaroRootElement extends _element_js__WEBPACK_IMPORTED_MODULE_3__.TaroElement {
  constructor() {
    super();
    this.updatePayloads = [];
    this.updateCallbacks = [];
    this.pendingUpdate = false;
    this.ctx = null;
    this.nodeName = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.ROOT_STR;
    this.tagName = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.ROOT_STR.toUpperCase();
  }
  get _path() {
    return _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.ROOT_STR;
  }
  get _root() {
    return this;
  }
  scheduleTask(fn) {
    // 这里若使用微任务可略微提前setData的执行时机，但在部分场景下可能会出现连续setData两次，造成更大的性能问题
    setTimeout(fn);
  }
  enqueueUpdate(payload) {
    this.updatePayloads.push(payload);
    if (!this.pendingUpdate && this.ctx) {
      this.performUpdate();
    }
  }
  performUpdate(initRender = false, prerender) {
    this.pendingUpdate = true;
    const ctx = _tarojs_shared__WEBPACK_IMPORTED_MODULE_4__.hooks.call('proxyToRaw', this.ctx);
    this.scheduleTask(() => {
      const setDataMark = `${_constants_index_js__WEBPACK_IMPORTED_MODULE_2__.SET_DATA} 开始时间戳 ${Date.now()}`;
      _perf_js__WEBPACK_IMPORTED_MODULE_5__.perf.start(setDataMark);
      const data = Object.create(null);
      const resetPaths = new Set(initRender ? ['root.cn.[0]', 'root.cn[0]'] : []);
      while (this.updatePayloads.length > 0) {
        const {
          path,
          value
        } = this.updatePayloads.shift();
        if (path.endsWith("cn" /* Shortcuts.Childnodes */)) {
          resetPaths.add(path);
        }
        data[path] = value;
      }
      for (const path in data) {
        resetPaths.forEach(p => {
          // 已经重置了数组，就不需要分别再设置了
          if (path.includes(p) && path !== p) {
            delete data[path];
          }
        });
        const value = data[path];
        if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(value)) {
          data[path] = value();
        }
      }
      // 预渲染
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(prerender)) return prerender(data);
      // 正常渲染
      this.pendingUpdate = false;
      let normalUpdate = {};
      const customWrapperMap = new Map();
      if (initRender) {
        // 初次渲染，使用页面级别的 setData
        normalUpdate = data;
      } else {
        // 更新渲染，区分 CustomWrapper 与页面级别的 setData
        for (const p in data) {
          const dataPathArr = p.split('.');
          const found = findCustomWrapper(this, dataPathArr);
          if (found) {
            // 此项数据使用 CustomWrapper 去更新
            const {
              customWrapper,
              splitedPath
            } = found;
            // 合并同一个 customWrapper 的相关更新到一次 setData 中
            customWrapperMap.set(customWrapper, Object.assign(Object.assign({}, customWrapperMap.get(customWrapper) || {}), {
              [`i.${splitedPath}`]: data[p]
            }));
          } else {
            // 此项数据使用页面去更新
            normalUpdate[p] = data[p];
          }
        }
      }
      const customWrapperCount = customWrapperMap.size;
      const isNeedNormalUpdate = Object.keys(normalUpdate).length > 0;
      const updateArrLen = customWrapperCount + (isNeedNormalUpdate ? 1 : 0);
      let executeTime = 0;
      const cb = () => {
        if (++executeTime === updateArrLen) {
          _perf_js__WEBPACK_IMPORTED_MODULE_5__.perf.stop(setDataMark);
          this.flushUpdateCallback();
          initRender && _perf_js__WEBPACK_IMPORTED_MODULE_5__.perf.stop(_constants_index_js__WEBPACK_IMPORTED_MODULE_2__.PAGE_INIT);
        }
      };
      // custom-wrapper setData
      if (customWrapperCount) {
        customWrapperMap.forEach((data, ctx) => {
          if ( true && _options_js__WEBPACK_IMPORTED_MODULE_6__.options.debug) {
            // eslint-disable-next-line no-console
            console.log('custom wrapper setData: ', data);
          }
          ctx.setData(data, cb);
        });
      }
      // page setData
      if (isNeedNormalUpdate) {
        if ( true && _options_js__WEBPACK_IMPORTED_MODULE_6__.options.debug) {
          // eslint-disable-next-line no-console
          console.log('page setData:', normalUpdate);
        }
        ctx.setData(normalUpdate, cb);
      }
    });
  }
  enqueueUpdateCallback(cb, ctx) {
    this.updateCallbacks.push(() => {
      ctx ? cb.call(ctx) : cb();
    });
  }
  flushUpdateCallback() {
    const updateCallbacks = this.updateCallbacks;
    if (!updateCallbacks.length) return;
    const copies = updateCallbacks.slice(0);
    this.updateCallbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/style.js":
/*!********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/style.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Style: function() { return /* binding */ Style; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dom-external/mutation-observer/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js");
/* harmony import */ var _style_properties_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./style_properties.js */ "./node_modules/@tarojs/runtime/dist/dom/style_properties.js");




function recordCss(obj) {
  _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_0__.MutationObserver.record({
    type: "attributes" /* MutationRecordType.ATTRIBUTES */,
    target: obj._element,
    attributeName: 'style',
    oldValue: obj.cssText
  });
}
function enqueueUpdate(obj) {
  const element = obj._element;
  if (element._root) {
    element.enqueueUpdate({
      path: `${element._path}.${"st" /* Shortcuts.Style */}`,
      value: obj.cssText
    });
  }
}
function setStyle(newVal, styleKey) {
   true && (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.warn)((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isString)(newVal) && newVal.length > _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.PROPERTY_THRESHOLD, `Style 属性 ${styleKey} 的值数据量过大，可能会影响渲染性能，考虑使用 CSS 类或其它方案替代。`);
  const old = this[styleKey];
  if (old === newVal) return;
  !this._pending && recordCss(this);
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isNull)(newVal) || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(newVal) || newVal === '') {
    this._usedStyleProp.delete(styleKey);
    delete this._value[styleKey];
  } else {
    this._usedStyleProp.add(styleKey);
    this._value[styleKey] = newVal;
  }
  !this._pending && enqueueUpdate(this);
}
function initStyle(ctor, styleProperties) {
  const properties = {};
  for (let i = 0; i < styleProperties.length; i++) {
    const styleKey = styleProperties[i];
    if (ctor[styleKey]) return;
    properties[styleKey] = {
      get() {
        const val = this._value[styleKey];
        return (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isNull)(val) || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(val) ? '' : val;
      },
      set(newVal) {
        setStyle.call(this, newVal, styleKey);
      }
    };
  }
  Object.defineProperties(ctor.prototype, properties);
}
function isCssVariable(propertyName) {
  return /^--/.test(propertyName);
}
class Style {
  constructor(element) {
    this._element = element;
    this._usedStyleProp = new Set();
    this._value = {};
  }
  setCssVariables(styleKey) {
    this.hasOwnProperty(styleKey) || Object.defineProperty(this, styleKey, {
      enumerable: true,
      configurable: true,
      get: () => {
        return this._value[styleKey] || '';
      },
      set: newVal => {
        setStyle.call(this, newVal, styleKey);
      }
    });
  }
  get cssText() {
    if (!this._usedStyleProp.size) return '';
    const texts = [];
    this._usedStyleProp.forEach(key => {
      const val = this[key];
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isNull)(val) || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(val)) return;
      let styleName = isCssVariable(key) ? key : (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toDashed)(key);
      if (styleName.indexOf('webkit') === 0 || styleName.indexOf('Webkit') === 0) {
        styleName = `-${styleName}`;
      }
      texts.push(`${styleName}: ${val};`);
    });
    return texts.join(' ');
  }
  set cssText(str) {
    this._pending = true;
    recordCss(this);
    this._usedStyleProp.forEach(prop => {
      this.removeProperty(prop);
    });
    if (str === '' || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(str) || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isNull)(str)) {
      this._pending = false;
      enqueueUpdate(this);
      return;
    }
    const rules = str.split(';');
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i].trim();
      if (rule === '') {
        continue;
      }
      // 可能存在 'background: url(http:x/y/z)' 的情况
      const [propName, ...valList] = rule.split(':');
      const val = valList.join(':');
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(val)) {
        continue;
      }
      this.setProperty(propName.trim(), val.trim());
    }
    this._pending = false;
    enqueueUpdate(this);
  }
  setProperty(propertyName, value) {
    if (propertyName[0] === '-') {
      // 支持 webkit 属性或 css 变量
      this.setCssVariables(propertyName);
    } else {
      propertyName = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(propertyName);
    }
    if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isNull)(value) || (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(value)) {
      this.removeProperty(propertyName);
    } else {
      this[propertyName] = value;
    }
  }
  removeProperty(propertyName) {
    propertyName = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(propertyName);
    if (!this._usedStyleProp.has(propertyName)) {
      return '';
    }
    const value = this[propertyName];
    this[propertyName] = undefined;
    return value;
  }
  getPropertyValue(propertyName) {
    propertyName = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.toCamelCase)(propertyName);
    const value = this[propertyName];
    if (!value) {
      return '';
    }
    return value;
  }
}
initStyle(Style, _style_properties_js__WEBPACK_IMPORTED_MODULE_4__.styleProperties);
_tarojs_shared__WEBPACK_IMPORTED_MODULE_5__.hooks.tap('injectNewStyleProperties', newStyleProperties => {
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isArray)(newStyleProperties)) {
    initStyle(Style, newStyleProperties);
  } else {
    if (typeof newStyleProperties !== 'string') return;
    initStyle(Style, [newStyleProperties]);
  }
});


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/style_properties.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/style_properties.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   styleProperties: function() { return /* binding */ styleProperties; }
/* harmony export */ });
/*
 *
 * https://www.w3.org/Style/CSS/all-properties.en.html
 */
const WEBKIT = 'webkit';
const styleProperties = ['all', 'appearance', 'backdropFilter', 'blockOverflow', 'blockSize', 'bottom', 'clear', 'contain', 'content', 'continue', 'cursor', 'direction', 'display', 'filter', 'float', 'gap', 'height', 'inset', 'isolation', 'left', 'letterSpacing', 'lightingColor', 'markerSide', 'mixBlendMode', 'opacity', 'order', 'position', 'quotes', 'resize', 'right', 'rowGap', 'tabSize', 'tableLayout', 'top', 'userSelect', 'verticalAlign', 'visibility', 'voiceFamily', 'volume', 'whiteSpace', 'widows', 'width', 'zIndex', 'pointerEvents', 'aspectRatio'
/** 非常用 style */
// 'azimuth',
// 'backfaceVisibility',
// 'baselineShift',
// 'captionSide',
// 'chains',
// 'dominantBaseline',
// 'elevation',
// 'emptyCells',
// 'forcedColorAdjust',
// 'glyphOrientationVertical',
// 'hangingPunctuation',
// 'hyphenateCharacter',
// 'hyphens',
// 'imageOrientation',
// 'imageResolution',
// 'orphans',
// 'playDuring',
// 'pointerEvents',
// 'regionFragment',
// 'richness',
// 'running',
// 'scrollBehavior',
// 'speechRate',
// 'stress',
// 'stringSet',
// 'unicodeBidi',
// 'willChange',
// 'writingMode',
];
// 减少文件体积
function combine(prefix, list, excludeSelf) {
  !excludeSelf && styleProperties.push(prefix);
  list.forEach(item => {
    styleProperties.push(prefix + item);
    if (prefix === WEBKIT) {
      styleProperties.push('Webkit' + item);
    }
  });
}
const color = 'Color';
const style = 'Style';
const width = 'Width';
const image = 'Image';
const size = 'Size';
const color_style_width = [color, style, width];
const fitlength_fitwidth_image = ['FitLength', 'FitWidth', image];
const fitlength_fitwidth_image_radius = [...fitlength_fitwidth_image, 'Radius'];
const color_style_width_fitlength_fitwidth_image = [...color_style_width, ...fitlength_fitwidth_image];
const endRadius_startRadius = ['EndRadius', 'StartRadius'];
const bottom_left_right_top = ['Bottom', 'Left', 'Right', 'Top'];
const end_start = ['End', 'Start'];
const content_items_self = ['Content', 'Items', 'Self'];
const blockSize_height_inlineSize_width = ['BlockSize', 'Height', 'InlineSize', width];
const after_before = ['After', 'Before'];
combine('borderBlock', color_style_width);
combine('borderBlockEnd', color_style_width);
combine('borderBlockStart', color_style_width);
combine('outline', [...color_style_width, 'Offset']);
combine('border', [...color_style_width, 'Boundary', 'Break', 'Collapse', 'Radius', 'Spacing']);
combine('borderFit', ['Length', width]);
combine('borderInline', color_style_width);
combine('borderInlineEnd', color_style_width);
combine('borderInlineStart', color_style_width);
combine('borderLeft', color_style_width_fitlength_fitwidth_image);
combine('borderRight', color_style_width_fitlength_fitwidth_image);
combine('borderTop', color_style_width_fitlength_fitwidth_image);
combine('borderBottom', color_style_width_fitlength_fitwidth_image);
combine('textDecoration', [color, style, 'Line']);
combine('textEmphasis', [color, style, 'Position']);
combine('scrollMargin', bottom_left_right_top);
combine('scrollPadding', bottom_left_right_top);
combine('padding', bottom_left_right_top);
combine('margin', [...bottom_left_right_top, 'Trim']);
combine('scrollMarginBlock', end_start);
combine('scrollMarginInline', end_start);
combine('scrollPaddingBlock', end_start);
combine('scrollPaddingInline', end_start);
combine('gridColumn', end_start);
combine('gridRow', end_start);
combine('insetBlock', end_start);
combine('insetInline', end_start);
combine('marginBlock', end_start);
combine('marginInline', end_start);
combine('paddingBlock', end_start);
combine('paddingInline', end_start);
combine('pause', after_before);
combine('cue', after_before);
combine('mask', ['Clip', 'Composite', image, 'Mode', 'Origin', 'Position', 'Repeat', size, 'Type']);
combine('borderImage', ['Outset', 'Repeat', 'Slice', 'Source', 'Transform', width]);
combine('maskBorder', ['Mode', 'Outset', 'Repeat', 'Slice', 'Source', width]);
combine('font', ['Family', 'FeatureSettings', 'Kerning', 'LanguageOverride', 'MaxSize', 'MinSize', 'OpticalSizing', 'Palette', size, 'SizeAdjust', 'Stretch', style, 'Weight', 'VariationSettings']);
combine('transform', ['Box', 'Origin', style]);
combine('background', [color, image, 'Attachment', 'BlendMode', 'Clip', 'Origin', 'Position', 'Repeat', size]);
combine('listStyle', [image, 'Position', 'Type']);
combine('scrollSnap', ['Align', 'Stop', 'Type']);
combine('grid', ['Area', 'AutoColumns', 'AutoFlow', 'AutoRows']);
combine('gridTemplate', ['Areas', 'Columns', 'Rows']);
combine('overflow', ['Block', 'Inline', 'Wrap', 'X', 'Y']);
combine('transition', ['Delay', 'Duration', 'Property', 'TimingFunction']);
combine('color', ['Adjust', 'InterpolationFilters', 'Scheme']);
combine('textAlign', ['All', 'Last']);
combine('page', ['BreakAfter', 'BreakBefore', 'BreakInside']);
combine('animation', ['Delay', 'Direction', 'Duration', 'FillMode', 'IterationCount', 'Name', 'PlayState', 'TimingFunction']);
combine('flex', ['Basis', 'Direction', 'Flow', 'Grow', 'Shrink', 'Wrap']);
combine('offset', [...after_before, ...end_start, 'Anchor', 'Distance', 'Path', 'Position', 'Rotate']);
combine('perspective', ['Origin']);
combine('clip', ['Path', 'Rule']);
combine('flow', ['From', 'Into']);
combine('align', ['Content', 'Items', 'Self'], true);
combine('alignment', ['Adjust', 'Baseline'], true);
combine('borderStart', endRadius_startRadius, true);
combine('borderEnd', endRadius_startRadius, true);
combine('borderCorner', ['Fit', image, 'ImageTransform'], true);
combine('borderTopLeft', fitlength_fitwidth_image_radius, true);
combine('borderTopRight', fitlength_fitwidth_image_radius, true);
combine('borderBottomLeft', fitlength_fitwidth_image_radius, true);
combine('borderBottomRight', fitlength_fitwidth_image_radius, true);
combine('column', ['s', 'Count', 'Fill', 'Gap', 'Rule', 'RuleColor', 'RuleStyle', 'RuleWidth', 'Span', width], true);
combine('break', [...after_before, 'Inside'], true);
combine('wrap', [...after_before, 'Flow', 'Inside', 'Through'], true);
combine('justify', content_items_self, true);
combine('place', content_items_self, true);
combine('max', [...blockSize_height_inlineSize_width, 'Lines'], true);
combine('min', blockSize_height_inlineSize_width, true);
combine('line', ['Break', 'Clamp', 'Grid', 'Height', 'Padding', 'Snap'], true);
combine('inline', ['BoxAlign', size, 'Sizing'], true);
combine('text', ['CombineUpright', 'GroupAlign', 'Height', 'Indent', 'Justify', 'Orientation', 'Overflow', 'Shadow', 'SpaceCollapse', 'SpaceTrim', 'Spacing', 'Transform', 'UnderlinePosition', 'Wrap'], true);
combine('shape', ['ImageThreshold', 'Inside', 'Margin', 'Outside'], true);
combine('word', ['Break', 'Spacing', 'Wrap'], true);
combine('object', ['Fit', 'Position'], true);
combine('box', ['DecorationBreak', 'Shadow', 'Sizing', 'Snap'], true);
combine(WEBKIT, ['LineClamp', 'BoxOrient', 'TextFillColor', 'TextStroke', 'TextStrokeColor', 'TextStrokeWidth'], true);


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/svg.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/svg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SVGElement: function() { return /* binding */ SVGElement; }
/* harmony export */ });
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");


// for Vue3
class SVGElement extends _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement {}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/text.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/text.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TaroText: function() { return /* binding */ TaroText; }
/* harmony export */ });
/* harmony import */ var _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dom-external/mutation-observer/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js");
/* harmony import */ var _node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node.js */ "./node_modules/@tarojs/runtime/dist/dom/node.js");


class TaroText extends _node_js__WEBPACK_IMPORTED_MODULE_0__.TaroNode {
  constructor(value) {
    super();
    this.nodeType = 3 /* NodeType.TEXT_NODE */;
    this.nodeName = '#text';
    this._value = value;
  }
  set textContent(text) {
    _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_1__.MutationObserver.record({
      target: this,
      type: "characterData" /* MutationRecordType.CHARACTER_DATA */,
      oldValue: this._value
    });
    this._value = text;
    this.enqueueUpdate({
      path: `${this._path}.${"v" /* Shortcuts.Text */}`,
      value: text
    });
  }
  get textContent() {
    return this._value;
  }
  set nodeValue(text) {
    this.textContent = text;
  }
  get nodeValue() {
    return this._value;
  }
  set data(text) {
    this.textContent = text;
  }
  get data() {
    return this._value;
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/transfer.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/transfer.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TransferElement: function() { return /* binding */ TransferElement; }
/* harmony export */ });
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");

class TransferElement extends _element_js__WEBPACK_IMPORTED_MODULE_0__.TaroElement {
  constructor(dataName) {
    super();
    this.dataName = dataName;
    this.isTransferElement = true;
  }
  get _path() {
    return this.dataName;
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dom/tree.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dom/tree.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   treeToArray: function() { return /* binding */ treeToArray; }
/* harmony export */ });
function returnTrue() {
  return true;
}
function treeToArray(root, predict) {
  const array = [];
  const filter = predict !== null && predict !== void 0 ? predict : returnTrue;
  let object = root;
  while (object) {
    if (object.nodeType === 1 /* NodeType.ELEMENT_NODE */ && filter(object)) {
      array.push(object);
    }
    object = following(object, root);
  }
  return array;
}
function following(el, root) {
  const firstChild = el.firstChild;
  const isElmentTypeValid = el.nodeType === 1 /* NodeType.ELEMENT_NODE */ || el.nodeType === 9 /* NodeType.DOCUMENT_NODE */;
  // 如果当前 el 不是 element 或 document 元素，则可以直接不递归他的子元素了
  if (firstChild && isElmentTypeValid) {
    return firstChild;
  }
  let current = el;
  do {
    if (current === root) {
      return null;
    }
    const nextSibling = current.nextSibling;
    if (nextSibling) {
      return nextSibling;
    }
    current = current.parentElement;
  } while (current);
  return null;
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/dsl/common.js":
/*!*********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/dsl/common.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createComponentConfig: function() { return /* binding */ createComponentConfig; },
/* harmony export */   createPageConfig: function() { return /* binding */ createPageConfig; },
/* harmony export */   createRecursiveComponentConfig: function() { return /* binding */ createRecursiveComponentConfig; },
/* harmony export */   getOnHideEventKey: function() { return /* binding */ getOnHideEventKey; },
/* harmony export */   getOnReadyEventKey: function() { return /* binding */ getOnReadyEventKey; },
/* harmony export */   getOnShowEventKey: function() { return /* binding */ getOnShowEventKey; },
/* harmony export */   getPageInstance: function() { return /* binding */ getPageInstance; },
/* harmony export */   getPath: function() { return /* binding */ getPath; },
/* harmony export */   injectPageInstance: function() { return /* binding */ injectPageInstance; },
/* harmony export */   removePageInstance: function() { return /* binding */ removePageInstance; },
/* harmony export */   safeExecute: function() { return /* binding */ safeExecute; },
/* harmony export */   stringify: function() { return /* binding */ stringify; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/components.js");
/* harmony import */ var _bom_raf_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../bom/raf.js */ "./node_modules/@tarojs/runtime/dist/bom/raf.js");
/* harmony import */ var _bom_window_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../bom/window.js */ "./node_modules/@tarojs/runtime/dist/bom/window.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _current_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../current.js */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _dom_event_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../dom/event.js */ "./node_modules/@tarojs/runtime/dist/dom/event.js");
/* harmony import */ var _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../emitter/emitter.js */ "./node_modules/@tarojs/runtime/dist/emitter/emitter.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _perf_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../perf.js */ "./node_modules/@tarojs/runtime/dist/perf.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _utils_router_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/router.js */ "./node_modules/@tarojs/runtime/dist/utils/router.js");












/* eslint-disable dot-notation */
const instances = new Map();
const pageId = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.incrementId)();
function injectPageInstance(inst, id) {
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('mergePageInstance', instances.get(id), inst);
  instances.set(id, inst);
}
function getPageInstance(id) {
  return instances.get(id);
}
function removePageInstance(id) {
  instances.delete(id);
}
function safeExecute(path, lifecycle, ...args) {
  const instance = instances.get(path);
  if (instance == null) {
    return;
  }
  const func = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('getLifecycle', instance, lifecycle);
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isArray)(func)) {
    const res = func.map(fn => fn.apply(instance, args));
    return res[0];
  }
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isFunction)(func)) {
    return;
  }
  return func.apply(instance, args);
}
function stringify(obj) {
  if (obj == null) {
    return '';
  }
  const path = Object.keys(obj).map(key => {
    return key + '=' + obj[key];
  }).join('&');
  return path === '' ? path : '?' + path;
}
function getPath(id, options) {
  const idx = id.indexOf('?');
  if (false) {} else {
    return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options)}`;
  }
}
function getOnReadyEventKey(path) {
  return path + '.' + _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_READY;
}
function getOnShowEventKey(path) {
  return path + '.' + _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_SHOW;
}
function getOnHideEventKey(path) {
  return path + '.' + _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_HIDE;
}
function createPageConfig(component, pageName, data, pageConfig) {
  // 小程序 Page 构造器是一个傲娇小公主，不能把复杂的对象挂载到参数上
  const id = pageName !== null && pageName !== void 0 ? pageName : `taro_page_${pageId()}`;
  const [ONLOAD, ONUNLOAD, ONREADY, ONSHOW, ONHIDE, LIFECYCLES, SIDE_EFFECT_LIFECYCLES] = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('getMiniLifecycleImpl').page;
  let pageElement = null;
  let unmounting = false;
  let prepareMountList = [];
  function setCurrentRouter(page) {
    const router =  false ? 0 : page.route || page.__route__ || page.$taroPath;
    _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.router = {
      params: page.$taroParams,
      path: (0,_utils_router_js__WEBPACK_IMPORTED_MODULE_5__.addLeadingSlash)(router),
      $taroPath: page.$taroPath,
      onReady: getOnReadyEventKey(id),
      onShow: getOnShowEventKey(id),
      onHide: getOnHideEventKey(id)
    };
    if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(page.exitState)) {
      _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.router.exitState = page.exitState;
    }
  }
  let loadResolver;
  let hasLoaded;
  const config = {
    [ONLOAD](options = {}, cb) {
      hasLoaded = new Promise(resolve => {
        loadResolver = resolve;
      });
      _perf_js__WEBPACK_IMPORTED_MODULE_6__.perf.start(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.PAGE_INIT);
      _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.page = this;
      this.config = pageConfig || {};
      // this.$taroPath 是页面唯一标识
      const uniqueOptions = Object.assign({}, options, {
        $taroTimestamp: Date.now()
      });
      const $taroPath = this.$taroPath = getPath(id, uniqueOptions);
      if (false) {}
      // this.$taroParams 作为暴露给开发者的页面参数对象，可以被随意修改
      if (this.$taroParams == null) {
        this.$taroParams = uniqueOptions;
      }
      setCurrentRouter(this);
      // 初始化当前页面的上下文信息
      if (true) {
        _bom_window_js__WEBPACK_IMPORTED_MODULE_7__.taroWindowProvider.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.INIT, $taroPath);
      }
      const mount = () => {
        _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.app.mount(component, $taroPath, () => {
          if (false) {} else {
            pageElement = _env_js__WEBPACK_IMPORTED_MODULE_8__["default"].document.getElementById($taroPath);
          }
          (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.ensure)(pageElement !== null, '没有找到页面实例。');
          safeExecute($taroPath, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_LOAD, this.$taroParams);
          loadResolver();
          if (true) {
            pageElement.ctx = this;
            if (false) {} else {
              pageElement.performUpdate(true, cb);
            }
          } else {}
        });
      };
      if (unmounting) {
        prepareMountList.push(mount);
      } else {
        mount();
      }
    },
    [ONUNLOAD]() {
      const $taroPath = this.$taroPath;
      // 销毁当前页面的上下文信息
      if (true) {
        _bom_window_js__WEBPACK_IMPORTED_MODULE_7__.taroWindowProvider.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.DESTROY, $taroPath);
      }
      // 触发onUnload生命周期
      safeExecute($taroPath, ONUNLOAD);
      unmounting = true;
      _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.app.unmount($taroPath, () => {
        unmounting = false;
        instances.delete($taroPath);
        if (pageElement) {
          pageElement.ctx = null;
          pageElement = null;
        }
        if (prepareMountList.length) {
          prepareMountList.forEach(fn => fn());
          prepareMountList = [];
        }
      });
    },
    [ONREADY]() {
      hasLoaded.then(() => {
        // 触发生命周期
        safeExecute(this.$taroPath, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_READY);
        // 通过事件触发子组件的生命周期
        (0,_bom_raf_js__WEBPACK_IMPORTED_MODULE_10__.raf)(() => _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_11__.eventCenter.trigger(getOnReadyEventKey(id)));
        this.onReady.called = true;
      });
    },
    [ONSHOW](options = {}) {
      hasLoaded.then(() => {
        // 设置 Current 的 page 和 router
        _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.page = this;
        setCurrentRouter(this);
        // 恢复上下文信息
        if (true) {
          _bom_window_js__WEBPACK_IMPORTED_MODULE_7__.taroWindowProvider.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.RECOVER, this.$taroPath);
        }
        // 触发生命周期
        safeExecute(this.$taroPath, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_SHOW, options);
        // 通过事件触发子组件的生命周期
        (0,_bom_raf_js__WEBPACK_IMPORTED_MODULE_10__.raf)(() => _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_11__.eventCenter.trigger(getOnShowEventKey(id)));
      });
    },
    [ONHIDE]() {
      // 缓存当前页面上下文信息
      if (true) {
        _bom_window_js__WEBPACK_IMPORTED_MODULE_7__.taroWindowProvider.trigger(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CONTEXT_ACTIONS.RESTORE, this.$taroPath);
      }
      // 设置 Current 的 page 和 router
      if (_current_js__WEBPACK_IMPORTED_MODULE_4__.Current.page === this) {
        _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.page = null;
        _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.router = null;
      }
      // 触发生命周期
      safeExecute(this.$taroPath, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_HIDE);
      // 通过事件触发子组件的生命周期
      _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_11__.eventCenter.trigger(getOnHideEventKey(id));
    }
  };
  if (false) {}
  const isSWAN = "weapp" === 'swan'; // 百度小程序
  LIFECYCLES.forEach(lifecycle => {
    let isDefer = false;
    let isEvent = false;
    lifecycle = lifecycle.replace(/^defer:/, () => {
      isDefer = true;
      return '';
    });
    lifecycle = lifecycle.replace(/^events:/, () => {
      isEvent = true;
      return '';
    });
    if (isEvent && "weapp" === 'alipay') {} else {
      config[lifecycle] = function () {
        const exec = () => safeExecute(this.$taroPath, lifecycle, ...arguments);
        if (isSWAN) {
          return exec();
        }
        if (isDefer) {
          hasLoaded.then(exec);
        } else {
          return exec();
        }
      };
    }
  });
  // onShareAppMessage 和 onShareTimeline 一样，会影响小程序右上方按钮的选项，因此不能默认注册。
  SIDE_EFFECT_LIFECYCLES.forEach(lifecycle => {
    var _a;
    if (component[lifecycle] || ((_a = component.prototype) === null || _a === void 0 ? void 0 : _a[lifecycle]) || component[lifecycle.replace(/^on/, 'enable')] || (pageConfig === null || pageConfig === void 0 ? void 0 : pageConfig[lifecycle.replace(/^on/, 'enable')])) {
      config[lifecycle] = function (...args) {
        var _a;
        const target = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.target;
        if (target === null || target === void 0 ? void 0 : target.id) {
          const id = target.id;
          const element = _env_js__WEBPACK_IMPORTED_MODULE_8__["default"].document.getElementById(id);
          if (element) {
            target.dataset = element.dataset;
          }
        }
        return safeExecute(this.$taroPath, lifecycle, ...args);
      };
    }
  });
  config.eh = _dom_event_js__WEBPACK_IMPORTED_MODULE_12__.eventHandler;
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(data)) {
    config.data = data;
  }
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('modifyPageObject', config);
  return config;
}
function createComponentConfig(component, componentName, data) {
  const id = componentName !== null && componentName !== void 0 ? componentName : `taro_component_${pageId()}`;
  let componentElement = null;
  const [ATTACHED, DETACHED] = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('getMiniLifecycleImpl').component;
  const config = {
    [ATTACHED]() {
      var _a;
      _perf_js__WEBPACK_IMPORTED_MODULE_6__.perf.start(_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.PAGE_INIT);
      this.pageIdCache = ((_a = this.getPageId) === null || _a === void 0 ? void 0 : _a.call(this)) || pageId();
      const path = getPath(id, {
        id: this.pageIdCache
      });
      _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.app.mount(component, path, () => {
        componentElement = _env_js__WEBPACK_IMPORTED_MODULE_8__["default"].document.getElementById(path);
        (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.ensure)(componentElement !== null, '没有找到组件实例。');
        this.$taroInstances = instances.get(path);
        safeExecute(path, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.ON_LOAD);
        if (true) {
          componentElement.ctx = this;
          if (true) {
            componentElement.performUpdate(true);
          }
        }
      });
    },
    [DETACHED]() {
      const path = getPath(id, {
        id: this.pageIdCache
      });
      _current_js__WEBPACK_IMPORTED_MODULE_4__.Current.app.unmount(path, () => {
        instances.delete(path);
        if (componentElement) {
          componentElement.ctx = null;
        }
      });
    },
    methods: {
      eh: _dom_event_js__WEBPACK_IMPORTED_MODULE_12__.eventHandler
    }
  };
  if (!(0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(data)) {
    config.data = data;
  }
  [_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.OPTIONS, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.EXTERNAL_CLASSES, _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.BEHAVIORS].forEach(key => {
    var _a;
    config[key] = (_a = component[key]) !== null && _a !== void 0 ? _a : _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.EMPTY_OBJ;
  });
  return config;
}
function createRecursiveComponentConfig(componentName) {
  const isCustomWrapper = componentName === _constants_index_js__WEBPACK_IMPORTED_MODULE_3__.CUSTOM_WRAPPER;
  const [ATTACHED, DETACHED] = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('getMiniLifecycleImpl').component;
  const lifeCycles = isCustomWrapper ? {
    [ATTACHED]() {
      var _a, _b;
      if (false) {}
      const componentId = ((_a = this.data.i) === null || _a === void 0 ? void 0 : _a.sid) || ((_b = this.props.i) === null || _b === void 0 ? void 0 : _b.sid);
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isString)(componentId)) {
        _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.customWrapperCache.set(componentId, this);
        const el = _env_js__WEBPACK_IMPORTED_MODULE_8__["default"].document.getElementById(componentId);
        if (el) {
          el.ctx = this;
        }
      }
    },
    [DETACHED]() {
      var _a, _b;
      if (false) {}
      const componentId = ((_a = this.data.i) === null || _a === void 0 ? void 0 : _a.sid) || ((_b = this.props.i) === null || _b === void 0 ? void 0 : _b.sid);
      if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.isString)(componentId)) {
        _utils_index_js__WEBPACK_IMPORTED_MODULE_0__.customWrapperCache.delete(componentId);
        const el = _env_js__WEBPACK_IMPORTED_MODULE_8__["default"].document.getElementById(componentId);
        if (el) {
          el.ctx = null;
        }
      }
    }
  } : _tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.EMPTY_OBJ;
  // 不同平台的个性化配置
  const extraOptions = {};
  if (false) {}
  return _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('modifyRecursiveComponentConfig', Object.assign({
    properties: {
      i: {
        type: Object,
        value: {
          ["nn" /* Shortcuts.NodeName */]: (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_9__.getComponentsAlias)(_tarojs_shared__WEBPACK_IMPORTED_MODULE_13__.internalComponents)[_constants_index_js__WEBPACK_IMPORTED_MODULE_3__.VIEW]._num
        }
      },
      l: {
        type: String,
        value: ''
      }
    },
    options: Object.assign(Object.assign({}, extraOptions), {
      virtualHost: !isCustomWrapper
    }),
    methods: {
      eh: _dom_event_js__WEBPACK_IMPORTED_MODULE_12__.eventHandler
    }
  }, lifeCycles), {
    isCustomWrapper
  });
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/emitter/emitter.js":
/*!**************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/emitter/emitter.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventCenter: function() { return /* binding */ eventCenter; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/event-emitter.js");


const eventCenter = _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.hooks.call('getEventCenter', _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.Events);


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/env.js":
/*!**************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/env.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ env; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");

const env = {
  window:  false ? 0 : _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ,
  document:  false ? 0 : _tarojs_shared__WEBPACK_IMPORTED_MODULE_0__.EMPTY_OBJ
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/hydrate.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/hydrate.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hydrate: function() { return /* binding */ hydrate; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");



let SPECIAL_NODES;
let componentsAlias;
/**
 * React also has a fancy function's name for this: `hydrate()`.
 * You may have been heard `hydrate` as a SSR-related function,
 * actually, `hydrate` basicly do the `render()` thing, but ignore some properties,
 * it's a vnode traverser and modifier: that's exactly what Taro's doing in here.
 */
function hydrate(node) {
  var _a;
  // 初始化 componentsAlias
  componentsAlias || (componentsAlias = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.getComponentsAlias)());
  // 初始化 SPECIAL_NODES
  SPECIAL_NODES || (SPECIAL_NODES = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('getSpecialNodes'));
  const nodeName = node.nodeName;
  let compileModeName = null;
  if ((0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isText)(node)) {
    return {
      sid: node.sid,
      ["v" /* Shortcuts.Text */]: node.nodeValue,
      ["nn" /* Shortcuts.NodeName */]: ((_a = componentsAlias[nodeName]) === null || _a === void 0 ? void 0 : _a._num) || '8'
    };
  }
  const data = {
    ["nn" /* Shortcuts.NodeName */]: nodeName,
    sid: node.sid
  };
  if (node.uid !== node.sid) {
    data.uid = node.uid;
  }
  if (SPECIAL_NODES.indexOf(nodeName) > -1) {
    if (!node.isAnyEventBinded()) {
      data["nn" /* Shortcuts.NodeName */] = `static-${nodeName}`;
      if (nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.VIEW && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isHasExtractProp)(node)) {
        data["nn" /* Shortcuts.NodeName */] = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.PURE_VIEW;
      }
    }
    if (nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.VIEW && node.isOnlyClickBinded() && !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isHasExtractProp)(node)) {
      data["nn" /* Shortcuts.NodeName */] = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CLICK_VIEW;
    }
  }
  const {
    props
  } = node;
  for (const prop in props) {
    const propInCamelCase = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.toCamelCase)(prop);
    if (!prop.startsWith('data-') &&
    // 在 node.dataset 的数据
    prop !== _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CLASS && prop !== _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.STYLE && prop !== _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.ID && propInCamelCase !== _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CATCHMOVE && propInCamelCase !== _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.COMPILE_MODE) {
      data[propInCamelCase] = props[prop];
    }
    if ( true && nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.VIEW && propInCamelCase === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CATCHMOVE && props[prop] !== false) {
      data["nn" /* Shortcuts.NodeName */] = _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.CATCH_VIEW;
    }
    if (propInCamelCase === _constants_index_js__WEBPACK_IMPORTED_MODULE_2__.COMPILE_MODE) {
      compileModeName = props[prop];
    }
  }
  // Children
  data["cn" /* Shortcuts.Childnodes */] = node.childNodes.filter(node => !(0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.isComment)(node)).map(hydrate);
  if (node.className !== '') {
    data["cl" /* Shortcuts.Class */] = node.className;
  }
  const cssText = node.cssText;
  if (cssText !== '' && nodeName !== 'swiper-item') {
    data["st" /* Shortcuts.Style */] = cssText;
  }
  _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('modifyHydrateData', data, node);
  const nn = data["nn" /* Shortcuts.NodeName */];
  const componentAlias = componentsAlias[nn];
  if (componentAlias) {
    data["nn" /* Shortcuts.NodeName */] = componentAlias._num;
    for (const prop in data) {
      if (prop in componentAlias) {
        data[componentAlias[prop]] = data[prop];
        delete data[prop];
      }
    }
  }
  if (compileModeName !== null) {
    data["nn" /* Shortcuts.NodeName */] = compileModeName;
  }
  const resData = _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.hooks.call('transferHydrateData', data, node, componentAlias);
  return resData || data;
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/index.js":
/*!****************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/index.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.A; },
/* harmony export */   APP: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.APP; },
/* harmony export */   BEHAVIORS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.BEHAVIORS; },
/* harmony export */   BODY: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.BODY; },
/* harmony export */   CATCHMOVE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CATCHMOVE; },
/* harmony export */   CATCH_VIEW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CATCH_VIEW; },
/* harmony export */   CHANGE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CHANGE; },
/* harmony export */   CLASS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CLASS; },
/* harmony export */   CLICK_VIEW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CLICK_VIEW; },
/* harmony export */   COMMENT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.COMMENT; },
/* harmony export */   COMPILE_MODE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.COMPILE_MODE; },
/* harmony export */   CONFIRM: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CONFIRM; },
/* harmony export */   CONTAINER: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CONTAINER; },
/* harmony export */   CONTEXT_ACTIONS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CONTEXT_ACTIONS; },
/* harmony export */   CURRENT_TARGET: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CURRENT_TARGET; },
/* harmony export */   CUSTOM_WRAPPER: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.CUSTOM_WRAPPER; },
/* harmony export */   Current: function() { return /* reexport safe */ _current_js__WEBPACK_IMPORTED_MODULE_24__.Current; },
/* harmony export */   DATASET: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.DATASET; },
/* harmony export */   DATE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.DATE; },
/* harmony export */   DOCUMENT_ELEMENT_NAME: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.DOCUMENT_ELEMENT_NAME; },
/* harmony export */   DOCUMENT_FRAGMENT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.DOCUMENT_FRAGMENT; },
/* harmony export */   EVENT_CALLBACK_RESULT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.EVENT_CALLBACK_RESULT; },
/* harmony export */   EXTERNAL_CLASSES: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.EXTERNAL_CLASSES; },
/* harmony export */   Events: function() { return /* reexport safe */ _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.Events; },
/* harmony export */   FOCUS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.FOCUS; },
/* harmony export */   FormElement: function() { return /* reexport safe */ _dom_form_js__WEBPACK_IMPORTED_MODULE_15__.FormElement; },
/* harmony export */   HEAD: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.HEAD; },
/* harmony export */   HOOKS_APP_ID: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.HOOKS_APP_ID; },
/* harmony export */   HTML: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.HTML; },
/* harmony export */   History: function() { return /* reexport safe */ _bom_history_js__WEBPACK_IMPORTED_MODULE_6__.History; },
/* harmony export */   ID: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ID; },
/* harmony export */   INPUT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.INPUT; },
/* harmony export */   KEY_CODE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.KEY_CODE; },
/* harmony export */   Location: function() { return /* reexport safe */ _bom_location_js__WEBPACK_IMPORTED_MODULE_7__.Location; },
/* harmony export */   MutationObserver: function() { return /* reexport safe */ _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_22__.MutationObserver; },
/* harmony export */   OBJECT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.OBJECT; },
/* harmony export */   ON_HIDE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ON_HIDE; },
/* harmony export */   ON_LOAD: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ON_LOAD; },
/* harmony export */   ON_READY: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ON_READY; },
/* harmony export */   ON_SHOW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ON_SHOW; },
/* harmony export */   OPTIONS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.OPTIONS; },
/* harmony export */   PAGE_INIT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.PAGE_INIT; },
/* harmony export */   PROPERTY_THRESHOLD: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.PROPERTY_THRESHOLD; },
/* harmony export */   PROPS: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.PROPS; },
/* harmony export */   PURE_VIEW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.PURE_VIEW; },
/* harmony export */   ROOT_STR: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.ROOT_STR; },
/* harmony export */   SET_DATA: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.SET_DATA; },
/* harmony export */   SET_TIMEOUT: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.SET_TIMEOUT; },
/* harmony export */   STATIC_VIEW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.STATIC_VIEW; },
/* harmony export */   STYLE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.STYLE; },
/* harmony export */   SVGElement: function() { return /* reexport safe */ _dom_svg_js__WEBPACK_IMPORTED_MODULE_19__.SVGElement; },
/* harmony export */   Style: function() { return /* reexport safe */ _dom_style_js__WEBPACK_IMPORTED_MODULE_18__.Style; },
/* harmony export */   TARGET: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.TARGET; },
/* harmony export */   TARO_RUNTIME: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.TARO_RUNTIME; },
/* harmony export */   TIME_STAMP: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.TIME_STAMP; },
/* harmony export */   TOUCHMOVE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.TOUCHMOVE; },
/* harmony export */   TYPE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.TYPE; },
/* harmony export */   TaroElement: function() { return /* reexport safe */ _dom_element_js__WEBPACK_IMPORTED_MODULE_13__.TaroElement; },
/* harmony export */   TaroEvent: function() { return /* reexport safe */ _dom_event_js__WEBPACK_IMPORTED_MODULE_14__.TaroEvent; },
/* harmony export */   TaroNode: function() { return /* reexport safe */ _dom_node_js__WEBPACK_IMPORTED_MODULE_16__.TaroNode; },
/* harmony export */   TaroRootElement: function() { return /* reexport safe */ _dom_root_js__WEBPACK_IMPORTED_MODULE_17__.TaroRootElement; },
/* harmony export */   TaroText: function() { return /* reexport safe */ _dom_text_js__WEBPACK_IMPORTED_MODULE_20__.TaroText; },
/* harmony export */   UID: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.UID; },
/* harmony export */   URL: function() { return /* reexport safe */ _bom_URL_js__WEBPACK_IMPORTED_MODULE_10__.TaroURLProvider; },
/* harmony export */   URLSearchParams: function() { return /* reexport safe */ _bom_URLSearchParams_js__WEBPACK_IMPORTED_MODULE_11__.URLSearchParams; },
/* harmony export */   VALUE: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.VALUE; },
/* harmony export */   VIEW: function() { return /* reexport safe */ _constants_index_js__WEBPACK_IMPORTED_MODULE_23__.VIEW; },
/* harmony export */   addLeadingSlash: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.addLeadingSlash; },
/* harmony export */   cancelAnimationFrame: function() { return /* reexport safe */ _bom_raf_js__WEBPACK_IMPORTED_MODULE_9__.caf; },
/* harmony export */   convertNumber2PX: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.convertNumber2PX; },
/* harmony export */   createComponentConfig: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.createComponentConfig; },
/* harmony export */   createEvent: function() { return /* reexport safe */ _dom_event_js__WEBPACK_IMPORTED_MODULE_14__.createEvent; },
/* harmony export */   createPageConfig: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.createPageConfig; },
/* harmony export */   createRecursiveComponentConfig: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.createRecursiveComponentConfig; },
/* harmony export */   customWrapperCache: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.customWrapperCache; },
/* harmony export */   debounce: function() { return /* reexport safe */ _utils_lodash_js__WEBPACK_IMPORTED_MODULE_34__.debounce; },
/* harmony export */   document: function() { return /* reexport safe */ _bom_document_js__WEBPACK_IMPORTED_MODULE_4__.taroDocumentProvider; },
/* harmony export */   env: function() { return /* reexport safe */ _env_js__WEBPACK_IMPORTED_MODULE_1__["default"]; },
/* harmony export */   eventCenter: function() { return /* reexport safe */ _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_27__.eventCenter; },
/* harmony export */   eventHandler: function() { return /* reexport safe */ _dom_event_js__WEBPACK_IMPORTED_MODULE_14__.eventHandler; },
/* harmony export */   eventHandlerTTDom: function() { return /* reexport safe */ _dom_event_js__WEBPACK_IMPORTED_MODULE_14__.eventHandlerTTDom; },
/* harmony export */   eventSource: function() { return /* reexport safe */ _dom_event_source_js__WEBPACK_IMPORTED_MODULE_25__.eventSource; },
/* harmony export */   extend: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.extend; },
/* harmony export */   getComponentsAlias: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.getComponentsAlias; },
/* harmony export */   getComputedStyle: function() { return /* reexport safe */ _bom_getComputedStyle_js__WEBPACK_IMPORTED_MODULE_5__.taroGetComputedStyleProvider; },
/* harmony export */   getCurrentInstance: function() { return /* reexport safe */ _current_js__WEBPACK_IMPORTED_MODULE_24__.getCurrentInstance; },
/* harmony export */   getCurrentPage: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.getCurrentPage; },
/* harmony export */   getHomePage: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.getHomePage; },
/* harmony export */   getOnHideEventKey: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.getOnHideEventKey; },
/* harmony export */   getOnReadyEventKey: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.getOnReadyEventKey; },
/* harmony export */   getOnShowEventKey: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.getOnShowEventKey; },
/* harmony export */   getPageInstance: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.getPageInstance; },
/* harmony export */   getPath: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.getPath; },
/* harmony export */   handlePolyfill: function() { return /* reexport safe */ _polyfill_index_js__WEBPACK_IMPORTED_MODULE_33__.handlePolyfill; },
/* harmony export */   hasBasename: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.hasBasename; },
/* harmony export */   history: function() { return /* reexport safe */ _bom_window_js__WEBPACK_IMPORTED_MODULE_12__.taroHistoryProvider; },
/* harmony export */   hooks: function() { return /* reexport safe */ _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.hooks; },
/* harmony export */   hydrate: function() { return /* reexport safe */ _hydrate_js__WEBPACK_IMPORTED_MODULE_28__.hydrate; },
/* harmony export */   incrementId: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.incrementId; },
/* harmony export */   injectPageInstance: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.injectPageInstance; },
/* harmony export */   isComment: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.isComment; },
/* harmony export */   isElement: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.isElement; },
/* harmony export */   isHasExtractProp: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.isHasExtractProp; },
/* harmony export */   isParentBound: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.isParentBound; },
/* harmony export */   isText: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.isText; },
/* harmony export */   location: function() { return /* reexport safe */ _bom_window_js__WEBPACK_IMPORTED_MODULE_12__.taroLocationProvider; },
/* harmony export */   navigator: function() { return /* reexport safe */ _bom_navigator_js__WEBPACK_IMPORTED_MODULE_8__.nav; },
/* harmony export */   nextTick: function() { return /* reexport safe */ _next_tick_js__WEBPACK_IMPORTED_MODULE_29__.nextTick; },
/* harmony export */   now: function() { return /* reexport safe */ _bom_raf_js__WEBPACK_IMPORTED_MODULE_9__.now; },
/* harmony export */   options: function() { return /* reexport safe */ _options_js__WEBPACK_IMPORTED_MODULE_30__.options; },
/* harmony export */   parseUrl: function() { return /* reexport safe */ _bom_URL_js__WEBPACK_IMPORTED_MODULE_10__.parseUrl; },
/* harmony export */   perf: function() { return /* reexport safe */ _perf_js__WEBPACK_IMPORTED_MODULE_31__.perf; },
/* harmony export */   removePageInstance: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.removePageInstance; },
/* harmony export */   requestAnimationFrame: function() { return /* reexport safe */ _bom_raf_js__WEBPACK_IMPORTED_MODULE_9__.raf; },
/* harmony export */   safeExecute: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.safeExecute; },
/* harmony export */   setInnerHTML: function() { return /* reexport safe */ _dom_external_inner_html_html_js__WEBPACK_IMPORTED_MODULE_21__.setInnerHTML; },
/* harmony export */   shortcutAttr: function() { return /* reexport safe */ _utils_index_js__WEBPACK_IMPORTED_MODULE_32__.shortcutAttr; },
/* harmony export */   stringify: function() { return /* reexport safe */ _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__.stringify; },
/* harmony export */   stripBasename: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.stripBasename; },
/* harmony export */   stripSuffix: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.stripSuffix; },
/* harmony export */   stripTrailing: function() { return /* reexport safe */ _utils_router_js__WEBPACK_IMPORTED_MODULE_35__.stripTrailing; },
/* harmony export */   throttle: function() { return /* reexport safe */ _utils_lodash_js__WEBPACK_IMPORTED_MODULE_34__.throttle; },
/* harmony export */   window: function() { return /* reexport safe */ _bom_window_js__WEBPACK_IMPORTED_MODULE_12__.taroWindowProvider; }
/* harmony export */ });
/* harmony import */ var _dom_external_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dom-external/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/index.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env.js */ "./node_modules/@tarojs/runtime/dist/env.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");
/* harmony import */ var _bom_document_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./bom/document.js */ "./node_modules/@tarojs/runtime/dist/bom/document.js");
/* harmony import */ var _bom_getComputedStyle_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./bom/getComputedStyle.js */ "./node_modules/@tarojs/runtime/dist/bom/getComputedStyle.js");
/* harmony import */ var _bom_history_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./bom/history.js */ "./node_modules/@tarojs/runtime/dist/bom/history.js");
/* harmony import */ var _bom_location_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./bom/location.js */ "./node_modules/@tarojs/runtime/dist/bom/location.js");
/* harmony import */ var _bom_navigator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./bom/navigator.js */ "./node_modules/@tarojs/runtime/dist/bom/navigator.js");
/* harmony import */ var _bom_raf_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./bom/raf.js */ "./node_modules/@tarojs/runtime/dist/bom/raf.js");
/* harmony import */ var _bom_URL_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./bom/URL.js */ "./node_modules/@tarojs/runtime/dist/bom/URL.js");
/* harmony import */ var _bom_URLSearchParams_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./bom/URLSearchParams.js */ "./node_modules/@tarojs/runtime/dist/bom/URLSearchParams.js");
/* harmony import */ var _bom_window_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./bom/window.js */ "./node_modules/@tarojs/runtime/dist/bom/window.js");
/* harmony import */ var _dom_element_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./dom/element.js */ "./node_modules/@tarojs/runtime/dist/dom/element.js");
/* harmony import */ var _dom_event_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./dom/event.js */ "./node_modules/@tarojs/runtime/dist/dom/event.js");
/* harmony import */ var _dom_form_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./dom/form.js */ "./node_modules/@tarojs/runtime/dist/dom/form.js");
/* harmony import */ var _dom_node_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./dom/node.js */ "./node_modules/@tarojs/runtime/dist/dom/node.js");
/* harmony import */ var _dom_root_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./dom/root.js */ "./node_modules/@tarojs/runtime/dist/dom/root.js");
/* harmony import */ var _dom_style_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./dom/style.js */ "./node_modules/@tarojs/runtime/dist/dom/style.js");
/* harmony import */ var _dom_svg_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./dom/svg.js */ "./node_modules/@tarojs/runtime/dist/dom/svg.js");
/* harmony import */ var _dom_text_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./dom/text.js */ "./node_modules/@tarojs/runtime/dist/dom/text.js");
/* harmony import */ var _dom_external_inner_html_html_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./dom-external/inner-html/html.js */ "./node_modules/@tarojs/runtime/dist/dom-external/inner-html/html.js");
/* harmony import */ var _dom_external_mutation_observer_index_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./dom-external/mutation-observer/index.js */ "./node_modules/@tarojs/runtime/dist/dom-external/mutation-observer/index.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");
/* harmony import */ var _current_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./current.js */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _dom_event_source_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./dom/event-source.js */ "./node_modules/@tarojs/runtime/dist/dom/event-source.js");
/* harmony import */ var _dsl_common_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./dsl/common.js */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* harmony import */ var _emitter_emitter_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./emitter/emitter.js */ "./node_modules/@tarojs/runtime/dist/emitter/emitter.js");
/* harmony import */ var _hydrate_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./hydrate.js */ "./node_modules/@tarojs/runtime/dist/hydrate.js");
/* harmony import */ var _next_tick_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./next-tick.js */ "./node_modules/@tarojs/runtime/dist/next-tick.js");
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./options.js */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _perf_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./perf.js */ "./node_modules/@tarojs/runtime/dist/perf.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./utils/index.js */ "./node_modules/@tarojs/runtime/dist/utils/index.js");
/* harmony import */ var _polyfill_index_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./polyfill/index.js */ "./node_modules/@tarojs/runtime/dist/polyfill/index.js");
/* harmony import */ var _utils_lodash_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./utils/lodash.js */ "./node_modules/@tarojs/runtime/dist/utils/lodash.js");
/* harmony import */ var _utils_router_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./utils/router.js */ "./node_modules/@tarojs/runtime/dist/utils/router.js");




































/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/next-tick.js":
/*!********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/next-tick.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nextTick: function() { return /* binding */ nextTick; }
/* harmony export */ });
/* harmony import */ var _current_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./current.js */ "./node_modules/@tarojs/runtime/dist/current.js");
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env.js */ "./node_modules/@tarojs/runtime/dist/env.js");


const TIMEOUT = 100;
const nextTick = (cb, ctx) => {
  const beginTime = Date.now();
  const router = _current_js__WEBPACK_IMPORTED_MODULE_0__.Current.router;
  const timerFunc = () => {
    setTimeout(function () {
      ctx ? cb.call(ctx) : cb();
    }, 1);
  };
  if (router === null) return timerFunc();
  const path = router.$taroPath;
  /**
   * 三种情况
   *   1. 调用 nextTick 时，pendingUpdate 已经从 true 变为 false（即已更新完成），那么需要光等 100ms
   *   2. 调用 nextTick 时，pendingUpdate 为 true，那么刚好可以搭上便车
   *   3. 调用 nextTick 时，pendingUpdate 还是 false，框架仍未启动更新逻辑，这时最多轮询 100ms，等待 pendingUpdate 变为 true。
   */
  function next() {
    var _a, _b, _c;
    const pageElement = _env_js__WEBPACK_IMPORTED_MODULE_1__["default"].document.getElementById(path);
    if (pageElement === null || pageElement === void 0 ? void 0 : pageElement.pendingUpdate) {
      if (false) {} else {
        pageElement.enqueueUpdateCallback(cb, ctx);
      }
    } else if (Date.now() - beginTime > TIMEOUT) {
      timerFunc();
    } else {
      setTimeout(() => next(), 20);
    }
  }
  next();
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/options.js":
/*!******************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/options.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   options: function() { return /* binding */ options; }
/* harmony export */ });
const options = {
  prerender: true,
  debug: false
};


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/perf.js":
/*!***************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/perf.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   perf: function() { return /* binding */ perf; }
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var _options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./options.js */ "./node_modules/@tarojs/runtime/dist/options.js");
/* harmony import */ var _utils_lodash_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/lodash.js */ "./node_modules/@tarojs/runtime/dist/utils/lodash.js");






var _Performance_instances, _Performance_parseTime;
class Performance {
  constructor() {
    _Performance_instances.add(this);
    this.recorder = new Map();
  }
  start(id) {
    if (!_options_js__WEBPACK_IMPORTED_MODULE_0__.options.debug) {
      return;
    }
    this.recorder.set(id, Date.now());
  }
  stop(id, now = Date.now()) {
    if (!_options_js__WEBPACK_IMPORTED_MODULE_0__.options.debug) {
      return;
    }
    const prev = this.recorder.get(id);
    if (!(prev >= 0)) return;
    this.recorder.delete(id);
    const time = now - prev;
    // eslint-disable-next-line no-console
    console.log(`${id} 时长： ${time}ms 开始时间：${(0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _Performance_instances, "m", _Performance_parseTime).call(this, prev)} 结束时间：${(0,tslib__WEBPACK_IMPORTED_MODULE_1__.__classPrivateFieldGet)(this, _Performance_instances, "m", _Performance_parseTime).call(this, now)}`);
  }
  delayStop(id, delay = 500) {
    if (!_options_js__WEBPACK_IMPORTED_MODULE_0__.options.debug) {
      return;
    }
    return (0,_utils_lodash_js__WEBPACK_IMPORTED_MODULE_2__.debounce)((now = Date.now(), cb) => {
      this.stop(id, now);
      cb === null || cb === void 0 ? void 0 : cb();
    }, delay);
  }
}
_Performance_instances = new WeakSet(), _Performance_parseTime = function _Performance_parseTime(time) {
  const d = new Date(time);
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${`${d.getMilliseconds()}`.padStart(3, '0')}`;
};
const perf = new Performance();


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/polyfill/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/polyfill/index.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handlePolyfill: function() { return /* binding */ handlePolyfill; }
/* harmony export */ });




function handlePolyfill() {
  if (false) {}
  if (false) {}
  if (false) {}
  if (false) {}
  if (false) {}
  // Exit early if we're not running in a browser.
  if (false) {}
}
if (false) {}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/utils/cache.js":
/*!**********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/utils/cache.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RuntimeCache: function() { return /* binding */ RuntimeCache; }
/* harmony export */ });
/**
 * 一个小型缓存池，用于在切换页面时，存储一些上下文信息
 */
class RuntimeCache {
  constructor(name) {
    this.cache = new Map();
    this.name = name;
  }
  has(identifier) {
    return this.cache.has(identifier);
  }
  set(identifier, ctx) {
    if (identifier && ctx) {
      this.cache.set(identifier, ctx);
    }
  }
  get(identifier) {
    if (this.has(identifier)) return this.cache.get(identifier);
  }
  delete(identifier) {
    this.cache.delete(identifier);
  }
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/utils/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/utils/index.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertNumber2PX: function() { return /* binding */ convertNumber2PX; },
/* harmony export */   customWrapperCache: function() { return /* binding */ customWrapperCache; },
/* harmony export */   extend: function() { return /* binding */ extend; },
/* harmony export */   getComponentsAlias: function() { return /* binding */ getComponentsAlias; },
/* harmony export */   incrementId: function() { return /* binding */ incrementId; },
/* harmony export */   isComment: function() { return /* binding */ isComment; },
/* harmony export */   isElement: function() { return /* binding */ isElement; },
/* harmony export */   isHasExtractProp: function() { return /* binding */ isHasExtractProp; },
/* harmony export */   isParentBound: function() { return /* binding */ isParentBound; },
/* harmony export */   isText: function() { return /* binding */ isText; },
/* harmony export */   shortcutAttr: function() { return /* binding */ shortcutAttr; }
/* harmony export */ });
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/utils.js");
/* harmony import */ var _tarojs_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/shared */ "./node_modules/@tarojs/shared/dist/components.js");
/* harmony import */ var _constants_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/index.js */ "./node_modules/@tarojs/runtime/dist/constants/index.js");



const incrementId = () => {
  const chatCodes = [];
  // A-Z
  for (let i = 65; i <= 90; i++) {
    chatCodes.push(i);
  }
  // a-z
  for (let i = 97; i <= 122; i++) {
    chatCodes.push(i);
  }
  const chatCodesLen = chatCodes.length - 1;
  const list = [0, 0];
  return () => {
    const target = list.map(item => chatCodes[item]);
    const res = String.fromCharCode(...target);
    let tailIdx = list.length - 1;
    list[tailIdx]++;
    while (list[tailIdx] > chatCodesLen) {
      list[tailIdx] = 0;
      tailIdx = tailIdx - 1;
      if (tailIdx < 0) {
        list.push(0);
        break;
      }
      list[tailIdx]++;
    }
    return res;
  };
};
function isElement(node) {
  return node.nodeType === 1 /* NodeType.ELEMENT_NODE */;
}
function isText(node) {
  return node.nodeType === 3 /* NodeType.TEXT_NODE */;
}
function isComment(node) {
  return node.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.COMMENT;
}
function isHasExtractProp(el) {
  const res = Object.keys(el.props).find(prop => {
    return !(/^(class|style|id)$/.test(prop) || prop.startsWith('data-'));
  });
  return Boolean(res);
}
/**
 * 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
 * @param node 当前组件
 * @param type 事件类型
 */
function isParentBound(node, type) {
  var _a;
  while (node = (node === null || node === void 0 ? void 0 : node.parentElement) || null) {
    if (!node || node.nodeName === _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.ROOT_STR || node.nodeName === 'root-portal') {
      return false;
    } else if ((_a = node.__handlers[type]) === null || _a === void 0 ? void 0 : _a.length) {
      return true;
    }
  }
  return false;
}
function shortcutAttr(key) {
  switch (key) {
    case _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.STYLE:
      return "st" /* Shortcuts.Style */;
    case _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.ID:
      return _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.UID;
    case _constants_index_js__WEBPACK_IMPORTED_MODULE_0__.CLASS:
      return "cl" /* Shortcuts.Class */;
    default:
      return key;
  }
}
const customWrapperCache = new Map();
function extend(ctor, methodName, options) {
  if ((0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(options)) {
    options = {
      value: options
    };
  }
  Object.defineProperty(ctor.prototype, methodName, Object.assign({
    configurable: true,
    enumerable: true
  }, options));
}
let componentsAlias;
function getComponentsAlias() {
  if (!componentsAlias) {
    componentsAlias = (0,_tarojs_shared__WEBPACK_IMPORTED_MODULE_2__.getComponentsAlias)(_tarojs_shared__WEBPACK_IMPORTED_MODULE_3__.internalComponents);
  }
  return componentsAlias;
}
function convertNumber2PX(value) {
  return value + 'px';
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/utils/lodash.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/utils/lodash.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: function() { return /* binding */ debounce; },
/* harmony export */   throttle: function() { return /* binding */ throttle; }
/* harmony export */ });
function throttle(fn, threshold = 250, scope) {
  let lastTime = 0;
  let deferTimer;
  return function (...args) {
    const context = scope || this;
    const now = Date.now();
    if (now - lastTime > threshold) {
      fn.apply(this, args);
      lastTime = now;
    } else {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        lastTime = now;
        fn.apply(context, args);
      }, threshold);
    }
  };
}
function debounce(fn, ms = 250, scope) {
  let timer;
  return function (...args) {
    const context = scope || this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, ms);
  };
}


/***/ }),

/***/ "./node_modules/@tarojs/runtime/dist/utils/router.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/runtime/dist/utils/router.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addLeadingSlash: function() { return /* binding */ addLeadingSlash; },
/* harmony export */   getCurrentPage: function() { return /* binding */ getCurrentPage; },
/* harmony export */   getHomePage: function() { return /* binding */ getHomePage; },
/* harmony export */   hasBasename: function() { return /* binding */ hasBasename; },
/* harmony export */   stripBasename: function() { return /* binding */ stripBasename; },
/* harmony export */   stripSuffix: function() { return /* binding */ stripSuffix; },
/* harmony export */   stripTrailing: function() { return /* binding */ stripTrailing; }
/* harmony export */ });
/* harmony import */ var _bom_window_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bom/window.js */ "./node_modules/@tarojs/runtime/dist/bom/window.js");


// export const removeLeadingSlash = (str = '') => str.replace(/^\.?\//, '')
// export const removeTrailingSearch = (str = '') => str.replace(/\?[\s\S]*$/, '')
const addLeadingSlash = (url = '') => url.charAt(0) === '/' ? url : '/' + url;
const hasBasename = (path = '', prefix = '') => new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path) || path === prefix;
const stripBasename = (path = '', prefix = '') => hasBasename(path, prefix) ? path.substring(prefix.length) : path;
const stripTrailing = (str = '') => str.replace(/[?#][\s\S]*$/, '');
const stripSuffix = (path = '', suffix = '') => path.includes(suffix) ? path.substring(0, path.length - suffix.length) : path;
const getHomePage = (path = '', basename = '', customRoutes = {}, entryPagePath = '') => {
  var _a;
  const routePath = addLeadingSlash(stripBasename(path, basename));
  const alias = ((_a = Object.entries(customRoutes).find(([key]) => key === routePath)) === null || _a === void 0 ? void 0 : _a[1]) || routePath;
  return entryPagePath || (typeof alias === 'string' ? alias : alias[0]) || basename;
};
const getCurrentPage = (routerMode = 'hash', basename = '/') => {
  const pagePath = routerMode === 'hash' ? _bom_window_js__WEBPACK_IMPORTED_MODULE_0__.taroLocationProvider.hash.slice(1).split('?')[0] : _bom_window_js__WEBPACK_IMPORTED_MODULE_0__.taroLocationProvider.pathname;
  return addLeadingSlash(stripBasename(pagePath, basename));
};


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/components.js":
/*!********************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/components.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   controlledComponent: function() { return /* binding */ controlledComponent; },
/* harmony export */   internalComponents: function() { return /* binding */ internalComponents; }
/* harmony export */ });
/* unused harmony exports animation, focusComponents, nestElements, singleQuote, touchEvents, voidElements */
const DEFAULT_EMPTY_ARRAY = '[]';
const NO_DEFAULT_VALUE = '';
const DEFAULT_TRUE = '!0';
const DEFAULT_FALSE = '!1';
const touchEvents = {
  bindTouchStart: NO_DEFAULT_VALUE,
  bindTouchMove: NO_DEFAULT_VALUE,
  bindTouchEnd: NO_DEFAULT_VALUE,
  bindTouchCancel: NO_DEFAULT_VALUE,
  bindLongTap: NO_DEFAULT_VALUE
};
const animation = {
  animation: NO_DEFAULT_VALUE,
  bindAnimationStart: NO_DEFAULT_VALUE,
  bindAnimationIteration: NO_DEFAULT_VALUE,
  bindAnimationEnd: NO_DEFAULT_VALUE,
  bindTransitionEnd: NO_DEFAULT_VALUE
};
function singleQuote(s) {
  return `'${s}'`;
}
const View = Object.assign(Object.assign({
  'hover-class': singleQuote('none'),
  'hover-stop-propagation': DEFAULT_FALSE,
  'hover-start-time': '50',
  'hover-stay-time': '400'
}, touchEvents), animation);
const Icon = {
  type: NO_DEFAULT_VALUE,
  size: '23',
  color: NO_DEFAULT_VALUE
};
const MapComp = Object.assign({
  longitude: NO_DEFAULT_VALUE,
  latitude: NO_DEFAULT_VALUE,
  scale: '16',
  markers: DEFAULT_EMPTY_ARRAY,
  covers: NO_DEFAULT_VALUE,
  polyline: DEFAULT_EMPTY_ARRAY,
  circles: DEFAULT_EMPTY_ARRAY,
  controls: DEFAULT_EMPTY_ARRAY,
  'include-points': DEFAULT_EMPTY_ARRAY,
  'show-location': NO_DEFAULT_VALUE,
  'layer-style': '1',
  bindMarkerTap: NO_DEFAULT_VALUE,
  bindControlTap: NO_DEFAULT_VALUE,
  bindCalloutTap: NO_DEFAULT_VALUE,
  bindUpdated: NO_DEFAULT_VALUE
}, touchEvents);
const Progress = {
  percent: NO_DEFAULT_VALUE,
  'stroke-width': '6',
  color: singleQuote('#09BB07'),
  activeColor: singleQuote('#09BB07'),
  backgroundColor: singleQuote('#EBEBEB'),
  active: DEFAULT_FALSE,
  'active-mode': singleQuote('backwards'),
  'show-info': DEFAULT_FALSE
};
const RichText = {
  nodes: DEFAULT_EMPTY_ARRAY
};
const Text = Object.assign({
  selectable: DEFAULT_FALSE,
  space: NO_DEFAULT_VALUE,
  decode: DEFAULT_FALSE
}, touchEvents);
const Button = Object.assign({
  size: singleQuote('default'),
  type: NO_DEFAULT_VALUE,
  plain: DEFAULT_FALSE,
  disabled: NO_DEFAULT_VALUE,
  loading: DEFAULT_FALSE,
  'form-type': NO_DEFAULT_VALUE,
  'open-type': NO_DEFAULT_VALUE,
  'hover-class': singleQuote('button-hover'),
  'hover-stop-propagation': DEFAULT_FALSE,
  'hover-start-time': '20',
  'hover-stay-time': '70',
  name: NO_DEFAULT_VALUE,
  bindagreeprivacyauthorization: NO_DEFAULT_VALUE
}, touchEvents);
const Checkbox = {
  value: NO_DEFAULT_VALUE,
  disabled: NO_DEFAULT_VALUE,
  checked: DEFAULT_FALSE,
  color: singleQuote('#09BB07'),
  name: NO_DEFAULT_VALUE
};
const CheckboxGroup = {
  bindChange: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Form = {
  'report-submit': DEFAULT_FALSE,
  bindSubmit: NO_DEFAULT_VALUE,
  bindReset: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Input = {
  value: NO_DEFAULT_VALUE,
  type: singleQuote(NO_DEFAULT_VALUE),
  password: DEFAULT_FALSE,
  placeholder: NO_DEFAULT_VALUE,
  'placeholder-style': NO_DEFAULT_VALUE,
  'placeholder-class': singleQuote('input-placeholder'),
  disabled: NO_DEFAULT_VALUE,
  maxlength: '140',
  'cursor-spacing': '0',
  focus: DEFAULT_FALSE,
  'confirm-type': singleQuote('done'),
  'confirm-hold': DEFAULT_FALSE,
  cursor: '-1',
  'selection-start': '-1',
  'selection-end': '-1',
  bindInput: NO_DEFAULT_VALUE,
  bindFocus: NO_DEFAULT_VALUE,
  bindBlur: NO_DEFAULT_VALUE,
  bindConfirm: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Label = Object.assign({
  for: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
}, touchEvents);
const Picker = {
  mode: singleQuote('selector'),
  disabled: NO_DEFAULT_VALUE,
  range: NO_DEFAULT_VALUE,
  'range-key': NO_DEFAULT_VALUE,
  value: NO_DEFAULT_VALUE,
  start: NO_DEFAULT_VALUE,
  end: NO_DEFAULT_VALUE,
  fields: singleQuote('day'),
  'custom-item': NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE,
  bindCancel: NO_DEFAULT_VALUE,
  bindChange: NO_DEFAULT_VALUE,
  bindColumnChange: NO_DEFAULT_VALUE
};
const PickerView = {
  value: NO_DEFAULT_VALUE,
  'indicator-style': NO_DEFAULT_VALUE,
  'indicator-class': NO_DEFAULT_VALUE,
  'mask-style': NO_DEFAULT_VALUE,
  'mask-class': NO_DEFAULT_VALUE,
  bindChange: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const PickerViewColumn = {
  name: NO_DEFAULT_VALUE
};
const Radio = {
  value: NO_DEFAULT_VALUE,
  checked: DEFAULT_FALSE,
  disabled: NO_DEFAULT_VALUE,
  color: singleQuote('#09BB07'),
  name: NO_DEFAULT_VALUE
};
const RadioGroup = {
  bindChange: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Slider = {
  min: '0',
  max: '100',
  step: '1',
  disabled: NO_DEFAULT_VALUE,
  value: '0',
  activeColor: singleQuote('#1aad19'),
  backgroundColor: singleQuote('#e9e9e9'),
  'block-size': '28',
  'block-color': singleQuote('#ffffff'),
  'show-value': DEFAULT_FALSE,
  bindChange: NO_DEFAULT_VALUE,
  bindChanging: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Switch = {
  checked: DEFAULT_FALSE,
  disabled: NO_DEFAULT_VALUE,
  type: singleQuote('switch'),
  color: singleQuote('#04BE02'),
  bindChange: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const Textarea = {
  value: NO_DEFAULT_VALUE,
  placeholder: NO_DEFAULT_VALUE,
  'placeholder-style': NO_DEFAULT_VALUE,
  'placeholder-class': singleQuote('textarea-placeholder'),
  disabled: NO_DEFAULT_VALUE,
  maxlength: '140',
  'auto-focus': DEFAULT_FALSE,
  focus: DEFAULT_FALSE,
  'auto-height': DEFAULT_FALSE,
  fixed: DEFAULT_FALSE,
  'cursor-spacing': '0',
  cursor: '-1',
  'selection-start': '-1',
  'selection-end': '-1',
  bindFocus: NO_DEFAULT_VALUE,
  bindBlur: NO_DEFAULT_VALUE,
  bindLineChange: NO_DEFAULT_VALUE,
  bindInput: NO_DEFAULT_VALUE,
  bindConfirm: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE
};
const CoverImage = {
  src: NO_DEFAULT_VALUE,
  bindLoad: 'eh',
  bindError: 'eh'
};
const CoverView = Object.assign({
  'scroll-top': DEFAULT_FALSE
}, touchEvents);
const MovableArea = {
  'scale-area': DEFAULT_FALSE
};
const MovableView = Object.assign(Object.assign({
  direction: 'none',
  inertia: DEFAULT_FALSE,
  'out-of-bounds': DEFAULT_FALSE,
  x: NO_DEFAULT_VALUE,
  y: NO_DEFAULT_VALUE,
  damping: '20',
  friction: '2',
  disabled: NO_DEFAULT_VALUE,
  scale: DEFAULT_FALSE,
  'scale-min': '0.5',
  'scale-max': '10',
  'scale-value': '1',
  bindChange: NO_DEFAULT_VALUE,
  bindScale: NO_DEFAULT_VALUE,
  bindHTouchMove: NO_DEFAULT_VALUE,
  bindVTouchMove: NO_DEFAULT_VALUE,
  width: singleQuote('10px'),
  height: singleQuote('10px')
}, touchEvents), animation);
const ScrollView = Object.assign(Object.assign({
  'scroll-x': DEFAULT_FALSE,
  'scroll-y': DEFAULT_FALSE,
  'upper-threshold': '50',
  'lower-threshold': '50',
  'scroll-top': NO_DEFAULT_VALUE,
  'scroll-left': NO_DEFAULT_VALUE,
  'scroll-into-view': NO_DEFAULT_VALUE,
  'scroll-with-animation': DEFAULT_FALSE,
  'enable-back-to-top': DEFAULT_FALSE,
  bindScrollToUpper: NO_DEFAULT_VALUE,
  bindScrollToLower: NO_DEFAULT_VALUE,
  bindScroll: NO_DEFAULT_VALUE
}, touchEvents), animation);
const Swiper = Object.assign({
  'indicator-dots': DEFAULT_FALSE,
  'indicator-color': singleQuote('rgba(0, 0, 0, .3)'),
  'indicator-active-color': singleQuote('#000000'),
  autoplay: DEFAULT_FALSE,
  current: '0',
  interval: '5000',
  duration: '500',
  circular: DEFAULT_FALSE,
  vertical: DEFAULT_FALSE,
  'previous-margin': singleQuote('0px'),
  'next-margin': singleQuote('0px'),
  'display-multiple-items': '1',
  bindChange: NO_DEFAULT_VALUE,
  bindTransition: NO_DEFAULT_VALUE,
  bindAnimationFinish: NO_DEFAULT_VALUE
}, touchEvents);
const SwiperItem = {
  'item-id': NO_DEFAULT_VALUE
};
const Navigator = {
  url: NO_DEFAULT_VALUE,
  'open-type': singleQuote('navigate'),
  delta: '1',
  'hover-class': singleQuote('navigator-hover'),
  'hover-stop-propagation': DEFAULT_FALSE,
  'hover-start-time': '50',
  'hover-stay-time': '600',
  bindSuccess: NO_DEFAULT_VALUE,
  bindFail: NO_DEFAULT_VALUE,
  bindComplete: NO_DEFAULT_VALUE
};
const Audio = {
  id: NO_DEFAULT_VALUE,
  src: NO_DEFAULT_VALUE,
  loop: DEFAULT_FALSE,
  controls: DEFAULT_FALSE,
  poster: NO_DEFAULT_VALUE,
  name: NO_DEFAULT_VALUE,
  author: NO_DEFAULT_VALUE,
  bindError: NO_DEFAULT_VALUE,
  bindPlay: NO_DEFAULT_VALUE,
  bindPause: NO_DEFAULT_VALUE,
  bindTimeUpdate: NO_DEFAULT_VALUE,
  bindEnded: NO_DEFAULT_VALUE
};
const Camera = {
  'device-position': singleQuote('back'),
  flash: singleQuote('auto'),
  bindStop: NO_DEFAULT_VALUE,
  bindError: NO_DEFAULT_VALUE
};
const Image = Object.assign({
  src: NO_DEFAULT_VALUE,
  mode: singleQuote('scaleToFill'),
  'lazy-load': DEFAULT_FALSE,
  bindError: NO_DEFAULT_VALUE,
  bindLoad: NO_DEFAULT_VALUE
}, touchEvents);
const LivePlayer = Object.assign({
  src: NO_DEFAULT_VALUE,
  autoplay: DEFAULT_FALSE,
  muted: DEFAULT_FALSE,
  orientation: singleQuote('vertical'),
  'object-fit': singleQuote('contain'),
  'background-mute': DEFAULT_FALSE,
  'min-cache': '1',
  'max-cache': '3',
  bindStateChange: NO_DEFAULT_VALUE,
  bindFullScreenChange: NO_DEFAULT_VALUE,
  bindNetStatus: NO_DEFAULT_VALUE
}, animation);
const Video = Object.assign({
  src: NO_DEFAULT_VALUE,
  duration: NO_DEFAULT_VALUE,
  controls: DEFAULT_TRUE,
  'danmu-list': NO_DEFAULT_VALUE,
  'danmu-btn': NO_DEFAULT_VALUE,
  'enable-danmu': NO_DEFAULT_VALUE,
  autoplay: DEFAULT_FALSE,
  loop: DEFAULT_FALSE,
  muted: DEFAULT_FALSE,
  'initial-time': '0',
  'page-gesture': DEFAULT_FALSE,
  direction: NO_DEFAULT_VALUE,
  'show-progress': DEFAULT_TRUE,
  'show-fullscreen-btn': DEFAULT_TRUE,
  'show-play-btn': DEFAULT_TRUE,
  'show-center-play-btn': DEFAULT_TRUE,
  'enable-progress-gesture': DEFAULT_TRUE,
  'object-fit': singleQuote('contain'),
  poster: NO_DEFAULT_VALUE,
  'show-mute-btn': DEFAULT_FALSE,
  bindPlay: NO_DEFAULT_VALUE,
  bindPause: NO_DEFAULT_VALUE,
  bindEnded: NO_DEFAULT_VALUE,
  bindTimeUpdate: NO_DEFAULT_VALUE,
  bindFullScreenChange: NO_DEFAULT_VALUE,
  bindWaiting: NO_DEFAULT_VALUE,
  bindError: NO_DEFAULT_VALUE
}, animation);
const Canvas = Object.assign({
  'canvas-id': NO_DEFAULT_VALUE,
  'disable-scroll': DEFAULT_FALSE,
  bindError: NO_DEFAULT_VALUE
}, touchEvents);
const Ad = {
  'unit-id': NO_DEFAULT_VALUE,
  'ad-intervals': NO_DEFAULT_VALUE,
  bindLoad: NO_DEFAULT_VALUE,
  bindError: NO_DEFAULT_VALUE,
  bindClose: NO_DEFAULT_VALUE
};
const WebView = {
  src: NO_DEFAULT_VALUE,
  bindMessage: NO_DEFAULT_VALUE,
  bindLoad: NO_DEFAULT_VALUE,
  bindError: NO_DEFAULT_VALUE
};
const Block = {};
// For Vue，因为 slot 标签被 vue 占用了
const SlotView = {
  name: NO_DEFAULT_VALUE
};
// For React
// Slot 和 SlotView 最终都会编译成 <view slot={{ i.name }} />
// 因为 <slot name="{{ i.name }}" /> 适用性没有前者高（无法添加类和样式）
// 不给 View 直接加 slot 属性的原因是性能损耗
const Slot = {
  name: NO_DEFAULT_VALUE
};
const NativeSlot = {
  name: NO_DEFAULT_VALUE
};
const Script = {};
const internalComponents = {
  View,
  Icon,
  Progress,
  RichText,
  Text,
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  Input,
  Label,
  Picker,
  PickerView,
  PickerViewColumn,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  CoverImage,
  Textarea,
  CoverView,
  MovableArea,
  MovableView,
  ScrollView,
  Swiper,
  SwiperItem,
  Navigator,
  Audio,
  Camera,
  Image,
  LivePlayer,
  Video,
  Canvas,
  Ad,
  WebView,
  Block,
  Map: MapComp,
  Slot,
  SlotView,
  NativeSlot,
  Script
};
const controlledComponent = new Set(['input', 'checkbox', 'picker', 'picker-view', 'radio', 'slider', 'switch', 'textarea']);
const focusComponents = new Set(['input', 'textarea']);
const voidElements = new Set(['progress', 'icon', 'rich-text', 'input', 'textarea', 'slider', 'switch', 'audio', 'ad', 'official-account', 'open-data', 'navigation-bar']);
const nestElements = new Map([['view', -1], ['catch-view', -1], ['cover-view', -1], ['static-view', -1], ['pure-view', -1], ['click-view', -1], ['block', -1], ['text', -1], ['static-text', 6], ['slot', 8], ['slot-view', 8], ['label', 6], ['form', 4], ['scroll-view', 4], ['swiper', 4], ['swiper-item', 4]]);


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/constants.js":
/*!*******************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/constants.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_COMPONENTS: function() { return /* binding */ DEFAULT_COMPONENTS; },
/* harmony export */   PLATFORM_CONFIG_MAP: function() { return /* binding */ PLATFORM_CONFIG_MAP; },
/* harmony export */   PLATFORM_TYPE: function() { return /* binding */ PLATFORM_TYPE; },
/* harmony export */   TT_SPECIFIC_COMPONENTS: function() { return /* binding */ TT_SPECIFIC_COMPONENTS; },
/* harmony export */   UNITLESS_PROPERTIES_SET: function() { return /* binding */ UNITLESS_PROPERTIES_SET; }
/* harmony export */ });
/* unused harmony exports COMPILE_MODE_IDENTIFIER_PREFIX, COMPILE_MODE_SUB_RENDER_FN */
var PLATFORM_TYPE;
(function (PLATFORM_TYPE) {
  PLATFORM_TYPE["MINI"] = "mini";
  PLATFORM_TYPE["ASCF"] = "ascf";
  PLATFORM_TYPE["WEB"] = "web";
  PLATFORM_TYPE["RN"] = "rn";
  PLATFORM_TYPE["HARMONY"] = "harmony";
  PLATFORM_TYPE["QUICK"] = "quickapp";
})(PLATFORM_TYPE || (PLATFORM_TYPE = {}));
const COMPILE_MODE_IDENTIFIER_PREFIX = 'f';
const COMPILE_MODE_SUB_RENDER_FN = 'subRenderFn';
const PLATFORM_CONFIG_MAP = {
  h5: {
    type: PLATFORM_TYPE.WEB
  },
  harmony: {
    type: PLATFORM_TYPE.HARMONY
  },
  ascf: {
    type: PLATFORM_TYPE.ASCF
  },
  mini: {
    type: PLATFORM_TYPE.MINI
  },
  rn: {
    type: PLATFORM_TYPE.RN
  },
  quickapp: {
    type: PLATFORM_TYPE.QUICK
  }
};
const TT_SPECIFIC_COMPONENTS = new Set(['page-container', 'slot', 'custom-wrapper', 'clue-order-form', 'aweme-group', 'pay-button', 'address-area', 'consume-card', 'aweme-data', 'rate-button', 'store-area', 'inline-payment-panel', 'aweme-user-card', 'aweme-live-book', 'draw-ad', 'lynx-view', 'flow-ad', 'ai-agent-chat', 'component']);
const DEFAULT_COMPONENTS = new Set(['view', 'scroll-view', 'swiper', 'cover-view', 'cover-image', 'icon', 'text', 'rich-text', 'progress', 'button', 'checkbox', 'form', 'input', 'label', 'picker', 'picker-view', 'picker-view-column', 'radio', 'radio-group', 'checkbox-group', 'slider', 'switch', 'textarea', 'navigator', 'audio', 'image', 'video', 'camera', 'live-player', 'live-pusher', 'map', 'canvas', 'open-data', 'web-view', 'swiper-item', 'movable-area', 'movable-view', 'functional-page-navigator', 'ad', 'block', 'import', 'official-account', 'editor']);
const UNITLESS_PROPERTIES_SET = new Set(['animation-iteration-count', 'border-image-outset', 'border-image-slice', 'border-image-width', 'box-flex', 'box-flex-group', 'box-ordinal-group', 'column-count', 'columns', 'flex', 'flex-grow', 'flex-positive', 'flex-shrink', 'flex-negative', 'flex-order', 'grid-area', 'grid-row', 'grid-row-end', 'grid-row-span', 'grid-row-start', 'grid-column', 'grid-column-end', 'grid-column-span', 'grid-column-start', 'font-weight', 'line-clamp', 'line-height', 'opacity', 'order', 'orphans', 'tab-size', 'widows', 'z-index', 'zoom',
// SVG-related properties
'fill-opacity', 'flood-opacity', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width']);


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/event-emitter.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/event-emitter.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Events: function() { return /* binding */ Events; }
/* harmony export */ });
class Events {
  constructor(opts) {
    var _a;
    this.callbacks = (_a = opts === null || opts === void 0 ? void 0 : opts.callbacks) !== null && _a !== void 0 ? _a : {};
  }
  on(eventName, callback, context) {
    let event, tail, _eventName;
    if (!callback) {
      return this;
    }
    if (typeof eventName === 'symbol') {
      _eventName = [eventName];
    } else {
      _eventName = eventName.split(Events.eventSplitter);
    }
    this.callbacks || (this.callbacks = {});
    const calls = this.callbacks;
    while (event = _eventName.shift()) {
      const list = calls[event];
      const node = list ? list.tail : {};
      node.next = tail = {};
      node.context = context;
      node.callback = callback;
      calls[event] = {
        tail,
        next: list ? list.next : node
      };
    }
    return this;
  }
  once(events, callback, context) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(events, wrapper, context);
    };
    this.on(events, wrapper, context);
    return this;
  }
  off(events, callback, context) {
    let event, calls, _events;
    if (!(calls = this.callbacks)) {
      return this;
    }
    if (!(events || callback || context)) {
      delete this.callbacks;
      return this;
    }
    if (typeof events === 'symbol') {
      _events = [events];
    } else {
      _events = events ? events.split(Events.eventSplitter) : Object.keys(calls);
    }
    while (event = _events.shift()) {
      let node = calls[event];
      delete calls[event];
      if (!node || !(callback || context)) {
        continue;
      }
      const tail = node.tail;
      while ((node = node.next) !== tail) {
        const cb = node.callback;
        const ctx = node.context;
        if (callback && cb !== callback || context && ctx !== context) {
          this.on(event, cb, ctx);
        }
      }
    }
    return this;
  }
  trigger(events, ...args) {
    let event, node, calls, _events;
    if (!(calls = this.callbacks)) {
      return this;
    }
    if (typeof events === 'symbol') {
      _events = [events];
    } else {
      _events = events.split(Events.eventSplitter);
    }
    while (event = _events.shift()) {
      if (node = calls[event]) {
        const tail = node.tail;
        while ((node = node.next) !== tail) {
          node.callback.apply(node.context || this, args);
        }
      }
    }
    return this;
  }
}
Events.eventSplitter = ','; // Note: Harmony ACE API 8 开发板不支持使用正则 split 字符串 /\s+/



/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/is.js":
/*!************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/is.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isArray: function() { return /* binding */ isArray; },
/* harmony export */   isBoolean: function() { return /* binding */ isBoolean; },
/* harmony export */   isFunction: function() { return /* binding */ isFunction; },
/* harmony export */   isNull: function() { return /* binding */ isNull; },
/* harmony export */   isNumber: function() { return /* binding */ isNumber; },
/* harmony export */   isObject: function() { return /* binding */ isObject; },
/* harmony export */   isString: function() { return /* binding */ isString; },
/* harmony export */   isUndefined: function() { return /* binding */ isUndefined; }
/* harmony export */ });
/* unused harmony exports isBooleanStringLiteral, isObjectStringLiteral, isWebPlatform */
function isString(o) {
  return typeof o === 'string';
}
function isUndefined(o) {
  return typeof o === 'undefined';
}
function isNull(o) {
  return o === null;
}
function isObject(o) {
  return o !== null && typeof o === 'object';
}
function isBoolean(o) {
  return o === true || o === false;
}
function isFunction(o) {
  return typeof o === 'function';
}
function isNumber(o) {
  if (Number.isFinite) return Number.isFinite(o);
  return typeof o === 'number';
}
function isBooleanStringLiteral(o) {
  return o === 'true' || o === 'false' || o === '!0' || o === '!1';
}
function isObjectStringLiteral(o) {
  return o === '{}';
}
const isArray = Array.isArray;
const isWebPlatform = () =>  false || "mini" === 'web';


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/native-apis.js":
/*!*********************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/native-apis.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   processApis: function() { return /* binding */ processApis; }
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@tarojs/shared/dist/is.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@tarojs/shared/dist/utils.js");


const needPromiseApis = new Set(['addPhoneContact', 'authorize', 'canvasGetImageData', 'canvasPutImageData', 'canvasToTempFilePath', 'checkSession', 'chooseAddress', 'chooseImage', 'chooseInvoiceTitle', 'chooseLocation', 'chooseVideo', 'clearStorage', 'closeBLEConnection', 'closeBluetoothAdapter', 'closeSocket', 'compressImage', 'connectSocket', 'createBLEConnection', 'downloadFile', 'exitMiniProgram', 'getAvailableAudioSources', 'getBLEDeviceCharacteristics', 'getBLEDeviceServices', 'getBatteryInfo', 'getBeacons', 'getBluetoothAdapterState', 'getBluetoothDevices', 'getClipboardData', 'getConnectedBluetoothDevices', 'getConnectedWifi', 'getExtConfig', 'getFileInfo', 'getImageInfo', 'getLocation', 'getNetworkType', 'getSavedFileInfo', 'getSavedFileList', 'getScreenBrightness', 'getSetting', 'getStorage', 'getStorageInfo', 'getSystemInfo', 'getUserInfo', 'getWifiList', 'hideHomeButton', 'hideShareMenu', 'hideTabBar', 'hideTabBarRedDot', 'loadFontFace', 'login', 'makePhoneCall', 'navigateBack', 'navigateBackMiniProgram', 'navigateTo', 'navigateToBookshelf', 'navigateToMiniProgram', 'notifyBLECharacteristicValueChange', 'hideKeyboard', 'hideLoading', 'hideNavigationBarLoading', 'hideToast', 'openBluetoothAdapter', 'openDocument', 'openLocation', 'openSetting', 'pageScrollTo', 'previewImage', 'queryBookshelf', 'reLaunch', 'readBLECharacteristicValue', 'redirectTo', 'removeSavedFile', 'removeStorage', 'removeTabBarBadge', 'requestSubscribeMessage', 'saveFile', 'saveImageToPhotosAlbum', 'saveVideoToPhotosAlbum', 'scanCode', 'sendSocketMessage', 'setBackgroundColor', 'setBackgroundTextStyle', 'setClipboardData', 'setEnableDebug', 'setInnerAudioOption', 'setKeepScreenOn', 'setNavigationBarColor', 'setNavigationBarTitle', 'setScreenBrightness', 'setStorage', 'setTabBarBadge', 'setTabBarItem', 'setTabBarStyle', 'showActionSheet', 'showFavoriteGuide', 'showLoading', 'showModal', 'showShareMenu', 'showTabBar', 'showTabBarRedDot', 'showToast', 'startBeaconDiscovery', 'startBluetoothDevicesDiscovery', 'startDeviceMotionListening', 'startPullDownRefresh', 'stopBeaconDiscovery', 'stopBluetoothDevicesDiscovery', 'stopCompass', 'startCompass', 'startAccelerometer', 'stopAccelerometer', 'showNavigationBarLoading', 'stopDeviceMotionListening', 'stopPullDownRefresh', 'switchTab', 'uploadFile', 'vibrateLong', 'vibrateShort', 'writeBLECharacteristicValue']);
function getCanIUseWebp(taro) {
  return function () {
    var _a;
    const res = (_a = taro.getSystemInfoSync) === null || _a === void 0 ? void 0 : _a.call(taro);
    if (!res) {
      if (true) {
        console.error('不支持 API canIUseWebp');
      }
      return false;
    }
    const {
      platform
    } = res;
    const platformLower = platform.toLowerCase();
    if (platformLower === 'android' || platformLower === 'devtools') {
      return true;
    }
    return false;
  };
}
function getNormalRequest(global) {
  return function request(options) {
    options = options ? (0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(options) ? {
      url: options
    } : options : {};
    const originSuccess = options.success;
    const originFail = options.fail;
    const originComplete = options.complete;
    let requestTask;
    const p = new Promise((resolve, reject) => {
      options.success = res => {
        originSuccess && originSuccess(res);
        resolve(res);
      };
      options.fail = res => {
        originFail && originFail(res);
        reject(res);
      };
      options.complete = res => {
        originComplete && originComplete(res);
      };
      requestTask = global.request(options);
    });
    equipTaskMethodsIntoPromise(requestTask, p);
    p.abort = cb => {
      cb && cb();
      if (requestTask) {
        requestTask.abort();
      }
      return p;
    };
    return p;
  };
}
function processApis(taro, global, config = {}) {
  const patchNeedPromiseApis = config.needPromiseApis || [];
  const _needPromiseApis = new Set([...patchNeedPromiseApis, ...needPromiseApis]);
  const preserved = ['getEnv', 'interceptors', 'Current', 'getCurrentInstance', 'options', 'nextTick', 'eventCenter', 'Events', 'preload', 'webpackJsonp'];
  const apis = new Set(!config.isOnlyPromisify ? Object.keys(global).filter(api => preserved.indexOf(api) === -1) : patchNeedPromiseApis);
  if (config.modifyApis) {
    config.modifyApis(apis);
  }
  apis.forEach(key => {
    if (_needPromiseApis.has(key)) {
      const originKey = key;
      taro[originKey] = (options = {}, ...args) => {
        let key = originKey;
        // 第一个参数 options 为字符串，单独处理
        if (typeof options === 'string') {
          if (args.length) {
            return global[key](options, ...args);
          }
          return global[key](options);
        }
        // 改变 key 或 option 字段，如需要把支付宝标准的字段对齐微信标准的字段
        if (config.transformMeta) {
          const transformResult = config.transformMeta(key, options);
          key = transformResult.key;
          options = transformResult.options;
          // 新 key 可能不存在
          if (!global.hasOwnProperty(key)) {
            return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)(key)();
          }
        }
        let task = null;
        const obj = Object.assign({}, options);
        // 为页面跳转相关的 API 设置一个随机数作为路由参数。为了给 runtime 区分页面。
        (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.setUniqueKeyToRoute)(key, options);
        // Promise 化
        const p = new Promise((resolve, reject) => {
          obj.success = res => {
            var _a, _b;
            (_a = config.modifyAsyncResult) === null || _a === void 0 ? void 0 : _a.call(config, key, res);
            (_b = options.success) === null || _b === void 0 ? void 0 : _b.call(options, res);
            if (key === 'connectSocket') {
              resolve(Promise.resolve().then(() => task ? Object.assign(task, res) : res));
            } else {
              resolve(res);
            }
          };
          obj.fail = res => {
            var _a;
            (_a = options.fail) === null || _a === void 0 ? void 0 : _a.call(options, res);
            reject(res);
          };
          obj.complete = res => {
            var _a;
            (_a = options.complete) === null || _a === void 0 ? void 0 : _a.call(options, res);
          };
          if (args.length) {
            task = global[key](obj, ...args);
          } else {
            task = global[key](obj);
          }
        });
        // 给 promise 对象挂载属性
        if (['uploadFile', 'downloadFile'].includes(key)) {
          equipTaskMethodsIntoPromise(task, p);
          p.progress = cb => {
            task === null || task === void 0 ? void 0 : task.onProgressUpdate(cb);
            return p;
          };
          p.abort = cb => {
            cb === null || cb === void 0 ? void 0 : cb();
            task === null || task === void 0 ? void 0 : task.abort();
            return p;
          };
        }
        return p;
      };
    } else {
      let platformKey = key;
      // 改变 key 或 option 字段，如需要把支付宝标准的字段对齐微信标准的字段
      if (config.transformMeta) {
        platformKey = config.transformMeta(key, {}).key;
      }
      // API 不存在
      if (!global.hasOwnProperty(platformKey)) {
        taro[key] = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)(key);
        return;
      }
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(global[key])) {
        taro[key] = (...args) => {
          if (config.handleSyncApis) {
            return config.handleSyncApis(key, global, args);
          } else {
            return global[platformKey].apply(global, args);
          }
        };
      } else {
        taro[key] = global[platformKey];
      }
    }
  });
  !config.isOnlyPromisify && equipCommonApis(taro, global, config);
}
/**
 * 挂载常用 API
 * @param taro Taro 对象
 * @param global 小程序全局对象，如微信的 wx，支付宝的 my
 */
function equipCommonApis(taro, global, apis = {}) {
  taro.canIUseWebp = getCanIUseWebp(taro);
  taro.getCurrentPages = getCurrentPages || (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)('getCurrentPages');
  taro.getApp = getApp || (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)('getApp');
  taro.env = global.env || {};
  try {
    taro.requirePlugin = requirePlugin || (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)('requirePlugin');
  } catch (error) {
    taro.requirePlugin = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.nonsupport)('requirePlugin');
  }
  // request & interceptors
  const request = apis.request || getNormalRequest(global);
  function taroInterceptor(chain) {
    return request(chain.requestParams);
  }
  const link = new taro.Link(taroInterceptor);
  taro.request = link.request.bind(link);
  taro.addInterceptor = link.addInterceptor.bind(link);
  taro.cleanInterceptors = link.cleanInterceptors.bind(link);
  taro.miniGlobal = taro.options.miniGlobal = global;
  taro.getAppInfo = function () {
    return {
      platform: "mini" || 0,
      taroVersion: "4.2.0" || 0,
      designWidth: taro.config.designWidth
    };
  };
  taro.createSelectorQuery = delayRef(taro, global, 'createSelectorQuery', 'exec');
  taro.createIntersectionObserver = delayRef(taro, global, 'createIntersectionObserver', 'observe');
}
/**
 * 将Task对象中的方法挂载到promise对象中，适配小程序api原生返回结果
 * @param task Task对象 {RequestTask | DownloadTask | UploadTask}
 * @param promise Promise
 */
function equipTaskMethodsIntoPromise(task, promise) {
  if (!task || !promise) return;
  const taskMethods = ['abort', 'onHeadersReceived', 'offHeadersReceived', 'onProgressUpdate', 'offProgressUpdate', 'onChunkReceived', 'offChunkReceived'];
  task && taskMethods.forEach(method => {
    if (method in task) {
      promise[method] = task[method].bind(task);
    }
  });
}
function delayRef(taro, global, name, method) {
  return function (...args) {
    const res = global[name](...args);
    const raw = res[method].bind(res);
    res[method] = function (...methodArgs) {
      taro.nextTick(() => raw(...methodArgs));
    };
    return res;
  };
}


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/runtime-hooks.js":
/*!***********************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/runtime-hooks.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hooks: function() { return /* binding */ hooks; }
/* harmony export */ });
/* unused harmony exports HOOK_TYPE, TaroHook, TaroHooks */
/* harmony import */ var _event_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./event-emitter.js */ "./node_modules/@tarojs/shared/dist/event-emitter.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@tarojs/shared/dist/is.js");


var HOOK_TYPE;
(function (HOOK_TYPE) {
  HOOK_TYPE[HOOK_TYPE["SINGLE"] = 0] = "SINGLE";
  HOOK_TYPE[HOOK_TYPE["MULTI"] = 1] = "MULTI";
  HOOK_TYPE[HOOK_TYPE["WATERFALL"] = 2] = "WATERFALL";
})(HOOK_TYPE || (HOOK_TYPE = {}));
const defaultMiniLifecycle = {
  app: ['onLaunch', 'onShow', 'onHide'],
  page: ['onLoad', 'onUnload', 'onReady', 'onShow', 'onHide', ['onPullDownRefresh', 'onReachBottom', 'onPageScroll', 'onResize', 'defer:onTabItemTap',
  // defer: 需要等页面组件挂载后再调用
  'onTitleClick', 'onOptionMenuClick', 'events:onKeyboardHeight',
  // events: 支付宝平台需要挂载到 config.events 上
  'onPopMenuClick', 'onPullIntercept', 'onAddToFavorites'], ['onShareAppMessage', 'onShareTimeline']],
  component: ['attached', 'detached']
};
function TaroHook(type, initial) {
  return {
    type,
    initial: initial || null
  };
}
class TaroHooks extends _event_emitter_js__WEBPACK_IMPORTED_MODULE_0__.Events {
  constructor(hooks, opts) {
    super(opts);
    this.hooks = hooks;
    for (const hookName in hooks) {
      const {
        initial
      } = hooks[hookName];
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(initial)) {
        this.on(hookName, initial);
      }
    }
  }
  tapOneOrMany(hookName, callback) {
    const list = (0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(callback) ? [callback] : callback;
    list.forEach(cb => this.on(hookName, cb));
  }
  tap(hookName, callback) {
    const hooks = this.hooks;
    const {
      type,
      initial
    } = hooks[hookName];
    if (type === HOOK_TYPE.SINGLE) {
      this.off(hookName);
      this.on(hookName, (0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(callback) ? callback : callback[callback.length - 1]);
    } else {
      initial && this.off(hookName, initial);
      this.tapOneOrMany(hookName, callback);
    }
  }
  call(hookName, ...rest) {
    var _a;
    const hook = this.hooks[hookName];
    if (!hook) return;
    const {
      type
    } = hook;
    const calls = this.callbacks;
    if (!calls) return;
    const list = calls[hookName];
    if (list) {
      const tail = list.tail;
      let node = list.next;
      let args = rest;
      let res;
      while (node !== tail) {
        res = (_a = node.callback) === null || _a === void 0 ? void 0 : _a.apply(node.context || this, args);
        if (type === HOOK_TYPE.WATERFALL) {
          const params = [res];
          args = params;
        }
        node = node.next;
      }
      return res;
    }
  }
  isExist(hookName) {
    var _a;
    return Boolean((_a = this.callbacks) === null || _a === void 0 ? void 0 : _a[hookName]);
  }
}
const hooks = new TaroHooks({
  getMiniLifecycle: TaroHook(HOOK_TYPE.SINGLE, defaultConfig => defaultConfig),
  getMiniLifecycleImpl: TaroHook(HOOK_TYPE.SINGLE, function () {
    return this.call('getMiniLifecycle', defaultMiniLifecycle);
  }),
  getLifecycle: TaroHook(HOOK_TYPE.SINGLE, (instance, lifecycle) => instance[lifecycle]),
  modifyRecursiveComponentConfig: TaroHook(HOOK_TYPE.SINGLE, defaultConfig => defaultConfig),
  getPathIndex: TaroHook(HOOK_TYPE.SINGLE, indexOfNode => `[${indexOfNode}]`),
  getEventCenter: TaroHook(HOOK_TYPE.SINGLE, Events => new Events()),
  isBubbleEvents: TaroHook(HOOK_TYPE.SINGLE, eventName => {
    /**
     * 支持冒泡的事件, 除 支付宝小程序外，其余的可冒泡事件都和微信保持一致
     * 详见 见 https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
     */
    const BUBBLE_EVENTS = new Set(['touchstart', 'touchmove', 'touchcancel', 'touchend', 'touchforcechange', 'tap', 'longpress', 'longtap', 'transitionend', 'animationstart', 'animationiteration', 'animationend']);
    return BUBBLE_EVENTS.has(eventName);
  }),
  getSpecialNodes: TaroHook(HOOK_TYPE.SINGLE, () => ['view', 'text', 'image']),
  onRemoveAttribute: TaroHook(HOOK_TYPE.SINGLE),
  batchedEventUpdates: TaroHook(HOOK_TYPE.SINGLE),
  mergePageInstance: TaroHook(HOOK_TYPE.SINGLE),
  modifyPageObject: TaroHook(HOOK_TYPE.SINGLE),
  createPullDownComponent: TaroHook(HOOK_TYPE.SINGLE),
  getDOMNode: TaroHook(HOOK_TYPE.SINGLE),
  modifyHydrateData: TaroHook(HOOK_TYPE.SINGLE),
  transferHydrateData: TaroHook(HOOK_TYPE.SINGLE),
  modifySetAttrPayload: TaroHook(HOOK_TYPE.SINGLE),
  modifyRmAttrPayload: TaroHook(HOOK_TYPE.SINGLE),
  onAddEvent: TaroHook(HOOK_TYPE.SINGLE),
  proxyToRaw: TaroHook(HOOK_TYPE.SINGLE, function (proxyObj) {
    return proxyObj;
  }),
  modifyMpEvent: TaroHook(HOOK_TYPE.MULTI),
  modifyMpEventImpl: TaroHook(HOOK_TYPE.SINGLE, function (e) {
    try {
      // 有些小程序的事件对象的某些属性只读
      this.call('modifyMpEvent', e);
    } catch (error) {
      console.warn('[Taro modifyMpEvent hook Error]: ' + (error === null || error === void 0 ? void 0 : error.message));
    }
  }),
  injectNewStyleProperties: TaroHook(HOOK_TYPE.SINGLE),
  modifyTaroEvent: TaroHook(HOOK_TYPE.MULTI),
  dispatchTaroEvent: TaroHook(HOOK_TYPE.SINGLE, (e, node) => {
    node.dispatchEvent(e);
  }),
  dispatchTaroEventFinish: TaroHook(HOOK_TYPE.MULTI),
  modifyTaroEventReturn: TaroHook(HOOK_TYPE.SINGLE, () => undefined),
  modifyDispatchEvent: TaroHook(HOOK_TYPE.MULTI),
  initNativeApi: TaroHook(HOOK_TYPE.MULTI),
  patchElement: TaroHook(HOOK_TYPE.MULTI),
  modifyAddEventListener: TaroHook(HOOK_TYPE.SINGLE),
  modifyRemoveEventListener: TaroHook(HOOK_TYPE.SINGLE),
  getMemoryLevel: TaroHook(HOOK_TYPE.SINGLE)
});


/***/ }),

/***/ "./node_modules/@tarojs/shared/dist/utils.js":
/*!***************************************************!*\
  !*** ./node_modules/@tarojs/shared/dist/utils.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EMPTY_OBJ: function() { return /* binding */ EMPTY_OBJ; },
/* harmony export */   capitalize: function() { return /* binding */ capitalize; },
/* harmony export */   ensure: function() { return /* binding */ ensure; },
/* harmony export */   getComponentsAlias: function() { return /* binding */ getComponentsAlias; },
/* harmony export */   isEnableTTDom: function() { return /* binding */ isEnableTTDom; },
/* harmony export */   mergeInternalComponents: function() { return /* binding */ mergeInternalComponents; },
/* harmony export */   mergeReconciler: function() { return /* binding */ mergeReconciler; },
/* harmony export */   nonsupport: function() { return /* binding */ nonsupport; },
/* harmony export */   noop: function() { return /* binding */ noop; },
/* harmony export */   setUniqueKeyToRoute: function() { return /* binding */ setUniqueKeyToRoute; },
/* harmony export */   toCamelCase: function() { return /* binding */ toCamelCase; },
/* harmony export */   toDashed: function() { return /* binding */ toDashed; },
/* harmony export */   warn: function() { return /* binding */ warn; }
/* harmony export */ });
/* unused harmony exports EMPTY_ARR, TTRenderType, box, cacheDataGet, cacheDataHas, cacheDataSet, getPlatformType, getUniqueKey, hasOwn, indent, queryToJson, toKebabCase, unbox */
/* harmony import */ var _components_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components.js */ "./node_modules/@tarojs/shared/dist/components.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@tarojs/shared/dist/constants.js");
/* harmony import */ var _runtime_hooks_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./runtime-hooks.js */ "./node_modules/@tarojs/shared/dist/runtime-hooks.js");



const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const noop = (..._) => {};
/**
 * box creates a boxed value.
 *
 * @typeparam T Value type.
 * @param v Value.
 * @returns Boxed value.
 */
const box = v => ({
  v
});
/**
 * box creates a boxed value.
 *
 * @typeparam T Value type.
 * @param b Boxed value.
 * @returns Value.
 */
const unbox = b => b.v;
function toDashed(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
function toCamelCase(s) {
  let camel = '';
  let nextCap = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '-') {
      camel += nextCap ? s[i].toUpperCase() : s[i];
      nextCap = false;
    } else {
      nextCap = true;
    }
  }
  return camel;
}
const toKebabCase = function (string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
/**
 * ensure takes a condition and throw a error if the condition fails,
 * like failure::ensure: https://docs.rs/failure/0.1.1/failure/macro.ensure.html
 * @param condition condition.
 * @param msg error message.
 */
function ensure(condition, msg) {
  if (!condition) {
    if (true) {
      const reportIssue = '\n如有疑问，请提交 issue 至：https://github.com/nervjs/taro/issues';
      throw new Error(msg + reportIssue);
    } else {}
  }
}
function warn(condition, msg) {
  if (true) {
    if (condition) {
      console.warn(`[taro warn] ${msg}`);
    }
  }
}
function queryToJson(str) {
  const dec = decodeURIComponent;
  const qp = str.split('&');
  const ret = {};
  let name;
  let val;
  for (let i = 0, l = qp.length, item; i < l; ++i) {
    item = qp[i];
    if (item.length) {
      const s = item.indexOf('=');
      if (s < 0) {
        name = dec(item);
        val = '';
      } else {
        name = dec(item.slice(0, s));
        val = dec(item.slice(s + 1));
      }
      if (typeof ret[name] === 'string') {
        // inline'd type check
        ret[name] = [ret[name]];
      }
      if (Array.isArray(ret[name])) {
        ret[name].push(val);
      } else {
        ret[name] = val;
      }
    }
  }
  return ret; // Object
}
let _uniqueId = 1;
const _loadTime = new Date().getTime().toString();
function getUniqueKey() {
  return _loadTime + _uniqueId++;
}
const cacheData = {};
function cacheDataSet(key, val) {
  cacheData[key] = val;
}
function cacheDataGet(key, delelteAfterGet) {
  const temp = cacheData[key];
  delelteAfterGet && delete cacheData[key];
  return temp;
}
function cacheDataHas(key) {
  return key in cacheData;
}
function mergeInternalComponents(components) {
  Object.keys(components).forEach(name => {
    if (name in _components_js__WEBPACK_IMPORTED_MODULE_0__.internalComponents) {
      Object.assign(_components_js__WEBPACK_IMPORTED_MODULE_0__.internalComponents[name], components[name]);
    } else {
      _components_js__WEBPACK_IMPORTED_MODULE_0__.internalComponents[name] = components[name];
    }
  });
  return _components_js__WEBPACK_IMPORTED_MODULE_0__.internalComponents;
}
function getComponentsAlias(origin) {
  const mapping = {};
  const viewAttrs = origin.View;
  const extraList = {
    '#text': {},
    StaticView: viewAttrs,
    StaticImage: origin.Image,
    StaticText: origin.Text,
    PureView: viewAttrs,
    CatchView: viewAttrs,
    ClickView: viewAttrs
  };
  origin = Object.assign(Object.assign({}, origin), extraList);
  Object.keys(origin).sort((a, b) => {
    const reg = /^(Static|Pure|Catch|Click)*(View|Image|Text)$/;
    const isACommonly = reg.test(a);
    const isBCommonly = reg.test(b);
    if (isACommonly && isBCommonly) {
      return a > b ? 1 : -1;
    } else if (isACommonly) {
      return -1;
    } else if (isBCommonly) {
      return 1;
    } else {
      return a >= b ? 1 : -1;
    }
  }).forEach((key, num) => {
    const obj = {
      _num: String(num)
    };
    Object.keys(origin[key]).filter(attr => !/^bind/.test(attr) && !['focus', 'blur', '$duplicateFromComponent'].includes(attr)).sort().forEach((attr, index) => {
      obj[toCamelCase(attr)] = 'p' + index;
    });
    mapping[toDashed(key)] = obj;
  });
  return mapping;
}
function getPlatformType(platform = 'weapp', configNameOrType = _constants_js__WEBPACK_IMPORTED_MODULE_1__.PLATFORM_TYPE.MINI) {
  if (Object.keys(_constants_js__WEBPACK_IMPORTED_MODULE_1__.PLATFORM_CONFIG_MAP).includes(platform)) {
    configNameOrType = platform;
  }
  const param = _constants_js__WEBPACK_IMPORTED_MODULE_1__.PLATFORM_CONFIG_MAP[configNameOrType] || {};
  return param.type || configNameOrType;
}
function mergeReconciler(hostConfig, hooksForTest) {
  const obj = hooksForTest || _runtime_hooks_js__WEBPACK_IMPORTED_MODULE_2__.hooks;
  const keys = Object.keys(hostConfig);
  keys.forEach(key => {
    obj.tap(key, hostConfig[key]);
  });
}
function nonsupport(api) {
  return function () {
    console.warn(`小程序暂不支持 ${api}`);
  };
}
function setUniqueKeyToRoute(key, obj) {
  const routerParamsPrivateKey = '__key_';
  const useDataCacheApis = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'];
  if (useDataCacheApis.indexOf(key) > -1) {
    const url = obj.url = obj.url || '';
    const hasMark = url.indexOf('?') > -1;
    const cacheKey = getUniqueKey();
    obj.url += (hasMark ? '&' : '?') + `${routerParamsPrivateKey}=${cacheKey}`;
  }
}
function indent(str, size) {
  return str.split('\n').map((line, index) => {
    const indent = index === 0 ? '' : Array(size).fill(' ').join('');
    return indent + line;
  }).join('\n');
}
var TTRenderType;
(function (TTRenderType) {
  TTRenderType[TTRenderType["V1"] = 1] = "V1";
  TTRenderType[TTRenderType["V2"] = 2] = "V2";
})(TTRenderType || (TTRenderType = {}));
let ttUseV2TTDom;
function isEnableTTDom() {
  // 目前仅对于 react 支持 ttdom
  if (true) {
    return false;
  }
  if (ttUseV2TTDom !== undefined) return ttUseV2TTDom;
  const ttMode = tt.getRenderMode ? tt.getRenderMode() : TTRenderType.V1;
  ttMode === TTRenderType.V2 && tt.__$enableTTDom$__ ? ttUseV2TTDom = true : ttUseV2TTDom = false;
  return ttUseV2TTDom;
}


/***/ }),

/***/ "./node_modules/@tarojs/taro/index.js":
/*!********************************************!*\
  !*** ./node_modules/@tarojs/taro/index.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

const {
  hooks
} = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/index.js");
const taro = (__webpack_require__(/*! @tarojs/api */ "./node_modules/@tarojs/api/dist/index.js")["default"]);
if (hooks.isExist('initNativeApi')) {
  hooks.call('initNativeApi', taro);
}
module.exports = taro;
module.exports["default"] = module.exports;

/***/ }),

/***/ "./node_modules/@tarojs/webpack5-runner/dist/template/comp.js":
/*!********************************************************************!*\
  !*** ./node_modules/@tarojs/webpack5-runner/dist/template/comp.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* eslint-disable no-undef */

// @ts-ignore
Component((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createRecursiveComponentConfig)());

/***/ }),

/***/ "./node_modules/@tarojs/webpack5-runner/dist/template/custom-wrapper.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@tarojs/webpack5-runner/dist/template/custom-wrapper.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/dsl/common.js");
/* eslint-disable no-undef */

// @ts-ignore
Component((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createRecursiveComponentConfig)('custom-wrapper'));

/***/ })

}]);
//# sourceMappingURL=taro.js.map