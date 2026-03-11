# CricCast: Professional Cricket Broadcasting SaaS

CricCast is an end-to-end, ultra-low latency software suite designed to bring television-quality cricket broadcasting to local and amateur tournaments. It bridges the gap between field-side scoring and live streaming production software (like vMix and OBS).

## 🏏 Ecosystem Architecture

The ecosystem consists of three interconnected services, all communicating seamlessly in real-time.

1. **Backend API & WebSocket Server (`/backend`)**
   - Built on Node.js, Fastify, and Prisma (PostgreSQL).
   - Responsible for managing tournament hierarchies, saving ball-by-ball data, and maintaining the real-time Match State.
   - Utilizes Redis for sub-millisecond caching of the active match state and Socket.io for live broadcasting to clients.

2. **Scorer App MVP (`/scorer-app`)**
   - A React Native (Expo) tablet application designed for the on-field scorer.
   - Focuses on a 1-click execution interface to minimize the time between a ball being bowled and the score updating on the live stream.
   - Built with an offline-first architecture via `AsyncStorage` and idempotency keys to ensure spotty pavilion Wi-Fi doesn't drop balls or duplicate runs.

3. **GFX Broadcast Engine (`/gfx-engine`)**
   - A React+Vite application meant to act purely as a "Web Browser Input" in live production software (vMix/OBS).
   - Engineered specifically for a 1920x1080 transparent canvas.
   - Driven by `framer-motion` for buttery smooth broadcast animations (rolling numbers, drop-down popups, staggered scorecards).
   - Entirely autonomous during the match: it listens to Socket.io events and renders Scorebugs, Milestone popups (e.g., automatically detecting a player hitting 50 runs), and lower thirds.

---

## 📦 v3.0 Scale-Up Overview

The v3.0 release focuses on evolving CricCast from a single-production tool into a **multi-tenant, production-grade SaaS**:

- **Multi-tenancy & RBAC:** Isolated workspaces for leagues/organizations with role-based access (Owner, Admin, Scorer, Analyst).
- **Scalability:** Architecture and infrastructure designed to handle 100+ concurrent live matches and hundreds of scorer/GFX clients.
- **Reliability & Observability:** First-class monitoring, alerting, and audit logging to support professional broadcast operations.

See `PRD.md`, `Design_Documentation.md`, and `Project_timeline.md` for the detailed v3.0 requirements, architecture, and roadmap.

---

## 🚀 Getting Started

Ensure you have Node.js (v20+), Docker, and Expo CLI installed on your machine.

### Quick Start: Launching the Entire Ecosystem
To run the full project locally, you will need to open three separate terminal windows from the root `cric_cast` directory:

1. **Terminal 1 (Backend - Docker):**
   ```bash
   cd backend && docker-compose up -d --build
   ```
2. **Terminal 2 (GFX Broadcast Engine):**
   ```bash
   cd gfx-engine && npm install && npm run dev
   ```
3. **Terminal 3 (Scorer App):**
   ```bash
   cd scorer-app && npm install && npx expo start
   ```

---

### 1. The Backend
The backend utilizes Docker Compose to spin up the Node API, a PostgreSQL database, and a Redis cache identically in development and production.

```bash
cd backend
# Create a .env file based on .env.example if required, then:
docker-compose up -d --build
```
*The API will be available at `http://localhost:3000`*

### 2. The GFX Engine
Runs a high-performance local web server.

```bash
cd gfx-engine
npm install
npm run dev
```
*The canvas will be available at `http://localhost:5173`*

### 3. The Scorer App
Runs via Expo. Can be opened in iOS Simulator, Android Emulator, or directly on a tablet using the Expo Go app.

```bash
cd scorer-app
npm install
npx expo start
```

---

## 🎥 vMix Integration Guide

CricCast is designed with professional broadcasting in mind. There are two distinct ways to feed data into your vMix production:

### Method 1: The Modern Way (Browser Source)
This is the recommended approach. Let the CricCast GFX Engine handle all the complex rendering and animations.

1. In vMix, click **Add Input** -> **Web Browser**.
2. Enter your Match URL: `http://localhost:5173/match/<YOUR-MATCH-UUID>` 
   *(Replace localhost with your hosted URL in production)*
3. Set Width to `1920` and Height to `1080`.
4. Ensure **Transparent Background** is checked.
5. Overlay this input over your camera feeds. Whenever the scorer taps a button, the graphics will animate autonomously.

> **Why the unique URL?**
> The `/match/<UUID>` routing guarantees that your broadcast overlay is isolated to your specific game, ensuring no rogue data bleeds in if multiple matches are happening on the SaaS platform simultaneously.

### 4. Deploying the GFX Engine to CDN
For production, the Vite React app should be deployed to a global CDN such as **Netlify** or **Cloudflare Pages**. 
A `public/_redirects` file is included to ensure that specific vMix URLs (e.g., `/match/123`) correctly load the SPA and don't return 404 errors.

```bash
cd gfx-engine
npm run build
# Upload the resulting /dist folder to Netlify or Cloudflare Pages
```

### Method 2: Legacy Workflows (Data Sources Manager)
If your production team already has established `.gtzip` animated templates built in vMix Title Designer and you purely need raw data:

1. In vMix, open the **Data Sources Manager**.
2. Add a new **JSON** data source.
3. Enter the URL: `http://localhost:3000/api/vmix/<YOUR-MATCH-UUID>`
4. Set the update interval to `500` ms.
5. Map these flat keys (e.g., `team1_score`, `striker1_name`) directly to your text blocks in the Title Designer.

---

## 🛠 Tech Stack Details

**Data Base:** PostgreSQL (Persistent), Redis (Ephemeral/Real-time)
**ORM:** Prisma (Pinned to v6.4 to maintain schema structure compatibility)
**API:** Node.js, Fastify
**Real-Time:** Socket.io
**Scoring Client:** Expo, React Native, Nativewind
**Broadcast Client:** React, Vite, Framer Motion, TailwindCSS
