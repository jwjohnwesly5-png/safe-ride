import React, { useState } from 'react';
import { Student, TransitEvent, RouteStop } from '../types';
import { 
  Bell, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Bus as BusIcon, 
  ShieldCheck, 
  Navigation, 
  Info 
} from 'lucide-react';

// @ts-ignore
import InteractiveMap from './InteractiveMap';

interface ParentPortalProps {
  student: Student;
  stop: RouteStop;
  events: TransitEvent[];
  onUpdatePickupLocation: (newLat: number, newLng: number) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  student,
  stop,
  events,
  onUpdatePickupLocation,
}) => {
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinLat, setPinLat] = useState(stop.lat);
  const [pinLng, setPinLng] = useState(stop.lng);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const parentEvents = events.filter(e => e.studentId === student.id || e.stopId === stop.id);

  const handleSavePin = () => {
    onUpdatePickupLocation(pinLat, pinLng);
    setIsEditingPin(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const mapStops: any[] = [
    {
      id: stop.id,
      latitude: pinLat,
      longitude: pinLng,
      stop_name: stop.stopName,
      geofence_radius_meters: 50,
    }
  ];

  const mapStudents: any[] = [
    {
      id: student.id,
      first_name: student.firstName,
      last_name: student.lastName,
      parent_name: 'Parent User',
      pickup_latitude: pinLat,
      pickup_longitude: pinLng,
      current_status: student.currentStatus,
    }
  ];

  const currentBusLocation = {
    lat: student.currentStatus === 'BOARDED' ? pinLat + 0.003 : 12.9716,
    lng: student.currentStatus === 'BOARDED' ? pinLng + 0.003 : 77.5946,
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mobile Phone Mockup Container */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 shadow-2xl bg-slate-950 relative overflow-hidden">
        {/* Top Phone Notch Bar */}
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pb-3 border-b border-slate-800/80 mb-4">
          <span>07:42 AM</span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> SafeRide Parent Protect
          </span>
          <span>100% ⚡</span>
        </div>

        {/* Child Profile Card */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-indigo-500/20 mb-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                Assigned Bus: {student.assignedBusNumber}
              </span>
              <h2 className="text-xl font-bold text-white mt-1.5">{student.firstName} {student.lastName}</h2>
              <p className="text-xs text-slate-400">{student.classGrade} | ID: {student.studentIdCode}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-indigo-200 font-bold text-lg">
              {student.firstName[0]}
            </div>
          </div>

          {/* Current Live Status Banner */}
          <div className="pt-2">
            {student.currentStatus === 'BOARDED' && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">BOARDING CONFIRMED (ALERT #2)</p>
                  <p className="text-[11px] text-slate-300">Alex safely boarded Bus 05 at Stop #1.</p>
                </div>
              </div>
            )}
            {student.currentStatus === 'GEOFENCE_ARRIVED' && (
              <div className="bg-indigo-500/20 border border-indigo-500/40 p-3 rounded-xl flex items-center gap-3 glow-indigo">
                <BusIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">BUS ARRIVED (ALERT #1)</p>
                  <p className="text-[11px] text-slate-300">Bus 05 entered your pickup geofence (50m).</p>
                </div>
              </div>
            )}
            {student.currentStatus === 'PENDING' && (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">AWAITING BUS ARRIVAL</p>
                  <p className="text-[11px] text-slate-400">Scheduled ETA: {stop.estimatedArrival}</p>
                </div>
              </div>
            )}
            {student.currentStatus === 'MISMATCHED' && (
              <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl flex items-center gap-3 animate-pulse glow-rose">
                <Info className="w-6 h-6 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">⚠️ SAFETY WARNING: BUS MISMATCH</p>
                  <p className="text-[11px] text-slate-300">Attempted boarding on wrong bus detected. Driver notified.</p>
                </div>
              </div>
            )}
            {student.currentStatus === 'DROPPED_OFF' && (
              <div className="bg-blue-500/20 border border-blue-500/40 p-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">DROPPED OFF SAFELY</p>
                  <p className="text-[11px] text-slate-300">Alex was dropped off safely at destination.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive GPS Pickup Pin Manager */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 mb-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              Registered Home Pickup Location
            </span>
            <button
              onClick={() => setIsEditingPin(!isEditingPin)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-[11px]"
            >
              {isEditingPin ? 'Cancel' : 'Adjust GPS Pin'}
            </button>
          </div>

          {savedSuccess && (
            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-mono">
              ✓ Geofence pickup coordinates updated!
            </div>
          )}

          {/* Graphical Leaflet Interactive Map View */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 my-2">
            <InteractiveMap
              busLocation={currentBusLocation}
              stops={mapStops}
              students={mapStudents}
              interactivePinMode={isEditingPin}
              onPickupSelect={(lat: number, lng: number) => {
                setPinLat(lat);
                setPinLng(lng);
              }}
              height="200px"
            />
          </div>

          {!isEditingPin ? (
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <p className="font-semibold text-slate-200">{stop.stopName}</p>
              <p className="font-mono text-[11px] text-indigo-400">
                Coordinates: {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
              </p>
              <p className="text-[10px] text-slate-500">Auto-Geofence Radius: 50 Meters</p>
            </div>
          ) : (
            <div className="space-y-2 text-xs bg-slate-950 p-3 rounded-xl border border-indigo-500/30">
              <p className="text-slate-400 text-[11px]">Click anywhere on map above or enter coordinates below:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pinLat}
                    onChange={(e) => setPinLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pinLng}
                    onChange={(e) => setPinLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                  />
                </div>
              </div>
              <button
                onClick={handleSavePin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-lg text-xs mt-1"
              >
                Confirm GPS Location
              </button>
            </div>
          )}
        </div>

        {/* 2-Stage Push Notifications Feed */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-400" />
              Automated Push Notification Feed
            </span>
            <span className="text-[10px] font-mono text-slate-500">FCM Live Receiver</span>
          </h3>

          {parentEvents.length === 0 ? (
            <div className="bg-slate-900/40 p-4 rounded-xl text-center text-slate-500 text-xs border border-slate-800/60">
              No notifications yet. Use the Simulator Bar to simulate arrival & boarding!
            </div>
          ) : (
            <div className="space-y-2">
              {parentEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    evt.eventType === 'BOARDING_VERIFIED'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : evt.eventType === 'GEOFENCE_ARRIVAL'
                      ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider">
                      {evt.eventType === 'GEOFENCE_ARRIVAL' && '🔔 ALERT #1: BUS ARRIVED'}
                      {evt.eventType === 'BOARDING_VERIFIED' && '✅ ALERT #2: BOARDING CONFIRMED'}
                      {evt.eventType === 'MISMATCH_FLAGGED' && '⚠️ SAFETY WARNING'}
                    </span>
                    <span className="font-mono text-[10px] opacity-75">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {evt.eventType === 'GEOFENCE_ARRIVAL' && `Bus 05 has entered your registered 50m geofence at ${evt.stopName}.`}
                    {evt.eventType === 'BOARDING_VERIFIED' && `Alex was verified using Multi-Factor Vision & successfully boarded Bus 05.`}
                    {evt.eventType === 'MISMATCH_FLAGGED' && `Boarding check flagged: ${evt.overrideReason || 'Verification mismatch'}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Call Driver Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex gap-2">
          <a
            href="tel:+15550192835"
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            Call Bus Driver
          </a>
          <button className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-2.5 rounded-xl text-xs font-semibold">
            Helpdesk
          </button>
        </div>
      </div>
    </div>
  );
};
