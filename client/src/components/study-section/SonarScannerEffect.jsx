// src/components/SonarScannerEffect.jsx
import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SonarScannerEffect = ({ active = false, color = "#a94dff", scale = 1, speed = 1 }) => {
  const scannerRef = useRef()
  const materialRef = useRef()
  
  useFrame((_, delta) => {
    if (scannerRef.current && active) {
      // Rotate the scanner
      scannerRef.current.rotation.z -= delta * speed * 2
      
      // Pulse opacity for scanner effect
      if (materialRef.current) {
        materialRef.current.opacity = 0.6 + Math.sin(Date.now() * 0.005) * 0.4
      }
    }
  })
  
  if (!active) return null
  
  return (
    <group scale={[scale, scale, scale]}>
      {/* Sonar scanner line */}
      <mesh ref={scannerRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.4, 0.02]} />
        <meshBasicMaterial 
          ref={materialRef}
          color={color} 
          transparent 
          opacity={0.8} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Background circle */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[0.15, 0.16, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

SonarScannerEffect.propTypes = {
  active: PropTypes.bool,
  color: PropTypes.string,
  scale: PropTypes.number,
  speed: PropTypes.number
}

export default SonarScannerEffect