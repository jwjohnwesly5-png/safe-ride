-- ====================================================================
-- SafeRide AI: PostGIS Geofence Spatial Functions & Triggers
-- Repository: jwjohnwesly5-png/safe-ride
-- ====================================================================

-- 1. FUNCTION: Calculate distance in meters between bus and stop using PostGIS spherical geometry
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
    
    -- ST_DistanceSphere returns distance in meters
    v_distance_meters := ST_DistanceSphere(v_bus_geom, v_stop_geom);
    RETURN v_distance_meters;
END;
$$ LANGUAGE plpgsql;

-- 2. TRIGGER FUNCTION: Evaluate Geofence Arrival on Bus Location Update
CREATE OR REPLACE FUNCTION trigger_geofence_arrival_check() 
RETURNS TRIGGER AS $$
DECLARE
    r_stop RECORD;
    v_dist FLOAT;
BEGIN
    -- Check against active route stops
    FOR r_stop IN 
        SELECT id, stop_name, latitude, longitude, geofence_radius_meters 
        FROM route_stops 
    LOOP
        v_dist := ST_DistanceSphere(
            ST_SetSRID(ST_MakePoint(NEW.current_longitude, NEW.current_latitude), 4326),
            ST_SetSRID(ST_MakePoint(r_stop.longitude, r_stop.latitude), 4326)
        );

        IF v_dist <= r_stop.geofence_radius_meters THEN
            -- Insert GEOFENCE_ARRIVAL event for students assigned to this stop
            INSERT INTO transit_events (student_id, bus_id, driver_id, stop_id, event_type, latitude, longitude)
            SELECT s.id, NEW.id, NEW.driver_id, r_stop.id, 'GEOFENCE_ARRIVAL', NEW.current_latitude, NEW.current_longitude
            FROM students s
            WHERE s.assigned_bus_id = NEW.id 
              AND s.assigned_stop_id = r_stop.id 
              AND s.current_status = 'PENDING';

            -- Update Student Status to GEOFENCE_NOTIFIED
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

-- 3. CREATE TRIGGER ON BUSES TABLE FOR GPS POSITION UPDATES
DROP TRIGGER IF EXISTS trg_bus_gps_geofence ON buses;
CREATE TRIGGER trg_bus_gps_geofence
    AFTER UPDATE OF current_latitude, current_longitude ON buses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_geofence_arrival_check();
