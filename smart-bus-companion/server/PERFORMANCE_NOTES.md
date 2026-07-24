# Efficient Backend Performance Notes

This document highlights the architectural improvements made in Phases 17-19. Use this as a reference for explaining backend performance decisions in an interview/viva setting.

## 1. Database Query Shape & Indexes (Phase 17)
- **N+1 Avoidance**: 
  - Kept `.populate()` for relationship resolution where appropriate (e.g. `stops.stopId`), but avoided looping over DB queries manually.
  - In `busSimulator.js`, we implemented `Bus.bulkWrite()` to avoid firing N individual `updateOne` queries per simulation tick. This reduces network roundtrips between Node and MongoDB.
- **`.lean()` Execution**: 
  - Added `.lean()` to read-only queries (like `GET /api/stops`). This bypasses Mongoose's heavy document instantiation (turning BSON into full Mongoose models with getters/setters/save functions). It drastically speeds up response times for large arrays.
- **Field Selection (`.select()`)**: 
  - Over-fetching wastes RAM and network bandwidth. We explicitly added `.select('_id name location city')` where we don't need the entire document.
- **Indexing Strategy**: 
  - **`Route.js`**: Added a multi-key index on `stops.stopId`. This is critical for the `GET /api/search` endpoint which uses an `$all` query (`'stops.stopId': { $all: [from, to] }`). Without this index, Mongo would have to do a full collection scan of all routes.
  - **`Complaint.js`**: Added a compound index on `{ status: 1, category: 1 }` for the admin dashboard filtering.

## 2. Runtime Caching & Rate Limiting (Phase 18)
- **In-Memory Caching (`node-cache`)**:
  - `GET /api/stops` and `GET /api/routes/:id` are heavily read but rarely change. Adding an in-memory cache with a 1-hour TTL prevents hitting the database for every single user opening the app.
- **Rate Limiting**:
  - Implemented `express-rate-limit`. A generic limit protects the entire API from basic DoS (100 req/min). 
  - A strict limiter (20 req/min) protects expensive endpoints like `GET /api/search` (which executes geospatial and array-matching queries).
- **Socket.io Rooms vs Global Broadcast**:
  - Previously, `io.emit()` blasted every bus position to every connected client. 
  - Changed to `io.to(routeId).emit()`. Clients now explicitly `joinRoute` when they view the Track page. This saves massive amounts of bandwidth and client-side processing as the system scales.

## 3. Observability & Reliability (Phase 19)
- **Structured Logging (`pino`)**:
  - Replaced `console.log` with `pino` for structured JSON logs. In production (like Datadog/ELK), JSON logs are searchable and indexable, whereas `console.log` text is unparseable.
- **Express 5 Native Async Errors**:
  - Since we're using Express 5, unhandled promise rejections in async route handlers are natively passed to the error handler middleware, preventing the server from crashing or hanging indefinitely. We added a centralized `errorHandler.js` to format all errors consistently.
- **Graceful Shutdown**:
  - Added `process.on('SIGTERM')` handlers to close the HTTP server, Socket.io connections, and the Mongoose connection pool cleanly before the process exits. This prevents dropping in-flight requests during deployments.
- **Health Checks**:
  - `GET /api/health` now checks `mongoose.connection.readyState`. This allows orchestrators (like Kubernetes or AWS ALB) to know if the backend is genuinely healthy and ready to serve traffic.
