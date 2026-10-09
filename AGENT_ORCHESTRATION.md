# Multi-Agent System Architecture & GitHub Orchestration

> **Target Repository:** `https://github.com/jwjohnwesly5-png/safe-ride`  
> **Project:** SafeRide AI - Hardware-Free School Bus Student Safety System  
> **Architecture:** 5 Specialized Worker Agents + 1 Supervisor Orchestrator Agent (6 Total Agents)

---

## Executive Summary

To build, maintain, and scale **SafeRide AI** with maximum modularity and zero context pollution, the system is decomposed into **5 specialized domain-specific worker agents** overseen by **1 central supervisor agent**. Each agent operates within a strictly defined bounded context, responsible for a distinct layer of the technology stack.

```
                                  +----------------------------------------------------+
                                  |         SUPERVISOR AGENT (AGENT 0)                 |
                                  |     System Orchestrator & Integration Monitor      |
                                  +-------------------------+--------------------------+
                                                            |
        +-----------------------+---------------------------+---------------------------+-----------------------+
        |                       |                           |                           |                       |
        v                       v                           v                           v                       v
+---------------+       +---------------+           +---------------+           +---------------+       +---------------+
|    AGENT 1    |       |    AGENT 2    |           |    AGENT 3    |           |    AGENT 4    |       |    AGENT 5    |
| School Admin  |       | Parent Portal |           | Driver & GPS  |           | AI Vision &   |       | Notification  |
|  & Identity   |       | & Location    |           | Telematics    |           |  Multi-Factor |       |  Dispatcher   |
+---------------+       +---------------+           +---------------+           +---------------+       +---------------+
```

---

## Agent Division & Responsibility Matrix

| Agent ID | Agent Role | Core Focus & Domain | Deliverables / Modules | Primary Tech Stack |
| :--- | :--- | :--- | :--- | :--- |
| **Agent 0** | **System Orchestrator** | Integration monitoring, state sync, build validation, cross-agent API contracts. | `ARCHITECTURE.md`, CI/CD pipelines, System Integration Tests. | GitHub Actions, System Scripts |
| **Agent 1** | **School Admin & Identity Agent** | Student onboarding, parent-student linking, fleet assignment, privacy consent. | Next.js Dashboard, Student Identity CRUD, Supabase Auth. | Next.js 14, TypeScript, Tailwind |
| **Agent 2** | **Parent Portal & Location Agent** | GPS pickup/drop pin registration, live transit timeline, parent alert view. | Parent Flutter App, Mapbox Pin Selector, Attendance View. | Flutter, Mapbox GL SDK |
| **Agent 3** | **Driver Telematics & Geofence Agent** | Bus route initiation, continuous GPS background stream, PostGIS geofence trigger. | Driver Flutter App, Telematics Service, PostGIS Queries. | Flutter, Location API, PostGIS |
| **Agent 4** | **AI Vision & Multi-Factor Agent** | On-device face embedding extraction, 5-Factor verification rule engine, manual override UI. | MobileFaceNet Camera Bridge, MFV Rules Engine, HUD Overlay. | Flutter Camera, TFLite/MobileFaceNet |
| **Agent 5** | **Notification & Event Dispatcher** | Two-stage FCM push notifications, WebSocket realtime engine, audit logging. | Node.js FCM Dispatcher, Supabase Realtime Listeners. | Node.js, Firebase Cloud Messaging |

---

## Detailed Agent Profiles & Operating Instructions

### Agent 0: System Orchestrator & Integration Monitor (Supervisor)
- **Objective:** Maintain systemic integrity, enforce database schemas, monitor API contract adherence across all subagents, and validate end-to-end integration workflows.
- **Key Responsibilities:**
  1. Define and enforce PostgreSQL / Supabase DDL schema migrations.
  2. Verify that data models used by Agent 1, 2, 3, 4, and 5 stay strictly synchronized.
  3. Run continuous integration sanity checks on cross-agent events (e.g., Geofence Arrival ➔ FCM Push ➔ Boarding Scan ➔ Dashboard Sync).
  4. Provide conflict resolution if two subagents modify overlapping interfaces.
- **System Prompt Fragment:**
  ```text
  You are Agent 0, the Lead Architect and Supervisor Agent for SafeRide AI.
  Your responsibility is to ensure seamless integration between the 5 worker agents.
  You monitor API contracts, enforce PostGIS and vector schema validity, and ensure that no agent breaks the 5-Factor Safety Logic.
  ```

---

