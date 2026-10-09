import React, { useState } from 'react';
import { 
  MapPin, 
  Bell, 
  CheckCircle2, 
  Phone, 
  Bus, 
  Clock, 
  ShieldCheck, 
  Navigation,
  Sparkles,
  Smartphone
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

export default function ParentPortal({ 
  students, 
  setStudents, 
  buses, 
  stops, 
  transitEvents, 
  busLocation, 
  notifications 
}) {
  const selectedStudent = students[0]; // Primary linked student for demo: Alex Smith
  const [pinSavedToast, setPinSavedToast] = useState(false);

  const handleUpdatePickupLocation = (lat, lng) => {
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, pickup_latitude: lat, pickup_longitude: lng };
      }
      return s;
    });
    setStudents(updated);
    setPinSavedToast(true);
    setTimeout(() => setPinSavedToast(false), 3000);
  };

  const assignedBus = buses.find(b => b.id === selectedStudent.assigned_bus_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Mobile Frame Container Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Parent Mobile App Main UI (2 Cols) */}
        <div className="md:col-span-2 glass-card p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Subtle Phone Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.first_name} 
                  className="h-11 w-11 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white font-outfit">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    {selectedStudent.class_grade}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Parent Portal: {selectedStudent.parent_name}</p>
              </div>
            </div>

            {/* Quick Emergency Call Button */}
            <button
              onClick={() => alert(`Calling Driver ${assignedBus?.driver_name} (${assignedBus?.driver_phone})...`)}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>SOS Call Driver</span>
            </button>
          </div>

          {/* Current Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Live Transit Status</span>
              <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${
                  selectedStudent.current_status === 'BOARDED' ? 'bg-emerald-400 animate-ping' :
                  selectedStudent.current_status === 'GEOFENCE_NOTIFIED' ? 'bg-amber-400 animate-pulse' :
                  'bg-indigo-400'
                }`}></span>
                <span className="text-lg font-bold text-white font-outfit">
                  {selectedStudent.current_status === 'BOARDED' ? 'Safely Boarded Bus 01' :
                   selectedStudent.current_status === 'GEOFENCE_NOTIFIED' ? 'Bus Arrived at Pickup Point!' :
                   'Transit Pending (Bus En Route)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Assigned Bus: <span className="text-slate-200 font-semibold">{assignedBus?.bus_number}</span> ({assignedBus?.license_plate})
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Bus className="h-6 w-6" />
            </div>
          </div>

          {/* Interactive GPS Pickup Pin Setter & Live Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">GPS Pickup Location Setter</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Lat: <span className="text-indigo-300 font-mono">{selectedStudent.pickup_latitude.toFixed(4)}</span> | Lng: <span className="text-indigo-300 font-mono">{selectedStudent.pickup_longitude.toFixed(4)}</span>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Click anywhere on the map below to register or refine your child's exact home pickup geofence coordinates.
            </p>

            <InteractiveMap 
              busLocation={busLocation} 
              stops={stops} 
              students={[selectedStudent]}
              onPickupSelect={handleUpdatePickupLocation}
              interactivePinMode={true}
              height="300px"
            />

            {pinSavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  GPS Pickup Location Pin Updated & Registered with Supabase PostGIS!
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: 2-Stage Push Notification Feed & Timeline */}
        <div className="space-y-6">
          
          {/* Notification Feed (Simulated FCM Alerts) */}
          <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-400 animate-bounce" />
                <h3 className="text-sm font-bold text-white font-outfit">FCM Push Feed (2-Stage Alerts)</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Real-Time
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {notifications.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
                  Waiting for live transit events... (Start route in Driver App to test)
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                      notif.stage === 'STAGE_1' 
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>{notif.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">{notif.body}</p>
                    <div className="pt-1 text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                      <span>FCM Token: fcm_parent_token_8841</span>
                      <span>Verified Event</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Transit Timeline */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Clock className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-outfit">Daily Transit Timeline</h3>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800 text-xs">
              
              {/* Step 1: Registered Pin */}
              <div className="relative pl-7 space-y-0.5">
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
                <h4 className="font-bold text-white">GPS Pickup Location Set</h4>
                <p className="text-[11px] text-slate-400">Lat 12.9720, Lng 77.5950 (Registered Home)</p>
              </div>

              {/* Step 2: Bus Arrived */}
              <div className="relative pl-7 space-y-0.5">
                <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                  selectedStudent.current_status === 'GEOFENCE_NOTIFIED' || selectedStudent.current_status === 'BOARDED'
                    ? 'bg-amber-400'
                    : 'bg-slate-700'
                }`}></div>
                <h4 className={`font-bold ${
                  selectedStudent.current_status === 'GEOFENCE_NOTIFIED' || selectedStudent.current_status === 'BOARDED'
                    ? 'text-amber-300'
                    : 'text-slate-500'
                }`}>Alert #1: Bus Arrival Geofence (&le;50m)</h4>
                <p className="text-[11px] text-slate-400">
                  {selectedStudent.current_status === 'GEOFENCE_NOTIFIED' || selectedStudent.current_status === 'BOARDED'
                    ? 'Triggered at 07:38 AM by PostGIS Sphere'
                    : 'Pending bus arrival...'}
                </p>
              </div>

              {/* Step 3: Verified Boarding */}
              <div className="relative pl-7 space-y-0.5">
                <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                  selectedStudent.current_status === 'BOARDED'
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}></div>
                <h4 className={`font-bold ${
                  selectedStudent.current_status === 'BOARDED'
                    ? 'text-emerald-300'
                    : 'text-slate-500'
                }`}>Alert #2: Boarding Confirmed</h4>
                <p className="text-[11px] text-slate-400">
                  {selectedStudent.current_status === 'BOARDED'
                    ? 'Multi-Factor Verification Passed (Cosine: 0.89)'
                    : 'Awaiting driver camera scan...'}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
