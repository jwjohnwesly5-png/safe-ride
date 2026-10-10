-- ====================================================================
-- SafeRide AI: Supabase Row Level Security (RLS) Policies
-- Repository: jwjohnwesly5-png/safe-ride
-- ====================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_events ENABLE ROW LEVEL SECURITY;

-- 2. USERS POLICIES
-- Admin can view/edit all users
CREATE POLICY admin_users_all ON users 
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' OR auth.role() = 'service_role');

-- Users can view their own profile
CREATE POLICY user_self_view ON users 
    FOR SELECT USING (auth.uid() = id);

-- 3. BUSES POLICIES
CREATE POLICY admin_buses_all ON buses 
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' OR auth.role() = 'service_role');

CREATE POLICY driver_read_assigned_bus ON buses 
    FOR SELECT USING (driver_id = auth.uid());

-- 4. ROUTE STOPS POLICIES
CREATE POLICY route_stops_public_read ON route_stops 
    FOR SELECT USING (true);

-- 5. STUDENTS POLICIES
-- Admin full access to students
CREATE POLICY admin_students_all ON students 
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' OR auth.role() = 'service_role');

-- Parent can ONLY view students linked to their parent_id
CREATE POLICY parent_students_select ON students 
    FOR SELECT USING (auth.uid() = parent_id);

-- Driver can view students assigned to their bus
CREATE POLICY driver_students_select ON students 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM buses b 
            WHERE b.driver_id = auth.uid() 
              AND b.id = students.assigned_bus_id
        )
    );

-- 6. TRANSIT EVENTS POLICIES
-- Admin full access
CREATE POLICY admin_transit_events_all ON transit_events 
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' OR auth.role() = 'service_role');

-- Parent can ONLY view events for their child
CREATE POLICY parent_transit_events_select ON transit_events 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s 
            WHERE s.id = transit_events.student_id 
              AND s.parent_id = auth.uid()
        )
    );

-- Driver can insert/update transit events for their assigned bus
CREATE POLICY driver_transit_events_insert ON transit_events 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM buses b 
            WHERE b.driver_id = auth.uid() 
              AND b.id = transit_events.bus_id
        )
    );
