// src/components/HumanHeadModel.jsx
import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'
import SphereRippleEffect from './SphereRippleEffect'
import NeonHeadMaterial from './NeonHeadMaterial'

const HumanHeadModel = ({ initialPosition, selectedFeature, featureData, onAnimationComplete, onFeatureClick }) => {
  const headRef = useRef()
  const sphereRefs = useRef({})
  const sphereGroupRefs = useRef({})
  const { nodes } = useGLTF('/models/humanHead.glb')

  const resetHeadPosition = () => {
    if (!headRef.current) return

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

  // Setup pulsing animation for spheres on mount
  useEffect(() => {
    Object.entries(featureData).forEach(([feature]) => {
      const sphere = sphereRefs.current[feature]
      if (!sphere) return
      
      gsap.killTweensOf(sphere.scale)
      
      gsap.to(sphere.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    })
  }, [featureData])

  // Handle feature selection animations
  useEffect(() => {
    Object.entries(featureData).forEach(([feature]) => {
      const sphere = sphereRefs.current[feature]
      if (!sphere) return

      gsap.killTweensOf(sphere.material)
      gsap.killTweensOf(sphere.scale)
      
      if (selectedFeature === feature) {
        gsap.to(sphere.material, {
          emissiveIntensity: 0.9,
          duration: 0.5
        })
        
        gsap.to(sphere.scale, {
          x: 1.5,
          y: 1.5,
          z: 1.5,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      } else {
        gsap.to(sphere.material, {
          emissiveIntensity: 0.3,
          duration: 0.5
        })
        
        gsap.to(sphere.scale, {
          x: 0.85,
          y: 0.85,
          z: 0.85,
          duration: 0.5,
          onComplete: () => {
            gsap.to(sphere.scale, {
              x: 1.15,
              y: 1.15,
              z: 1.15,
              duration: 1.3,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            })
          }
        })
      }
    })
  }, [selectedFeature, featureData])

  // Handle head positioning when feature is selected
  useEffect(() => {
    if (!headRef.current) return

    gsap.killTweensOf(headRef.current.position)
    gsap.killTweensOf(headRef.current.rotation)
    gsap.killTweensOf(headRef.current.scale)
    
    if (selectedFeature) {
      const { view } = featureData[selectedFeature]
      const tl = gsap.timeline({ onComplete: onAnimationComplete })
      tl.to(headRef.current.position, {
        duration: 0.8,
        x: view.position[0],
        y: view.position[1],
        z: view.position[2],
        ease: 'power4.out'
      }, 0)
      tl.to(headRef.current.rotation, {
        duration: 0.8,
        x: view.rotation[0],
        y: view.rotation[1],
        z: view.rotation[2],
        ease: 'power4.out'
      }, 0)
      tl.to(headRef.current.scale, {
        duration: 0.8,
        x: view.scale,
        y: view.scale,
        z: view.scale,
        ease: 'back.out(1.2)'
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
            >
            <NeonHeadMaterial />
          </mesh>
        ))}
      </group>
      
      {/* Feature spheres */}
      {Object.entries(featureData).map(([feature, data]) => {
        // If a feature is selected and this sphere is not it, hide it.
        if (selectedFeature && feature !== selectedFeature) return null;

        return (
          <group 
            key={feature} 
            position={data.spherePos} 
            ref={(el) => { sphereGroupRefs.current[feature] = el }}
          >
            {/* Ripple effect */}
            <SphereRippleEffect 
              active={selectedFeature === feature} 
              color="#a94dff" 
              scale={1}
              intensity={1.5}
            />
            
            {/* Sphere */}
            <mesh
              ref={(el) => { if (el) sphereRefs.current[feature] = el }}
              onClick={(e) => {
                e.stopPropagation()
                onFeatureClick(feature)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                // Set cursor to pointer and disable pulsing
                document.body.style.cursor = 'pointer'
                gsap.killTweensOf(e.object.scale)
                if (selectedFeature !== feature) {
                  gsap.to(e.object.material, {
                    emissiveIntensity: 0.7,
                    duration: 0.3
                  })
                  
                  gsap.to(e.object.scale, {
                    x: 1.3, 
                    y: 1.3, 
                    z: 1.3,
                    duration: 0.4,
                    ease: "back.out(2)"
                  })
                  
                  gsap.fromTo(
                    sphereGroupRefs.current[feature].rotation,
                    { z: -0.1 },
                    { 
                      z: 0.1, 
                      duration: 0.2, 
                      repeat: 3, 
                      yoyo: true,
                      ease: "sine.inOut" 
                    }
                  )
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                // Reset cursor style
                document.body.style.cursor = 'auto'
                if (selectedFeature !== feature) {
                  gsap.to(e.object.material, {
                    emissiveIntensity: 0.3,
                    duration: 0.3
                  })
                  // Tween to the low value first, then restart pulsing tween
                  gsap.to(e.object.scale, {
                    x: 0.85,
                    y: 0.85,
                    z: 0.85,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                      gsap.to(e.object.scale, {
                        x: 1.15,
                        y: 1.15,
                        z: 1.15,
                        duration: 1.3,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                      })
                    }
                  })
                  gsap.to(sphereGroupRefs.current[feature].rotation, {
                    z: 0,
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
          </group>
        )
      })}
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