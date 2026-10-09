-- ====================================================================
-- SafeRide AI: Database DDL Schema (PostgreSQL + PostGIS + pgvector)
-- Repository: jwjohnwesly5-png/safe-ride
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');
CREATE TYPE event_type AS ENUM (
    'GEOFENCE_ARRIVAL', 
    'BOARDING_VERIFIED', 
    'BOARDING_MANUAL_OVERRIDE', 
    'DROP_OFF_VERIFIED', 
    'MISMATCH_FLAGGED'
);
CREATE TYPE student_status AS ENUM ('PENDING', 'GEOFENCE_NOTIFIED', 'BOARDED', 'DROPPED_OFF', 'ABSENT', 'MISMATCHED');

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role NOT NULL,
    fcm_device_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUSES TABLE
CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_location GEOMETRY(Point, 4326),
    current_latitude FLOAT,
    current_longitude FLOAT,
    last_gps_update TIMESTAMP WITH TIME ZONE
);

-- 5. ROUTE STOPS TABLE
CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(100) NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_location GEOMETRY(Point, 4326) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    geofence_radius_meters FLOAT DEFAULT 50.0,
    stop_sequence INT NOT NULL,
    estimated_arrival_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
    assigned_stop_id UUID REFERENCES route_stops(id) ON DELETE SET NULL,
    face_embedding vector(512), -- 512-dimensional numerical vector (MobileFaceNet)
    parent_consent_given BOOLEAN DEFAULT FALSE,
    current_status student_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TRANSIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS transit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stop_id UUID REFERENCES route_stops(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    verification_confidence FLOAT, -- Cosine similarity score (e.g., 0.89)
    gps_coordinates GEOMETRY(Point, 4326),
    latitude FLOAT,
    longitude FLOAT,
    override_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_route_stops_location ON route_stops USING GIST(stop_location);
CREATE INDEX IF NOT EXISTS idx_buses_current_location ON buses USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_transit_events_student ON transit_events(student_id);
CREATE INDEX IF NOT EXISTS idx_transit_events_bus ON transit_events(bus_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_bus ON students(assigned_bus_id);
