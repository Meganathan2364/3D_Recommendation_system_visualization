import Scene3D from './Scene3D'
import { useStore, USER_COLORS, defaultUserVectors } from './store'
import { users, items, genres, ratings0, userPersonas } from './data'
import {
  dot,
  norm,
  cosine,
  predict,
  predUser,
  predItem,
  profile,
  compareAllMethods
} from './rec'

const MODES = [
  ['cosine', '📐 Interactive Cosine Lab', 'Compare 2, 3, or more people in multi-color 3D with live sliders'],
  ['collab', 'Collaborative Filtering', 'People like you also liked...'],
  ['content', 'Content-Based Filtering', 'Similar features/genres you loved'],
  ['hybrid', 'Hybrid Blended Model', 'Combines User behaviour + Item details'],
  ['compare', '⚡ Side-by-Side Comparison', 'Compare all algorithms for any person'],
]

const box = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 mt-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
const btn = 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all shadow-sm'

const Slider = ({ label, v, min, max, step = 1, on, unit = '', color = '#818cf8' }) => (
  <label className="block text-xs mt-2 text-slate-300">
    <div className="flex justify-between font-medium">
      <span>{label}</span>
      <span className="font-bold font-mono" style={{ color }}>{v}{unit}</span>
    </div>
    <input
      type="range"
      className="w-full mt-1 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
      style={{ accentColor: color }}
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => on(+e.target.value)}
    />
  </label>
)

