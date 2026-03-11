# PRD: CricCast SaaS (Cricket Scoring & vMix GFX Engine)

## 1. Executive Summary

**CricCast** is a cloud-based SaaS platform that bridges the gap between live cricket scoring and professional broadcast graphics. It provides a real-time, highly intuitive ball-by-ball scoring interface that automatically feeds live data into vMix via API and dynamic data sources. This allows broadcasters to generate premium on-screen graphics (scorebugs, lower thirds, player stats, wagon wheels) without needing expensive, specialized broadcast hardware.

## 2. Target Audience

- **Independent Broadcasters & Production Companies:** Freelance producers using vMix to stream local or regional cricket tournaments on YouTube/Facebook.
- **Cricket Associations & Leagues:** Semi-pro and amateur leagues looking to elevate their live stream quality.

## 3. Problem Statement

Professional sports graphics usually require dedicated software (like Chyron or Vizrt) and specialized operators, which is cost-prohibitive for smaller productions. Existing cricket scoring apps are designed for record-keeping, not live broadcasting. Producers currently have to manually update titles in vMix, which leads to delays, errors, and a high cognitive load during a fast-paced T20 or T10 match.

## 4. Key Capabilities & Features

### 4.1. Pre-Match Setup & Management

- **Tournament & Match Creation:** Ability to set match formats (Test, ODI, T20, T10, Custom).
- **Team & Roster Management:** Bulk import players via CSV. Store player headshots, roles (Batsman, Bowler, All-rounder), and career stats.
- **Toss & Lineup Selection:** Record toss winner, decision (bat/bowl), and select playing XI + substitutes.

### 4.2. Live Scoring Engine (The Scorer's Interface)

- **One-Click Ball Entry:** Fast-action buttons for Runs (0-6), Extras (WD, NB, B, LB), and Wickets.
- **Advanced Tracking:** \* **Wagon Wheel Data:** Visual UI to log where the ball was hit.
- **Pitch Map Data:** Visual UI to log where the ball pitched (short, good, full, etc.).

- **Match State Management:** Automatic calculation of strike rates, economies, run rates (CRR/RRR), and DLS (Duckworth-Lewis-Stern) par scores.
- **Undo/Edit Functionality:** Critical for live environments to quickly correct scoring mistakes without breaking the graphics feed.

### 4.3. vMix GFX Integration Engine

- **Data Source Generation:** The backend instantly generates a continuously updating JSON or XML URL for vMix Data Sources.
- **vMix API Triggers:** Integration with vMix Web Controller API to automatically trigger specific title animations (e.g., automatically animating in a "WICKET" graphic when the scorer clicks 'Out').
- **Pre-built vMix Title Templates:** Downloadable `.gtzip` (vMix Title Designer) files that are pre-mapped to the SaaS data fields.

### 4.4. Graphics Output Types (Data Fields Provided)

- **Scorebug:** Live score, overs, current batter scores, bowler figures, CRR, target.
- **Lower Thirds:** Player names, headshots, tournament branding.
- **Full Screen/Squeeze Backs:** Batting cards, bowling cards, point tables, match summaries.
- **Milestones:** Auto-triggers for 50s, 100s, 5-wicket hauls, and team milestones (e.g., 100 up).

## 5. System Architecture & Data Flow

1. **Input:** Scorer taps a button on the React/Vue web application (e.g., "4 Runs").
2. **Processing:** SaaS Backend (Node.js/Python) updates the match database and calculates new stats (batsman moves to 44, team score increases, run rate updates).
3. **Delivery:** The updated state is pushed via WebSockets to a dedicated JSON endpoint.
4. **Output:** vMix reads the JSON Data Source locally, instantaneously updating the mapped text fields on the live broadcast graphics.

## 6. Non-Functional Requirements

- **Latency:** Data update from scorer click to JSON endpoint update must be `< 500ms`.
- **Offline Resilience:** The scoring app should cache actions locally (via Service Workers/Local Storage) if the internet drops, syncing instantly once restored, to ensure the match state is never lost.
- **Security:** Token-based authentication for the JSON data feeds so external parties cannot hijack a broadcaster's graphics data.

## 7. v3.0 Major Release Objectives (Scale-Up)

### 7.1 Business & Product Goals
- **Multi-tenant SaaS:** Support multiple leagues/organizations, each with isolated data, branding, and user roles.
- **Production-grade reliability:** Target at least 99.5% uptime during tournament windows with graceful degradation for non-critical features.
- **Operational visibility:** Provide live fleet health views (active matches, scorer connectivity, GFX status) to support teams.

### 7.2 Scalability & Capacity Targets
- Handle **100+ concurrent live matches** globally with consistent sub-500ms scorer-to-GFX latency.
- Support **500–1,000 concurrent scorer clients** and GFX browser inputs without degraded performance.
- Design APIs and data models to scale to **millions of deliveries per month** without manual partitioning.

### 7.3 Reliability & Observability
- Implement structured logging and tracing for every ball event (request ID, match ID, tenant ID, scorer ID).
- Add metrics for WebSocket connection counts, reconnect rates, and per-match update latency (p50/p90/p99).
- Define alerting rules for stalled matches (no events > X minutes), high error rates, or degraded cache/database performance.

### 7.4 Security, Compliance & Governance
- Enforce RBAC and per-tenant scoping for all scorer and admin actions.
- Provide audit logs for critical changes (score edits, match result overrides, tournament configuration).
- Harden public endpoints with WAF/rate limiting and implement secure key rotation for data feed tokens.

## 8. Out of Scope for MVP (Future Roadmap)

- Automated Hawk-Eye or ball-tracking camera integration.
