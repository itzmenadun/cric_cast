# Design Document: ICC-Tier Broadcast Graphics Engine

## 1. Visual Philosophy & UI Guidelines

ICC-level graphics are defined by clarity, modularity, and smooth motion. The viewer needs to instantly process dense statistics without the action being obscured.

- **Typography:** Use highly legible, heavy sans-serif fonts (like Roboto Condensed, Montserrat, or custom broadcast fonts) for numbers. Use standard tracking for names.
- **Color Palette:** Establish a primary tournament color (e.g., ICC Blue), a secondary accent (Gold/Silver), and high-contrast team colors. Gradients should be subtle, avoiding "flat" web design in favor of slight 3D depth or glassmorphism.
- **Safe Areas:** All critical data must sit within the inner 90% Title Safe Area of a 1920x1080 canvas.

## 2. System Architecture: The Web-to-vMix Pipeline

This architecture utilizes a front-end framework to render the visuals and handle animations, creating a dynamic overlay.

1. **The Rendering Engine:** A single-page application (SPA) built specifically for a 1920x1080 transparent canvas.
2. **vMix Integration:** In vMix, add a "Web Browser" input. Point the URL to the hosted rendering engine (e.g., `localhost:3000/gfx`). Set the resolution to 1920x1080 and ensure "Transparent Background" is checked.
3. **Data Ingestion:** The SPA maintains an open WebSocket connection to the scoring backend. When the scorer logs a delivery, the WebSocket pushes the new JSON state to the SPA.
4. **State Management:** The SPA updates its internal state, triggering the relevant UI components to re-render or animate.

## 3. Core Component Library (The GFX Inventory)

Each graphic should be an isolated component that listens to specific parts of the global match state.

### 3.1. The Scorebug (Always-On Graphic)

- **Position:** Bottom-center or Bottom-left (L-Bar style).
- **Elements:** \* Batting Team Score (e.g., `IND 145/2`).
- Overs (e.g., `18.4 Ovs`).
- Current Run Rate (CRR).
- Target/Required Run Rate (if 2nd Innings).
- Active Batsmen (Runs/Balls faced).
- Active Bowler (Wickets-Runs-Overs).
- Recent Balls (The "worm" of the last 6 deliveries: `1 | 0 | W | 4 | 1 | 2`).

### 3.2. Lower Thirds (LTs)

- **Player Identification:** Headshot, Name, Role (Batter/Bowler).
- **Tournament Branding:** Subtle logo watermark.
- **Contextual Stats:** If a bowler comes on, show their spell figures or tournament wickets.

### 3.3. Full Screens & Squeeze Backs

- **Toss Graphic:** Team captains, coin result, and decision.
- **Playing XI:** List of 11 players + impact substitutes, often utilizing a multi-page auto-scroll.
- **Batting/Bowling Scorecards:** Detailed breakdowns triggered at the end of an innings or match.
- **Points Table:** Dynamic tournament standings.

### 3.4. Event-Triggered Popups

- **Milestones:** 50, 100, 5-Wicket Haul. These should temporarily overtake the screen space with celebratory animations before shrinking back into the scorebug.
- **Wicket Transitions:** High-impact "OUT" graphic that displays the method of dismissal (e.g., `Caught Smith b Starc`).

## 4. Animation & Transition Logic

In high-end broadcasts, graphics never simply "pop" onto the screen. They require precise, physics-based animation libraries (like GSAP or Framer Motion).

- **In-Transitions:** Elements should slide in from off-screen or unfold (e.g., a central bar expands outward to reveal the score).
- **Out-Transitions:** Smooth fade-outs or sliding collapses before a new graphic takes its place.
- **Value Interpolation:** When a score goes from `145` to `149` (a boundary), the numbers should rapidly roll or flip rather than instantly swapping, drawing the viewer's eye to the update.
- **Component Mounting:** The WebSocket payload must dictate which component is currently "mounted" (visible).

## 5. Data Payload Structure (Example)

The rendering engine relies on a strictly typed JSON payload to ensure the graphics never break mid-broadcast.

```json
{
  "match_state": "LIVE",
  "batting_team": {
    "abbr": "SL",
    "score": 210,
    "wickets": 4,
    "overs": 42.3,
    "color": "#005EB8"
  },
  "current_strikers": [
    { "name": "C. Asalanka", "runs": 65, "balls": 58, "on_strike": true },
    { "name": "K. Mendis", "runs": 12, "balls": 18, "on_strike": false }
  ],
  "current_bowler": {
    "name": "J. Bumrah",
    "overs": 8.3,
    "runs_conceded": 34,
    "wickets": 2
  },
  "active_graphic": "SCOREBUG"
}
```

## 6. v3.0 Architecture for Scale

### 6.1 Multi-Tier, Multi-Tenant Backend
- The scoring backend exposes a **multi-tenant API** where all match, tournament, and graphics data is scoped by `tenantId` (league/organization).
- A dedicated **Match State Service** manages active matches in memory/Redis, decoupled from the persistence layer to support high write throughput.
- Read-heavy endpoints (public scorecards, vMix JSON feeds) are served via cached projections to protect the primary OLTP database.

### 6.2 WebSocket Fan-Out Strategy
- Scorer and GFX clients connect via Socket.io to region-local WebSocket gateways.
- Gateways publish updates to a message bus (e.g., Redis Pub/Sub or a managed streaming service), which fan out to all subscribers for a given `matchId`.
- Connection lifecycle (join/leave, reconnects) is tracked to provide real-time visibility into active production sessions.

### 6.3 Reliability & Failure Recovery
- Match state snapshots are periodically persisted (e.g., every N balls or on over completion) so GFX and scorers can reconstruct state after crashes.
- On reconnect, clients request the authoritative match snapshot plus a compact event log (missed deliveries) to reconcile any divergence.
- Deployments follow canary/blue-green patterns to ensure zero-downtime releases for live tournaments.

### 6.4 Security & Governance
- All WebSocket and HTTP traffic is authenticated using short-lived tokens, with per-tenant RBAC enforced in the backend.
- Sensitive operations (score edits, result overrides) emit audit events that are stored separately from hot match data.
- vMix/browser URLs include signed tokens with expiry and limited scopes (read-only, specific match, specific tenant).
