-- Seed Data for SafeRide AI Testing

-- 1. Insert Users (Admin, Driver, Parent)
INSERT INTO users (id, full_name, email, phone_number, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Principal Sarah Jenkins', 'admin@school.edu', '+15550192834', 'ADMIN'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Robert Taylor (Driver)', 'driver.robert@school.edu', '+15550192835', 'DRIVER'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'David Smith (Parent)', 'david.smith@gmail.com', '+15550192836', 'PARENT');

-- 2. Insert Bus
INSERT INTO buses (id, bus_number, license_plate, capacity, driver_id, is_active, current_location) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Bus 05', 'KA-01-EQ-9988', 40, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', TRUE, ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326));

-- 3. Insert Route Stops
INSERT INTO route_stops (id, route_name, stop_name, stop_location, geofence_radius_meters, stop_sequence, estimated_arrival_time) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Morning Route A', 'Oakridge Residence (Alex Stop)', ST_SetSRID(ST_MakePoint(77.5950, 12.9720), 4326), 50.0, 1, '07:35:00'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Morning Route A', 'Greenwood Apartments', ST_SetSRID(ST_MakePoint(77.5980, 12.9750), 4326), 50.0, 2, '07:45:00');

-- 4. Insert Student (Alex Smith)
INSERT INTO students (id, student_id_code, first_name, last_name, class_grade, parent_id, assigned_bus_id, assigned_stop_id, parent_consent_given, current_status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'STU-2026-001', 'Alex', 'Smith', 'Grade 5-B', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', TRUE, 'PENDING');
