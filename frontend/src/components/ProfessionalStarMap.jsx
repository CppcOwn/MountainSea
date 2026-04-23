import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// 模拟城市坐标数据
const cityData = [
  { name: '北京', lat: 39.9042, lng: 116.4074, population: 2154.2, color: '#FF0000' },
  { name: '上海', lat: 31.2304, lng: 121.4737, population: 2424.1, color: '#FFA500' },
  { name: '广州', lat: 23.1291, lng: 113.2644, population: 1530.6, color: '#FFFF00' },
  { name: '深圳', lat: 22.5431, lng: 114.0579, population: 1343.9, color: '#00FF00' },
  { name: '成都', lat: 30.5728, lng: 104.0668, population: 1633.0, color: '#00FFFF' },
  { name: '杭州', lat: 30.2741, lng: 120.1551, population: 1036.0, color: '#0000FF' },
  { name: '武汉', lat: 30.5928, lng: 114.3055, population: 1121.2, color: '#800080' },
  { name: '西安', lat: 34.3416, lng: 108.9398, population: 1295.3, color: '#FF00FF' },
  { name: '南京', lat: 32.0603, lng: 118.7969, population: 850.0, color: '#FF6347' },
  { name: '重庆', lat: 29.4316, lng: 106.9123, population: 3124.3, color: '#4682B4' }
];

// 模拟恒星数据
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const ra = Math.random() * 360;
    const dec = Math.random() * 180 - 90;
    const distance = Math.random() * 100;
    const magnitude = Math.random() * 6;
    
    // 转换为笛卡尔坐标
    const phi = (90 - dec) * Math.PI / 180;
    const theta = (ra + 180) * Math.PI / 180;
    
    const x = -distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.sin(theta);
    
    // 根据星等计算亮度和大小
    const brightness = Math.max(0.1, 1 - magnitude / 6);
    const size = Math.max(0.1, (6 - magnitude) / 3);
    
    // 随机颜色（模拟恒星光谱类型）
    const colors = ['#FFFFFF', '#F8F8FF', '#FFFACD', '#FFE4B5', '#FFD700', '#FFA500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    stars.push({
      id: i,
      position: [x, y, z],
      brightness,
      size,
      color
    });
  }
  return stars;
};

// 星座数据（简化版）
const constellations = [
  {
    name: '大熊座',
    stars: [
      [10, 50, 30],
      [15, 40, 40],
      [20, 35, 35],
      [25, 45, 25],
      [30, 55, 30],
      [35, 65, 20],
      [40, 70, 15]
    ],
    color: '#FFFFFF'
  },
  {
    name: '猎户座',
    stars: [
      [-20, -10, 40],
      [-10, 0, 45],
      [0, -15, 40],
      [10, 0, 45],
      [20, -10, 40]
    ],
    color: '#FF6347'
  },
  {
    name: '天鹅座',
    stars: [
      [30, 20, 30],
      [35, 15, 35],
      [40, 10, 40],
      [45, 15, 35],
      [50, 20, 30]
    ],
    color: '#87CEEB'
  }
];

const StarField = ({ isMobile, isTablet, isDesktop }) => {
  const starsRef = useRef();
  const citiesRef = useRef();
  const constellationsRef = useRef();
  
  // 生成恒星数据
  const stars = generateStars(5000);
  
  // 转换城市经纬度到3D坐标
  const cityPositions = cityData.map(city => {
    const phi = (90 - city.lat) * Math.PI / 180;
    const theta = (city.lng + 180) * Math.PI / 180;
    const radius = 10; // 地球半径
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return {
      ...city,
      position: [x, y, z]
    };
  });

  // 星图旋转动画
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.005;
    }
    if (citiesRef.current) {
      citiesRef.current.rotation.y += delta * 0.005;
    }
    if (constellationsRef.current) {
      constellationsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <>
      {/* 背景星空 */}
      <group ref={starsRef}>
        {stars.map(star => (
          <mesh key={star.id} position={star.position}>
            <sphereGeometry args={[star.size * 0.1, 8, 8]} />
            <meshBasicMaterial 
              color={star.color} 
              transparent 
              opacity={star.brightness}
              emissive={star.color}
              emissiveIntensity={star.brightness * 0.5}
            />
          </mesh>
        ))}
      </group>

      {/* 星座连线 */}
      <group ref={constellationsRef}>
        {constellations.map((constellation, index) => (
          <line key={index}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array(constellation.stars.flat())}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={constellation.color} 
              transparent 
              opacity={0.5}
            />
          </line>
        ))}
      </group>

      {/* 城市标记 */}
      <group ref={citiesRef}>
        {cityPositions.map((city, index) => (
          <group key={index} position={city.position}>
            {/* 城市标记点 */}
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial 
                color={city.color}
                emissive={city.color}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* 城市名称 */}
            {!isMobile && (
              <Text
                position={[0, 0.3, 0]}
                text={city.name}
                fontSize={0.2}
                color={city.color}
                anchorX="center"
                anchorY="middle"
              />
            )}
          </group>
        ))}
      </group>

      {/* 控制提示 */}
      <Html position={[0, -15, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #00ffff',
          borderRadius: '10px',
          padding: '15px',
          color: 'white',
          fontSize: isMobile ? '12px' : '14px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ffff' }}>专业星图</h3>
          <p>使用鼠标拖动旋转星图，滚轮缩放</p>
          <p>彩色标记为中国主要城市</p>
          <p>白色连线为星座</p>
        </div>
      </Html>

      <OrbitControls 
        enableDamping 
        dampingFactor={0.1} 
        enableZoom={true}
        enablePan={true}
        minDistance={5}
        maxDistance={50}
        enableRotate={true}
        enableKeys={!isMobile}
      />
      <ambientLight intensity={0.1} />
    </>
  );
};

const ProfessionalStarMap = ({ isMobile, isTablet, isDesktop }) => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'black',
      position: 'relative'
    }}>
      {/* 简单的控制栏 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: 'rgba(0, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid #00ffff',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          重置视图
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 20] }}>
        <StarField isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
      </Canvas>
    </div>
  );
};

export default ProfessionalStarMap;