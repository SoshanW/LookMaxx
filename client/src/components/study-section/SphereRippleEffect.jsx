import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

const SphereRippleEffect = ({ active = false, color = "#a94dff", scale = 1, intensity = 1 }) => {
  const [ripples, setRipples] = useState([])
  const intervalRef = useRef(null)
  
  // Create new ripple every second if active
  useEffect(() => {
    if (active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      
      intervalRef.current = setInterval(() => {
        setRipples(prev => [
          ...prev, 
          { id: Date.now(), scale: 1, opacity: 0.8 }
        ])
      }, 1000 / intensity)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, intensity])
  
  // Animate ripples
  useFrame(() => {
    setRipples(prev => 
      prev
        .map(ripple => ({
          ...ripple,
          scale: ripple.scale + 0.03,
          opacity: ripple.opacity - 0.01
        }))
        .filter(ripple => ripple.opacity > 0)
    )
  })
  
  return (
    <group>
      {ripples.map(ripple => (
        <Billboard key={ripple.id}>
          <mesh scale={[ripple.scale * scale, ripple.scale * scale, ripple.scale * scale]}>
            <ringGeometry args={[0.09, 0.12, 32]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={ripple.opacity} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  )
}

SphereRippleEffect.propTypes = {
  active: PropTypes.bool,
  color: PropTypes.string,
  scale: PropTypes.number,
  intensity: PropTypes.number
}

export default SphereRippleEffect