// src/components/study-section/TunnelEffect.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

const TunnelEffect = ({ color = "#a94dff", bgColor = "#141414" }) => {
  const tunnelRef = useRef();
  const materialRef = useRef();
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // Setup uniforms for shader
  const uniforms = useRef({
    uSmoothness: { value: 1.0 },
    uGridDensity: { value: 26.0 },
    uNoiseScale: { value: 10.0 },
    uNoiseSpeed: { value: 0.5 },
    uNoiseStrength: { value: 0.15 },
    uEnableDisplacement: { value: false },
    uTime: { value: 0.0 },
    uWireColor: { value: new THREE.Color(color) },
    uBaseColor: { value: new THREE.Color(bgColor) }
  });

  // Setup mouse movement handler for subtle effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Animation frame
  useFrame((_, delta) => {
    // Update shader time uniform for animation
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += 0.01;
    }
    
    // Animate tunnel movement
    progressRef.current += delta * 0.05; // Control speed here
    
    // Apply subtle mouse-based movement
    if (tunnelRef.current) {
      const mouseInfluence = 0.3;
      tunnelRef.current.position.x = mouseRef.current.x * mouseInfluence;
      tunnelRef.current.position.y = mouseRef.current.y * mouseInfluence;
      tunnelRef.current.position.z = -progressRef.current % 10; // Loop when we reach a certain distance
    }
  });

  // Create wireframe shader material
  const WireframeMaterial = () => {
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms.current,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uSmoothness;
        uniform float uGridDensity;
        uniform float uNoiseScale;
        uniform float uNoiseSpeed;
        uniform float uNoiseStrength;
        uniform bool uEnableDisplacement;
        uniform float uTime;
        uniform vec3 uWireColor;
        uniform vec3 uBaseColor;

        varying vec2 vUv;

        // Simple Perlin Noise Function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // Generate grid lines
          vec2 grid = abs(fract(vUv * uGridDensity - 0.5) - 0.5);
          vec2 gridWidth = fwidth(vUv * uGridDensity);
          float lineX = smoothstep(0.0, gridWidth.x * uSmoothness, grid.x);
          float lineY = smoothstep(0.0, gridWidth.y * uSmoothness, grid.y);
          float line = 1.0 - min(lineX, lineY);

          // Perlin noise for displacement
          float noiseValue = 0.0;
          if (uEnableDisplacement) {
            noiseValue = noise(vUv * uNoiseScale + uTime * uNoiseSpeed) * uNoiseStrength;
          }

          // Combine base color and wireframe with noise distortion
          vec3 finalColor = mix(uBaseColor, uWireColor, line);
          finalColor += noiseValue;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    
    materialRef.current = material;
    return material;
  };

  return (
    <group ref={tunnelRef} position={[0, 0, -20]} rotation={[0, 0, 0]}>
      {/* Multiple tube segments to create infinite tunnel effect */}
      {[...Array(3)].map((_, index) => (
        <mesh key={`tunnel-${index}`} position={[0, 0, index * -30]}>
          <cylinderGeometry args={[15, 15, 60, 32, 20, true]} />
          <primitive object={WireframeMaterial()} />
        </mesh>
      ))}
    </group>
  );
};

export default TunnelEffect;