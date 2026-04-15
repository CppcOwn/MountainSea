// 性能监控工具

// 性能指标存储
const performanceMetrics = {
  pageLoad: {
    startTime: 0,
    endTime: 0,
    duration: 0
  },
  apiRequests: {
    total: 0,
    successful: 0,
    failed: 0,
    averageTime: 0,
    requests: []
  },
  resourceLoad: {
    total: 0,
    images: 0,
    scripts: 0,
    styles: 0,
    other: 0,
    averageTime: 0,
    resources: []
  },
  memory: {
    used: 0,
    total: 0,
    percentage: 0
  },
  fps: {
    current: 60,
    average: 60,
    min: 60,
    max: 60,
    samples: []
  }
};

// 开始监控
const startMonitoring = () => {
  // 监控页面加载性能
  performanceMetrics.pageLoad.startTime = performance.now();
  
  // 监控API请求
  monitorAPIRequests();
  
  // 监控资源加载
  monitorResourceLoad();
  
  // 监控内存使用
  monitorMemory();
  
  // 监控FPS
  monitorFPS();
  
  // 页面加载完成后记录时间
  window.addEventListener('load', () => {
    performanceMetrics.pageLoad.endTime = performance.now();
    performanceMetrics.pageLoad.duration = performanceMetrics.pageLoad.endTime - performanceMetrics.pageLoad.startTime;
    console.log('Page load time:', performanceMetrics.pageLoad.duration.toFixed(2), 'ms');
  });
};

// 监控API请求
const monitorAPIRequests = () => {
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    const startTime = performance.now();
    performanceMetrics.apiRequests.total++;
    
    try {
      const response = await originalFetch(url, options);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMetrics.apiRequests.successful++;
      performanceMetrics.apiRequests.requests.push({
        url,
        method: options?.method || 'GET',
        duration,
        status: response.status,
        success: response.ok
      });
      
      // 更新平均请求时间
      updateAverageAPIRequestTime();
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMetrics.apiRequests.failed++;
      performanceMetrics.apiRequests.requests.push({
        url,
        method: options?.method || 'GET',
        duration,
        status: 0,
        success: false,
        error: error.message
      });
      
      // 更新平均请求时间
      updateAverageAPIRequestTime();
      
      throw error;
    }
  };
};

// 更新平均API请求时间
const updateAverageAPIRequestTime = () => {
  if (performanceMetrics.apiRequests.requests.length === 0) {
    performanceMetrics.apiRequests.averageTime = 0;
    return;
  }
  
  const totalTime = performanceMetrics.apiRequests.requests.reduce((sum, req) => sum + req.duration, 0);
  performanceMetrics.apiRequests.averageTime = totalTime / performanceMetrics.apiRequests.requests.length;
};

// 监控资源加载
const monitorResourceLoad = () => {
  performanceMetrics.resourceLoad.resources = performance.getEntriesByType('resource');
  performanceMetrics.resourceLoad.total = performanceMetrics.resourceLoad.resources.length;
  
  // 分类统计资源
  performanceMetrics.resourceLoad.images = performanceMetrics.resourceLoad.resources.filter(r => r.initiatorType === 'img').length;
  performanceMetrics.resourceLoad.scripts = performanceMetrics.resourceLoad.resources.filter(r => r.initiatorType === 'script').length;
  performanceMetrics.resourceLoad.styles = performanceMetrics.resourceLoad.resources.filter(r => r.initiatorType === 'link').length;
  performanceMetrics.resourceLoad.other = performanceMetrics.resourceLoad.total - 
    performanceMetrics.resourceLoad.images - 
    performanceMetrics.resourceLoad.scripts - 
    performanceMetrics.resourceLoad.styles;
  
  // 计算平均加载时间
  if (performanceMetrics.resourceLoad.total > 0) {
    const totalTime = performanceMetrics.resourceLoad.resources.reduce((sum, r) => sum + r.duration, 0);
    performanceMetrics.resourceLoad.averageTime = totalTime / performanceMetrics.resourceLoad.total;
  }
  
  // 监听新的资源加载
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      performanceMetrics.resourceLoad.resources.push(entry);
      performanceMetrics.resourceLoad.total++;
      
      // 更新分类统计
      switch (entry.initiatorType) {
        case 'img':
          performanceMetrics.resourceLoad.images++;
          break;
        case 'script':
          performanceMetrics.resourceLoad.scripts++;
          break;
        case 'link':
          performanceMetrics.resourceLoad.styles++;
          break;
        default:
          performanceMetrics.resourceLoad.other++;
      }
      
      // 更新平均加载时间
      const totalTime = performanceMetrics.resourceLoad.resources.reduce((sum, r) => sum + r.duration, 0);
      performanceMetrics.resourceLoad.averageTime = totalTime / performanceMetrics.resourceLoad.total;
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
};

