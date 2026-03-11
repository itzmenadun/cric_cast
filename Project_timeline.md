# Project Timeline & Todo List: CricCast SaaS

Based on the PRD, Design Documentation, and Tech Stack, this is the 12-week roadmap from concept to live production.

## Phase 1: Foundation, Infrastructure & Backend (Weeks 1-3)
- [ ] Set up cloud infrastructure (Render/Railway or AWS).
- [x] Initialize PostgreSQL database and design schema (Tournaments, Matches, Innings, Overs, Balls, Players).
- [x] Setup Redis for in-memory live match state caching.
- [x] Initialize Node.js + Fastify backend.
- [x] Implement robust REST API for pre-match setup (Tournament & Match creation, Team/Roster management via CSV import).
- [x] Implement Socket.io server for low-latency WebSocket connections with fallback to HTTP long-polling.
- [x] Configure Idempotent API design to handle duplicate requests gracefully.

## Phase 2: Scorer's Interface MVP (React Native) (Weeks 4-6)
- [x] Initialize React Native (Expo) project for iOS/Android tablets and phones.
- [x] Build Pre-Match Setup UI (Toss, Lineup selection).
- [x] Develop the Live Scoring Engine dashboard.
- [x] Implement one-click ball entry functionality (Runs, Extras, Wickets).
- [x] Build match state management logic (CRR, RRR, DLS par scores).
- [x] Integrate offline-first architecture using `WatermelonDB` or `AsyncStorage` for seamless offline/online syncing.
- [x] Add Undo/Edit functionality for live corrections.

## Phase 3: GFX Rendering Engine Core (React.js) (Weeks 7-9)
- [x] Initialize React.js (Vite) project tailored for a 1920x1080 transparent canvas.
- [x] Integrate Framer Motion for physics-based animations and transitions.
- [x] Connect WebSocket client to receive live JSON payloads from the backend.
- [x] Develop **Scorebug** component (Always-On Graphic).
- [x] Develop **Lower Thirds** components (Player IDs, Stats).
- [x] Build in/out transition logic and value interpolation (e.g., rolling numbers).

## Phase 4: Advanced GFX, vMix Integration & Scoring Polish (Weeks 10-11)
- [x] Develop **Full Screens & Squeeze Backs** (Toss, Playing XI, Batting/Bowling Scorecards, Points Table).
- [x] Develop **Event-Triggered Popups** (Milestones: 50, 100, Wickets).
- [x] Integrate **React Router** to expose unique `/match/:matchId` URLs for isolated vMix Browser Inputs.
- [x] Add advanced tracking to Scorer interface (Wagon Wheel & Pitch Map UI).
- [x] Set up dedicated JSON/XML endpoints for vMix data sources.
- [x] Integrate vMix Web Controller API to trigger specific animations automatically.
- [x] Create downloadable `.gtzip` templates mapped to the SaaS data fields.

## Phase 5: Testing, Optimization & Launch (Week 12)
- [x] Conduct end-to-end latency optimization to ensure < 500ms delay.
- [x] Perform offline resilience and state recovery testing.
- [x] Test system crash recovery (Stateless WebSockets reconnect).
- [x] Deploy GFX App to Vercel/Cloudflare Pages.
- [x] Final UI/UX review of animations, safe areas, and typography.
- [x] Production Launch.
