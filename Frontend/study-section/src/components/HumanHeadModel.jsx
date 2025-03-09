// src/components/HumanHeadModel.jsx
import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'

const HumanHeadModel = ({ initialPosition, selectedFeature, featureData, onAnimationComplete, onFeatureClick }) => {
  const headRef = useRef()
  const sphereRefs = useRef({})
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

  // Animate feature spheres when feature selection changes
  useEffect(() => {
    // Animate all spheres based on selection state
    Object.entries(featureData).forEach(([feature, data]) => {
      const sphereRef = sphereRefs.current[feature]
      if (!sphereRef) return
      
      // Reset any existing animations
      gsap.killTweensOf(sphereRef.scale)
      gsap.killTweensOf(sphereRef.material)
      
      if (selectedFeature === feature) {
        // Selected sphere - pulse animation
        gsap.to(sphereRef.scale, {
          x: 1.5,
          y: 1.5,
          z: 1.5,
          duration: 0.5,
          ease: "back.out(1.7)"
        })
        
        // Increase emissive intensity
        gsap.to(sphereRef.material, {
          emissiveIntensity: 0.8,
          duration: 0.5
        })
        
        // Add continuous pulse animation
        const pulseTl = gsap.timeline({
          repeat: -1,
          yoyo: true
        })
        
        pulseTl.to(sphereRef.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.8,
          ease: "sine.inOut"
        })
        
        pulseTl.to(sphereRef.material, {
          emissiveIntensity: 0.6,
          duration: 0.8,
          ease: "sine.inOut"
        }, 0)
      } else {
        // Non-selected spheres - return to normal size with subtle animation
        gsap.to(sphereRef.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.5,
          ease: "power2.out"
        })
        
        // Dim emissive intensity
        gsap.to(sphereRef.material, {
          emissiveIntensity: 0.3,
          duration: 0.5
        })
      }
    })
  }, [selectedFeature, featureData])

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
          ref={(el) => { if (el) sphereRefs.current[feature] = el }}
          position={data.spherePos}
          onClick={(e) => {
            e.stopPropagation()
            onFeatureClick(feature)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            if (selectedFeature !== feature) {
              // Only apply hover effect if not selected
              gsap.to(e.object.scale, {
                x: 1.2, 
                y: 1.2, 
                z: 1.2,
                duration: 0.3,
                ease: "back.out(1.5)"
              })
              
              gsap.to(e.object.material, {
                emissiveIntensity: 0.5,
                duration: 0.3
              })
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            if (selectedFeature !== feature) {
              // Only reset if not selected
              gsap.to(e.object.scale, {
                x: 1, 
                y: 1, 
                z: 1,
                duration: 0.3,
                ease: "power2.out"
              })
              
              gsap.to(e.object.material, {
                emissiveIntensity: 0.3,
                duration: 0.3
              })
            }
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