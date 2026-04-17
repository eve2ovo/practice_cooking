export function getStorage(key, fallbackValue = null) {
  try {
    const rawValue = uni.getStorageSync(key)
    return rawValue === '' || rawValue === undefined ? fallbackValue : rawValue
  } catch (error) {
    console.warn('getStorage failed:', error)
    return fallbackValue
  }
}

export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (error) {
    console.warn('setStorage failed:', error)
    return false
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.warn('removeStorage failed:', error)
    return false
  }
}

export function safeJsonParse(text, fallbackValue = {}) {
  try {
    return JSON.parse(text)
  } catch (error) {
    return fallbackValue
  }
}
