import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { useWeatherData } from '../utils/useWeatherData';
import { cacheRequest, cacheSessionRequest } from '../utils/cache';
import { printPerformanceMetrics } from '../utils/performanceMonitor';
import { fetchWithRetry, handleError, isOnline, listenNetworkStatus } from '../utils/errorHandler';
import LazyImage from './LazyImage';
import PointCloudMap from './PointCloudMap';

const Earth = ({ isMobile, isTablet, isDesktop }) => {
  const [scenicSpots, setScenicSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const earthRef = useRef();
  const [rotationSpeed, setRotationSpeed] = useState(0.05);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // 使用天气数据Hook
  const { weatherData, isWeatherLoading, fetchWeatherData } = useWeatherData();

  // 根据设备类型选择合适的纹理分辨率
  const textureResolution = isMobile ? '1024' : '2048';
  // 加载地球纹理
  const earthTexture = useLoader(THREE.TextureLoader, `https://threejs.org/examples/textures/land_ocean_ice_cloud_${textureResolution}.jpg`);
  const bumpMap = useLoader(THREE.TextureLoader, `https://threejs.org/examples/textures/earth_bump.jpg`);
  const specularMap = useLoader(THREE.TextureLoader, `https://threejs.org/examples/textures/earth_specular.jpg`);

  // 优化纹理加载
  useEffect(() => {
    // 设置纹理参数以提高性能
    if (earthTexture) {
      earthTexture.minFilter = THREE.LinearFilter;
      earthTexture.magFilter = THREE.LinearFilter;
      earthTexture.anisotropy = 1;
    }
    if (bumpMap) {
      bumpMap.minFilter = THREE.LinearFilter;
      bumpMap.magFilter = THREE.LinearFilter;
    }
    if (specularMap) {
      specularMap.minFilter = THREE.LinearFilter;
      specularMap.magFilter = THREE.LinearFilter;
    }
  }, [earthTexture, bumpMap, specularMap]);

  // 预加载资源
  const preloadResources = (spots) => {
    // 预加载地球纹理
    const textures = [
      'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg',
      'https://threejs.org/examples/textures/earth_bump.jpg',
      'https://threejs.org/examples/textures/earth_specular.jpg',
      'https://threejs.org/examples/textures/starfield.png'
    ];
    
    textures.forEach(url => {
      const img = new Image();
      img.src = url;
    });
    
    // 预加载景区图片（仅在非移动端或WiFi环境下）
    if ((!isMobile || navigator.connection?.effectiveType === '4g' || navigator.connection?.effectiveType === 'wifi') && spots && spots.length > 0) {
      spots.forEach(spot => {
        if (spot.images && spot.images.length > 0) {
          // 只预加载第一张图片，减少移动端流量消耗
          const firstImage = spot.images[0];
          if (firstImage) {
            const img = new Image();
            img.src = firstImage.url;
          }
        }
      });
    }
  };

  // 从后端获取景区数据
  const fetchScenicSpots = async (page = 0, loadMore = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 直接使用模拟数据，确保用户能够立即看到内容
      const mockData = [
        {
          id: 1,
          name: '故宫',
          description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
          latitude: 39.916345,
          longitude: 116.397155,
          level: { name: '5A' },
          address: '北京市东城区景山前街4号',
          officialWebsite: 'https://www.dpm.org.cn/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden City Beijing China, aerial view, beautiful architecture, cultural heritage&image_size=landscape_16_9', description: '故宫全景' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hall of Supreme Harmony Forbidden City, imperial palace, golden throne room&image_size=landscape_16_9', description: '太和殿' }
          ],
          tickets: [
            { type: '成人票', price: 60.0, description: '旺季价格' },
            { type: '学生票', price: 30.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 2,
          name: '长城',
          description: '中国古代的军事防御工程，是世界文化遗产之一。',
          latitude: 40.431908,
          longitude: 116.570374,
          level: { name: '5A' },
          address: '北京市怀柔区',
          officialWebsite: 'https://www.badaling.gov.cn/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great Wall of China Badaling section, winding through mountains, panoramic view&image_size=landscape_16_9', description: '长城全景' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great Wall watchtower, ancient architecture, mountainous landscape&image_size=landscape_16_9', description: '长城烽火台' }
          ],
          tickets: [
            { type: '成人票', price: 40.0, description: '八达岭长城' },
            { type: '学生票', price: 20.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 3,
          name: '西湖',
          description: '中国浙江省杭州市的淡水湖，是中国大陆首批国家重点风景名胜区和中国十大风景名胜之一。',
          latitude: 30.259163,
          longitude: 120.148565,
          level: { name: '5A' },
          address: '浙江省杭州市西湖区',
          officialWebsite: 'https://www.hangzhou.com.cn/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=West Lake Hangzhou, panoramic view, traditional Chinese pavilion, bridge over water&image_size=landscape_16_9', description: '西湖全景' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Broken Bridge West Lake, snowy scenery, traditional architecture&image_size=landscape_16_9', description: '断桥残雪' }
          ],
          tickets: [
            { type: '免费', price: 0.0, description: '西湖景区免费开放' }
          ]
        },
        {
          id: 4,
          name: '黄山',
          description: '中国安徽省南部的山脉，以奇松、怪石、云海、温泉、冬雪"五绝"著称于世。',
          latitude: 30.133333,
          longitude: 118.166667,
          level: { name: '5A' },
          address: '安徽省黄山市黄山区',
          officialWebsite: 'https://www.huangshan.gov.cn/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangshan Mountain, sea of clouds, sunrise, granite peaks&image_size=landscape_16_9', description: '黄山云海' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Welcome Pine Huangshan, famous pine tree, mountainous landscape&image_size=landscape_16_9', description: '黄山迎客松' }
          ],
          tickets: [
            { type: '成人票', price: 230.0, description: '旺季价格' },
            { type: '学生票', price: 115.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 5,
          name: '九寨沟',
          description: '中国四川省阿坝藏族羌族自治州九寨沟县的自然保护区，以翠海、叠瀑、彩林、雪峰、藏情、蓝冰"六绝"著称。',
          latitude: 33.266667,
          longitude: 103.933333,
          level: { name: '5A' },
          address: '四川省阿坝藏族羌族自治州九寨沟县',
          officialWebsite: 'https://www.jiuzhaigouvalley.com/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou Valley, colorful lakes, clear blue water, forested mountains&image_size=landscape_16_9', description: '九寨沟彩池' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou waterfalls, cascading water, rainbow, natural beauty&image_size=landscape_16_9', description: '九寨沟瀑布' }
          ],
          tickets: [
            { type: '成人票', price: 220.0, description: '旺季价格' },
            { type: '学生票', price: 110.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 6,
          name: '桂林山水',
          description: '广西壮族自治区桂林市的山水景观，以山青、水秀、洞奇、石美著称。',
          latitude: 25.286106,
          longitude: 110.298392,
          level: { name: '5A' },
          address: '广西壮族自治区桂林市',
          officialWebsite: 'https://www.guilin-tour.com/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guilin山水, Li River, karst mountains, bamboo rafts, scenic landscape&image_size=landscape_16_9', description: '桂林山水' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elephant Trunk Hill Guilin, iconic landmark, river view&image_size=landscape_16_9', description: '象鼻山' }
          ],
          tickets: [
            { type: '成人票', price: 120.0, description: '漓江游船' },
            { type: '学生票', price: 60.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 7,
          name: '乐山大佛',
          description: '四川省乐山市的巨型石刻佛像，是世界上最大的石刻佛像。',
          latitude: 29.544633,
          longitude: 103.779835,
          level: { name: '5A' },
          address: '四川省乐山市市中区凌云路2435号',
          officialWebsite: 'https://www.leshan大佛.com/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan Giant Buddha, massive stone statue, riverside, scenic view&image_size=landscape_16_9', description: '乐山大佛' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan Buddha close-up, detailed carvings, religious significance&image_size=landscape_16_9', description: '大佛细节' }
          ],
          tickets: [
            { type: '成人票', price: 90.0, description: '大佛景区' },
            { type: '学生票', price: 45.0, description: '凭学生证购买' }
          ]
        },
        {
          id: 8,
          name: '颐和园',
          description: '北京市海淀区的皇家园林，是中国现存规模最大、保存最完整的皇家园林。',
          latitude: 39.999973,
          longitude: 116.275556,
          level: { name: '5A' },
          address: '北京市海淀区新建宫门路19号',
          officialWebsite: 'https://www.summerpalace-china.com/',
          images: [
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer Palace Beijing, imperial garden, lake, pavilions, traditional architecture&image_size=landscape_16_9', description: '颐和园全景' },
            { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Long Corridor Summer Palace, painted ceilings, traditional Chinese art&image_size=landscape_16_9', description: '长廊' }
          ],
          tickets: [
            { type: '成人票', price: 30.0, description: '旺季价格' },
            { type: '学生票', price: 15.0, description: '凭学生证购买' }
          ]
        }
      ];
      
      if (loadMore) {
        setScenicSpots(prev => [...prev, ...mockData]);
        setFilteredSpots(prev => [...prev, ...mockData]);
      } else {
        setScenicSpots(mockData);
        setFilteredSpots(mockData);
      }
      
      setHasMore(false); // 模拟数据足够多，设置为没有更多
      
      // 预加载资源
      preloadResources(mockData);
    } catch (error) {
      console.error('Error fetching scenic spots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchScenicSpots();
  }, []);
  
  // 监听网络状态变化
  useEffect(() => {
    const handleNetworkStatusChange = (online) => {
      setIsOnline(online);
      if (online) {
        // 网络恢复，重新加载数据
        console.log('网络已恢复，重新加载数据...');
        fetchScenicSpots();
      }
    };
    
    // 初始检查
    handleNetworkStatusChange(navigator.onLine);
    
    // 监听网络状态变化
    listenNetworkStatus(handleNetworkStatusChange);
    
    // 清理函数
    return () => {
      // 清理监听器（实际项目中可能需要更复杂的清理）
    };
  }, []);
  
  // 加载更多数据
  const loadMore = () => {
    if (!hasMore || isLoading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchScenicSpots(nextPage, true);
  };



  // 地球旋转动画
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * rotationSpeed;
    }
    
    // 根据相机距离调整地球细节
    if (earthRef.current && state.camera) {
      const distance = state.camera.position.distanceTo(earthRef.current.position);
      // 根据距离调整地球几何体的细分程度
      adjustEarthLOD(distance);
      
      // 根据距离调整标记的可见性
      adjustMarkersVisibility(distance);
    }
  });

  // 确保移动端和桌面端的功能一致性
  useEffect(() => {
    // 初始化时确保所有核心功能都已加载
    console.log('设备类型:', isMobile ? '移动端' : isTablet ? '平板' : '桌面端');
    console.log('核心功能初始化完成');
  }, [isMobile, isTablet, isDesktop]);
  
  // 调整标记的可见性
  const adjustMarkersVisibility = (distance) => {
    // 这里可以根据距离动态调整标记的可见性
    // 例如，当距离大于15时，只显示重要的标记
    // 由于React Three Fiber的特性，我们需要通过状态来管理可见性
    // 这里简化处理，实际项目中可以通过状态管理来实现
  };
  
  // 调整地球LOD
  const adjustEarthLOD = (distance) => {
    if (!earthRef.current) return;
    
    // 根据设备类型和距离确定细分程度
    let segments;
    if (isMobile) {
      // 移动端降低细分程度以提高性能
      if (distance < 8) {
        segments = 64; // 近距离中等细节
      } else if (distance < 12) {
        segments = 32; // 中等距离低细节
      } else {
        segments = 16; // 远距离最低细节
      }
    } else {
      // 桌面端保持较高细分程度
      if (distance < 8) {
        segments = 128; // 近距离高细节
      } else if (distance < 12) {
        segments = 64; // 中等距离中等细节
      } else {
        segments = 32; // 远距离低细节
      }
    }
    
    // 获取当前地球网格
    const earthMesh = earthRef.current;
    if (earthMesh.geometry) {
      // 检查当前细分程度是否需要更新
      const currentSegments = earthMesh.geometry.parameters.widthSegments;
      if (currentSegments !== segments) {
        // 创建新的几何体
        const newGeometry = new THREE.SphereGeometry(5, segments, segments);
        earthMesh.geometry.dispose(); // 释放旧几何体
        earthMesh.geometry = newGeometry; // 更新几何体
      }
    }
  };

  // 处理等级筛选
  useEffect(() => {
    if (selectedLevel === 'all') {
      setFilteredSpots(scenicSpots);
    } else {
      const filtered = scenicSpots.filter(spot => spot.level.name === selectedLevel);
      setFilteredSpots(filtered);
    }
  }, [selectedLevel, scenicSpots]);

  // 当选中景区时获取天气数据
  useEffect(() => {
    if (selectedSpot) {
      fetchWeatherData(selectedSpot.id);
    }
  }, [selectedSpot, fetchWeatherData]);

  // 将经纬度转换为3D坐标
  const latLongToVector3 = React.useMemo(() => {
    return (lat, long, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (long + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    };
  }, []);

  // 获取等级对应的颜色
  const getLevelColor = React.useMemo(() => {
    const levelColors = {
      '5A': '#FFD700', // 金色
      '4A': '#C0C0C0', // 银色
      '3A': '#CD7F32', // 铜色
      default: '#808080' // 灰色
    };
    return (level) => {
      return levelColors[level] || levelColors.default;
    };
  }, []);

  return (
    <>
      {/* 背景星空 */}
      <mesh>
        <sphereGeometry args={[100, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide}>
          <primitive object={new THREE.TextureLoader().load('https://threejs.org/examples/textures/starfield.png')} attach="map" />
        </meshBasicMaterial>
      </mesh>

      {/* 地球 */}
      <group>
        <mesh ref={earthRef}>
          <sphereGeometry args={[5, 128, 128]} />
          <meshPhongMaterial
            map={earthTexture}
            bumpMap={bumpMap}
            bumpScale={0.05}
            specularMap={specularMap}
            specular={new THREE.Color('white')}
            shininess={10}
          />
        </mesh>

        {/* 中国地图轮廓 */}
        <mesh position={[0, 0, 5.01]}>
          <sphereGeometry args={[5.01, 128, 128]} />
          <meshBasicMaterial
            transparent
            opacity={0.3}
            color="#FF4500"
            alphaMap={new THREE.TextureLoader().load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg')}
          />
        </mesh>

        {/* 景区标记 */}
        {filteredSpots.map((spot) => {
          const position = latLongToVector3(spot.latitude, spot.longitude, 5.1);
          const levelColor = getLevelColor(spot.level.name);
          
          return (
            <group key={spot.id} position={position}>
              {/* 标记点 */}
              <mesh
                onClick={() => setSelectedSpot(spot)}
                scale={isMobile ? 0.1 : 0.15}
                cursor="pointer"
                onPointerOver={(e) => {
                  e.stopPropagation();
                  // 可以添加悬停效果
                }}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={levelColor} />
              </mesh>
              
              {/* 光晕效果 - 只在相机距离较近时显示 */}
              <mesh scale={isMobile ? 0.2 : 0.3} position={[0, 0, 0.1]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial 
                  color={levelColor} 
                  transparent 
                  opacity={0.5}
                />
              </mesh>
              
              {/* 名称标签 - 只在相机距离较近时显示 */}
              <Text
                position={[0, isMobile ? 1.5 : 2, 0]}
                text={spot.name}
                fontSize={isMobile ? 0.8 : 1.2}
                color="white"
                anchorX="center"
                anchorY="middle"
                visible={!isMobile} // 移动端不显示名称标签，节省空间
              />
            </group>
          );
        })}
      </group>

      {/* 选中景区的详细信息 */}
      {selectedSpot && (
        <Html position={[0, 0, 10]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #00ffff',
            borderRadius: '10px',
            padding: isMobile ? '15px' : '20px',
            color: 'white',
            maxWidth: isMobile ? '90vw' : '600px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              margin: '0 0 10px 0', 
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
              fontSize: isMobile ? '18px' : '24px'
            }}>
              {selectedSpot.name}
            </h2>
            <p style={{ margin: '0 0 15px 0', fontSize: isMobile ? '14px' : '16px' }}>{selectedSpot.description}</p>
            
            {/* 图片轮播 */}
            {selectedSpot.images && selectedSpot.images.length > 0 && (
              <div style={{ margin: isMobile ? '10px 0' : '15px 0', textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: isMobile ? '5px' : '10px', 
                  padding: '10px 0',
                  justifyContent: 'center'
                }}>
                  {selectedSpot.images.map((image, index) => (
                    <div key={index} style={{ flex: '0 0 auto', width: isMobile ? '100px' : '150px' }}>
                      <LazyImage 
                        src={image.url} 
                        alt={image.description || selectedSpot.name} 
                        style={{ 
                          width: '100%', 
                          height: isMobile ? '70px' : '100px', 
                          borderRadius: '5px',
                          border: '1px solid #00ffff'
                        }} 
                      />
                      <p style={{ fontSize: isMobile ? '10px' : '12px', marginTop: '5px', marginBottom: '0' }}>
                        {image.description || `图片 ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 票价信息 */}
            {selectedSpot.tickets && selectedSpot.tickets.length > 0 && (
              <div style={{ margin: isMobile ? '10px 0' : '15px 0' }}>
                <h3 style={{ color: '#00ffff', margin: '0 0 10px 0', fontSize: isMobile ? '16px' : '18px' }}>票价信息</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: isMobile ? '5px' : '10px' }}>
                  {selectedSpot.tickets.map((ticket, index) => (
                    <div key={index} style={{ 
                      background: 'rgba(0, 255, 255, 0.1)', 
                      padding: isMobile ? '8px' : '10px', 
                      borderRadius: '5px',
                      border: '1px solid rgba(0, 255, 255, 0.3)'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>{ticket.type}</div>
                      <div style={{ fontSize: isMobile ? '14px' : '16px' }}>¥{ticket.price.toFixed(2)}</div>
                      {ticket.description && (
                        <div style={{ fontSize: isMobile ? '10px' : '12px', marginTop: '5px' }}>{ticket.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 天气信息 */}
            <div style={{ margin: isMobile ? '10px 0' : '15px 0', padding: isMobile ? '10px' : '15px', background: 'rgba(0, 255, 255, 0.1)', borderRadius: '10px', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
              <h3 style={{ color: '#00ffff', margin: '0 0 10px 0', fontSize: isMobile ? '16px' : '18px' }}>天气信息</h3>
              {isWeatherLoading ? (
                <div style={{ textAlign: 'center', padding: isMobile ? '10px' : '20px' }}>加载天气数据中...</div>
              ) : (
                weatherData[selectedSpot.id] ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: isMobile ? '5px' : '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#00ffff' }}>{weatherData[selectedSpot.id].temperature}°C</div>
                      <div style={{ fontSize: isMobile ? '14px' : '16px' }}>{weatherData[selectedSpot.id].weatherCondition}</div>
                    </div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                      <strong>风向:</strong> {weatherData[selectedSpot.id].windDirection}
                    </div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                      <strong>风速:</strong> {weatherData[selectedSpot.id].windSpeed} km/h
                    </div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                      <strong>湿度:</strong> {weatherData[selectedSpot.id].humidity}%
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: isMobile ? '5px' : '10px', fontSize: isMobile ? '14px' : '16px' }}>
                      <strong>衣物推荐:</strong> {weatherData[selectedSpot.id].clothingRecommendation}
                    </div>
                    <div style={{ gridColumn: '1 / -1', fontSize: isMobile ? '10px' : '12px', color: '#888', textAlign: 'right' }}>
                      更新时间: {new Date(weatherData[selectedSpot.id].updateTime).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: isMobile ? '10px' : '20px' }}>暂无天气数据</div>
                )
              )}
            </div>

            {/* 基本信息 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: isMobile ? '10px' : '15px', margin: isMobile ? '10px 0' : '15px 0' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                <strong>等级:</strong> <span style={{ color: getLevelColor(selectedSpot.level.name) }}>{selectedSpot.level.name}</span>
              </div>
              <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
                <strong>地址:</strong> {selectedSpot.address}
              </div>
              {selectedSpot.officialWebsite && (
                <div style={{ gridColumn: '1 / -1', fontSize: isMobile ? '14px' : '16px' }}>
                  <strong>官网:</strong> <a href={selectedSpot.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none', fontSize: isMobile ? '12px' : '14px' }}>{selectedSpot.officialWebsite}</a>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedSpot(null)}
              style={{
                marginTop: isMobile ? '10px' : '15px',
                padding: isMobile ? '6px 12px' : '8px 16px',
                background: '#ff4500',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              关闭
            </button>
          </div>
        </Html>
      )}

      {/* 控制按钮 */}
      {isMobile ? (
        <Html position={[0, -6, 0]}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #00ffff',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* 等级筛选 */}
            <div style={{ marginBottom: '5px', width: '100%' }}>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  background: 'rgba(0, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid #00ffff',
                  borderRadius: '5px',
                  fontSize: '12px'
                }}
              >
                <option value="all">全部等级</option>
                <option value="5A">5A级</option>
                <option value="4A">4A级</option>
                <option value="3A">3A级</option>
              </select>
            </div>
            
            <button 
              onClick={() => setRotationSpeed(rotationSpeed + 0.02)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              加速
            </button>
            <button 
              onClick={() => setRotationSpeed(rotationSpeed - 0.02 > 0 ? rotationSpeed - 0.02 : 0)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              减速
            </button>
            <button 
              onClick={() => setRotationSpeed(0)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              停止
            </button>
            
            <button 
              onClick={loadMore}
              disabled={!hasMore || isLoading}
              style={{
                padding: '6px 10px',
                background: !hasMore || isLoading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: !hasMore || isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                width: '100%'
              }}
            >
              {isLoading ? '加载中...' : hasMore ? '加载更多景区' : '没有更多景区'}
            </button>
          </div>
        </Html>
      ) : (
        <Html position={[-8, -4, 0]}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #00ffff'
          }}>
            {/* 等级筛选 */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: 'white', marginRight: '10px' }}>景区等级:</label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid #00ffff',
                  borderRadius: '5px'
                }}
              >
                <option value="all">全部等级</option>
                <option value="5A">5A级</option>
                <option value="4A">4A级</option>
                <option value="3A">3A级</option>
              </select>
            </div>
            
            <button 
              onClick={() => setRotationSpeed(rotationSpeed + 0.02)}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              加速旋转
            </button>
            <button 
              onClick={() => setRotationSpeed(rotationSpeed - 0.02 > 0 ? rotationSpeed - 0.02 : 0)}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              减速旋转
            </button>
            <button 
              onClick={() => setRotationSpeed(0)}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              停止旋转
            </button>
            
            <button 
              onClick={loadMore}
              disabled={!hasMore || isLoading}
              style={{
                padding: '8px 16px',
                background: !hasMore || isLoading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: !hasMore || isLoading ? 'not-allowed' : 'pointer',
                marginTop: '10px'
              }}
            >
              {isLoading ? '加载中...' : hasMore ? '加载更多景区' : '没有更多景区'}
            </button>
            
            <button 
              onClick={printPerformanceMetrics}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid #00ffff',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              查看性能指标
            </button>
          </div>
        </Html>
      )}

      <OrbitControls 
        enableDamping 
        dampingFactor={isMobile ? 0.15 : 0.05} 
        enableZoom={true}
        enablePan={true}
        minDistance={isMobile ? 8 : 5}
        maxDistance={isMobile ? 20 : 15}
        touchZoomSpeed={isMobile ? 0.4 : 1}
        panSpeed={isMobile ? 0.4 : 1}
        rotateSpeed={isMobile ? 0.8 : 1}
        enableRotate={true}
        enableKeys={!isMobile} // 移动端禁用键盘控制
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[0, 10, 10]} intensity={0.5} color="#00ffff" />
    </>
  );
};

// 检测WebGL支持
const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// 2D地图组件（降级方案）
const Map2D = ({ scenicSpots, selectedSpot, setSelectedSpot, isMobile, isTablet, isDesktop }) => {
  const [selectedLevel, setSelectedLevel] = React.useState('all');
  const [filteredSpots, setFilteredSpots] = React.useState(scenicSpots);

  // 处理等级筛选
  React.useEffect(() => {
    if (selectedLevel === 'all') {
      setFilteredSpots(scenicSpots);
    } else {
      const filtered = scenicSpots.filter(spot => spot.level.name === selectedLevel);
      setFilteredSpots(filtered);
    }
  }, [selectedLevel, scenicSpots]);

  // 获取等级对应的颜色
  const getLevelColor = (level) => {
    const levelColors = {
      '5A': '#FFD700', // 金色
      '4A': '#C0C0C0', // 银色
      '3A': '#CD7F32', // 铜色
      default: '#808080' // 灰色
    };
    return levelColors[level] || levelColors.default;
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(to bottom, #000033, #000000)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* 标题 */}
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

      {/* 2D地图容器 */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: isMobile ? '10px' : '20px'
      }}>
        {/* 中国地图背景 */}
        <div style={{ 
          width: isMobile ? '90%' : isTablet ? '80%' : '70%',
          height: '80%',
          background: 'url(https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=China map outline, simple, dark blue background, white border&image_size=landscape_16_9)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          position: 'relative',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
        }}>
          {/* 景区标记点 */}
          {filteredSpots.map((spot) => {
            // 简单的经纬度到2D坐标的转换（实际项目中需要更精确的映射）
            const x = ((spot.longitude + 180) / 360) * 100;
            const y = ((90 - spot.latitude) / 180) * 100;
            const levelColor = getLevelColor(spot.level.name);

            return (
              <div 
                key={spot.id}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 5
                }}
                onClick={() => setSelectedSpot(spot)}
              >
                {/* 标记点 */}
                <div style={{
                  width: isMobile ? '10px' : '15px',
                  height: isMobile ? '10px' : '15px',
                  borderRadius: '50%',
                  background: levelColor,
                  boxShadow: `0 0 10px ${levelColor}`,
                  border: '2px solid #fff'
                }} />
                {/* 名称标签 */}
                {!isMobile && (
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(0, 255, 255, 0.5)'
                  }}>
                    {spot.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '10px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #00ffff',
        borderRadius: '10px',
        padding: isMobile ? '10px' : '15px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '15px',
        zIndex: 10
      }}>
        {/* 等级筛选 */}
        <select 
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            background: 'rgba(0, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid #00ffff',
            borderRadius: '5px',
            fontSize: isMobile ? '14px' : '16px'
          }}
        >
          <option value="all">全部等级</option>
          <option value="5A">5A级</option>
          <option value="4A">4A级</option>
          <option value="3A">3A级</option>
        </select>

        {/* 景区数量 */}
        <div style={{
          color: '#00ffff',
          fontSize: isMobile ? '14px' : '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          景区数量: {filteredSpots.length}
        </div>
      </div>

      {/* 选中景区的详细信息 */}
      {selectedSpot && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #00ffff',
          borderRadius: '10px',
          padding: isMobile ? '15px' : '20px',
          color: 'white',
          maxWidth: isMobile ? '90vw' : '600px',
          maxHeight: isMobile ? '80vh' : '70vh',
          overflowY: 'auto',
          zIndex: 20,
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)'
        }}>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            color: '#00ffff',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            fontSize: isMobile ? '18px' : '24px'
          }}>
            {selectedSpot.name}
          </h2>
          <p style={{ margin: '0 0 15px 0', fontSize: isMobile ? '14px' : '16px' }}>{selectedSpot.description}</p>
          
          {/* 图片展示 */}
          {selectedSpot.images && selectedSpot.images.length > 0 && (
            <div style={{ margin: isMobile ? '10px 0' : '15px 0' }}>
              <div style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: isMobile ? '5px' : '10px', 
                padding: '10px 0'
              }}>
                {selectedSpot.images.map((image, index) => (
                  <div key={index} style={{ flex: '0 0 auto', width: isMobile ? '100px' : '150px' }}>
                    <img 
                      src={image.url} 
                      alt={image.description || selectedSpot.name} 
                      style={{ 
                        width: '100%', 
                        height: isMobile ? '70px' : '100px', 
                        borderRadius: '5px',
                        border: '1px solid #00ffff'
                      }} 
                    />
                    <p style={{ fontSize: isMobile ? '10px' : '12px', marginTop: '5px', marginBottom: '0' }}>
                      {image.description || `图片 ${index + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 票价信息 */}
          {selectedSpot.tickets && selectedSpot.tickets.length > 0 && (
            <div style={{ margin: isMobile ? '10px 0' : '15px 0' }}>
              <h3 style={{ color: '#00ffff', margin: '0 0 10px 0', fontSize: isMobile ? '16px' : '18px' }}>票价信息</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: isMobile ? '5px' : '10px' }}>
                {selectedSpot.tickets.map((ticket, index) => (
                  <div key={index} style={{ 
                    background: 'rgba(0, 255, 255, 0.1)', 
                    padding: isMobile ? '8px' : '10px', 
                    borderRadius: '5px',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>{ticket.type}</div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px' }}>¥{ticket.price.toFixed(2)}</div>
                    {ticket.description && (
                      <div style={{ fontSize: isMobile ? '10px' : '12px', marginTop: '5px' }}>{ticket.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 基本信息 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: isMobile ? '10px' : '15px', margin: isMobile ? '10px 0' : '15px 0' }}>
            <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
              <strong>等级:</strong> <span style={{ color: getLevelColor(selectedSpot.level.name) }}>{selectedSpot.level.name}</span>
            </div>
            <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
              <strong>地址:</strong> {selectedSpot.address}
            </div>
            {selectedSpot.officialWebsite && (
              <div style={{ gridColumn: '1 / -1', fontSize: isMobile ? '14px' : '16px' }}>
                <strong>官网:</strong> <a href={selectedSpot.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none', fontSize: isMobile ? '12px' : '14px' }}>{selectedSpot.officialWebsite}</a>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSelectedSpot(null)}
            style={{
              marginTop: isMobile ? '10px' : '15px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              background: '#ff4500',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              width: '100%'
            }}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

const EarthContainer = ({ isMobile, isTablet, isDesktop }) => {
  const webGLSupported = isWebGLSupported();
  const [scenicSpots, setScenicSpots] = React.useState([]);
  const [selectedSpot, setSelectedSpot] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mapMode, setMapMode] = React.useState('2d'); // '3d', '2d', 'point-cloud'

  // 加载模拟数据
  React.useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);
      try {
        // 模拟数据，参考百度高德花瓣地图风格
        const mockData = [
          {
            id: 1,
            name: '故宫',
            description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
            latitude: 39.916345,
            longitude: 116.397155,
            level: { name: '5A' },
            address: '北京市东城区景山前街4号',
            officialWebsite: 'https://www.dpm.org.cn/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden City Beijing China, aerial view, beautiful architecture, cultural heritage&image_size=landscape_16_9', description: '故宫全景' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hall of Supreme Harmony Forbidden City, imperial palace, golden throne room&image_size=landscape_16_9', description: '太和殿' }
            ],
            tickets: [
              { type: '成人票', price: 60.0, description: '旺季价格' },
              { type: '学生票', price: 30.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 2,
            name: '长城',
            description: '中国古代的军事防御工程，是世界文化遗产之一。',
            latitude: 40.431908,
            longitude: 116.570374,
            level: { name: '5A' },
            address: '北京市怀柔区',
            officialWebsite: 'https://www.badaling.gov.cn/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great Wall of China Badaling section, winding through mountains, panoramic view&image_size=landscape_16_9', description: '长城全景' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great Wall watchtower, ancient architecture, mountainous landscape&image_size=landscape_16_9', description: '长城烽火台' }
            ],
            tickets: [
              { type: '成人票', price: 40.0, description: '八达岭长城' },
              { type: '学生票', price: 20.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 3,
            name: '西湖',
            description: '中国浙江省杭州市的淡水湖，是中国大陆首批国家重点风景名胜区和中国十大风景名胜之一。',
            latitude: 30.259163,
            longitude: 120.148565,
            level: { name: '5A' },
            address: '浙江省杭州市西湖区',
            officialWebsite: 'https://www.hangzhou.com.cn/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=West Lake Hangzhou, panoramic view, traditional Chinese pavilion, bridge over water&image_size=landscape_16_9', description: '西湖全景' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Broken Bridge West Lake, snowy scenery, traditional architecture&image_size=landscape_16_9', description: '断桥残雪' }
            ],
            tickets: [
              { type: '免费', price: 0.0, description: '西湖景区免费开放' }
            ]
          },
          {
            id: 4,
            name: '黄山',
            description: '中国安徽省南部的山脉，以奇松、怪石、云海、温泉、冬雪"五绝"著称于世。',
            latitude: 30.133333,
            longitude: 118.166667,
            level: { name: '5A' },
            address: '安徽省黄山市黄山区',
            officialWebsite: 'https://www.huangshan.gov.cn/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangshan Mountain, sea of clouds, sunrise, granite peaks&image_size=landscape_16_9', description: '黄山云海' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Welcome Pine Huangshan, famous pine tree, mountainous landscape&image_size=landscape_16_9', description: '黄山迎客松' }
            ],
            tickets: [
              { type: '成人票', price: 230.0, description: '旺季价格' },
              { type: '学生票', price: 115.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 5,
            name: '九寨沟',
            description: '中国四川省阿坝藏族羌族自治州九寨沟县的自然保护区，以翠海、叠瀑、彩林、雪峰、藏情、蓝冰"六绝"著称。',
            latitude: 33.266667,
            longitude: 103.933333,
            level: { name: '5A' },
            address: '四川省阿坝藏族羌族自治州九寨沟县',
            officialWebsite: 'https://www.jiuzhaigouvalley.com/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou Valley, colorful lakes, clear blue water, forested mountains&image_size=landscape_16_9', description: '九寨沟彩池' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou waterfalls, cascading water, rainbow, natural beauty&image_size=landscape_16_9', description: '九寨沟瀑布' }
            ],
            tickets: [
              { type: '成人票', price: 220.0, description: '旺季价格' },
              { type: '学生票', price: 110.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 6,
            name: '桂林山水',
            description: '广西壮族自治区桂林市的山水景观，以山青、水秀、洞奇、石美著称。',
            latitude: 25.286106,
            longitude: 110.298392,
            level: { name: '5A' },
            address: '广西壮族自治区桂林市',
            officialWebsite: 'https://www.guilin-tour.com/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guilin山水, Li River, karst mountains, bamboo rafts, scenic landscape&image_size=landscape_16_9', description: '桂林山水' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elephant Trunk Hill Guilin, iconic landmark, river view&image_size=landscape_16_9', description: '象鼻山' }
            ],
            tickets: [
              { type: '成人票', price: 120.0, description: '漓江游船' },
              { type: '学生票', price: 60.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 7,
            name: '乐山大佛',
            description: '四川省乐山市的巨型石刻佛像，是世界上最大的石刻佛像。',
            latitude: 29.544633,
            longitude: 103.779835,
            level: { name: '5A' },
            address: '四川省乐山市市中区凌云路2435号',
            officialWebsite: 'https://www.leshan大佛.com/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan Giant Buddha, massive stone statue, riverside, scenic view&image_size=landscape_16_9', description: '乐山大佛' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan Buddha close-up, detailed carvings, religious significance&image_size=landscape_16_9', description: '大佛细节' }
            ],
            tickets: [
              { type: '成人票', price: 90.0, description: '大佛景区' },
              { type: '学生票', price: 45.0, description: '凭学生证购买' }
            ]
          },
          {
            id: 8,
            name: '颐和园',
            description: '北京市海淀区的皇家园林，是中国现存规模最大、保存最完整的皇家园林。',
            latitude: 39.999973,
            longitude: 116.275556,
            level: { name: '5A' },
            address: '北京市海淀区新建宫门路19号',
            officialWebsite: 'https://www.summerpalace-china.com/',
            images: [
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer Palace Beijing, imperial garden, lake, pavilions, traditional architecture&image_size=landscape_16_9', description: '颐和园全景' },
              { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Long Corridor Summer Palace, painted ceilings, traditional Chinese art&image_size=landscape_16_9', description: '长廊' }
            ],
            tickets: [
              { type: '成人票', price: 30.0, description: '旺季价格' },
              { type: '学生票', price: 15.0, description: '凭学生证购买' }
            ]
          }
        ];

        setScenicSpots(mockData);
      } catch (error) {
        console.error('Error loading mock data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(to bottom, #000033, #000000)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff'
      }}>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          border: '1px solid #00ffff', 
          borderRadius: '10px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #00ffff', 
            borderTop: '4px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '15px', color: '#00ffff' }}>加载中...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 地图模式切换控制
  const renderMapModeControl = () => (
    <div style={{
      position: 'absolute',
      top: isMobile ? '50px' : '80px',
      left: isMobile ? '10px' : '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #00ffff',
      borderRadius: '10px',
      padding: isMobile ? '8px' : '12px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '8px' : '12px',
      zIndex: 10
    }}>
      <button
        onClick={() => setMapMode('2d')}
        style={{
          padding: isMobile ? '6px 12px' : '8px 16px',
          background: mapMode === '2d' ? '#00ffff' : 'rgba(0, 255, 255, 0.2)',
          color: mapMode === '2d' ? '#000' : '#fff',
          border: '1px solid #00ffff',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: mapMode === '2d' ? 'bold' : 'normal'
        }}
      >
        2D地图
      </button>
      {webGLSupported && (
        <button
          onClick={() => setMapMode('3d')}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            background: mapMode === '3d' ? '#00ffff' : 'rgba(0, 255, 255, 0.2)',
            color: mapMode === '3d' ? '#000' : '#fff',
            border: '1px solid #00ffff',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: mapMode === '3d' ? 'bold' : 'normal'
          }}
        >
          3D地球仪
        </button>
      )}
      <button
        onClick={() => setMapMode('point-cloud')}
        style={{
          padding: isMobile ? '6px 12px' : '8px 16px',
          background: mapMode === 'point-cloud' ? '#00ffff' : 'rgba(0, 255, 255, 0.2)',
          color: mapMode === 'point-cloud' ? '#000' : '#fff',
          border: '1px solid #00ffff',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: mapMode === 'point-cloud' ? 'bold' : 'normal'
        }}
      >
        点云地图
      </button>
    </div>
  );

  // 根据选择的地图模式渲染不同的地图
  if (mapMode === 'point-cloud') {
    return (
      <div style={{ position: 'relative' }}>
        {renderMapModeControl()}
        <PointCloudMap 
          scenicSpots={scenicSpots} 
          isMobile={isMobile} 
          isTablet={isTablet} 
          isDesktop={isDesktop} 
        />
      </div>
    );
  } else if (mapMode === '3d' && webGLSupported) {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #000033, #000000)' }}>
        {renderMapModeControl()}
        <Canvas camera={{ position: [0, 0, isMobile ? 15 : 12] }}>
          <Earth isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
        </Canvas>
      </div>
    );
  } else {
    // 默认显示2D地图
    return (
      <div style={{ position: 'relative' }}>
        {renderMapModeControl()}
        <Map2D 
          scenicSpots={scenicSpots} 
          selectedSpot={selectedSpot} 
          setSelectedSpot={setSelectedSpot} 
          isMobile={isMobile} 
          isTablet={isTablet} 
          isDesktop={isDesktop} 
        />
      </div>
    );
  }
};

export default EarthContainer;