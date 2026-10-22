import { create } from 'zustand'
import { ratings0 } from './data'

// Distinct vibrant palette for each selected member in 3D
export const USER_COLORS = [
  '#f59e0b', // Prashanth: Amber
  '#06b6d4', // Meganathan: Cyan
  '#ec4899', // Nivetha: Pink
  '#10b981', // Priscilla: Emerald
  '#a855f7', // Dhivya: Purple
  '#f97316', // Anisha: Orange
  '#3b82f6', // Moge: Blue
  '#eab308', // Nivashini: Yellow
]

// Default taste coordinates in 3D for each user [X: Sports, Y: Tech, Z: ActionCinema]
// Values from 0 to 5, editable in real-time with sliders!
export const defaultUserVectors = {
  0: [5, 4, 2], // Prashanth (High Sports, High Tech, Mid Action)
  1: [4, 5, 2], // Meganathan (High Tech, High Sports, Mid Action)
  2: [1, 1, 5], // Nivetha (Cinema heavy, Low Sports/Tech)
  3: [1, 1, 2], // Priscilla (Music/Melody focus)
  4: [3, 1, 4], // Dhivya (Action & Cricket)
  5: [1, 1, 3], // Anisha (Comedy/Drama)
  6: [5, 2, 1], // Moge (Heavy Sports, Low Tech)
  7: [1, 2, 5], // Nivashini (Action Cinema enthusiast)
}

export const useStore = create((set, get) => ({
  mode: 'cosine', // 'collab' | 'content' | 'hybrid' | 'compare' | 'cosine'
  ratings: ratings0.map((r) => [...r]),
  user: 0,
  item: 0,
  k: 2,
  alpha: 0.5,
  metric: 'cosine',
  cf: 'user',

  // Dynamic multi-person selection for Cosine Lab
  selectedUsers: [0, 1],

  // Active editable 3D vectors for each user: [X: Sports, Y: Tech, Z: ActionCinema]
  userVectors: { ...defaultUserVectors },

  // Active person whose sliders are currently being edited
  activeEditUser: 0,

  // 3 primary genre axes plotted in 3D space
  axesIndices: [0, 1, 2],

  // Update a specific coordinate (0=X, 1=Y, 2=Z) for a user
  setUserCoordinate: (userIdx, axisIdx, val) => {
    const cur = get().userVectors
    const userVec = [...(cur[userIdx] || [0, 0, 0])]
    userVec[axisIdx] = val
    set({
      userVectors: {
        ...cur,
        [userIdx]: userVec
      }
    })
  },

  setActiveEditUser: (userIdx) => set({ activeEditUser: userIdx }),

  // Toggle person into comparison set
  toggleUser: (idx) => {
    const cur = get().selectedUsers
    if (cur.includes(idx)) {
      if (cur.length > 2) {
        set({ selectedUsers: cur.filter((x) => x !== idx) })
      }
    } else {
      set({ selectedUsers: [...cur, idx], activeEditUser: idx })
    }
  },

  setSelectedUsers: (list) => set({ selectedUsers: list, activeEditUser: list[0] ?? 0 }),
  setAxesIndices: (axes) => set({ axesIndices: axes }),

  set: (p) => set(p),
}))
