import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model() {
  const modelRef = useRef();
  const { scene } = useGLTF('/model.glb');
  
  useFrame(({ mouse }) => {
    const rotationSpeed = 0.1;
    if (modelRef.current) {
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        mouse.x * Math.PI * 0.5,
        rotationSpeed
      );
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        mouse.y * Math.PI * 0.2,
        rotationSpeed
      );
    }
  });

  return <primitive ref={modelRef} object={scene} scale={8} position={[0, -1, 0]} />;
}

export default function Model3D() {
  return (
    <div className="model-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}