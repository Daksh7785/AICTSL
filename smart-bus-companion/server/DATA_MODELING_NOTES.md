# Data Modeling Notes: Smart Bus Companion

This document explains the structural design decisions and schema trade-offs made in the Smart Bus Companion application, particularly in the context of MongoDB's document model (Embedding vs. Referencing).

## 1. Route and Stops (Referencing with Eager Population)
- **Decision:** `Route` documents store an array of references to `Stop` documents (`{ stopId: ObjectId, distanceFromStartKm: Number }`).
- **Justification:** 
  - Stops are frequently shared across multiple routes (e.g., BRTS stations in Indore are part of many overlapping lines). Embedding stop documents entirely inside a `Route` would lead to massive duplication and potential anomalies if a stop's physical location changed.
  - To maintain performance without over-fetching, we use eager population in the API layer (`.populate('stops.stopId', '_id name location city')`) to retrieve just the necessary display information.

## 2. Bus and Route (Referencing with Partial Denormalization)
- **Decision:** The `Bus` model references `Route`, but denormalizes `frequencyMinutes` and `isWheelchairAccessible` at the point of creation.
- **Justification:**
  - The Bus Simulator generates a huge volume of GPS pings (updates). Looking up the parent `Route` on every location update to check frequency rules or accessibility status would bottleneck the simulator.
  - By denormalizing these specific static fields, the simulator can process updates independently and quickly using only the `Bus` document. 

## 3. Complaint and Route (Referencing with Denormalization)
- **Decision:** A `Complaint` references a `Route`, but often requires immediate lookup by admins sorting by route name.
- **Justification:**
  - Admin dashboards need to aggregate and display complaints quickly without expensive joins (`$lookup`). We keep the reference (`routeId`) for referential integrity and deep linking, but denormalize key route data where necessary to speed up table rendering.

## 4. ArrivalLog (Separate Collection)
- **Decision:** `ArrivalLog` is stored as an entirely separate, append-only collection.
- **Justification:**
  - The ETA prediction system requires querying millions of historical data points grouped by time of day, day of week, and specific stops.
  - Embedding logs inside a `Bus` or `Route` would quickly exceed the 16MB BSON limit and make aggregations extremely slow and memory-intensive.
  - As a separate collection, we can implement aggressive time-based indexing (`stopId_1_routeId_1_dayOfWeek_1_hourOfDay_1`) optimized for reading by the ETA predictor.

## 5. Referential Integrity & Soft Deletes
- **Decision:** Mongoose `pre('save')` hooks and Controller-level checks enforce referential integrity. 
- **Policy:** 
  - We use **Soft Deletes** (`deletedAt` timestamp) rather than hard deletes for `Route` and `Stop` to preserve historical data in `Complaint` and `ArrivalLog`.
  - We actively prevent the deletion of a `Stop` if it is currently part of an active `Route`, and prevent the deletion of a `Route` if active `Buses` are assigned to it.
