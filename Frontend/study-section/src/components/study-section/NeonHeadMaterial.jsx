// src/components/study-section/NeonHeadMaterial.jsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import React, { useRef } from 'react'

/**
 * Modified Fresnel + Lambert Material
 * - `uColor1` / `uColor2`: neon rim colors
 * - `uBaseColor`: diffuse color for the face
 * - `uLightDirection`: direction used for simple Lambert shading
 */
const NeonHeadShaderMaterial = shaderMaterial(
  {
    uColor1: new THREE.Color('#2d00ff'),    // neon color 1 (deep purple)
    uColor2: new THREE.Color('#ff0080'),    // neon color 2 (pinkish)
    uBaseColor: new THREE.Color('#c4c2c2'),    // base diffuse color for shading
    uLightDirection: new THREE.Vector3(0.5, 1.0, 0.2).normalize(),
    time: 0,
  },
  // Vertex Shader
  /* glsl */ `
    uniform float time;
    varying float vFresnel;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-modelViewPosition.xyz);

      // Fresnel term
      float fresnelTerm = dot(vNormal, vViewDir);
      vFresnel = pow(1.0 - fresnelTerm, 3.0);

      gl_Position = projectionMatrix * modelViewPosition;
    }
  `,
  // Fragment Shader
  /* glsl */ `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uBaseColor;
    uniform vec3 uLightDirection;
    uniform float time;

    varying float vFresnel;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      // Simple Lambert shading
      float lambert = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);
      // Combine with a user-chosen base color
      vec3 lambertShading = uBaseColor * lambert;

      // Neon Fresnel rim
      vec3 neon = mix(uColor1, uColor2, vFresnel);

      // Final color is a blend of Lambert + neon rim
      // Feel free to tweak the factor if you want more or less neon
      vec3 finalColor = lambertShading + neon * 0.8;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

// Register material with R3F
extend({ NeonHeadShaderMaterial })

export default function NeonHeadMaterial(props) {
  const materialRef = useRef()

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.time += delta
    }
  })

  return <neonHeadShaderMaterial ref={materialRef} {...props} />
}