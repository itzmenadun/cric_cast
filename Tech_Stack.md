# Tech Stack & Architecture Design: Real-Time Cricket GFX Platform

To achieve an ICC-level broadcast standard while remaining cost-effective, scalable, and stable, the system must prioritize low-latency data transfer and modular rendering. Standardizing on a JavaScript/TypeScript ecosystem across the board minimizes context switching and accelerates development, making an aggressive 12-week roadmap from concept to live production highly achievable.

## 1. Frontend: The Scorer's Interface (Input)

**Recommendation: React Native (via Expo)**

- **Why it's appropriate:** It allows for a single codebase to deploy to both iOS and Android tablets/phones. Scorers at the ground need a highly responsive, touch-friendly UI.
- **Cost-Effectiveness:** Halves the development time compared to building native Swift and Kotlin apps separately.
- **Stability Feature:** Implement `WatermelonDB` or standard `AsyncStorage` for an offline-first architecture. If the scorer's internet connection drops at the ground, deliveries are cached locally and synced instantly upon reconnection, ensuring zero data loss.

## 2. Frontend: The GFX Rendering Engine (Output)

**Recommendation: React.js (built with Vite) + Framer Motion**

- **Why it's appropriate:** A React-based web app is the perfect vehicle for vMix's Web Browser input. It handles complex state changes seamlessly. Framer Motion provides the physics-based animation capabilities required for premium, broadcast-quality transitions (like numbers rolling or scorebugs smoothly expanding).
- **Scalability:** Because this runs locally inside the broadcaster's vMix machine, the rendering compute load is entirely offloaded from your servers. Your cloud only needs to deliver lightweight JSON data.

## 3. Backend: Real-Time Engine & API

**Recommendation: Node.js (TypeScript) + Fastify + Socket.io**

- **Why it's appropriate:** Node.js is inherently event-driven and non-blocking, making it the industry standard for real-time WebSocket applications. Fastify offers significantly higher throughput than Express.
- **Cost-Effectiveness:** Shares the same language as your React and React Native frontends, allowing developers to work full-stack without friction.
- **Stability:** Socket.io handles automatic fallbacks to HTTP long-polling if restrictive stadium firewalls block standard WebSocket connections.

## 4. Database & Caching Layer

**Recommendation: PostgreSQL + Redis**

- **Relational Data (PostgreSQL):** Cricket is heavily relational (Tournaments -> Matches -> Innings -> Overs -> Balls -> Players). Designing robust database schemas in Postgres ensures absolute data integrity for complex career statistics and tournament leaderboards.
- **Real-time State (Redis):** The current live state of a match (current score, striker, non-striker, bowler) should be stored in a Redis in-memory cache.
- **How they work together:** When a scorer taps "4 Runs", the backend updates the permanent Postgres database asynchronously, but instantly updates the Redis cache and broadcasts that cached state to vMix via WebSockets, ensuring sub-500ms latency.

## 5. Cloud Infrastructure & Hosting

**Recommendation: AWS (App Runner + RDS/ElastiCache) OR Railway/Render**

- **For the fastest setup (Cost-Effective MVP):** Use Platform-as-a-Service (PaaS) like **Render** or **Railway**. They allow you to deploy Node.js, PostgreSQL, and Redis with zero DevOps overhead, auto-scaling seamlessly as concurrent match volume increases.
- **For maximum scale (Enterprise):** If the platform scales to hundreds of simultaneous weekend club matches, AWS App Runner (for containerized Node.js) paired with managed RDS (Postgres) and ElastiCache (Redis) provides infinite horizontal scaling.
- **GFX App Hosting:** Host the React GFX web app on **Vercel** or **Cloudflare Pages** for free/negligible cost on a global CDN.

## 6. Stability & Redundancy Demands

To ensure the system never fails mid-broadcast:

1.  **Idempotent API Design:** If a scorer's app accidentally sends the same delivery twice due to a network glitch, the backend must recognize the duplicate request ID and ignore it, preventing phantom runs from appearing on the broadcast.
2.  **Stateless WebSockets:** If the Node.js server restarts or crashes, the vMix React app must automatically reconnect, request the latest match state from Redis, and re-render the graphics without the producer needing to refresh the vMix input.
