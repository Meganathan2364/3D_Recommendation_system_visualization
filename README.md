# 3D Recommendation System Visualizer

Hands-on 3D learning tool (React + Three.js). All recommendation maths is plain JavaScript in `src/rec.js`.

## Run
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Modes
- **Cosine Lab**: two 3D vectors (Action, Comedy, Romance), live angle, dot product and cosine. Presets: A vs B = 0.98, A vs C = 0.10.
- **Collaborative**: 3D user-item matrix, user-based or item-based, k neighbours, Cosine / Euclidean / Pearson.
- **Content-Based**: genre-profile similarity for each user.
- **Hybrid**: alpha slider blends content and collaborative scores.

Click any bar or name to select it, use the right panel to change a rating and see the exact calculation.

## Files
src/rec.js (maths) · src/data.js (dataset) · src/store.js (state) · src/Scene3D.jsx (3D) · src/App.jsx (UI)
