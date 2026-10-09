import React, { useState } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_BUSES, 
  INITIAL_STOPS, 
  INITIAL_EVENTS 
} from './mockData';
import { Student, Bus, RouteStop, TransitEvent, MFVFactorCheck } from './types';
import { AdminPortal } from './components/AdminPortal';
import { ParentPortal } from './components/ParentPortal';
import { DriverPortal } from './components/DriverPortal';
import { GeofenceSimulator } from './components/GeofenceSimulator';
import { 
  ShieldCheck, 
  Users, 
  Smartphone, 
  Bus as BusIcon, 
  Activity, 
  Bell, 
  ExternalLink 
} from 'lucide-react';

export const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<'admin' | 'parent' | 'driver'>('admin');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [stops, setStops] = useState<RouteStop[]>(INITIAL_STOPS);
  const [events, setEvents] = useState<TransitEvent[]>(INITIAL_EVENTS);

  const alexStudent = students.find(s => s.studentIdCode === 'STU-2026-001') || students[0];
  const bus05 = buses.find(b => b.busNumber === 'Bus 05') || buses[0];
  const stop1 = stops[0];

  // Helper function to format timestamp
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Handler: Add New Student (Admin)
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  // Handler: Update Parent Pickup Location
  const handleUpdatePickupLocation = (newLat: number, newLng: number) => {
    setStops(prev => prev.map(st => st.id === stop1.id ? { ...st, lat: newLat, lng: newLng } : st));
  };

  // Simulator Event 1: Geofence Arrival (Bus enters <= 50m radius)
  const handleSimulateGeofenceArrival = () => {
    // Update student status
    setStudents(prev => prev.map(s => s.id === alexStudent.id ? { ...s, currentStatus: 'GEOFENCE_ARRIVED' } : s));

    const arrivalEvent: TransitEvent = {
      id: `evt-${Date.now()}`,
      studentId: alexStudent.id,
      studentName: `${alexStudent.firstName} ${alexStudent.lastName}`,
      busId: bus05.id,
      busNumber: bus05.busNumber,
      driverId: bus05.driverId,
      stopId: stop1.id,
      stopName: stop1.stopName,
      eventType: 'GEOFENCE_ARRIVAL',
      lat: stop1.lat,
      lng: stop1.lng,
      timestamp: getFormattedTime(),
    };

    setEvents(prev => [arrivalEvent, ...prev]);
  };

  // Simulator Event 2: Verified Boarding Scan (Alert #2)
  const handleSimulateBoardingScan = (studentId = alexStudent.id) => {
    const targetStudent = students.find(s => s.id === studentId) || alexStudent;

    setStudents(prev => prev.map(s => s.id === targetStudent.id ? { ...s, currentStatus: 'BOARDED' } : s));

    const boardingEvent: TransitEvent = {
      id: `evt-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      busId: bus05.id,
      busNumber: bus05.busNumber,
      driverId: bus05.driverId,
      stopId: stop1.id,
      stopName: stop1.stopName,
      eventType: 'BOARDING_VERIFIED',
      confidence: 0.94,
      lat: stop1.lat,
      lng: stop1.lng,
      timestamp: getFormattedTime(),
    };

    setEvents(prev => [boardingEvent, ...prev]);
  };

  // Simulator Event 3: Wrong Bus Mismatch
  const handleSimulateWrongBusMismatch = () => {
    const mismatchEvent: TransitEvent = {
      id: `evt-${Date.now()}`,
      studentId: alexStudent.id,
      studentName: `${alexStudent.firstName} ${alexStudent.lastName}`,
      busId: 'bus-08',
      busNumber: 'Bus 08 (Wrong Bus)',
      driverId: bus05.driverId,
      stopId: stop1.id,
      stopName: stop1.stopName,
      eventType: 'MISMATCH_FLAGGED',
      confidence: 0.89,
      overrideReason: 'Wrong Bus Alert: Alex is assigned to Bus 05, attempted scan on Bus 08.',
      lat: stop1.lat,
      lng: stop1.lng,
      timestamp: getFormattedTime(),
    };

    setEvents(prev => [mismatchEvent, ...prev]);
  };

  // Simulator Event 4: Drop-Off Confirmation
  const handleSimulateDropOff = () => {
    setStudents(prev => prev.map(s => s.id === alexStudent.id ? { ...s, currentStatus: 'DROPPED_OFF' } : s));

    const dropEvent: TransitEvent = {
      id: `evt-${Date.now()}`,
      studentId: alexStudent.id,
      studentName: `${alexStudent.firstName} ${alexStudent.lastName}`,
      busId: bus05.id,
      busNumber: bus05.busNumber,
      driverId: bus05.driverId,
      stopId: stop1.id,
      stopName: stop1.stopName,
      eventType: 'DROP_OFF_VERIFIED',
      confidence: 0.92,
      lat: stop1.lat,
      lng: stop1.lng,
      timestamp: getFormattedTime(),
    };

    setEvents(prev => [dropEvent, ...prev]);
  };

  // Driver Manual Override Handler
  const handleManualOverride = (studentId: string, reason: string) => {
    const targetStudent = students.find(s => s.id === studentId) || alexStudent;

    setStudents(prev => prev.map(s => s.id === targetStudent.id ? { ...s, currentStatus: 'BOARDED' } : s));

    const overrideEvent: TransitEvent = {
      id: `evt-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      busId: bus05.id,
      busNumber: bus05.busNumber,
      driverId: bus05.driverId,
      stopId: stop1.id,
      stopName: stop1.stopName,
      eventType: 'BOARDING_MANUAL_OVERRIDE',
      overrideReason: reason,
      lat: stop1.lat,
      lng: stop1.lng,
      timestamp: getFormattedTime(),
    };

    setEvents(prev => [overrideEvent, ...prev]);
  };

  // Reset Simulator State
  const handleResetDemo = () => {
    setStudents(INITIAL_STUDENTS);
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-lg tracking-tight">SafeRide AI</h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Zero-Hardware Safety System
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Connecting School Management, Bus Drivers & Parents via Geofenced Multi-Factor Verification.
              </p>
            </div>
          </div>

          {/* Portal Switcher Nav Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActivePortal('admin')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activePortal === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              1. School Admin
            </button>

            <button
              onClick={() => setActivePortal('parent')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activePortal === 'parent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              2. Parent App
            </button>

            <button
              onClick={() => setActivePortal('driver')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activePortal === 'driver'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BusIcon className="w-3.5 h-3.5" />
              3. Driver Vision App
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activePortal === 'admin' && (
          <AdminPortal
            students={students}
            buses={buses}
            events={events}
            stops={stops}
            onAddStudent={handleAddStudent}
          />
        )}

        {activePortal === 'parent' && (
          <ParentPortal
            student={alexStudent}
            stop={stop1}
            events={events}
            onUpdatePickupLocation={handleUpdatePickupLocation}
          />
        )}

        {activePortal === 'driver' && (
          <DriverPortal
            bus={bus05}
            students={students}
            stops={stops}
            onVerifyBoarding={(id, mfv) => handleSimulateBoardingScan(id)}
            onManualOverride={handleManualOverride}
          />
        )}
      </main>

      {/* Hackathon Interactive Floating Simulator Bar */}
      <GeofenceSimulator
        onSimulateGeofenceArrival={handleSimulateGeofenceArrival}
        onSimulateBoardingScan={() => handleSimulateBoardingScan(alexStudent.id)}
        onSimulateWrongBusMismatch={handleSimulateWrongBusMismatch}
        onSimulateDropOff={handleSimulateDropOff}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
};
