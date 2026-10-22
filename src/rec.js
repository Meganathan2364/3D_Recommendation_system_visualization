import { items } from './data.js'

// ---- Core similarity measures (Session Guide Slide 4 & 7) ----
export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)
export const norm = (a) => Math.sqrt(dot(a, a))
export const cosine = (a, b) => {
  const n = norm(a) * norm(b)
  return n ? dot(a, b) / n : 0
}

// User-to-User similarity on co-rated items (Standard in Recommendation Systems)
// Comparing two users only on items both users have actually rated (> 0).
export const userCosine = (a, b) => {
  let d = 0, na = 0, nb = 0, count = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0 && b[i] > 0) {
      d += a[i] * b[i]
      na += a[i] * a[i]
      nb += b[i] * b[i]
      count++
    }
  }
  if (count === 0 || na === 0 || nb === 0) return 0
  return d / (Math.sqrt(na) * Math.sqrt(nb))
}

export const userEuclid = (a, b) => {
  let distSq = 0, count = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0 && b[i] > 0) {
      distSq += (a[i] - b[i]) ** 2
      count++
    }
  }
  if (count === 0) return 0
  return 1 / (1 + Math.sqrt(distSq / count))
}

export const userPearson = (a, b) => {
  const common = []
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0 && b[i] > 0) common.push(i)
  }
  if (common.length < 2) return userCosine(a, b)
  const ma = common.reduce((s, i) => s + a[i], 0) / common.length
  const mb = common.reduce((s, i) => s + b[i], 0) / common.length

  let num = 0, denA = 0, denB = 0
  common.forEach((i) => {
    const diffA = a[i] - ma
    const diffB = b[i] - mb
    num += diffA * diffB
    denA += diffA * diffA
    denB += diffB * diffB
  })
  const den = Math.sqrt(denA * denB)
  return den ? (num / den + 1) / 2 : 0.5 // scaled to 0-1
}

export const SIM = {
  cosine: userCosine,
  euclid: userEuclid,
  pearson: userPearson,
}

// ---- Collaborative Filtering (User-Based & Item-Based) ----
export function predUser(R, u, i, k = 2, metric = 'cosine') {
  const metricFn = SIM[metric] || userCosine
  const nb = R.map((r, v) => ({
    id: v,
    s: v === u ? 0 : metricFn(R[u], r),
    r: r[i]
  }))
    .filter((o) => o.id !== u && o.r > 0 && o.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)

  const w = nb.reduce((s, o) => s + o.s, 0)
  const value = w ? nb.reduce((s, o) => s + o.s * o.r, 0) / w : 0
  return { value, nb }
}

export function predItem(R, u, i, k = 2, metric = 'cosine') {
  const col = (j) => R.map((r) => r[j])
  const targetCol = col(i)

  const nb = items.map((_, j) => ({
    id: j,
    s: j === i ? 0 : userCosine(targetCol, col(j)),
    r: R[u][j]
  }))
    .filter((o) => o.id !== i && o.r > 0 && o.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)

  const w = nb.reduce((s, o) => s + o.s, 0)
  const value = w ? nb.reduce((s, o) => s + o.s * o.r, 0) / w : 0
  return { value, nb }
}

// ---- Content-Based Filtering ----
// Calculates user profile from ratings: liked items (4-5) reinforce genres strongly.
export function profile(R, u) {
  const numGenres = items[0].g.length
  const liked = R[u].map((r, j) => (r >= 4 ? j : -1)).filter((j) => j >= 0)
  if (liked.length === 0) {
    const rated = R[u].map((r, j) => (r >= 3 ? j : -1)).filter((j) => j >= 0)
    if (rated.length === 0) return Array(numGenres).fill(1)
    return Array(numGenres).fill(0).map((_, g) =>
      rated.reduce((s, j) => s + R[u][j] * (items[j].g[g] || 0), 0)
    )
  }
  return Array(numGenres).fill(0).map((_, g) =>
    liked.reduce((s, j) => s + R[u][j] * (items[j].g[g] || 0), 0)
  )
}

export const predContent = (R, u, i) => {
  const prof = profile(R, u)
  const cos = cosine(prof, items[i].g)
  return Math.min(5, Math.max(0, cos * 5))
}

// ---- Collaborative entry point ----
export function predCollab(st, u, i) {
  const f = st.cf === 'user' ? predUser : predItem
  return f(st.ratings, u, i, st.k, st.metric).value
}

// ---- Unified Predictor ----
export function predict(st, u, i) {
  const c = predCollab(st, u, i)
  const t = predContent(st.ratings, u, i)
  if (st.mode === 'content') return t
  if (st.mode === 'collab') return c > 0 ? c : t
  if (st.mode === 'compare') {
    return c > 0 ? 0.5 * t + 0.5 * c : t
  }
  return c === 0 ? t : st.alpha * t + (1 - st.alpha) * c
}

// Full comparison for a given user & item across all techniques
export function compareAllMethods(st, u, i) {
  const R = st.ratings
  const contentScore = predContent(R, u, i)
  const userCollab = predUser(R, u, i, st.k || 2, st.metric || 'cosine')
  const itemCollab = predItem(R, u, i, st.k || 2, st.metric || 'cosine')
  const hybrid50 = userCollab.value > 0 
    ? (0.5 * contentScore + 0.5 * userCollab.value) 
    : contentScore

  const others = R.map((r) => r[i]).filter((x) => x > 0)
  const popScore = others.length ? others.reduce((a, b) => a + b, 0) / others.length : 0

  return {
    content: contentScore,
    userCollab: userCollab.value,
    userCollabDetails: userCollab.nb,
    itemCollab: itemCollab.value,
    itemCollabDetails: itemCollab.nb,
    hybrid: hybrid50,
    popularity: popScore,
  }
}
