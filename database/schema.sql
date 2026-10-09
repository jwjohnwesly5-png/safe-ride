-- SafeRide AI PostgreSQL & PostGIS Database Schema
-- Enables PostGIS for spatial queries and pgvector for 512-d biometric templates

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');
CREATE TYPE transit_status AS ENUM ('PENDING', 'GEOFENCE_ARRIVED', 'BOARDED', 'DROPPED_OFF', 'MISMATCHED', 'ABSENT');
CREATE TYPE event_type AS ENUM ('GEOFENCE_ARRIVAL', 'BOARDING_VERIFIED', 'BOARDING_MANUAL_OVERRIDE', 'DROP_OFF_VERIFIED', 'MISMATCH_FLAGGED');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role NOT NULL,
    fcm_device_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BUSES TABLE
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    driver_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    current_location GEOMETRY(Point, 4326),
    last_location_update TIMESTAMP WITH TIME ZONE
);

-- 4. ROUTE STOPS TABLE
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(100) NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_location GEOMETRY(Point, 4326) NOT NULL,
    geofence_radius_meters FLOAT DEFAULT 50.0,
    stop_sequence INT NOT NULL,
    estimated_arrival_time TIME
);

-- 5. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_bus_id UUID REFERENCES buses(id),
    assigned_stop_id UUID REFERENCES route_stops(id),
    face_embedding vector(512), -- 512-dimensional MobileFaceNet vector
    parent_consent_given BOOLEAN DEFAULT FALSE,
    current_status transit_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TRANSIT EVENTS TABLE
CREATE TABLE transit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    bus_id UUID REFERENCES buses(id),
    driver_id UUID REFERENCES users(id),
    stop_id UUID REFERENCES route_stops(id),
    event_type event_type NOT NULL,
    verification_confidence FLOAT,
    gps_coordinates GEOMETRY(Point, 4326) NOT NULL,
    override_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SPATIAL INDEXES
CREATE INDEX idx_route_stops_location ON route_stops USING GIST(stop_location);
CREATE INDEX idx_buses_current_location ON buses USING GIST(current_location);
