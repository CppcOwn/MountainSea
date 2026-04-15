// 错误处理和重试机制

/**
 * 带重试机制的fetch请求
 * @param {string} url 请求URL
 * @param {object} options 请求选项
 * @param {number} maxRetries 最大重试次数
 * @param {number} retryDelay 重试延迟（毫秒）
 * @returns {Promise} 请求结果
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3, retryDelay = 1000) => {
  let retries = 0;
  
  const attemptFetch = async () => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      retries++;
      if (retries <= maxRetries) {
        console.log(`Request failed, retrying (${retries}/${maxRetries})...`);
        // 指数退避策略
        const delay = retryDelay * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptFetch();
      } else {
        throw error;
      }
    }
  };
  
  return attemptFetch();
};

/**
 * 带重试机制的图片加载
 * @param {string} url 图片URL
 * @param {number} maxRetries 最大重试次数
 * @param {number} retryDelay 重试延迟（毫秒）
 * @returns {Promise<HTMLImageElement>} 加载的图片
 */
export const loadImageWithRetry = async (url, maxRetries = 3, retryDelay = 1000) => {
  let retries = 0;
  
  const attemptLoad = async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = async () => {
        retries++;
        if (retries <= maxRetries) {
          console.log(`Image load failed, retrying (${retries}/${maxRetries})...`);
          // 指数退避策略
          const delay = retryDelay * Math.pow(2, retries - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          attemptLoad().then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };
      
      img.src = url;
    });
  };
  
  return attemptLoad();
};

/**
 * 通用错误处理函数
 * @param {Error} error 错误对象
 * @param {string} context 错误上下文
 * @param {function} fallback 回退函数
 */
export const handleError = (error, context = '', fallback = null) => {
  console.error(`Error in ${context}:`, error);
  
  // 可以添加错误日志上报逻辑
  // reportErrorToServer(error, context);
  
  // 执行回退逻辑
  if (typeof fallback === 'function') {
    try {
      fallback();
    } catch (fallbackError) {
      console.error('Fallback function failed:', fallbackError);
    }
  }
};

/**
 * 批量资源加载错误处理
 * @param {Array} resources 资源数组
 * @param {function} loadFn 加载函数
 * @param {number} maxRetries 最大重试次数
 * @returns {Promise<Array>} 加载结果
 */
export const loadResourcesWithErrorHandling = async (resources, loadFn, maxRetries = 3) => {
  const results = [];
  
  for (const resource of resources) {
    try {
      const result = await loadFn(resource);
      results.push({ success: true, data: result });
    } catch (error) {
      console.error(`Failed to load resource: ${resource}`, error);
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * 网络状态检测
 * @returns {boolean} 是否在线
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * 监听网络状态变化
 * @param {function} callback 状态变化回调
 */
export const listenNetworkStatus = (callback) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

export default {
  fetchWithRetry,
  loadImageWithRetry,
  handleError,
  loadResourcesWithErrorHandling,
  isOnline,
  listenNetworkStatus
};