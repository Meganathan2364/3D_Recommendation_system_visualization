import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useStore, USER_COLORS } from './store'
import { users, items, genres } from './data'
import { predict, SIM, cosine, norm } from './rec'

// Dynamic Rating Colors
const rc = (r) => {
  if (r >= 4.5) return '#10b981' // emerald-500
  if (r >= 3.5) return '#34d399' // emerald-400
  if (r >= 2.5) return '#f59e0b' // amber-500
  if (r >= 1.5) return '#f97316' // orange-500
  return '#ef4444' // rose-500
}

const tagColors = {
  Sports: 'bg-blue-950/80 text-blue-300 border-blue-700/50',
  Tech: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
  Cinema: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
  Cricket: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
  Music: 'bg-pink-950/80 text-pink-300 border-pink-700/50',
}

// 3D Animated Bar with glowing highlight for top recommendations
function Bar({ x, z, h, color, ghost, sel, isTopRec, onClick }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      const m = ref.current
      m.scale.y += (h - m.scale.y) * 0.18
      m.position.y = m.scale.y / 2
    }
  })

  return (
    <mesh ref={ref} position={[x, 0, z]} scale={[1, 0.04, 1]} onClick={onClick}>
      <boxGeometry args={[0.92, 1, 0.92]} />
      <meshStandardMaterial
        color={color}
        transparent={ghost}
        opacity={ghost ? (isTopRec ? 0.95 : 0.65) : 1}
        emissive={isTopRec ? '#06b6d4' : ghost ? '#0891b2' : sel ? '#4f46e5' : '#000000'}
        emissiveIntensity={isTopRec ? 0.65 : sel ? 0.4 : 0.05}
        metalness={0.2}
        roughness={0.4}
      />
      {sel && (
        <mesh scale={1.08}>
          <boxGeometry args={[0.92, 1, 0.92]} />
          <meshBasicMaterial wireframe color="#ffffff" />
        </mesh>
      )}
      {isTopRec && (
        <mesh scale={[1.14, 1.02, 1.14]}>
          <boxGeometry args={[0.92, 1, 0.92]} />
          <meshBasicMaterial wireframe color="#22d3ee" />
        </mesh>
      )}
    </mesh>
  )
}

