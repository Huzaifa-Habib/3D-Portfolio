import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Icosahedron, MeshDistortMaterial } from '@react-three/drei'
import { Color, MathUtils, type Mesh } from 'three'
import { scroll, SECTIONS } from './scrollStore'
import { prefersReducedMotion } from '../hooks/useEnvironment'

/**
 * The single hero mesh that persists across every section. Rather than
 * mounting/unmounting per section, it continuously interpolates its transform
 * and material toward per-section targets driven by `scroll.sectionProgress`.
 *
 *   0 Hero      centered, calm rotation, cool indigo
 *   1 About     faceted distortion ramps up, palette shifts to teal
 *   2 Services  tightens into a crisp, low-distortion crystal, warm amber
 *   3 Projects  scales down + glides left as a spinning ambient anchor
 *   4 Contact   morphs toward a glowing wireframe globe
 *
 * All easing uses frame-rate-independent damping so motion is smooth
 * regardless of display refresh rate. When the OS requests reduced motion the
 * mesh drops continuous rotation/distortion and simply rests, centered.
 */

type Target = {
  x: number
  scale: number
  distort: number
  speed: number
  color: string
  wireframe: boolean
}

// Per-section target state, indexed to match SECTIONS order exactly.
const TARGETS: Target[] = [
  { x: 0, scale: 1.6, distort: 0.15, speed: 0.15, color: '#5b8cff', wireframe: false },
  { x: 0, scale: 1.5, distort: 0.55, speed: 0.35, color: '#22d3b7', wireframe: false },
  { x: 1.9, scale: 1.35, distort: 0.12, speed: 0.25, color: '#f59e0b', wireframe: false },
  { x: -2.4, scale: 0.78, distort: 0.3, speed: 0.9, color: '#a78bfa', wireframe: false },
  { x: -1.9, scale: 1.15, distort: 0.22, speed: 0.5, color: '#38bdf8', wireframe: true },
]

const PROJECTS_INDEX = SECTIONS.indexOf('projects')

// Scratch colors so we don't allocate inside the frame loop.
const cA = new Color()
const cB = new Color()

/** Smoothstep — eases both ends of a 0..1 ramp. */
function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export function MorphObject() {
  const mesh = useRef<Mesh>(null)
  // MeshDistortMaterial doesn't expose a stable typed ref for `distort`, so we
  // reach through `any` for the few animated uniforms it owns.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mat = useRef<any>(null)

  useFrame((_, delta) => {
    if (!mesh.current || !mat.current) return

    const reduced = prefersReducedMotion()

    // Which pair of section targets are we blending, and how far between them?
    const sp = scroll.sectionProgress
    const i = Math.min(Math.max(0, Math.floor(sp)), TARGETS.length - 2)
    // Clamp to [0,1] so we never extrapolate past a target (no overshoot when
    // sp sits inside the final section and floor(sp) would exceed i).
    let t = Math.min(1, Math.max(0, sp - i))

    // Projects is a tall, pinned section: hold the anchor pose for most of the
    // pin, then morph toward the next pose only in the last ~25% so the
    // transition reads as the horizontal scroll finishes.
    if (i === PROJECTS_INDEX) {
      t = smooth((t - 0.75) / 0.25)
    } else {
      t = smooth(t)
    }

    const a = TARGETS[i]
    const b = TARGETS[i + 1]

    const targetX = reduced ? 0 : MathUtils.lerp(a.x, b.x, t)
    const targetScale = MathUtils.lerp(a.scale, b.scale, t)
    const targetDistort = reduced ? 0.1 : MathUtils.lerp(a.distort, b.distort, t)
    const targetSpeed = MathUtils.lerp(a.speed, b.speed, t)

    // Damp toward targets (frame-rate independent).
    const k = 3
    mesh.current.position.x = MathUtils.damp(mesh.current.position.x, targetX, k, delta)
    const s = MathUtils.damp(mesh.current.scale.x, targetScale, k, delta)
    mesh.current.scale.setScalar(s)

    // Continuous rotation; speeds up in the Projects section. Held still under
    // reduced-motion so nothing spins for users sensitive to vestibular motion.
    if (!reduced) {
      mesh.current.rotation.y += delta * (0.2 + targetSpeed)
      mesh.current.rotation.x += delta * 0.1
    }

    // Animated material uniforms.
    mat.current.distort = MathUtils.damp(mat.current.distort, targetDistort, k, delta)
    cA.set(a.color)
    cB.set(b.color)
    cA.lerp(cB, t)
    mat.current.color.lerp(cA, 1 - Math.exp(-k * delta))
    mat.current.wireframe = t < 0.5 ? a.wireframe : b.wireframe
  })

  return (
    <Icosahedron ref={mesh} args={[1, 6]}>
      <MeshDistortMaterial
        ref={mat}
        color="#5b8cff"
        roughness={0.25}
        metalness={0.35}
        distort={0.15}
        speed={2}
      />
    </Icosahedron>
  )
}
