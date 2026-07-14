import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { MorphObject } from './MorphObject'

/**
 * Fixed, full-viewport R3F canvas that lives behind the scrollable HTML.
 *
 * The canvas itself never scrolls — the DOM sections scroll over it, and the
 * 3D content reacts by reading the non-reactive scroll store inside useFrame.
 * `pointer-events: none` (set in CSS) lets clicks pass through to the HTML.
 */
export function Scene() {
  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#05060a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -3, 2]} intensity={0.6} color="#5b8cff" />

        <Suspense fallback={null}>
          <MorphObject />
        </Suspense>
      </Canvas>
    </div>
  )
}
