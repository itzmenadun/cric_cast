# Project Timeline & Todo List: CricCast SaaS

Based on the PRD, Design Documentation, and Tech Stack, this is the 12-week roadmap from concept to live production.

## Phase 1: Foundation, Infrastructure & Backend (Weeks 1-3)
- [ ] Set up cloud infrastructure (Render/Railway or AWS).
- [/] Initialize PostgreSQL database and design schema (Tournaments, Matches, Innings, Overs, Balls, Players).
- [x] Setup Redis for in-memory live match state caching.
- [x] Initialize Node.js + Fastify backend.
- [ ] Implement robust REST API for pre-match setup (Tournament & Match creation, Team/Roster management via CSV import).
- [ ] Implement Socket.io server for low-latency WebSocket connections with fallback to HTTP long-polling.
- [ ] Configure Idempotent API design to handle duplicate requests gracefully.

## Phase 2: Scorer's Interface MVP (React Native) (Weeks 4-6)
- [x] Initialize React Native (Expo) project for iOS/Android tablets and phones.
- [ ] Build Pre-Match Setup UI (Toss, Lineup selection).
- [ ] Develop the Live Scoring Engine dashboard.
- [ ] Implement one-click ball entry functionality (Runs, Extras, Wickets).
- [ ] Build match state management logic (CRR, RRR, DLS par scores).
- [ ] Integrate offline-first architecture using `WatermelonDB` or `AsyncStorage` for seamless offline/online syncing.
- [ ] Add Undo/Edit functionality for live corrections.

## Phase 3: GFX Rendering Engine Core (React.js) (Weeks 7-9)
- [x] Initialize React.js (Vite) project tailored for a 1920x1080 transparent canvas.
- [ ] Integrate Framer Motion for physics-based animations and transitions.
- [ ] Connect WebSocket client to receive live JSON payloads from the backend.
- [ ] Develop **Scorebug** component (Always-On Graphic).
- [ ] Develop **Lower Thirds** components (Player IDs, Stats).
- [ ] Build in/out transition logic and value interpolation (e.g., rolling numbers).

## Phase 4: Advanced GFX, vMix Integration & Scoring Polish (Weeks 10-11)
- [ ] Develop **Full Screens & Squeeze Backs** (Toss, Playing XI, Batting/Bowling Scorecards, Points Table).
- [ ] Develop **Event-Triggered Popups** (Milestones: 50, 100, Wickets).
- [ ] Add advanced tracking to Scorer interface (Wagon Wheel & Pitch Map UI).
- [ ] Set up dedicated JSON/XML endpoints for vMix data sources.
- [ ] Integrate vMix Web Controller API to trigger specific animations automatically.
- [ ] Create downloadable `.gtzip` templates mapped to the SaaS data fields.

## Phase 5: Testing, Optimization & Launch (Week 12)
- [ ] Conduct end-to-end latency optimization to ensure < 500ms delay.
- [ ] Perform offline resilience and state recovery testing.
- [ ] Test system crash recovery (Stateless WebSockets reconnect).
- [ ] Deploy GFX App to Vercel/Cloudflare Pages.
- [ ] Final UI/UX review of animations, safe areas, and typography.
- [ ] Production Launch.
