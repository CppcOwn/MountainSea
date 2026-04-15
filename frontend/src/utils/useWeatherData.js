import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { cacheSessionRequest } from './cache';
import { fetchWithRetry, handleError } from './errorHandler';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState({});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const stompClientRef = useRef(null);

  // 获取天气数据
  const fetchWeatherData = async (scenicId) => {
    if (!scenicId) return;
    
    setIsWeatherLoading(true);
    try {
      // 使用会话缓存，减少重复请求，设置30分钟过期
      const data = await cacheSessionRequest(`weather_${scenicId}`, async () => {
        // 使用带重试机制的fetch
        const response = await fetchWithRetry(`http://localhost:8082/api/weather/${scenicId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }, 3, 1000);
        return await response.json();
      }, 30 * 60 * 1000); // 缓存30分钟
      
      setWeatherData(prev => ({
        ...prev,
        [scenicId]: data
      }));
    } catch (error) {
      handleError(error, `Fetching weather data for scenic spot ${scenicId}`, () => {
        // 如果API调用失败，使用模拟数据
        setWeatherData(prev => ({
          ...prev,
          [scenicId]: {
            temperature: 22,
            weatherCondition: '晴',
            windDirection: '东南风',
            windSpeed: 12,
            humidity: 60,
            clothingRecommendation: '建议穿着短袖、短裤等夏季衣物',
            updateTime: new Date().toISOString()
          }
        }));
      });
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // 建立WebSocket连接，监听天气数据更新
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const socket = new SockJS('http://localhost:8082/api/weather/ws');
        const stompClient = Stomp.over(socket);
        
        stompClient.connect({}, () => {
          console.log('WebSocket connected');
          stompClient.subscribe('/topic/weather-updates', (message) => {
            const updatedWeatherData = JSON.parse(message.body);
            setWeatherData(prev => ({
              ...prev,
              [updatedWeatherData.scenicSpotId]: updatedWeatherData
            }));
          });
        }, (error) => {
          console.error('WebSocket connection error:', error);
          // 尝试重连
          setTimeout(connectWebSocket, 5000);
        });
        
        stompClientRef.current = stompClient;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        // 尝试重连
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // 组件卸载时断开连接
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, []);

  return { weatherData, isWeatherLoading, fetchWeatherData };
};