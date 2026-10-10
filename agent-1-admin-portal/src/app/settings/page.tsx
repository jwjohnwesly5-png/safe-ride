"use client";

import { useState } from "react";
import { Settings, ShieldCheck, Database, Bell, Radio } from "lucide-react";

export default function SettingsPage() {
  const [geofenceRadius, setGeofenceRadius] = useState(50);
  const [telematicsFrequency, setTelematicsFrequency] = useState(5);
  const [enableMfvAlerts, setEnableMfvAlerts] = useState(true);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-2">Configure PostGIS geofence thresholds, FCM dispatch rules, and telematics streaming parameters.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {/* Geofence Thresholds */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            PostGIS Geofence Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Automated Arrival Geofence Radius (Meters)</label>
              <input
                type="number"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-xs text-slate-400">Default: 50 meters (Triggers Alert #1 on arrival)</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Telematics GPS Frequency (Seconds)</label>
              <input
                type="number"
                value={telematicsFrequency}
                onChange={(e) => setTelematicsFrequency(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-xs text-slate-400">Background phone emission interval</p>
            </div>
          </div>
        </div>

        {/* Security & FCM Controls */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Safety & Notification Rules
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableMfvAlerts}
                onChange={(e) => setEnableMfvAlerts(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 font-medium">Enable immediate parent FCM alert on wrong bus boarding attempts (MISMATCH_FLAGGED)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
