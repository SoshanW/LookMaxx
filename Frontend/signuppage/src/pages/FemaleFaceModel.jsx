import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useFBX } from '@react-three/drei';

function Model() {
  // Note: The path is relative to the public directory
  const fbx = useFBX('/models/face.fbx');
  return <primitive object={fbx} scale={0.01} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
}

const FemaleFaceModel = () => {
  return (
    <div className="h-screen w-full bg-gray-100">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[2.5, 8, 5]}
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <Model />
        </Suspense>
      </Canvas>

      
    </div>
  );
};

export default FemaleFaceModel;