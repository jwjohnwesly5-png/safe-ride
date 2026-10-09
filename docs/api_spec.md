# SafeRide AI: REST & WebSocket API Specification

## Base URL
`https://api.saferide.ai/v1`

---

## 1. Driver App Telematics & Verification Endpoints

### POST `/driver/route/start`
Starts a bus route execution.
- **Request Body:**
```json
{
  "bus_id": "bus-01",
  "route_id": "route-a",
  "driver_id": "user-driver-01"
}
```
- **Response (200 OK):**
```json
{
  "status": "ACTIVE",
  "assigned_stops": [
    { "id": "stop-01", "name": "Sunrise Boulevard", "lat": 12.9720, "lng": 77.5950 }
  ]
}
```

### POST `/driver/location/update`
Streams background GPS telematics data every 5 seconds.
- **Request Body:**
```json
{
  "bus_id": "bus-01",
  "latitude": 12.9720,
  "longitude": 77.5950,
  "timestamp": "2026-10-09T07:40:00Z"
}
```
- **Response (200 OK):**
```json
{
  "geofence_events": [
    { "stop_id": "stop-01", "event_type": "GEOFENCE_ARRIVAL", "distance_meters": 32.4 }
  ]
}
```

### POST `/driver/verify-boarding`
Executes Multi-Factor Verification check for student boarding.
- **Request Body:**
```json
{
  "bus_id": "bus-01",
  "student_id": "student-01",
  "detected_embedding": [0.12, -0.45, 0.88, "... (512 values)"],
  "current_latitude": 12.9720,
  "current_longitude": 77.5950
}
```
- **Response (200 OK - Passed):**
```json
{
  "verification_status": "VERIFIED",
  "student": {
    "id": "student-01",
    "name": "Alex Smith"
  },
  "confidence": 0.89,
  "factors_passed": {
    "face_vector": true,
    "bus_match": true,
    "geofence_distance": "32.4m",
    "stop_roster": true,
    "time_window": true
  }
}
```

---

## 2. Parent App Endpoints

### PUT `/parent/pickup-location`
Registers or updates GPS home pickup coordinates.
- **Request Body:**
```json
{
  "student_id": "student-01",
  "latitude": 12.9720,
  "longitude": 77.5950
}
```

### GET `/parent/student-status/:student_id`
Fetches real-time transit status and timeline.

---

## 3. Notification Dispatcher (FCM) Payload Formats

### Alert #1: Geofence Arrival
```json
{
  "to": "fcm_parent_token_8841",
  "notification": {
    "title": "Bus Arrived at Pickup Location",
    "body": "Bus 01 has entered the 50-meter geofence for Alex Smith."
  }
}
```

### Alert #2: Boarding Confirmed
```json
{
  "to": "fcm_parent_token_8841",
  "notification": {
    "title": "Boarding Confirmed",
    "body": "Boarding Confirmed: Alex Smith safely boarded Bus 01 at 07:42 AM."
  }
}
```
