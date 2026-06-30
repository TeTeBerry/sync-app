/**
 * Thin HTTP wrapper for wx AI atomic APIs → AgentCapabilities REST.
 */

/** 与本地 `TARO_APP_API_BASE_URL` 一致；仅 develop 且 storage 为空时兜底（eval / 原子接口页） */
const DEVELOP_API_BASE_FALLBACK = 'http://127.0.0.1:3000/api';

const ACCESS_TOKEN_KEY = 'sync_access_token';
const AUTH_USER_KEY = 'sync_auth_user';

const AUTH_REQUIRED_PATHS = [
  '/agent-capabilities/draft-recruit-post',
  '/agent-capabilities/subscribe-lineup-updates',
  '/agent-capabilities/generate-travel-guide',
];

let loginPromise = null;

function getApiBase() {
  const fromStorage = wx.getStorageSync('sync_api_base');
  if (typeof fromStorage === 'string' && fromStorage.trim()) {
    return fromStorage.replace(/\/$/, '');
  }
  try {
    const envVersion = wx.getAccountInfoSync?.()?.miniProgram?.envVersion;
    if (envVersion === 'develop') {
      return DEVELOP_API_BASE_FALLBACK.replace(/\/$/, '');
    }
  } catch {
    // ignore
  }
  return '';
}

function pathRequiresAuth(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return AUTH_REQUIRED_PATHS.some((p) => normalized.startsWith(p));
}

function getAuthHeader() {
  const token =
    wx.getStorageSync(ACCESS_TOKEN_KEY) || wx.getStorageSync('jwt_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isLoginErrorMessage(message) {
  const text = String(message || '');
  return (
    text.includes('请先登录') ||
    text.includes('未登录') ||
    text.includes('Unauthorized') ||
    text.includes('401')
  );
}

function ensureSkillLogin(apiBase) {
  const existing = wx.getStorageSync(ACCESS_TOKEN_KEY);
  if (existing) {
    return Promise.resolve(existing);
  }

  if (loginPromise) {
    return loginPromise;
  }

  loginPromise = new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        const code = loginRes.code?.trim();
        if (!code) {
          reject(new Error('微信登录失败，未获取到 code'));
          return;
        }
        wx.request({
          url: `${apiBase}/auth/wechat`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { code },
          success(res) {
            if (res.statusCode >= 400) {
              reject(new Error(res.data?.message || res.data?.error || '登录失败'));
              return;
            }
            const payload = res.data?.data ?? res.data;
            const token = payload?.accessToken;
            const user = payload?.user;
            if (!token) {
              reject(new Error('登录失败，未获取 token'));
              return;
            }
            wx.setStorageSync(ACCESS_TOKEN_KEY, token);
            if (user?.id) {
              try {
                wx.setStorageSync(AUTH_USER_KEY, JSON.stringify(user));
              } catch {
                // ignore
              }
            }
            resolve(token);
          },
          fail(err) {
            reject(new Error(err.errMsg || '登录请求失败'));
          },
        });
      },
      fail(err) {
        reject(new Error(err.errMsg || '微信登录失败'));
      },
    });
  }).finally(() => {
    loginPromise = null;
  });

  return loginPromise;
}

function doRequest({ apiBase, path, method, data }) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return new Promise((resolve) => {
    wx.request({
      url: `${apiBase}${normalizedPath}`,
      method,
      header: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      data: method === 'GET' ? undefined : data,
      success(res) {
        if (res.statusCode >= 400) {
          const message =
            res.data?.message || res.data?.error || `请求失败（${res.statusCode}）`;
          resolve({
            isError: true,
            content: [{ type: 'text', text: String(message) }],
            structuredContent: null,
          });
          return;
        }
        const payload = res.data?.data ?? res.data;
        resolve({ payload, statusCode: res.statusCode });
      },
      fail(err) {
        resolve({
          isError: true,
          content: [
            {
              type: 'text',
              text: err.errMsg || '网络错误，请稍后重试。',
            },
          ],
          structuredContent: null,
        });
      },
    });
  });
}

async function requestAgentCapability({ path, method = 'GET', data }) {
  const API_BASE = getApiBase();
  if (!API_BASE) {
    return {
      isError: true,
      content: [{ type: 'text', text: 'API 未配置，请进入小程序重试。' }],
      structuredContent: null,
    };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const needsAuth = pathRequiresAuth(normalizedPath);

  if (needsAuth) {
    try {
      await ensureSkillLogin(API_BASE);
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: err.message || '登录失败，请进入小程序重试。',
          },
        ],
        structuredContent: null,
      };
    }
  }

  let result = await doRequest({
    apiBase: API_BASE,
    path: normalizedPath,
    method,
    data,
  });

  if (needsAuth && result.isError && isLoginErrorMessage(result.content?.[0]?.text)) {
    try {
      wx.removeStorageSync(ACCESS_TOKEN_KEY);
      await ensureSkillLogin(API_BASE);
      result = await doRequest({
        apiBase: API_BASE,
        path: normalizedPath,
        method,
        data,
      });
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: err.message || '登录失败，请进入小程序重试。',
          },
        ],
        structuredContent: null,
      };
    }
  }

  return result;
}

function okResponse(text, structuredContent) {
  return {
    isError: false,
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

module.exports = {
  getApiBase,
  requestAgentCapability,
  okResponse,
};
