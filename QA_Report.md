# QA Report: CricCast v3.0 Scale-Up

## 1. Scope & Test Objectives

This QA cycle evaluates the CricCast system as of the v3.0 planning baseline:

- **Backend** (`backend`): Node.js + Fastify API, Prisma/PostgreSQL, Redis, Socket.io, vMix data feeds.
- **Scorer App** (`scorer-app`): React Native (Expo) tablet app for on-field scoring.
- **GFX Engine** (`gfx-engine`, upcoming): React + Vite overlay renderer for vMix/OBS.
- **Infrastructure & Non-Functional**: Docker Compose local environment, latency, resilience, and basic security behaviours.

Objectives:

- Validate that **core match lifecycle** (tournament → teams → players → match → live scoring → summary) works end-to-end.
- Validate **real-time behaviour** between scorer and GFX (where implemented) and backend data feeds.
- Identify **gaps vs. v3.0 scale-up goals** (multi-tenancy, observability, reliability).

> Note: This report is based on repository inspection and test design; some tests are marked as **pending execution** until a full environment (DB, Redis, mobile devices) is available.

---

## 2. Environment & Setup

- OS: Windows 10 (per workspace metadata).
- Local services (per `docker-compose.yml` and `README.md`):
  - PostgreSQL database.
  - Redis cache.
  - Backend API (Fastify + Prisma + Socket.io).
- Client apps:
  - Scorer app via `npx expo start` in `scorer-app`.
  - GFX engine via `npm run dev` in `gfx-engine` (when present/enabled).

Assumptions:

- `.env` is correctly configured for backend with DB and Redis URLs.
- Mobile testing uses either emulator or physical device on same network.

---

## 3. Test Strategy

### 3.1 Types of Testing

- **Smoke Testing**: Verify that each service starts, basic APIs respond, and scorer app can connect.
- **Functional / End-to-End**:
  - Tournament, team, player, and match creation.
  - Full innings scoring flow (ball entry, wickets, extras, undo).
  - Match completion and summary validation.
- **Real-Time / Integration**:
  - Socket.io event flow scorer → backend → GFX engine.
  - vMix JSON/XML endpoint correctness and update frequency.
- **Non-Functional** (high-level):
  - Latency budget (click-to-update path).
  - Offline resilience for scorer app.
  - Basic error handling and recovery.
- **Regression / API Contracts**:
  - Backend route stability (where tests exist in `backend/tests`).

### 3.2 Not Covered / Deferred

- True **load testing at v3.0 scale** (100+ concurrent matches).
- Full **security penetration testing**.
- Cross-device visual QA for all GFX layouts.

---

## 4. Smoke Tests

Status: **Pending execution**, scenarios defined.

**Backend**
- Start with `docker-compose up -d --build` in `backend`.
- Confirm:
  - API available at `http://localhost:3000` (health route if present).
  - Database and Redis containers are healthy.

**Scorer App**
- Run `npm install` then `npx expo start` in `scorer-app`.
- Confirm:
  - App launches on emulator or device.
  - Initial navigation stack renders (Home Dashboard, management screens).

**GFX Engine**
- Run `npm install` and `npm run dev` in `gfx-engine`.
- Confirm:
  - Browser overlay loads at `http://localhost:5173`.
  - No fatal errors in browser console on initial load.

---

## 5. Functional Test Scenarios

### 5.1 Pre-Match Management

1. **Create Tournament**
   - Create new tournament with format (e.g., T20), overs, and date range.
   - Expected: API persists tournament; scorer app shows it in lists.

2. **Create Teams & Players**
   - Create at least 2 teams.
   - Add players with roles and jersey numbers.
   - Expected: Persisted and visible in team rosters; no duplicates.

3. **Create Match**
   - Link tournament, select home/away, venue, date/time.
   - Expected: Match visible in upcoming matches on dashboard.

4. **Toss & Lineup**
   - Record toss winner and decision; select playing XI.
   - Expected: Selected XI persists and is used in match state.

### 5.2 Live Scoring Flow

1. **Start Match / First Innings**
   - Select opening batsmen and bowler.
   - Enter various deliveries (0–6 runs, wides, no-balls, wickets).
   - Expected: Current score, overs, run rate, and player stats update correctly.

2. **Undo / Edit**
   - Undo last delivery and re-enter corrected ball.
   - Expected: All derived stats (totals, strike rate, economy) recalculate correctly; no duplicate balls.

3. **Innings Break**
   - End first innings via all-out or overs completed.
   - Expected: Innings summary screen with correct totals and bowler/batter stats.

4. **Second Innings & Target**
   - Start second innings with correct target.
   - Expected: Target and required run rate reflect first innings result.

5. **Match Completion**
   - Drive match to a clear result (win by runs/wickets).
   - Expected: Match summary screen shows winner and margin correctly.

### 5.3 GFX & vMix Integration

1. **Scorebug Sync**
   - For a live match, observe GFX browser overlay during ball entry.
   - Expected: Scorebug updates within `< 500ms` of scorer input; no flicker or stale data.

2. **Milestone Popups**
   - Simulate batter reaching 50 runs.
   - Expected: Milestone popup triggers automatically with correct text and then hides cleanly.

3. **vMix JSON Feed**
   - Configure vMix Data Source with `http://localhost:3000/api/vmix/<MATCH_ID>`.
   - Expected: Keys (e.g., team scores, batter names) map correctly to titles and update at configured interval.