### Agent 1: School Management & Identity Admin Agent
- **Objective:** Develop the central management Web Portal for school administrators to onboard students, capture consent, manage fleets, and inspect transit records.
- **Key Responsibilities:**
  1. Build Next.js 14 Web Portal interface with role-based authentication (Admin role).
  2. Implement student enrollment forms, capturing bio-data, parent association, and biometric consent.
  3. Create bus fleet manager to create route waypoints, assign drivers, and bind student rosters.
  4. Develop real-time fleet analytics dashboard showing active buses, onboard student counts, and safety exceptions.
- **Directory Scope:** `apps/admin-web/`, `lib/supabase/identity.ts`
- **System Prompt Fragment:**
  ```text
  You are Agent 1 (School Admin & Identity Agent).
  Your task is to build the Next.js administration portal.
  Ensure zero raw photo storage (only 512-d vector bindings) and enforce strict Row Level Security (RLS) policies for school management.
  ```

---

### Agent 2: Parent Portal & Location Registration Agent
- **Objective:** Build the Parent Mobile Application focused on GPS location registration, live bus tracking, and transparent transit history.
- **Key Responsibilities:**
  1. Develop Flutter mobile app screens for Parent role authentication.
  2. Implement interactive Mapbox GPS pickup point picker allowing parents to confirm latitude/longitude coordinates.
  3. Build real-time child status screen showing live bus location during active routes.
  4. Construct historical event timeline displaying Geofence Arrival, Verified Boarding, and Drop-off timestamps.
- **Directory Scope:** `apps/parent-mobile/`, `lib/maps/picker.dart`
- **System Prompt Fragment:**
  ```text
  You are Agent 2 (Parent Portal & Location Agent).
  You build the Flutter parent application.
  Prioritize UX clarity for non-technical parents, interactive map coordinate selection, and instant display of incoming push notifications.
  ```

---

### Agent 3: Driver Telematics & Geofencing Engine Agent
- **Objective:** Engineer the driver-facing route navigation system and low-latency background GPS telemetry engine.
- **Key Responsibilities:**
  1. Build Flutter Driver App route selection and start/pause/end route controls.
  2. Implement high-accuracy background GPS streaming service posting coordinates to backend every 5 seconds.
  3. Write PostGIS spatial query triggers (`ST_DWithin`) calculating distance between bus GPS and student stop coordinates.
  4. Emit `GEOFENCE_ARRIVAL` events when bus enters $\le 50\text{m}$ radius of a registered stop.
- **Directory Scope:** `apps/driver-mobile/`, `services/telematics/`, `database/spatial_queries.sql`
- **System Prompt Fragment:**
  ```text
  You are Agent 3 (Driver Telematics & Geofence Agent).
  Your focus is high-efficiency GPS tracking and PostGIS spatial queries.
  Ensure battery-efficient background location streaming and robust handling of temporary cellular signal drops.
  ```

---

### Agent 4: Multi-Factor Verification & AI Vision Agent
- **Objective:** Implement the on-device biometric extraction engine and the 5-Factor Verification rule evaluation system.
- **Key Responsibilities:**
  1. Integrate lightweight MobileFaceNet TFLite model into Flutter camera bridge for on-device 512-d feature vector extraction ($\le 300\text{ms}$).
  2. Implement the **Multi-Factor Verification (MFV) Engine**:
     - Factor 1: Face Vector Cosine Similarity ($S \ge 0.82$)
     - Factor 2: Driver GPS inside Stop Geofence ($\le 50\text{m}$)
     - Factor 3: Student assigned to current Bus ID
     - Factor 4: Student on current Stop Roster
     - Factor 5: Active Route Timestamp Window
  3. Build Driver Camera HUD (Green box for Verified, Red box for Mismatch/Wrong Bus).
  4. Develop human-in-the-loop manual override interface with mandatory reason logging.
- **Directory Scope:** `apps/driver-mobile/lib/vision/`, `lib/mfv_engine/`
- **System Prompt Fragment:**
  ```text
  You are Agent 4 (AI Vision & Multi-Factor Agent).
  You own the face feature extraction pipeline and the 5-Factor Safety Logic.
  Never allow face recognition alone to confirm boarding without validating assigned bus, stop geofence, and active schedule.
  ```

---

