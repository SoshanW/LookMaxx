// src/components/SceneLighting.jsx
import React from 'react'

const SceneLighting = () => (
  <>
    <ambientLight intensity={0.2} color="#b8c6ff" />
    <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
    {/* Main accent light for blue highlights */}
    <pointLight position={[-5, 2, 2]} intensity={2} color="#4d9bff" distance={15} />
    {/* Purple rim light for contrast */}
    <spotLight position={[5, -2, -2]} intensity={1.5} color="#a94dff" distance={20} angle={0.5} />
  </>
)

export default SceneLighting