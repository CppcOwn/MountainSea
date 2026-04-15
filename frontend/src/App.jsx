import React, { useState, useEffect } from 'react';
import EarthContainer from './components/Earth'

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // 响应式布局检测
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // 初始检测
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ 
        position: 'absolute', 
        top: isMobile ? '10px' : '20px', 
        left: isMobile ? '10px' : '20px', 
        zIndex: 10, 
        color: '#fff', 
        fontSize: isMobile ? '16px' : isTablet ? '20px' : '24px', 
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
      }}>
        中国文旅地球仪
      </div>
      <EarthContainer isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
    </div>
  )
}

export default App