---

## 6. Non-Functional Evaluation

### 6.1 Latency

Target: **Scorer click → GFX update `< 500ms`**.

Planned checks:
- Measure end-to-end latency for a variety of ball types (runs, wides, wickets).
- Use browser dev tools and backend logs to estimate:
  - Scorer → backend processing time.
  - Backend → GFX/WebSocket propagation.

### 6.2 Offline Resilience

Scenarios:
- Disable network mid-over, continue scoring.
- Re-enable network and confirm:
  - Local queue of events flushes correctly.
  - No duplicate deliveries; match state on backend matches local state.

### 6.3 Error Handling & Recovery

Scenarios:
- Backend restart during live match.
- Redis outage / restart.
- Scorer app crash/restart.

Expected:
- System recovers with consistent match state (via context + backend state).
- Users receive meaningful error or reconnect messages rather than silent failures.

---

## 7. Findings & Gaps (As of v3.0 Plan)

### 7.1 Strengths

- Clear separation of concerns:
  - Backend as authoritative match state with Redis caching.
  - Scorer app optimized for 1-click ball entry and offline-first behaviour.
  - GFX engine tailored for 1920x1080 transparent overlays and animation.
- Good alignment with **broadcast-grade** requirements (scorebug, lower thirds, full screens, event popups).

### 7.2 Risks / Gaps vs. v3.0 Goals

- **Scale & Multi-Tenancy**
  - Multi-tenant data isolation and RBAC are still in design phase; QA cannot yet validate per-tenant scoping or workspace switching.
  - No automated load or soak tests defined for 100+ concurrent matches and high WebSocket connection counts.

- **Observability**
  - Centralized logging, metrics, and tracing are defined in plans but not yet implemented; limits our ability to triage production issues.
  - No out-of-the-box dashboards for match health, connection counts, or per-match latency.

- **Automation & Regression**
  - Limited or no automated end-to-end tests covering complete match lifecycle.
  - Backend tests for tournaments/matches exist but do not yet cover all edge cases (e.g., DLS, complex extras, tie/super over logic).

---

## 8. Recommendations

1. **Introduce Automated E2E Tests**
   - Use a test runner (e.g., Playwright/Cypress for web and Detox/E2E for RN) to cover:
     - Tournament → match creation.
     - Full innings scoring and summary.
     - Basic scorer ↔ GFX sync scenarios.

2. **Add Load & Soak Testing**
   - Simulate multiple concurrent matches and scorer sessions to validate:
     - WebSocket stability.
     - Redis/DB performance and resource usage.

3. **Implement Observability Baseline**
   - Standardize structured logs per ball event, plus metrics and traces.
   - Build dashboards for:
     - Active matches.
     - p95/p99 click-to-update latency.
     - Error/reconnect rates.

4. **Security & Governance Testing**
   - Once RBAC and multi-tenancy are implemented, create targeted tests to ensure:
     - Users cannot access other tenants’ matches.
     - Audit log coverage for critical actions.

---

## 9. QA Status Summary

- **Core functional flows**: Well-defined and largely implemented; require full execution and validation on a live environment.
- **Real-time behaviour**: Design is sound; needs instrumentation and measurement to confirm latency targets.
- **v3.0 scale-up**: Architectural plans are strong, but require dedicated QA for multi-tenancy, performance, and observability once implemented.

Overall, the system is **feature-complete for a strong MVP** and structurally ready for v3.0, but must invest in **automated testing, load testing, and observability** to confidently support multi-tenant, high-concurrency tournament operations. 

---

## 10. Automated Test Execution (2026-03-11)

### 10.1 Backend (`backend`)

- Command: `npm test`
- Result:
  - **Test Suites**: 1 passed / 1 total.
  - **Tests**: 2 passed / 2 total.
  - Jest reported lingering asynchronous operations (`did not exit one second after the test run`).
- Observations:
  - Multiple `[Redis] Error: getaddrinfo ENOTFOUND redis` messages were logged during the run.
  - This indicates that Redis was **not running or not reachable** at `redis://localhost:6379` while the tests executed.
- Impact:
  - Current unit/integration tests pass logically, but the Redis client remains connected, which keeps the process alive and pollutes logs.
- Follow-ups:
  - For accurate, clean runs:
    - Start Redis (via `docker-compose up` or local Redis) before running tests, **or**
    - Mock/stub the Redis layer in tests to avoid real network calls.
  - Add a test-only teardown path that closes the Redis connection after each test run.

### 10.2 Scorer App (`scorer-app`)

- Command attempted: `npm test`
- Result:
  - `npm` reported: **Missing script: "test"**.
- Impact:
  - There is **no automated test suite** configured for the scorer app at this time.
- Follow-ups:
  - Introduce a testing stack (e.g., Jest + React Native Testing Library and/or Detox/E2E) with at least:
    - Smoke tests for navigation (dashboard, management screens, live scoring).
    - Component tests for critical scoring UI (ball entry, undo, wicket modals).

### 10.3 GFX Engine (`gfx-engine`)

- No automated tests were executed in this run.
- Follow-ups:
  - Add a `test` script and minimal suite (e.g., Jest/RTL) for key components:
    - Scorebug.
    - Milestone popups.
    - Full-screen scorecards.