// 3D User-Item Matrix
function Matrix() {
  const st = useStore()
  const { ratings: R, user, item, set, mode, k, metric, cf } = st
  const W = items.length
  const H = users.length

  let topRecIdx = -1
  let maxRecScore = 0
  items.forEach((_, i) => {
    if (!R[user][i]) {
      const p = predict(st, user, i)
      if (p > maxRecScore) {
        maxRecScore = p
        topRecIdx = i
      }
    }
  })

  const nbs = R.map((r, v) => ({
    v,
    s: v === user ? 0 : SIM[metric](R[user], r)
  }))
    .filter((o) => o.v !== user && o.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)

  const strip = (v, color, op) => (
    <mesh key={`strip-${v}`} rotation={[-Math.PI / 2, 0, 0]} position={[(W - 1) * 0.65, 0.005, v * 1.3]}>
      <planeGeometry args={[W * 1.3, 1.2]} />
      <meshBasicMaterial color={color} transparent opacity={op} />
    </mesh>
  )

  return (
    <group position={[-(W - 1) * 0.65, 0, -(H - 1) * 0.65]}>
      {strip(user, '#6366f1', 0.45)}
      {mode !== 'content' && cf === 'user' && nbs.map((o) => strip(o.v, '#10b981', 0.15 + o.s * 0.35))}

      {users.map((name, u) => {
        const isSelected = u === user
        const isNeighbor = nbs.some((n) => n.v === u)
        return (
          <Html key={name} position={[-1.8, 0.2, u * 1.3]} center>
            <button
              onClick={() => set({ user: u })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 font-bold scale-105'
                  : isNeighbor
                  ? 'bg-emerald-900/90 text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-300 animate-pulse' : isNeighbor ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {name}
            </button>
          </Html>
        )
      })}

      {items.map((it, i) => {
        const isSelected = i === item
        const isTopPick = i === topRecIdx
        const tagStyle = tagColors[it.category] || 'bg-slate-800 text-slate-300 border-slate-700'

        return (
          <Html key={it.name} position={[i * 1.3, 0.2, -1.4]} center>
            <button
              onClick={() => set({ item: i })}
              className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-all shadow-lg text-left whitespace-nowrap flex flex-col items-center ${
                isSelected
                  ? 'bg-slate-900 text-amber-300 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                  : isTopPick
                  ? 'bg-cyan-950/95 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/50 animate-pulse font-bold'
                  : `${tagStyle} hover:bg-slate-700/90`
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{it.name}</span>
                {isTopPick && <span className="bg-cyan-500 text-black text-[9px] px-1 rounded font-black">TOP</span>}
              </div>
              <span className="text-[9px] opacity-75 font-normal tracking-wide uppercase">{it.category}</span>
            </button>
          </Html>
        )
      })}

      {R.map((row, u) =>
        row.map((r, i) => {
          const p = r ? 0 : predict(st, u, i)
          const ghost = !r && p > 0
          const isSelected = u === user && i === item
          const isTopRec = u === user && i === topRecIdx

          let barColor = '#1e293b'
          if (r) {
            barColor = rc(r)
          } else if (ghost) {
            barColor = isTopRec ? '#06b6d4' : '#22d3ee'
          }

          const height = r ? r * 0.55 : ghost ? p * 0.55 : 0.05

          return (
            <Bar
              key={`${u}-${i}`}
              x={i * 1.3}
              z={u * 1.3}
              ghost={ghost}
              isTopRec={isTopRec}
              h={height}
              color={barColor}
              sel={isSelected}
              onClick={(e) => {
                e.stopPropagation()
                set({ user: u, item: i })
              }}
            />
          )
        })
      )}
    </group>
  )
}

// Dynamic Multi-Person Cosine Lab with REAL-TIME EDITABLE COORDINATES
function MultiPersonVectorLab() {
  const { selectedUsers, userVectors, axesIndices, activeEditUser, setActiveEditUser } = useStore()
  const S = 0.7 // Scale factor for 3D coordinates

  // Map each selected user to their 3D vector using the live editable store
  const parsedUserVectors = selectedUsers.map((uIdx) => {
    // Current [X, Y, Z] coordinates from store (e.g. [5, 4, 2])
    const vec = userVectors[uIdx] || [0, 0, 0]
    const color = USER_COLORS[uIdx % USER_COLORS.length]
    const p3d = vec.map((x) => x * S)
    const n = norm(vec)

    return {
      userIdx: uIdx,
      name: users[uIdx],
      vec,
      p3d,
      color,
      norm: n,
      isActive: uIdx === activeEditUser
    }
  })

  // Calculate live angle arcs between adjacent selected pairs
  const arcs = []
  for (let a = 0; a < parsedUserVectors.length; a++) {
    for (let b = a + 1; b < parsedUserVectors.length; b++) {
      const u1 = parsedUserVectors[a]
      const u2 = parsedUserVectors[b]
      const c = cosine(u1.vec, u2.vec)
      const w = Math.acos(Math.min(1, Math.max(-1, c)))
      const n1 = u1.norm
      const n2 = u2.norm

      if (n1 > 0.1 && n2 > 0.1 && w > 0.03) {
        const pts = []
        for (let t = 0; t <= 20; t++) {
          const f = t / 20
          const pt = u1.vec.map(
            (x, i) =>
              (S * 1.8 * (Math.sin((1 - f) * w) * (x / n1) + Math.sin(f * w) * (u2.vec[i] / n2))) /
              Math.sin(w)
          )
          pts.push(pt)
        }
        arcs.push({
          key: `${u1.name}-${u2.name}`,
          pts,
          color: '#ffffff',
          angleDeg: ((w * 180) / Math.PI).toFixed(1),
          cosVal: c.toFixed(2),
        })
      }
    }
  }

  // 3 Primary dynamic axes with tick markers (1 to 5)
  const axisDefs = [
    { dir: [5 * S, 0, 0], name: genres[axesIndices[0]], color: '#38bdf8', axis: 0 },
    { dir: [0, 5 * S, 0], name: genres[axesIndices[1]], color: '#06b6d4', axis: 1 },
    { dir: [0, 0, 5 * S], name: genres[axesIndices[2]], color: '#a855f7', axis: 2 }
  ]

  return (
    <group position={[0, -0.6, 0]}>
      <gridHelper args={[10, 10, '#334155', '#1e293b']} />

      {/* 3D Coordinate Axes with Labels */}
      {axisDefs.map(({ dir, name, color, axis }) => (
        <group key={name}>
          <Line points={[[0, 0, 0], dir]} color={color} lineWidth={3} />
          {/* Axis Title */}
          <Html position={dir}>
            <span
              className="text-xs px-2 py-0.5 rounded font-bold shadow-md bg-slate-900/95 border border-slate-700 whitespace-nowrap"
              style={{ color }}
            >
              {name} (0-5)
            </span>
          </Html>

          {/* Numerical Ticks (1, 2, 3, 4, 5) */}
          {[1, 2, 3, 4, 5].map((val) => {
            const pos = [
              axis === 0 ? val * S : 0,
              axis === 1 ? val * S : 0,
              axis === 2 ? val * S : 0
            ]
            return (
              <mesh key={`tick-${axis}-${val}`} position={pos}>
                <sphereGeometry args={[0.04]} />
                <meshBasicMaterial color={color} />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Render each person's vector line, glowing sphere, and coordinate tag */}
      {parsedUserVectors.map((uv) => (
        <group key={uv.name}>
          <Line points={[[0, 0, 0], uv.p3d]} color={uv.color} lineWidth={uv.isActive ? 5 : 3.5} />
          
          <mesh
            position={uv.p3d}
            onClick={(e) => {
              e.stopPropagation()
              setActiveEditUser(uv.userIdx)
            }}
          >
            <sphereGeometry args={[uv.isActive ? 0.22 : 0.17]} />
            <meshStandardMaterial
              color={uv.color}
              emissive={uv.color}
              emissiveIntensity={uv.isActive ? 0.9 : 0.5}
            />
          </mesh>

          {/* Coordinate Tag */}
          <Html position={uv.p3d} center>
            <div
              onClick={() => setActiveEditUser(uv.userIdx)}
              className="text-xs px-2.5 py-1 rounded-md font-bold shadow-xl border whitespace-nowrap flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: '#090d16f0',
                borderColor: uv.color,
                color: uv.color,
                boxShadow: uv.isActive ? `0 0 15px ${uv.color}60` : undefined
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: uv.color }} />
                <span>{uv.name}</span>
              </div>
              <span className="text-[10px] font-mono opacity-90">
                [{uv.vec.join(', ')}]
              </span>
            </div>
          </Html>
        </group>
      ))}

      {/* Render live angle arcs between comparing users */}
      {arcs.map((arc) => (
        <group key={arc.key}>
          <Line points={arc.pts} color="#ffffff" lineWidth={2.5} />
        </group>
      ))}
    </group>
  )
}

export default function Scene3D() {
  const mode = useStore((s) => s.mode)
  return (
    <Canvas camera={{ position: [9, 10, 13], fov: 48 }}>
      <color attach="background" args={['#070b16']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 12, 6]} intensity={1.4} />
      <directionalLight position={[-6, 8, -6]} intensity={0.4} color="#6366f1" />
      {mode === 'cosine' ? <MultiPersonVectorLab /> : <Matrix />}
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
