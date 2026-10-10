-- ====================================================================
-- SafeRide AI: COMPLETE SUPABASE POSTGRESQL DATABASE SETUP SCRIPT
-- Extensions: PostGIS + pgvector (MobileFaceNet support)
-- Instructions: Copy and paste this ENTIRE script directly into the
--               Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- --------------------------------------------------------------------
-- 2. ENUM TYPES
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM (
        'GEOFENCE_ARRIVAL', 
        'BOARDING_VERIFIED', 
        'BOARDING_MANUAL_OVERRIDE', 
        'DROP_OFF_VERIFIED', 
        'MISMATCH_FLAGGED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM (
        'PENDING', 
        'GEOFENCE_NOTIFIED', 
        'BOARDED', 
        'DROPPED_OFF', 
        'ABSENT', 
        'MISMATCHED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- 3. TABLES SCHEMA DDL
-- --------------------------------------------------------------------

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role NOT NULL,
    fcm_device_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BUSES TABLE
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
    last_gps_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_location_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ROUTE STOPS TABLE
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

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
    assigned_stop_id UUID REFERENCES route_stops(id) ON DELETE SET NULL,
    face_embedding vector(512), -- 512-dimensional numerical vector for MobileFaceNet
    parent_consent_given BOOLEAN DEFAULT FALSE,
    current_status student_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRANSIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS transit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stop_id UUID REFERENCES route_stops(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    verification_confidence FLOAT, -- Cosine similarity score (e.g. 0.89)
    gps_coordinates GEOMETRY(Point, 4326),
    latitude FLOAT,
    longitude FLOAT,
    override_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. PERFORMANCE & SPATIAL INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_route_stops_location ON route_stops USING GIST(stop_location);
CREATE INDEX IF NOT EXISTS idx_buses_current_location ON buses USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_transit_events_student ON transit_events(student_id);
CREATE INDEX IF NOT EXISTS idx_transit_events_bus ON transit_events(bus_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_bus ON students(assigned_bus_id);

-- --------------------------------------------------------------------
-- 5. POSTGIS SPATIAL FUNCTIONS & GEOFENCE TRIGGERS
-- --------------------------------------------------------------------

-- Function: Calculate Spherical Distance (in meters)
CREATE OR REPLACE FUNCTION check_bus_geofence(
    p_bus_lat FLOAT,
    p_bus_lng FLOAT,
    p_stop_lat FLOAT,
    p_stop_lng FLOAT
) RETURNS FLOAT AS $$
DECLARE
    v_bus_geom GEOMETRY;
    v_stop_geom GEOMETRY;
    v_distance_meters FLOAT;
BEGIN
    v_bus_geom := ST_SetSRID(ST_MakePoint(p_bus_lng, p_bus_lat), 4326);
    v_stop_geom := ST_SetSRID(ST_MakePoint(p_stop_lng, p_stop_lat), 4326);
    v_distance_meters := ST_DistanceSphere(v_bus_geom, v_stop_geom);
    RETURN v_distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function: Evaluate Geofence Arrival on Bus Location Update
CREATE OR REPLACE FUNCTION trigger_geofence_arrival_check() 
RETURNS TRIGGER AS $$
DECLARE
    r_stop RECORD;
    v_dist FLOAT;
BEGIN
    IF NEW.current_latitude IS NULL OR NEW.current_longitude IS NULL THEN
        RETURN NEW;
    END IF;

    FOR r_stop IN 
        SELECT id, stop_name, latitude, longitude, geofence_radius_meters 
        FROM route_stops 
    LOOP
        v_dist := ST_DistanceSphere(
            ST_SetSRID(ST_MakePoint(NEW.current_longitude, NEW.current_latitude), 4326),
            ST_SetSRID(ST_MakePoint(r_stop.longitude, r_stop.latitude), 4326)
        );

        IF v_dist <= r_stop.geofence_radius_meters THEN
            INSERT INTO transit_events (student_id, bus_id, driver_id, stop_id, event_type, latitude, longitude)
            SELECT s.id, NEW.id, NEW.driver_id, r_stop.id, 'GEOFENCE_ARRIVAL', NEW.current_latitude, NEW.current_longitude
            FROM students s
            WHERE s.assigned_bus_id = NEW.id 
              AND s.assigned_stop_id = r_stop.id 
              AND s.current_status = 'PENDING';

            UPDATE students
            SET current_status = 'GEOFENCE_NOTIFIED'
            WHERE assigned_bus_id = NEW.id 
              AND assigned_stop_id = r_stop.id 
              AND current_status = 'PENDING';
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Bind Geofence Checking to Buses Location Table Update
DROP TRIGGER IF EXISTS trg_bus_gps_geofence ON buses;
CREATE TRIGGER trg_bus_gps_geofence
    AFTER UPDATE OF current_latitude, current_longitude ON buses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_geofence_arrival_check();

-- --------------------------------------------------------------------
-- 6. TELEMATICS & SPATIAL QUERY PROCEDURES
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_bus_distance_to_stop(
    bus_lat FLOAT,
    bus_lng FLOAT,
    target_stop_id UUID
) RETURNS FLOAT AS $$
DECLARE
    bus_point GEOMETRY;
    stop_point GEOMETRY;
    distance_meters FLOAT;
BEGIN
    bus_point := ST_SetSRID(ST_MakePoint(bus_lng, bus_lat), 4326);
    
    SELECT stop_location INTO stop_point 
    FROM route_stops 
    WHERE id = target_stop_id;
    
    distance_meters := ST_DistanceSphere(bus_point, stop_point);
    RETURN distance_meters;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_nearby_geofenced_stops(
    bus_lat FLOAT,
    bus_lng FLOAT,
    max_radius_meters FLOAT DEFAULT 50.0
) RETURNS TABLE (
    stop_id UUID,
    stop_name VARCHAR,
    route_name VARCHAR,
    stop_sequence INT,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id AS stop_id,
        rs.stop_name,
        rs.route_name,
        rs.stop_sequence,
        ST_DistanceSphere(ST_SetSRID(ST_MakePoint(bus_lng, bus_lat), 4326), rs.stop_location) AS distance_meters
    FROM route_stops rs
    WHERE ST_DistanceSphere(ST_SetSRID(ST_MakePoint(bus_lng, bus_lat), 4326), rs.stop_location) <= max_radius_meters
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE log_driver_telemetry(
    p_bus_id UUID,
    p_driver_id UUID,
    p_lat FLOAT,
    p_lng FLOAT,
    p_speed_mps FLOAT,
    p_heading FLOAT
) AS $$
DECLARE
    bus_geom GEOMETRY;
    nearby_stop RECORD;
BEGIN
    bus_geom := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
    
    UPDATE buses
    SET current_location = bus_geom,
        current_latitude = p_lat,
        current_longitude = p_lng,
        last_gps_update = CURRENT_TIMESTAMP,
        last_location_update = CURRENT_TIMESTAMP
    WHERE id = p_bus_id AND driver_id = p_driver_id;
    
    FOR nearby_stop IN 
        SELECT * FROM find_nearby_geofenced_stops(p_lat, p_lng, 50.0)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM transit_events
            WHERE bus_id = p_bus_id 
              AND stop_id = nearby_stop.stop_id 
              AND event_type = 'GEOFENCE_ARRIVAL'
              AND created_at > (CURRENT_TIMESTAMP - INTERVAL '5 minutes')
        ) THEN
            INSERT INTO transit_events (bus_id, driver_id, stop_id, event_type, gps_coordinates, latitude, longitude)
            VALUES (p_bus_id, p_driver_id, nearby_stop.stop_id, 'GEOFENCE_ARRIVAL', bus_geom, p_lat, p_lng);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 7. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_events ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS admin_users_all ON users;
CREATE POLICY admin_users_all ON users FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

DROP POLICY IF EXISTS user_self_view ON users;
CREATE POLICY user_self_view ON users FOR SELECT USING (auth.uid() = id);

-- Buses Policies
DROP POLICY IF EXISTS admin_buses_all ON buses;
CREATE POLICY admin_buses_all ON buses FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

DROP POLICY IF EXISTS driver_read_assigned_bus ON buses;
CREATE POLICY driver_read_assigned_bus ON buses FOR SELECT USING (driver_id = auth.uid());

-- Route Stops Policies
DROP POLICY IF EXISTS route_stops_public_read ON route_stops;
CREATE POLICY route_stops_public_read ON route_stops FOR SELECT USING (true);

-- Students Policies
DROP POLICY IF EXISTS admin_students_all ON students;
CREATE POLICY admin_students_all ON students FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

DROP POLICY IF EXISTS parent_students_select ON students;
CREATE POLICY parent_students_select ON students FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS driver_students_select ON students;
CREATE POLICY driver_students_select ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM buses b 
        WHERE b.driver_id = auth.uid() 
          AND b.id = students.assigned_bus_id
    )
);

-- Transit Events Policies
DROP POLICY IF EXISTS admin_transit_events_all ON transit_events;
CREATE POLICY admin_transit_events_all ON transit_events FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

DROP POLICY IF EXISTS parent_transit_events_select ON transit_events;
CREATE POLICY parent_transit_events_select ON transit_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM students s 
        WHERE s.id = transit_events.student_id 
          AND s.parent_id = auth.uid()
    )
);

