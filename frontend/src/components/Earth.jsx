import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, SpriteText } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

const Earth = () => {
  const [scenicSpots, setScenicSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const earthRef = useRef();

  // 加载地球纹理
  const textureLoader = useLoader(THREE.TextureLoader);
  const earthTexture = textureLoader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
  const bumpMap = textureLoader.load('https://threejs.org/examples/textures/earth_bump.jpg');

  // 从后端获取景区数据
  useEffect(() => {
    const fetchScenicSpots = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/scenic-spots');
        setScenicSpots(response.data);
      } catch (error) {
        console.error('Failed to fetch scenic spots:', error);
      }
    };

    fetchScenicSpots();
  }, []);

  // 地球旋转动画
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  // 将经纬度转换为3D坐标
  const latLongToVector3 = (lat, long, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  };

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specular={new THREE.Color('grey')}
        />
      </mesh>

      {/* 景区标记 */}
      {scenicSpots.map((spot) => {
        const position = latLongToVector3(spot.latitude, spot.longitude, 5.1);
        return (
          <group key={spot.id} position={position}>
            <mesh
              onClick={() => setSelectedSpot(spot)}
              scale={0.1}
              cursor="pointer"
            >
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={spot.level.name === '5A' ? 'gold' : spot.level.name === '4A' ? 'silver' : 'bronze'} />
            </mesh>
            <SpriteText
              position={[0, 2, 0]}
              text={spot.name}
              fontSize={1}
              color="white"
            />
          </group>
        );
      })}

      {/* 选中景区的详细信息 */}
      {selectedSpot && (
        <group position={[0, 0, 10]}>
          <Text
            position={[0, 2, 0]}
            fontSize={1.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {selectedSpot.name}
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {selectedSpot.description}
          </Text>
          <Text
            position={[0, -2, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            等级: {selectedSpot.level.name}
          </Text>
          <Text
            position={[0, -3, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            地址: {selectedSpot.address}
          </Text>
          <mesh
            onClick={() => setSelectedSpot(null)}
            position={[3, 3, 0]}
            scale={0.5}
            cursor="pointer"
          >
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="red" />
            <Text
              position={[0, 0, 0.1]}
              fontSize={1.5}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              ×
            </Text>
          </mesh>
        </group>
      )}

      <OrbitControls enableDamping dampingFactor={0.05} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
};

const EarthContainer = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <Earth />
      </Canvas>
    </div>
  );
};

export default EarthContainer;