import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const StarField = ({ isMobile, isTablet, isDesktop }) => {
  const starsRef = useRef();
  const starsGeometry = useRef();

  // 创建星空粒子
  useEffect(() => {
    if (!starsGeometry.current) return;

    const stars = starsGeometry.current;
    const positions = stars.attributes.position.array;
    const colors = stars.attributes.color.array;

    // 生成随机星星
    for (let i = 0; i < positions.length; i += 3) {
      // 随机位置
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;

      // 随机颜色
      const intensity = Math.random();
      colors[i] = intensity;
      colors[i + 1] = intensity;
      colors[i + 2] = intensity;
    }

    stars.attributes.position.needsUpdate = true;
    stars.attributes.color.needsUpdate = true;
  }, []);

  // 星星动画
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.x += delta * 0.01;
      starsRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <>
      {/* 星空背景 */}
      <mesh ref={starsRef}>
        <pointsGeometry ref={starsGeometry} count={10000}>
          <bufferAttribute
            attach="attributes-position"
            count={10000 * 3}
            array={new Float32Array(10000 * 3)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={10000 * 3}
            array={new Float32Array(10000 * 3)}
            itemSize={3}
          />
        </pointsGeometry>
        <pointsMaterial
          size={0.2}
          sizeAttenuation
          transparent
          opacity={0.8}
          vertexColors
        />
      </mesh>

      {/* 银河效果 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[80, 64, 64]} />
        <meshBasicMaterial
          transparent
          opacity={0.2}
          color="#87CEEB"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 北极星 */}
      <mesh position={[0, 80, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.5} />
      </mesh>

      {/* 星座连线 */}
      <group>
        {/* 大熊星座 */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                20, 50, 30,
                25, 40, 40,
                30, 35, 35,
                35, 45, 25,
                40, 55, 30,
                45, 65, 20,
                50, 70, 15
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </line>

        {/* 猎户座 */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                -30, -20, 40,
                -20, -10, 45,
                -10, 0, 50,
                0, -15, 40,
                10, 0, 50,
                20, -10, 45,
                30, -20, 40
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FF6347" transparent opacity={0.5} />
        </line>
      </group>

      {/* 控制提示 */}
      <Html position={[0, -80, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #00ffff',
          borderRadius: '10px',
          padding: '15px',
          color: 'white',
          fontSize: isMobile ? '12px' : '14px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ffff' }}>星图模式</h3>
          <p>使用鼠标拖动旋转星图，滚轮缩放</p>
          <p>点击左上角切换回其他地图模式</p>
        </div>
      </Html>

      <OrbitControls 
        enableDamping 
        dampingFactor={0.1} 
        enableZoom={true}
        enablePan={true}
        minDistance={20}
        maxDistance={150}
        enableRotate={true}
        enableKeys={!isMobile}
      />
      <ambientLight intensity={0.2} />
      <pointLight position={[100, 100, 100]} intensity={0.5} />
    </>
  );
};

const StarMap = ({ isMobile, isTablet, isDesktop }) => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'black'
    }}>
      <Canvas camera={{ position: [0, 0, 50] }}>
        <StarField isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
      </Canvas>
    </div>
  );
};

export default StarMap;