DROP POLICY IF EXISTS driver_transit_events_insert ON transit_events;
CREATE POLICY driver_transit_events_insert ON transit_events FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM buses b 
        WHERE b.driver_id = auth.uid() 
          AND b.id = transit_events.bus_id
    )
);

-- --------------------------------------------------------------------
-- 8. INITIAL SEED DATA
-- --------------------------------------------------------------------

INSERT INTO users (id, full_name, email, phone_number, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Principal Sarah Jenkins', 'admin@school.edu', '+15550192834', 'ADMIN'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Robert Taylor (Driver)', 'driver.robert@school.edu', '+15550192835', 'DRIVER'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'David Smith (Parent)', 'david.smith@gmail.com', '+15550192836', 'PARENT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buses (id, bus_number, license_plate, capacity, driver_id, is_active, current_location, current_latitude, current_longitude) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Bus 05', 'KA-01-EQ-9988', 40, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', TRUE, ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), 12.9716, 77.5946)
ON CONFLICT (id) DO NOTHING;

INSERT INTO route_stops (id, route_name, stop_name, stop_location, latitude, longitude, geofence_radius_meters, stop_sequence, estimated_arrival_time) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Morning Route A', 'Oakridge Residence (Alex Stop)', ST_SetSRID(ST_MakePoint(77.5950, 12.9720), 4326), 12.9720, 77.5950, 50.0, 1, '07:35:00'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Morning Route A', 'Greenwood Apartments', ST_SetSRID(ST_MakePoint(77.5980, 12.9750), 4326), 12.9750, 77.5980, 50.0, 2, '07:45:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, student_id_code, first_name, last_name, class_grade, parent_id, assigned_bus_id, assigned_stop_id, parent_consent_given, current_status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'STU-2026-001', 'Alex', 'Smith', 'Grade 5-B', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', TRUE, 'PENDING')
ON CONFLICT (id) DO NOTHING;
