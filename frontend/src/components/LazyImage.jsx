import React, { useState, useEffect, useRef } from 'react';
import { loadImageWithRetry, handleError } from '../utils/errorHandler';

const LazyImage = ({ src, alt, style, className, placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjNmMyIvPjwvc3ZnPg==' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // 创建IntersectionObserver
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 元素进入视口，开始加载图片
          loadImage();
          // 停止观察
          if (observerRef.current) {
            observerRef.current.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '50px', // 提前50px开始加载
      threshold: 0.1
    });

    // 开始观察
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src]);

  // 加载图片，带重试机制
  const loadImage = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await loadImageWithRetry(src, 3, 1000);
      setIsLoaded(true);
      setIsError(false);
    } catch (error) {
      handleError(error, `Loading image: ${src}`, () => {
        setIsError(true);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 重新加载图片
  const retryLoad = () => {
    setIsLoading(true);
    setIsError(false);
    loadImage();
  };

  return (
    <div ref={imgRef} style={style} className={className}>
      {!isLoaded && !isError && (
        <img 
          src={placeholder} 
          alt="Loading..." 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {isLoaded && (
        <img 
          src={src} 
          alt={alt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'opacity 0.3s ease'
          }} 
        />
      )}
      {isError && (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f3f3f3',
          color: '#666'
        }}>
          <div>图片加载失败</div>
          <button 
            onClick={retryLoad}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#00ffff',
              color: '#000',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
};

export default LazyImage;