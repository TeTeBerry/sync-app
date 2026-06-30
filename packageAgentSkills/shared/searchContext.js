const HOME_CITY_KEY = 'skill_search_home_city';

function setHomeCity(homeCity) {
  const value = typeof homeCity === 'string' ? homeCity.trim() : '';
  if (value) {
    wx.setStorageSync(HOME_CITY_KEY, value);
  } else {
    wx.removeStorageSync(HOME_CITY_KEY);
  }
  return value;
}

function getStoredHomeCity() {
  try {
    const value = wx.getStorageSync(HOME_CITY_KEY);
    return typeof value === 'string' ? value.trim() : '';
  } catch {
    return '';
  }
}

module.exports = {
  setHomeCity,
  getStoredHomeCity,
};
