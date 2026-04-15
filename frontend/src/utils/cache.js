// 数据缓存工具

// 缓存键前缀
const CACHE_PREFIX = 'chinese_tourism_'

// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24小时
const SESSION_CACHE_EXPIRY = 30 * 60 * 1000 // 30分钟

/**
 * 设置本地存储缓存（持久化）
 * @param {string} key 缓存键
 * @param {any} data 缓存数据
 * @param {number} expiry 过期时间（毫秒）
 */
export const setLocalCache = (key, data, expiry = CACHE_EXPIRY) => {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + expiry
    }
    const cacheKey = CACHE_PREFIX + key
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('设置本地缓存失败:', error)
  }
}

/**
 * 设置会话存储缓存（临时）
 * @param {string} key 缓存键
 * @param {any} data 缓存数据
 * @param {number} expiry 过期时间（毫秒）
 */
export const setSessionCache = (key, data, expiry = SESSION_CACHE_EXPIRY) => {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + expiry
    }
    const cacheKey = CACHE_PREFIX + key
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('设置会话缓存失败:', error)
  }
}

/**
 * 获取本地存储缓存
 * @param {string} key 缓存键
 * @returns {any} 缓存数据，过期或不存在返回null
 */
export const getLocalCache = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cacheData = localStorage.getItem(cacheKey)
    if (!cacheData) return null
    
    const parsedData = JSON.parse(cacheData)
    if (Date.now() > parsedData.expiry) {
      // 缓存过期，清除缓存
      localStorage.removeItem(cacheKey)
      return null
    }
    return parsedData.data
  } catch (error) {
    console.error('获取本地缓存失败:', error)
    return null
  }
}

/**
 * 获取会话存储缓存
 * @param {string} key 缓存键
 * @returns {any} 缓存数据，过期或不存在返回null
 */
export const getSessionCache = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cacheData = sessionStorage.getItem(cacheKey)
    if (!cacheData) return null
    
    const parsedData = JSON.parse(cacheData)
    if (Date.now() > parsedData.expiry) {
      // 缓存过期，清除缓存
      sessionStorage.removeItem(cacheKey)
      return null
    }
    return parsedData.data
  } catch (error) {
    console.error('获取会话缓存失败:', error)
    return null
  }
}

/**
 * 清除本地存储缓存
 * @param {string} key 缓存键
 */
export const clearLocalCache = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.error('清除本地缓存失败:', error)
  }
}

/**
 * 清除会话存储缓存
 * @param {string} key 缓存键
 */
export const clearSessionCache = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    sessionStorage.removeItem(cacheKey)
  } catch (error) {
    console.error('清除会话缓存失败:', error)
  }
}

/**
 * 清除所有本地存储缓存
 */
export const clearAllLocalCache = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('清除所有本地缓存失败:', error)
  }
}

/**
 * 清除所有会话存储缓存
 */
export const clearAllSessionCache = () => {
  try {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('清除所有会话缓存失败:', error)
  }
}

/**
 * 缓存请求数据（使用本地存储）
 * @param {string} key 缓存键
 * @param {function} fetchFn 获取数据的函数
 * @param {number} expiry 过期时间（毫秒）
 * @returns {Promise<any>} 数据
 */
export const cacheRequest = async (key, fetchFn, expiry = CACHE_EXPIRY) => {
  // 尝试从本地缓存获取
  const cachedData = getLocalCache(key)
  if (cachedData) {
    return cachedData
  }
  
  // 缓存不存在，请求数据
  const data = await fetchFn()
  // 设置缓存
  setLocalCache(key, data, expiry)
  return data
}

/**
 * 缓存请求数据（使用会话存储）
 * @param {string} key 缓存键
 * @param {function} fetchFn 获取数据的函数
 * @param {number} expiry 过期时间（毫秒）
 * @returns {Promise<any>} 数据
 */
export const cacheSessionRequest = async (key, fetchFn, expiry = SESSION_CACHE_EXPIRY) => {
  // 尝试从会话缓存获取
  const cachedData = getSessionCache(key)
  if (cachedData) {
    return cachedData
  }
  
  // 缓存不存在，请求数据
  const data = await fetchFn()
  // 设置缓存
  setSessionCache(key, data, expiry)
  return data
}

// 导出兼容旧版本的函数
export const setCache = setLocalCache
export const getCache = getLocalCache
export const clearCache = clearLocalCache
export const clearAllCache = clearAllLocalCache