### Agent 5: Real-Time Event Dispatcher & Notification Agent
- **Objective:** Construct the cloud event hub responsible for Firebase Cloud Messaging (FCM) push notification delivery and real-time WebSocket dashboard sync.
- **Key Responsibilities:**
  1. Build event consumer listening to Supabase `transit_events` database triggers.
  2. Construct two-stage notification dispatcher:
     - **Alert #1:** Triggered by `GEOFENCE_ARRIVAL` ➔ "Bus 05 has arrived at Alex's pickup point."
     - **Alert #2:** Triggered by `BOARDING_VERIFIED` ➔ "Boarding Confirmed: Alex safely boarded Bus 05 at 7:42 AM."
     - **Alert #3:** Triggered by `DROP_OFF_VERIFIED` ➔ "Drop-Off Confirmed: Alex dropped off at 4:15 PM."
  3. Integrate Firebase Cloud Messaging (FCM) Node.js SDK with device token routing.
  4. Broadcast event payloads to Supabase Realtime channels for live web dashboard updates.
- **Directory Scope:** `services/notification-dispatcher/`, `lib/fcm/`
- **System Prompt Fragment:**
  ```text
  You are Agent 5 (Notification & Event Dispatcher Agent).
  You handle low-latency messaging via FCM and WebSockets.
  Ensure push notifications are delivered in under 1 second with robust deduplication to prevent spamming parents.
  ```

---

## Inter-Agent Communication & Data Schema

```
[Agent 1: Admin]  --->  Registers Student & 512-d Vector  --->  [PostgreSQL DB]
[Agent 2: Parent] --->  Registers GPS Coordinates         --->  [PostgreSQL DB]
[Agent 3: Driver] --->  Streams GPS Coordinates           --->  [PostGIS Engine] ──> Emits GEOFENCE_ARRIVED ──> [Agent 5: FCM]
[Agent 4: Vision] --->  Scans Face & Validates MFV       --->  [PostgreSQL DB] ──> Emits BOARDING_VERIFIED ──> [Agent 5: FCM]
                                                                        │
                                                                        v
                                                               [Agent 0: Supervisor]
                                                            (Validates System Sync)
```

---

## Repository File Structure for GitHub (`jwjohnwesly5-png/safe-ride`)

```text
safe-ride/
├── README.md                          # Hackathon Master Specification
├── AGENT_ORCHESTRATION.md            # Multi-Agent Architecture & Prompts
├── .github/
│   └── workflows/
│       ├── integration-check.yml      # Automated Agent Contract Verification
│       └── build-test.yml             # Flutter & Next.js Build Pipeline
├── apps/
│   ├── admin-web/                     # Agent 1 (Next.js Admin Dashboard)
│   │   ├── src/
│   │   │   ├── app/                   # App Router Pages
│   │   │   └── components/            # Student Roster, Fleet Maps
│   │   └── package.json
│   ├── parent-mobile/                 # Agent 2 (Flutter Parent App)
│   │   ├── lib/
│   │   │   ├── screens/               # Map Picker, Child Timeline
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   └── driver-mobile/                 # Agent 3 & 4 (Flutter Driver App)
│       ├── lib/
│       │   ├── vision/                # Agent 4: MobileFaceNet Scanner
│       │   ├── telematics/            # Agent 3: Background GPS Streamer
│       │   └── main.dart
│       └── pubspec.yaml
├── services/
│   └── notification-dispatcher/       # Agent 5 (Node.js FCM Service)
│       ├── src/
│       │   ├── fcm.ts                 # Firebase Cloud Messaging Logic
│       │   └── index.ts               # Event Listener
│       └── package.json
├── database/
│   ├── schema.sql                     # PostgreSQL Table Definitions & Enums
│   ├── postgis_triggers.sql           # Geofence Sphere Math Functions
│   └── rls_policies.sql               # Supabase Row Level Security Rules
└── docs/
    ├── api_spec.md                    # REST & WebSocket API Schema
    └── judging_pitch.md               # Presentation Deck & Q&A Notes
```

---

## Steps to Push this Multi-Agent System to GitHub

Execute the following commands in your local repository terminal to initialize and push to `https://github.com/jwjohnwesly5-png/safe-ride`:

```bash
# 1. Initialize local git repository if not already done
git init

# 2. Add remote repository
git remote add origin https://github.com/jwjohnwesly5-png/safe-ride.git

# 3. Stage documentation and agent orchestration specs
git add README.md AGENT_ORCHESTRATION.md

# 4. Commit files
git commit -m "feat: initial commit of SafeRide AI master spec & 5-agent orchestration architecture"

# 5. Push to main branch
git branch -M main
git push -u origin main
```

---
*SafeRide AI Multi-Agent Architecture Document.*