// Dynamic multi-person controls for Cosine Lab with REAL-TIME SLIDERS
function DynamicCosineLabControls() {
  const {
    selectedUsers,
    toggleUser,
    setSelectedUsers,
    axesIndices,
    userVectors,
    setUserCoordinate,
    activeEditUser,
    setActiveEditUser,
    set
  } = useStore()

  const presets = [
    { label: 'Prashanth & Meganathan (2 Tech/Sports)', ids: [0, 1] },
    { label: 'Prashanth, Meganathan & Nivetha (3 Diverse)', ids: [0, 1, 2] },
    { label: 'Priscilla, Anisha & Nivashini (3 Cinema/Music)', ids: [3, 5, 7] },
    { label: 'All 8 Team Members (Full 3D Web)', ids: [0, 1, 2, 3, 4, 5, 6, 7] }
  ]

  const activeVector = userVectors[activeEditUser] || [0, 0, 0]
  const activeColor = USER_COLORS[activeEditUser % USER_COLORS.length]
  const activeName = users[activeEditUser]

  const axisColors = ['#38bdf8', '#06b6d4', '#a855f7']

  return (
    <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3.5">
      {/* 1. Pick People */}
      <div>
        <div className="font-bold text-slate-200 flex justify-between items-center mb-1.5">
          <span>1. Pick People ({selectedUsers.length} in 3D)</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {users.map((name, idx) => {
            const isSelected = selectedUsers.includes(idx)
            const color = USER_COLORS[idx % USER_COLORS.length]
            const isEditing = idx === activeEditUser
            return (
              <button
                key={name}
                onClick={() => toggleUser(idx)}
                className={`px-2 py-1.5 rounded-lg text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'shadow-md ring-1'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                style={{
                  backgroundColor: isSelected ? `${color}18` : undefined,
                  borderColor: isSelected ? color : undefined,
                  color: isSelected ? color : undefined,
                }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.4 }}
                  />
                  <span className="truncate">{name}</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold text-slate-400">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. LIVE SLIDERS FOR EVERY SELECTED PERSON (2 persons = 2 cards, 3 = 3, etc.) */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-200 text-xs">
            2. Live Controllers ({selectedUsers.length} Active):
          </span>
          <span className="text-[10px] text-slate-400">0 to 5 scale</span>
        </div>

        {selectedUsers.map((uIdx) => {
          const uName = users[uIdx]
          const uColor = USER_COLORS[uIdx % USER_COLORS.length]
          const uVec = userVectors[uIdx] || [0, 0, 0]

          return (
            <div
              key={uName}
              className="p-3 rounded-xl border transition-all"
              style={{
                backgroundColor: '#070b16f2',
                borderColor: `${uColor}50`,
                boxShadow: `0 0 10px ${uColor}15`
              }}
            >
              {/* Header with Person Name and Current [X, Y, Z] */}
              <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: uColor }}
                  />
                  <span className="font-bold text-xs" style={{ color: uColor }}>
                    {uName}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  [{uVec.join(', ')}]
                </span>
              </div>

              {/* X Axis Slider for this person */}
              <Slider
                label={`X: ${genres[axesIndices[0]]}`}
                v={uVec[0]}
                min={0}
                max={5}
                step={1}
                color={axisColors[0]}
                on={(val) => setUserCoordinate(uIdx, 0, val)}
              />

              {/* Y Axis Slider for this person */}
              <Slider
                label={`Y: ${genres[axesIndices[1]]}`}
                v={uVec[1]}
                min={0}
                max={5}
                step={1}
                color={axisColors[1]}
                on={(val) => setUserCoordinate(uIdx, 1, val)}
              />

              {/* Z Axis Slider for this person */}
              <Slider
                label={`Z: ${genres[axesIndices[2]]}`}
                v={uVec[2]}
                min={0}
                max={5}
                step={1}
                color={axisColors[2]}
                on={(val) => setUserCoordinate(uIdx, 2, val)}
              />
            </div>
          )
        })}
      </div>

      {/* 3. Quick Presets */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Quick Comparison Presets:</div>
        <div className="space-y-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setSelectedUsers(p.ids)}
              className="w-full text-left px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 truncate"
            >
              • {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
  const { mode, set, user, k, alpha, metric, cf } = useStore()
  const activeUser = users[user]
  const persona = userPersonas[activeUser]

  return (
    <aside className="w-80 p-4 border-r border-slate-800/80 bg-slate-950/80 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 shadow-md">
            3D
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight">Team Recommender</h1>
            <p className="text-[11px] text-cyan-400 font-medium">Cricket · Cinema · Sports · Tech · Music</p>
          </div>
        </div>

        {/* Algorithm Modes */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            Recommender Modes
          </div>
          {MODES.map(([m, l, desc]) => (
            <button
              key={m}
              onClick={() => set({ mode: m })}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all border ${
                mode === m
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span>{l}</span>
                {mode === m && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{desc}</div>
            </button>
          ))}
        </div>

        {/* Mode Specific Controls */}
        {mode === 'cosine' ? (
          <DynamicCosineLabControls />
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <label className="font-semibold text-slate-300 block mb-1">
              Active Team Member
              <select
                className={box}
                value={user}
                onChange={(e) => set({ user: +e.target.value })}
              >
                {users.map((n, i) => (
                  <option key={n} value={i}>
                    {n} ({userPersonas[n]?.fav})
                  </option>
                ))}
              </select>
            </label>

            {persona && (
              <div className="mt-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40">
                <div className="text-[11px] font-bold text-indigo-300">Favorite: {persona.fav}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{persona.desc}</div>
              </div>
            )}

            {mode !== 'content' && mode !== 'compare' && (
              <>
                <label className="block mt-3 font-semibold text-slate-300">
                  Collaborative Style
                  <select
                    className={box}
                    value={cf}
                    onChange={(e) => set({ cf: e.target.value })}
                  >
                    <option value="user">User-based (Similar Team Members)</option>
                    <option value="item">Item-based (Linked Items / Also Rated)</option>
                  </select>
                </label>
                <label className="block mt-3 font-semibold text-slate-300">
                  Similarity Metric
                  <select
                    className={box}
                    value={metric}
                    onChange={(e) => set({ metric: e.target.value })}
                  >
                    <option value="cosine">Cosine Similarity (Direction)</option>
                    <option value="euclid">Euclidean Distance (Magnitude)</option>
                    <option value="pearson">Pearson Correlation (Baseline adjusted)</option>
                  </select>
                </label>
                <Slider
                  label="k Nearest Neighbours"
                  v={k}
                  min={1}
                  max={5}
                  on={(x) => set({ k: x })}
                />
              </>
            )}

            {mode === 'hybrid' && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <Slider
                  label="Hybrid Blend (α)"
                  v={alpha}
                  min={0}
                  max={1}
                  step={0.05}
                  on={(x) => set({ alpha: x })}
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>← Collab (User Behavior)</span>
                  <span>Content (Features) →</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80 mt-4">
        <button
          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-2"
          onClick={() =>
            set({
              ratings: ratings0.map((r) => [...r]),
              userVectors: { ...defaultUserVectors },
              selectedUsers: [0, 1],
              activeEditUser: 0
            })
          }
        >
          <span>↺</span> Reset All Coordinates
        </button>
        <p className="text-[10px] text-slate-500 mt-2 text-center leading-relaxed">
          🖱️ Rotate 3D space · Scroll to zoom · Click to inspect.
        </p>
      </div>
    </aside>
  )
}

function MultiCosineMathPanel() {
  const { selectedUsers, userVectors, axesIndices } = useStore()

  // Calculate pairs in real time from the editable userVectors
  const pairs = []
  for (let a = 0; a < selectedUsers.length; a++) {
    for (let b = a + 1; b < selectedUsers.length; b++) {
      const uA = selectedUsers[a]
      const uB = selectedUsers[b]
      const vecA = userVectors[uA] || [0, 0, 0]
      const vecB = userVectors[uB] || [0, 0, 0]

      const d = dot(vecA, vecB)
      const na = norm(vecA)
      const nb = norm(vecB)
      const c = cosine(vecA, vecB)
      const angle = (Math.acos(Math.min(1, Math.max(-1, c))) * 180) / Math.PI

      pairs.push({
        nameA: users[uA],
        nameB: users[uB],
        colorA: USER_COLORS[uA % USER_COLORS.length],
        colorB: USER_COLORS[uB % USER_COLORS.length],
        vecA,
        vecB,
        d,
        na,
        nb,
        c,
        angle
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px] font-bold tracking-wider uppercase mb-1">
          <span>📐</span> Multi-Person Cosine Lab
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Live Pairwise Similarity
        </h2>
        <p className="text-xs text-slate-400">
          Real-time vector angles across [X: {genres[axesIndices[0]]}, Y: {genres[axesIndices[1]]}, Z: {genres[axesIndices[2]]}]
        </p>
      </div>

      {/* Selected Member Legends */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="text-xs font-semibold text-slate-300 mb-2">Live 3D Coordinates:</div>
        <div className="space-y-1.5">
          {selectedUsers.map((uIdx) => {
            const color = USER_COLORS[uIdx % USER_COLORS.length]
            const vec = userVectors[uIdx] || [0, 0, 0]
            return (
              <div
                key={users[uIdx]}
                className="text-xs px-2.5 py-1.5 rounded-lg border flex items-center justify-between"
                style={{
                  backgroundColor: `${color}15`,
                  borderColor: `${color}60`,
                  color: color
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-bold">{users[uIdx]}</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  [{vec.join(', ')}]
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pairwise similarity breakdowns */}
      <div className="space-y-3">
        {pairs.map((p) => (
          <div
            key={`${p.nameA}-${p.nameB}`}
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
          >
            <div className="flex justify-between items-center">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span style={{ color: p.colorA }}>{p.nameA}</span>
                <span className="text-slate-500">vs</span>
                <span style={{ color: p.colorB }}>{p.nameB}</span>
              </div>
              <div className="font-mono text-base font-black" style={{ color: p.c > 0.7 ? '#10b981' : p.c > 0.4 ? '#f59e0b' : '#ec4899' }}>
                cos = {p.c.toFixed(2)}
              </div>
            </div>

            {/* Formula line */}
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-300 space-y-0.5">
              <div>A · B: {p.vecA.map((x, i) => `(${x}×${p.vecB[i]})`).join(' + ')} = {p.d.toFixed(0)}</div>
              <div>‖A‖ = {p.na.toFixed(2)}, ‖B‖ = {p.nb.toFixed(2)}</div>
              <div className="text-cyan-400 font-bold">
                cos(θ) = {p.d.toFixed(0)} / ({(p.na * p.nb).toFixed(2)}) = {p.c.toFixed(2)}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Live Angle θ: <b>{p.angle.toFixed(1)}°</b></span>
                <span>Match: <b>{(Math.max(0, p.c) * 100).toFixed(0)}%</b></span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(0, p.c) * 100}%`,
                    backgroundColor: p.c > 0.7 ? '#10b981' : p.c > 0.4 ? '#f59e0b' : '#ec4899'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonPanel() {
  const st = useStore()
  const { ratings: R, user, item, set } = useStore()
  const currentRating = R[user][item]
  const targetItem = items[item]
  const targetUser = users[user]
  const persona = userPersonas[targetUser]
  const cmp = compareAllMethods(st, user, item)

  return (
    <div className="space-y-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px] font-bold tracking-wider uppercase mb-1">
          <span>⚡</span> Side-by-Side Comparison
        </div>
        <h2 className="text-lg font-bold text-slate-100 leading-tight">
          {targetUser} × {targetItem.name}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Category: <b>{targetItem.category}</b>
          </span>
          <span className="text-xs text-indigo-400 font-medium">
            Favorite: {persona?.fav}
          </span>
        </div>
      </div>

      {currentRating > 0 ? (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200">
          ⭐ {targetUser} already rated this <b>{currentRating} / 5</b>.
          <p className="text-slate-400 text-[11px] mt-1">
            Click on an unrated item in the 3D scene to see its comparison breakdown.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-cyan-950/80 border border-cyan-500/40 shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
              <span>Predicted Score for {targetUser}</span>
              <span className="bg-cyan-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                {cmp.hybrid >= 3.8 ? '🔥 STRONG MATCH' : 'MATCH'}
              </span>
            </div>
            <div className="text-2xl font-black text-cyan-300">
              {cmp.hybrid.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-400">1. Content-Based</span>
                <span className="font-extrabold text-sm text-purple-300">{cmp.content.toFixed(2)} / 5</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Matches item features with {targetUser}&apos;s profile of rated likes ({persona?.fav}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400">2. Collaborative (User-Based)</span>
                <span className="font-extrabold text-sm text-emerald-300">
                  {cmp.userCollab > 0 ? `${cmp.userCollab.toFixed(2)} / 5` : 'N/A'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aggregates ratings from team members with similar behavioral taste.
              </p>
              {cmp.userCollabDetails.length > 0 && (
                <div className="mt-2 text-[10px] text-emerald-300/80 bg-slate-950 p-1.5 rounded space-y-0.5">
                  <div className="font-semibold text-slate-400">Influencing team neighbours:</div>
                  {cmp.userCollabDetails.map((nb) => (
                    <div key={nb.id} className="flex justify-between">
                      <span>• {users[nb.id]} (Sim: {nb.s.toFixed(2)})</span>
                      <span className="font-bold text-emerald-400">{nb.r} ★</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-700/60">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyan-300">3. Hybrid Blended (50/50)</span>
                <span className="font-extrabold text-sm text-cyan-200">{cmp.hybrid.toFixed(2)} / 5</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Balances item content features + team member collaborative agreement.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-300 mb-2">Switch Target Item to Compare:</div>
        <div className="grid grid-cols-2 gap-1.5">
          {items.map((it, i) => (
            <button
              key={it.name}
              onClick={() => set({ item: i })}
              className={`p-2 rounded-lg text-left text-xs transition-all border ${
                i === item
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-1 ring-indigo-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="truncate">{it.name}</div>
              <div className="text-[10px] text-cyan-400">{it.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatrixPanel() {
  const st = useStore()
  const { ratings: R, user, item, set, mode, k, metric, cf, alpha } = st
  const r = R[user][item]
  const edit = (d) =>
    set({
      ratings: R.map((row, u) =>
        u === user
          ? row.map((x, i) => (i === item ? Math.max(0, Math.min(5, x + d)) : x))
          : row
      )
    })

  const recs = items
    .map((_, i) => ({ i, p: R[user][i] ? 0 : predict(st, user, i) }))
    .filter((o) => o.p > 0)
    .sort((a, b) => b.p - a.p)

  // Find candidate item to explain: if selected item is rated, explain the #1 unrated top recommendation!
  const targetItemIdx = !r ? item : (recs[0]?.i ?? item)
  const isExplainingTopRec = r > 0 && recs.length > 0

  const br =
    mode !== 'content'
      ? (cf === 'user' ? predUser : predItem)(R, user, targetItemIdx, k, metric)
      : null
  const nm = (id) => (cf === 'user' ? users[id] : items[id].name)
  const targetItem = items[targetItemIdx]
  const persona = userPersonas[users[user]]

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
          {isExplainingTopRec ? 'Top Recommended Target' : 'Selected Cell'}
        </div>
        <h2 className="text-lg font-bold text-slate-100 leading-tight">
          {users[user]} × {targetItem.name}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Category: <b>{targetItem.category}</b>
          </span>
          <span className="text-xs text-slate-400">
            {isExplainingTopRec ? (
              <span className="text-cyan-400 font-semibold">Unrated Recommendation Candidate</span>
            ) : (
              <span>Rating: <b className="text-amber-400">{r ? `${r} ★` : 'Not Rated'}</b></span>
            )}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="text-xs text-slate-400 mb-2">Adjust rating for live recalibration:</div>
        <div className="flex gap-2">
          <button className={`${btn} flex-1`} onClick={() => edit(-1)}>
            − Lower Rating
          </button>
          <button className={`${btn} flex-1`} onClick={() => edit(1)}>
            + Higher Rating
          </button>
        </div>
      </div>

      {br && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-emerald-400">Collaborative Prediction</h3>
            <span className="text-[10px] text-slate-400 uppercase">{cf} based</span>
          </div>

          {br.nb.length === 0 ? (
            <p className="text-slate-400 text-xs">
              No similar team members have rated this yet.
            </p>
          ) : (
            <>
              <table className="w-full mt-2 text-[11px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-1">
                    <td className="py-1">Team Member</td>
                    <td className="text-right">Similarity</td>
                    <td className="text-right">Rating</td>
                    <td className="text-right">Weighted</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {br.nb.map((o) => (
                    <tr key={o.id}>
                      <td className="py-1 text-slate-300 font-sans">{nm(o.id)}</td>
                      <td className="text-right text-emerald-400">{o.s.toFixed(2)}</td>
                      <td className="text-right text-amber-300">{o.r} ★</td>
                      <td className="text-right text-slate-300">{(o.s * o.r).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Σ(Sim × r) / Σ Sim =</span>
                <span className="text-base font-extrabold text-cyan-300 font-mono">
                  {br.value.toFixed(2)} / 5.0
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {mode !== 'collab' && !r && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <h3 className="font-bold text-purple-400 mb-1">Content-Based Scoring</h3>
          <p className="text-[11px] text-slate-400">
            {users[user]}&apos;s Preference Vector:
          </p>
          <div className="p-1.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 my-1">
            [{profile(R, user).slice(0, 4).map((x) => x.toFixed(0)).join(', ')}] across [{genres.slice(0, 4).join(', ')}]
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-400">cos(Profile, Movie) × 5 =</span>
            <span className="text-base font-extrabold text-cyan-300 font-mono">
              {predict({ ...st, mode: 'content' }, user, item).toFixed(2)} / 5.0
            </span>
          </div>
        </div>
      )}

      {/* DISTINCT & CLEAR TOP RECOMMENDATIONS LIST */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>✨</span> Top Picks for {users[user]}
            </h3>
            <p className="text-[10px] text-indigo-400 font-medium">Favorite: {persona?.fav}</p>
          </div>
          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-bold">
            LIVE RANKED
          </span>
        </div>

        {recs.length ? (
          <div className="space-y-2 mt-2">
            {recs.map((o, rank) => {
              const it = items[o.i]
              const isFirst = rank === 0
              return (
                <div
                  key={o.i}
                  onClick={() => set({ item: o.i })}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isFirst
                      ? 'bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg'
                      : o.i === item
                      ? 'bg-slate-800 border-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isFirst
                          ? 'bg-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rank + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{it.name}</span>
                        {isFirst && (
                          <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                            TOP REC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-medium">
                        {it.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-cyan-300 font-mono">
                      {o.p.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-400">predicted</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            All items are already rated by {users[user]}!
          </p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const mode = useStore((s) => s.mode)

  return (
    <div className="flex h-screen bg-[#070b16] text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 relative flex flex-col">
        <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              {mode === 'cosine' ? 'Interactive Multi-Person 3D Cosine Lab' : 'Interactive 3D Recommender Matrix'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {mode === 'cosine' ? (
              <span>Move the X, Y, Z sliders in the left panel to watch vectors & angles move in real time</span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Solid: Rating
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Ghost: Rec
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded ring-2 ring-cyan-400 inline-block" /> Glowing: Top Pick
                </span>
              </>
            )}
          </div>
        </div>

        <Scene3D />
      </main>

      <aside className="w-96 p-4 border-l border-slate-800/80 bg-slate-950/80 overflow-y-auto">
        {mode === 'cosine' ? (
          <MultiCosineMathPanel />
        ) : mode === 'compare' ? (
          <ComparisonPanel />
        ) : (
          <MatrixPanel />
        )}
      </aside>
    </div>
  )
}
