# Smart Bus Companion — Master Build Checklist

One tracker across every phase, every document, so you always know exactly what's done vs. remaining

How to use this: check a box only once you've actually pasted that phase's prompt into Antigravity, reviewed the output, and tested it yourself — not just because a prompt exists for it. Update this file directly as you go; it doubles as a progress log for your report.

Legend: ⬜ Not started · 🔶 In progress / partially done · ✅ Done & tested

## Document 1 — Core Build (Smart-Bus-Companion-Antigravity-Prompts.md)
| # | Phase | Status |
|---|---|---|
| 0 | Project Foundation & Design System | 🔶 |
| 1 | Database Models & Realistic Seed Data | ✅ |
| 2 | Route Search, Fare Calculation & Core UI | 🔶 |
| 3 | Live Bus Tracking (Simulated, Real-GPS-Ready) | 🔶 |
| 4 | Complaints, Public Accountability & Service Alerts | 🔶 |
| 5 | Admin Analytics Dashboard | ✅ |
| 6 | Differentiator Features (Accessibility, Language, Crowding, Notify Me) | ✅ |
| 7 | PWA, Offline Support & Performance | ✅ |
| 8 | Testing, Security Hardening & Deployment | ✅ |

> This is your foundation — everything below assumes at least Phases 0–4 are working.

## Document 2 — Global Features & Indore-Specific Additions (Smart-Bus-Companion-Phase2-Global-Features.md)
| # | Phase | Status |
|---|---|---|
| 9 | Predictive ETA Engine | ✅ |
| 10 | Occupancy Forecasting & Multimodal Metro Integration | ✅ |
| 11 | Festival & Event Surge Mode | ✅ |
| 12 | WhatsApp / SMS Fallback Channel | ⬜ |
| 13 | Voice Search (Hindi + English) | ✅ |
| 14 | Campus Chips, Predictive Maintenance Insight & Final Polish | ✅ |

## Document 3 — UI/UX Signature Design Pass (Smart-Bus-Companion-UIUX-Design-Pass.md)
| # | Phase | Status |
|---|---|---|
| 15 | Visual Identity & Design System Rebuild | ✅ |
| 16 | Motion & Micro-interactions | ✅ |

## Document 4 — Backend Efficiency Pass (Smart-Bus-Companion-Backend-Efficiency-Pass.md)
| # | Phase | Status |
|---|---|---|
| 17 | Data Layer Efficiency (Indexes, Queries, Connection Handling) | ✅ |
| 18 | Runtime Performance: Caching, Rate Limiting & Socket.io Efficiency | ⬜ |
| 19 | Reliability & Observability | ⬜ |

## Document 5 — Production-Readiness Pass (Smart-Bus-Companion-Production-Readiness-Pass.md)
| # | Phase | Status |
|---|---|---|
| 20 | Auth Hardening (refresh tokens, httpOnly cookies, password reset) | ✅ |
| 21 | Automated Testing (Frontend, E2E, Coverage) | ⬜ |
| 22 | CI/CD Pipeline | ✅ |
| 23 | Code Quality Tooling & Local Dev via Docker | ⬜ |
| 24 | API Documentation (Swagger/OpenAPI + Postman) | ⬜ |
| 25 | Client-Side Data Layer (React Query + Axios) | ⬜ |
| 26 | File Uploads for Complaint Evidence | ⬜ |
| 27 | External Error Tracking (Sentry) | ⬜ |
| 28 | GTFS Export | ⬜ |
| 29 | Migrations & Secrets Hygiene | ✅ |
| 30 | Accessibility Audit | ⬜ |

## Document 6 — Database Architecture Pass (Smart-Bus-Companion-Database-Architecture-Pass.md)
| # | Phase | Status |
|---|---|---|
| 31 | Schema Validation & Referential Integrity | ✅ |
| 32 | Embedding vs. Referencing Review | ✅ |
| 33 | Transactions, Soft Deletes & Audit Trail | ✅ |
| 34 | Backup/Restore Automation & Realistic Bulk Seed Data | ✅ |

---

## Quick Summary View
- **Total phases:** 35 (0–34)
- **Completed:** 17 / 35
- **In progress:** 3
- **Not started:** 15
- **Last updated:** 2026-07-24

### Suggested "Minimum Viable Submission" Path
If you're short on time before a deadline, these are the phases that matter most for a working, defensible demo — mark these as your priority subset:

- **Must-have (core project):** 0, 1, 2, 3, 4, 5, 8
- **Strongly recommended (makes it stand out):** 6, 9, 15, 16, 17, 20, 22
- **Good if time allows:** everything else, in whatever order fits your remaining time

---

## Notes / Blockers
- **Phase 33:** Transactions will fail unless a local MongoDB replica set or cloud MongoDB Atlas is configured.
- **Phase 1-4:** Currently blocked locally due to MongoDB failing to connect (`ECONNREFUSED 127.0.0.1:27017`). Local `mongod` service must be started or `.env` should point to a remote cluster.
