// src/components/HumanHeadModel.jsx
import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'

const HumanHeadModel = ({ initialPosition, selectedFeature, featureData, onAnimationComplete, onFeatureClick }) => {
  const headRef = useRef()
  const { nodes } = useGLTF('/models/humanHead.glb')

  const metallicMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#bfcbff'),
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  })

  const resetHeadPosition = () => {
    if (!headRef.current) return
    
    // Create a single timeline for reset to ensure animations are synchronized
    const tl = gsap.timeline()
    
    tl.to(headRef.current.position, {
      duration: 1,
      x: initialPosition.position[0],
      y: initialPosition.position[1],
      z: initialPosition.position[2],
      ease: "power3.inOut"
    }, 0)
    
    tl.to(headRef.current.rotation, {
      duration: 1,
      x: initialPosition.rotation[0],
      y: initialPosition.rotation[1],
      z: initialPosition.rotation[2],
      ease: "power3.inOut"
    }, 0)
    
    tl.to(headRef.current.scale, {
      duration: 1,
      x: initialPosition.scale,
      y: initialPosition.scale,
      z: initialPosition.scale,
      ease: "power3.inOut"
    }, 0)
  }

  // Animate head when feature is selected
  useEffect(() => {
    // Skip if ref isn't ready
    if (!headRef.current) return
    
    // Clear any existing GSAP animations to prevent conflicts
    gsap.killTweensOf(headRef.current.position)
    gsap.killTweensOf(headRef.current.rotation)
    gsap.killTweensOf(headRef.current.scale)
    
    if (selectedFeature) {
      const { view } = featureData[selectedFeature]
      
      const tl = gsap.timeline({
        onComplete: onAnimationComplete
      })
      
      // Run all animations in parallel from position 0 on the timeline
      tl.to(headRef.current.position, {
        duration: 0.8,
        x: view.position[0],
        y: view.position[1],
        z: view.position[2],
        ease: "power4.out"
      }, 0)
      
      tl.to(headRef.current.rotation, {
        duration: 0.8,
        x: view.rotation[0],
        y: view.rotation[1],
        z: view.rotation[2],
        ease: "power4.out"
      }, 0)
      
      tl.to(headRef.current.scale, {
        duration: 0.8,
        x: view.scale,
        y: view.scale,
        z: view.scale,
        ease: "back.out(1.2)"
      }, 0)
    } else {
      resetHeadPosition()
    }
  }, [selectedFeature, featureData, onAnimationComplete])

  return (
    <group ref={headRef}>
      {/* Head model */}
      <group position={[-0.003, 1.279, -0.051]} rotation={[Math.PI / 2, 0, 0.227]} scale={0.249}>
        {[...Array(4)].map((_, index) => (
          <mesh
            key={`head-part-${index}`}
            castShadow
            receiveShadow
            geometry={nodes[`Object_${index + 4}`].geometry}
            material={metallicMaterial}
          />
        ))}
      </group>
      
      {/* Feature spheres - now included inside the head group */}
      {Object.entries(featureData).map(([feature, data]) => (
        <mesh
          key={feature}
          position={data.spherePos}
          onClick={(e) => {
            e.stopPropagation()
            onFeatureClick(feature)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            e.object.scale.set(1.2, 1.2, 1.2)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            e.object.scale.set(1, 1, 1)
          }}
        >
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial 
            color="#a94dff" 
            emissive="#a94dff" 
            emissiveIntensity={selectedFeature === feature ? 0.8 : 0.3} 
          />
        </mesh>
      ))}
    </group>
  )
}

HumanHeadModel.propTypes = {
  initialPosition: PropTypes.shape({
    position: PropTypes.array.isRequired,
    rotation: PropTypes.array.isRequired,
    scale: PropTypes.number.isRequired
  }).isRequired,
  selectedFeature: PropTypes.string,
  featureData: PropTypes.object.isRequired,
  onAnimationComplete: PropTypes.func.isRequired,
  onFeatureClick: PropTypes.func.isRequired
}

useGLTF.preload('/models/humanHead.glb')

export default HumanHeadModel