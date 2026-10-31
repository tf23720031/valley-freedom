import { useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LandscapeFallback } from './LazyLandscape'

function makeRidge(phase: number, base: number, zStart: number, zDepth: number, centralCut: number) {
  const columns = 96, rows = 32, width = 25
  const positions: number[] = [], indices: number[] = []
  for (let row = 0; row <= rows; row++) {
    const depth = row / rows
    const z = zStart + depth * zDepth
    for (let column = 0; column <= columns; column++) {
      const x = (column / columns - 0.5) * width
      const broad = 0.62 * Math.sin(x * 0.48 + phase) + 0.31 * Math.sin(x * 1.15 - phase * 0.7)
      const peaks = 1.1 * Math.exp(-(((x - 5.1 - phase) / 1.8) ** 2)) + 0.85 * Math.exp(-(((x + 6.4 + phase) / 2.2) ** 2))
      const valley = centralCut * Math.exp(-((x / 2.8) ** 2))
      const taper = 1 - depth * 0.38
      positions.push(x, base + (broad + peaks - valley) * taper, z)
      if (row < rows && column < columns) {
        const current = row * (columns + 1) + column
        const next = current + columns + 1
        indices.push(current, next, current + 1, next, next + 1, current + 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function Ridge({ phase, base, zStart, zDepth, centralCut, color }: { phase: number; base: number; zStart: number; zDepth: number; centralCut: number; color: string }) {
  const geometry = useMemo(() => makeRidge(phase, base, zStart, zDepth, centralCut), [phase, base, zStart, zDepth, centralCut])
  return <mesh geometry={geometry} receiveShadow={false}><meshStandardMaterial color={color} roughness={1} metalness={0} /></mesh>
}

function ValleyFloor() {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(20, 22, 48, 48)
    const position = plane.attributes.position
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i)
      position.setZ(i, 0.025 * Math.sin(x * 0.7) + 0.018 * Math.cos(y * 0.8))
    }
    plane.computeVertexNormals()
    return plane
  }, [])
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -1]}><meshStandardMaterial color="#8FA088" roughness={1} /></mesh>
}

function ValleyRiver() {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 40; i++) {
      const z = 6 - i * 0.43
      const x = Math.sin(i * 0.24) * 2.3 + Math.sin(i * 0.48) * 0.5
      points.push(new THREE.Vector3(x, -0.78, z))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 100, 0.035, 7, false)
  }, [])
  return <mesh geometry={geometry}><meshStandardMaterial color="#D8E1D5" roughness={0.34} metalness={0.02} /></mesh>
}

function CameraJourney() {
  const { camera, gl, pointer } = useThree()
  useFrame((_state, delta) => {
    const story = gl.domElement.closest<HTMLElement>('.landscape-sequence')
    const progress = Number(story?.style.getPropertyValue('--terrain-progress') ?? 0)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.32, 2.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.2 + Math.sin(progress * Math.PI) * 0.38 + pointer.y * 0.16, 2.5, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 11.8 - progress * 3.8, 2.5, delta)
    camera.lookAt(pointer.x * 0.18, -0.35 + pointer.y * 0.1, -1.2 - progress * 4.4)
  })
  return null
}

export default function LandscapeScene() {
  return <Canvas className="terrain-canvas" aria-hidden="true" dpr={[1, 1.35]} camera={{ position: [0, 2.2, 11.8], fov: 36, near: 0.1, far: 60 }} gl={{ antialias: false, powerPreference: 'low-power', alpha: false }} performance={{ min: 0.55 }} fallback={<LandscapeFallback />}>
    <color attach="background" args={['#CDD5C9']} />
    <fog attach="fog" args={['#CDD5C9', 10, 29]} />
    <ambientLight intensity={0.75} color="#E5E8DD" />
    <directionalLight position={[-4, 9, 6]} intensity={1.35} color="#F3E4C8" />
    <directionalLight position={[5, 4, -8]} intensity={0.5} color="#DAE3D7" />
    <Ridge phase={0.9} base={0.2} zStart={-14} zDepth={6} centralCut={1.1} color="#82907B" />
    <Ridge phase={-0.45} base={-0.14} zStart={-10} zDepth={7} centralCut={2.3} color="#475C48" />
    <Ridge phase={0.15} base={-0.5} zStart={-5.5} zDepth={5} centralCut={2.7} color="#243E32" />
    <ValleyFloor />
    <ValleyRiver />
    <mesh position={[6.8, 4.6, -13]}><sphereGeometry args={[0.62, 20, 16]} /><meshBasicMaterial color="#E8DABF" /></mesh>
    <CameraJourney />
  </Canvas>
}
