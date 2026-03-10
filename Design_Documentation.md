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
