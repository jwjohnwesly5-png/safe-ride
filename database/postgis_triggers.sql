-- PostGIS Spherical Distance & Geofence Triggers

-- Function to check if Bus GPS is within stop radius (<= 50 meters)
CREATE OR REPLACE FUNCTION check_stop_geofence(
    bus_lat FLOAT,
    bus_lng FLOAT,
    target_stop_id UUID
) RETURNS TABLE (
    is_within_geofence BOOLEAN,
    distance_meters FLOAT
) AS $$
DECLARE
    stop_geom GEOMETRY;
    bus_geom GEOMETRY;
    dist FLOAT;
    radius FLOAT;
BEGIN
    -- Construct Geometry Points (SRID 4326)
    bus_geom := ST_SetSRID(ST_MakePoint(bus_lng, bus_lat), 4326);
    
    SELECT stop_location, geofence_radius_meters 
    INTO stop_geom, radius
    FROM route_stops 
    WHERE id = target_stop_id;
    
    -- Calculate spherical distance in meters
    dist := ST_DistanceSphere(bus_geom, stop_geom);
    
    IF dist <= radius THEN
        RETURN QUERY SELECT TRUE, dist;
    ELSE
        RETURN QUERY SELECT FALSE, dist;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function to emit transit event on geofence entry
CREATE OR REPLACE FUNCTION trigger_geofence_arrival()
RETURNS TRIGGER AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT id, stop_name, geofence_radius_meters,
               ST_DistanceSphere(NEW.current_location, stop_location) as dist
        FROM route_stops
    LOOP
        IF rec.dist <= rec.geofence_radius_meters THEN
            INSERT INTO transit_events (bus_id, driver_id, stop_id, event_type, gps_coordinates)
            VALUES (NEW.id, NEW.driver_id, rec.id, 'GEOFENCE_ARRIVAL', NEW.current_location);
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
