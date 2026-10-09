-- Row Level Security (RLS) Policies for Supabase PostgreSQL

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_events ENABLE ROW LEVEL SECURITY;

-- 1. ADMIN POLICIES (Full Access)
CREATE POLICY admin_all_access ON users FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY admin_students_all ON students FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY admin_buses_all ON buses FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY admin_events_all ON transit_events FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2. PARENT POLICIES (Can only read their linked student data & events)
CREATE POLICY parent_read_own_student ON students FOR SELECT 
USING (parent_id = auth.uid());

CREATE POLICY parent_read_own_events ON transit_events FOR SELECT 
USING (student_id IN (SELECT id FROM students WHERE parent_id = auth.uid()));

-- 3. DRIVER POLICIES (Can read assigned bus, route stops, and log boarding events)
CREATE POLICY driver_read_assigned_bus ON buses FOR SELECT 
USING (driver_id = auth.uid());

CREATE POLICY driver_insert_events ON transit_events FOR INSERT 
WITH CHECK (driver_id = auth.uid());