// 监控内存使用
const monitorMemory = () => {
  if (performance.memory) {
    const updateMemory = () => {
      performanceMetrics.memory.used = performance.memory.usedJSHeapSize;
      performanceMetrics.memory.total = performance.memory.totalJSHeapSize;
      performanceMetrics.memory.percentage = (performanceMetrics.memory.used / performanceMetrics.memory.total) * 100;
    };
    
    // 初始更新
    updateMemory();
    
    // 定期更新
    setInterval(updateMemory, 5000);
  }
};

// 监控FPS
const monitorFPS = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  
  const updateFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount * 1000 / (currentTime - lastTime);
      performanceMetrics.fps.current = fps;
      performanceMetrics.fps.samples.push(fps);
      
      // 保持最多10个样本
      if (performanceMetrics.fps.samples.length > 10) {
        performanceMetrics.fps.samples.shift();
      }
      
      // 更新平均、最小、最大FPS
      performanceMetrics.fps.average = performanceMetrics.fps.samples.reduce((sum, sample) => sum + sample, 0) / performanceMetrics.fps.samples.length;
      performanceMetrics.fps.min = Math.min(...performanceMetrics.fps.samples);
      performanceMetrics.fps.max = Math.max(...performanceMetrics.fps.samples);
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(updateFPS);
  };
  
  requestAnimationFrame(updateFPS);
};

// 获取性能指标
const getPerformanceMetrics = () => {
  return performanceMetrics;
};

// 打印性能指标
const printPerformanceMetrics = () => {
  console.log('=== 性能监控指标 ===');
  console.log('页面加载时间:', performanceMetrics.pageLoad.duration.toFixed(2), 'ms');
  console.log('API请求:', performanceMetrics.apiRequests.total, '个 (成功:', performanceMetrics.apiRequests.successful, '失败:', performanceMetrics.apiRequests.failed, ')');
  console.log('平均API请求时间:', performanceMetrics.apiRequests.averageTime.toFixed(2), 'ms');
  console.log('资源加载:', performanceMetrics.resourceLoad.total, '个 (图片:', performanceMetrics.resourceLoad.images, '脚本:', performanceMetrics.resourceLoad.scripts, '样式:', performanceMetrics.resourceLoad.styles, '其他:', performanceMetrics.resourceLoad.other, ')');
  console.log('平均资源加载时间:', performanceMetrics.resourceLoad.averageTime.toFixed(2), 'ms');
  
  if (performance.memory) {
    console.log('内存使用:', (performanceMetrics.memory.used / 1024 / 1024).toFixed(2), 'MB /', (performanceMetrics.memory.total / 1024 / 1024).toFixed(2), 'MB (', performanceMetrics.memory.percentage.toFixed(1), '%)');
  }
  
  console.log('FPS: 当前', performanceMetrics.fps.current.toFixed(1), '平均', performanceMetrics.fps.average.toFixed(1), '最小', performanceMetrics.fps.min.toFixed(1), '最大', performanceMetrics.fps.max.toFixed(1));
  console.log('====================');
};

export {
  startMonitoring,
  getPerformanceMetrics,
  printPerformanceMetrics
};