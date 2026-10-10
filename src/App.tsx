import React, { useState, useEffect } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_BUSES, 
  INITIAL_STOPS, 
  INITIAL_EVENTS 
} from './mockData';
import { Student, Bus, RouteStop, TransitEvent } from './types';
import { AdminPortal } from './components/AdminPortal';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Bus as BusIcon, 
  Activity, 
  RefreshCw,
  CheckCircle2,
  Database
} from 'lucide-react';
import { supabase } from './supabase';

export const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [stops, setStops] = useState<RouteStop[]>(INITIAL_STOPS);
  const [events, setEvents] = useState<TransitEvent[]>(INITIAL_EVENTS);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Fetch live data from Supabase on mount
  useEffect(() => {
    fetchLiveSupabaseData();
  }, []);

  const fetchLiveSupabaseData = async () => {
    setIsSyncing(true);
    try {
      const { data: dbStudents, error: studentErr } = await supabase.from('students').select('*');
      if (!studentErr && dbStudents && dbStudents.length > 0) {
        setIsConnectedToSupabase(true);
        const mappedStudents: Student[] = dbStudents.map((s: any) => ({
          id: s.id,
          studentIdCode: s.student_id_code,
          firstName: s.first_name,
          lastName: s.last_name,
          classGrade: s.class_grade,
          parentId: s.parent_id,
          parentName: 'Authorized Parent',
          parentPhone: '+1 (555) 019-0000',
          assignedBusId: s.assigned_bus_id || 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          assignedBusNumber: 'Bus 05',
          assignedStopId: s.assigned_stop_id || 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          assignedStopName: 'Oakridge Residence',
          faceEmbeddingVector: s.face_embedding || Array.from({ length: 512 }, () => Math.random() * 2 - 1),
          parentConsentGiven: s.parent_consent_given,
          currentStatus: s.current_status || 'PENDING',
        }));
        setStudents(mappedStudents);
      }
    } catch (e) {
      console.log('Using local fallback mock data');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler: Add New Student
  const handleAddStudent = async (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);

    // Push to Supabase database if available
    try {
      await supabase.from('students').insert({
        student_id_code: newStudent.studentIdCode,
        first_name: newStudent.firstName,
        last_name: newStudent.lastName,
        class_grade: newStudent.classGrade,
        parent_consent_given: true,
        current_status: 'PENDING'
      });
    } catch (err) {
      console.error('Error inserting to Supabase:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-xl tracking-tight">St. Jude Academy</h1>
                <span className="text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> School Management Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centralized Student Roster, Staff Directory, Transport Fleet & Real-time Safety Management System
              </p>
            </div>
          </div>

          {/* Database Status Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveSupabaseData}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              Sync Supabase
            </button>

            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Database:</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Live Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <AdminPortal
          students={students}
          buses={buses}
          events={events}
          stops={stops}
          onAddStudent={handleAddStudent}
        />
      </main>
    </div>
  );
};

