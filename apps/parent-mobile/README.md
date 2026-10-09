# Agent 2: Parent Portal & Location Registration Mobile Application

> **Project:** SafeRide AI  
> **Module:** `apps/parent-mobile`  
> **Role:** Parent Mobile Interface & GPS Location Registration Engine  

---

## Overview

The **Parent Portal Mobile Application** enables parents to:
1. **Interactive Location Registration:** Drag and set exact home pickup/drop GPS coordinates on an interactive Flutter Map, registering PostGIS 50m auto-alert geofences.
2. **Real-Time Live Bus Tracking:** View assigned school bus position in real time along with live speed, ETA, and driver details.
3. **Verified Transit Timeline:** Track student status across the transit lifecycle (`Geofence Arrival (Alert #1)` ➔ `Boarding Verified (Alert #2 via MFV)` ➔ `Drop-off Confirmed`).
4. **1-Tap Emergency SOS Dispatch:** Instant priority dispatch alert to the School Safety Hub and Bus Conductor.

---

## Technical Stack & Dependencies

- **Framework:** Flutter 3.x (Dart 3.x)
- **Mapping Engine:** Flutter Map / OpenStreetMap SDK (`flutter_map`, `latlong2`)
- **Typography & Theme:** Google Fonts (`Inter`), Dark Glassmorphism Design System
- **State & Models:** `PickupLocation`, `Student`, `TransitEvent`, `ParentApiService`

---

## Application Architecture

```text
apps/parent-mobile/
├── lib/
│   ├── models/
│   │   ├── student.dart           # Student state & transit status enum
│   │   ├── pickup_location.dart   # PostGIS geofence latitude/longitude coordinates
│   │   └── transit_event.dart     # Logged events (Geofence Arrival, Boarding, SOS)
│   ├── services/
│   │   └── parent_api_service.dart # API service & mock stream provider
│   ├── screens/
│   │   ├── parent_home_screen.dart     # Main tab navigation bar
│   │   ├── location_picker_screen.dart # Interactive Map pickup pin selector & radius preview
│   │   ├── live_tracking_screen.dart   # Real-time bus location map & telematics
│   │   ├── student_timeline_screen.dart # Verified event feed & timestamp history
│   │   └── sos_modal.dart              # Emergency priority dispatch dialog
│   └── main.dart                   # Application entrypoint & theme config
└── pubspec.yaml                    # Flutter package specifications
```

---

## Multi-Factor Verification Integration (Agent 2 ↔ Agent 4/5)

- **Alert #1 (Geofence Entrance):** Emitted when driver enters $\le 50\text{m}$ radius of registered pickup pin (`LocationPickerScreen`).
- **Alert #2 (Boarding Verified):** Triggered when Agent 4 (AI Vision) confirms 5-Factor Verification ($S \ge 0.82$, Bus ID, Geofence, Roster, Window).
