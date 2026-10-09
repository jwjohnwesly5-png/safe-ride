-- Enable PostGIS and Vector Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. USERS & ROLES TABLE
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    fcm_token VARCHAR(255),
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BUSES TABLE
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    capacity INT NOT NULL,
    driver_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. ROUTES & STOPS TABLE
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(100) NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_location GEOMETRY(Point, 4326) NOT NULL,
    geofence_radius_meters FLOAT DEFAULT 50.0,
    stop_sequence INT NOT NULL
);

-- 4. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_bus_id UUID REFERENCES buses(id),
    assigned_stop_id UUID REFERENCES route_stops(id),
    face_embedding vector(512),
    parent_consent_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRANSIT EVENTS TABLE
CREATE TYPE event_type AS ENUM ('GEOFENCE_ARRIVAL', 'BOARDING_VERIFIED', 'BOARDING_MANUAL_OVERRIDE', 'DROP_OFF_VERIFIED', 'MISMATCH_FLAGGED');

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

-- Create Spatial Index on Route Stops
CREATE INDEX idx_route_stops_location ON route_stops USING GIST(stop_location);
