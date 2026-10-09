# SafeRide AI: Master Prompt & Multi-Agent Task Division

> **GitHub Repository:** `https://github.com/jwjohnwesly5-png/safe-ride`  
> **Document Purpose:** Documentation of the original hackathon project prompt, multi-agent architecture breakdown, and individual agent prompts/tasks for GitHub deployment.

---

## Table of Contents
1. [Original Hackathon Master Prompt](#1-original-hackathon-master-prompt)
2. [Multi-Agent System Overview](#2-multi-agent-system-overview)
3. [Agent 0: Supervisor & Integration Monitor Agent (The Overseer)](#3-agent-0-supervisor--integration-monitor-agent-the-overseer)
4. [Agent 1: School Management & Identity Admin Agent](#4-agent-1-school-management--identity-admin-agent)
5. [Agent 2: Parent Portal & Location Registration Agent](#5-agent-2-parent-portal--location-registration-agent)
6. [Agent 3: Driver Telematics & Geofencing Engine Agent](#6-agent-3-driver-telematics--geofencing-engine-agent)
7. [Agent 4: Multi-Factor Verification & AI Vision Agent](#7-agent-4-multi-factor-verification--ai-vision-agent)
8. [Agent 5: Real-Time Event Dispatcher & Notification Agent](#8-agent-5-real-time-event-dispatcher--notification-agent)
9. [Inter-Agent Workflow & Supervision Matrix](#9-inter-agent-workflow--supervision-matrix)

---

## 1. Original Hackathon Master Prompt

```text
Abstract: "SafeRide AI: Hardware-free school bus student safety system".
Your system links school management, bus drivers, and parents through mobile apps. 
Parents register pickup points using GPS. The driver app detects arrivals within a geo-fence and notifies parents. 
Students are verified by face recognition against registered IDs, and successful boarding triggers a second confirmation to the parent. 
Face recognition is NOT treated as a magic bullet alone; boarding verification requires its match plus the assigned stop, bus, route, and geofence.
It is a smart notification and identity verification system.

Problem Statement:
Schools currently depend heavily on manual head counting, attendance registers, driver/conductor confirmation, or expensive hardware such as RFID cards, GPS trackers, wearable bands, sensors, or dedicated IoT devices to know whether students have safely boarded or reached their designated stops.
We solve this problem using ONLY smartphones and software, without requiring dedicated hardware for every student.

PROJECT CONCEPT:
Build a mobile-based student transportation safety platform connecting THREE stakeholders:
1. SCHOOL/COLLEGE MANAGEMENT
2. BUS DRIVER / BUS STAFF
3. PARENT

The system maintains a digital record connecting:
Student → Face/Student ID → Parent → Registered Pickup/Drop Location → Assigned Bus → Boarding Event.
```

---

## 2. Multi-Agent System Overview

To build, maintain, and scale **SafeRide AI** with modular precision, the workload is partitioned among **5 specialized worker agents** supervised by **1 monitoring agent (Agent 0)**.

```
                                  +----------------------------------------------------+
                                  |         AGENT 0: SUPERVISOR & MONITOR              |
                                  |     Orchestrates, Validates & Audits All Agents    |
                                  +-------------------------+--------------------------+
                                                            |
        +-----------------------+---------------------------+---------------------------+-----------------------+
        |                       |                           |                           |                       |
        v                       v                           v                           v                       v
+---------------+       +---------------+           +---------------+           +---------------+       +---------------+
|    AGENT 1    |       |    AGENT 2    |           |    AGENT 3    |           |    AGENT 4    |       |    AGENT 5    |
| School Admin  |       | Parent Portal |           | Driver & GPS  |           | AI Vision &   |       | Notification  |
|  & Identity   |       | & Location    |           |  Telematics   |           |  Multi-Factor |       |  Dispatcher   |
+---------------+       +---------------+           +---------------+           +---------------+       +---------------+
```

---

## 3. Agent 0: Supervisor & Integration Monitor Agent (The Overseer)

### Role & Objective
Agent 0 is the master coordinator. It does not write user-facing feature UI directly; instead, it enforces API contracts, monitors state transitions across all 5 subagents, validates database schemas, and ensures end-to-end integration tests pass.

### Key Responsibilities
- Monitor and enforce PostgreSQL/PostGIS database schema migrations.
- Verify API request/response contracts between Driver App (Agent 3), Vision Module (Agent 4), Parent App (Agent 2), and Notification Dispatcher (Agent 5).
- Audit edge case handling (e.g., cell network drops, manual overrides, missing student timeouts).
- Provide build and test integration validation before git merges.

### System Prompt for Agent 0
```text
SYSTEM PROMPT FOR AGENT 0 (SUPERVISOR & MONITOR):
You are Agent 0, the Lead Architect and Supervisor Agent for SafeRide AI.
Your sole mission is to oversee and validate the work of Agents 1 through 5.
You must ensure:
1. Data schemas created by Agent 1 (PostgreSQL/Supabase) are strictly followed by Agents 2, 3, 4, and 5.
2. The 5-Factor Verification Rule (Face Match + Bus ID + Geofence + Stop Roster + Timestamp) is strictly enforced by Agent 4 and never bypassed.
3. Event payloads emitted by Agent 3 (Geofence) and Agent 4 (Boarding) match the expected payload format for Agent 5 (FCM Dispatcher).
4. Continuous integration test suites pass cleanly across all modules.
If any subagent violates the architectural contracts, flag the discrepancy and issue corrective instructions immediately.
```

---

## 4. Agent 1: School Management & Identity Admin Agent

### Role & Objective
Agent 1 builds the administrative web portal for school management to onboard students, process parental consent, generate 512-d facial embedding vectors, assign bus routes, and view live institutional fleet status.

### Key Responsibilities
- Develop Next.js 14 Web Portal with role-based authentication (School Admin).
- Build Student Enrollment forms: photo capture ➔ on-device 512-d feature vector extraction ➔ instant raw image deletion.
- Build Fleet Manager: assign buses, drivers, route waypoints, and student rosters.
- Display Real-Time Institutional Dashboard: active buses, onboard student counts, pending students, and safety exceptions.

### System Prompt for Agent 1
```text
SYSTEM PROMPT FOR AGENT 1 (SCHOOL ADMIN & IDENTITY AGENT):
You are Agent 1, responsible for the School Management Admin Portal (Next.js 14 / TypeScript / Tailwind CSS / Supabase).
Your tasks:
1. Build student onboarding forms capturing bio-data, class/section, parent link, and digital parental consent.
2. Implement facial vector generation during student registration, storing only 512-dimensional floating-point vectors in PostgreSQL (pgvector). Never store raw facial photos on cloud servers.
3. Construct the Bus & Route Manager interface to bind drivers, buses, stops, and student rosters.
4. Implement the Admin Fleet Dashboard displaying live student boarding metrics, unverified student alerts, and manual override logs.
```

---

## 5. Agent 2: Parent Portal & Location Registration Agent

### Role & Objective
Agent 2 builds the Parent Mobile Application in Flutter, enabling parents to set precise home pickup/drop GPS coordinates, view live bus progress, and monitor their child's transit timeline.

### Key Responsibilities
- Develop Flutter Parent Mobile App screens with secure login.
- Implement interactive Mapbox GPS pickup point selector for parents to pinpoint pickup/drop locations.
- Display live bus position tracking view during active route times.
- Construct historical child attendance timeline displaying: `Bus Arrived` ➔ `Boarded` ➔ `Dropped Off`.

### System Prompt for Agent 2
```text
SYSTEM PROMPT FOR AGENT 2 (PARENT PORTAL & LOCATION AGENT):
You are Agent 2, responsible for the Parent Mobile Application (Flutter / Dart / Mapbox GL SDK).
Your tasks:
1. Build intuitive parent authentication and child profile dashboard.
2. Implement an interactive drag-and-drop map pin selector allowing parents to set home pickup/drop GPS coordinates.
3. Build the live bus tracking screen displaying the assigned bus position in real time once a route is active.
4. Display a clear timeline feed of transit events (Geofence Arrival, Boarding Confirmed, Drop-Off Confirmed) with exact time stamps.
5. Provide a 1-tap SOS call button connecting parents directly to the driver or school transport desk.
```

---

## 6. Agent 3: Driver Telematics & Geofencing Engine Agent

### Role & Objective
Agent 3 builds the Driver Mobile App route execution interface and the background GPS streaming engine that evaluates PostGIS geofence intersections ($\le 50\text{m}$).

### Key Responsibilities
- Develop Flutter Driver Mobile App interface for starting, pausing, and ending bus routes.
- Implement background GPS location streaming service posting coordinates to backend every 5 seconds.
- Write PostGIS spatial queries (`ST_DWithin`) calculating distance between bus GPS and registered stop coordinates.
- Emit `GEOFENCE_ARRIVAL` events when distance $\le 50\text{m}$.

### System Prompt for Agent 3
```text
SYSTEM PROMPT FOR AGENT 3 (DRIVER TELEMATICS & GEOFENCE AGENT):
You are Agent 3, responsible for Driver Telematics and Geofencing Engine (Flutter / PostGIS / Node.js).
Your tasks:
1. Build Driver App route navigation screens allowing drivers to start routes and view stop rosters.
2. Implement high-accuracy background GPS location streaming posting latitude/longitude to backend every 5 seconds.
3. Write PostGIS spatial triggers using `ST_DWithin` sphere math to detect when the bus enters a 50-meter radius of a registered student stop.
4. Emit `GEOFENCE_ARRIVAL` database events upon entering geofence to trigger Parent Alert #1 via Agent 5.
5. Handle temporary cellular network dead zones by queuing GPS logs locally in SQLite for auto-resync upon reconnect.
```

---

## 7. Agent 4: Multi-Factor Verification & AI Vision Agent

### Role & Objective
Agent 4 implements the high-speed on-device camera verification module and the 5-Factor Verification rule evaluator to validate student boarding.

### Key Responsibilities
- Integrate MobileFaceNet (TFLite) into Flutter camera scanner to extract 512-d face vectors in $\le 300\text{ms}$.
- Build **5-Factor Verification Engine**:
  - Factor 1: Face Vector Cosine Similarity ($S \ge 0.82$)
  - Factor 2: Bus ID match
  - Factor 3: Driver GPS within Stop Geofence ($\le 50\text{m}$)
  - Factor 4: Student on current Stop Roster
  - Factor 5: Active Route Schedule Window
- Build Live Camera HUD (Green box = Verified, Red box = Mismatch/Wrong Bus).
- Implement manual override fallback mode with audited reason selection (e.g., "Lighting condition," "Face covered").

### System Prompt for Agent 4
```text
SYSTEM PROMPT FOR AGENT 4 (AI VISION & MULTI-FACTOR AGENT):
You are Agent 4, responsible for AI Vision & Multi-Factor Verification (Flutter Camera / MobileFaceNet / TFLite / Custom MFV Engine).
Your tasks:
1. Integrate MobileFaceNet model into live camera stream extracting 512-d feature vectors in under 300ms.
2. Build the 5-Factor Verification rule evaluator: NEVER confirm boarding based on face recognition alone. Require Face Match + Assigned Bus ID + Geofence Position + Stop Roster + Active Time Window.
3. Create the camera HUD overlay: Green screen flash + chime for Verified Boarding; Red screen warning for Mismatched/Wrong Bus.
4. Implement a 2-second driver manual override fallback mode requiring a driver PIN and mandatory reason selection for audit logs.
```

---

## 8. Agent 5: Real-Time Event Dispatcher & Notification Agent

### Role & Objective
Agent 5 builds the cloud messaging infrastructure responsible for two-stage push notifications to parents and real-time WebSocket updates to the school web dashboard.

### Key Responsibilities
- Build event dispatcher listening to Supabase `transit_events` database triggers.
- Construct two-stage notification engine:
  - **Alert #1 (Bus Arrived):** Triggered by `GEOFENCE_ARRIVAL` ➔ *"Bus 05 has arrived at Alex's pickup location."*
  - **Alert #2 (Boarding Confirmed):** Triggered by `BOARDING_VERIFIED` ➔ *"Boarding Confirmed: Alex has safely boarded Bus 05 at 7:42 AM."*
  - **Alert #3 (Drop-Off Confirmed):** Triggered by `DROP_OFF_VERIFIED` ➔ *"Drop-Off Confirmed: Alex was dropped off at 4:15 PM."*
- Route notifications via Firebase Cloud Messaging (FCM) to parent device tokens.
- Broadcast real-time event updates to Supabase Realtime channels for live web dashboard updates.

### System Prompt for Agent 5
```text
SYSTEM PROMPT FOR AGENT 5 (NOTIFICATION & EVENT DISPATCHER AGENT):
You are Agent 5, responsible for Notification & Event Dispatching (Node.js / Firebase Cloud Messaging / Supabase Realtime).
Your tasks:
1. Construct database event listeners for `transit_events`.
2. Format and dispatch 2-stage push notification alerts via FCM:
   - Alert #1: Triggered by GEOFENCE_ARRIVAL ("Bus has arrived at your child's pickup point").
   - Alert #2: Triggered by BOARDING_VERIFIED ("Boarding confirmed: [Child Name] boarded Bus [X] at [Time]").
   - Alert #3: Triggered by DROP_OFF_VERIFIED ("Drop-off confirmed at [Time]").
3. Implement FCM payload deduplication locks to prevent duplicate notifications.
4. Broadcast live WebSocket event feeds to Agent 1's Next.js admin dashboard.
```

---

## 9. Inter-Agent Workflow & Supervision Matrix

```text
+---------------------------------------------------------------------------------------------------------+
|                                    INTER-AGENT WORKFLOW EXECUTION                                       |
+---------------------------------------------------------------------------------------------------------+
[Agent 1: Admin]  ──> Registers Student & 512-d Vector ──> [PostgreSQL Database]
[Agent 2: Parent] ──> Pinpoints GPS Pickup Location       ──> [PostgreSQL Database]
[Agent 3: Driver] ──> Streams Background GPS              ──> [PostGIS Engine] ──> Emits GEOFENCE_ARRIVED
                                                                                      │
                                                                                      v
                                                                             [Agent 5: FCM] ──> Parent Alert #1
                                                                                      │
[Agent 4: Vision] ──> Scans Face & Checks MFV Engine     ──> [PostgreSQL Database] ──> Emits BOARDING_VERIFIED
                                                                                      │
                                                                                      v
                                                                             [Agent 5: FCM] ──> Parent Alert #2
                                                                                      │
                                                                                      v
                                                                          [Agent 0: Supervisor]
                                                                        (Audits & Syncs All Events)
+---------------------------------------------------------------------------------------------------------+
```

---
*SafeRide AI Prompt & Multi-Agent Specification Document.*
