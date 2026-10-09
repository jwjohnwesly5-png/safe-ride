import React from 'react';
import { Clock, CheckCircle2, MapPin, Bus, ShieldCheck } from 'lucide-react';

export default function ChildTimeline({ status }) {
  return (
    <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Clock className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white font-outfit">Child Daily Transit Journey</h3>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800 text-xs">
        
        {/* Step 1 */}
        <div className="relative pl-7 space-y-0.5">
          <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950"></div>
          <h4 className="font-bold text-white">1. GPS Home Pickup Pin Registered</h4>
          <p className="text-[11px] text-slate-400">PostGIS 50-meter Geofence Active (`Lat 12.9720, Lng 77.5950`)</p>
        </div>

        {/* Step 2 */}
        <div className="relative pl-7 space-y-0.5">
          <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
            status === 'GEOFENCE_NOTIFIED' || status === 'BOARDED' ? 'bg-amber-400' : 'bg-slate-700'
          }`}></div>
          <h4 className={`font-bold ${status === 'GEOFENCE_NOTIFIED' || status === 'BOARDED' ? 'text-amber-300' : 'text-slate-500'}`}>
            2. Alert #1: Bus Arrived at Pickup Point
          </h4>
          <p className="text-[11px] text-slate-400">
            {status === 'GEOFENCE_NOTIFIED' || status === 'BOARDED' ? 'Triggered by ST_DWithin Sphere <= 50m' : 'Awaiting bus approaching geofence...'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative pl-7 space-y-0.5">
          <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
            status === 'BOARDED' ? 'bg-emerald-400' : 'bg-slate-700'
          }`}></div>
          <h4 className={`font-bold ${status === 'BOARDED' ? 'text-emerald-300' : 'text-slate-500'}`}>
            3. Alert #2: Boarding Confirmed
          </h4>
          <p className="text-[11px] text-slate-400">
            {status === 'BOARDED' ? 'Verified by 5-Factor Rules (Cosine: 0.89)' : 'Awaiting driver camera scan...'}
          </p>
        </div>

      </div>
    </div>
  );
}
