import React, { useState } from 'react';
import Header from './components/Header';
import AdminPortal from './components/AdminPortal';
import ParentPortal from './components/ParentPortal';
import DriverPortal from './components/DriverPortal';
import NotificationDispatcher from './components/NotificationDispatcher';
import JudgingDemo from './components/JudgingDemo';
import SystemArchitectureModal from './components/SystemArchitectureModal';

import { 
  INITIAL_BUSES, 
  INITIAL_STOPS, 
  INITIAL_STUDENTS, 
  INITIAL_TRANSIT_EVENTS 
} from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('judging'); // Default to Judging Demo Mode for instant wow factor!
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [transitEvents, setTransitEvents] = useState(INITIAL_TRANSIT_EVENTS);
  const [notifications, setNotifications] = useState([
    {
      stage: 'STAGE_1',
      title: 'Bus Arrived at Pickup Location',
      body: 'Bus 01 has entered the 50-meter geofence for Alex Smith.',
      time: '07:38 AM'
    }
  ]);

  const [busLocation, setBusLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState(0);

  // Trigger Geofence Arrival Event
  const handleTriggerGeofence = (stopId) => {
    const targetStop = stops.find(s => s.id === stopId) || stops[0];

    // Check if event already fired to avoid duplicate spam
    const alreadyFired = transitEvents.some(
      e => e.event_type === 'GEOFENCE_ARRIVAL' && e.details.includes(targetStop.stop_name)
    );

    if (alreadyFired) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Update students assigned to this stop
    setStudents(prev => prev.map(s => {
      if (s.assigned_stop_id === stopId && s.current_status === 'PENDING') {
        return { ...s, current_status: 'GEOFENCE_NOTIFIED' };
      }
      return s;
    }));

    // Add Transit Event Log
    const newEvt = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      student_name: 'Alex Smith',
      event_type: 'GEOFENCE_ARRIVAL',
      bus_number: 'Bus 01',
      details: `Bus 01 entered 50m geofence radius of ${targetStop.stop_name}.`,
      confidence: null
    };

    setTransitEvents(prev => [newEvt, ...prev]);

    // Dispatch FCM Push Notification (Alert #1)
    const newNotif = {
      stage: 'STAGE_1',
      title: 'Bus Arrived at Pickup Location',
      body: `Bus 01 has arrived within 50m of Alex's pickup location at ${targetStop.stop_name}.`,
      time: timeStr
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Trigger Verified Boarding Event
  const handleTriggerBoarding = (studentId, confidenceScore = 0.89, overrideReason = null) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let targetStudentName = 'Student';

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        targetStudentName = `${s.first_name} ${s.last_name}`;
        return { ...s, current_status: 'BOARDED' };
      }
      return s;
    }));

    // Add Boarding Event
    const newEvt = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      student_name: targetStudentName,
      event_type: overrideReason ? 'BOARDING_MANUAL_OVERRIDE' : 'BOARDING_VERIFIED',
      bus_number: 'Bus 01',
      details: overrideReason 
        ? `Driver manual override executed (${overrideReason}). Boarding confirmed.`
        : `5-Factor Multi-Factor Verification passed. Boarding confirmed.`,
      confidence: overrideReason ? 'Driver Override (1.0)' : confidenceScore
    };

    setTransitEvents(prev => [newEvt, ...prev]);

    // Dispatch FCM Push Notification (Alert #2)
    const newNotif = {
      stage: 'STAGE_2',
      title: 'Boarding Confirmed',
      body: `Boarding Confirmed: ${targetStudentName} has safely boarded Bus 01 at ${timeStr}.`,
      time: timeStr
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Trigger Mismatch / Wrong Bus Event
  const handleTriggerMismatch = (studentId, reason) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let targetName = 'Lucas Brown';
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        targetName = `${s.first_name} ${s.last_name}`;
        return { ...s, current_status: 'MISMATCHED' };
      }
      return s;
    }));

    const newEvt = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      student_name: targetName,
      event_type: 'MISMATCH_FLAGGED',
      bus_number: 'Bus 01',
      details: `SAFETY ALERT: Mismatch flagged! (${reason}). Boarding blocked.`,
      confidence: '0.42 (FAILED)'
    };

    setTransitEvents(prev => [newEvt, ...prev]);
  };

  // Interactive 7-Step Hackathon Demo Step Execution
  const handleRunDemoStep = (stepIdx) => {
    if (stepIdx === 0) {
      // Step 1: Admin setup
      setActiveTab('admin');
      setCurrentDemoStepIndex(1);
    } else if (stepIdx === 1) {
      // Step 2: Parent pin setup
      setActiveTab('parent');
      setCurrentDemoStepIndex(2);
    } else if (stepIdx === 2) {
      // Step 3: Driver start route
      setActiveTab('driver');
      setCurrentDemoStepIndex(3);
    } else if (stepIdx === 3) {
      // Step 4: Trigger Geofence Arrival
      handleTriggerGeofence('stop-01');
      setCurrentDemoStepIndex(4);
      setActiveTab('parent'); // Show alert #1 on Parent App
    } else if (stepIdx === 4) {
      // Step 5: Face verification
      setActiveTab('driver');
      setCurrentDemoStepIndex(5);
    } else if (stepIdx === 5) {
      // Step 6: Boarding Confirmed
      handleTriggerBoarding('student-01', 0.89);
      setCurrentDemoStepIndex(6);
      setActiveTab('parent'); // Show alert #2 on Parent App
    } else if (stepIdx === 6) {
      // Step 7: Completed
      setActiveTab('admin');
      alert('🎉 7-Step SafeRide AI Live Demo Scenario Executed Successfully!');
    }
  };

  const handleResetDemo = () => {
    setStudents(INITIAL_STUDENTS);
    setTransitEvents(INITIAL_TRANSIT_EVENTS);
    setNotifications([
      {
        stage: 'STAGE_1',
        title: 'Bus Arrived at Pickup Location',
        body: 'Bus 01 has entered the 50-meter geofence for Alex Smith.',
        time: '07:38 AM'
      }
    ]);
    setBusLocation({ lat: 12.9716, lng: 77.5946 });
    setCurrentDemoStepIndex(0);
    setActiveTab('judging');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        eventCount={transitEvents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'admin' && (
          <AdminPortal 
            students={students}
            setStudents={setStudents}
            buses={buses}
            stops={stops}
            transitEvents={transitEvents}
            busLocation={busLocation}
          />
        )}

        {activeTab === 'parent' && (
          <ParentPortal 
            students={students}
            setStudents={setStudents}
            buses={buses}
            stops={stops}
            transitEvents={transitEvents}
            busLocation={busLocation}
            notifications={notifications}
          />
        )}

        {activeTab === 'driver' && (
          <DriverPortal 
            students={students}
            setStudents={setStudents}
            buses={buses}
            stops={stops}
            busLocation={busLocation}
            setBusLocation={setBusLocation}
            onTriggerGeofence={handleTriggerGeofence}
            onTriggerBoarding={handleTriggerBoarding}
            onTriggerMismatch={handleTriggerMismatch}
          />
        )}

        {activeTab === 'dispatcher' && (
          <NotificationDispatcher 
            transitEvents={transitEvents}
            notifications={notifications}
          />
        )}

        {activeTab === 'judging' && (
          <JudgingDemo 
            students={students}
            onRunStep={handleRunDemoStep}
            currentStepIndex={currentDemoStepIndex}
            setCurrentStepIndex={setCurrentDemoStepIndex}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Architecture Spec Viewer Modal */}
      <SystemArchitectureModal 
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SafeRide AI: Hardware-Free School Bus Student Safety System</span>
          <span className="font-mono text-[11px] text-slate-600">
            GitHub: jwjohnwesly5-png/safe-ride • PostGIS & pgvector Enabled
          </span>
        </div>
      </footer>

    </div>
  );
}
