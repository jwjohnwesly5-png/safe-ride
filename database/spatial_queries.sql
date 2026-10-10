-- Agent 3: PostGIS Spatial Queries & Telematics SQL Engine

-- 1. Query: Compute Spherical Distance to Registered Stop (Meter Precision)
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

-- 2. Query: Find All Active Bus Stops within 50m Radius of Current Bus Location
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

-- 3. Procedure: Log Telemetry Coordinate & Trigger Geofence Check
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
    
    -- Update Bus Location
    UPDATE buses
    SET current_location = bus_geom,
        last_gps_update = CURRENT_TIMESTAMP
    WHERE id = p_bus_id AND driver_id = p_driver_id;
    
    -- Check for geofence intersections <= 50m
    FOR nearby_stop IN 
        SELECT * FROM find_nearby_geofenced_stops(p_lat, p_lng, 50.0)
    LOOP
        -- Insert Geofence Arrival Event if not already logged recently
        IF NOT EXISTS (
            SELECT 1 FROM transit_events
            WHERE bus_id = p_bus_id 
              AND stop_id = nearby_stop.stop_id 
              AND event_type = 'GEOFENCE_ARRIVAL'
              AND created_at > (CURRENT_TIMESTAMP - INTERVAL '5 minutes')
        ) THEN
            INSERT INTO transit_events (bus_id, driver_id, stop_id, event_type, gps_coordinates)
            VALUES (p_bus_id, p_driver_id, nearby_stop.stop_id, 'GEOFENCE_ARRIVAL', bus_geom);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
